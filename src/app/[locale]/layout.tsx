import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import I18nProvider from "@/providers/i18n-provider";
import { getMessages } from '@/utils/get-messages';
import { LanguageProvider } from "@/context/language-context";
import { CartProvider } from "@/context/cart-context";
import CartDrawer from "@/components/cart/cart-drawer";
import { headers } from 'next/headers';

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  // Get locale safely by awaiting params
  const { locale } = await params;
  
  return {
    title: "Flower Paradise - Fresh Flowers & Bouquets",
    description: "Beautiful flowers for every occasion. Fresh, high-quality blooms delivered with care and love.",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Force Next.js to treat this as a dynamic parameter
  const headersList = headers();
  
  // Ensure params.locale is properly awaited
  const { locale } = await params;
  
  // Get messages for the current locale
  const messages = await getMessages(locale);

  return (
    <>
      <I18nProvider locale={locale} messages={messages}>
        <LanguageProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </LanguageProvider>
      </I18nProvider>
    </>
  );
} 