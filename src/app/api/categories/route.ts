import { NextResponse } from 'next/server';
import { CategoryRepository } from '@/lib/supabase';

export async function GET() {
  try {
    const categories = await CategoryRepository.getAll();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 