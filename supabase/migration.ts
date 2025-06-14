/**
 * FlowersShop Database Migration Script
 * 
 * This script helps migrate data from the old schema to the new normalized schema.
 * Run this after applying the schema_update.sql file.
 * 
 * Usage:
 * 1. Update the SUPABASE_URL and SUPABASE_KEY constants
 * 2. Run with: npx tsx supabase/migration.ts
 */

import { createClient } from '@supabase/supabase-js';

// Update these with your Supabase project details
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY'; // Use service role key for migrations

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrateTags() {
  console.log('Starting tag migration...');
  
  // Get all bouquets from the old schema backup
  const { data: oldBouquets, error } = await supabase
    .from('bouquets_backup')
    .select('id, tags');
    
  if (error) {
    console.error('Error fetching old bouquets:', error);
    return;
  }
  
  console.log(`Found ${oldBouquets.length} bouquets to process`);
  
  // Process each bouquet
  for (const bouquet of oldBouquets) {
    // Skip if no tags
    if (!bouquet.tags) continue;
    
    // Parse tags based on format (could be string or array)
    let tagNames: string[] = [];
    if (typeof bouquet.tags === 'string') {
      // Handle comma-separated string
      tagNames = bouquet.tags.split(',').map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(bouquet.tags)) {
      // Handle array format
      tagNames = bouquet.tags.filter(Boolean);
    }
    
    console.log(`Processing bouquet ${bouquet.id} with ${tagNames.length} tags`);
    
    // Process each tag
    for (const tagName of tagNames) {
      // Find or create tag
      let tagId: string;
      
      // Check if tag exists
      const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .single();
        
      if (existingTag) {
        tagId = existingTag.id;
      } else {
        // Create new tag
        const { data: newTag, error: tagError } = await supabase
          .from('tags')
          .insert({ name: tagName })
          .select('id')
          .single();
          
        if (tagError) {
          console.error(`Error creating tag ${tagName}:`, tagError);
          continue;
        }
        
        tagId = newTag.id;
      }
      
      // Create relationship in junction table
      const { error: relationError } = await supabase
        .from('bouquet_tags')
        .insert({
          bouquet_id: bouquet.id,
          tag_id: tagId
        });
        
      if (relationError) {
        // Ignore duplicate key errors
        if (!relationError.message.includes('duplicate key')) {
          console.error(`Error creating relationship for bouquet ${bouquet.id} and tag ${tagId}:`, relationError);
        }
      }
    }
  }
  
  console.log('Tag migration completed');
}

async function migrateFlowers() {
  console.log('Starting flower migration...');
  
  // This would depend on your old data structure
  // For example, if you had a flowers field in bouquets:
  
  const { data: oldBouquets, error } = await supabase
    .from('bouquets_backup')
    .select('id, flowers');
    
  if (error) {
    console.error('Error fetching old bouquets:', error);
    return;
  }
  
  for (const bouquet of oldBouquets) {
    if (!bouquet.flowers || !Array.isArray(bouquet.flowers)) continue;
    
    for (const flowerData of bouquet.flowers) {
      // Assuming flowerData has name and quantity
      const { name, quantity } = flowerData;
      
      // Find or create flower
      let flowerId: string;
      
      const { data: existingFlower } = await supabase
        .from('flowers')
        .select('id')
        .eq('name', name)
        .single();
        
      if (existingFlower) {
        flowerId = existingFlower.id;
      } else {
        // Create new flower with default values
        const { data: newFlower, error: flowerError } = await supabase
          .from('flowers')
          .insert({ 
            name, 
            price: 0, // Default price
            in_stock: 10, // Default stock
            low_stock_threshold: 5 // Default threshold
          })
          .select('id')
          .single();
          
        if (flowerError) {
          console.error(`Error creating flower ${name}:`, flowerError);
          continue;
        }
        
        flowerId = newFlower.id;
      }
      
      // Create relationship in junction table
      await supabase
        .from('bouquet_flowers')
        .insert({
          bouquet_id: bouquet.id,
          flower_id: flowerId,
          quantity: quantity || 1
        });
    }
  }
  
  console.log('Flower migration completed');
}

async function migrateOrderItems() {
  console.log('Starting order items migration...');
  
  // Get all order items from the backup
  const { data: oldOrderItems, error } = await supabase
    .from('order_items_backup')
    .select('*');
    
  if (error) {
    console.error('Error fetching old order items:', error);
    return;
  }
  
  console.log(`Found ${oldOrderItems.length} order items to migrate`);
  
  // Create a mapping of old bouquet IDs to new bouquet IDs if needed
  // This assumes the bouquet IDs haven't changed
  
  // Insert order items with the same IDs to maintain references
  for (const item of oldOrderItems) {
    const { error: insertError } = await supabase
      .from('order_items')
      .insert({
        id: item.id,
        order_id: item.order_id,
        bouquet_id: item.bouquet_id,
        quantity: item.quantity,
        price: item.price,
        created_at: item.created_at,
        updated_at: item.updated_at
      });
      
    if (insertError) {
      console.error(`Error migrating order item ${item.id}:`, insertError);
    }
  }
  
  console.log('Order items migration completed');
}

async function main() {
  try {
    console.log('Starting migration...');
    
    // First backup the old tables
    console.log('Creating backup of old tables...');
    await supabase.rpc('create_backup_tables');
    
    // Migrate tags
    await migrateTags();
    
    // Migrate flowers
    await migrateFlowers();
    
    // Migrate order items
    await migrateOrderItems();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
main(); 