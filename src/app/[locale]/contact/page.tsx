import ContactClient from "@/components/client/contact-client";

export default function ContactPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  return <ContactClient />;
} 