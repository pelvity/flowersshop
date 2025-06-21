import { Suspense } from 'react';
import { BouquetRepository, FlowerRepository, CategoryRepository } from '@/lib/supabase';
import DashboardClient from '@/components/admin/DashboardClient';

export default async function Dashboard({ params }: { params: { locale: string } }) {
  // Get locale safely by awaiting params
  const { locale } = await params;
  
  // Fetch bouquets, flowers, and categories in parallel
  const [bouquets, flowers, categories] = await Promise.all([
    BouquetRepository.getAll(),
    FlowerRepository.getAll(),
    CategoryRepository.getAll()
  ]);
  
  // Calculate low stock flowers
  const lowStock = flowers.filter(flower => 
    flower.in_stock <= flower.low_stock_threshold
  );
  
  // Prepare initial stats
  const initialStats = {
    totalBouquets: bouquets.length,
    totalFlowers: flowers.length,
    lowStockFlowers: lowStock.length,
    totalCategories: categories.length,
    totalFeaturedBouquets: bouquets.filter(b => b.featured).length,
    totalInStockBouquets: bouquets.filter(b => b.in_stock).length
  };
  
  // Prepare featured bouquets
  const initialFeaturedBouquets = bouquets.filter(bouquet => bouquet.featured).slice(0, 5);
  
  // Prepare low stock flowers
  const initialLowStockFlowers = lowStock.slice(0, 5);
  
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient 
        locale={locale}
        initialStats={initialStats}
        initialFeaturedBouquets={initialFeaturedBouquets}
        initialLowStockFlowers={initialLowStockFlowers}
      />
    </Suspense>
  );
}

function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        <p className="mt-4 text-pink-700">Loading dashboard...</p>
      </div>
    </div>
  );
} 