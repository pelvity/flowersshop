import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

// Get all categories
export async function GET() {
  try {
    // Use server-side admin client with service role
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Failed to fetch categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// Create a new category
export async function POST(req: NextRequest) {
  try {
    // Use server-side admin client with service role
    const supabase = await createAdminClient();
    
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    
    // Generate UUID for the category
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id,
        name,
        description,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

// Update an existing category
export async function PUT(req: NextRequest) {
  try {
    // Use server-side admin client with service role
    const supabase = await createAdminClient();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if(!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }
    
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('categories')
      .update({ 
        name, 
        description,
        updated_at: now 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// Delete a category
export async function DELETE(req: NextRequest) {
  try {
    // Use server-side admin client with service role
    const supabase = await createAdminClient();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
} 