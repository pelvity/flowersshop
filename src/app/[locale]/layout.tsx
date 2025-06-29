import type { Metadata } from "next";
import { Inter, Dancing_Script } from "next/font/google";
import "@/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { CartProvider } from "@/context/cart-context";
import CartDrawer from "@/components/cart/cart-drawer";
import MainLayout from "@/components/layout/MainLayout";
import { ApiCacheProvider } from "@/providers/api-cache-provider";

const inter = Inter({ subsets: ["latin"] });

// Initialize Dancing Script font
const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dancing",
});

export async function generateMetadata({ 
  params
}: { 
  params: Promise<{ locale: string }> 
}): Promise<Metadata> {
  // Get locale safely by awaiting params
  const { locale } = await params;
  console.log(`[METADATA] Generating metadata for locale: ${locale}`);

  return {
    title: "Flower Paradise - Fresh Flowers & Bouquets",
    description: "Beautiful flowers for every occasion. Fresh, high-quality blooms delivered with care and love.",
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  try {
    console.log(`[LAYOUT] Locale from params: ${locale}`);
  
    const messages = await getMessages({ locale });
    console.log(`[LAYOUT] Messages loaded successfully for locale '${locale}', keys:`, Object.keys(messages));

    console.log(`[LAYOUT] Rendering layout with locale: ${locale}`);
  return (
    <html lang={locale} className={`${dancingScript.variable}`}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ApiCacheProvider>
            <CartProvider>
              <MainLayout>
                {children}
              </MainLayout>
              <CartDrawer />
            </CartProvider>
          </ApiCacheProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
  } catch (error) {
    console.error(`[LAYOUT] Error rendering layout:`, error);
    throw error;
  }
} 