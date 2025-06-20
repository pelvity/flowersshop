import { logout } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const result = await logout();
    
    return NextResponse.json(
      { success: result.success, message: result.message },
      { status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 