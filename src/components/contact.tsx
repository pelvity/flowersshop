'use client';

import { Button } from "./ui";
import { useTranslations } from 'next-intl';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sendEmail } from "@/utils/send-email";

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default function Contact() {
  const t = useTranslations();
  const commonT = useTranslations('common');
  const contactT = useTranslations('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    status: 'success' | 'error' | 'idle';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<FormData>();
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus({ status: 'idle', message: '' });
    
    try {
      const result = await sendEmail(data);
      
      if (result.success) {
        setSubmitStatus({
          status: 'success',
          message: commonT('emailSent')
        });
        reset(); // Reset form fields on success
      } else {
        setSubmitStatus({
          status: 'error',
          message: result.error || commonT('emailError')
        });
      }
    } catch (error) {
      setSubmitStatus({
        status: 'error',
        message: commonT('emailError')
      });
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
      // Auto-clear success message after 5 seconds
      if (submitStatus.status === 'success') {
        setTimeout(() => {
          setSubmitStatus({ status: 'idle', message: '' });
        }, 5000);
      }
    }
  };
  
  return (
    <section id="contact-section" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {contactT('contactTitle')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            {contactT('contactDescription')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="bg-white p-8 shadow-sm border rounded-lg">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Status Messages */}
              {submitStatus.status === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                  {submitStatus.message}
                </div>
              )}
              {submitStatus.status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {submitStatus.message}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {commonT('name')} *
                </label>
                <div className="mt-1">
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    id="name"
                    className={`block w-full rounded-md shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={commonT('yourName')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{commonT('nameRequired')}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {commonT('contactEmail')} *
                </label>
                <div className="mt-1">
                  <input
                    {...register("email", { 
                      required: true,
                      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
                    })}
                    type="email"
                    id="email"
                    className={`block w-full rounded-md shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={commonT('yourEmail')}
                  />
                  {errors.email?.type === 'required' && (
                    <p className="mt-1 text-sm text-red-600">{commonT('emailRequired')}</p>
                  )}
                  {errors.email?.type === 'pattern' && (
                    <p className="mt-1 text-sm text-red-600">{commonT('emailInvalid')}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {commonT('phone')}
                </label>
                <div className="mt-1">
                  <input
                    {...register("phone")}
                    type="tel"
                    id="phone"
                    className="block w-full rounded-md border-gray-300 shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500"
                    placeholder={commonT('yourPhone')}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  {commonT('message')} *
                </label>
                <div className="mt-1">
                  <textarea
                    {...register("message", { required: true })}
                    id="message"
                    rows={4}
                    className={`block w-full rounded-md shadow-sm py-3 px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.message ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={commonT('howCanWeHelp')}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{commonT('messageRequired')}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? commonT('sending') : commonT('sendMessage')}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Map and Info */}
          <div>
            {/* Google Map Placeholder */}
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center p-4">
                <p className="text-gray-500">{contactT('googleMap')}</p>
                <p className="text-xs text-gray-400 mt-2">{contactT('mapApiNote')}</p>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="bg-white p-6 border rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{contactT('contactInformation')}</h3>
              
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
                    <p className="font-semibold">{commonT('workingHours')}</p>
                    <p>{commonT('weekdays')}</p>
                    <p>{commonT('weekends')}</p>
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
