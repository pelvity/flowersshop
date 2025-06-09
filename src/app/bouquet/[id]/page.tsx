import Header from "@/components/header";
import Footer from "@/components/footer";
import { Container, Section } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogRepository } from "@/lib/repositories/catalog";
import AddToCartButton from "@/components/client/add-to-cart-button";

interface BouquetPageProps {
  params: {
    id: string;
  };
}

export default async function BouquetPage({ params }: BouquetPageProps) {
  const { id } = params;
  
  try {
    // Get data from Supabase
    const bouquet = await catalogRepository.getBouquetById(id);

    if (!bouquet) {
      notFound();
    }

    // Get the category if it exists
    let category = null;
    if (bouquet.category_id) {
      category = await catalogRepository.getCategoryById(bouquet.category_id);
    }

    return (
      <>
        <Header />
        <main>
          <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
            <Container>
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-pink-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative h-96 md:h-full">
                    <Image
                      src={bouquet.image || '/placeholder-bouquet.jpg'}
                      alt={bouquet.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <div className="mb-6">
                      {category && (
                        <Link 
                          href={`/catalog/category/${category.id}`}
                          className="inline-block bg-pink-50 text-pink-600 text-sm px-3 py-1 rounded-full mb-3"
                        >
                          {category.name}
                        </Link>
                      )}
                      <h1 className="text-3xl font-bold text-pink-700">{bouquet.name}</h1>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-gray-700">{bouquet.description}</p>
                    </div>
                    
                    {bouquet.tags && bouquet.tags.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {bouquet.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="inline-block bg-pink-50 text-pink-600 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Price</h3>
                      <div className="flex items-center">
                        {bouquet.discount_price ? (
                          <>
                            <span className="text-2xl font-bold text-amber-600">${bouquet.discount_price}</span>
                            <span className="ml-2 text-lg text-gray-400 line-through">${bouquet.price}</span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-amber-600">${bouquet.price}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Availability</h3>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${bouquet.in_stock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={bouquet.in_stock ? 'text-green-600' : 'text-red-600'}>
                          {bouquet.in_stock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <AddToCartButton 
                        bouquetId={id} 
                        available={bouquet.in_stock}
                        price={bouquet.discount_price || bouquet.price}
                        name={bouquet.name}
                        image={bouquet.image || '/placeholder-bouquet.jpg'}
                      />
                      <Link
                        href="/catalog"
                        className="inline-block text-center bg-white hover:bg-pink-50 text-pink-600 border border-pink-200 px-6 py-3 rounded-md shadow-sm transition-colors"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </Section>
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Error loading bouquet page:', error);
    notFound();
  }
} 