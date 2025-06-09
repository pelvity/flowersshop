import Link from 'next/link';
import { Locale } from '../../../../config/i18n';
import { catalogRepository } from '@/lib/repositories/catalog';

interface CategoriesPageProps {
  params: {
    locale: Locale;
  };
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = params;
  
  // Fetch categories with translations
  const categories = await catalogRepository.getCategories(locale);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Categories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link 
            href={`/${locale}/bouquets/category/${category.id}`} 
            key={category.id}
            className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 