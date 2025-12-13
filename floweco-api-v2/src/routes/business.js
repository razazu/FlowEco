// ========================================
// FlowEco API - Business Mode Routes
// הוצאות/הכנסות עסקיות, לקוחות, ספקים, דוח מע"מ
// ========================================

import { jsonResponse } from '../utils/response.js';
import { VAT_RATE } from '../utils/constants.js';

// ==========================================
// BUSINESS EXPENSES
// ==========================================

export async function handleGetBizExpenses(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get('month');
  let query = 'SELECT * FROM business_expenses WHERE user_id = ?';
  let params = [userId];
  
  if (monthParam) {
    query += ' AND date LIKE ?';
    params.push(monthParam + '%');
  }
  
  query += ' ORDER BY date DESC';
  
  const { results } = await env.DB.prepare(query).bind(...params).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

export async function handleGetBizExpense(env, userId, expId, corsHeaders) {
  const expense = await env.DB.prepare(
    'SELECT * FROM business_expenses WHERE id = ? AND user_id = ?'
  ).bind(expId, userId).first();
  
  if (!expense) {
    return jsonResponse({ success: false, error: 'הוצאה לא נמצאה' }, 404, corsHeaders);
  }
  
  return jsonResponse({ success: true, data: expense }, 200, corsHeaders);
}

export async function handleCreateBizExpense(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'biz-exp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

  await env.DB.prepare(
    `INSERT INTO business_expenses (id, user_id, amount, category, description, date, includes_vat, supplier_id, invoice_number) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, userId, body.amount, body.category, body.description || '', body.date,
    body.includesVat ? 1 : 0, body.supplierId || null, body.invoiceNumber || null
  ).run();

  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}

export async function handleUpdateBizExpense(request, env, userId, expId, corsHeaders) {
  const body = await request.json();

  await env.DB.prepare(
    `UPDATE business_expenses SET amount = ?, category = ?, description = ?, date = ?, 
     includes_vat = ?, supplier_id = ?, invoice_number = ? WHERE id = ? AND user_id = ?`
  ).bind(
    body.amount, body.category, body.description || '', body.date,
    body.includesVat ? 1 : 0, body.supplierId || null, body.invoiceNumber || null,
    expId, userId
  ).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteBizExpense(env, userId, expId, corsHeaders) {
  await env.DB.prepare('DELETE FROM business_expenses WHERE id = ? AND user_id = ?')
    .bind(expId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ==========================================
// BUSINESS INCOMES
// ==========================================

export async function handleGetBizIncomes(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get('month');
  let query = 'SELECT * FROM business_incomes WHERE user_id = ?';
  let params = [userId];
  
  if (monthParam) {
    query += ' AND date LIKE ?';
    params.push(monthParam + '%');
  }
  
  query += ' ORDER BY date DESC';
  
  const { results } = await env.DB.prepare(query).bind(...params).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}

export async function handleGetBizIncome(env, userId, incId, corsHeaders) {
  const income = await env.DB.prepare(
    'SELECT * FROM business_incomes WHERE id = ? AND user_id = ?'
  ).bind(incId, userId).first();
  
  if (!income) {
    return jsonResponse({ success: false, error: 'הכנסה לא נמצאה' }, 404, corsHeaders);
  }
  
  return jsonResponse({ success: true, data: income }, 200, corsHeaders);
}

export async function handleCreateBizIncome(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'biz-inc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

  await env.DB.prepare(
    `INSERT INTO business_incomes (id, user_id, amount, source, description, date, includes_vat, client_id, invoice_number) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, userId, body.amount, body.source, body.description || '', body.date,
    body.includesVat ? 1 : 0, body.clientId || null, body.invoiceNumber || null
  ).run();

  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}

export async function handleUpdateBizIncome(request, env, userId, incId, corsHeaders) {
  const body = await request.json();

  await env.DB.prepare(
    `UPDATE business_incomes SET amount = ?, source = ?, description = ?, date = ?, 
     includes_vat = ?, client_id = ?, invoice_number = ? WHERE id = ? AND user_id = ?`
  ).bind(
    body.amount, body.source, body.description || '', body.date,
    body.includesVat ? 1 : 0, body.clientId || null, body.invoiceNumber || null,
    incId, userId
  ).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteBizIncome(env, userId, incId, corsHeaders) {
  await env.DB.prepare('DELETE FROM business_incomes WHERE id = ? AND user_id = ?')
    .bind(incId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ==========================================
// BUSINESS DASHBOARD
// ==========================================

export async function handleBizDashboard(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get('month');
  let expQuery = 'SELECT * FROM business_expenses WHERE user_id = ?';
  let incQuery = 'SELECT * FROM business_incomes WHERE user_id = ?';
  let params = [userId];
  
  if (monthParam) {
    expQuery += ' AND date LIKE ?';
    incQuery += ' AND date LIKE ?';
    params.push(monthParam + '%');
  }
  
  const { results: expenses } = await env.DB.prepare(expQuery).bind(...params).all();
  const { results: incomes } = await env.DB.prepare(incQuery).bind(...params).all();
  
  let totalExpenses = 0, totalExpensesNet = 0, totalExpensesVat = 0;
  let totalIncomes = 0, totalIncomesNet = 0, totalIncomesVat = 0;
  
  (expenses || []).forEach(exp => {
    const amount = parseFloat(exp.amount) || 0;
    totalExpenses += amount;
    if (exp.includes_vat === 1) {
      totalExpensesNet += amount / (1 + VAT_RATE);
      totalExpensesVat += amount - (amount / (1 + VAT_RATE));
    } else {
      totalExpensesNet += amount;
    }
  });
  
  (incomes || []).forEach(inc => {
    const amount = parseFloat(inc.amount) || 0;
    totalIncomes += amount;
    if (inc.includes_vat === 1) {
      totalIncomesNet += amount / (1 + VAT_RATE);
      totalIncomesVat += amount - (amount / (1 + VAT_RATE));
    } else {
      totalIncomesNet += amount;
    }
  });
  
  return jsonResponse({
    success: true,
    data: {
      expenses: {
        total: totalExpenses,
        net: totalExpensesNet,
        vat: totalExpensesVat,
        count: (expenses || []).length
      },
      incomes: {
        total: totalIncomes,
        net: totalIncomesNet,
        vat: totalIncomesVat,
        count: (incomes || []).length
      },
      profit: totalIncomesNet - totalExpensesNet,
      vatBalance: totalIncomesVat - totalExpensesVat
    }
  }, 200, corsHeaders);
}

// ==========================================
// VAT REPORT
// ==========================================

export async function handleVatReport(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const startMonth = url.searchParams.get('startMonth');
  const endMonth = url.searchParams.get('endMonth');
  
  if (!startMonth || !endMonth) {
    return jsonResponse({ success: false, error: 'חובה לציין תקופה' }, 400, corsHeaders);
  }
  
  const { results: expenses } = await env.DB.prepare(
    `SELECT * FROM business_expenses WHERE user_id = ? AND date >= ? AND date <= ?`
  ).bind(userId, startMonth + '-01', endMonth + '-31').all();
  
  const { results: incomes } = await env.DB.prepare(
    `SELECT * FROM business_incomes WHERE user_id = ? AND date >= ? AND date <= ?`
  ).bind(userId, startMonth + '-01', endMonth + '-31').all();
  
  let vatCollected = 0, vatPaid = 0;
  let totalIncomesGross = 0, totalIncomesNet = 0;
  let totalExpensesGross = 0, totalExpensesNet = 0;
  
  (incomes || []).forEach(inc => {
    const amount = parseFloat(inc.amount) || 0;
    totalIncomesGross += amount;
    if (inc.includes_vat === 1) {
      totalIncomesNet += amount / (1 + VAT_RATE);
      vatCollected += amount - (amount / (1 + VAT_RATE));
    } else {
      totalIncomesNet += amount;
    }
  });
  
  (expenses || []).forEach(exp => {
    const amount = parseFloat(exp.amount) || 0;
    totalExpensesGross += amount;
    if (exp.includes_vat === 1) {
      totalExpensesNet += amount / (1 + VAT_RATE);
      vatPaid += amount - (amount / (1 + VAT_RATE));
    } else {
      totalExpensesNet += amount;
    }
  });
  
  return jsonResponse({
    success: true,
    data: {
      period: { start: startMonth, end: endMonth },
      incomes: {
        gross: totalIncomesGross,
        net: totalIncomesNet,
        vatCollected: vatCollected,
        count: (incomes || []).length,
        items: incomes || []
      },
      expenses: {
        gross: totalExpensesGross,
        net: totalExpensesNet,
        vatPaid: vatPaid,
        count: (expenses || []).length,
        items: expenses || []
      },
      vatBalance: vatCollected - vatPaid,
      vatStatus: (vatCollected - vatPaid) >= 0 ? 'payment' : 'refund'
    }
  }, 200, corsHeaders);
}

// ==========================================
// CLIENTS
// ==========================================

export async function handleGetClients(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM business_clients WHERE user_id = ? ORDER BY name ASC'
  ).bind(userId).all();
  
  const clientsWithStats = await Promise.all((results || []).map(async (client) => {
    const incomeStats = await env.DB.prepare(
      'SELECT SUM(amount) as total, COUNT(*) as count FROM business_incomes WHERE user_id = ? AND client_id = ?'
    ).bind(userId, client.id).first();
    
    return {
      ...client,
      total_income: incomeStats?.total || 0,
      transaction_count: incomeStats?.count || 0
    };
  }));
  
  return jsonResponse({ success: true, data: clientsWithStats }, 200, corsHeaders);
}

export async function handleGetClient(env, userId, clientId, corsHeaders) {
  const client = await env.DB.prepare(
    'SELECT * FROM business_clients WHERE id = ? AND user_id = ?'
  ).bind(clientId, userId).first();
  
  if (!client) {
    return jsonResponse({ success: false, error: 'לקוח לא נמצא' }, 404, corsHeaders);
  }

  const { results: incomes } = await env.DB.prepare(
    'SELECT * FROM business_incomes WHERE user_id = ? AND client_id = ? ORDER BY date DESC'
  ).bind(userId, clientId).all();

  const totalIncome = (incomes || []).reduce((sum, inc) => sum + (parseFloat(inc.amount) || 0), 0);
  
  return jsonResponse({ 
    success: true, 
    data: { 
      ...client, 
      incomes: incomes || [],
      total_income: totalIncome,
      transaction_count: (incomes || []).length
    } 
  }, 200, corsHeaders);
}

export async function handleCreateClient(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'client-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

  if (!body.name) {
    return jsonResponse({ success: false, error: 'שם לקוח הוא שדה חובה' }, 400, corsHeaders);
  }

  await env.DB.prepare(
    `INSERT INTO business_clients (id, user_id, name, contact_name, phone, email, address, tax_id, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, userId, body.name, body.contactName || null, body.phone || null,
    body.email || null, body.address || null, body.taxId || null, body.notes || null
  ).run();

  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}

export async function handleUpdateClient(request, env, userId, clientId, corsHeaders) {
  const body = await request.json();

  await env.DB.prepare(
    `UPDATE business_clients SET name = ?, contact_name = ?, phone = ?, email = ?, 
     address = ?, tax_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(
    body.name, body.contactName || null, body.phone || null, body.email || null,
    body.address || null, body.taxId || null, body.notes || null, clientId, userId
  ).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteClient(env, userId, clientId, corsHeaders) {
  await env.DB.prepare(
    'UPDATE business_incomes SET client_id = NULL WHERE client_id = ? AND user_id = ?'
  ).bind(clientId, userId).run();
  
  await env.DB.prepare(
    'DELETE FROM business_clients WHERE id = ? AND user_id = ?'
  ).bind(clientId, userId).run();
  
  return jsonResponse({ success: true }, 200, corsHeaders);
}

// ==========================================
// SUPPLIERS
// ==========================================

export async function handleGetSuppliers(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM business_suppliers WHERE user_id = ? ORDER BY name ASC'
  ).bind(userId).all();
  
  const suppliersWithStats = await Promise.all((results || []).map(async (supplier) => {
    const expenseStats = await env.DB.prepare(
      'SELECT SUM(amount) as total, COUNT(*) as count FROM business_expenses WHERE user_id = ? AND supplier_id = ?'
    ).bind(userId, supplier.id).first();
    
    return {
      ...supplier,
      total_expense: expenseStats?.total || 0,
      transaction_count: expenseStats?.count || 0
    };
  }));
  
  return jsonResponse({ success: true, data: suppliersWithStats }, 200, corsHeaders);
}

export async function handleGetSupplier(env, userId, supplierId, corsHeaders) {
  const supplier = await env.DB.prepare(
    'SELECT * FROM business_suppliers WHERE id = ? AND user_id = ?'
  ).bind(supplierId, userId).first();
  
  if (!supplier) {
    return jsonResponse({ success: false, error: 'ספק לא נמצא' }, 404, corsHeaders);
  }

  const { results: expenses } = await env.DB.prepare(
    'SELECT * FROM business_expenses WHERE user_id = ? AND supplier_id = ? ORDER BY date DESC'
  ).bind(userId, supplierId).all();

  const totalExpense = (expenses || []).reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  
  return jsonResponse({ 
    success: true, 
    data: { 
      ...supplier, 
      expenses: expenses || [],
      total_expense: totalExpense,
      transaction_count: (expenses || []).length
    } 
  }, 200, corsHeaders);
}

export async function handleCreateSupplier(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = 'supplier-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

  if (!body.name) {
    return jsonResponse({ success: false, error: 'שם ספק הוא שדה חובה' }, 400, corsHeaders);
  }

  await env.DB.prepare(
    `INSERT INTO business_suppliers (id, user_id, name, contact_name, phone, email, address, tax_id, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, userId, body.name, body.contactName || null, body.phone || null,
    body.email || null, body.address || null, body.taxId || null, body.notes || null
  ).run();

  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}

export async function handleUpdateSupplier(request, env, userId, supplierId, corsHeaders) {
  const body = await request.json();

  await env.DB.prepare(
    `UPDATE business_suppliers SET name = ?, contact_name = ?, phone = ?, email = ?, 
     address = ?, tax_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(
    body.name, body.contactName || null, body.phone || null, body.email || null,
    body.address || null, body.taxId || null, body.notes || null, supplierId, userId
  ).run();

  return jsonResponse({ success: true }, 200, corsHeaders);
}

export async function handleDeleteSupplier(env, userId, supplierId, corsHeaders) {
  await env.DB.prepare(
    'UPDATE business_expenses SET supplier_id = NULL WHERE supplier_id = ? AND user_id = ?'
  ).bind(supplierId, userId).run();
  
  await env.DB.prepare(
    'DELETE FROM business_suppliers WHERE id = ? AND user_id = ?'
  ).bind(supplierId, userId).run();
  
  return jsonResponse({ success: true }, 200, corsHeaders);
}
