import CatalogClient from "@/components/client/catalog-client";
import { Bouquet } from "@/lib/supabase";
import { fetchBouquets, fetchCategories, fetchTags, fetchFlowers } from "@/lib/api-client";

export default async function CatalogPage() {
  console.log(`[CATALOG] Fetching data for catalog page`);
  
  // Fetch data from API endpoints (which use Redis caching internally)
  const [bouquets, categories, tags, flowers] = await Promise.all([
    fetchBouquets({ withFlowers: true }),
    fetchCategories(),
    fetchTags(),
    fetchFlowers({ includeColors: false })
  ]);
  
  console.log(`[CATALOG] Fetched ${bouquets.length} bouquets, ${categories.length} categories, ${tags.length} tags, and ${flowers.length} flowers`);
  
  return (
    <CatalogClient 
      initialBouquets={bouquets} 
      initialCategories={categories} 
      initialTags={tags}
      initialFlowers={flowers}
    />
  );
} 