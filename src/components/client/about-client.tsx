'use client';

import { Container, Section } from "../ui";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";

export default function AboutClient() {
  const { t } = useLanguage();
  
  return (
    <Section className="bg-white">
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('aboutTitle')}</h1>
          <p className="text-xl text-gray-500">
            {t('aboutDescription')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('ourStory')}</h2>
            <p className="text-gray-600 mb-4">
              {t('storyPart1')}
            </p>
            <p className="text-gray-600 mb-4">
              {t('storyPart2')}
            </p>
            <p className="text-gray-600">
              {t('storyPart3')}
            </p>
          </div>
          <div className="bg-pink-100 rounded-lg p-6 flex items-center justify-center h-80">
            <p className="text-gray-500 text-center">Shop image placeholder</p>
          </div>
        </div>
        
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('ourValues')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('quality')}</h3>
              <p className="text-gray-600">{t('qualityDesc')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('passion')}</h3>
              <p className="text-gray-600">{t('passionDesc')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('service')}</h3>
              <p className="text-gray-600">{t('serviceDesc')}</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('meetTeam')}</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="text-center">
                <div className="w-40 h-40 bg-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <p className="text-gray-500">Team member photo</p>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t('teamMember')} {item}</h3>
                <p className="text-gray-600">{t('floralDesigner')}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
} 