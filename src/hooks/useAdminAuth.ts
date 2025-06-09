import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

export const useAdminAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if we have a user in Supabase auth
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check current auth state with Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          throw error;
        }
        
        if (data?.session) {
          // We have a valid session
          const userData = {
            id: data.session.user.id,
            username: data.session.user.email || '',
            name: data.session.user.user_metadata?.name || 'Admin User',
            role: data.session.user.user_metadata?.role || 'user'
          };
          
          setUser(userData);
          
          // Store the user in localStorage for convenience
          localStorage.setItem('adminUser', JSON.stringify(userData));
        } else {
          // No session found
          setUser(null);
          localStorage.removeItem('adminUser');
          
          // If on admin page, redirect to login
          if (window.location.pathname.startsWith('/admin') && 
              window.location.pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
        localStorage.removeItem('adminUser');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Update user
          const userData = {
            id: session.user.id,
            username: session.user.email || '',
            name: session.user.user_metadata?.name || 'Admin User',
            role: session.user.user_metadata?.role || 'user'
          };
          
          setUser(userData);
          localStorage.setItem('adminUser', JSON.stringify(userData));
        } else if (event === 'SIGNED_OUT') {
          // Clear user
          setUser(null);
          localStorage.removeItem('adminUser');
          
          // If on admin page, redirect to login
          if (window.location.pathname.startsWith('/admin') && 
              window.location.pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      }
    );

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Add authentication headers to fetch requests
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      throw new Error('No active session');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${data.session.access_token}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Handle unauthorized - token expired
      logout();
      throw new Error('Session expired');
    }

    return response;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    fetchWithAuth,
  };
}; 