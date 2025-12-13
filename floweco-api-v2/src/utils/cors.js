// ========================================
// FlowEco API - CORS Handling
// ========================================

import { ALLOWED_ORIGINS } from './constants.js';

export function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  
  const isAllowedOrigin = ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.flowraz.io')
  );
  
  const allowOrigin = isAllowedOrigin ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-App-Version, X-PWA-Installed',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  };
}

export function handleOptions(corsHeaders) {
  return new Response(null, { headers: corsHeaders });
}
