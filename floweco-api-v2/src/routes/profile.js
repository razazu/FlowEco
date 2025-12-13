// ========================================
// FlowEco API - Profile Routes
// ========================================

import { jsonResponse } from '../utils/response.js';
import { hashPassword, verifyPassword, parseUserAgent } from '../utils/auth.js';

// ========== UPDATE PROFILE ==========
export async function handleUpdateProfile(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { name, email } = body;

  if (!name || !email) {
    return jsonResponse({ success: false, error: 'נא למלא את כל השדות' }, 400, corsHeaders);
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ? AND id != ?')
    .bind(email, userId).first();
  if (existing) {
    return jsonResponse({ success: false, error: 'האימייל כבר קיים במערכת' }, 400, corsHeaders);
  }

  await env.DB.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?')
    .bind(name, email, userId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== CHANGE PASSWORD ==========
export async function handleChangePassword(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return jsonResponse({ success: false, error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }, 400, corsHeaders);
  }

  const user = await env.DB.prepare('SELECT password_hash FROM users WHERE id = ?')
    .bind(userId).first();
  if (!user) {
    return jsonResponse({ success: false, error: 'משתמש לא נמצא' }, 404, corsHeaders);
  }

  const isValid = await verifyPassword(currentPassword, user.password_hash, env.PASSWORD_SALT);
  if (!isValid) {
    return jsonResponse({ success: false, error: 'הסיסמה הנוכחית שגויה' }, 400, corsHeaders);
  }

  const newHash = await hashPassword(newPassword, env.PASSWORD_SALT);
  await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .bind(newHash, userId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== DELETE ACCOUNT ==========
export async function handleDeleteAccount(env, userId, corsHeaders) {
  // Delete all user data
  const tables = [
    'expenses', 'incomes', 'budgets', 'cards', 'loans', 
    'installment_plans', 'categories', 'feedback', 'user_errors', 
    'user_activity_log', 'verification_codes', 'subscriptions',
    'financial_goals', 'goal_contributions', 'excluded_recurring',
    'business_expenses', 'business_incomes', 'business_clients', 'business_suppliers'
  ];
  
  for (const table of tables) {
    try {
      await env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(userId).run();
    } catch (e) {
      // Table might not exist, continue
    }
  }
  
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();

  return jsonResponse({ success: true, message: 'החשבון נמחק בהצלחה' }, 200, corsHeaders);
}

// ========== UPDATE PWA STATUS ==========
export async function handleUpdatePwaStatus(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { installed } = body;

  await env.DB.prepare('UPDATE users SET pwa_installed = ? WHERE id = ?')
    .bind(installed ? 1 : 0, userId).run();

  await env.DB.prepare(
    'INSERT INTO user_activity_log (user_id, action_type, details) VALUES (?, ?, ?)'
  ).bind(userId, 'pwa_install', JSON.stringify({ installed })).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== UPDATE APP INFO ==========
export async function handleUpdateAppInfo(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { app_version, pwa_installed } = body;

  const userAgent = request.headers.get('User-Agent') || '';
  const { deviceType, browser } = parseUserAgent(userAgent);

  const pwaValue = pwa_installed ? 1 : null;

  await env.DB.prepare(
    `UPDATE users SET 
     app_version = COALESCE(?, app_version),
     pwa_installed = CASE 
       WHEN pwa_installed = 1 THEN 1 
       WHEN ? = 1 THEN 1 
       ELSE pwa_installed 
     END,
     user_agent = ?,
     device_type = ?,
     browser = ?
     WHERE id = ?`
  ).bind(app_version || null, pwaValue, userAgent, deviceType, browser, userId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== REPORT ERROR ==========
export async function handleReportError(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { error_message, error_stack, page } = body;

  if (!error_message) {
    return jsonResponse({ success: false, error: 'Missing error message' }, 400, corsHeaders);
  }

  await env.DB.prepare(
    'INSERT INTO user_errors (user_id, error_message, error_stack, page) VALUES (?, ?, ?, ?)'
  ).bind(userId, error_message.substring(0, 500), error_stack?.substring(0, 2000) || null, page || null).run();

  await env.DB.prepare(
    `UPDATE users SET 
     error_count = COALESCE(error_count, 0) + 1,
     last_error = ?,
     last_error_at = ?
     WHERE id = ?`
  ).bind(error_message.substring(0, 500), new Date().toISOString(), userId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== GET USER SETTINGS ==========
export async function handleGetSettings(env, userId, corsHeaders) {
  const user = await env.DB.prepare(`
    SELECT notifications_enabled, default_notify_days, budget_alerts, budget_alert_threshold
    FROM users WHERE id = ?
  `).bind(userId).first();
  
  return jsonResponse({
    success: true,
    data: {
      notifications_enabled: user?.notifications_enabled ?? 1,
      subs_reminders: 1,
      default_notify_days: user?.default_notify_days ?? 3,
      budget_alerts: user?.budget_alerts ?? 1,
      budget_alert_threshold: user?.budget_alert_threshold ?? 80
    }
  }, 200, corsHeaders);
}

// ========== UPDATE USER SETTINGS ==========
export async function handleUpdateSettings(request, env, userId, corsHeaders) {
  const body = await request.json();
  
  await env.DB.prepare(`
    UPDATE users 
    SET notifications_enabled = ?, default_notify_days = ?, budget_alerts = ?, budget_alert_threshold = ?
    WHERE id = ?
  `).bind(
    body.notifications_enabled ?? 1,
    body.default_notify_days ?? 3,
    body.budget_alerts ?? 1,
    body.budget_alert_threshold ?? 80,
    userId
  ).run();
  
  return jsonResponse({ success: true }, 200, corsHeaders);
}
