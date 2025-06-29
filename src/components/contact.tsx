'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getStoreSettings } from "@/lib/store-settings";
import ContactForm from './common/ContactForm';
import SocialMediaLinks from './common/SocialMediaLinks';

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
  const contactT = useTranslations('contact');
  const commonT = useTranslations('common');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [storeAddress, setStoreAddress] = useState<string>(commonT('footer.address'));
  const [storePhone, setStorePhone] = useState<string>('');
  const [storeEmail, setStoreEmail] = useState<string>('');
  
  // Store the map instance when the map loads
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);
  
  // Fetch store settings
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const settings = await getStoreSettings();
        if (settings.store_address) {
          setStoreAddress(settings.store_address);
        }
        if (settings.store_phone) {
          setStorePhone(settings.store_phone);
        }
        if (settings.store_email) {
          setStoreEmail(settings.store_email);
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
      }
    };
    
    fetchStoreSettings();
  }, []);
  
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
              <SocialMediaLinks 
                className="mb-3 sm:mb-4" 
                iconSize={20} 
                iconClassName="text-pink-600 hover:text-pink-800 transition-colors"
                showLabels={true}
              />
              <p className="text-xs sm:text-sm text-gray-600 italic">{contactT('fastestResponse')}</p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">{contactT('orderFormContact')}</p>
            </div>
        
            <ContactForm />
          </div>
          
          {/* Map */}
          <div className="bg-white p-4 sm:p-8 shadow-sm border rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-pink-800">{contactT('visitUs')}</h3>
            <p className="mb-2 text-gray-600">{storeAddress}</p>
            {storePhone && (
              <p className="mb-2 text-gray-600">
                <span className="font-medium">Tel:</span> {storePhone}
              </p>
            )}
            {storeEmail && (
              <p className="mb-4 text-gray-600">
                <span className="font-medium">Email:</span> {storeEmail}
              </p>
            )}
            
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
