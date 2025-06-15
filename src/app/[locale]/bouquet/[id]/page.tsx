import { notFound } from "next/navigation";
import { catalogRepository } from "@/lib/repositories/catalog";
import BouquetClientPage from "@/components/bouquets/bouquet-client-page";

export default async function BouquetPage({ 
  params 
}: { 
  params: Promise<{ locale: string, id: string }> 
}) {
  const { id, locale } = await params;

  try {
    const bouquet = await catalogRepository.getBouquetById(id);

    if (!bouquet) {
      notFound();
    }

    let category = null;
    if (bouquet.category_id) {
      category = await catalogRepository.getCategoryById(bouquet.category_id);
    }

    return (
      <BouquetClientPage 
        initialBouquet={bouquet}
        initialCategory={category}
        id={id}
        locale={locale}
      />
    );
  } catch (error) {
    console.error('Error loading bouquet:', error);
    notFound();
  }
}
