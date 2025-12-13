// ========================================
// FlowEco API - Admin Routes
// ========================================

import { jsonResponse } from '../utils/response.js';
import { hashPassword, isUserAdmin } from '../utils/auth.js';

// ========== ADMIN STATS ==========
export async function handleAdminStats(env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }

  const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
  const freeUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_plan = 'free'").first();
  const trialUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_plan = 'trial'").first();
  const proUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_plan = 'pro'").first();
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];
  const newUsersThisWeek = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM users WHERE created_at >= ?"
  ).bind(weekAgoStr).first();

  const activeUsers = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM users WHERE last_login >= ?"
  ).bind(weekAgoStr).first();

  const pwaUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE pwa_installed = 1").first();
  const mobileUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE device_type = 'Mobile'").first();
  const desktopUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE device_type = 'Desktop'").first();
  const usersWithErrors = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE error_count > 0").first();

  return jsonResponse({ 
    success: true, 
    data: {
      totalUsers: userCount?.count || 0,
      freeUsers: freeUsers?.count || 0,
      trialUsers: trialUsers?.count || 0,
      proUsers: proUsers?.count || 0,
      newUsersThisWeek: newUsersThisWeek?.count || 0,
      activeUsers: activeUsers?.count || 0,
      pwaUsers: pwaUsers?.count || 0,
      mobileUsers: mobileUsers?.count || 0,
      desktopUsers: desktopUsers?.count || 0,
      usersWithErrors: usersWithErrors?.count || 0
    }
  }, 200, corsHeaders);
}

// ========== GET ALL USERS ==========
export async function handleAdminUsers(env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }

  const { results } = await env.DB.prepare(
    `SELECT id, name, email, is_admin, subscription_plan, subscription_status, account_status, created_at, 
     last_login, login_count, device_type, browser, app_version, pwa_installed, error_count, email_verified 
     FROM users ORDER BY created_at DESC`
  ).all();

  const expenseCounts = await env.DB.prepare(
    `SELECT user_id, COUNT(*) as count FROM expenses GROUP BY user_id`
  ).all();
  const expenseMap = Object.fromEntries(expenseCounts.results.map(r => [r.user_id, r.count]));
  
  const incomeCounts = await env.DB.prepare(
    `SELECT user_id, COUNT(*) as count FROM incomes GROUP BY user_id`
  ).all();
  const incomeMap = Object.fromEntries(incomeCounts.results.map(r => [r.user_id, r.count]));
  
  const lastExpenses = await env.DB.prepare(
    `SELECT user_id, MAX(created_at) as last_date FROM expenses GROUP BY user_id`
  ).all();
  const lastExpenseMap = Object.fromEntries(lastExpenses.results.map(r => [r.user_id, r.last_date]));
  
  const lastIncomes = await env.DB.prepare(
    `SELECT user_id, MAX(created_at) as last_date FROM incomes GROUP BY user_id`
  ).all();
  const lastIncomeMap = Object.fromEntries(lastIncomes.results.map(r => [r.user_id, r.last_date]));
  
  const enrichedUsers = (results || []).map(user => {
    const lastExp = lastExpenseMap[user.id];
    const lastInc = lastIncomeMap[user.id];
    const lastActivity = [lastExp, lastInc, user.last_login].filter(Boolean).sort().reverse()[0] || user.created_at;
    
    const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    let activity_status = 'inactive';
    if (daysSinceActivity <= 7) activity_status = 'active';
    else if (daysSinceActivity <= 30) activity_status = 'weak';
    
    return {
      ...user,
      expenses_count: expenseMap[user.id] || 0,
      incomes_count: incomeMap[user.id] || 0,
      last_activity: lastActivity,
      activity_status: activity_status
    };
  });

  return jsonResponse({ success: true, data: enrichedUsers }, 200, corsHeaders);
}

