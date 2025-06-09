import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/providers/i18n-provider";
import { getMessages } from '@/utils/get-messages';
import { LanguageProvider } from "@/context/language-context";
import { CartProvider } from "@/context/cart-context";
import CartDrawer from "@/components/cart/cart-drawer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Flower Paradise - Fresh Flowers & Bouquets",
  description: "Beautiful flowers for every occasion. Fresh, high-quality blooms delivered with care and love.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale?: string };
}>) {
  // Get the current locale and messages
  const locale = params.locale || 'en';
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <I18nProvider locale={locale} messages={messages}>
        <LanguageProvider>
          <CartProvider>
        {children}
            <CartDrawer />
          </CartProvider>
        </LanguageProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
