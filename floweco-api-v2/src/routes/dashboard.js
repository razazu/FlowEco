// ========================================
// FlowEco API - Dashboard Routes
// ========================================

import { jsonResponse } from '../utils/response.js';

// ========== DASHBOARD STATS ==========
export async function handleDashboard(env, userId, corsHeaders) {
  const { results: expensesData } = await env.DB.prepare(
    'SELECT SUM(amount) as total, COUNT(*) as count FROM expenses WHERE user_id = ?'
  ).bind(userId).all();
  
  const { results: incomesData } = await env.DB.prepare(
    'SELECT SUM(amount) as total, COUNT(*) as count FROM incomes WHERE user_id = ?'
  ).bind(userId).all();
  
  const { results: categoryData } = await env.DB.prepare(
    'SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC'
  ).bind(userId).all();

  return jsonResponse({
    success: true,
    data: {
      expenses: { total: expensesData[0]?.total || 0, count: expensesData[0]?.count || 0 },
      incomes: { total: incomesData[0]?.total || 0, count: incomesData[0]?.count || 0 },
      balance: (incomesData[0]?.total || 0) - (expensesData[0]?.total || 0),
      categories: categoryData
    }
  }, 200, corsHeaders);
}

// ========== MONTHLY STATS ==========
export async function handleMonthlyStats(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const months = parseInt(url.searchParams.get('months')) || 6;
  const monthlyStats = [];
  const now = new Date();
  const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-${new Date(year, date.getMonth() + 1, 0).getDate()}`;

    const expensesData = await env.DB.prepare(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?'
    ).bind(userId, startDate, endDate).first();

    const incomesData = await env.DB.prepare(
      'SELECT SUM(amount) as total FROM incomes WHERE user_id = ? AND date >= ? AND date <= ?'
    ).bind(userId, startDate, endDate).first();

    monthlyStats.push({
      month: `${year}-${month}`,
      monthName: monthNames[date.getMonth()] + ' ' + year,
      incomes: incomesData?.total || 0,
      expenses: expensesData?.total || 0,
      balance: (incomesData?.total || 0) - (expensesData?.total || 0)
    });
  }

  return jsonResponse({ success: true, data: monthlyStats }, 200, corsHeaders);
}
