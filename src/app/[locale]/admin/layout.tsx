'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Package, Grid, Tag, Palette, LogOut, Menu, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useLocale, useTranslations } from 'next-intl';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('admin');
  const [user, setUser] = useState<{ name: string; username: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const supabase = createClient();
  
  // Skip authentication on login page
  const isLoginPage = pathname?.includes('/admin/login');
  
  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }
    
    // Check Supabase authentication
    const checkAuth = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          console.log('No active session found');
          redirectToLogin();
          return;
        }
        
        // We have a valid session
        const userData = {
          name: sessionData.session.user.user_metadata?.name || 'Admin User',
          username: sessionData.session.user.email || '',
          role: sessionData.session.user.user_metadata?.role || 'user'
        };
        
        setUser(userData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to check auth:', err);
        redirectToLogin();
      }
    };
    
    const redirectToLogin = () => {
      const url = `/${locale}/admin/login?from=${encodeURIComponent(pathname || '')}`;
      router.push(url);
    };
    
    checkAuth();
  }, [isLoginPage, router, pathname, supabase, locale]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push(`/${locale}/admin/login`);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  // Show login page without layout
  if (isLoginPage) {
    return children;
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  const navigation = [
    { name: t('navigation.dashboard'), href: `/${locale}/admin/dashboard`, icon: Home },
    { name: t('navigation.bouquets'), href: `/${locale}/admin/bouquets`, icon: Package },
    { name: t('navigation.flowers'), href: `/${locale}/admin/flowers`, icon: Palette },
    { name: t('navigation.categories'), href: `/${locale}/admin/categories`, icon: Grid },
    { name: t('navigation.tags'), href: `/${locale}/admin/tags`, icon: Tag },
    { name: t('navigation.colors'), href: `/${locale}/admin/colors`, icon: Palette },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-pink-600">{t('navigation.flowershop')}</span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="ml-2 p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="pt-5 pb-4">
              <div className="flex items-center justify-between px-4">
                <div className="flex-shrink-0">
                  <span className="text-xl font-bold text-pink-600">{t('navigation.flowershop')}</span>
                </div>
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              <div className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-4 py-2 text-base font-medium rounded-md ${
                        isActive 
                          ? 'bg-pink-50 text-pink-600' 
                          : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                      }`}
                    >
                      <item.icon 
                        className={`mr-3 h-6 w-6 ${
                          isActive ? 'text-pink-600' : 'text-gray-400 group-hover:text-pink-600'
                        }`} 
                      />
                      {item.name}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="group flex items-center w-full px-4 py-2 text-base font-medium text-gray-600 hover:bg-pink-50 hover:text-pink-600 rounded-md"
                >
                  <LogOut className="mr-3 h-6 w-6 text-gray-400 group-hover:text-pink-600" />
                  {t('navigation.logout')}
                </button>
              </div>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">{user?.name}</p>
                  <p className="text-sm font-medium text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-bold text-pink-600">{t('navigation.flowershop')}</span>
          </div>
          <div className="mt-8 px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-pink-50 text-pink-600' 
                      : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-pink-600' : 'text-gray-400 group-hover:text-pink-600'
                    }`} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs font-medium text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center text-sm text-gray-500 hover:text-pink-600"
          >
            <LogOut className="h-5 w-5 mr-1" />
            {t('navigation.logout')}
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-10 pt-8 lg:pt-0">
          <div className="mt-8 lg:mt-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-pink-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 