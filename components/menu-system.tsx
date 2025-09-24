"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Minus, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react"
import ShoppingCartComponent from "./shopping-cart"
import { Drawer } from "vaul"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  priceL?: number // For pizzas with Large size
  category: string
  subcategory: string
  options?: {
    sizes?: { name: string; priceModifier: number; price?: number }[]
    extras?: { name: string; price: number }[]
  }
}

interface CartItem extends MenuItem {
  quantity: number
  selectedSize?: string
  selectedExtras?: string[]
  totalPrice: number
}

interface MenuSystemProps {
  orderInfo: {
    type: "table" | "delivery"
    tableNumber?: string
    name?: string
    phone?: string
    address?: string
  }
  onBack: () => void
  onCartView?: () => void
}

// Sample menu data
const menuItems: MenuItem[] = [
  // Burgers
  {
    id: "smash",
    name: "Smash",
    description: "Burger signature de la maison",
    price: 350,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "dougie",
    name: "Dougie",
    description: "Burger gourmand aux saveurs uniques",
    price: 600,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "smashi",
    name: "Smashi",
    description: "Version premium du Smash",
    price: 800,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "tuple-e",
    name: "Tuple E",
    description: "Burger équilibré et savoureux",
    price: 400,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "le-braise",
    name: "Le Braise",
    description: "Burger grillé à la perfection",
    price: 450,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "soieda",
    name: "Soieda",
    description: "Burger aux saveurs méditerranéennes",
    price: 500,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "croustyl",
    name: "Croustyl",
    description: "Burger croustillant et généreux",
    price: 550,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Le burger traditionnel revisité",
    price: 550,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "normand",
    name: "Normand",
    description: "Burger aux saveurs normandes",
    price: 600,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "radicale",
    name: "Radicale",
    description: "Burger aux saveurs intenses",
    price: 600,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "brooklyn",
    name: "Brooklyn",
    description: "Burger style New-Yorkais",
    price: 700,
    category: "sale",
    subcategory: "burgers",
  },
  {
    id: "butcher",
    name: "Butcher",
    description: "Burger du boucher, viande premium",
    price: 800,
    category: "sale",
    subcategory: "burgers",
  },

  // Sandwichs
  {
    id: "le-quatro",
    name: "Le Quatro",
    description: "Sandwich aux quatre saveurs",
    price: 400,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "boursin",
    name: "Boursin",
    description: "Sandwich au fromage Boursin",
    price: 450,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "tandoori",
    name: "Tandoori",
    description: "Sandwich au poulet tandoori",
    price: 500,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "tikka",
    name: "Tikka",
    description: "Sandwich au poulet tikka",
    price: 550,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "tenders",
    name: "Tenders",
    description: "Sandwich aux tenders de poulet",
    price: 600,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "toscan",
    name: "Toscan",
    description: "Sandwich aux saveurs toscanes",
    price: 650,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "chiche-kerab",
    name: "Chiche Kerab",
    description: "Sandwich spécialité de la maison",
    price: 700,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "chicken-cheese",
    name: "Chicken Cheese",
    description: "Sandwich poulet fromage",
    price: 750,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "buffalo",
    name: "Buffalo",
    description: "Sandwich sauce buffalo épicée",
    price: 800,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "mixte",
    name: "Mixte",
    description: "Sandwich mixte généreux",
    price: 850,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "lalgerois",
    name: "L'Algérois",
    description: "Sandwich aux saveurs algériennes",
    price: 900,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "ze-wall",
    name: "Ze Wall",
    description: "Sandwich signature imposant",
    price: 950,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "philly-cheese",
    name: "Philly Cheese",
    description: "Sandwich style Philadelphie",
    price: 1000,
    category: "sale",
    subcategory: "sandwichs",
  },
  {
    id: "loriental",
    name: "L'Oriental",
    description: "Sandwich aux épices orientales",
    price: 1050,
    category: "sale",
    subcategory: "sandwichs",
  },

  // Pizzas Tomate
  {
    id: "classica",
    name: "Classica",
    description: "Pizza tomate, mozzarella, basilic",
    price: 500,
    priceL: 1100,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 500 },
        { name: "Large", priceModifier: 600, price: 1100 },
      ],
    },
  },
  {
    id: "mapoutine",
    name: "Mapoutine",
    description: "Pizza spécialité de la maison",
    price: 700,
    priceL: 1400,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 700 },
        { name: "Large", priceModifier: 700, price: 1400 },
      ],
    },
  },
  {
    id: "vegetarienne",
    name: "Végétarienne",
    description: "Pizza aux légumes frais",
    price: 700,
    priceL: 1400,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 700 },
        { name: "Large", priceModifier: 700, price: 1400 },
      ],
    },
  },
  {
    id: "tomara",
    name: "Tomara",
    description: "Pizza tomate et mozzarella premium",
    price: 750,
    priceL: 1500,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 750 },
        { name: "Large", priceModifier: 750, price: 1500 },
      ],
    },
  },
  {
    id: "capricieuse",
    name: "Capricieuse",
    description: "Pizza jambon, champignons, artichauts",
    price: 800,
    priceL: 1600,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 800 },
        { name: "Large", priceModifier: 800, price: 1600 },
      ],
    },
  },
  {
    id: "rene",
    name: "René",
    description: "Pizza signature René",
    price: 850,
    priceL: 1700,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 850 },
        { name: "Large", priceModifier: 850, price: 1700 },
      ],
    },
  },
  {
    id: "pavarotti",
    name: "Pavarotti",
    description: "Pizza italienne authentique",
    price: 850,
    priceL: 1700,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 850 },
        { name: "Large", priceModifier: 850, price: 1700 },
      ],
    },
  },
  {
    id: "chicken-pizza",
    name: "Chicken",
    description: "Pizza au poulet grillé",
    price: 850,
    priceL: 1700,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 850 },
        { name: "Large", priceModifier: 850, price: 1700 },
      ],
    },
  },
  {
    id: "tikka-pizza",
    name: "Tikka",
    description: "Pizza au poulet tikka",
    price: 850,
    priceL: 1700,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 850 },
        { name: "Large", priceModifier: 850, price: 1700 },
      ],
    },
  },
  {
    id: "calzone",
    name: "Calzone",
    description: "Pizza fermée garnie",
    price: 900,
    priceL: 1800,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 900 },
        { name: "Large", priceModifier: 900, price: 1800 },
      ],
    },
  },
  {
    id: "buffalo-pizza",
    name: "Buffalo",
    description: "Pizza sauce buffalo épicée",
    price: 900,
    priceL: 1800,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 900 },
        { name: "Large", priceModifier: 900, price: 1800 },
      ],
    },
  },
  {
    id: "pepperoni",
    name: "Pepperoni",
    description: "Pizza au pepperoni épicé",
    price: 900,
    priceL: 1800,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 900 },
        { name: "Large", priceModifier: 900, price: 1800 },
      ],
    },
  },
  {
    id: "orientale",
    name: "Orientale",
    description: "Pizza aux épices orientales",
    price: 900,
    priceL: 1800,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 900 },
        { name: "Large", priceModifier: 900, price: 1800 },
      ],
    },
  },
  {
    id: "boisee",
    name: "Boisée",
    description: "Pizza aux champignons des bois",
    price: 950,
    priceL: 1900,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 950 },
        { name: "Large", priceModifier: 950, price: 1900 },
      ],
    },
  },
  {
    id: "4-fromages",
    name: "4 Fromages",
    description: "Pizza aux quatre fromages",
    price: 950,
    priceL: 1900,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 950 },
        { name: "Large", priceModifier: 950, price: 1900 },
      ],
    },
  },
  {
    id: "campione",
    name: "Campione",
    description: "Pizza du champion",
    price: 950,
    priceL: 1900,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 950 },
        { name: "Large", priceModifier: 950, price: 1900 },
      ],
    },
  },
  {
    id: "texane",
    name: "Texane",
    description: "Pizza style Texas",
    price: 950,
    priceL: 1900,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 950 },
        { name: "Large", priceModifier: 950, price: 1900 },
      ],
    },
  },
  {
    id: "americaine",
    name: "Américaine",
    description: "Pizza style américain",
    price: 1000,
    priceL: 2000,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 1000 },
        { name: "Large", priceModifier: 1000, price: 2000 },
      ],
    },
  },
  {
    id: "pescator",
    name: "Pescator",
    description: "Pizza aux fruits de mer",
    price: 1450,
    priceL: 2900,
    category: "sale",
    subcategory: "pizzas-tomate",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 1450 },
        { name: "Large", priceModifier: 1450, price: 2900 },
      ],
    },
  },

  // Pizzas Crème
  {
    id: "venezia",
    name: "Venezia",
    description: "Pizza crème style vénitien",
    price: 850,
    priceL: 1700,
    category: "sale",
    subcategory: "pizzas-creme",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 850 },
        { name: "Large", priceModifier: 850, price: 1700 },
      ],
    },
  },
  {
    id: "chevre-miel",
    name: "Chèvre Miel",
    description: "Pizza crème, chèvre et miel",
    price: 900,
    priceL: 1800,
    category: "sale",
    subcategory: "pizzas-creme",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 900 },
        { name: "Large", priceModifier: 900, price: 1800 },
      ],
    },
  },
  {
    id: "rimini",
    name: "Rimini",
    description: "Pizza crème spécialité Rimini",
    price: 1000,
    priceL: 2000,
    category: "sale",
    subcategory: "pizzas-creme",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 1000 },
        { name: "Large", priceModifier: 1000, price: 2000 },
      ],
    },
  },
  {
    id: "norvegienne",
    name: "Norvégienne",
    description: "Pizza crème au saumon",
    price: 1200,
    priceL: 2400,
    category: "sale",
    subcategory: "pizzas-creme",
    options: {
      sizes: [
        { name: "Moyenne", priceModifier: 0, price: 1200 },
        { name: "Large", priceModifier: 1200, price: 2400 },
      ],
    },
  },

  // Pâtes
  {
    id: "verde",
    name: "Verde",
    description: "Pâtes aux épinards et basilic",
    price: 900,
    category: "sale",
    subcategory: "pates",
  },
  {
    id: "bolognaise",
    name: "Bolognaise",
    description: "Pâtes à la sauce bolognaise",
    price: 1000,
    category: "sale",
    subcategory: "pates",
  },
  {
    id: "fromagere",
    name: "Fromagère",
    description: "Pâtes aux quatre fromages",
    price: 1100,
    category: "sale",
    subcategory: "pates",
  },
  {
    id: "saumon-pates",
    name: "Saumon",
    description: "Pâtes au saumon fumé",
    price: 1400,
    category: "sale",
    subcategory: "pates",
  },
  {
    id: "fruits-de-mer",
    name: "Fruits de Mer",
    description: "Pâtes aux fruits de mer",
    price: 1700,
    category: "sale",
    subcategory: "pates",
  },

  // Salades
  {
    id: "nature",
    name: "Nature",
    description: "Salade verte simple",
    price: 400,
    category: "sale",
    subcategory: "salades",
  },
  {
    id: "nicoise",
    name: "Niçoise",
    description: "Salade niçoise traditionnelle",
    price: 500,
    category: "sale",
    subcategory: "salades",
  },
  {
    id: "oquinry",
    name: "Oquinry",
    description: "Salade spécialité de la maison",
    price: 600,
    category: "sale",
    subcategory: "salades",
  },
  {
    id: "royale",
    name: "Royale",
    description: "Salade royale généreuse",
    price: 700,
    category: "sale",
    subcategory: "salades",
  },
  {
    id: "cesar",
    name: "César",
    description: "Salade César au poulet",
    price: 800,
    category: "sale",
    subcategory: "salades",
  },
  {
    id: "tomate-mozza",
    name: "Tomate Mozza",
    description: "Salade tomate mozzarella",
    price: 900,
    category: "sale",
    subcategory: "salades",
  },
  {
    id: "cocktail",
    name: "Cocktail",
    description: "Salade cocktail variée",
    price: 1100,
    category: "sale",
    subcategory: "salades",
  },

  // Grillades
  {
    id: "pilon",
    name: "Pilon",
    description: "Pilon de poulet grillé avec 2 accompagnements",
    price: 3000,
    category: "sale",
    subcategory: "grillades",
  },
  {
    id: "mushroom",
    name: "Mushroom",
    description: "Escalope aux champignons avec 2 accompagnements",
    price: 3000,
    category: "sale",
    subcategory: "grillades",
  },
  {
    id: "milanaise",
    name: "Milanaise",
    description: "Escalope milanaise avec 2 accompagnements",
    price: 3000,
    category: "sale",
    subcategory: "grillades",
  },
  {
    id: "gordon-bleu",
    name: "Gordon Bleu",
    description: "Cordon bleu avec 2 accompagnements",
    price: 3000,
    category: "sale",
    subcategory: "grillades",
  },
  {
    id: "sunny-steak",
    name: "Sunny Steak",
    description: "Steak grillé avec 2 accompagnements",
    price: 3000,
    category: "sale",
    subcategory: "grillades",
  },
  {
    id: "entrecote",
    name: "Entrecôte",
    description: "Entrecôte grillée avec 2 accompagnements",
    price: 3000,
    category: "sale",
    subcategory: "grillades",
  },

  // Accompagnements
  {
    id: "frites",
    name: "Frites",
    description: "Frites maison croustillantes",
    price: 200,
    category: "sale",
    subcategory: "accompagnements",
  },
  {
    id: "frites-fromagere",
    name: "Frites Fromagère",
    description: "Frites avec sauce fromagère",
    price: 300,
    category: "sale",
    subcategory: "accompagnements",
  },
  {
    id: "tenders-3",
    name: "Tenders (3 pièces)",
    description: "3 tenders de poulet croustillants",
    price: 350,
    category: "sale",
    subcategory: "accompagnements",
  },
  {
    id: "tenders-6",
    name: "Tenders (6 pièces)",
    description: "6 tenders de poulet croustillants",
    price: 600,
    category: "sale",
    subcategory: "accompagnements",
  },
  {
    id: "tenders-9",
    name: "Tenders (9 pièces)",
    description: "9 tenders de poulet croustillants",
    price: 900,
    category: "sale",
    subcategory: "accompagnements",
  },
  {
    id: "gratin-poulet",
    name: "Gratin Poulet",
    description: "Gratin de pommes de terre au poulet",
    price: 1000,
    category: "sale",
    subcategory: "accompagnements",
  },
  {
    id: "gratin-fruits-mer",
    name: "Gratin Fruits de Mer",
    description: "Gratin aux fruits de mer",
    price: 1000,
    category: "sale",
    subcategory: "accompagnements",
  },

  // Boissons
  {
    id: "eau-50cl",
    name: "Eau 50cl",
    description: "Eau minérale 50cl",
    price: 50,
    category: "boissons",
    subcategory: "eaux",
  },
  {
    id: "jus-33cl",
    name: "Jus 33cl",
    description: "Jus de fruits 33cl",
    price: 100,
    category: "boissons",
    subcategory: "jus",
  },
  {
    id: "canette-24cl",
    name: "Canette 24cl",
    description: "Soda en canette 24cl",
    price: 150,
    category: "boissons",
    subcategory: "sodas",
  },
  {
    id: "canette-33cl",
    name: "Canette 33cl",
    description: "Soda en canette 33cl",
    price: 200,
    category: "boissons",
    subcategory: "sodas",
  },
  {
    id: "ice-tea",
    name: "Ice Tea",
    description: "Thé glacé rafraîchissant",
    price: 250,
    category: "boissons",
    subcategory: "thes",
  },
  {
    id: "bouteille-1l",
    name: "Bouteille 1L",
    description: "Boisson en bouteille 1L",
    price: 300,
    category: "boissons",
    subcategory: "sodas",
  },
  {
    id: "mojito",
    name: "Mojito",
    description: "Mojito sans alcool",
    price: 450,
    category: "boissons",
    subcategory: "cocktails",
  },
  {
    id: "cocktail",
    name: "Cocktail",
    description: "Cocktail de fruits",
    price: 500,
    category: "boissons",
    subcategory: "cocktails",
  },
  {
    id: "smoothie",
    name: "Smoothie",
    description: "Smoothie aux fruits frais",
    price: 500,
    category: "boissons",
    subcategory: "smoothies",
  },
  {
    id: "milkshake",
    name: "Milkshake",
    description: "Milkshake crémeux",
    price: 500,
    category: "boissons",
    subcategory: "smoothies",
  },

  // Boissons fraîches spécifiques
  {
    id: "eau-50cl-fresh",
    name: "Eau 50cl",
    description: "Eau minérale fraîche 50cl",
    price: 50,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "jus-33cl-fresh",
    name: "Jus 33cl",
    description: "Jus de fruits frais 33cl",
    price: 100,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "eau-gazeuse",
    name: "Eau Gazeuse",
    description: "Eau gazeuse rafraîchissante",
    price: 100,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "canette-24cl-fresh",
    name: "Canette 24cl",
    description: "Soda en canette 24cl",
    price: 100,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "boisson-33cl",
    name: "Boisson 33cl",
    description: "Boisson fraîche 33cl",
    price: 100,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "canette-33cl-fresh",
    name: "Canette 33cl",
    description: "Soda en canette 33cl",
    price: 150,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "dicholo",
    name: "Dicholo",
    description: "Boisson Dicholo",
    price: 300,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "mojito-citron-menthe",
    name: "Mojito Citron Menthe",
    description: "Mojito citron menthe sans alcool",
    price: 450,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "jus-fruits-saison",
    name: "Jus de Fruits de Saison",
    description: "Jus de fruits frais de saison",
    price: 450,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "virgin-mojito",
    name: "Virgin Mojito",
    description: "Virgin Mojito rafraîchissant",
    price: 500,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "cocktail-fruits-saison",
    name: "Cocktail de Fruits de Saison",
    description: "Cocktail de fruits frais de saison",
    price: 500,
    category: "boissons",
    subcategory: "fraiches",
  },
  {
    id: "smoothie-fruits-saison",
    name: "Smoothie de Fruits de Saison",
    description: "Smoothie aux fruits frais de saison",
    price: 500,
    category: "boissons",
    subcategory: "fraiches",
  },

  // Boissons chaudes
  {
    id: "the-infusion",
    name: "Thé Infusion",
    description: "Thé infusion chaude",
    price: 150,
    category: "boissons",
    subcategory: "chaudes",
  },
  {
    id: "cafe-nespresso",
    name: "Café Nespresso",
    description: "Café Nespresso",
    price: 250,
    category: "boissons",
    subcategory: "chaudes",
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Cappuccino crémeux",
    price: 350,
    category: "boissons",
    subcategory: "chaudes",
  },

  // Milkshakes spécifiques
  {
    id: "milkshake-fraise",
    name: "Milkshake Fraise",
    description: "Milkshake à la fraise",
    price: 500,
    category: "boissons",
    subcategory: "milkshakes",
  },
  {
    id: "milkshake-bueno",
    name: "Milkshake Bueno El Mordjane",
    description: "Milkshake au Bueno El Mordjane",
    price: 500,
    category: "boissons",
    subcategory: "milkshakes",
  },
  {
    id: "milkshake-banane",
    name: "Milkshake Banane",
    description: "Milkshake à la banane",
    price: 500,
    category: "boissons",
    subcategory: "milkshakes",
  },
  {
    id: "milkshake-pistache",
    name: "Milkshake Pistache",
    description: "Milkshake à la pistache",
    price: 600,
    category: "boissons",
    subcategory: "milkshakes",
  },
  {
    id: "milkshake-nutella-banane",
    name: "Milkshake Nutella & Banane",
    description: "Milkshake Nutella et banane",
    price: 700,
    category: "boissons",
    subcategory: "milkshakes",
  },

  // Desserts
  {
    id: "glace-1",
    name: "Glace (1 boule)",
    description: "Une boule de glace au choix",
    price: 300,
    category: "sucre",
    subcategory: "glaces",
  },
  {
    id: "glace-2",
    name: "Glace (2 boules)",
    description: "Deux boules de glace au choix",
    price: 550,
    category: "sucre",
    subcategory: "glaces",
  },
  {
    id: "glace-3",
    name: "Glace (3 boules)",
    description: "Trois boules de glace au choix",
    price: 750,
    category: "sucre",
    subcategory: "glaces",
  },
  {
    id: "fondant-m",
    name: "Fondant (M)",
    description: "Fondant au chocolat moyen",
    price: 400,
    category: "sucre",
    subcategory: "desserts",
  },
  {
    id: "fondant-l",
    name: "Fondant (L)",
    description: "Fondant au chocolat large",
    price: 600,
    category: "sucre",
    subcategory: "desserts",
  },
  {
    id: "profiteroles-m",
    name: "Profiteroles (M)",
    description: "Profiteroles moyennes",
    price: 500,
    category: "sucre",
    subcategory: "desserts",
  },
  {
    id: "profiteroles-l",
    name: "Profiteroles (L)",
    description: "Profiteroles larges",
    price: 700,
    category: "sucre",
    subcategory: "desserts",
  },
  {
    id: "mousse",
    name: "Mousse",
    description: "Mousse au chocolat",
    price: 425,
    category: "sucre",
    subcategory: "desserts",
  },
  {
    id: "tiramisu",
    name: "Tiramisu",
    description: "Tiramisu traditionnel italien",
    price: 500,
    category: "sucre",
    subcategory: "desserts",
  },
  {
    id: "creme-brulee",
    name: "Crème Brûlée",
    description: "Crème brûlée à la vanille",
    price: 500,
    category: "sucre",
    subcategory: "desserts",
  },
  {
    id: "tarte-daim",
    name: "Tarte au Daim",
    description: "Délicieuse tarte au Daim",
    price: 500,
    category: "sucre",
    subcategory: "desserts",
  },
]

