// ========================================
// FlowEco API - Financial Goals Routes
// ========================================

import { jsonResponse } from '../utils/response.js';

// ========== GET ALL GOALS ==========
export async function handleGetGoals(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM financial_goals WHERE user_id = ? ORDER BY priority ASC, created_at DESC'
  ).bind(userId).all();
  
  const goalsWithProgress = (results || []).map(goal => ({
    ...goal,
    progress: goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0,
    remaining: Math.max(0, goal.target_amount - goal.current_amount)
  }));
  
  return jsonResponse({ success: true, data: goalsWithProgress }, 200, corsHeaders);
}

// ========== GET SINGLE GOAL ==========
export async function handleGetGoal(env, userId, goalId, corsHeaders) {
  const goal = await env.DB.prepare(
    'SELECT * FROM financial_goals WHERE id = ? AND user_id = ?'
  ).bind(goalId, userId).first();
  
  if (!goal) {
    return jsonResponse({ success: false, error: 'יעד לא נמצא' }, 404, corsHeaders);
  }
  
  const { results: contributions } = await env.DB.prepare(
    'SELECT * FROM goal_contributions WHERE goal_id = ? AND user_id = ? ORDER BY date DESC'
  ).bind(goalId, userId).all();
  
  return jsonResponse({ 
    success: true, 
    data: {
      ...goal,
      progress: goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0,
      remaining: Math.max(0, goal.target_amount - goal.current_amount),
      contributions: contributions || []
    }
  }, 200, corsHeaders);
}

// ========== CREATE GOAL ==========
export async function handleCreateGoal(request, env, userId, corsHeaders) {
  const body = await request.json();
  
  if (!body.name || !body.target_amount) {
    return jsonResponse({ success: false, error: 'שם ויעד הם שדות חובה' }, 400, corsHeaders);
  }
  
  const id = 'goal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  
  await env.DB.prepare(
    `INSERT INTO financial_goals (id, user_id, name, target_amount, current_amount, deadline, category, priority, icon, color, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, userId, body.name, body.target_amount, body.current_amount || 0,
    body.deadline || null, body.category || 'general', body.priority || 2,
    body.icon || '🎯', body.color || '#667eea', body.notes || null
  ).run();
  
  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}

// ========== UPDATE GOAL ==========
export async function handleUpdateGoal(request, env, userId, goalId, corsHeaders) {
  const body = await request.json();
  
  await env.DB.prepare(
    `UPDATE financial_goals SET 
     name = ?, target_amount = ?, current_amount = ?, deadline = ?, 
     category = ?, priority = ?, icon = ?, color = ?, notes = ?, 
     status = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(
    body.name, body.target_amount, body.current_amount || 0, body.deadline || null,
    body.category || 'general', body.priority || 2, body.icon || '🎯',
    body.color || '#667eea', body.notes || null, body.status || 'active',
    goalId, userId
  ).run();
  
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== DELETE GOAL ==========
export async function handleDeleteGoal(env, userId, goalId, corsHeaders) {
  await env.DB.prepare('DELETE FROM goal_contributions WHERE goal_id = ? AND user_id = ?')
    .bind(goalId, userId).run();
  await env.DB.prepare('DELETE FROM financial_goals WHERE id = ? AND user_id = ?')
    .bind(goalId, userId).run();
  
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== ADD CONTRIBUTION ==========
export async function handleAddContribution(request, env, userId, goalId, corsHeaders) {
  const body = await request.json();
  
  if (!body.amount) {
    return jsonResponse({ success: false, error: 'סכום הוא שדה חובה' }, 400, corsHeaders);
  }
  
  const contributionId = 'contrib-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  const date = body.date || new Date().toISOString().split('T')[0];
  
  await env.DB.prepare(
    'INSERT INTO goal_contributions (id, goal_id, user_id, amount, date, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(contributionId, goalId, userId, body.amount, date, body.notes || null).run();
  
  await env.DB.prepare(
    'UPDATE financial_goals SET current_amount = current_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
  ).bind(body.amount, goalId, userId).run();
  
  const goal = await env.DB.prepare(
    'SELECT current_amount, target_amount FROM financial_goals WHERE id = ? AND user_id = ?'
  ).bind(goalId, userId).first();
  
  if (goal && goal.current_amount >= goal.target_amount) {
    await env.DB.prepare(
      "UPDATE financial_goals SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
    ).bind(goalId, userId).run();
  }
  
  return jsonResponse({ 
    success: true, 
    data: { 
      id: contributionId,
      newTotal: goal ? goal.current_amount : body.amount,
      isCompleted: goal ? (goal.current_amount >= goal.target_amount) : false
    }
  }, 200, corsHeaders);
}

// ========== DELETE CONTRIBUTION ==========
export async function handleDeleteContribution(env, userId, contributionId, corsHeaders) {
  const contribution = await env.DB.prepare(
    'SELECT goal_id, amount FROM goal_contributions WHERE id = ? AND user_id = ?'
  ).bind(contributionId, userId).first();
  
  if (!contribution) {
    return jsonResponse({ success: false, error: 'הפקדה לא נמצאה' }, 404, corsHeaders);
  }
  
  await env.DB.prepare('DELETE FROM goal_contributions WHERE id = ? AND user_id = ?')
    .bind(contributionId, userId).run();
  
  await env.DB.prepare(
    'UPDATE financial_goals SET current_amount = MAX(0, current_amount - ?), status = "active", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
  ).bind(contribution.amount, contribution.goal_id, userId).run();
  
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ========== GOALS STATS ==========
export async function handleGoalsStats(env, userId, corsHeaders) {
  const { results: goals } = await env.DB.prepare(
    'SELECT * FROM financial_goals WHERE user_id = ?'
  ).bind(userId).all();
  
  const activeGoals = (goals || []).filter(g => g.status === 'active');
  const completedGoals = (goals || []).filter(g => g.status === 'completed');
  
  const totalTarget = activeGoals.reduce((sum, g) => sum + (g.target_amount || 0), 0);
  const totalSaved = activeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
  
  return jsonResponse({
    success: true,
    data: {
      totalGoals: (goals || []).length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTarget,
      totalSaved,
      overallProgress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0
    }
  }, 200, corsHeaders);
}
