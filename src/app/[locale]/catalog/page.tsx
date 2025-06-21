import CatalogClient from "@/components/client/catalog-client";
import { TagRepository, CategoryRepository, BouquetRepository } from "@/lib/supabase";
import { FlowerRepository } from "@/lib/repositories/flower-repository";

export default async function CatalogPage() {
  // Fetch data from Supabase with flowers information
  const bouquets = await BouquetRepository.getAllWithFlowers();
  const categories = await CategoryRepository.getAll();
  const tags = await TagRepository.getAll();
  
  // Get all flowers for filtering
  const flowerRepo = new FlowerRepository();
  const flowers = await flowerRepo.getAll({ includeColors: false });
  
  return (
        <CatalogClient 
          initialBouquets={bouquets} 
          initialCategories={categories} 
          initialTags={tags}
          initialFlowers={flowers}
        />
  );
} 