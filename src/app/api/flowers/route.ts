import { NextResponse } from 'next/server';
import { FlowerRepository } from '@/lib/supabase';

export async function GET() {
  try {
    const flowers = await FlowerRepository.getAll();
    return NextResponse.json(flowers);
  } catch (error) {
    console.error('Error fetching flowers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flowers' },
      { status: 500 }
    );
  }
} 