// Static data for repositories

import { Category, Tag, Product, Flower } from './types';

// Categories
export const categories: Category[] = [
  {
    id: 1,
    name: "Wedding Bouquets",
    slug: "wedding-bouquets",
    description: "Beautiful bouquets perfect for weddings and special ceremonies."
  },
  {
    id: 2,
    name: "Birthday Flowers",
    slug: "birthday",
    description: "Colorful arrangements to celebrate birthdays."
  },
  {
    id: 3,
    name: "Romantic Bouquets",
    slug: "romantic",
    description: "Express your love with our romantic flower arrangements."
  },
  {
    id: 4,
    name: "Seasonal Collections",
    slug: "seasonal",
    description: "Fresh seasonal flowers that reflect the beauty of each time of year."
  },
  {
    id: 5,
    name: "Sympathy Flowers",
    slug: "sympathy",
    description: "Elegant arrangements to express your condolences."
  }
];

// Tags
export const tags: Tag[] = [
  { id: 1, name: "Roses", slug: "roses" },
  { id: 2, name: "Lilies", slug: "lilies" },
  { id: 3, name: "Tulips", slug: "tulips" },
  { id: 4, name: "Sunflowers", slug: "sunflowers" },
  { id: 5, name: "Orchids", slug: "orchids" },
  { id: 6, name: "Luxury", slug: "luxury" },
  { id: 7, name: "Budget Friendly", slug: "budget" },
  { id: 8, name: "Colorful", slug: "colorful" },
  { id: 9, name: "Elegant", slug: "elegant" },
  { id: 10, name: "Exotic", slug: "exotic" }
];

// Flowers for custom bouquets
export const flowers: Flower[] = [
  {
    id: 1,
    name: "Rose",
    image: "/placeholder.svg",
    price: 50,
    colors: ["Red", "Pink", "White", "Yellow", "Orange"],
    description: "Classic roses known for their beauty and elegance."
  },
  {
    id: 2,
    name: "Tulip",
    image: "/placeholder.svg",
    price: 35,
    colors: ["Red", "Pink", "Purple", "Yellow", "White"],
    description: "Elegant spring flowers with cup-shaped blooms."
  },
  {
    id: 3,
    name: "Lily",
    image: "/placeholder.svg",
    price: 65,
    colors: ["White", "Pink", "Yellow", "Orange"],
    description: "Fragrant flowers with large, showy blooms."
  },
  {
    id: 4,
    name: "Sunflower",
    image: "/placeholder.svg",
    price: 45,
    colors: ["Yellow"],
    description: "Bright and cheerful flowers that bring joy."
  },
  {
    id: 5,
    name: "Orchid",
    image: "/placeholder.svg",
    price: 80,
    colors: ["Purple", "White", "Pink", "Yellow"],
    description: "Exotic and delicate flowers for a touch of luxury."
  },
  {
    id: 6,
    name: "Daisy",
    image: "/placeholder.svg",
    price: 30,
    colors: ["White", "Pink", "Purple"],
    description: "Simple, charming flowers that add a casual touch."
  },
  {
    id: 7,
    name: "Carnation",
    image: "/placeholder.svg",
    price: 25,
    colors: ["Pink", "Red", "White", "Purple", "Yellow"],
    description: "Long-lasting flowers with ruffled petals."
  },
  {
    id: 8,
    name: "Peony",
    image: "/placeholder.svg",
    price: 70,
    colors: ["Pink", "White", "Red", "Coral"],
    description: "Lush, full blooms with a sweet fragrance."
  }
];

