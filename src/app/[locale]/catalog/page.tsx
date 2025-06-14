import CatalogClient from "@/components/client/catalog-client";
import { TagRepository, CategoryRepository, BouquetRepository } from "@/lib/supabase";

export default async function CatalogPage() {
  // Fetch data from Supabase
  const bouquets = await BouquetRepository.getAll();
  const categories = await CategoryRepository.getAll();
  const tags = await TagRepository.getAll();
  
  return (
        <CatalogClient 
          initialBouquets={bouquets} 
          initialCategories={categories} 
          initialTags={tags} 
        />
  );
} 