import { createClient } from '@/utils/supabase/server';

interface AuthResult {
  success: boolean;
  message?: string;
  user?: Record<string, any>;
}

/**
 * Server-side login function for API routes
 */
export async function login(username: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      user: data.user
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.message || 'Authentication failed'
    };
  }
}

/**
 * Server-side logout function for API routes
 */
export async function logout(): Promise<AuthResult> {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        message: error.message
      };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: error.message || 'Failed to sign out'
    };
  }
}

/**
 * Server-side function to check if a user is authenticated
 * Use in server components or API routes
 */
export async function getSession() {
  const supabase = await createClient();
  return await supabase.auth.getSession();
}

/**
 * Server-side function to get the current user
 * Use in server components or API routes
 */
export async function getUser() {
  const { data } = await getSession();
  return data.session?.user || null;
} 