import Header from "@/components/header";
import Footer from "@/components/footer";
import CustomBouquetClient from "@/components/client/custom-bouquet-client";

export default function CustomBouquetPage() {
  return (
    <>
      <Header />
      <main>
        <CustomBouquetClient />
      </main>
      <Footer />
    </>
  );
} 