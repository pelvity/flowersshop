import { NextResponse } from 'next/server';
import { catalogRepository } from '@/lib/repositories/catalog';

export async function GET() {
  try {
    // Get featured bouquets from Supabase
    const featuredBouquets = await catalogRepository.getFeaturedBouquets();
    
    // Return the featured bouquets as JSON
    return NextResponse.json(featuredBouquets);
  } catch (error) {
    console.error('Error fetching featured bouquets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured bouquets' },
      { status: 500 }
    );
  }
} 