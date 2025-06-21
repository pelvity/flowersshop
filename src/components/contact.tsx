'use client';

import { Button } from "./ui";
import { useTranslations } from 'next-intl';
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { sendEmail } from "@/utils/send-email";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

type FormData = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '0.5rem',
};

// Kyiv coordinates (matching the address in the footer)
const defaultCenter = {
  lat: 50.450001,
  lng: 30.523333
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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<FormData>();
  
  // Store the map instance when the map loads
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);
  
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
  
  // Get the address from the translations
  const storeAddress = commonT('footer.address');
  
  return (
    <section id="contact-section" className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {contactT('contactTitle')}
          </h2>
          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-500">
            {contactT('contactDescription')}
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="bg-white p-4 sm:p-8 shadow-sm border rounded-lg">
            {/* Social Media Section - Highlighted */}
            <div className="mb-6 p-3 sm:p-4 bg-pink-50 rounded-lg border border-pink-200">
              <h4 className="font-medium text-pink-700 mb-2 sm:mb-3">{contactT('preferredContactMethods')}</h4>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-3 sm:mb-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-pink-600">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                  <span>Facebook</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-pink-600">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772a4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 italic">{contactT('fastestResponse')}</p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">{contactT('orderFormContact')}</p>
            </div>
        
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Status Messages */}
              {submitStatus.status === 'success' && (
                <div className="p-2 sm:p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
                  {submitStatus.message}
                </div>
              )}
              {submitStatus.status === 'error' && (
                <div className="p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
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
                    className={`block w-full rounded-md shadow-sm py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={commonT('yourName')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{commonT('nameRequired')}</p>
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
                    className={`block w-full rounded-md shadow-sm py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={commonT('yourEmail')}
                  />
                  {errors.email?.type === 'required' && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{commonT('emailRequired')}</p>
                  )}
                  {errors.email?.type === 'pattern' && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{commonT('emailInvalid')}</p>
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
                    className="block w-full rounded-md border-gray-300 shadow-sm py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500"
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
                    className={`block w-full rounded-md shadow-sm py-2 sm:py-3 px-3 sm:px-4 placeholder-gray-400 focus:ring-pink-500 focus:border-pink-500 ${
                      errors.message ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={commonT('howCanWeHelp')}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{commonT('messageRequired')}</p>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? commonT('sending') : commonT('send')}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Map */}
          <div className="bg-white p-4 sm:p-8 shadow-sm border rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-pink-800">{contactT('visitUs')}</h3>
            <p className="mb-4 text-gray-600">{storeAddress}</p>
            
            <div className="h-[250px] sm:h-[350px] rounded-lg overflow-hidden">
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={15}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                >
                  <Marker position={defaultCenter} title="Flower Paradise" />
                </GoogleMap>
              </LoadScript>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
