import AboutClient from "@/components/client/about-client";

export default function AboutPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  return <AboutClient />;
} 