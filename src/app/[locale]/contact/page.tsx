import ContactClient from "@/components/client/contact-client";

export default async function ContactPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  return (
    <main>
      <ContactClient />
    </main>
  );
} 