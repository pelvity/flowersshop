import { NextRequest, NextResponse } from 'next/server';
import { ColorRepository } from '@/lib/repositories/color-repository';

const colorRepository = new ColorRepository();

// GET /api/admin/colors/[id] - Get a specific color
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Demo mode: Skip authentication
  try {
    const color = await colorRepository.getById(params.id);
    
    if (!color) {
      return NextResponse.json(
        { success: false, message: 'Color not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: color });
  } catch (error) {
    console.error(`Failed to get color ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/colors/[id] - Update a color
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Validate input
    if (!body.name || !body.hex) {
      return NextResponse.json(
        { success: false, message: 'Name and hex color code are required' },
        { status: 400 }
      );
    }
    
    // Update color
    const updatedColor = await colorRepository.update(id, {
      name: body.name,
      hex_code: body.hex,
    });
    
    if (!updatedColor) {
      return NextResponse.json(
        { success: false, message: 'Color not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedColor });
  } catch (error) {
    console.error('Failed to update color:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/colors/[id] - Delete a color
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const success = await colorRepository.delete(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete color' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete color:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 