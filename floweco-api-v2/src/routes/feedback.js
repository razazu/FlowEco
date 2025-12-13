// ========================================
// FlowEco API - Feedback Routes
// ========================================

import { jsonResponse } from '../utils/response.js';

// ========== CREATE FEEDBACK ==========
export async function handleCreateFeedback(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { type, message, rating } = body;

  if (!message) {
    return jsonResponse({ success: false, error: 'הודעה היא שדה חובה' }, 400, corsHeaders);
  }

  const id = 'fb-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

  await env.DB.prepare(
    `INSERT INTO feedback (id, user_id, type, message, rating, status) 
     VALUES (?, ?, ?, ?, ?, 'new')`
  ).bind(id, userId, type || 'general', message, rating || null).run();

  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}

// ========== GET USER FEEDBACK ==========
export async function handleGetFeedback(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();

  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
