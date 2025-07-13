import ClientCategoryEditPage from '@/components/admin/categories/EditCategoryPage';

export default async function EditCategoryPage({ params }: { params: { id: string; locale: string } }) {
  const { id, locale } = params;
  return <ClientCategoryEditPage id={id} locale={locale} />;
} 