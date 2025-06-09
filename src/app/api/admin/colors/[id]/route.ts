import { NextRequest, NextResponse } from 'next/server';
import { getColorById, updateColor, deleteColor } from '@/lib/colors';

// GET /api/admin/colors/[id] - Get a specific color
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Demo mode: Skip authentication
  try {
    const color = getColorById(params.id);
    
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
  // Demo mode: Skip authentication
  try {
    const body = await request.json();
    
    // Update color
    const updatedColor = updateColor(params.id, {
      name: body.name,
      hex: body.hex,
      isActive: body.isActive,
    });
    
    if (!updatedColor) {
      return NextResponse.json(
        { success: false, message: 'Color not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: updatedColor });
  } catch (error) {
    console.error(`Failed to update color ${params.id}:`, error);
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
  // Demo mode: Skip authentication
  try {
    const success = deleteColor(params.id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Color not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete color ${params.id}:`, error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 