const categories = {
  sale: {
    name: "Salé",
    subcategories: {
      burgers: "🍔 Burgers",
      sandwichs: "🥙 Sandwichs",
      "pizzas-tomate": "🍕 Pizzas Tomate",
      "pizzas-creme": "🍕 Pizzas Crème",
      pates: "🍝 Pâtes",
      salades: "🥗 Salades",
      grillades: "🍖 Grillades",
      accompagnements: "🍟 Accompagnements",
    },
  },
  sucre: {
    name: "Sucré",
    subcategories: {
      desserts: "🍨 Desserts",
      glaces: "🍨 Glaces",
    },
  },
  boissons: {
    name: "Boissons",
    subcategories: {
      fraiches: "🧊 Boissons Fraîches",
      chaudes: "☕ Boissons Chaudes",
      milkshakes: "🥤 Milkshakes",
      eaux: "💧 Eaux",
      jus: "🧃 Jus",
      sodas: "🥤 Sodas",
      thes: "🍵 Thés",
      cocktails: "🍹 Cocktails",
      smoothies: "🥤 Smoothies",
    },
  },
}

export default function MenuSystem({ orderInfo, onBack, onCartView }: MenuSystemProps) {
  const [activeCategory, setActiveCategory] = useState("sale")
  const [activeSubcategory, setActiveSubcategory] = useState("pizzas")
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [itemOptions, setItemOptions] = useState({
    quantity: 1,
    selectedSize: "",
    selectedExtras: [] as string[],
  })
  const [showCart, setShowCart] = useState(false)

  const filteredItems = menuItems.filter(
    (item) => item.category === activeCategory && item.subcategory === activeSubcategory,
  )

  const calculateItemPrice = (item: MenuItem, options: typeof itemOptions) => {
    let price = item.price

    if (options.selectedSize && item.options?.sizes) {
      const size = item.options.sizes.find((s) => s.name === options.selectedSize)
      if (size && size.price) {
        price = size.price // Use specific price for size instead of modifier
      } else if (size) {
        price += size.priceModifier
      }
    }

    // Add extras
    if (options.selectedExtras.length > 0 && item.options?.extras) {
      options.selectedExtras.forEach((extraName) => {
        const extra = item.options?.extras?.find((e) => e.name === extraName)
        if (extra) price += extra.price
      })
    }

    return price * options.quantity
  }

  const addToCart = () => {
    if (!selectedItem) return

    const totalPrice = calculateItemPrice(selectedItem, itemOptions)
    const cartItem: CartItem = {
      ...selectedItem,
      quantity: itemOptions.quantity,
      selectedSize: itemOptions.selectedSize || undefined,
      selectedExtras: itemOptions.selectedExtras,
      totalPrice,
    }

    setCart((prev) => [...prev, cartItem])
    setSelectedItem(null)
    setItemOptions({ quantity: 1, selectedSize: "", selectedExtras: [] })
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    const firstSubcategory = Object.keys(categories[category as keyof typeof categories].subcategories)[0]
    setActiveSubcategory(firstSubcategory)
  }

  const handleCartClick = () => {
    setShowCart(true)
    onCartView && onCartView()
  }

  const handleBackFromCart = () => {
    setShowCart(false)
  }

  const handleProceedToCheckout = (orderSummary: any) => {
    console.log("Proceeding to checkout:", orderSummary)
    // This will be handled in the next task
  }

  return (
    <div className="min-h-screen bg-background relative">
      <header className="sticky top-0 z-50 border-b border-border glass-effect neon-glow backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="hover-lift button-morph">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="text-sm text-muted-foreground animate-fade-in">
                {orderInfo.type === "table" ? `Table ${orderInfo.tableNumber}` : `Livraison - ${orderInfo.name}`}
              </div>
            </div>
            <h1 className="font-bold text-xl text-glow animate-neon-pulse">Menu</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 animate-fade-in relative z-10">
        <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
          <TabsList className="grid w-full grid-cols-3 mb-6 glass-effect p-1 rounded-lg liquid-morph animate-morph">
            <TabsTrigger
              value="sale"
              className="data-[state=active]:neon-glow data-[state=active]:text-primary-foreground transition-all duration-300 button-morph hover-lift"
            >
              🍽️ Salé
            </TabsTrigger>
            <TabsTrigger
              value="sucre"
              className="data-[state=active]:neon-glow data-[state=active]:text-primary-foreground transition-all duration-300 button-morph hover-lift"
            >
              🧁 Sucré
            </TabsTrigger>
            <TabsTrigger
              value="boissons"
              className="data-[state=active]:neon-glow data-[state=active]:text-primary-foreground transition-all duration-300 button-morph hover-lift"
            >
              🥤 Boissons
            </TabsTrigger>
          </TabsList>

          {Object.entries(categories).map(([categoryKey, category]) => (
            <TabsContent key={categoryKey} value={categoryKey} className="animate-slide-up">
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {Object.entries(category.subcategories).map(([subKey, subName], index) => (
                  <Button
                    key={subKey}
                    variant={activeSubcategory === subKey ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSubcategory(subKey)}
                    className={`whitespace-nowrap hover-lift button-morph transition-all duration-300 animate-scale-in card-3d ${
                      activeSubcategory === subKey ? "neon-glow liquid-morph" : "glass-effect"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {subName}
                  </Button>
                ))}
              </div>

              <div className="grid gap-6">
                {filteredItems.map((item, index) => (
                  <Card
                    key={item.id}
                    className="hover-lift card-3d border-0 shadow-lg hover:shadow-2xl transition-all duration-500 glass-effect backdrop-blur-xl animate-fade-in relative overflow-hidden group"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-liquid"></div>

                    <CardHeader className="pb-3 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-card-foreground group-hover:text-glow transition-all duration-300 animate-bounce-subtle">
                            {item.name}
                          </CardTitle>
                          <CardDescription className="mt-1 text-muted-foreground leading-relaxed animate-fade-in">
                            {item.description}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="secondary"
                          className="ml-4 neon-glow liquid-morph font-semibold px-3 py-1 animate-neon-pulse"
                        >
                          {item.priceL ? `${item.price}/${item.priceL}` : item.price} DA
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <Button
                        className="w-full liquid-morph hover:neon-glow text-primary-foreground font-medium transition-all duration-400 hover-lift button-morph shadow-xl animate-3d-flip"
                        onClick={() => setSelectedItem(item)}
                      >
                        <Plus className="h-4 w-4 mr-2 animate-bounce-subtle" />
                        Ajouter au panier
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 glass-effect neon-glow border-t border-border p-4 animate-slide-up backdrop-blur-xl z-50">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative animate-parallax">
                  <ShoppingCart className="h-5 w-5 text-primary animate-neon-pulse" />
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center neon-glow liquid-morph text-accent-foreground text-xs animate-bounce-subtle">
                    {cartItemCount}
                  </Badge>
                </div>
                <span className="font-medium text-foreground text-glow animate-fade-in">
                  {cartItemCount} article{cartItemCount > 1 ? "s" : ""}
                </span>
                <Badge variant="outline" className="neon-glow liquid-morph font-semibold animate-morph">
                  {cartTotal} DA
                </Badge>
              </div>
              <Button
                size="lg"
                onClick={handleCartClick}
                className="liquid-morph hover:neon-glow text-primary-foreground font-semibold transition-all duration-400 hover-lift button-morph shadow-xl animate-3d-flip"
              >
                Voir le panier
                <ArrowRight className="h-4 w-4 ml-2 animate-bounce-subtle" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <Drawer.Root open={showCart} onOpenChange={setShowCart}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-3xl w-full rounded-t-2xl bg-background border-t border-border shadow-2xl">
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted" />
              <div className="p-2 sm:p-4">
                <ShoppingCartComponent
                  cart={cart}
                  orderInfo={orderInfo}
                  onUpdateCart={(updated) => setCart(updated as any)}
                  onBack={handleBackFromCart}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Item Options Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border/50">
              <CardTitle className="text-xl font-bold text-foreground">{selectedItem.name}</CardTitle>
              <CardDescription className="text-muted-foreground leading-relaxed">
                {selectedItem.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Size Selection */}
              {selectedItem.options?.sizes && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Taille</Label>
                  <Select
                    value={itemOptions.selectedSize}
                    onValueChange={(value) => setItemOptions((prev) => ({ ...prev, selectedSize: value }))}
                  >
                    <SelectTrigger className="bg-input border-border hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Choisir une taille" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border shadow-lg">
                      {selectedItem.options.sizes.map((size) => (
                        <SelectItem key={size.name} value={size.name} className="hover:bg-muted transition-colors">
                          {size.name} {size.priceModifier > 0 && `(+${size.priceModifier.toFixed(2)} DA)`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Extras Selection */}
              {selectedItem.options?.extras && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Suppléments</Label>
                  <div className="space-y-3">
                    {selectedItem.options.extras.map((extra) => (
                      <div
                        key={extra.name}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          id={extra.name}
                          checked={itemOptions.selectedExtras.includes(extra.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setItemOptions((prev) => ({
                                ...prev,
                                selectedExtras: [...prev.selectedExtras, extra.name],
                              }))
                            } else {
                              setItemOptions((prev) => ({
                                ...prev,
                                selectedExtras: prev.selectedExtras.filter((name) => name !== extra.name),
                              }))
                            }
                          }}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                        />
                        <Label htmlFor={extra.name} className="flex-1 font-medium text-foreground cursor-pointer">
                          {extra.name}
                        </Label>
                        <span className="text-sm font-semibold text-accent">+{extra.price.toFixed(2)} DA</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Quantité</Label>
                <div className="flex items-center justify-center gap-4 bg-muted/30 rounded-lg p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setItemOptions((prev) => ({
                        ...prev,
                        quantity: Math.max(1, prev.quantity - 1),
                      }))
                    }
                    className="h-10 w-10 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-2xl w-12 text-center text-foreground">{itemOptions.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setItemOptions((prev) => ({
                        ...prev,
                        quantity: prev.quantity + 1,
                      }))
                    }
                    className="h-10 w-10 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price Display */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-center bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
                  <span className="font-semibold text-lg text-foreground">Total:</span>
                  <Badge variant="secondary" className="text-xl font-bold bg-primary text-primary-foreground px-4 py-2">
                    {calculateItemPrice(selectedItem, itemOptions)} DA
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-muted transition-all duration-200 bg-transparent"
                  onClick={() => setSelectedItem(null)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
                  onClick={addToCart}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter au panier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
