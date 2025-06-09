import ClientFlowerEditPage from '@/components/admin/flowers/EditFlowerPage';

export default async function EditFlowerPage({ params }: { params: { id: string; locale: string } }) {
  const { id, locale } = await params;
  return <ClientFlowerEditPage id={id} locale={locale} />;
} 