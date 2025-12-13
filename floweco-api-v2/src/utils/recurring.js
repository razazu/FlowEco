// ========================================
// FlowEco API - Recurring Transactions Utilities
// ========================================

// Check if a month is within recurring range
export function isMonthInRecurringRange(monthStr, startDate, endDate) {
  const [year, month] = monthStr.split('-').map(Number);
  const requestedMonthNum = year * 12 + month;
  
  const start = new Date(startDate);
  const startMonthNum = start.getFullYear() * 12 + (start.getMonth() + 1);
  
  if (requestedMonthNum < startMonthNum) return false;
  
  if (endDate) {
    const [endYear, endMonth] = endDate.split('-').map(Number);
    const endMonthNum = endYear * 12 + endMonth;
    if (requestedMonthNum > endMonthNum) return false;
  }
  
  return true;
}

// Generate recurring incomes for a specific month
export async function generateRecurringIncomes(db, userId, year, month) {
  const { results: recurringIncomes } = await db.prepare(
    'SELECT * FROM incomes WHERE user_id = ? AND is_recurring = 1'
  ).bind(userId).all();

  if (!recurringIncomes || recurringIncomes.length === 0) return { generated: 0 };

  const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
  const requestedDate = new Date(year, month - 1, 1);
  let generatedCount = 0;

  // Get excluded months for this user
  const { results: exclusions } = await db.prepare(
    'SELECT parent_recurring_id, excluded_month FROM excluded_recurring WHERE user_id = ? AND type = ?'
  ).bind(userId, 'income').all();
  const excludedSet = new Set((exclusions || []).map(e => `${e.parent_recurring_id}|${e.excluded_month}`));

  for (const income of recurringIncomes) {
    const originalDate = new Date(income.date);
    const originalYear = originalDate.getFullYear();
    const originalMonth = originalDate.getMonth() + 1;

    if (originalYear === year && originalMonth === month) continue;
    if (requestedDate < new Date(originalYear, originalMonth - 1, 1)) continue;

    // Check if recurring has ended
    if (income.recurring_end_date && !isMonthInRecurringRange(monthStr, income.date, income.recurring_end_date)) continue;

    // Check if user excluded this income for this month
    if (excludedSet.has(`${income.id}|${monthStr}`)) continue;

    const existingGenerated = await db.prepare(
      `SELECT id FROM incomes WHERE user_id = ? AND parent_recurring_id = ? AND date LIKE ?`
    ).bind(userId, income.id, monthStr + '%').first();

    if (existingGenerated) continue;

    const day = Math.min(originalDate.getDate(), new Date(year, month, 0).getDate());
    const newDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const newId = 'inc-gen-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

    await db.prepare(
      `INSERT INTO incomes (id, amount, source, description, date, is_recurring, recurring_type, user_id, parent_recurring_id) 
       VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?)`
    ).bind(newId, income.amount, income.source, income.description || '', newDate, userId, income.id).run();

    generatedCount++;
  }

  return { generated: generatedCount };
}

// Generate recurring expenses for a specific month
export async function generateRecurringExpenses(db, userId, year, month) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // Allow up to 12 months in the future
  const maxFutureMonths = 12;
  const requestedMonthNum = year * 12 + month;
  const currentMonthNum = currentYear * 12 + currentMonth;
  if (requestedMonthNum > currentMonthNum + maxFutureMonths) {
    return { generated: 0 };
  }

  const { results: recurringExpenses } = await db.prepare(
    'SELECT * FROM expenses WHERE user_id = ? AND is_recurring = 1'
  ).bind(userId).all();

  if (!recurringExpenses || recurringExpenses.length === 0) return { generated: 0 };

  const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
  const requestedDate = new Date(year, month - 1, 1);
  let generatedCount = 0;

  // Get excluded months for this user
  const { results: exclusions } = await db.prepare(
    'SELECT parent_recurring_id, excluded_month FROM excluded_recurring WHERE user_id = ? AND type = ?'
  ).bind(userId, 'expense').all();
  const excludedSet = new Set((exclusions || []).map(e => `${e.parent_recurring_id}|${e.excluded_month}`));

  for (const expense of recurringExpenses) {
    const originalDate = new Date(expense.date);
    const originalYear = originalDate.getFullYear();
    const originalMonth = originalDate.getMonth() + 1;

    if (originalYear === year && originalMonth === month) continue;
    if (requestedDate < new Date(originalYear, originalMonth - 1, 1)) continue;

    // Check if recurring has ended
    if (expense.recurring_end_date && !isMonthInRecurringRange(monthStr, expense.date, expense.recurring_end_date)) continue;

    // Check if user excluded this expense for this month
    if (excludedSet.has(`${expense.id}|${monthStr}`)) continue;

    const existingGenerated = await db.prepare(
      `SELECT id FROM expenses WHERE user_id = ? AND parent_recurring_id = ? AND date LIKE ?`
    ).bind(userId, expense.id, monthStr + '%').first();

    if (existingGenerated) continue;

    const day = Math.min(originalDate.getDate(), new Date(year, month, 0).getDate());
    const newDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const newId = 'exp-gen-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

    await db.prepare(
      `INSERT INTO expenses (id, amount, category, description, date, is_recurring, recurring_type, user_id, payment_method, card_id, expense_type, parent_recurring_id) 
       VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?, ?, 'regular', ?)`
    ).bind(
      newId, expense.amount, expense.category, expense.description || '',
      newDate, userId, expense.payment_method || 'cash',
      expense.card_id || null, expense.id
    ).run();

    generatedCount++;
  }

  return { generated: generatedCount };
}
