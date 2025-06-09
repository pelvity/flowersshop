import { getMessages } from '@/utils/get-messages';
import { Locale, defaultLocale } from '../../../config/i18n';

export class TranslationsService {
  /**
   * Translate a single entity using the available translations
   */
  static async translateEntity<T>(
    entity: T, 
    entityType: string, 
    locale: Locale,
    fields: string[] = ['name', 'description']
  ): Promise<T> {
    if (locale === defaultLocale) {
      return entity;
    }
    
    try {
      // Get translations for the current locale
      const messages = await getMessages(locale);
      const translations = messages?.entities?.[entityType];
      
      if (!translations || !entity) {
        return entity;
      }
      
      // Create a copy of the entity to avoid mutating the original
      const translatedEntity = { ...entity } as any;
      
      // Only translate specified fields if they exist in translations
      for (const field of fields) {
        const entityId = (entity as any).id;
        if (translations[entityId]?.[field]) {
          translatedEntity[field] = translations[entityId][field];
        }
      }
      
      return translatedEntity;
    } catch (error) {
      console.error('Error translating entity:', error);
      return entity;
    }
  }
  
  /**
   * Translate an array of entities using the available translations
   */
  static async translateEntities<T>(
    entities: T[], 
    entityType: string, 
    locale: Locale,
    fields: string[] = ['name', 'description']
  ): Promise<T[]> {
    if (locale === defaultLocale || !entities.length) {
      return entities;
    }
    
    try {
      // Get translations for the current locale
      const messages = await getMessages(locale);
      const translations = messages?.entities?.[entityType];
      
      if (!translations) {
        return entities;
      }
      
      // Translate each entity in the array
      return Promise.all(
        entities.map(entity => this.translateEntity(entity, entityType, locale, fields))
      );
    } catch (error) {
      console.error('Error translating entities:', error);
      return entities;
    }
  }
} 