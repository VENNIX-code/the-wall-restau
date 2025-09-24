"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, Trash2, ArrowLeft, Tag } from "lucide-react"
import OrderConfirmation from "./order-confirmation"

interface CartItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  selectedSize?: string
  selectedExtras?: string[]
  totalPrice: number
}

interface OrderInfo {
  type: "table" | "delivery"
  tableNumber?: string
  name?: string
  phone?: string
  address?: string
}

interface ShoppingCartProps {
  cart: CartItem[]
  orderInfo: OrderInfo
  onUpdateCart: (cart: CartItem[]) => void
  onBack: () => void
  onProceedToCheckout: (orderSummary: OrderSummary) => void
}

interface OrderSummary {
  items: CartItem[]
  subtotal: number
  taxes: number
  deliveryFee: number
  discount: number
  total: number
  promoCode?: string
}

// Configuration for calculations (values indicative; adjust as needed)
const TAX_RATE = 0.0 // TVA incluse dans les prix affichés (0 si non applicable)
const DELIVERY_FEE = 200 // Frais de livraison fixes (DA)
const DISCOUNT_THRESHOLD = 5000 // Réduction automatique au-delà de ce montant (DA)
const DISCOUNT_RATE = 0.05 // 5% de réduction

export default function Cart({ cart, orderInfo, onUpdateCart, onBack, onProceedToCheckout }: ShoppingCartProps) {
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromoCode, setAppliedPromoCode] = useState("")
  const [promoError, setPromoError] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<OrderSummary | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Valid promo codes (in real app, this would come from backend)
  const validPromoCodes = {
    BIENVENUE10: { discount: 0.1, description: "10% de réduction" },
    FIDELE15: { discount: 0.15, description: "15% de réduction fidélité" },
    ETUDIANT: { discount: 0.08, description: "8% de réduction étudiant" },
  }

  const updateQuantity = (itemIndex: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemIndex)
      return
    }

    const updatedCart = cart.map((item, index) => {
      if (index === itemIndex) {
        const basePrice = item.totalPrice / item.quantity
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: basePrice * newQuantity,
        }
      }
      return item
    })
    onUpdateCart(updatedCart)
  }

  const removeItem = (itemIndex: number) => {
    const updatedCart = cart.filter((_, index) => index !== itemIndex)
    onUpdateCart(updatedCart)
  }

  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase()
    if (!code) {
      setPromoError("Veuillez saisir un code promo")
      return
    }

    if (validPromoCodes[code as keyof typeof validPromoCodes]) {
      setAppliedPromoCode(code)
      setPromoError("")
      setPromoCode("")
    } else {
      setPromoError("Code promo invalide")
    }
  }

  const removePromoCode = () => {
    setAppliedPromoCode("")
    setPromoError("")
  }

  const calculateOrderSummary = (): OrderSummary => {
    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)

    // Calculate taxes (applied to subtotal)
    const taxes = subtotal * TAX_RATE

    // Calculate delivery fee (only for delivery orders)
    const deliveryFee = orderInfo.type === "delivery" ? DELIVERY_FEE : 0

    // Calculate discounts
    let discount = 0

    // Automatic discount for orders over threshold
    if (subtotal >= DISCOUNT_THRESHOLD) {
      discount = subtotal * DISCOUNT_RATE
    }

    // Promo code discount (replaces automatic discount if higher)
    if (appliedPromoCode) {
      const promoDiscount = subtotal * validPromoCodes[appliedPromoCode as keyof typeof validPromoCodes].discount
      discount = Math.max(discount, promoDiscount)
    }

    // Calculate total
    const total = subtotal + taxes + deliveryFee - discount

    return {
      items: cart,
      subtotal,
      taxes,
      deliveryFee,
      discount,
      total: Math.max(0, total), // Ensure total is never negative
      promoCode: appliedPromoCode || undefined,
    }
  }

  const orderSummary = calculateOrderSummary()

  const handleCheckout = async () => {
    if (cart.length === 0 || isSubmitting) return
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderInfo,
          items: cart,
          total: orderSummary.total,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Échec de l'envoi de la commande")
      }
      // Optionally, we could use the returned order to show a number/id
      setConfirmedOrder(orderSummary)
      setShowConfirmation(true)
      // Clear the cart after successful submission
      onUpdateCart([])
    } catch (e: any) {
      setSubmitError(e.message || "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToMenu = () => {
    setShowConfirmation(false)
    setConfirmedOrder(null)
    onBack()
  }

  const handleNewOrder = () => {
    setShowConfirmation(false)
    setConfirmedOrder(null)
    onUpdateCart([]) // Clear cart
    onBack() // Go back to menu
  }

  if (showConfirmation && confirmedOrder) {
    return (
      <OrderConfirmation
        orderSummary={confirmedOrder}
        orderInfo={orderInfo}
        onBackToMenu={handleBackToMenu}
        onNewOrder={handleNewOrder}
      />
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au menu
              </Button>
              <h1 className="font-bold">Panier</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6 p-8 bg-muted/50 rounded-full w-fit mx-auto">{/* ShoppingCart icon here */}</div>
            <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
            <p className="text-muted-foreground mb-6">
              Ajoutez des articles depuis le menu pour commencer votre commande
            </p>
            <Button onClick={onBack} size="lg">
              Parcourir le menu
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au menu
              </Button>
              <div className="text-sm text-muted-foreground">
                {orderInfo.type === "table" ? `Table ${orderInfo.tableNumber}` : `Livraison - ${orderInfo.name}`}
              </div>
            </div>
            <h1 className="font-bold">Panier ({cart.length})</h1>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <main className="container mx-auto px-4 py-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {/* ShoppingCart icon here */}
                Vos articles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex gap-4 p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>

                    {/* Item options */}
                    {(item.selectedSize || (item.selectedExtras && item.selectedExtras.length > 0)) && (
                      <div className="mt-2 space-y-1">
                        {item.selectedSize && (
                          <Badge variant="outline" className="text-xs">
                            {item.selectedSize}
                          </Badge>
                        )}
                        {item.selectedExtras?.map((extra) => (
                          <Badge key={extra} variant="outline" className="text-xs mr-1">
                            +{extra}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 text-sm font-medium">
                      {item.totalPrice.toFixed(2)} DA
                      <span className="text-muted-foreground ml-1">
                        ({(item.totalPrice / item.quantity).toFixed(2)} DA × {item.quantity})
                      </span>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(index, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(index, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Promo Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Code promo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appliedPromoCode ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div>
                    <span className="font-medium text-green-800 dark:text-green-200">{appliedPromoCode}</span>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {validPromoCodes[appliedPromoCode as keyof typeof validPromoCodes].description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removePromoCode}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Entrez votre code promo"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value)
                        setPromoError("")
                      }}
                      onKeyDown={(e) => e.key === "Enter" && applyPromoCode()}
                    />
                    <Button onClick={applyPromoCode} disabled={!promoCode.trim()}>
                      Appliquer
                    </Button>
                  </div>
                  {promoError && <p className="text-sm text-destructive">{promoError}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{orderSummary.subtotal.toFixed(2)} DA</span>
              </div>

              {TAX_RATE > 0 && (
                <div className="flex justify-between">
                  <span>TVA</span>
                  <span>{orderSummary.taxes.toFixed(2)} DA</span>
                </div>
              )}

              {orderSummary.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Frais de livraison</span>
                  <span>{orderSummary.deliveryFee.toFixed(2)} DA</span>
                </div>
              )}

              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Réduction {appliedPromoCode ? `(${appliedPromoCode})` : "(automatique)"}</span>
                  <span>-{orderSummary.discount.toFixed(2)} DA</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{orderSummary.total.toFixed(2)} DA</span>
              </div>

              {orderSummary.subtotal >= DISCOUNT_THRESHOLD && !appliedPromoCode && (
                <p className="text-sm text-green-600 dark:text-green-400">🎉 Réduction automatique de 5% appliquée !</p>
              )}
              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Fixed Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="container mx-auto max-w-2xl">
          <Button size="lg" className="w-full" onClick={handleCheckout} disabled={cart.length === 0 || isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : `Confirmer la commande • ${orderSummary.total.toFixed(2)} DA`}
          </Button>
        </div>
      </div>
    </div>
  )
}
