// ========================================
// FlowEco API - Auth Routes
// ========================================

import { jsonResponse } from '../utils/response.js';
import { 
  hashPassword, 
  verifyPassword, 
  createToken, 
  parseUserAgent,
  generateVerificationCode 
} from '../utils/auth.js';
import { sendVerificationEmail } from '../utils/email.js';
import { DEFAULT_CATEGORIES } from '../utils/constants.js';

// ========== SEND VERIFICATION CODE ==========
export async function handleSendCode(request, env, corsHeaders) {
  const body = await request.json();
  const { email, userId, userName, type = 'registration' } = body;

  if (!email) {
    return jsonResponse({ success: false, error: 'אימייל חובה' }, 400, corsHeaders);
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await env.DB.prepare(
    'DELETE FROM verification_codes WHERE email = ? AND type = ?'
  ).bind(email.toLowerCase(), type).run();

  await env.DB.prepare(
    'INSERT INTO verification_codes (user_id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(userId || '', email.toLowerCase(), code, type, expiresAt).run();

  const sent = await sendVerificationEmail(email, code, userName, env.RESEND_API_KEY);

  if (!sent) {
    return jsonResponse({ success: false, error: 'שגיאה בשליחת אימייל' }, 500, corsHeaders);
  }

  return jsonResponse({ success: true, message: 'קוד נשלח לאימייל' }, 200, corsHeaders);
}

// ========== VERIFY CODE ==========
export async function handleVerifyCode(request, env, corsHeaders) {
  const body = await request.json();
  const { email, code } = body;

  if (!email || !code) {
    return jsonResponse({ success: false, error: 'אימייל וקוד חובה' }, 400, corsHeaders);
  }

  const record = await env.DB.prepare(
    `SELECT * FROM verification_codes 
     WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
     ORDER BY created_at DESC LIMIT 1`
  ).bind(email.toLowerCase(), code).first();

  if (!record) {
    return jsonResponse({ success: false, error: 'קוד לא תקין או פג תוקף' }, 400, corsHeaders);
  }

  await env.DB.prepare(
    'UPDATE verification_codes SET used = 1 WHERE id = ?'
  ).bind(record.id).run();

  await env.DB.prepare(
    'UPDATE users SET email_verified = 1 WHERE email = ?'
  ).bind(email.toLowerCase()).run();

  const user = await env.DB.prepare(
    'SELECT id, email, name, is_admin FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first();

  if (!user) {
    return jsonResponse({ success: false, error: 'משתמש לא נמצא' }, 404, corsHeaders);
  }

  const token = await createToken(user.id, user.email, env.JWT_SECRET);

  return jsonResponse({ 
    success: true, 
    message: 'האימייל אומת בהצלחה!',
    data: { 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        is_admin: user.is_admin || 0 
      } 
    }
  }, 200, corsHeaders);
}

// ========== RESEND CODE ==========
export async function handleResendCode(request, env, corsHeaders) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return jsonResponse({ success: false, error: 'אימייל חובה' }, 400, corsHeaders);
  }

  const user = await env.DB.prepare(
    'SELECT id, name, email_verified FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first();

  if (!user) {
    return jsonResponse({ success: false, error: 'משתמש לא נמצא' }, 404, corsHeaders);
  }

  if (user.email_verified === 1) {
    return jsonResponse({ success: false, error: 'האימייל כבר מאומת' }, 400, corsHeaders);
  }

  const recentCode = await env.DB.prepare(
    `SELECT created_at FROM verification_codes 
     WHERE email = ? AND created_at > datetime('now', '-1 minute')
     ORDER BY created_at DESC LIMIT 1`
  ).bind(email.toLowerCase()).first();

  if (recentCode) {
    return jsonResponse({ success: false, error: 'נא להמתין דקה לפני שליחה מחדש' }, 429, corsHeaders);
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await env.DB.prepare(
    'DELETE FROM verification_codes WHERE email = ?'
  ).bind(email.toLowerCase()).run();

  await env.DB.prepare(
    'INSERT INTO verification_codes (user_id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, email.toLowerCase(), code, 'registration', expiresAt).run();

  const sent = await sendVerificationEmail(email, code, user.name, env.RESEND_API_KEY);

  if (!sent) {
    return jsonResponse({ success: false, error: 'שגיאה בשליחת אימייל' }, 500, corsHeaders);
  }

  return jsonResponse({ success: true, message: 'קוד חדש נשלח לאימייל' }, 200, corsHeaders);
}

// ========== REGISTER ==========
export async function handleRegister(request, env, corsHeaders) {
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return jsonResponse({ success: false, error: 'נא למלא את כל השדות' }, 400, corsHeaders);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return jsonResponse({ success: false, error: 'אימייל לא תקין' }, 400, corsHeaders);
  }

  if (password.length < 6) {
    return jsonResponse({ success: false, error: 'סיסמה חייבת להיות לפחות 6 תווים' }, 400, corsHeaders);
  }

  const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email.toLowerCase()).first();
  if (existingUser) {
    return jsonResponse({ success: false, error: 'המשתמש כבר קיים במערכת' }, 400, corsHeaders);
  }

  const passwordHash = await hashPassword(password, env.PASSWORD_SALT);
  const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  
  const userAgent = request.headers.get('User-Agent') || '';
  const { deviceType, browser } = parseUserAgent(userAgent);
  const appVersion = request.headers.get('X-App-Version') || null;
  const pwaInstalled = request.headers.get('X-PWA-Installed') === 'true' ? 1 : 0;
  
  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, name, subscription_plan, subscription_status, terms_accepted, terms_version, 
     last_login, login_count, user_agent, device_type, browser, app_version, pwa_installed, email_verified) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    userId, email.toLowerCase(), passwordHash, name, 'free', 'active', 
    new Date().toISOString(), '2025-12',
    new Date().toISOString(), 0, userAgent, deviceType, browser, appVersion, pwaInstalled, 0
  ).run();

  await env.DB.prepare(
    'INSERT INTO user_activity_log (user_id, action_type, details) VALUES (?, ?, ?)'
  ).bind(userId, 'register', JSON.stringify({ deviceType, browser })).run();

  // Create default categories
  for (const cat of DEFAULT_CATEGORIES) {
    const catId = 'cat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    await env.DB.prepare(
      'INSERT INTO categories (id, user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(catId, userId, cat.name, cat.type, cat.icon, cat.color).run();
  }

  // Send verification code
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await env.DB.prepare(
    'INSERT INTO verification_codes (user_id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(userId, email.toLowerCase(), code, 'registration', expiresAt).run();

  const sent = await sendVerificationEmail(email, code, name, env.RESEND_API_KEY);

  if (!sent) {
    return jsonResponse({
      success: true, 
      requiresVerification: true,
      message: 'החשבון נוצר, אך היתה בעיה בשליחת האימייל. נסה לשלוח שוב.',
      data: { userId, email: email.toLowerCase(), name }
    }, 200, corsHeaders);
  }

  return jsonResponse({
    success: true,
    requiresVerification: true,
    message: 'נרשמת בהצלחה! קוד אימות נשלח לאימייל שלך.',
    data: { userId, email: email.toLowerCase(), name }
  }, 200, corsHeaders);
}

