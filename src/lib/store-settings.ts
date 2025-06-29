import { Database } from "@/types/supabase";
import { createClient } from "@/utils/supabase/client";

export interface StoreSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
}

// Default values in case database fetch fails
const DEFAULT_SETTINGS = {
  store_name: 'Flower Paradise',
  store_address: 'ul. Kwiatowa 10, 00-001 Warszawa',
  store_phone: '+48 123 456 789',
  store_email: 'contact@flowerparadise.com',
  store_telegram_username: 'vvrtem'
};

// Cache results for 5 minutes
const CACHE_TIME = 1000 * 60 * 5;

let cachedSettings: Record<string, string> | null = null;
let lastFetchTime = 0;

/**
 * Get store settings from the database
 * This function is meant to be used on the client side
 */
export async function getStoreSettings(): Promise<Record<string, string>> {
  // Check if we have a cached result that is still valid
  const now = Date.now();
  if (cachedSettings && (now - lastFetchTime < CACHE_TIME)) {
    return cachedSettings;
  }

  const supabase = createClient();
  
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
    
    // Cache the result
    cachedSettings = settings;
    lastFetchTime = now;
    
    return settings;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Get a specific store setting by key
 * @param key The setting key
 * @param defaultValue Default value if setting is not found
 */
export async function getStoreSetting(key: string, defaultValue: string = ''): Promise<string> {
  const settings = await getStoreSettings();
  return settings[key] || defaultValue;
} 