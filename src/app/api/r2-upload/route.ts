import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set max duration to 60 seconds for uploads

/**
 * API route to forward file uploads to Cloudflare Worker
 */
export async function POST(request: NextRequest) {
  try {
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    
    if (!workerUrl) {
      return NextResponse.json(
        { error: 'Worker URL is not configured', code: 'CONFIG_ERROR' }, 
        { status: 500 }
      );
    }

    // Clone the request and forward it to the worker
    const formData = await request.formData();

    // Forward the request to the worker
    const response = await fetch(workerUrl, {
      method: 'POST',
      body: formData,
    });

    // Get the response from the worker
    const data = await response.json();

    // Return the response with original status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error forwarding to worker:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'File upload failed', 
      message: errorMessage,
      details: JSON.stringify(error) 
    }, { status: 500 });
  }
}

/**
 * Forward GET requests to the worker
 */
export async function GET(request: NextRequest) {
  try {
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    
    if (!workerUrl) {
      return NextResponse.json(
        { error: 'Worker URL is not configured' }, 
        { status: 500 }
      );
    }
    
    // Extract path and query params
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/r2-upload', '');
    const queryString = url.search;
    
    // Construct worker URL with path and query params
    const targetUrl = `${workerUrl}${path}${queryString}`;
    
    // Forward the request
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        // Forward necessary headers
        'Accept': request.headers.get('Accept') || '*/*',
        'Range': request.headers.get('Range') || '',
      }
    });
    
    // Return the response from the worker with appropriate headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Error forwarding to worker:', error);
    return NextResponse.json({ error: 'File retrieval failed' }, { status: 500 });
  }
}

/**
 * Forward DELETE requests to the worker
 */
export async function DELETE(request: NextRequest) {
  try {
    const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL;
    
    if (!workerUrl) {
      return NextResponse.json(
        { error: 'Worker URL is not configured' }, 
        { status: 500 }
      );
    }

    // Extract path
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/r2-upload', '');
    
    // Construct worker URL with path
    const targetUrl = `${workerUrl}${path}`;

    // Forward the request
    const response = await fetch(targetUrl, {
      method: 'DELETE'
    });

    // Return the response from the worker
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error forwarding to worker:', error);
    return NextResponse.json({ error: 'File deletion failed' }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 