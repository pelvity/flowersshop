'use client';

import { Container, Section, Card } from "../ui";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";

// This would typically come from a database or API
const products = [
  {
    id: 1,
    name: "Rose Elegance",
    description: "Beautiful arrangement of fresh roses in a stylish vase.",
    price: "₴650",
    image: "/placeholder.svg",
    category: "Roses"
  },
  {
    id: 2,
    name: "Spring Joy",
    description: "Colorful mix of spring flowers to brighten any room.",
    price: "₴750",
    image: "/placeholder.svg",
    category: "Mixed"
  },
  {
    id: 3,
    name: "Romantic Sunset",
    description: "Red and pink roses with decorative elements.",
    price: "₴850",
    image: "/placeholder.svg",
    category: "Roses"
  },
  {
    id: 4,
    name: "White Dreams",
    description: "Elegant white flowers for special occasions.",
    price: "₴700",
    image: "/placeholder.svg",
    category: "Wedding"
  },
  {
    id: 5,
    name: "Summer Breeze",
    description: "Bright and cheerful arrangement with sunflowers.",
    price: "₴600",
    image: "/placeholder.svg",
    category: "Seasonal"
  },
  {
    id: 6,
    name: "Purple Passion",
    description: "Elegant arrangement with purple and lavender flowers.",
    price: "₴720",
    image: "/placeholder.svg",
    category: "Mixed"
  },
  {
    id: 7,
    name: "Birthday Surprise",
    description: "Colorful mix perfect for birthday celebrations.",
    price: "₴680",
    image: "/placeholder.svg",
    category: "Occasions"
  },
  {
    id: 8,
    name: "Gentle Touch",
    description: "Soft pastel colors in a delicate arrangement.",
    price: "₴590",
    image: "/placeholder.svg",
    category: "Mixed"
  },
];

export default function CatalogClient() {
  const { t } = useLanguage();
  
  return (
    <Section>
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('ourCollection')}</h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            {t('browseSelection')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
              <div className="relative">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  width={400} 
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                  {product.category}
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-2 text-base text-gray-500">{product.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-medium text-pink-600">{product.price}</span>
                  <button className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm">
                    {t('addToCart')}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
} 