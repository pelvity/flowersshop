import { createClient } from '@supabase/supabase-js';
import { cache } from "react";
import { Database } from "@/types/supabase";

// Default values in case database fetch fails
const DEFAULT_SETTINGS = {
  store_name: 'Flower Paradise',
  store_address: 'ul. Kwiatowa 10, 00-001 Warszawa',
  store_phone: '+48 123 456 789',
  store_email: 'contact@flowerparadise.com',
  store_telegram_username: 'vvrtem'
};

/**
 * Get store settings from the database
 * This function is meant to be used on the server side
 */
export const getStoreSettingsServer = cache(
  async (): Promise<Record<string, string>> => {
    // Server-side Supabase client using env variables
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');
        
      if (error) {
        console.error('Error fetching store settings:', error);
        return DEFAULT_SETTINGS;
      }
      
      // Convert the array of settings to an object
      const settings: Record<string, string> = {};
      data.forEach((setting: { key: string; value: string | null }) => {
        settings[setting.key] = setting.value || '';
      });
      
      return settings;
    } catch (error) {
      console.error('Error fetching store settings:', error);
      return DEFAULT_SETTINGS;
    }
  }
);

/**
 * Get a specific store setting by key on the server
 * @param key The setting key
 * @param defaultValue Default value if setting is not found
 */
export async function getStoreSettingServer(key: string, defaultValue: string = ''): Promise<string> {
  const settings = await getStoreSettingsServer();
  return settings[key] || defaultValue;
} 