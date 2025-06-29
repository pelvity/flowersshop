'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Save, AlertCircle, Facebook, Instagram, Twitter, Youtube, Link } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface StoreSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
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
      } catch (error) {
        console.error('Error fetching store settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [supabase, isAuthenticated, isAuthLoading]);
  
  const handleChange = (id: string, value: string) => {
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
              {generalSettings.map((setting) => (
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