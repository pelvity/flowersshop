import Header from "@/components/header";
import Footer from "@/components/footer";
import CategoryPageClient from "@/components/client/category-page-client";

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main>
        <CategoryPageClient />
      </main>
      <Footer />
    </>
  );
} 