// ========== LOGIN ==========
export async function handleLogin(request, env, corsHeaders) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return jsonResponse({ success: false, error: 'נא למלא אימייל וסיסמה' }, 400, corsHeaders);
  }

  const user = await env.DB.prepare(
    'SELECT id, email, password_hash, name, is_admin, email_verified FROM users WHERE email = ?'
  ).bind(email.toLowerCase()).first();

  if (!user) {
    return jsonResponse({ success: false, error: 'אימייל או סיסמה שגויים' }, 401, corsHeaders);
  }

  const isValid = await verifyPassword(password, user.password_hash, env.PASSWORD_SALT);
  if (!isValid) {
    return jsonResponse({ success: false, error: 'אימייל או סיסמה שגויים' }, 401, corsHeaders);
  }

  // Check if email is verified
  if (user.email_verified !== 1) {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await env.DB.prepare('DELETE FROM verification_codes WHERE email = ?')
      .bind(email.toLowerCase()).run();
    await env.DB.prepare(
      'INSERT INTO verification_codes (user_id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(user.id, email.toLowerCase(), code, 'registration', expiresAt).run();

    await sendVerificationEmail(email, code, user.name, env.RESEND_API_KEY);

    return jsonResponse({
      success: true,
      requiresVerification: true,
      message: 'האימייל עדיין לא אומת. קוד חדש נשלח אליך.',
      data: { userId: user.id, email: user.email, name: user.name }
    }, 200, corsHeaders);
  }

  // Update password hash if using old salt
  const newHash = await hashPassword(password, env.PASSWORD_SALT);
  if (newHash !== user.password_hash) {
    await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      .bind(newHash, user.id).run();
  }

  // Update user info
  const userAgent = request.headers.get('User-Agent') || '';
  const { deviceType, browser } = parseUserAgent(userAgent);
  const appVersion = request.headers.get('X-App-Version') || null;
  const pwaInstalled = request.headers.get('X-PWA-Installed') === 'true' ? 1 : 0;

  await env.DB.prepare(
    `UPDATE users SET 
     last_login = ?, 
     login_count = COALESCE(login_count, 0) + 1,
     user_agent = ?,
     device_type = ?,
     browser = ?,
     app_version = COALESCE(?, app_version),
     pwa_installed = CASE WHEN ? = 1 THEN 1 ELSE pwa_installed END
     WHERE id = ?`
  ).bind(
    new Date().toISOString(), 
    userAgent, deviceType, browser, 
    appVersion, pwaInstalled,
    user.id
  ).run();

  await env.DB.prepare(
    'INSERT INTO user_activity_log (user_id, action_type, details) VALUES (?, ?, ?)'
  ).bind(user.id, 'login', JSON.stringify({ deviceType, browser })).run();

  const token = await createToken(user.id, user.email, env.JWT_SECRET);

  return jsonResponse({
    success: true, 
    message: 'התחברת בהצלחה!',
    data: { 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        is_admin: user.is_admin || 0 
      } 
    }
  }, 200, corsHeaders);
}
