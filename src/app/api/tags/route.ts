import { NextResponse } from 'next/server';
import { TagRepository } from '@/lib/supabase';

// Get all tags
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

// Create a new tag
export async function POST(request: Request) {
  try {
    const tagData = await request.json();
    
    if (!tagData.name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    const newTag = await TagRepository.create({
      name: tagData.name
    });
    
    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}

// Update an existing tag
export async function PUT(request: Request) {
  try {
    const tagData = await request.json();
    
    if (!tagData.id) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }
    
    if (!tagData.name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }
    
    const updatedTag = await TagRepository.update(tagData.id, {
      name: tagData.name
    });
    
    return NextResponse.json(updatedTag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

// Delete a tag
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
      );
    }
    
    await TagRepository.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
} 