'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Save, AlertCircle, Facebook, Instagram, Twitter, Youtube, Link, Info, MapPin } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface StoreSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
}

interface AddressComponents {
  street: string;
  building_number: string;
  city: string;
  postal_code: string;
  country: string;
}

export default function StoreSettingsPage() {
  const t = useTranslations('admin');
  const supabase = createClientComponentClient<Database>();
  const { user, isAuthenticated, isLoading: isAuthLoading, fetchWithAuth } = useAdminAuth();
  
  const [settings, setSettings] = useState<StoreSetting[]>([]);
  const [generalSettings, setGeneralSettings] = useState<StoreSetting[]>([]);
  const [socialSettings, setSocialSettings] = useState<StoreSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [addressError, setAddressError] = useState<string | null>(null);
  
  // Address form state
  const [addressComponents, setAddressComponents] = useState<AddressComponents>({
    street: '',
    building_number: '',
    city: '',
    postal_code: '',
    country: ''
  });
  
  // Field-specific errors
  const [addressFieldErrors, setAddressFieldErrors] = useState<{
    street?: string;
    building_number?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  }>({});

  // Basic address validation function
  const validateAddressComponents = (): boolean => {
    const errors: typeof addressFieldErrors = {};
    let isValid = true;
    
    if (!addressComponents.street.trim()) {
      errors.street = t('settings.streetRequired');
      isValid = false;
    }
    
    if (!addressComponents.building_number.trim()) {
      errors.building_number = t('settings.buildingNumberRequired');
      isValid = false;
    }
    
    if (!addressComponents.city.trim()) {
      errors.city = t('settings.cityRequired');
      isValid = false;
    }
    
    if (!addressComponents.postal_code.trim()) {
      errors.postal_code = t('settings.postalCodeRequired');
      isValid = false;
    }
    
    if (!addressComponents.country.trim()) {
      errors.country = t('settings.countryRequired');
      isValid = false;
    }
    
    setAddressFieldErrors(errors);
    return isValid;
  };
  
  // Format address components into a properly formatted address string
  const formatAddressFromComponents = (): string => {
    const { street, building_number, city, postal_code, country } = addressComponents;
    return `${street} ${building_number}, ${city}, ${postal_code}, ${country}`;
  };
  
  // Parse address string into components
  const parseAddressString = (addressString: string | null): AddressComponents => {
    if (!addressString) {
      return {
        street: '',
        building_number: '',
        city: '',
        postal_code: '',
        country: ''
      };
    }
    
    try {
      // Try to parse existing address in format "Street BuildingNumber, City, PostalCode, Country"
      const parts = addressString.split(',').map(part => part.trim());
      
      let street = '';
      let building_number = '';
      let city = '';
      let postal_code = '';
      let country = '';
      
      // First part might contain street and building number
      if (parts.length > 0) {
        const streetParts = parts[0].split(' ');
        // Assume the last part is the building number
        if (streetParts.length > 1) {
          building_number = streetParts.pop() || '';
          street = streetParts.join(' ');
        } else {
          street = parts[0];
        }
      }
      
      // Second part is usually city
      if (parts.length > 1) {
        city = parts[1];
      }
      
      // Third part is usually postal code
      if (parts.length > 2) {
        postal_code = parts[2];
      }
      
      // Fourth part is usually country
      if (parts.length > 3) {
        country = parts[3];
      }
      
      return {
        street,
        building_number,
        city,
        postal_code,
        country
      };
    } catch (error) {
      console.error('Error parsing address:', error);
      return {
        street: '',
        building_number: '',
        city: '',
        postal_code: '',
        country: ''
      };
    }
  };

  // Fetch store settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (isAuthLoading) return;
      
      if (!isAuthenticated) {
        return;
      }
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('store_settings')
          .select('*')
          .order('key');
          
        if (error) {
          throw error;
        }
        
        setSettings(data || []);
        
        // Separate social media settings from general settings
        const social = data?.filter(setting => setting.key.endsWith('_url')) || [];
        const general = data?.filter(setting => !setting.key.endsWith('_url')) || [];
        
        setSocialSettings(social);
        setGeneralSettings(general);
        
        // Parse the store address into components
        const addressSetting = data?.find(s => s.key === 'store_address');
        if (addressSetting) {
          setAddressComponents(parseAddressString(addressSetting.value));
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [supabase, isAuthenticated, isAuthLoading]);
  
  const handleChange = (id: string, value: string) => {
    // Update settings except for store_address which is handled separately
    const setting = settings.find(s => s.id === id);
    if (setting && setting.key === 'store_address') {
      return;
    }
    
    // Update both the combined settings and the specific category
    setSettings(prev => prev.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
    
    // Update in the appropriate category
    if (socialSettings.find(s => s.id === id)) {
      setSocialSettings(prev => prev.map(setting => 
        setting.id === id ? { ...setting, value } : setting
      ));
    } else {
      setGeneralSettings(prev => prev.map(setting => 
        setting.id === id ? { ...setting, value } : setting
      ));
    }
  };
  
  // Handle changes to address components
  const handleAddressComponentChange = (field: keyof AddressComponents, value: string) => {
    setAddressComponents(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific error
    if (addressFieldErrors[field]) {
      setAddressFieldErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
    
    // Clear general address error
    if (addressError) {
      setAddressError(null);
    }
    
    // Update the store_address setting with the formatted address
    const addressSetting = settings.find(s => s.key === 'store_address');
    if (addressSetting) {
      const formattedAddress = formatAddressFromComponents();
      setSettings(prev => prev.map(setting => 
        setting.key === 'store_address' ? { ...setting, value: formattedAddress } : setting
      ));
      
      setGeneralSettings(prev => prev.map(setting => 
        setting.key === 'store_address' ? { ...setting, value: formattedAddress } : setting
      ));
    }
  };
  
  // Get icon for social media input
  const getSocialIcon = (key: string) => {
    switch (key) {
      case 'facebook_url':
        return <Facebook size={18} />;
      case 'instagram_url':
        return <Instagram size={18} />;
      case 'twitter_url':
        return <Twitter size={18} />;
      case 'youtube_url':
        return <Youtube size={18} />;
      default:
        return <Link size={18} />;
    }
  };
  
  // Get friendly name from key
  const getSocialName = (key: string) => {
    const name = key.replace('_url', '');
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      setSaveStatus({ type: null, message: '' });
      
      // Validate address components
      if (!validateAddressComponents()) {
        setIsSaving(false);
        return;
      }
      
      // Format address from components
      const formattedAddress = formatAddressFromComponents();
      
      // Update the store_address setting with the formatted address
      const addressSetting = settings.find(s => s.key === 'store_address');
      if (addressSetting) {
        setSettings(prev => prev.map(setting => 
          setting.key === 'store_address' ? { ...setting, value: formattedAddress } : setting
        ));
      }
      
      console.log('Starting to save settings:', settings);
      
      // Update each setting directly with the REST API to ensure proper auth headers
      for (const setting of settings) {
        console.log('Updating setting:', setting);
        
        // Use the REST API with proper auth headers instead of the Supabase client
        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/store_settings?id=eq.${setting.id}`;
        const response = await fetchWithAuth(apiUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify({ 
            value: setting.value, 
            updated_at: new Date().toISOString() 
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', response.status, errorText);
          throw new Error(`Failed to update setting: ${response.status} ${errorText}`);
        }
        
        console.log('Setting updated successfully:', setting.key);
      }
      
      setSaveStatus({ 
        type: 'success', 
        message: t('settings.saveSuccess') || 'Settings saved successfully' 
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({ 
        type: 'error', 
        message: t('settings.saveError') || 'Failed to save settings. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Render an address input field with label and error message
  const renderAddressField = (
    field: keyof AddressComponents,
    label: string,
    placeholder: string,
    required: boolean = true
  ) => {
    return (
      <div className="mb-3">
        <label htmlFor={`address-${field}`} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={`address-${field}`}
          type="text"
          value={addressComponents[field]}
          onChange={(e) => handleAddressComponentChange(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full p-2 border ${
            addressFieldErrors[field] ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'
          } rounded-md focus:outline-none focus:ring-2 mt-1`}
        />
        {addressFieldErrors[field] && (
          <p className="mt-1 text-xs text-red-600">{addressFieldErrors[field]}</p>
        )}
      </div>
    );
  };
  
  // If still checking auth or not authenticated, show loading or access denied
  if (isAuthLoading) {
    return <div className="p-8">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div className="p-8">Access denied. Admin privileges required.</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Store Settings</h1>
        <button
          onClick={saveSettings}
          disabled={isLoading || isSaving}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      
      {/* Status Messages */}
      {saveStatus.type === 'success' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center gap-2">
          <div className="rounded-full p-1 bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          {saveStatus.message}
        </div>
      )}
      
      {saveStatus.type === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle size={16} />
          {saveStatus.message}
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-400 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Loading settings...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* General Settings */}
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-4">General Information</h2>
            <div className="bg-white rounded-md shadow-sm border border-gray-200">
              {generalSettings
                .filter(setting => setting.key !== 'store_address') // Filter out address setting as we handle it separately
                .map((setting) => (
                <div 
                  key={setting.id} 
                  className="p-4 border-b border-gray-100 last:border-b-0"
                >
                  <div className="mb-1">
                    <label htmlFor={`setting-${setting.id}`} className="block text-sm font-medium text-gray-700">
                      {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                    {setting.description && (
                      <p className="text-xs text-gray-500 mb-1">{setting.description}</p>
                    )}
                  </div>
                  <input
                    id={`setting-${setting.id}`}
                    type="text"
                    value={setting.value || ''}
                    onChange={(e) => handleChange(setting.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              ))}
              
              {/* Store Address Section */}
              <div className="p-4 border-b border-gray-100">
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-pink-600" />
                    <h3 className="text-lg font-medium text-gray-800">Store Address</h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter the store's physical address for the contact page map</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  {renderAddressField('street', t('settings.street'), t('settings.streetPlaceholder'))}
                  {renderAddressField('building_number', t('settings.buildingNumber'), t('settings.buildingNumberPlaceholder'))}
                  {renderAddressField('city', t('settings.city'), t('settings.cityPlaceholder'))}
                  {renderAddressField('postal_code', t('settings.postalCode'), t('settings.postalCodePlaceholder'))}
                  {renderAddressField('country', t('settings.country'), t('settings.countryPlaceholder'))}
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('settings.formattedAddress')}
                    </label>
                    <div className="p-2 bg-gray-100 rounded text-gray-700 text-sm font-mono">
                      {formatAddressFromComponents() || t('settings.addressPreview')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('settings.addressFormatNote')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Settings */}
          <div>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Social Media</h2>
            <div className="bg-white rounded-md shadow-sm border border-gray-200">
              {socialSettings.map((setting) => (
                <div 
                  key={setting.id} 
                  className="p-4 border-b border-gray-100 last:border-b-0"
                >
                  <div className="mb-1">
                    <label htmlFor={`setting-${setting.id}`} className="block text-sm font-medium text-gray-700">
                      {getSocialName(setting.key)}
                    </label>
                    {setting.description && (
                      <p className="text-xs text-gray-500 mb-1">{setting.description}</p>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      {getSocialIcon(setting.key)}
                    </div>
                    <input
                      id={`setting-${setting.id}`}
                      type="url"
                      value={setting.value || ''}
                      onChange={(e) => handleChange(setting.id, e.target.value)}
                      placeholder={`https://www.${setting.key.replace('_url', '')}.com/your-profile`}
                      className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 