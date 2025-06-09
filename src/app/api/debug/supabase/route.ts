import { NextResponse } from 'next/server';
import { createServerLoggingClient } from '@/utils/supabase-logger';
import { ApiLogger } from '@/utils/api-logger';

const logger = new ApiLogger('SupabaseDebug');

export async function GET(request: Request) {
  const startTime = logger.request('GET', '/api/debug/supabase');
  
  try {
    // Use our logging-enabled Supabase client
    const supabase = await createServerLoggingClient();
    
    // Run a simple query to test logging
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(3);
      
    if (categoriesError) {
      logger.error('GET', '/api/debug/supabase', categoriesError);
      throw categoriesError;
    }
    
    // Try a second query
    const { data: bouquets, error: bouquetsError } = await supabase
      .from('bouquets')
      .select('id, name, price')
      .limit(3);
      
    if (bouquetsError) {
      logger.error('GET', '/api/debug/supabase', bouquetsError);
      throw bouquetsError;
    }
    
    // Log successful response
    logger.response('GET', '/api/debug/supabase', 200, startTime, {
      categories,
      bouquets
    });
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Supabase debugging endpoint executed successfully',
      data: { 
        categories: categories?.length || 0,
        bouquets: bouquets?.length || 0,
        samples: {
          category: categories?.[0] || null,
          bouquet: bouquets?.[0] || null
        }
      }
    });
  } catch (error) {
    // Enhanced error logging
    logger.error('GET', '/api/debug/supabase', error);
    
    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500 });
  }
} 