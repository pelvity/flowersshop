import ClientFlowersAdminPage from '@/components/admin/flowers/FlowersPage';

export default async function FlowersAdminPage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  return <ClientFlowersAdminPage locale={locale} />;
} 