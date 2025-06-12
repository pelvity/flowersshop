'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Available languages
export type Language = 'uk' | 'en' | 'pl';

// Define the shape of the language context
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations for each language
const translations = {
  uk: {
    // Common
    locale: 'uk',
    home: 'Головна',
    catalog: 'Каталог',
    categories: 'Категорії',
    aboutUs: 'Про нас',
    contact: 'Контакти',
    orderNow: 'Замовити зараз',
    addToCart: 'Додати в кошик',
    language: 'Мова',
    
    // Hero Section
    heroTitle1: 'Створіть незабутні',
    heroTitle2: 'моменти з квітами',
    heroDescription: 'Наші унікальні букети та квіткові композиції додадуть радості та краси у ваше життя',
    viewCatalog: 'Переглянути каталог',
    contactUs: 'Зв\'язатися з нами',
    
    // Featured Products
    featuredArrangements: 'Вибрані композиції',
    discoverPopular: 'Відкрийте для себе наші найпопулярніші квіткові композиції',
    viewDetails: 'Переглянути деталі',
    
    // Contact Section
    contactTitle: 'Зв\'яжіться з нами',
    contactDescription: 'У вас є питання або особливі запити? Напишіть нам, і ми зв\'яжемося з вами якнайшвидше.',
    name: 'Ім\'я',
    contactEmail: 'Електронна пошта',
    phone: 'Телефон',
    message: 'Повідомлення',
    yourName: 'Ваше ім\'я',
    yourEmail: 'Ваша електронна пошта',
    yourPhone: 'Ваш телефон',
    howCanWeHelp: 'Як ми можемо вам допомогти?',
    sendMessage: 'Надіслати повідомлення',
    sending: 'Надсилання...',
    emailSent: 'Дякуємо! Ваше повідомлення було надіслано.',
    emailError: 'Виникла помилка. Будь ласка, спробуйте пізніше.',
    nameRequired: 'Ім\'я обов\'язкове',
    emailRequired: 'Email обов\'язковий',
    emailInvalid: 'Будь ласка, введіть дійсну електронну адресу',
    messageRequired: 'Повідомлення обов\'язкове',
    googleMap: 'Карта Google буде відображатися тут',
    mapApiNote: 'Для відображення карти потрібен API ключ Google Maps',
    contactInformation: 'Контактна інформація',
    workingHours: 'Робочий час',
    weekdays: 'Пн-Пт: 9:00 - 20:00',
    weekends: 'Сб-Нд: 10:00 - 18:00',
    
    // Home Page
    welcomeToFlowerShop: 'Ласкаво просимо до квіткового раю',
    flowerShopDescription: 'Відкрийте для себе чарівний світ унікальних букетів та квіткових композицій',
    exploreCollection: 'Переглянути колекцію',
    freshFlowers: 'Свіжі квіти',
    freshFlowersDesc: 'Ми щодня отримуємо свіжі квіти від перевірених постачальників',
    uniqueDesigns: 'Унікальний дизайн',
    uniqueDesignsDesc: 'Наші флористи створюють неповторні композиції для будь-якого випадку',
    fastDelivery: 'Швидка доставка',
    fastDeliveryDesc: 'Доставляємо букети по всьому місту протягом декількох годин',
    topCategories: 'Популярні категорії',
    viewAllCategories: 'Переглянути всі категорії',
    popularThisWeek: 'Популярне цього тижня',
    viewAll: 'Переглянути все',
    testimonials: 'Відгуки клієнтів',
    testimonialsDesc: 'Дізнайтеся, що кажуть наші клієнти про наші послуги',
    getUpdates: 'Отримуйте оновлення',
    getUpdatesDesc: 'Підпишіться на нашу розсилку, щоб отримувати останні новини та спеціальні пропозиції',
    subscribeEmail: 'Ваш email',
    subscribe: 'Підписатися',
    
    // Catalog
    ourCollection: 'Наша колекція',
    browseSelection: 'Перегляньте нашу підбірку чудових букетів та квіткових композицій',
    searchPlaceholder: 'Пошук букетів...',
    allCategories: 'Всі категорії',
    tags: 'Теги',
    noResults: 'Немає результатів, що відповідають вашому запиту',
    customize: 'Налаштувати',
    
    // Custom Bouquet
    customBouquet: 'Індивідуальний букет',
    createCustomBouquet: 'Створіть свій власний букет',
    customBouquetDescription: 'Оберіть квіти, кольори та кількість, щоб створити ідеальний букет для вашого випадку',
    startFromScratch: 'Почати з нуля',
    orChooseTemplate: 'Або виберіть шаблон',
    customizable: 'Можна налаштувати',
    selectFlowers: 'Виберіть квіти',
    perStem: 'за стебло',
    selectColor: 'Виберіть колір',
    yourBouquet: 'Ваш букет',
    noBouquetFlowers: 'Ви ще не додали жодної квітки',
    totalPrice: 'Загальна ціна',
    clearBouquet: 'Очистити букет',
    continueToReview: 'Продовжити до огляду',
    backToTemplates: 'Повернутися до шаблонів',
    backToCustomize: 'Повернутися до налаштування',
    bouquetSummary: 'Підсумок букета',
    stem: 'стебло',
    stems: 'стебел',
    clickFlowerToAdd: 'Натисніть на квітку, щоб додати її до букету. Виберіть конкретні кольори під кожною квіткою.',
    color: 'Колір',
    searchFlowers: 'Пошук квітів...',
    noFlowersFound: 'Не знайдено квітів за вашим запитом',
    
    // Shopping Cart
    cart: 'Кошик',
    cartEmpty: 'Ваш кошик порожній',
    continueShopping: 'Продовжити покупки',
    each: 'за одиницю',
    subtotal: 'Проміжна сума',
    checkout: 'Оформити замовлення',
    remove: 'Видалити',
    viewCart: 'Переглянути кошик',
    
    // Product Details
    quantity: 'Кількість',
    productNotFound: 'Товар не знайдено',
    productNotFoundDesc: 'Вибачте, товар, який ви шукаєте, не існує або був видалений.',
    backToCatalog: 'Повернутися до каталогу',
    
    // Checkout
    emptyCart: 'Порожній кошик',
    cartEmptyCheckout: 'Ваш кошик порожній. Додайте товари перед оформленням замовлення.',
    orderSummary: 'Підсумок замовлення',
    shipping: 'Доставка',
    total: 'Всього',
    fullName: 'Повне ім\'я',
    checkoutEmail: 'Електронна пошта',
    phoneNumber: 'Номер телефону',
    address: 'Адреса',
    city: 'Місто',
    paymentMethod: 'Спосіб оплати',
    cashOnDelivery: 'Оплата при доставці',
    cardPayment: 'Оплата карткою',
    placeOrder: 'Оформити замовлення',
    processing: 'Обробка...',
    orderSuccess: 'Замовлення успішно оформлено!',
    orderSuccessDescription: 'Дякуємо за ваше замовлення. Ми зв\'яжемося з вами найближчим часом для підтвердження.'
  },
  en: {
    // Common
    locale: 'en',
    home: 'Home',
    catalog: 'Catalog',
    categories: 'Categories',
    aboutUs: 'About Us',
    contact: 'Contact',
    orderNow: 'Order Now',
    addToCart: 'Add to cart',
    language: 'Language',
    
    // Hero Section
    heroTitle1: 'Create unforgettable',
    heroTitle2: 'moments with flowers',
    heroDescription: 'Our unique bouquets and flower arrangements will add joy and beauty to your life',
    viewCatalog: 'View Catalog',
    contactUs: 'Contact Us',
    
    // Featured Products
    featuredArrangements: 'Featured Arrangements',
    discoverPopular: 'Discover our most popular flower arrangements',
    viewDetails: 'View Details',
    
    // Contact Section
    contactTitle: 'Contact Us',
    contactDescription: 'Have questions or special requests? Write to us and we\'ll get back to you as soon as possible.',
    name: 'Name',
    contactEmail: 'Email',
    phone: 'Phone',
    message: 'Message',
    yourName: 'Your name',
    yourEmail: 'Your email',
    yourPhone: 'Your phone',
    howCanWeHelp: 'How can we help you?',
    sendMessage: 'Send Message',
    sending: 'Sending...',
    emailSent: 'Thank you! Your message has been sent.',
    emailError: 'An error occurred. Please try again later.',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email address',
    messageRequired: 'Message is required',
    googleMap: 'Google Map will be displayed here',
    mapApiNote: 'Google Maps API key is required to display the map',
    contactInformation: 'Contact Information',
    workingHours: 'Working Hours',
    weekdays: 'Mon-Fri: 9:00 AM - 8:00 PM',
    weekends: 'Sat-Sun: 10:00 AM - 6:00 PM',
    
    // Home Page
    welcomeToFlowerShop: 'Welcome to Flower Paradise',
    flowerShopDescription: 'Discover the magical world of unique bouquets and flower arrangements',
    exploreCollection: 'Explore Collection',
    freshFlowers: 'Fresh Flowers',
    freshFlowersDesc: 'We receive fresh flowers daily from trusted suppliers',
    uniqueDesigns: 'Unique Designs',
    uniqueDesignsDesc: 'Our florists create one-of-a-kind compositions for any occasion',
    fastDelivery: 'Fast Delivery',
    fastDeliveryDesc: 'We deliver bouquets throughout the city within a few hours',
    topCategories: 'Top Categories',
    viewAllCategories: 'View All Categories',
    popularThisWeek: 'Popular This Week',
    viewAll: 'View All',
    testimonials: 'Customer Testimonials',
    testimonialsDesc: 'Find out what our customers are saying about our services',
    getUpdates: 'Get Updates',
    getUpdatesDesc: 'Subscribe to our newsletter to receive latest news and special offers',
    subscribeEmail: 'Your email',
    subscribe: 'Subscribe',
    
    // Catalog
    ourCollection: 'Our Collection',
    browseSelection: 'Browse our selection of beautiful bouquets and flower arrangements',
    searchPlaceholder: 'Search bouquets...',
    allCategories: 'All Categories',
    tags: 'Tags',
    noResults: 'No results matching your query',
    customize: 'Customize',
    
    // Custom Bouquet
    customBouquet: 'Custom Bouquet',
    createCustomBouquet: 'Create Your Custom Bouquet',
    customBouquetDescription: 'Select flowers, colors, and quantities to create the perfect bouquet for your occasion',
    startFromScratch: 'Start from Scratch',
    orChooseTemplate: 'Or Choose a Template',
    customizable: 'Customizable',
    selectFlowers: 'Select Flowers',
    perStem: 'per stem',
    selectColor: 'Select Color',
    yourBouquet: 'Your Bouquet',
    noBouquetFlowers: 'You haven\'t added any flowers yet',
    totalPrice: 'Total Price',
    clearBouquet: 'Clear Bouquet',
    continueToReview: 'Continue to Review',
    backToTemplates: 'Back to Templates',
    backToCustomize: 'Back to Customize',
    bouquetSummary: 'Bouquet Summary',
    stem: 'stem',
    stems: 'stems',
    clickFlowerToAdd: 'Click on any flower to add it to your bouquet. Choose specific colors below each flower.',
    color: 'Color',
    searchFlowers: 'Search flowers...',
    noFlowersFound: 'No flowers found matching your search',
    
    // Shopping Cart
    cart: 'Cart',
    cartEmpty: 'Your cart is empty',
    continueShopping: 'Continue shopping',
    each: 'each',
    subtotal: 'Subtotal',
    checkout: 'Checkout',
    remove: 'Remove',
    viewCart: 'View cart',
    
    // Product Details
    quantity: 'Quantity',
    productNotFound: 'Product not found',
    productNotFoundDesc: 'Sorry, the product you are looking for doesn\'t exist or has been removed.',
    backToCatalog: 'Back to catalog',
    
    // Checkout
    emptyCart: 'Empty Cart',
    cartEmptyCheckout: 'Your cart is empty. Add some items before checkout.',
    orderSummary: 'Order Summary',
    shipping: 'Shipping',
    total: 'Total',
    fullName: 'Full Name',
    checkoutEmail: 'Email',
    phoneNumber: 'Phone Number',
    address: 'Address',
    city: 'City',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    cardPayment: 'Card Payment',
    placeOrder: 'Place Order',
    processing: 'Processing...',
    orderSuccess: 'Order Placed Successfully!',
    orderSuccessDescription: 'Thank you for your order. We will contact you shortly to confirm.'
  },
  pl: {
    // Common
    home: 'Główna',
    catalog: 'Katalog',
    categories: 'Kategorie',
    aboutUs: 'O nas',
    contact: 'Kontakt',
    orderNow: 'Zamów teraz',
    addToCart: 'Dodaj do koszyka',
    language: 'Język',
    
    // Hero Section
    heroTitle1: 'Twórz niezapomniane',
    heroTitle2: 'chwile z kwiatami',
    heroDescription: 'Nasze unikalne bukiety i kompozycje kwiatowe dodadzą radości i piękna do Twojego życia',
    viewCatalog: 'Zobacz katalog',
    contactUs: 'Kontakt z nami',
    
    // Featured Products
    featuredArrangements: 'Polecane kompozycje',
    discoverPopular: 'Odkryj nasze najpopularniejsze kompozycje kwiatowe',
    viewDetails: 'Zobacz szczegóły',
    
    // Contact Section
    contactTitle: 'Skontaktuj się z nami',
    contactDescription: 'Masz pytania lub specjalne prośby? Napisz do nas, a odezwiemy się najszybciej jak to możliwe.',
    name: 'Imię',
    contactEmail: 'Email',
    phone: 'Telefon',
    message: 'Wiadomość',
    yourName: 'Twoje imię',
    yourEmail: 'Twój email',
    yourPhone: 'Twój telefon',
    howCanWeHelp: 'Jak możemy Ci pomóc?',
    sendMessage: 'Wyślij wiadomość',
    sending: 'Wysyłanie...',
    emailSent: 'Dziękujemy! Twoja wiadomość została wysłana.',
    emailError: 'Wystąpił błąd. Spróbuj ponownie później.',
    nameRequired: 'Imię jest wymagane',
    emailRequired: 'Email jest wymagany',
    emailInvalid: 'Proszę podać prawidłowy adres email',
    messageRequired: 'Wiadomość jest wymagana',
    googleMap: 'Mapa Google zostanie wyświetlona tutaj',
    mapApiNote: 'Do wyświetlenia mapy wymagany jest klucz API Google Maps',
    contactInformation: 'Informacje kontaktowe',
    workingHours: 'Godziny pracy',
    weekdays: 'Pon-Pt: 9:00 - 20:00',
    weekends: 'Sob-Niedz: 10:00 - 18:00',
    
    // Home Page
    welcomeToFlowerShop: 'Witamy w kwiatowym raju',
    flowerShopDescription: 'Odkryj magiczny świat unikalnych bukietów i kompozycji kwiatowych',
    exploreCollection: 'Przeglądaj kolekcję',
    freshFlowers: 'Świeże kwiaty',
    freshFlowersDesc: 'Codziennie otrzymujemy świeże kwiaty od zaufanych dostawców',
    uniqueDesigns: 'Unikalne wzory',
    uniqueDesignsDesc: 'Nasi floryści tworzą niepowtarzalne kompozycje na każdą okazję',
    fastDelivery: 'Szybka dostawa',
    fastDeliveryDesc: 'Dostarczamy bukiety w całym mieście w ciągu kilku godzin',
    topCategories: 'Najpopularniejsze kategorie',
    viewAllCategories: 'Zobacz wszystkie kategorie',
    popularThisWeek: 'Popularne w tym tygodniu',
    viewAll: 'Zobacz wszystkie',
    testimonials: 'Opinie klientów',
    testimonialsDesc: 'Sprawdź, co nasi klienci mówią o naszych usługach',
    getUpdates: 'Otrzymuj aktualizacje',
    getUpdatesDesc: 'Zapisz się do naszego newslettera, aby otrzymywać najnowsze wiadomości i oferty specjalne',
    subscribeEmail: 'Twój email',
    subscribe: 'Subskrybuj',
    
    // Catalog
    ourCollection: 'Nasza kolekcja',
    browseSelection: 'Przeglądaj naszą selekcję pięknych bukietów i kompozycji kwiatowych',
    searchPlaceholder: 'Szukaj bukietów...',
    allCategories: 'Wszystkie kategorie',
    tags: 'Tagi',
    noResults: 'Brak wyników odpowiadających zapytaniu',
    customize: 'Dostosuj',
    
    // Custom Bouquet
    customBouquet: 'Własny bukiet',
    createCustomBouquet: 'Stwórz swój własny bukiet',
    customBouquetDescription: 'Wybierz kwiaty, kolory i ilości, aby stworzyć idealny bukiet na twoją okazję',
    startFromScratch: 'Zacznij od zera',
    orChooseTemplate: 'Lub wybierz szablon',
    customizable: 'Możliwość dostosowania',
    selectFlowers: 'Wybierz kwiaty',
    perStem: 'za łodygę',
    selectColor: 'Wybierz kolor',
    yourBouquet: 'Twój bukiet',
    noBouquetFlowers: 'Nie dodałeś jeszcze żadnych kwiatów',
    totalPrice: 'Cena całkowita',
    clearBouquet: 'Wyczyść bukiet',
    continueToReview: 'Przejdź do podsumowania',
    backToTemplates: 'Powrót do szablonów',
    backToCustomize: 'Powrót do dostosowywania',
    bouquetSummary: 'Podsumowanie bukietu',
    stem: 'łodyga',
    stems: 'łodygi',
    clickFlowerToAdd: 'Kliknij na kwiat, aby dodać go do bukietu. Wybierz konkretne kolory poniżej każdego kwiatu.',
    color: 'Kolor',
    searchFlowers: 'Szukaj kwiatów...',
    noFlowersFound: 'Nie znaleziono kwiatów pasujących do wyszukiwania',
    
    // Shopping Cart
    cart: 'Koszyk',
    cartEmpty: 'Twój koszyk jest pusty',
    continueShopping: 'Kontynuuj zakupy',
    each: 'każdy',
    subtotal: 'Suma częściowa',
    checkout: 'Do kasy',
    remove: 'Usuń',
    viewCart: 'Zobacz koszyk',
    
    // Product Details
    quantity: 'Ilość',
    productNotFound: 'Produkt nie znaleziony',
    productNotFoundDesc: 'Przepraszamy, szukany produkt nie istnieje lub został usunięty.',
    backToCatalog: 'Powrót do katalogu',
    
    // Checkout
    emptyCart: 'Pusty koszyk',
    cartEmptyCheckout: 'Twój koszyk jest pusty. Dodaj produkty przed złożeniem zamówienia.',
    orderSummary: 'Podsumowanie zamówienia',
    shipping: 'Dostawa',
    total: 'Łącznie',
    fullName: 'Imię i nazwisko',
    checkoutEmail: 'Email',
    phoneNumber: 'Numer telefonu',
    address: 'Adres',
    city: 'Miasto',
    paymentMethod: 'Metoda płatności',
    cashOnDelivery: 'Płatność przy odbiorze',
    cardPayment: 'Płatność kartą',
    placeOrder: 'Złóż zamówienie',
    processing: 'Przetwarzanie...',
    orderSuccess: 'Zamówienie złożone pomyślnie!',
    orderSuccessDescription: 'Dziękujemy za zamówienie. Skontaktujemy się z Tobą wkrótce w celu potwierdzenia.'
  }
};

// Provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pl');
  
  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 