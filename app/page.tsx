"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UtensilsCrossed, Truck, MapPin, Phone, User, Settings, Instagram, Facebook } from "lucide-react"
import MenuSystem from "@/components/menu-system"
import Link from "next/link"

type OrderType = "table" | "delivery" | null

export default function HomePage() {
  const [orderType, setOrderType] = useState<OrderType>(null)
  const [tableNumber, setTableNumber] = useState("")
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMenu, setShowMenu] = useState(false)

  const validateTableNumber = (num: string) => {
    const tableNum = Number.parseInt(num)
    if (!num || isNaN(tableNum) || tableNum < 1 || tableNum > 50) {
      return "Veuillez sélectionner un numéro de table valide (1-50)"
    }
    return ""
  }

  const validateDeliveryInfo = () => {
    const newErrors: Record<string, string> = {}

    if (!deliveryInfo.name.trim()) {
      newErrors.name = "Le nom est obligatoire"
    }

    if (!deliveryInfo.phone.trim()) {
      newErrors.phone = "Le téléphone est obligatoire"
    } else if (!/^[0-9\s\-+$$$$]{8,}$/.test(deliveryInfo.phone)) {
      newErrors.phone = "Format de téléphone invalide"
    }

    if (!deliveryInfo.address.trim()) {
      newErrors.address = "L'adresse est obligatoire"
    }

    return newErrors
  }

  const handleTableSubmit = () => {
    const error = validateTableNumber(tableNumber)
    if (error) {
      setErrors({ table: error })
      return
    }
    setErrors({})
    setShowMenu(true)
  }

  const handleDeliverySubmit = () => {
    const validationErrors = validateDeliveryInfo()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setShowMenu(true)
  }

  const resetSelection = () => {
    setOrderType(null)
    setTableNumber("")
    setDeliveryInfo({ name: "", phone: "", address: "" })
    setErrors({})
    setShowMenu(false)
  }

  if (showMenu) {
    const orderInfo =
      orderType === "table" ? { type: "table" as const, tableNumber } : { type: "delivery" as const, ...deliveryInfo }

    return <MenuSystem orderInfo={orderInfo} onBack={resetSelection} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <header className="glass-effect border-b border-amber-200/30 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="neon-glow p-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500">
                <UtensilsCrossed className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-[#E63946]">THE WALL</h1>
                <p className="text-xs sm:text-sm text-[#666666] font-medium">Dely Brahim</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {orderType && (
                <Button
                  variant="outline"
                  onClick={resetSelection}
                  size="sm"
                  className="text-xs sm:text-sm bg-white/90 text-amber-800 border-amber-300 hover:bg-amber-50 hover:text-amber-900"
                >
                  Retour
                </Button>
              )}
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {!orderType ? (
          /* Enhanced initial selection with restaurant description and mobile optimization */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
              <div className="floating-particles">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance mb-2 sm:mb-4 text-[#E63946]">
                  Bienvenue chez THE WALL
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-base sm:text-lg text-[#444444] font-semibold">
                    🍔 Venez manger la meilleure nourriture ! 🍕
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base text-[#666666]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#E63946]" />
                      <span>Dely Brahim</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#E63946]" />
                      <a href="tel:0555219684" className="hover:text-[#E63946] transition-colors font-medium">
                        0555 21 96 84
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <Card className="cursor-pointer group hover:scale-105 transition-all duration-300 border-[#E63946]/20 bg-[#FAF3E0] shadow-lg">
                <div onClick={() => setOrderType("table")} className="p-4 sm:p-6">
                  <CardHeader className="text-center pb-3 sm:pb-4 p-0">
                    <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-[#FFC300] rounded-full w-fit group-hover:scale-110 transition-transform shadow-lg">
                      <UtensilsCrossed className="h-10 w-10 sm:h-12 sm:w-12 text-[#333333]" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-[#444444]">Service à table</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-[#666666]">
                      Commandez depuis votre table au restaurant
                    </CardDescription>
                    <p className="text-xs sm:text-sm text-[#E63946] font-medium mt-2">
                      🎯 Parfait pour manger en famille !
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 pt-3 sm:pt-4">
                    <Button
                      className="w-full bg-[#333333] hover:bg-[#222222] text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base shadow-lg"
                      size="lg"
                    >
                      Choisir ma table
                    </Button>
                  </CardContent>
                </div>
              </Card>

              <Card className="cursor-pointer group hover:scale-105 transition-all duration-300 border-[#E63946]/20 bg-[#FAF3E0] shadow-lg">
                <div onClick={() => setOrderType("delivery")} className="p-4 sm:p-6">
                  <CardHeader className="text-center pb-3 sm:pb-4 p-0">
                    <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 bg-[#FFC300] rounded-full w-fit group-hover:scale-110 transition-transform shadow-lg">
                      <Truck className="h-10 w-10 sm:h-12 sm:w-12 text-[#333333]" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-[#444444]">Livraison</CardTitle>
                    <CardDescription className="text-sm sm:text-base text-[#666666]">
                      Faites-vous livrer à domicile
                    </CardDescription>
                    <p className="text-xs sm:text-sm text-[#E63946] font-medium mt-2">
                      🚚 Livraison rapide à Dely Brahim !
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 pt-3 sm:pt-4">
                    <Button
                      className="w-full bg-[#333333] hover:bg-[#222222] text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base shadow-lg"
                      size="lg"
                    >
                      Commander en livraison
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        ) : orderType === "table" ? (
          /* Enhanced table selection with better mobile UX */
          <div className="max-w-md mx-auto">
            <Card className="glass-effect border-amber-200/50 bg-gradient-to-br from-white/90 to-amber-50/90">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full w-fit neon-glow">
                  <UtensilsCrossed className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-amber-800">Service à table</CardTitle>
                <CardDescription className="text-amber-600">Sélectionnez votre numéro de table</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="table-select" className="text-amber-700 font-medium">
                    Numéro de table
                  </Label>
                  <Select value={tableNumber} onValueChange={setTableNumber}>
                    <SelectTrigger id="table-select" className="border-amber-200 focus:border-amber-400">
                      <SelectValue placeholder="Choisissez votre table" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          Table {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.table && <p className="text-sm text-red-600">{errors.table}</p>}
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3"
                  size="lg"
                  onClick={handleTableSubmit}
                  disabled={!tableNumber}
                >
                  Accéder au menu
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Enhanced delivery form with better mobile UX */
          <div className="max-w-md mx-auto">
            <Card className="glass-effect border-blue-200/50 bg-gradient-to-br from-white/90 to-blue-50/90">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-fit neon-glow">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-blue-800">Livraison</CardTitle>
                <CardDescription className="text-blue-600">Renseignez vos informations de livraison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-blue-700 font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nom complet
                  </Label>
                  <Input
                    id="name"
                    placeholder="Votre nom"
                    value={deliveryInfo.name}
                    onChange={(e) => setDeliveryInfo((prev) => ({ ...prev, name: e.target.value }))}
                    className="border-blue-200 focus:border-blue-400"
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-blue-700 font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Votre numéro de téléphone"
                    value={deliveryInfo.phone}
                    onChange={(e) => setDeliveryInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    className="border-blue-200 focus:border-blue-400"
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-blue-700 font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse de livraison
                  </Label>
                  <Input
                    id="address"
                    placeholder="Votre adresse complète"
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo((prev) => ({ ...prev, address: e.target.value }))}
                    className="border-blue-200 focus:border-blue-400"
                  />
                  {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  size="lg"
                  onClick={handleDeliverySubmit}
                >
                  Accéder au menu
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="glass-effect border-t border-amber-200/30 mt-12 sm:mt-16">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="neon-glow p-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500">
                <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-[#E63946]">THE WALL</span>
            </div>

            <div className="text-sm sm:text-base text-[#666666] space-y-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#E63946]" />
                  <span>Dely Brahim</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#E63946]" />
                  <a href="tel:0555219684" className="hover:text-[#E63946] transition-colors font-medium">
                    0555 21 96 84
                  </a>
                </div>
              </div>
              <p className="text-[#666666]">🍔 Venez savourer nos spécialités en famille ! 🍕</p>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <a
                href="https://instagram.com/thewallsnack"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm sm:text-base"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">@thewallsnack</span>
              </a>
              <a
                href="https://facebook.com/thewallsnack"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-full hover:from-blue-800 hover:to-blue-900 transition-all duration-300 shadow-lg text-sm sm:text-base"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-medium">THE WALL</span>
              </a>
            </div>

            <div className="text-xs sm:text-sm text-amber-600/80">
              <p>Ouvert tous les jours • Restaurant familial</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
