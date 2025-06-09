import { NextRequest, NextResponse } from 'next/server';
import { getAllColors, addColor } from '@/lib/colors';

// GET /api/admin/colors - Get all colors
export async function GET(request: NextRequest) {
  // Demo mode: Skip authentication
  try {
    const colors = getAllColors();
    return NextResponse.json({ success: true, data: colors });
  } catch (error) {
    console.error('Failed to get colors:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/colors - Create a new color
export async function POST(request: NextRequest) {
  // Demo mode: Skip authentication
  try {
    const body = await request.json();
    
    // Validate input
    if (!body.name || !body.hex) {
      return NextResponse.json(
        { success: false, message: 'Name and hex color code are required' },
        { status: 400 }
      );
    }
    
    // Create new color
    const newColor = addColor({
      name: body.name,
      hex: body.hex,
      isActive: body.isActive !== false, // Default to true if not provided
    });
    
    return NextResponse.json(
      { success: true, data: newColor },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create color:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 