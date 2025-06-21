import { NextResponse } from 'next/server';
import { createLoggingClient } from '@/utils/supabase-logger';
import { invalidateCacheKey, invalidateByPattern, invalidateMultipleKeys } from '@/lib/redis';
import { ApiLogger } from '@/utils/api-logger';

// Create an API logger for cache invalidation endpoints
const logger = new ApiLogger('CacheInvalidationAPI');

export async function POST(request: Request) {
  const startTime = logger.request('POST', '/api/cache/invalidate');
  
  try {
    // Verify admin authorization
    const supabase = createLoggingClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // Check if user is authenticated and has admin role
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (userError || !userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { keys, patterns } = await request.json();
    const results = [];
    
    // Invalidate specific keys if provided
    if (Array.isArray(keys) && keys.length > 0) {
      await invalidateMultipleKeys(keys);
      results.push({ type: 'keys', count: keys.length });
    }
    
    // Invalidate patterns if provided
    if (Array.isArray(patterns) && patterns.length > 0) {
      for (const pattern of patterns) {
        await invalidateByPattern(pattern);
        results.push({ type: 'pattern', pattern });
      }
    }
    
    // Log the successful response
    logger.response('POST', '/api/cache/invalidate', 200, startTime, { results });
    
    return NextResponse.json({ success: true, results });
    
  } catch (error) {
    // Log any unexpected errors
    logger.error('POST', '/api/cache/invalidate', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 