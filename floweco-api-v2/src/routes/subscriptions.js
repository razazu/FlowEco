// ========================================
// FlowEco API - Subscriptions Routes
// ========================================

import { jsonResponse } from '../utils/response.js';
import { sendTestNotificationEmail } from '../utils/email.js';

// ========== GET ALL SUBSCRIPTIONS ==========
export async function handleGetSubscriptions(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY next_billing_date ASC'
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

// ========== GET SINGLE SUBSCRIPTION ==========
export async function handleGetSubscription(env, userId, subId, corsHeaders) {
  const subscription = await env.DB.prepare(
    'SELECT * FROM subscriptions WHERE id = ? AND user_id = ?'
  ).bind(subId, userId).first();
  
  if (!subscription) {
    return jsonResponse({ success: false, error: 'מנוי לא נמצא' }, 404, corsHeaders);
  }
  
  return jsonResponse({ success: true, data: subscription }, 200, corsHeaders);
}

// ========== CREATE SUBSCRIPTION ==========
export async function handleCreateSubscription(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  
  if (!body.name || !body.amount || !body.billing_cycle) {
    return jsonResponse({ success: false, error: 'שם, סכום ומחזור חיוב הם שדות חובה' }, 400, corsHeaders);
  }

  // Get user's default notify days
  const user = await env.DB.prepare(
    'SELECT default_notify_days FROM users WHERE id = ?'
  ).bind(userId).first();
  const defaultNotifyDays = user?.default_notify_days ?? 3;

  await env.DB.prepare(
    `INSERT INTO subscriptions (
      id, user_id, name, amount, billing_cycle, category, 
      next_billing_date, start_date, status, notify_before_days, notes, icon, color
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, userId, body.name, body.amount, body.billing_cycle,
    body.category || 'מנויים',
    body.next_billing_date || body.start_date || new Date().toISOString().split('T')[0],
    body.start_date || new Date().toISOString().split('T')[0],
    body.status || 'active',
    body.notify_before_days ?? defaultNotifyDays,
    body.notes || null,
    body.icon || '📺',
    body.color || '#8B5CF6'
  ).run();

  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}

// ========== UPDATE SUBSCRIPTION ==========
export async function handleUpdateSubscription(request, env, userId, subId, corsHeaders) {
  const body = await request.json();

  await env.DB.prepare(
    `UPDATE subscriptions SET 
      name = ?, amount = ?, billing_cycle = ?, category = ?,
      next_billing_date = ?, status = ?, notify_before_days = ?, 
      notes = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?`
  ).bind(
    body.name, body.amount, body.billing_cycle, body.category || 'מנויים',
    body.next_billing_date, body.status || 'active',
    body.notify_before_days ?? 3, body.notes || null,
    body.icon || '📺', body.color || '#8B5CF6',
    subId, userId
  ).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== DELETE SUBSCRIPTION ==========
export async function handleDeleteSubscription(env, userId, subId, corsHeaders) {
  await env.DB.prepare('DELETE FROM subscriptions WHERE id = ? AND user_id = ?')
    .bind(subId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== CANCEL SUBSCRIPTION ==========
export async function handleCancelSubscription(env, userId, subId, corsHeaders) {
  await env.DB.prepare(
    `UPDATE subscriptions SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(subId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== REACTIVATE SUBSCRIPTION ==========
export async function handleReactivateSubscription(env, userId, subId, corsHeaders) {
  await env.DB.prepare(
    `UPDATE subscriptions SET status = 'active', updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(subId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== GET SUBSCRIPTIONS SUMMARY ==========
export async function handleSubscriptionsSummary(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?'
  ).bind(userId).all();
  
  const subs = results || [];
  const active = subs.filter(s => s.status === 'active');
  
  let monthlyTotal = 0;
  for (const sub of active) {
    const amount = parseFloat(sub.amount) || 0;
    switch (sub.billing_cycle) {
      case 'weekly': monthlyTotal += amount * 4.33; break;
      case 'monthly': monthlyTotal += amount; break;
      case 'quarterly': monthlyTotal += amount / 3; break;
      case 'yearly': monthlyTotal += amount / 12; break;
      default: monthlyTotal += amount;
    }
  }

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const upcoming = active.filter(s => {
    const nextDate = new Date(s.next_billing_date);
    return nextDate >= today && nextDate <= nextWeek;
  });

  return jsonResponse({
    success: true,
    data: {
      total: subs.length,
      active: active.length,
      cancelled: subs.filter(s => s.status === 'cancelled').length,
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      yearlyTotal: Math.round(monthlyTotal * 12 * 100) / 100,
      upcomingCount: upcoming.length,
      upcoming: upcoming
    }
  }, 200, corsHeaders);
}

// ========== TEST NOTIFICATION ==========
export async function handleTestNotification(env, userId, corsHeaders) {
  const user = await env.DB.prepare(
    'SELECT email, name FROM users WHERE id = ?'
  ).bind(userId).first();
  
  if (!user) {
    return jsonResponse({ success: false, error: 'משתמש לא נמצא' }, 404, corsHeaders);
  }
  
  const sent = await sendTestNotificationEmail(user.email, user.name, env.RESEND_API_KEY);
  
  if (!sent) {
    return jsonResponse({ success: false, error: 'שגיאה בשליחת אימייל' }, 500, corsHeaders);
  }
  
  return jsonResponse({ success: true, message: 'הודעת בדיקה נשלחה!' }, 200, corsHeaders);
}
