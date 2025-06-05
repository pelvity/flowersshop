'use client';

import { Card } from "./ui";
import Image from 'next/image';
import { useLanguage } from "@/context/language-context";

const products = [
  {
    id: 1,
    name: "Rose Elegance",
    description: "Beautiful arrangement of fresh roses in a stylish vase.",
    price: "₴650",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Spring Joy",
    description: "Colorful mix of spring flowers to brighten any room.",
    price: "₴750",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Romantic Sunset",
    description: "Red and pink roses with decorative elements.",
    price: "₴850",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    name: "White Dreams",
    description: "Elegant white flowers for special occasions.",
    price: "₴700",
    image: "/placeholder.svg",
  },
];

export default function FeaturedProducts() {
  const { t } = useLanguage();
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t('featuredArrangements')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            {t('discoverPopular')}
          </p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
              <div className="flex-shrink-0">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  width={400} 
                  height={300}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-2 text-base text-gray-500">{product.description}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-medium text-pink-600">{product.price}</span>
                  <button className="text-pink-600 hover:text-pink-800 font-medium">
                    {t('viewDetails')}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 