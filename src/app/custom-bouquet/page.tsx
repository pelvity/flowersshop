import Header from "@/components/header";
import Footer from "@/components/footer";
import { getFlowers } from "@/lib/supabase";
import CustomBouquetClient from "@/components/client/custom-bouquet-client";

export default async function CustomBouquetPage() {
  // Fetch flowers from Supabase
  const flowers = await getFlowers();
  
  return (
    <>
      <Header />
      <main>
        <CustomBouquetClient initialFlowers={flowers} />
      </main>
      <Footer />
    </>
  );
} 