// ========== GET USER STATS ==========
export async function handleAdminUserStats(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }
  
  const user = await env.DB.prepare(
    `SELECT id, name, email, is_admin, subscription_plan, subscription_status, account_status, created_at, 
     last_login, login_count, user_agent, device_type, browser, app_version, pwa_installed, 
     error_count, last_error, last_error_at, email_verified 
     FROM users WHERE id = ?`
  ).bind(targetUserId).first();

  if (!user) {
    return jsonResponse({ success: false, error: 'משתמש לא נמצא' }, 404, corsHeaders);
  }

  const expenseCount = await env.DB.prepare('SELECT COUNT(*) as count FROM expenses WHERE user_id = ?').bind(targetUserId).first();
  const incomeCount = await env.DB.prepare('SELECT COUNT(*) as count FROM incomes WHERE user_id = ?').bind(targetUserId).first();
  const budgetCount = await env.DB.prepare('SELECT COUNT(*) as count FROM budgets WHERE user_id = ?').bind(targetUserId).first();
  const cardCount = await env.DB.prepare('SELECT COUNT(*) as count FROM cards WHERE user_id = ?').bind(targetUserId).first();
  const loanCount = await env.DB.prepare('SELECT COUNT(*) as count FROM loans WHERE user_id = ?').bind(targetUserId).first();
  const installmentCount = await env.DB.prepare('SELECT COUNT(*) as count FROM installment_plans WHERE user_id = ?').bind(targetUserId).first();

  const lastExpense = await env.DB.prepare('SELECT created_at FROM expenses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').bind(targetUserId).first();
  const lastIncome = await env.DB.prepare('SELECT created_at FROM incomes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').bind(targetUserId).first();

  const { results: recentActivity } = await env.DB.prepare(
    'SELECT action_type, details, created_at FROM user_activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).bind(targetUserId).all();

  const { results: recentErrors } = await env.DB.prepare(
    'SELECT error_message, page, created_at FROM user_errors WHERE user_id = ? ORDER BY created_at DESC LIMIT 5'
  ).bind(targetUserId).all();

  const totalActions = (expenseCount?.count || 0) + (incomeCount?.count || 0) + (budgetCount?.count || 0);

  let activityLevel = 'לא פעיל';
  if (totalActions > 50) activityLevel = 'פעיל מאוד';
  else if (totalActions > 20) activityLevel = 'פעיל';
  else if (totalActions > 5) activityLevel = 'פעיל חלקית';
  else if (totalActions > 0) activityLevel = 'התחיל להשתמש';

  const daysSinceRegistration = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));

  const lastActivityDate = [lastExpense?.created_at, lastIncome?.created_at, user.last_login]
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || user.created_at;

  return jsonResponse({
    success: true,
    data: {
      user: user,
      activity: {
        totalActions,
        expensesCount: expenseCount?.count || 0,
        incomesCount: incomeCount?.count || 0,
        budgetsCount: budgetCount?.count || 0,
        cardsCount: cardCount?.count || 0,
        loansCount: loanCount?.count || 0,
        installmentsCount: installmentCount?.count || 0,
        activityLevel,
        registeredAt: user.created_at,
        lastLogin: user.last_login,
        loginCount: user.login_count || 0,
        lastActivity: lastActivityDate,
        daysSinceRegistration
      },
      technical: {
        deviceType: user.device_type || 'לא ידוע',
        browser: user.browser || 'לא ידוע',
        appVersion: user.app_version || 'לא ידוע',
        pwaInstalled: user.pwa_installed === 1,
        errorCount: user.error_count || 0,
        lastError: user.last_error || null,
        lastErrorAt: user.last_error_at || null,
        emailVerified: user.email_verified === 1
      },
      recentActivity: recentActivity || [],
      recentErrors: recentErrors || []
    }
  }, 200, corsHeaders);
}

