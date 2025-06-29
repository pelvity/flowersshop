'use client';

import { Section, Container } from "@/components/ui";
import { useTranslations, useLocale } from 'next-intl';
import Link from "next/link";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function OrderSuccessPage() {
  const t = useTranslations('checkout');
  const currentLocale = useLocale();
  
  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white py-12">
      <Container>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-white rounded-lg shadow-md border border-pink-100 p-8 max-w-md mx-auto">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-pink-700 mb-4">
              {t('orderSuccess')}
            </h1>
            
            <p className="text-gray-600 mb-8">
              {t('orderSuccessDescription')}
            </p>
            
            <Link 
              href={`/${currentLocale}/catalog`} 
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
} 