import { NextResponse } from 'next/server';
import { createLoggingClient } from '@/utils/supabase-logger';

export async function GET() {
  try {
    const supabase = createLoggingClient();
    
    // Example 1: Simple query - fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      throw categoriesError;
    }
    
    // Example 2: Filtered query - fetch featured bouquets
    const { data: bouquets, error: bouquetsError } = await supabase
      .from('bouquets')
      .select('id, name, price')
      .eq('featured', true)
      .limit(3);
    
    if (bouquetsError) {
      throw bouquetsError;
    }
    
    // Example 3: Join query with filters
    const { data: flowersInBouquets, error: flowersError } = await supabase
      .from('bouquet_flowers')
      .select(`
        bouquet_id,
        quantity,
        flowers (id, name, price)
      `)
      .limit(5);
    
    if (flowersError) {
      throw flowersError;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Logged queries to Supabase successfully',
      data: {
        categories,
        bouquets,
        flowersInBouquets
      }
    });
  } catch (error) {
    console.error('Error in log example endpoint:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 