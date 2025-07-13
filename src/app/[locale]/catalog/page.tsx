import { cookies } from 'next/headers';
import { fetchBouquets, fetchCategories, fetchTags, fetchFlowers } from "@/lib/api-client";
import CatalogClient from "@/components/client/catalog-client";

export default async function CatalogPage() {
  console.log(`[CATALOG] Fetching data for catalog page`);
  
  const headers = {
    'Cookie': cookies().toString(),
  };
  
  // Fetch data from API endpoints (which use Redis caching internally)
  const [bouquets, categories, tags, flowers] = await Promise.all([
    fetchBouquets({ withFlowers: true }, headers),
    fetchCategories(headers),
    fetchTags(headers),
    fetchFlowers({ includeColors: false }, headers)
  ]);
  
  console.log(`[CATALOG] Fetched ${bouquets.length} bouquets, ${categories.length} categories, ${tags.length} tags, and ${flowers.length} flowers`);
  
  return (
    <CatalogClient 
      initialBouquets={bouquets} 
      initialCategories={categories} 
      initialTags={tags}
      initialFlowers={flowers}
      showCategoriesAsCards={true} // New prop to display categories as cards
    />
  );
} 