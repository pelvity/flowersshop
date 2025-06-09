import { NextResponse } from 'next/server';
import { BouquetRepository } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bouquetId = params.id;
    if (!bouquetId) {
      return NextResponse.json(
        { error: 'Bouquet ID is required' },
        { status: 400 }
      );
    }

    const bouquetWithFlowers = await BouquetRepository.getBouquetWithFlowers(bouquetId);
    return NextResponse.json(bouquetWithFlowers);
  } catch (error) {
    console.error('Error fetching bouquet flowers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bouquet flowers' },
      { status: 500 }
    );
  }
} 