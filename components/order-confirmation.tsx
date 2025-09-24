"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, ChefHat, Truck, UtensilsCrossed, ArrowLeft, Receipt } from "lucide-react"

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

interface OrderSummary {
  items: CartItem[]
  subtotal: number
  taxes: number
  deliveryFee: number
  discount: number
  total: number
  promoCode?: string
}

interface OrderConfirmationProps {
  orderSummary: OrderSummary
  orderInfo: OrderInfo
  onBackToMenu: () => void
  onNewOrder: () => void
}

type OrderStatus = "received" | "accepted" | "preparing" | "ready" | "served" | "delivered"

interface Order {
  id: string
  number: number
  status: OrderStatus
  timestamp: Date
  estimatedTime: number // minutes
  orderInfo: OrderInfo
  orderSummary: OrderSummary
}

const statusConfig = {
  received: {
    label: "Commande reçue",
    description: "Votre commande a été reçue et est en attente de validation",
    icon: Receipt,
    color: "bg-blue-500",
  },
  accepted: {
    label: "Commande acceptée",
    description: "Votre commande a été acceptée et va être préparée",
    icon: CheckCircle,
    color: "bg-green-500",
  },
  preparing: {
    label: "En préparation",
    description: "Nos chefs préparent votre commande avec soin",
    icon: ChefHat,
    color: "bg-orange-500",
  },
  ready: {
    label: "Prête",
    description: "Votre commande est prête",
    icon: CheckCircle,
    color: "bg-green-600",
  },
  served: {
    label: "Servie",
    description: "Votre commande a été servie à votre table",
    icon: UtensilsCrossed,
    color: "bg-green-700",
  },
  delivered: {
    label: "Livrée",
    description: "Votre commande a été livrée",
    icon: Truck,
    color: "bg-green-700",
  },
}

export default function OrderConfirmation({
  orderSummary,
  orderInfo,
  onBackToMenu,
  onNewOrder,
}: OrderConfirmationProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Generate order on component mount
  useEffect(() => {
    const generateOrder = (): Order => {
      const orderNumber = Math.floor(Math.random() * 9000) + 1000 // 4-digit number
      const estimatedTime =
        orderInfo.type === "table"
          ? Math.floor(Math.random() * 20) + 15
          : // 15-35 minutes for table
            Math.floor(Math.random() * 30) + 25 // 25-55 minutes for delivery

      return {
        id: `order-${Date.now()}`,
        number: orderNumber,
        status: "received",
        timestamp: new Date(),
        estimatedTime,
        orderInfo,
        orderSummary,
      }
    }

    const newOrder = generateOrder()
    setOrder(newOrder)

    // Simulate order status progression (for demo purposes)
    const statusProgression: OrderStatus[] = ["received", "accepted", "preparing", "ready"]
    if (orderInfo.type === "delivery") {
      statusProgression.push("delivered")
    } else {
      statusProgression.push("served")
    }

    let currentStatusIndex = 0
    const progressInterval = setInterval(() => {
      if (currentStatusIndex < statusProgression.length - 1) {
        currentStatusIndex++
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                status: statusProgression[currentStatusIndex],
              }
            : null,
        )
      } else {
        clearInterval(progressInterval)
      }
    }, 30000) // Change status every 30 seconds for demo

    return () => clearInterval(progressInterval)
  }, [orderInfo, orderSummary])

  // Update current time every minute
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timeInterval)
  }, [])

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Traitement de votre commande...</p>
        </div>
      </div>
    )
  }

  const currentStatus = statusConfig[order.status]
  const StatusIcon = currentStatus.icon

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEstimatedDeliveryTime = () => {
    const deliveryTime = new Date(order.timestamp.getTime() + order.estimatedTime * 60000)
    return formatTime(deliveryTime)
  }

  const getTimeElapsed = () => {
    const elapsed = Math.floor((currentTime.getTime() - order.timestamp.getTime()) / 60000)
    return elapsed
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-card-foreground">Restaurant Le Délice</h1>
            </div>
            <Button variant="outline" onClick={onBackToMenu}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au menu
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Confirmation Header */}
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">Commande confirmée !</CardTitle>
              <CardDescription className="text-lg">Merci pour votre commande</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-3xl font-bold">#{order.number}</p>
                <p className="text-muted-foreground">Commande passée à {formatTime(order.timestamp)}</p>
                <p className="text-sm text-muted-foreground">
                  {orderInfo.type === "table" ? `Table ${orderInfo.tableNumber}` : `Livraison - ${orderInfo.name}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Statut de la commande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className={`p-3 rounded-full ${currentStatus.color}`}>
                  <StatusIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{currentStatus.label}</h3>
                  <p className="text-sm text-muted-foreground">{currentStatus.description}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>Il y a {getTimeElapsed()} min</p>
                </div>
              </div>

              {/* Estimated Time */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    {orderInfo.type === "table" ? "Temps estimé de préparation" : "Heure de livraison estimée"}
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {orderInfo.type === "table" ? `${order.estimatedTime} minutes` : getEstimatedDeliveryTime()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {orderSummary.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {item.selectedSize && (
                          <Badge variant="outline" className="text-xs mr-1">
                            {item.selectedSize}
                          </Badge>
                        )}
                        {item.selectedExtras?.map((extra) => (
                          <Badge key={extra} variant="outline" className="text-xs mr-1">
                            +{extra}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.totalPrice.toFixed(2)} DA</p>
                      <p className="text-sm text-muted-foreground">× {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{orderSummary.subtotal.toFixed(2)} DA</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>{orderSummary.taxes.toFixed(2)} DA</span>
                </div>
                {orderSummary.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Frais de livraison</span>
                    <span>{orderSummary.deliveryFee.toFixed(2)} DA</span>
                  </div>
                )}
                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Réduction</span>
                    <span>-{orderSummary.discount.toFixed(2)} DA</span>
                  </div>
                )}
              </div>
              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{orderSummary.total.toFixed(2)} DA</span>
              </div>
            </CardContent>
          </Card>

          {orderInfo.type === "delivery" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Nom: </span>
                  <span>{orderInfo.name}</span>
                </div>
                <div>
                  <span className="font-medium">Téléphone: </span>
                  <span>{orderInfo.phone}</span>
                </div>
                <div>
                  <span className="font-medium">Adresse: </span>
                  <span>{orderInfo.address}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onBackToMenu}>
              Retour au menu
            </Button>
            <Button className="flex-1" onClick={onNewOrder}>
              Nouvelle commande
            </Button>
          </div>

          {/* Contact Information */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Besoin d'aide ?</p>
                <p>Contactez-nous au 01 23 45 67 89</p>
                <p>ou à l'accueil du restaurant</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
