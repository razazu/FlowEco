// ========================================
// FlowEco API - Finance Routes
// הוצאות, הכנסות, תקציבים, כרטיסים, הלוואות, תשלומים
// ========================================

import { jsonResponse } from '../utils/response.js';
import { generateRecurringExpenses, generateRecurringIncomes } from '../utils/recurring.js';
import { sendBudgetAlertEmail } from '../utils/email.js';
import { DEFAULT_CATEGORIES } from '../utils/constants.js';

// ==========================================
// EXPENSES
// ==========================================

export async function handleGetExpenses(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get('month');
  
  if (monthParam) {
    const [year, month] = monthParam.split('-').map(Number);
    await generateRecurringExpenses(env.DB, userId, year, month);
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM expenses WHERE user_id = ? AND expense_type = "regular" ORDER BY date DESC'
  ).bind(userId).all();
  
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

export async function handleGetExpense(env, userId, expenseId, corsHeaders) {
  const expense = await env.DB.prepare(
    'SELECT * FROM expenses WHERE id = ? AND user_id = ?'
  ).bind(expenseId, userId).first();
  
  if (!expense) {
    return jsonResponse({ success: false, error: 'Expense not found' }, 404, corsHeaders);
  }
  
  return jsonResponse({ success: true, data: expense }, 200, corsHeaders);
}

export async function handleCreateExpense(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'exp-' + Date.now();

  await env.DB.prepare(
    `INSERT INTO expenses (id, amount, category, description, date, is_recurring, recurring_type, user_id, payment_method, card_id, expense_type) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'regular')`
  ).bind(
    id, body.amount, body.category, body.description || '', body.date,
    body.isRecurring ? 1 : 0, body.recurringType || null, userId,
    body.paymentMethod || 'cash', body.cardId || null
  ).run();

  // Budget alert check
  await checkBudgetAlert(env, userId, body.category, body.date, body.paymentMethod, body.cardId);

  return jsonResponse({ success: true, id }, 200, corsHeaders);
}

export async function handleUpdateExpense(request, env, userId, expenseId, corsHeaders) {
  const body = await request.json();

  const existingExpense = await env.DB.prepare(
    'SELECT parent_recurring_id FROM expenses WHERE id = ? AND user_id = ?'
  ).bind(expenseId, userId).first();

  let isRecurring = body.isRecurring ? 1 : 0;
  let recurringType = body.recurringType || null;
  let recurringEndDate = body.recurringEndDate || null;
  
  if (existingExpense && existingExpense.parent_recurring_id) {
    isRecurring = 0;
    recurringType = null;
    recurringEndDate = null;
  }

  await env.DB.prepare(
    `UPDATE expenses SET amount = ?, category = ?, description = ?, date = ?, is_recurring = ?, recurring_type = ?, recurring_end_date = ?, payment_method = ?, card_id = ?
     WHERE id = ? AND user_id = ?`
  ).bind(
    body.amount, body.category, body.description || '', body.date,
    isRecurring, recurringType, recurringEndDate,
    body.paymentMethod || 'cash', body.cardId || null, expenseId, userId
  ).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteExpense(env, userId, expenseId, corsHeaders) {
  const expense = await env.DB.prepare(
    'SELECT is_recurring, parent_recurring_id, date FROM expenses WHERE id = ? AND user_id = ?'
  ).bind(expenseId, userId).first();
  
  if (expense && expense.is_recurring === 1) {
    await env.DB.prepare('DELETE FROM expenses WHERE parent_recurring_id = ? AND user_id = ?')
      .bind(expenseId, userId).run();
    await env.DB.prepare('DELETE FROM excluded_recurring WHERE parent_recurring_id = ? AND user_id = ?')
      .bind(expenseId, userId).run();
  } else if (expense && expense.parent_recurring_id) {
    const month = expense.date.substring(0, 7);
    const excludeId = 'excl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    await env.DB.prepare(
      'INSERT OR IGNORE INTO excluded_recurring (id, user_id, parent_recurring_id, excluded_month, type) VALUES (?, ?, ?, ?, ?)'
    ).bind(excludeId, userId, expense.parent_recurring_id, month, 'expense').run();
  }
  
  await env.DB.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?')
    .bind(expenseId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleExpenseRecurring(request, env, userId, expenseId, corsHeaders) {
  const body = await request.json();
  
  const expense = await env.DB.prepare(
    'SELECT is_recurring, date FROM expenses WHERE id = ? AND user_id = ?'
  ).bind(expenseId, userId).first();
  
  if (!expense || expense.is_recurring !== 1) {
    return jsonResponse({ success: false, error: 'Not a recurring expense' }, 400, corsHeaders);
  }

  if (body.action === 'stop') {
    const now = new Date();
    const prevMonth = now.getMonth();
    const year = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = prevMonth === 0 ? 12 : prevMonth;
    const endDate = `${year}-${month.toString().padStart(2, '0')}`;
    
    await env.DB.prepare(
      'UPDATE expenses SET recurring_end_date = ? WHERE id = ? AND user_id = ?'
    ).bind(endDate, expenseId, userId).run();
    
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    await env.DB.prepare(
      'DELETE FROM expenses WHERE parent_recurring_id = ? AND user_id = ? AND date >= ?'
    ).bind(expenseId, userId, currentMonthStr + '-01').run();
    
    return jsonResponse({ success: true, endDate }, 200, corsHeaders);
  }
  
  if (body.action === 'setEndDate') {
    const endDate = body.endDate;
    
    await env.DB.prepare(
      'UPDATE expenses SET recurring_end_date = ? WHERE id = ? AND user_id = ?'
    ).bind(endDate, expenseId, userId).run();
    
    const [endYear, endMonth] = endDate.split('-').map(Number);
    const deleteAfter = `${endYear}-${endMonth.toString().padStart(2, '0')}`;
    await env.DB.prepare(
      'DELETE FROM expenses WHERE parent_recurring_id = ? AND user_id = ? AND date > ?'
    ).bind(expenseId, userId, deleteAfter + '-31').run();
    
    return jsonResponse({ success: true, endDate }, 200, corsHeaders);
  }
  
  if (body.action === 'removeEndDate') {
    await env.DB.prepare(
      'UPDATE expenses SET recurring_end_date = NULL WHERE id = ? AND user_id = ?'
    ).bind(expenseId, userId).run();
    
    return jsonResponse({ success: true }, 200, corsHeaders);
  }
  
  return jsonResponse({ success: false, error: 'Invalid action' }, 400, corsHeaders);
}

// ==========================================
// INCOMES
// ==========================================

export async function handleGetIncomes(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get('month');
  
  if (monthParam) {
    const [year, month] = monthParam.split('-').map(Number);
    await generateRecurringIncomes(env.DB, userId, year, month);
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC'
  ).bind(userId).all();
  
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

export async function handleGetIncome(env, userId, incomeId, corsHeaders) {
  const income = await env.DB.prepare(
    'SELECT * FROM incomes WHERE id = ? AND user_id = ?'
  ).bind(incomeId, userId).first();
  
  if (!income) {
    return jsonResponse({ success: false, error: 'Income not found' }, 404, corsHeaders);
  }
  
  return jsonResponse({ success: true, data: income }, 200, corsHeaders);
}

export async function handleCreateIncome(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'inc-' + Date.now();

  await env.DB.prepare(
    'INSERT INTO incomes (id, amount, source, description, date, is_recurring, recurring_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.amount, body.source, body.description || '', body.date, body.isRecurring ? 1 : 0, body.recurringType || null, userId).run();

  return jsonResponse({ success: true, id }, 200, corsHeaders);
}

export async function handleUpdateIncome(request, env, userId, incomeId, corsHeaders) {
  const body = await request.json();

  const existingIncome = await env.DB.prepare(
    'SELECT parent_recurring_id FROM incomes WHERE id = ? AND user_id = ?'
  ).bind(incomeId, userId).first();

  let isRecurring = body.isRecurring ? 1 : 0;
  let recurringType = body.recurringType || null;
  let recurringEndDate = body.recurringEndDate || null;
  if (existingIncome && existingIncome.parent_recurring_id) {
    isRecurring = 0;
    recurringType = null;
    recurringEndDate = null;
  }

  await env.DB.prepare(
    `UPDATE incomes SET amount = ?, source = ?, description = ?, date = ?, is_recurring = ?, recurring_type = ?, recurring_end_date = ? WHERE id = ? AND user_id = ?`
  ).bind(body.amount, body.source, body.description || '', body.date, isRecurring, recurringType, recurringEndDate, incomeId, userId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteIncome(env, userId, incomeId, corsHeaders) {
  const income = await env.DB.prepare(
    'SELECT is_recurring, parent_recurring_id, date FROM incomes WHERE id = ? AND user_id = ?'
  ).bind(incomeId, userId).first();
  
  if (income && income.is_recurring === 1) {
    await env.DB.prepare('DELETE FROM incomes WHERE parent_recurring_id = ? AND user_id = ?')
      .bind(incomeId, userId).run();
    await env.DB.prepare('DELETE FROM excluded_recurring WHERE parent_recurring_id = ? AND user_id = ?')
      .bind(incomeId, userId).run();
  } else if (income && income.parent_recurring_id) {
    const month = income.date.substring(0, 7);
    const excludeId = 'excl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    await env.DB.prepare(
      'INSERT OR IGNORE INTO excluded_recurring (id, user_id, parent_recurring_id, excluded_month, type) VALUES (?, ?, ?, ?, ?)'
    ).bind(excludeId, userId, income.parent_recurring_id, month, 'income').run();
  }
  
  await env.DB.prepare('DELETE FROM incomes WHERE id = ? AND user_id = ?')
    .bind(incomeId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleIncomeRecurring(request, env, userId, incomeId, corsHeaders) {
  const body = await request.json();
  
  const income = await env.DB.prepare(
    'SELECT is_recurring, date FROM incomes WHERE id = ? AND user_id = ?'
  ).bind(incomeId, userId).first();
  
  if (!income || income.is_recurring !== 1) {
    return jsonResponse({ success: false, error: 'Not a recurring income' }, 400, corsHeaders);
  }

  if (body.action === 'stop') {
    const now = new Date();
    const prevMonth = now.getMonth();
    const year = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = prevMonth === 0 ? 12 : prevMonth;
    const endDate = `${year}-${month.toString().padStart(2, '0')}`;
    
    await env.DB.prepare(
      'UPDATE incomes SET recurring_end_date = ? WHERE id = ? AND user_id = ?'
    ).bind(endDate, incomeId, userId).run();
    
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    await env.DB.prepare(
      'DELETE FROM incomes WHERE parent_recurring_id = ? AND user_id = ? AND date >= ?'
    ).bind(incomeId, userId, currentMonthStr + '-01').run();
    
    return jsonResponse({ success: true, endDate }, 200, corsHeaders);
  }
  
  if (body.action === 'setEndDate') {
    const endDate = body.endDate;
    
    await env.DB.prepare(
      'UPDATE incomes SET recurring_end_date = ? WHERE id = ? AND user_id = ?'
    ).bind(endDate, incomeId, userId).run();
    
    const [endYear, endMonth] = endDate.split('-').map(Number);
    const deleteAfter = `${endYear}-${endMonth.toString().padStart(2, '0')}`;
    await env.DB.prepare(
      'DELETE FROM incomes WHERE parent_recurring_id = ? AND user_id = ? AND date > ?'
    ).bind(incomeId, userId, deleteAfter + '-31').run();
    
    return jsonResponse({ success: true, endDate }, 200, corsHeaders);
  }
  
  if (body.action === 'removeEndDate') {
    await env.DB.prepare(
      'UPDATE incomes SET recurring_end_date = NULL WHERE id = ? AND user_id = ?'
    ).bind(incomeId, userId).run();
    
    return jsonResponse({ success: true }, 200, corsHeaders);
  }
  
  return jsonResponse({ success: false, error: 'Invalid action' }, 400, corsHeaders);
}

// ==========================================
// BUDGETS
// ==========================================

export async function handleGetBudgets(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

export async function handleCreateBudget(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'bdg-' + Date.now();

  await env.DB.prepare(
    'INSERT INTO budgets (id, category, amount, period, user_id, alert_enabled) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, body.category, body.amount, body.period, userId, body.alert_enabled ?? 1).run();

  return jsonResponse({ success: true, id }, 200, corsHeaders);
}

export async function handleUpdateBudget(request, env, userId, budgetId, corsHeaders) {
  const body = await request.json();

  if (!body.category || !body.amount) {
    return jsonResponse({ success: false, error: 'קטגוריה וסכום הם שדות חובה' }, 400, corsHeaders);
  }

  await env.DB.prepare(
    'UPDATE budgets SET category = ?, amount = ?, period = ?, alert_enabled = ? WHERE id = ? AND user_id = ?'
  ).bind(body.category, body.amount, body.period || 'monthly', body.alert_enabled ?? 1, budgetId, userId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteBudget(env, userId, budgetId, corsHeaders) {
  await env.DB.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?')
    .bind(budgetId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ==========================================
// CATEGORIES
// ==========================================

export async function handleGetCategories(env, userId, corsHeaders) {
  let { results } = await env.DB.prepare(
    'SELECT * FROM categories WHERE user_id = ? ORDER BY type, name'
  ).bind(userId).all();
  
  if (!results || results.length === 0) {
    results = [];
    for (const cat of DEFAULT_CATEGORIES) {
      const catId = 'cat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      await env.DB.prepare(
        'INSERT INTO categories (id, user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(catId, userId, cat.name, cat.type, cat.icon, cat.color).run();
      results.push({ id: catId, user_id: userId, ...cat });
    }
  }
  
  return jsonResponse({ success: true, data: results }, 200, corsHeaders);
}

export async function handleCreateCategory(request, env, userId, corsHeaders) {
  const body = await request.json();
  
  if (!body.name || !body.type) {
    return jsonResponse({ success: false, error: 'נא למלא שם וסוג קטגוריה' }, 400, corsHeaders);
  }

  const existing = await env.DB.prepare(
    'SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ?'
  ).bind(userId, body.name, body.type).first();

  if (existing) {
    return jsonResponse({ success: false, error: 'קטגוריה עם שם זה כבר קיימת' }, 400, corsHeaders);
  }

  const id = 'cat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  
  await env.DB.prepare(
    'INSERT INTO categories (id, user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, userId, body.name, body.type, body.icon || '📦', body.color || '#667eea').run();
  
  return jsonResponse({ 
    success: true, 
    data: { id, user_id: userId, name: body.name, type: body.type, icon: body.icon || '📦', color: body.color || '#667eea' }
  }, 200, corsHeaders);
}

export async function handleUpdateCategory(request, env, userId, categoryId, corsHeaders) {
  const body = await request.json();

  const oldCategory = await env.DB.prepare(
    'SELECT name, type FROM categories WHERE id = ? AND user_id = ?'
  ).bind(categoryId, userId).first();

  if (!oldCategory) {
    return jsonResponse({ success: false, error: 'קטגוריה לא נמצאה' }, 404, corsHeaders);
  }

  await env.DB.prepare(
    'UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?'
  ).bind(body.name || oldCategory.name, body.icon || '📦', body.color || '#667eea', categoryId, userId).run();

  if (body.name && body.name !== oldCategory.name) {
    if (oldCategory.type === 'expense') {
      await env.DB.prepare('UPDATE expenses SET category = ? WHERE user_id = ? AND category = ?')
        .bind(body.name, userId, oldCategory.name).run();
    } else {
      await env.DB.prepare('UPDATE incomes SET source = ? WHERE user_id = ? AND source = ?')
        .bind(body.name, userId, oldCategory.name).run();
    }
  }
  
  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteCategory(env, userId, categoryId, corsHeaders) {
  const category = await env.DB.prepare(
    'SELECT name, type FROM categories WHERE id = ? AND user_id = ?'
  ).bind(categoryId, userId).first();

  if (!category) {
    return jsonResponse({ success: false, error: 'קטגוריה לא נמצאה' }, 404, corsHeaders);
  }

  await env.DB.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?')
    .bind(categoryId, userId).run();
  
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ==========================================
// CARDS
// ==========================================

export async function handleGetCards(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

export async function handleCreateCard(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'card-' + Date.now();

  await env.DB.prepare(
    'INSERT INTO cards (id, user_id, card_name, last_four, color, billing_day) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, userId, body.card_name, body.last_four || null, body.color || '#667eea', body.billing_day || null).run();

  return jsonResponse({ success: true, data: { id, card_name: body.card_name, color: body.color || '#667eea' } }, 200, corsHeaders);
}

export async function handleUpdateCard(request, env, userId, cardId, corsHeaders) {
  const body = await request.json();
  
  await env.DB.prepare(
    'UPDATE cards SET card_name = ?, last_four = ?, color = ?, billing_day = ? WHERE id = ? AND user_id = ?'
  ).bind(body.card_name, body.last_four || null, body.color || '#667eea', body.billing_day || null, cardId, userId).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteCard(env, userId, cardId, corsHeaders) {
  await env.DB.prepare('DELETE FROM cards WHERE id = ? AND user_id = ?')
    .bind(cardId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ==========================================
// LOANS
// ==========================================

export async function handleGetLoans(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

export async function handleCreateLoan(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'loan-' + Date.now();

  if (!body.loan_name || !body.monthly_payment) {
    return jsonResponse({ success: false, error: 'נא למלא שם הלוואה והחזר חודשי' }, 400, corsHeaders);
  }

  let endDate = body.end_date || null;
  if (!endDate && body.start_date && body.total_months) {
    const start = new Date(body.start_date);
    start.setMonth(start.getMonth() + body.total_months);
    endDate = start.toISOString().split('T')[0];
  }

  await env.DB.prepare(
    `INSERT INTO loans (id, user_id, loan_name, lender, original_amount, total_months, monthly_payment, interest_rate, start_date, end_date, remaining_amount, remaining_months, status, card_id, category, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`
  ).bind(
    id, userId, body.loan_name, body.lender || null, body.original_amount || null,
    body.total_months || null, body.monthly_payment, body.interest_rate || null,
    body.start_date || null, endDate,
    body.remaining_amount || body.original_amount, body.remaining_months || body.total_months,
    body.card_id || null, body.category || 'הלוואה', body.notes || null
  ).run();

  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}

export async function handleUpdateLoan(request, env, userId, loanId, corsHeaders) {
  const body = await request.json();

  await env.DB.prepare(
    `UPDATE loans SET loan_name = ?, lender = ?, original_amount = ?, total_months = ?, monthly_payment = ?, 
     interest_rate = ?, start_date = ?, end_date = ?, remaining_amount = ?, remaining_months = ?, 
     status = ?, card_id = ?, category = ?, notes = ? WHERE id = ? AND user_id = ?`
  ).bind(
    body.loan_name, body.lender || null, body.original_amount || null, body.total_months || null,
    body.monthly_payment, body.interest_rate || null, body.start_date || null, body.end_date || null,
    body.remaining_amount || null, body.remaining_months || null, body.status || 'active',
    body.card_id || null, body.category || 'הלוואה', body.notes || null, loanId, userId
  ).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteLoan(env, userId, loanId, corsHeaders) {
  await env.DB.prepare('DELETE FROM loans WHERE id = ? AND user_id = ?')
    .bind(loanId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ==========================================
// INSTALLMENTS
// ==========================================

export async function handleGetInstallments(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM installment_plans WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

export async function handleCreateInstallment(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'inst-' + Date.now();
  const installmentAmount = body.original_amount / body.total_installments;

  await env.DB.prepare(
    `INSERT INTO installment_plans (id, user_id, description, original_amount, total_installments, installment_amount, first_payment_date, card_id, category, remaining_installments, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
  ).bind(
    id, userId, body.description, body.original_amount, body.total_installments,
    installmentAmount, body.first_payment_date, body.card_id || null,
    body.category || 'קניות', body.total_installments
  ).run();

  return jsonResponse({ success: true, data: { id, installment_amount: installmentAmount } }, 200, corsHeaders);
}

export async function handleUpdateInstallment(request, env, userId, instId, corsHeaders) {
  const body = await request.json();
  const installmentAmount = body.installment_amount || (body.original_amount / body.total_installments);

  await env.DB.prepare(
    `UPDATE installment_plans SET description = ?, original_amount = ?, total_installments = ?, installment_amount = ?, 
     first_payment_date = ?, card_id = ?, category = ?, remaining_installments = ?, status = ? WHERE id = ? AND user_id = ?`
  ).bind(
    body.description, body.original_amount, body.total_installments, installmentAmount,
    body.first_payment_date, body.card_id || null, body.category || 'קניות',
    body.remaining_installments, body.status || 'active', instId, userId
  ).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteInstallment(env, userId, instId, corsHeaders) {
  await env.DB.prepare('DELETE FROM installment_plans WHERE id = ? AND user_id = ?')
    .bind(instId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ==========================================
// HELPER: Budget Alert Check
// ==========================================

async function checkBudgetAlert(env, userId, category, expenseDate, paymentMethod, cardId) {
  try {
    const user = await env.DB.prepare(
      'SELECT email, name, budget_alerts, budget_alert_threshold FROM users WHERE id = ?'
    ).bind(userId).first();
    
    if (!user || user.budget_alerts !== 1) return;
    
    const budget = await env.DB.prepare(
      'SELECT id, amount, alert_enabled FROM budgets WHERE user_id = ? AND category = ? AND period = ?'
    ).bind(userId, category, 'חודשי').first();
    
    if (!budget || budget.alert_enabled === 0) return;

    const cardsResult = await env.DB.prepare(
      'SELECT id, billing_day FROM cards WHERE user_id = ?'
    ).bind(userId).all();
    const cards = cardsResult.results || [];
    
    function getBillingMonth(expense, cards) {
      const expDate = new Date(expense.date);
      
      if (expense.payment_method !== 'card' || !expense.card_id) {
        return { year: expDate.getFullYear(), month: expDate.getMonth() };
      }
      
      let card = null;
      for (let i = 0; i < cards.length; i++) {
        if (cards[i].id === expense.card_id) {
          card = cards[i];
          break;
        }
      }
      const billingDay = (card && card.billing_day) || 1;
      
      let billingYear = expDate.getFullYear();
      let billingMonth = expDate.getMonth();
      
      if (expDate.getDate() < billingDay) {
        billingMonth--;
        if (billingMonth < 0) {
          billingMonth = 11;
          billingYear--;
        }
      }
      
      return { year: billingYear, month: billingMonth };
    }
    
    const currentBilling = getBillingMonth({
      date: expenseDate,
      payment_method: paymentMethod || 'cash',
      card_id: cardId || null
    }, cards);
    
    const allExpenses = await env.DB.prepare(
      'SELECT date, amount, payment_method, card_id FROM expenses WHERE user_id = ? AND category = ?'
    ).bind(userId, category).all();
    
    let spent = 0;
    for (const exp of (allExpenses.results || [])) {
      const expBilling = getBillingMonth(exp, cards);
      if (expBilling.year === currentBilling.year && expBilling.month === currentBilling.month) {
        spent += parseFloat(exp.amount) || 0;
      }
    }
    
    const percentage = Math.round((spent / budget.amount) * 100);
    const threshold = user.budget_alert_threshold || 80;
    
    if (percentage >= threshold) {
      const alertKey = `${budget.id}-${currentBilling.year}-${currentBilling.month}`;
      const alreadySent = await env.DB.prepare(
        'SELECT id FROM budget_alert_log WHERE user_id = ? AND alert_key = ?'
      ).bind(userId, alertKey).first();
      
      if (!alreadySent) {
        await sendBudgetAlertEmail(
          user.email, user.name, category, spent, budget.amount, percentage, env.RESEND_API_KEY
        );
        
        const logId = 'bal-' + Date.now();
        await env.DB.prepare(
          'INSERT INTO budget_alert_log (id, user_id, budget_id, alert_key, percentage_at_alert) VALUES (?, ?, ?, ?, ?)'
        ).bind(logId, userId, budget.id, alertKey, percentage).run();
      }
    }
  } catch (alertError) {
    console.error('Budget alert error:', alertError);
  }
}
