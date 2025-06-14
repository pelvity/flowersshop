import { FlowerRepository, Flower } from "@/lib/supabase";
import CustomBouquetClient from "@/components/client/custom-bouquet-client";

// Define extended flower type with colors
interface FlowerWithColors extends Flower {
  colors: string[];
}

export default async function CustomBouquetPage() {
  // Fetch flowers from Supabase
  const flowers = await FlowerRepository.getAll();
  
  // Add colors to flowers for compatibility with the client component
  const flowersWithColors = flowers.map(flower => {
    // Check if flower has colors property, if not add default colors
    const existingColors = (flower as any).colors;
    return {
      ...flower,
      colors: existingColors || ['red', 'pink', 'white', 'yellow', 'mixed'] // Default colors if not specified
    };
  }) as FlowerWithColors[];
  
  return <CustomBouquetClient initialFlowers={flowersWithColors} />;
} 