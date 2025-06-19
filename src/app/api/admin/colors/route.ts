import { NextRequest, NextResponse } from 'next/server';
import { ColorRepository } from '@/lib/repositories/color-repository';

const colorRepository = new ColorRepository();

// GET /api/admin/colors - Get all colors
export async function GET(request: NextRequest) {
  // Demo mode: Skip authentication
  try {
    const colors = await colorRepository.getAll();
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
    const newColor = await colorRepository.create({
      name: body.name,
      hex_code: body.hex,
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