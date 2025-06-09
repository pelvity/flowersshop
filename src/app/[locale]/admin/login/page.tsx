'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Flower2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useTranslations, useLocale } from 'next-intl';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('admin');
  
  const redirectPath = searchParams.get('from') || `/${locale}/admin/dashboard`;
  const supabase = createClient();

  // Effect to check if user is already logged in
  useEffect(() => {
    const checkExistingSession = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getSession();
      setIsLoading(false);
      
      if (data.session) {
        // Already logged in, redirect to dashboard or requested page
        console.log('Already authenticated, redirecting to', redirectPath);
        router.push(redirectPath);
      }
    };
    
    checkExistingSession();
  }, [router, supabase, redirectPath]);

  // Effect to handle redirection after successful login
  useEffect(() => {
    if (loginSuccess) {
      console.log('Login successful, redirecting to', redirectPath);
      setTimeout(() => {
        router.push(redirectPath);
      }, 500); // Small delay to ensure UI feedback
    }
  }, [loginSuccess, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use Supabase authentication directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message || 'Authentication failed');
      }

      if (!data.user || !data.session) {
        throw new Error('No user data returned');
      }

      // User successfully logged in
      console.log('Login successful');
      
      // Store user data in localStorage (already done by Supabase)
      const userData = {
        id: data.user.id,
        username: data.user.email || '',
        name: data.user.user_metadata?.name || 'Admin User',
        role: data.user.user_metadata?.role || 'user'
      };
      
      localStorage.setItem('adminUser', JSON.stringify(userData));
      
      // Set login success state to trigger redirect
      setLoginSuccess(true);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-pink-100 rounded-full flex items-center justify-center">
            <Flower2 className="h-10 w-10 text-pink-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.login')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('navigation.flowershop')}
          </p>
          {!redirectPath.includes('/admin/dashboard') && (
            <p className="mt-2 text-center text-sm text-pink-600">
              You will be redirected to your requested page after login
            </p>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {loginSuccess && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Login successful! Redirecting...
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || loginSuccess}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading || loginSuccess ? 'bg-pink-400' : 'bg-pink-600 hover:bg-pink-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg
                    className="animate-spin h-5 w-5 text-pink-300"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              ) : null}
              {isLoading ? 'Signing in...' : t('auth.signIn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 