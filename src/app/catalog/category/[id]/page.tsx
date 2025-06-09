import Header from "@/components/header";
import Footer from "@/components/footer";
import { Container, Section } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogRepository } from "@/lib/repositories/catalog";

interface CategoryPageProps {
  params: {
    id: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = params;
  
  try {
    // Get data from Supabase
    const [category, bouquets] = await Promise.all([
      catalogRepository.getCategoryById(id),
      catalogRepository.getBouquetsByCategory(id),
    ]);

    if (!category) {
      notFound();
    }

    return (
      <>
        <Header />
        <main>
          <Section className="bg-gradient-to-b from-pink-50 to-white">
            <Container>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-pink-700 mb-4">{category.name}</h1>
                <p className="text-xl text-pink-400 max-w-3xl mx-auto">
                  {category.description}
                </p>
              </div>

              {/* Bouquets Grid */}
              {bouquets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bouquets.map((bouquet) => (
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
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-pink-100 shadow-sm">
                  <p className="text-pink-400">No bouquets found in this category.</p>
                </div>
              )}

              <div className="mt-10 text-center">
                <Link 
                  href="/catalog" 
                  className="inline-block bg-white hover:bg-pink-50 text-pink-600 border border-pink-200 px-6 py-2 rounded-md shadow-sm transition-colors"
                >
                  ← Back to All Categories
                </Link>
              </div>
            </Container>
          </Section>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Error loading category page:', error);
    notFound();
  }
} 