// Products
export const products: Product[] = [
  {
    id: 1,
    name: "Rose Elegance",
    description: "Beautiful arrangement of fresh roses in a stylish vase.",
    price: "₴650",
    priceValue: 650,
    image: "/placeholder.svg",
    categoryId: 3,
    tags: [1, 6, 9],
    isCustomizable: true,
    baseFlowers: [
      { flowerId: 1, quantity: 12, color: "Red" }, // 12 red roses
    ]
  },
  {
    id: 2,
    name: "Spring Joy",
    description: "Colorful mix of spring flowers to brighten any room.",
    price: "₴750",
    priceValue: 750,
    image: "/placeholder.svg",
    categoryId: 4,
    tags: [3, 8],
    isCustomizable: true,
    baseFlowers: [
      { flowerId: 2, quantity: 8, color: "Pink" }, // 8 pink tulips
      { flowerId: 6, quantity: 5, color: "White" }, // 5 white daisies
      { flowerId: 7, quantity: 3, color: "Pink" }, // 3 pink carnations
    ]
  },
  {
    id: 3,
    name: "Romantic Sunset",
    description: "Red and pink roses with decorative elements.",
    price: "₴850",
    priceValue: 850,
    image: "/placeholder.svg",
    categoryId: 3,
    tags: [1, 6, 9],
    isCustomizable: true,
    baseFlowers: [
      { flowerId: 1, quantity: 8, color: "Red" }, // 8 red roses
      { flowerId: 1, quantity: 6, color: "Pink" }, // 6 pink roses
    ]
  },
  {
    id: 4,
    name: "White Dreams",
    description: "Elegant white flowers for special occasions.",
    price: "₴700",
    priceValue: 700,
    image: "/placeholder.svg",
    categoryId: 1,
    tags: [2, 9]
  },
  {
    id: 5,
    name: "Summer Breeze",
    description: "Bright and cheerful arrangement with sunflowers.",
    price: "₴600",
    priceValue: 600,
    image: "/placeholder.svg",
    categoryId: 4,
    tags: [4, 8, 7],
    isCustomizable: true,
    baseFlowers: [
      { flowerId: 4, quantity: 5, color: "Yellow" }, // 5 sunflowers
      { flowerId: 6, quantity: 6, color: "White" }, // 6 white daisies
    ]
  },
  {
    id: 6,
    name: "Purple Passion",
    description: "Elegant arrangement with purple and lavender flowers.",
    price: "₴720",
    priceValue: 720,
    image: "/placeholder.svg",
    categoryId: 2,
    tags: [5, 8, 9]
  },
  {
    id: 7,
    name: "Birthday Surprise",
    description: "Colorful mix perfect for birthday celebrations.",
    price: "₴680",
    priceValue: 680,
    image: "/placeholder.svg",
    categoryId: 2,
    tags: [3, 8, 7]
  },
  {
    id: 8,
    name: "Gentle Touch",
    description: "Soft pastel colors in a delicate arrangement.",
    price: "₴590",
    priceValue: 590,
    image: "/placeholder.svg",
    categoryId: 3,
    tags: [2, 7, 9]
  },
  {
    id: 9,
    name: "Bridal Beauty",
    description: "Stunning white arrangement perfect for brides.",
    price: "₴950",
    priceValue: 950,
    image: "/placeholder.svg",
    categoryId: 1,
    tags: [1, 2, 6, 9],
    isCustomizable: true,
    baseFlowers: [
      { flowerId: 1, quantity: 10, color: "White" }, // 10 white roses
      { flowerId: 3, quantity: 5, color: "White" }, // 5 white lilies
      { flowerId: 8, quantity: 3, color: "White" }, // 3 white peonies
    ]
  },
  {
    id: 10,
    name: "Sympathy Grace",
    description: "Elegant white lilies expressing condolences.",
    price: "₴780",
    priceValue: 780,
    image: "/placeholder.svg",
    categoryId: 5,
    tags: [2, 9]
  },
  {
    id: 11,
    name: "Tropical Paradise",
    description: "Exotic arrangement with tropical flowers.",
    price: "₴820",
    priceValue: 820,
    image: "/placeholder.svg",
    categoryId: 4,
    tags: [5, 8, 10]
  },
  {
    id: 12,
    name: "Golden Anniversary",
    description: "Luxurious golden-themed arrangement for special anniversaries.",
    price: "₴980",
    priceValue: 980,
    image: "/placeholder.svg",
    categoryId: 3,
    tags: [1, 6, 9]
  }
]; 