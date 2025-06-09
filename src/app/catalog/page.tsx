import Header from "@/components/header";
import Footer from "@/components/footer";
import { Container, Section } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { catalogRepository } from "@/lib/repositories/catalog";

export default async function CatalogPage() {
  // Get data from Supabase
  const [categories, featuredBouquets] = await Promise.all([
    catalogRepository.getCategories(),
    catalogRepository.getFeaturedBouquets(),
  ]);

  return (
    <>
      <Header />
      <main>
        <Section className="bg-gradient-to-b from-pink-50 to-white">
          <Container>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-extrabold text-pink-700 mb-4">Our Collection</h1>
              <p className="text-xl text-pink-400 max-w-3xl mx-auto">
                Browse our beautiful selection of flowers and bouquets
              </p>
            </div>

            {/* Featured Products */}
            {featuredBouquets.length > 0 && (
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-pink-600 mb-6">Featured Bouquets</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredBouquets.map((bouquet) => (
                    <div key={bouquet.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-pink-100">
                      <div className="relative h-64">
                        <Image
                          src={bouquet.image || '/placeholder-bouquet.jpg'}
                          alt={bouquet.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-medium text-pink-700">{bouquet.name}</h3>
                        <p className="text-gray-600 mt-2 line-clamp-3">{bouquet.description}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xl font-medium text-amber-600">
                            ${bouquet.discount_price || bouquet.price}
                          </span>
                          <Link
                            href={`/bouquet/${bouquet.id}`}
                            className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-4 py-2 rounded-md text-sm shadow-sm transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Browse by Category */}
            <div>
              <h2 className="text-2xl font-bold text-pink-600 mb-6">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    href={`/catalog/category/${category.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-pink-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-medium text-pink-700">{category.name}</h3>
                      <p className="text-gray-600 mt-2">{category.description}</p>
                      <div className="mt-4 text-pink-500">Browse Category →</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
} 