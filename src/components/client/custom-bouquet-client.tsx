'use client';

import { useState, useEffect, useMemo } from "react";
import { Container, Section, Card } from "../ui";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { Plus, Minus, X, ShoppingCart } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/cart-context";
import getRepositories from "@/lib/repositories";
import { Flower, FlowerQuantity, Product } from "@/lib/repositories/types";
import { calculateCustomBouquetPrice } from "@/lib/repositories";

export default function CustomBouquetClient() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  
  // State for custom bouquet
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerQuantity[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [step, setStep] = useState<'template' | 'customize' | 'review'>(
    productId ? 'customize' : 'template'
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  const { addCustomBouquet } = useCart();
  // Memoize repositories to prevent recreation on each render
  const repositories = useMemo(() => getRepositories(), []);
  
  // Initialize from a template product if productId is provided
  useEffect(() => {
    if (productId) {
      const product = repositories.products.getById(parseInt(productId));
      if (product && product.isCustomizable && product.baseFlowers) {
        setSelectedProduct(product);
        setSelectedFlowers(product.baseFlowers);
      }
    }
  }, [productId, repositories]);
  
  // Calculate total price whenever selected flowers change
  useEffect(() => {
    const newTotalPrice = calculateCustomBouquetPrice(selectedFlowers);
    setTotalPrice(newTotalPrice);
  }, [selectedFlowers]);
  
  // Filter flowers based on search query
  const filteredFlowers = useMemo(() => {
    const flowers = repositories.flowers.getAll();
    if (!searchQuery.trim()) return flowers;
    
    return flowers.filter(flower => 
      flower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flower.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [repositories, searchQuery]);
  
  // Helper function to add a flower
  const addFlower = (flower: Flower, color: string) => {
    setSelectedFlowers(prev => {
      // Check if this flower with the same color already exists
      const existingIndex = prev.findIndex(item => item.flowerId === flower.id && item.color === color);
      
      if (existingIndex >= 0) {
        // Update quantity of existing flower
        const updatedFlowers = [...prev];
        updatedFlowers[existingIndex] = {
          ...updatedFlowers[existingIndex],
          quantity: updatedFlowers[existingIndex].quantity + 1
        };
        return updatedFlowers;
      } else {
        // Add new flower
        return [...prev, { flowerId: flower.id, quantity: 1, color }];
      }
    });
  };
  
  // Helper function to add a flower with default color
  const addFlowerWithDefaultColor = (flower: Flower) => {
    // Use the first color as default
    const defaultColor = flower.colors[0];
    addFlower(flower, defaultColor);
  };
  
  // Helper function to remove a flower
  const removeFlower = (index: number) => {
    setSelectedFlowers(prev => {
      if (prev[index].quantity > 1) {
        // Decrease quantity
        const updatedFlowers = [...prev];
        updatedFlowers[index] = {
          ...updatedFlowers[index],
          quantity: updatedFlowers[index].quantity - 1
        };
        return updatedFlowers;
      } else {
        // Remove the flower entirely
        return prev.filter((_, i) => i !== index);
      }
    });
  };
  
  // Helper function to change flower color
  const changeFlowerColor = (index: number, color: string) => {
    setSelectedFlowers(prev => {
      const updatedFlowers = [...prev];
      updatedFlowers[index] = {
        ...updatedFlowers[index],
        color
      };
      return updatedFlowers;
    });
  };
  
  // Start from scratch with a blank bouquet
  const startFromScratch = () => {
    setSelectedProduct(null);
    setSelectedFlowers([]);
    setStep('customize');
  };
  
  // Reset to template selection
  const backToTemplates = () => {
    setSelectedProduct(null);
    setSelectedFlowers([]);
    setStep('template');
  };
  
  // Add the custom bouquet to cart
  const addToCart = () => {
    addCustomBouquet(
      selectedFlowers,
      selectedProduct?.id,
      selectedProduct ? `Custom ${selectedProduct.name}` : 'Custom Bouquet'
    );
  };
  
  // Templates view
  const renderTemplates = () => (
    <div className="py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-pink-700 mb-4">{t('createCustomBouquet')}</h1>
        <p className="text-xl text-pink-400 max-w-3xl mx-auto">
          {t('customBouquetDescription')}
        </p>
      </div>
      
      <div className="mb-8 text-center">
        <button 
          onClick={startFromScratch}
          className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors"
        >
          {t('startFromScratch')}
        </button>
      </div>
      
      <h2 className="text-2xl font-bold text-pink-700 mb-6 text-center">{t('orChooseTemplate')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositories.products.getCustomizableProducts().map(product => {
          const category = repositories.categories.getById(product.categoryId);
          
          return (
            <Card key={product.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg border border-pink-100 bg-white">
              <div className="relative">
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  width={400} 
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-white border border-pink-200 text-pink-600 text-xs px-3 py-1 rounded-full shadow-sm">
                  {category?.name}
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-pink-700">{product.name}</h3>
                  <p className="mt-2 text-base text-gray-600">{product.description}</p>
                  <div className="mt-3">
                    <p className="text-sm text-pink-500">{t('customizable')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-medium text-amber-600">{product.price}</span>
                  <button 
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedFlowers(product.baseFlowers || []);
                      setStep('customize');
                    }}
                    className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-4 py-2 rounded-md text-sm shadow-sm transition-colors"
                  >
                    {t('customize')}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
  
  // Customization view
  const renderCustomize = () => (
    <div className="py-8">
      <div className="mb-8 flex justify-between items-center">
        <button 
          onClick={backToTemplates} 
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          ← {t('backToTemplates')}
        </button>
        
        <h1 className="text-3xl font-bold text-pink-700">
          {selectedProduct ? t('customize') : t('createCustomBouquet')}
        </h1>
        
        <button 
          onClick={() => setStep('review')}
          className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
          disabled={selectedFlowers.length === 0}
        >
          {t('continueToReview')}
        </button>
      </div>
      
      {selectedProduct && (
        <div className="mb-8 bg-pink-50 p-4 rounded-lg border border-pink-100">
          <h2 className="text-xl font-medium text-pink-700 mb-2">{t('customize')}: {selectedProduct.name}</h2>
          <p className="text-gray-600">{selectedProduct.description}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Flower selection panel */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-pink-700">{t('selectFlowers')}</h2>
            <div className="relative">
              <input
                type="text"
                placeholder={t('searchFlowers') || "Search flowers..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-pink-200 rounded-full py-1 px-3 pl-8 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm text-pink-600 text-sm"
              />
              <div className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-pink-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          </div>
          
          {filteredFlowers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-pink-100 shadow-sm">
              <p className="text-pink-400">{t('noFlowersFound') || "No flowers found matching your search"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredFlowers.map(flower => (
                <Card 
                  key={flower.id} 
                  className="border border-pink-100 bg-white hover:shadow-md transition-all cursor-pointer"
                >
                  <div 
                    className="p-4" 
                    onClick={() => addFlowerWithDefaultColor(flower)}
                  >
                    <div className="relative mb-3">
                      <Image 
                        src={flower.image} 
                        alt={flower.name} 
                        width={200} 
                        height={150}
                        className="w-full h-32 object-cover rounded-md transition-transform hover:scale-105"
                      />
                      <div className="absolute top-0 right-0 bg-pink-100 rounded-bl-md p-1">
                        <Plus size={16} className="text-pink-600" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-pink-700">{flower.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{flower.description}</p>
                    <p className="text-amber-600 font-medium">₴{flower.price} {t('perStem')}</p>
                    
                    <div className="mt-3">
                      <p className="text-sm text-pink-600 mb-2">{t('selectColor')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {flower.colors.map(color => (
                          <button
                            key={color}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              addFlower(flower, color);
                            }}
                            className="px-3 py-1 text-xs rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors flex items-center"
                          >
                            <div 
                              className="w-3 h-3 mr-1 rounded-full" 
                              style={{ backgroundColor: getColorHex(color) }}
                            ></div>
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-4 text-center text-gray-500 text-sm">
            <p>{t('clickFlowerToAdd') || 'Click on any flower to add it to your bouquet. Choose specific colors below each flower.'}</p>
          </div>
        </div>
        
        {/* Selected flowers summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-pink-100 p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-medium text-pink-700 mb-4">{t('yourBouquet')}</h2>
            
            {selectedFlowers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noBouquetFlowers')}</p>
            ) : (
              <div className="space-y-4">
                {selectedFlowers.map((item, index) => {
                  const flower = repositories.flowers.getById(item.flowerId);
                  if (!flower) return null;
                  
                  return (
                    <div key={index} className="flex items-center justify-between border-b border-pink-50 pb-3">
                      <div className="flex items-center">
                        <Image 
                          src={flower.image} 
                          alt={flower.name} 
                          width={50} 
                          height={50}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="ml-3">
                          <p className="text-pink-700 font-medium">{flower.name}</p>
                          <div className="flex items-center">
                            <p className="text-xs text-pink-500 mr-2">{t('color')}:</p>
                            <div className="flex items-center border border-pink-100 rounded overflow-hidden">
                              <div 
                                className="w-4 h-4 mr-1 ml-1"
                                style={{ backgroundColor: getColorHex(item.color), borderRadius: '50%' }}
                              ></div>
                              <select
                                value={item.color}
                                onChange={(e) => changeFlowerColor(index, e.target.value)}
                                className="text-xs text-pink-600 bg-pink-50 py-1 pl-0 pr-2 border-0 focus:ring-0 focus:outline-none"
                              >
                                {flower.colors.map(color => (
                                  <option key={color} value={color}>{color}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <button 
                          onClick={() => removeFlower(index)}
                          className="text-pink-400 hover:text-pink-600 p-1"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="mx-2 text-gray-700 min-w-[20px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => addFlower(flower, item.color || flower.colors[0])}
                          className="text-pink-400 hover:text-pink-600 p-1"
                        >
                          <Plus size={14} />
                        </button>
                        <button 
                          onClick={() => setSelectedFlowers(prev => prev.filter((_, i) => i !== index))}
                          className="ml-2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                <div className="pt-4">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span className="text-gray-700">{t('totalPrice')}:</span>
                    <span className="text-amber-600">₴{totalPrice}</span>
                  </div>
                  
                  {selectedFlowers.length > 0 && (
                    <button
                      onClick={() => setSelectedFlowers([])}
                      className="w-full mt-4 border border-pink-200 text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      {t('clearBouquet')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  
  // Review order view
  const renderReview = () => (
    <div className="py-8">
      <div className="mb-8 flex justify-between items-center">
        <button 
          onClick={() => setStep('customize')} 
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          ← {t('backToCustomize')}
        </button>
        
        <h1 className="text-3xl font-bold text-pink-700">{t('bouquetSummary')}</h1>
        
        <div></div> {/* Empty div for flex spacing */}
      </div>
      
      <div className="bg-white rounded-lg border border-pink-100 p-8 shadow-sm mb-8">
        <h2 className="text-2xl font-medium text-pink-700 mb-6 text-center">{t('bouquetSummary')}</h2>
        
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4 mb-8">
            {selectedFlowers.map((item, index) => {
              const flower = repositories.flowers.getById(item.flowerId);
              if (!flower) return null;
              
              return (
                <div key={index} className="flex items-center justify-between border-b border-pink-50 pb-3">
                  <div className="flex items-center">
                    <Image 
                      src={flower.image} 
                      alt={flower.name} 
                      width={50} 
                      height={50}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="ml-3">
                      <p className="text-pink-700 font-medium">{flower.name}</p>
                      <p className="text-sm text-gray-500">
                        <span className="flex items-center">
                          <div 
                            className="w-3 h-3 mr-1 rounded-full" 
                            style={{ backgroundColor: getColorHex(item.color) }}
                          ></div>
                          <span className="text-pink-500">{item.color}</span>
                        </span> • {item.quantity} {item.quantity === 1 ? t('stem') : t('stems')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-amber-600 font-medium">
                    ₴{flower.price * item.quantity}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="border-t border-pink-100 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gray-700">{t('totalPrice')}:</span>
              <span className="text-amber-600">₴{totalPrice}</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button 
              onClick={addToCart}
              className="bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 text-white px-8 py-3 rounded-md font-medium shadow-sm transition-colors flex items-center justify-center mx-auto"
            >
              <ShoppingCart size={18} className="mr-2" />
              {t('addToCart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Add color to hex mapping function
  const getColorHex = (colorName: string | undefined): string => {
    if (!colorName) return '#FFFFFF';
    
    const colorMap: Record<string, string> = {
      'Red': '#FF5252',
      'Pink': '#FF80AB',
      'White': '#FFFFFF',
      'Yellow': '#FFD54F',
      'Orange': '#FFAB40',
      'Purple': '#CE93D8',
      'Blue': '#82B1FF',
      'Green': '#66BB6A',
      'Coral': '#FF8A65'
    };
    
    return colorMap[colorName] || '#FFFFFF';
  };
  
  return (
    <Section className="bg-gradient-to-b from-pink-50 to-white">
      <Container>
        {step === 'template' && renderTemplates()}
        {step === 'customize' && renderCustomize()}
        {step === 'review' && renderReview()}
      </Container>
    </Section>
  );
} 