import HomeClient from "@/components/client/home-client";

export default function HomePage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  return <HomeClient />;
} 