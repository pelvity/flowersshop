'use client';

import { Button } from "./ui";
import { useLanguage } from "@/context/language-context";

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t('contactTitle')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            {t('contactDescription')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="bg-white p-8 shadow-sm border rounded-lg">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('name')}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="block w-full rounded-md border-gray-300 shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500"
                    placeholder={t('yourName')}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('email')}
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="block w-full rounded-md border-gray-300 shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500"
                    placeholder={t('yourEmail')}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t('phone')}
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="block w-full rounded-md border-gray-300 shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500"
                    placeholder={t('yourPhone')}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  {t('message')}
                </label>
                <div className="mt-1">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500"
                    placeholder={t('howCanWeHelp')}
                  />
                </div>
              </div>
              
              <div>
                <Button type="submit" className="w-full">
                  {t('sendMessage')}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Map and Info */}
          <div>
            {/* Google Map Placeholder */}
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center p-4">
                <p className="text-gray-500">{t('googleMap')}</p>
                <p className="text-xs text-gray-400 mt-2">{t('mapApiNote')}</p>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="bg-white p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('contactInformation')}</h3>
              
              <div className="space-y-4">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-700">123 Flower Street, Kyiv, Ukraine</span>
                </div>
                
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">info@flowerparadise.com</span>
                </div>
                
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">+380 12 345 6789</span>
                </div>
                
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-gray-700">
                    <p className="font-semibold">{t('workingHours')}</p>
                    <p>{t('weekdays')}</p>
                    <p>{t('weekends')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 