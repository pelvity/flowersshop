import ClientCreateFlowerPage from '@/components/admin/flowers/CreateFlowerPage';

export default async function CreateFlowerPage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  return <ClientCreateFlowerPage locale={locale} />;
} 