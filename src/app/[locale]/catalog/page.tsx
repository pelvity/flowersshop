import Header from "@/components/header";
import Footer from "@/components/footer";
import CatalogClient from "@/components/client/catalog-client";

export default function CatalogPage() {
  return (
    <>
      <Header />
      <main>
        <CatalogClient />
      </main>
      <Footer />
    </>
  );
} 