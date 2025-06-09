import { NextResponse } from 'next/server';
import { TagRepository } from '@/lib/supabase';

export async function GET() {
  try {
    const tags = await TagRepository.getAll();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
} 