// ========== GET USER ERRORS ==========
export async function handleAdminUserErrors(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }
  
  const { results } = await env.DB.prepare(
    'SELECT * FROM user_errors WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(targetUserId).all();

  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

// ========== GET USER ACTIVITY ==========
export async function handleAdminUserActivity(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }
  
  const { results } = await env.DB.prepare(
    'SELECT * FROM user_activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
  ).bind(targetUserId).all();

  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

// ========== CLEAR USER ERRORS ==========
export async function handleAdminClearErrors(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }
  
  await env.DB.prepare('DELETE FROM user_errors WHERE user_id = ?').bind(targetUserId).run();
  await env.DB.prepare('UPDATE users SET error_count = 0, last_error = NULL, last_error_at = NULL WHERE id = ?').bind(targetUserId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== UPDATE USER ==========
export async function handleAdminUpdateUser(request, env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }

  const body = await request.json();

  await env.DB.prepare(
    `UPDATE users SET name = ?, email = ?, subscription_plan = ?, is_admin = ?, subscription_status = ?, account_status = ? WHERE id = ?`
  ).bind(
    body.name, body.email.toLowerCase(), body.subscription_plan || 'free',
    (body.role === 'admin' || body.is_admin) ? 1 : 0,
    body.subscription_status || 'active', body.account_status || 'active', targetUserId
  ).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== DELETE USER ==========
export async function handleAdminDeleteUser(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }

  if (targetUserId === userId) {
    return jsonResponse({ success: false, error: 'לא ניתן למחוק את עצמך' }, 400, corsHeaders);
  }

  const tables = [
    'expenses', 'incomes', 'budgets', 'cards', 'loans', 
    'installment_plans', 'categories', 'feedback', 'user_errors', 
    'user_activity_log', 'verification_codes', 'subscriptions',
    'financial_goals', 'goal_contributions', 'excluded_recurring',
    'business_expenses', 'business_incomes', 'business_clients', 'business_suppliers'
  ];
  
  for (const table of tables) {
    try {
      await env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(targetUserId).run();
    } catch (e) {
      // Table might not exist
    }
  }
  
  await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(targetUserId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== CREATE USER ==========
export async function handleAdminCreateUser(request, env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }

  const body = await request.json();
  const { email, password, name, is_admin, subscription_plan } = body;

  if (!email || !password || !name) {
    return jsonResponse({ success: false, error: 'נא למלא את כל השדות' }, 400, corsHeaders);
  }

  const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
  if (existingUser) {
    return jsonResponse({ success: false, error: 'המשתמש כבר קיים במערכת' }, 400, corsHeaders);
  }

  const passwordHash = await hashPassword(password, env.PASSWORD_SALT);
  const newUserId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

  await env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, name, is_admin, subscription_plan, subscription_status, account_status, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(newUserId, email.toLowerCase(), passwordHash, name, is_admin ? 1 : 0, subscription_plan || 'free', 'active', 'active', 1).run();

  return jsonResponse({ success: true, data: { id: newUserId } }, 200, corsHeaders);
}

// ========== RESET PASSWORD ==========
export async function handleAdminResetPassword(request, env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }

  const body = await request.json();
  const { user_id, new_password } = body;

  if (!user_id || !new_password || new_password.length < 6) {
    return jsonResponse({ success: false, error: 'סיסמה חייבת להיות לפחות 6 תווים' }, 400, corsHeaders);
  }

  const passwordHash = await hashPassword(new_password, env.PASSWORD_SALT);
  await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(passwordHash, user_id).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== GET ALL FEEDBACK ==========
export async function handleAdminFeedback(env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }

  const { results } = await env.DB.prepare(`
    SELECT 
      f.id,
      f.user_id,
      f.type as category,
      f.message,
      f.rating,
      f.status,
      f.admin_notes,
      f.created_at,
      f.updated_at,
      u.name as user_name,
      u.email as user_email
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `).all();

  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

// ========== UPDATE FEEDBACK ==========
export async function handleAdminUpdateFeedback(request, env, userId, feedbackId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }

  const body = await request.json();

  await env.DB.prepare('UPDATE feedback SET status = ?, admin_notes = ? WHERE id = ?')
    .bind(body.status || 'new', body.admin_notes || '', feedbackId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== DELETE FEEDBACK ==========
export async function handleAdminDeleteFeedback(env, userId, feedbackId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: 'גישה נדחתה' }, 403, corsHeaders);
  }

  await env.DB.prepare('DELETE FROM feedback WHERE id = ?').bind(feedbackId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}
