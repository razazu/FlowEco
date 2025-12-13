// ========================================
// FlowEco API - Response Helpers
// ========================================

export function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

export function errorResponse(message, status = 400, corsHeaders = {}) {
  return jsonResponse({ success: false, error: message }, status, corsHeaders);
}

export function successResponse(data = {}, corsHeaders = {}) {
  return jsonResponse({ success: true, ...data }, 200, corsHeaders);
}
