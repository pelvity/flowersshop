import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { CartProvider } from "@/context/cart-context";
import CartDrawer from "@/components/cart/cart-drawer";
import Header from "@/components/header";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
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
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  try {
  const { locale } = await params;
    console.log(`[LAYOUT] Locale from params: ${locale}`);
  
    const messages = await getMessages({ locale });
    console.log(`[LAYOUT] Messages loaded successfully for locale '${locale}', keys:`, Object.keys(messages));

    console.log(`[LAYOUT] Rendering layout with locale: ${locale}`);
  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            <CartDrawer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
  } catch (error) {
    console.error(`[LAYOUT] Error rendering layout:`, error);
    throw error;
  }
} 