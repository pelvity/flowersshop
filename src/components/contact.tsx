'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { getStoreSettings } from "@/lib/store-settings";
import SocialMediaLinks from './common/SocialMediaLinks';
import { FormField, FormButton, StatusMessage } from '@/components/ui/form';
import { User, Mail, Phone, MessageSquare, Send, AlertCircle, Check } from "lucide-react";
import { formatPhoneNumber, sanitizePhoneInput, validatePhone, validateEmail } from '@/lib/form-utils';
import { sendEmail } from "@/utils/send-email";

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
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Sanitize the phone input to allow only digits, +, -, spaces, and parentheses
    const sanitized = sanitizePhoneInput(e.target.value);
    setFormData(prev => ({ ...prev, phone: sanitized }));
    
    // Clear error when field is edited
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };
  
  // Form validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;
    
    // Name validation
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = formData.name.trim() ? commonT('nameMinLength') : commonT('nameRequired');
      isValid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = commonT('emailRequired');
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = commonT('emailInvalid');
      isValid = false;
    }
    
    // Phone validation (optional but validate if provided)
    if (formData.phone.trim() && !validatePhone(formData.phone)) {
      newErrors.phone = commonT('phoneInvalid');
      isValid = false;
    }
    
    // Message validation
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = formData.message.trim() ? commonT('messageMinLength') : commonT('messageRequired');
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle successful submission separately
  const handleSubmitSuccess = () => {
    setTimeout(() => {
      setIsSuccess(false);
      setErrors({});
    }, 5000);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await sendEmail(formData);
      
      if (result.success) {
        setIsSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
        handleSubmitSuccess();
      } else {
        setErrors({
          general: result.error || commonT('emailError')
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({
        general: commonT('emailError')
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
            
            {/* Status Messages */}
            <StatusMessage 
              type={errors.general ? 'error' : isSuccess ? 'success' : 'idle'}
              message={errors.general || (isSuccess ? commonT('emailSent') : '')}
              className="mb-6"
            />
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" noValidate>
              <FormField
                id="name"
                name="name"
                type="text"
                label={commonT('name')}
                required
                placeholder={commonT('yourName')}
                icon={User}
                value={formData.name}
                onChange={handleChange}
                errorMessage={errors.name}
                autoComplete="name"
              />
              
              <FormField
                id="email"
                name="email"
                type="email"
                label={commonT('contactEmail')}
                required
                placeholder={commonT('yourEmail')}
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                errorMessage={errors.email}
                autoComplete="email"
              />
              
              <FormField
                id="phone"
                name="phone"
                type="tel"
                label={commonT('phone')}
                placeholder={commonT('yourPhone')}
                icon={Phone}
                value={formData.phone}
                onChange={handlePhoneChange}
                errorMessage={errors.phone}
                autoComplete="tel"
              />
              
              <FormField
                id="message"
                name="message"
                type="textarea"
                label={commonT('message')}
                required
                placeholder={commonT('howCanWeHelp')}
                icon={MessageSquare}
                value={formData.message}
                onChange={handleChange}
                errorMessage={errors.message}
                rows={4}
              />
              
              <div className="pt-2">
                <FormButton
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  loadingText={commonT('sending')}
                  icon={isSuccess ? Check : Send}
                  className="w-full"
                >
                  {isSuccess ? commonT('messageSent') : commonT('send')}
                </FormButton>
              </div>
            </form>
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
