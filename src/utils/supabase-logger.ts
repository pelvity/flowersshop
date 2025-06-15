import { createClient as createClientBrowser } from '@/utils/supabase/client';
import { createClient as createServerClient, createAdminClient } from '@/utils/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

// Function to create a logging-enabled Supabase client for browser
export function createLoggingClient(): SupabaseClient {
  const supabase = createClientBrowser();
  
  return createLoggingProxy(supabase);
}

// Function to create a logging-enabled Supabase client for server components
export async function createServerLoggingClient(): Promise<SupabaseClient> {
  const supabase = await createServerClient();
  
  return createLoggingProxy(supabase);
}

// Function to create a logging-enabled Supabase client for admin operations
export async function createAdminLoggingClient(): Promise<SupabaseClient> {
  const supabase = await createAdminClient();
  
  return createLoggingProxy(supabase);
}

// Create a proxy that adds logging to any Supabase client
function createLoggingProxy(supabase: SupabaseClient): SupabaseClient {
  // Special handling for storage - don't proxy storage operations
  const originalStorage = supabase.storage;
  
  // Return a proxy that intercepts and logs all method calls
  return new Proxy(supabase, {
    get(target, prop, receiver) {
      // Special case for storage to avoid Illegal invocation errors
      if (prop === 'storage') {
        return originalStorage;
      }
      
      const value = Reflect.get(target, prop, receiver);
      
      // If the property is a function
      if (typeof value === 'function') {
        // Wrap the function to add logging
        return function(this: any, ...args: any[]) {
          const methodName = String(prop);
          const timestamp = new Date().toISOString();
          
          console.log(`[${timestamp}] SUPABASE REQUEST: ${methodName}`, {
            method: methodName,
            arguments: args.map(arg => 
              // Don't log entire objects, just their types to avoid cluttering the console
              typeof arg === 'object' ? `[${arg === null ? 'null' : 'Object'}]` : arg
            ),
          });
          
          // Call the original method
          const result = value.apply(this === globalThis ? target : this, args);
          
          // If the result is a promise, log when it resolves or rejects
          if (result && typeof result.then === 'function') {
            return result.then((data: any) => {
              console.log(`[${timestamp}] SUPABASE RESPONSE: ${methodName}`, {
                success: true,
                status: data?.status || 'unknown',
                count: Array.isArray(data?.data) ? data.data.length : (data?.data ? 1 : 0),
                error: data?.error || null,
              });
              return data;
            }).catch((error: any) => {
              console.error(`[${timestamp}] SUPABASE ERROR: ${methodName}`, {
                success: false,
                error: error?.message || error,
              });
              throw error;
            });
          }
          
          return result;
        };
      } else if (typeof value === 'object' && value !== null) {
        // Recursively proxy nested objects (like supabase.from('table'))
        return new Proxy(value, {
          get(objTarget, objProp, objReceiver) {
            const objValue = Reflect.get(objTarget, objProp, objReceiver);
            
            if (typeof objValue === 'function') {
              return function(this: any, ...args: any[]) {
                const subMethodName = `${String(prop)}.${String(objProp)}`;
                const timestamp = new Date().toISOString();
                
                console.log(`[${timestamp}] SUPABASE REQUEST: ${subMethodName}`, {
                  method: subMethodName,
                  arguments: args.map(arg => 
                    typeof arg === 'object' ? `[${arg === null ? 'null' : 'Object'}]` : arg
                  ),
                });
                
                // Preserve the 'this' context by using the proxy receiver
                const result = objValue.apply(this === globalThis ? objTarget : this, args);
                
                if (result && typeof result.then === 'function') {
                  return result.then((data: any) => {
                    console.log(`[${timestamp}] SUPABASE RESPONSE: ${subMethodName}`, {
                      success: true,
                      status: data?.status || 'unknown',
                      count: Array.isArray(data?.data) ? data.data.length : (data?.data ? 1 : 0),
                      error: data?.error || null,
                    });
                    return data;
                  }).catch((error: any) => {
                    console.error(`[${timestamp}] SUPABASE ERROR: ${subMethodName}`, {
                      success: false,
                      error: error?.message || error,
                    });
                    throw error;
                  });
                }
                
                return result;
              };
            }
            
            return objValue;
          }
        });
      }
      
      return value;
    }
  });
} 