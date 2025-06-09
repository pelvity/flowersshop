/**
 * API Logger Utility
 * 
 * Simple utilities to log API requests, responses and errors
 * in a consistent format for better debugging
 */

// Log an API request
export function logRequest(method: string, endpoint: string, params?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API REQUEST] ${method} ${endpoint}`, {
    params: params || {},
  });
}

// Log an API response
export function logResponse(method: string, endpoint: string, status: number, data?: any, duration?: number) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API RESPONSE] ${method} ${endpoint} (${status})`, {
    duration: duration !== undefined ? `${duration.toFixed(2)}ms` : undefined,
    dataSize: data ? (Array.isArray(data) ? data.length : 1) : 0,
  });
}

// Log an API error
export function logError(method: string, endpoint: string, error: any, params?: any) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [API ERROR] ${method} ${endpoint}`, {
    error: error?.message || error,
    params: params || {},
    stack: error?.stack,
  });
}

// Class-based API logger
export class ApiLogger {
  private context: string;
  
  constructor(context: string) {
    this.context = context;
  }
  
  request(method: string, endpoint: string, params?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.context}] REQUEST ${method} ${endpoint}`, {
      params: params || {},
    });
    return performance.now(); // Return start time for duration calculation
  }
  
  response(method: string, endpoint: string, status: number, startTime: number, data?: any) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] [${this.context}] RESPONSE ${method} ${endpoint} (${status})`, {
      duration: `${duration.toFixed(2)}ms`,
      dataSize: data ? (Array.isArray(data) ? data.length : 1) : 0,
    });
    
    return duration;
  }
  
  error(method: string, endpoint: string, error: any, params?: any) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [${this.context}] ERROR ${method} ${endpoint}`, {
      error: error?.message || error,
      params: params || {},
      stack: error?.stack,
    });
  }
} 