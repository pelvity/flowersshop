import ClientCategoryCreatePage from '@/components/admin/categories/CreateCategoryPage';

export default async function CreateCategoryPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return <ClientCategoryCreatePage locale={locale} />;
} 