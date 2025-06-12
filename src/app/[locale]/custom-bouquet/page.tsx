import Header from "@/components/header";
import Footer from "@/components/footer";
import { FlowerRepository } from "@/lib/supabase";
import CustomBouquetClient from "@/components/client/custom-bouquet-client";

export default async function CustomBouquetPage() {
  // Fetch flowers from Supabase
  const flowers = await FlowerRepository.getAll();
  
  // Add colors to flowers for compatibility with the client component
  const flowersWithColors = flowers.map(flower => ({
    ...flower,
    colors: (flower as any).colors || ['red', 'pink', 'white', 'yellow', 'mixed'] // Default colors if not specified
  }));
  
  return (
    <>
      <Header />
      <main>
        <CustomBouquetClient initialFlowers={flowersWithColors} />
      </main>
      <Footer />
    </>
  );
} 