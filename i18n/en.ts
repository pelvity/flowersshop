import type { Translation } from './schema';

export const en: Translation = {
  common: {
    header: {
      home: "Home",
      about: "About",
      contact: "Contact",
      cart: "Cart"
    },
    footer: {
      rights: "All rights reserved",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      about: "About Us",
      aboutText: "We offer the freshest flowers with delivery to make your special moments even brighter.",
      quickLinks: "Quick Links",
      contact: "Contact",
      address: "123 Flower Street, Kyiv, Ukraine",
      followUs: "Follow Us",
      rightsReserved: "All rights reserved"
    },
    buttons: {
      add_to_cart: "Add to Cart",
      view_details: "View Details",
      checkout: "Checkout",
      continue_shopping: "Continue Shopping"
    },
    workingHours: "Working Hours",
    weekdays: "Mon-Fri: 9:00 - 20:00",
    weekends: "Sat-Sun: 10:00 - 18:00",
    name: "Name",
    contactEmail: "Email",
    phone: "Phone",
    message: "Message",
    yourName: "Your Name",
    yourEmail: "Your Email",
    yourPhone: "Your Phone",
    howCanWeHelp: "How can we help you?",
    nameRequired: "Name is required",
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email address",
    messageRequired: "Message is required",
    sending: "Sending...",
    sendMessage: "Send Message",
    emailSent: "Message sent successfully!",
    emailError: "Error sending message. Please try again later.",
    each: "each",
    customBouquet: "Custom Bouquet",
    description: "Description",
    price: "Price",
    discountPrice: "Discount Price",
    category: "Category",
    selectCategory: "Select Category",
    inStock: "In Stock",
    featured: "Featured"
  },
  cart: {
    cart: "Cart",
    cartEmpty: "Your cart is empty",
    continueShopping: "Continue Shopping",
    subtotal: "Subtotal",
    checkout: "Checkout"
  },
  home: {
    hero: {
      title: "Beautiful Flowers For Every Occasion",
      subtitle: "Fresh, high-quality blooms delivered with care and love"
    },
    featured: {
      title: "Featured Products",
      view_all: "View All"
    },
    featuredArrangements: "Featured Arrangements",
    discoverPopular: "Discover our most popular bouquets and arrangements."
  },
  contact: {
    contactTitle: "Contact Us",
    contactDescription: "Have questions or suggestions? Write to us and we'll get back to you as soon as possible.",
    contactInformation: "Contact Information",
    googleMap: "Google Map will display here",
    mapApiNote: "Google Maps API key is required to display the map"
  },
  product: {
    details: "Details",
    description: "Description",
    related: "Related Products",
    reviews: "Reviews"
  },
  catalog: {
    ourCollection: "Our Collection",
    browseSelection: "Browse our beautiful selection of flowers and bouquets",
    searchPlaceholder: "Search for flowers...",
    categories: "Categories",
    allCategories: "All Categories",
    tags: "Tags",
    noResults: "No products found",
    addToCart: "Add to Cart",
    outOfStock: "Out of Stock",
    customize: "Customize"
  },
  customBouquet: {
    title: "Custom Bouquet",
    description: "Select flowers, colors, and quantities to create a unique bouquet",
    selectFlowers: "Select Flowers",
    selectedFlowers: "Selected Flowers",
    quantity: "Quantity",
    color: "Color",
    addFlower: "Add Flower",
    removeFlower: "Remove",
    totalPrice: "Total Price",
    addToCart: "Add to Cart",
    flowerSelection: "Flower Selection",
    yourBouquet: "Your Bouquet",
    emptySelection: "You haven't selected any flowers yet. Choose flowers to create your bouquet.",
    createYourOwn: "Create Your Own Unique Bouquet",
    customizeDescription: "Select your favorite flowers, colors, and quantities to create the perfect bouquet for any occasion.",
    startFromScratch: "Start From Scratch",
    backToTemplates: "Back to Templates",
    continueToReview: "Continue to Review",
    searchPlaceholder: "Search flowers...",
    each: "each",
    backToCustomize: "Back to Customize",
    reviewYourBouquet: "Review Your Bouquet",
    yourBouquetSummary: "Your Bouquet Summary",
    loadingBouquet: "Loading your bouquet..."
  },
  admin: {
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create New",
      search: "Search",
      filter: "Filter",
      actions: "Actions",
      noResults: "No results found"
    },
    navigation: {
      dashboard: "Dashboard",
      bouquets: "Bouquets",
      flowers: "Flowers",
      categories: "Categories",
      tags: "Tags",
      orders: "Orders",
      customers: "Customers",
      settings: "Settings",
      logout: "Logout",
      flowershop: "Flower Shop Admin",
      translations: "Translations"
    },
    tags: {
      assignedTags: "Assigned Tags",
      noTagsAssigned: "No tags assigned",
      addTag: "Add Tag",
      searchTags: "Search tags..."
    },
    bouquets: {
      name: "Name",
      price: "Price",
      discountPrice: "Discount Price",
      category: "Category",
      status: "Status",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      featured: "Featured",
      create: "Create Bouquet",
      edit: "Edit Bouquet",
      delete: "Delete Bouquet",
      confirmDelete: "Are you sure you want to delete this bouquet?",
      description: "Description",
      image: "Image",
      createSuccess: "Bouquet created successfully",
      updateSuccess: "Bouquet updated successfully",
      deleteSuccess: "Bouquet deleted successfully",
      basicInfo: "Basic Information",
      imageRequirements: "Recommended size: 800x600px. Max file size: 2MB.",
      flowerSelection: "Flower Selection",
      selectedFlowers: "Selected Flowers",
      addFlower: "Add Flower",
      noFlowersSelected: "No flowers selected yet. Add flowers to create your bouquet.",
      details: "Bouquet Details",
      flowers: "Flowers in Bouquet",
      searchFlowers: "Search Flowers",
      noFlowers: "No flowers in bouquet"
    },
    flowers: {
      name: "Name",
      price: "Price",
      category: "Category",
      quantity: "Quantity",
      status: "Status",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      create: "Create Flower",
      edit: "Edit Flower",
      delete: "Delete Flower",
      confirmDelete: "Are you sure you want to delete this flower?",
      description: "Description",
      image: "Image",
      basicInfo: "Basic Information",
      imageRequirements: "Recommended size: 800x600px. Max file size: 2MB.",
      createSuccess: "Flower created successfully",
      updateSuccess: "Flower updated successfully",
      deleteSuccess: "Flower deleted successfully"
    },
    auth: {
      login: "Sign in to your account",
      email: "Email address",
      password: "Password",
      signIn: "Sign In",
      loginError: "Invalid login credentials. Please try again."
    }
  },
  entities: {
    bouquets: {},
    categories: {},
    flowers: {}
  },
  LanguageSwitcher: {
    label: "Language",
    ariaLabel: "Switch to {locale, select, en {English} uk {Ukrainian} ru {Russian} other {Unknown}}",
    title: "Switch to {locale, select, en {English} uk {Ukrainian} ru {Russian} other {Unknown}}"
  }
}; 