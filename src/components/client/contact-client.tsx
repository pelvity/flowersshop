'use client';

import { Container, Section } from "../ui";
import { useLanguage } from "@/context/language-context";
import Contact from "../contact";

export default function ContactClient() {
  const { t } = useLanguage();
  
  return (
    <>
      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('contactTitle')}</h1>
            <p className="text-xl text-gray-500">
              {t('contactDescription')}
            </p>
          </div>
        </Container>
      </Section>
      
      <Contact />
    </>
  );
} 