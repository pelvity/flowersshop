import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { Database } from '@/types/supabase';

// Define the Tag interface
interface Tag {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Get all tags
export async function GET(req: NextRequest) {
  try {
    // Use server-side admin client with service role
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Failed to fetch tags:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// Create a new tag
export async function POST(req: NextRequest) {
  try {
    // Use server-side admin client with service role
    const supabase = await createAdminClient();
    
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }
    
    // Generate UUID for the tag
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('tags')
      .insert({
        id,
        name,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create tag:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Failed to create tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

// Update an existing tag
export async function PUT(req: NextRequest) {
  try {
    // Use server-side admin client with service role
    const supabase = await createAdminClient();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if(!id) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
    }

    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }
    
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('tags')
      .update({ 
        name, 
        updated_at: now 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update tag:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update tag:', error);
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

// Delete a tag
export async function DELETE(req: NextRequest) {
  try {
    // Use server-side admin client with service role
    const supabase = await createAdminClient();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete tag:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Failed to delete tag:', error);
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
} 