'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'uk' | 'en';

// Define translation dictionary
const translations = {
  uk: {
    // Navigation
    home: 'Головна',
    catalog: 'Каталог',
    aboutUs: 'Про нас',
    contact: 'Контакти',
    signIn: 'Увійти',
    orderNow: 'Замовити',
    
    // Hero
    heroTitle1: 'Прекрасні квіти для',
    heroTitle2: 'будь-якого випадку',
    heroDescription: 'Відкрийте для себе наш широкий вибір свіжих і красивих квітів для всіх особливих моментів. Кожен букет створений з любов\'ю та турботою.',
    viewCatalog: 'Переглянути каталог',
    contactUs: 'Зв\'язатися з нами',
    
    // Featured products
    featuredArrangements: 'Популярні композиції',
    discoverPopular: 'Відкрийте для себе наші найпопулярніші та найулюбленіші квіткові композиції',
    viewDetails: 'Детальніше',
    addToCart: 'Додати в кошик',
    
    // Footer
    flowersDescription: 'Прекрасні квіти для будь-якого випадку. Свіжі, високоякісні квіти, доставлені з турботою та любов\'ю.',
    menu: 'Меню',
    contactInfo: 'Контактна інформація',
    workingHours: 'Години роботи:',
    weekdays: 'Понеділок - П\'ятниця: 9:00 - 19:00',
    weekends: 'Субота - Неділя: 10:00 - 17:00',
    rights: 'Всі права захищені',
    
    // Catalog page
    ourCollection: 'Наша колекція квітів',
    browseSelection: 'Перегляньте наш вибір красивих квіткових композицій для будь-якого випадку',
    
    // About page
    aboutTitle: 'Про Flower Paradise',
    aboutDescription: 'Ми пристрасно працюємо, щоб приносити красу і радість у життя людей через квіти',
    ourStory: 'Наша історія',
    storyPart1: 'Flower Paradise був заснований у 2010 році з простою місією: створювати красиві квіткові композиції, які приносять радість і комфорт у життя людей. Те, що почалося як малий сімейний бізнес, перетворилося на один з найулюбленіших квіткових магазинів Києва.',
    storyPart2: 'Наш засновник, Марія, завжди мала пристрасть до квітів та їхньої здатності передавати емоції та створювати пам\'ятні моменти. З більш ніж 15-річним досвідом у флористиці, вона створила команду талановитих флористів, які поділяють її бачення та відданість.',
    storyPart3: 'Сьогодні ми продовжуємо надавати виняткові квіткові композиції для всіх випадків, від повсякденних букетів до складних весільних прикрас, завжди з тією ж турботою та увагою до деталей, які визначали нас від самого початку.',
    ourValues: 'Наші цінності',
    quality: 'Якість',
    qualityDesc: 'Ми використовуємо лише найсвіжіші квіти, щоб забезпечити довговічність та красу ваших композицій.',
    passion: 'Пристрасть',
    passionDesc: 'Наша команда пристрасно захоплюється флористичним дизайном і створенням композицій, що пробуджують емоції.',
    service: 'Сервіс',
    serviceDesc: 'Ми пишаємося винятковим обслуговуванням клієнтів та увагою до кожної деталі.',
    meetTeam: 'Зустрічайте нашу команду',
    teamMember: 'Член команди',
    floralDesigner: 'Флорист-дизайнер',
    
    // Contact page
    contactTitle: 'Зв\'яжіться з нами',
    contactDescription: 'Ми будемо раді почути від вас. Надішліть нам повідомлення або відвідайте наш магазин.',
    name: 'Ім\'я',
    email: 'Електронна пошта',
    phone: 'Номер телефону',
    message: 'Повідомлення',
    sendMessage: 'Надіслати повідомлення',
    yourName: 'Ваше ім\'я',
    yourEmail: 'ваш.email@приклад.com',
    yourPhone: '+380 XX XXX XXXX',
    howCanWeHelp: 'Як ми можемо вам допомогти?',
    googleMap: 'Google карта буде відображена тут',
    mapApiNote: '(Потребує інтеграції з Google Maps API)',
    contactInformation: 'Контактна інформація',
    language: 'Мова',
  },
  en: {
    // Navigation
    home: 'Home',
    catalog: 'Catalog',
    aboutUs: 'About Us',
    contact: 'Contact',
    signIn: 'Sign In',
    orderNow: 'Order Now',
    
    // Hero
    heroTitle1: 'Beautiful flowers for',
    heroTitle2: 'every occasion',
    heroDescription: 'Discover our wide selection of fresh and beautiful flowers for all your special moments. Each bouquet is crafted with love and care.',
    viewCatalog: 'View Catalog',
    contactUs: 'Contact Us',
    
    // Featured products
    featuredArrangements: 'Featured Arrangements',
    discoverPopular: 'Discover our most popular and beloved flower arrangements',
    viewDetails: 'View details',
    addToCart: 'Add to cart',
    
    // Footer
    flowersDescription: 'Beautiful flowers for every occasion. Fresh, high-quality blooms delivered with care and love.',
    menu: 'Menu',
    contactInfo: 'Contact Information',
    workingHours: 'Working Hours:',
    weekdays: 'Monday - Friday: 9am - 7pm',
    weekends: 'Saturday - Sunday: 10am - 5pm',
    rights: 'All rights reserved',
    
    // Catalog page
    ourCollection: 'Our Flower Collection',
    browseSelection: 'Browse our selection of beautiful flower arrangements for every occasion',
    
    // About page
    aboutTitle: 'About Flower Paradise',
    aboutDescription: 'We are passionate about bringing beauty and joy to people\'s lives through flowers',
    ourStory: 'Our Story',
    storyPart1: 'Flower Paradise was founded in 2010 with a simple mission: to create beautiful floral arrangements that bring joy and comfort to people\'s lives. What started as a small family business has grown into one of Kyiv\'s most beloved flower shops.',
    storyPart2: 'Our founder, Maria, has always had a passion for flowers and their ability to convey emotions and create memorable moments. With over 15 years of experience in floral design, she has built a team of talented florists who share her vision and dedication.',
    storyPart3: 'Today, we continue to provide exceptional floral arrangements for all occasions, from everyday bouquets to elaborate wedding decorations, always with the same care and attention to detail that has defined us from the beginning.',
    ourValues: 'Our Values',
    quality: 'Quality',
    qualityDesc: 'We source only the freshest flowers to ensure your arrangements last longer and look beautiful.',
    passion: 'Passion',
    passionDesc: 'Our team is passionate about floral design and creating arrangements that evoke emotion.',
    service: 'Service',
    serviceDesc: 'We pride ourselves on exceptional customer service and attention to every detail.',
    meetTeam: 'Meet Our Team',
    teamMember: 'Team Member',
    floralDesigner: 'Floral Designer',
    
    // Contact page
    contactTitle: 'Contact Us',
    contactDescription: 'We\'d love to hear from you. Send us a message or visit our store.',
    name: 'Name',
    email: 'Email',
    phone: 'Phone Number',
    message: 'Message',
    sendMessage: 'Send Message',
    yourName: 'Your name',
    yourEmail: 'your.email@example.com',
    yourPhone: '+380 XX XXX XXXX',
    howCanWeHelp: 'How can we help you?',
    googleMap: 'Google Map will be displayed here',
    mapApiNote: '(Requires Google Maps API integration)',
    contactInformation: 'Contact Information',
    language: 'Language',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('uk'); // Default to Ukrainian
  
  useEffect(() => {
    // Check if there's a stored language preference
    const storedLanguage = localStorage.getItem('language') as Language;
    if (storedLanguage && (storedLanguage === 'uk' || storedLanguage === 'en')) {
      setLanguage(storedLanguage);
    }
  }, []);
  
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };
  
  // Translation function
  const t = (key: string): string => {
    if (!translations[language]) return key;
    
    return (translations[language] as Record<string, string>)[key] || key;
  };
  
  const contextValue: LanguageContextType = {
    language,
    setLanguage: changeLanguage,
    t,
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 