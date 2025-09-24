"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  UtensilsCrossed,
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  Receipt,
  Bell,
  Eye,
  LogOut,
  Users,
  TrendingUp,
} from "lucide-react"

type OrderStatus = "received" | "accepted" | "preparing" | "ready" | "served" | "delivered" | "cancelled"

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

interface Order {
  id: string
  number: number
  status: OrderStatus
  timestamp: Date
  estimatedTime: number
  orderInfo: OrderInfo
  items: CartItem[]
  subtotal: number
  taxes: number
  deliveryFee: number
  discount: number
  total: number
  promoCode?: string
}

const statusConfig = {
  received: {
    label: "Reçue",
    description: "Nouvelle commande",
    icon: Receipt,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  accepted: {
    label: "Acceptée",
    description: "Commande acceptée",
    icon: CheckCircle,
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
  },
  preparing: {
    label: "En préparation",
    description: "En cours de préparation",
    icon: ChefHat,
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  ready: {
    label: "Prête",
    description: "Prête à servir/livrer",
    icon: CheckCircle,
    color: "bg-green-600",
    textColor: "text-green-700",
    bgColor: "bg-green-100 dark:bg-green-900",
    borderColor: "border-green-300 dark:border-green-700",
  },
  served: {
    label: "Servie",
    description: "Servie à table",
    icon: UtensilsCrossed,
    color: "bg-green-700",
    textColor: "text-green-800",
    bgColor: "bg-green-100 dark:bg-green-900",
    borderColor: "border-green-300 dark:border-green-700",
  },
  delivered: {
    label: "Livrée",
    description: "Livrée au client",
    icon: Truck,
    color: "bg-green-700",
    textColor: "text-green-800",
    bgColor: "bg-green-100 dark:bg-green-900",
    borderColor: "border-green-300 dark:border-green-700",
  },
  cancelled: {
    label: "Annulée",
    description: "Commande annulée",
    icon: Receipt,
    color: "bg-red-500",
    textColor: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
  },
}

// Sample orders data (in real app, this would come from backend)
const generateSampleOrders = (): Order[] => {
  const orders: Order[] = []
  const statuses: OrderStatus[] = ["received", "accepted", "preparing", "ready"]

  for (let i = 0; i < 12; i++) {
    const isDelivery = Math.random() > 0.6
    const orderNumber = 1000 + i
    const timestamp = new Date(Date.now() - Math.random() * 3600000) // Random time in last hour

    orders.push({
      id: `order-${i}`,
      number: orderNumber,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp,
      estimatedTime: isDelivery ? Math.floor(Math.random() * 30) + 25 : Math.floor(Math.random() * 20) + 15,
      orderInfo: isDelivery
        ? {
            type: "delivery",
            name: `Client ${i + 1}`,
            phone: `06 12 34 56 ${(78 + i).toString().padStart(2, "0")}`,
            address: `${i + 1} Rue de la Paix, 75001 Paris`,
          }
        : {
            type: "table",
            tableNumber: (Math.floor(Math.random() * 50) + 1).toString(),
          },
      items: [
        {
          id: "pizza-margherita",
          name: "Pizza Margherita",
          description: "Sauce tomate, mozzarella, basilic frais",
          price: 12.5,
          quantity: Math.floor(Math.random() * 3) + 1,
          selectedSize: Math.random() > 0.5 ? "Grande" : "Petite",
          selectedExtras: Math.random() > 0.7 ? ["Olives", "Champignons"] : [],
          totalPrice: 15.5,
        },
      ],
      subtotal: 15.5,
      taxes: 3.1,
      deliveryFee: isDelivery ? 3.5 : 0,
      discount: 0,
      total: isDelivery ? 22.1 : 18.6,
    })
  }

  return orders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export default function AdminDashboard() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [setupPassword, setSetupPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "table" | "delivery">("all")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [newOrdersCount, setNewOrdersCount] = useState(0)

  // Check if admin is configured on mount
  useEffect(() => {
    const checkConfigured = async () => {
      try {
        const res = await fetch("/api/admin/setup")
        const data = await res.json()
        setIsConfigured(Boolean(data.configured))
      } catch {
        setIsConfigured(true) // fail-safe to show login
      }
    }
    checkConfigured()
  }, [])

  // Fetch orders periodically when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    let timer: any
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders")
        const data = await res.json()
        // Map API orders to local Order type
        const mapped: Order[] = (data || []).map((o: any) => ({
          id: o.id,
          number: o.number || parseInt((o.id || "").replace(/\D/g, "").slice(-4) || "1000", 10),
          status: (o.status || "received") as OrderStatus,
          timestamp: new Date(o.createdAt || Date.now()),
          estimatedTime: o.type === "delivery" ? 35 : 20,
          orderInfo: o.type === "delivery"
            ? { type: "delivery", name: o.name, phone: o.phone, address: o.address }
            : { type: "table", tableNumber: o.tableNumber },
          items: o.items || [],
          subtotal: o.total || 0,
          taxes: 0,
          deliveryFee: o.type === "delivery" ? 0 : 0,
          discount: 0,
          total: o.total || 0,
          promoCode: undefined,
        }))
        setOrders((prev) => {
          if (prev.length > 0 && mapped.length > prev.length) {
            setNewOrdersCount((n) => n + (mapped.length - prev.length))
          }
          return mapped
        })
      } catch (e) {
        console.error(e)
      }
      timer = setTimeout(fetchOrders, 10000)
    }
    fetchOrders()
    return () => timer && clearTimeout(timer)
  }, [isAuthenticated])

  // Update current time every minute
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timeInterval)
  }, [])

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: setupPassword }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Échec de configuration")
      }
      setIsConfigured(true)
    } catch (e: any) {
      setAuthError(e.message || "Erreur inconnue")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error("Mot de passe incorrect")
      setIsAuthenticated(true)
    } catch (e: any) {
      setAuthError(e.message || "Erreur d'authentification")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword("")
    setOrders([])
    setSelectedOrder(null)
  }

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      })
      if (!res.ok) throw new Error("Échec de mise à jour")
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getFilteredOrders = () => {
    return orders.filter((order) => {
      const statusMatch = statusFilter === "all" || order.status === statusFilter
      const typeMatch = typeFilter === "all" || order.orderInfo.type === typeFilter
      return statusMatch && typeMatch
    })
  }

  const getOrderStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = orders.filter((order) => order.timestamp >= today)
    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0

    return {
      totalOrders: todayOrders.length,
      totalRevenue,
      averageOrderValue,
      pendingOrders: orders.filter((order) => ["received", "accepted", "preparing"].includes(order.status)).length,
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTimeElapsed = (orderTime: Date) => {
    const elapsed = Math.floor((currentTime.getTime() - orderTime.getTime()) / 60000)
    return elapsed
  }

  const clearNotifications = () => {
    setNewOrdersCount(0)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Administration</CardTitle>
            <CardDescription>Accès réservé au personnel</CardDescription>
          </CardHeader>
          <CardContent>
            {isConfigured === false ? (
              <form onSubmit={handleSetup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setupPassword">Créer un mot de passe</Label>
                  <Input
                    id="setupPassword"
                    type="password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
                {authError && <p className="text-sm text-destructive">{authError}</p>}
                <Button type="submit" className="w-full">Initialiser</Button>
                <p className="text-xs text-muted-foreground text-center">Le mot de passe sera stocké de manière sécurisée (hash)</p>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {authError && <p className="text-sm text-destructive">{authError}</p>}
                <Button type="submit" className="w-full">Se connecter</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = getOrderStats()
  const filteredOrders = getFilteredOrders()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Administration</h1>
                <p className="text-sm text-muted-foreground">Restaurant Le Délice</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {newOrdersCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearNotifications}>
                  <Bell className="h-4 w-4 mr-2" />
                  {newOrdersCount} nouvelle{newOrdersCount > 1 ? "s" : ""} commande{newOrdersCount > 1 ? "s" : ""}
                </Button>
              )}
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="container mx-auto px-4 py-2 text-center text-amber-800 text-sm">
          Cet espace est réservé uniquement aux serveurs et au propriétaire du restaurant.
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Commandes aujourd'hui</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                    <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} DA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Panier moyen</p>
                    <p className="text-2xl font-bold">{stats.averageOrderValue.toFixed(2)} DA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Management */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Commandes ({filteredOrders.length})
                    </CardTitle>
                    <div className="flex items-center gap-2 overflow-x-auto">
                      <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                        <SelectTrigger className="w-32 sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous statuts</SelectItem>
                          <SelectItem value="received">Reçues</SelectItem>
                          <SelectItem value="accepted">Acceptées</SelectItem>
                          <SelectItem value="preparing">En préparation</SelectItem>
                          <SelectItem value="ready">Prêtes</SelectItem>
                          <SelectItem value="served">Servies</SelectItem>
                          <SelectItem value="delivered">Livrées</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                        <SelectTrigger className="w-32 sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous types</SelectItem>
                          <SelectItem value="table">Sur place</SelectItem>
                          <SelectItem value="delivery">Livraison</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[60vh] md:max-h-96 overflow-y-auto">
                    {filteredOrders.map((order) => {
                      const config = statusConfig[order.status]
                      const StatusIcon = config.icon
                      const timeElapsed = getTimeElapsed(order.timestamp)

                      return (
                        <div
                          key={order.id}
                          className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 ${
                            selectedOrder?.id === order.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                                <StatusIcon className={`h-4 w-4 ${config.textColor}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">#{order.number}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {order.orderInfo.type === "table"
                                      ? `Table ${order.orderInfo.tableNumber}`
                                      : "Livraison"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatTime(order.timestamp)} • Il y a {timeElapsed} min
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{order.total.toFixed(2)} DA</p>
                              <Badge variant="secondary" className="text-xs">
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Details */}
            <div>
              {selectedOrder ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Commande #{selectedOrder.number}
                    </CardTitle>
                    <CardDescription>
                      {selectedOrder.orderInfo.type === "table"
                        ? `Table ${selectedOrder.orderInfo.tableNumber}`
                        : `Livraison - ${selectedOrder.orderInfo.name}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status Actions */}
                    <div className="space-y-2">
                      <Label>Actions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedOrder.status === "received" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(selectedOrder.id, "accepted")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Accepter
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateOrderStatus(selectedOrder.id, "cancelled")}
                            >
                              Annuler
                            </Button>
                          </>
                        )}
                        {selectedOrder.status === "accepted" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(selectedOrder.id, "preparing")}
                            className="col-span-2 bg-orange-600 hover:bg-orange-700"
                          >
                            Commencer la préparation
                          </Button>
                        )}
                        {selectedOrder.status === "preparing" && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(selectedOrder.id, "ready")}
                            className="col-span-2 bg-green-600 hover:bg-green-700"
                          >
                            Marquer comme prête
                          </Button>
                        )}
                        {selectedOrder.status === "ready" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(
                                selectedOrder.id,
                                selectedOrder.orderInfo.type === "table" ? "served" : "delivered",
                              )
                            }
                            className="col-span-2 bg-green-700 hover:bg-green-800"
                          >
                            {selectedOrder.orderInfo.type === "table" ? "Marquer comme servie" : "Marquer comme livrée"}
                          </Button>
                        )}
                        {(selectedOrder.status === "served" || selectedOrder.status === "delivered") && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="col-span-2"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/orders?id=${encodeURIComponent(selectedOrder.id)}`, {
                                  method: "DELETE",
                                })
                                if (!res.ok) throw new Error("Échec de la suppression")
                                setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id))
                                setSelectedOrder(null)
                              } catch (e) {
                                console.error(e)
                              }
                            }}
                          >
                            Effacer la commande
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Order Items */}
                    <div className="space-y-2">
                      <Label>Articles</Label>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.selectedSize && (
                                <Badge variant="outline" className="text-xs ml-1">
                                  {item.selectedSize}
                                </Badge>
                              )}
                              {item.selectedExtras?.map((extra) => (
                                <Badge key={extra} variant="outline" className="text-xs ml-1">
                                  +{extra}
                                </Badge>
                              ))}
                              <p className="text-muted-foreground">× {item.quantity}</p>
                            </div>
                            <span>{item.totalPrice.toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span>{selectedOrder.subtotal.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TVA</span>
                        <span>{selectedOrder.taxes.toFixed(2)} €</span>
                      </div>
                      {selectedOrder.deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span>Livraison</span>
                          <span>{selectedOrder.deliveryFee.toFixed(2)} €</span>
                        </div>
                      )}
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Réduction</span>
                          <span>-{selectedOrder.discount.toFixed(2)} €</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>{selectedOrder.total.toFixed(2)} €</span>
                      </div>
                    </div>

                    {/* Customer Info for Delivery */}
                    {selectedOrder.orderInfo.type === "delivery" && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label>Informations client</Label>
                          <div className="text-sm space-y-1">
                            <p>
                              <strong>Nom:</strong> {selectedOrder.orderInfo.name}
                            </p>
                            <p>
                              <strong>Téléphone:</strong> {selectedOrder.orderInfo.phone}
                            </p>
                            <p>
                              <strong>Adresse:</strong> {selectedOrder.orderInfo.address}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Sélectionnez une commande pour voir les détails</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
