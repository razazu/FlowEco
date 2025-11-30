export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ========== AUTHENTICATION ==========

      if (path === '/api/register' && request.method === 'POST') {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
          return new Response(JSON.stringify({ success: false, error: 'נא למלא את כל השדות' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(JSON.stringify({ success: false, error: 'אימייל לא תקין' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (password.length < 6) {
          return new Response(JSON.stringify({ success: false, error: 'סיסמה חייבת להיות לפחות 6 תווים' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existingUser) {
          return new Response(JSON.stringify({ success: false, error: 'המשתמש כבר קיים במערכת' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const passwordHash = await hashPassword(password);
        const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        await env.DB.prepare(
          'INSERT INTO users (id, email, password_hash, name, subscription_plan, subscription_status) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(userId, email.toLowerCase(), passwordHash, name, 'free', 'active').run();

        // Create default categories for new user
        const defaultCategories = [
          // Expense categories
          { name: 'מזון וסופר', type: 'expense', icon: '🛒', color: '#10B981' },
          { name: 'מסעדות', type: 'expense', icon: '🍔', color: '#F59E0B' },
          { name: 'תחבורה', type: 'expense', icon: '🚗', color: '#3B82F6' },
          { name: 'דיור', type: 'expense', icon: '🏠', color: '#8B5CF6' },
          { name: 'חשבונות', type: 'expense', icon: '💡', color: '#EF4444' },
          { name: 'טלפון ואינטרנט', type: 'expense', icon: '📱', color: '#06B6D4' },
          { name: 'בילויים', type: 'expense', icon: '🎮', color: '#EC4899' },
          { name: 'ביגוד', type: 'expense', icon: '👕', color: '#667eea' },
          { name: 'בריאות', type: 'expense', icon: '💊', color: '#14B8A6' },
          { name: 'חופשות', type: 'expense', icon: '✈️', color: '#F97316' },
          { name: 'חינוך', type: 'expense', icon: '🎓', color: '#6366F1' },
          // Income categories
          { name: 'משכורת', type: 'income', icon: '💰', color: '#10B981' },
          { name: 'בונוס', type: 'income', icon: '🎁', color: '#F59E0B' },
          { name: 'השקעות', type: 'income', icon: '📈', color: '#3B82F6' }
        ];

        for (const cat of defaultCategories) {
          const catId = 'cat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
          await env.DB.prepare(
            'INSERT INTO categories (id, user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)'
          ).bind(catId, userId, cat.name, cat.type, cat.icon, cat.color).run();
        }

        const token = await createToken(userId, email);

        return new Response(JSON.stringify({
          success: true, message: 'נרשמת בהצלחה!',
          data: { token, user: { id: userId, email, name } }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (path === '/api/login' && request.method === 'POST') {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
          return new Response(JSON.stringify({ success: false, error: 'נא למלא אימייל וסיסמה' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const user = await env.DB.prepare(
          'SELECT id, email, password_hash, name, is_admin FROM users WHERE email = ?'
        ).bind(email.toLowerCase()).first();

        if (!user) {
          return new Response(JSON.stringify({ success: false, error: 'אימייל או סיסמה שגויים' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
          return new Response(JSON.stringify({ success: false, error: 'אימייל או סיסמה שגויים' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const token = await createToken(user.id, user.email);

        return new Response(JSON.stringify({
          success: true, message: 'התחברת בהצלחה!',
          data: { token, user: { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin || 0 } }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ========== PROTECTED ROUTES ==========
      const authHeader = request.headers.get('Authorization');
      let userId = null;
      
      if (path.startsWith('/api/') && !path.includes('/register') && !path.includes('/login')) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return new Response(JSON.stringify({ success: false, error: 'נדרשת התחברות' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const token = authHeader.replace('Bearer ', '');
        userId = await getUserIdFromToken(token);
        
        if (!userId) {
          return new Response(JSON.stringify({ success: false, error: 'Token לא תקין' }), {
            status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // ========== HELPER FUNCTIONS ==========
      
      async function isUserAdmin(checkUserId) {
        const user = await env.DB.prepare('SELECT is_admin FROM users WHERE id = ?').bind(checkUserId).first();
        return user && user.is_admin === 1;
      }

      // Generate recurring incomes for a specific month (FORWARD only - from original date onwards)
      async function generateRecurringIncomes(userId, year, month) {
        const { results: recurringIncomes } = await env.DB.prepare(
          'SELECT * FROM incomes WHERE user_id = ? AND is_recurring = 1'
        ).bind(userId).all();

        if (!recurringIncomes || recurringIncomes.length === 0) {
          return { generated: 0 };
        }

        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        const requestedDate = new Date(year, month - 1, 1);
        let generatedCount = 0;

        for (const income of recurringIncomes) {
          const originalDate = new Date(income.date);
          const originalYear = originalDate.getFullYear();
          const originalMonth = originalDate.getMonth() + 1;

          if (originalYear === year && originalMonth === month) {
            continue;
          }

          if (requestedDate < new Date(originalYear, originalMonth - 1, 1)) {
            continue;
          }

          const existingGenerated = await env.DB.prepare(
            `SELECT id FROM incomes WHERE user_id = ? AND parent_recurring_id = ? AND date LIKE ?`
          ).bind(userId, income.id, monthStr + '%').first();

          if (existingGenerated) {
            continue;
          }

          const day = Math.min(originalDate.getDate(), new Date(year, month, 0).getDate());
          const newDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const newId = 'inc-gen-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

          await env.DB.prepare(
            `INSERT INTO incomes (id, amount, source, date, is_recurring, recurring_type, user_id, parent_recurring_id) 
             VALUES (?, ?, ?, ?, 0, NULL, ?, ?)`
          ).bind(newId, income.amount, income.source, newDate, userId, income.id).run();

          generatedCount++;
        }

        return { generated: generatedCount };
      }

      // Generate recurring expenses for a specific month
      async function generateRecurringExpenses(userId, year, month) {
        const { results: recurringExpenses } = await env.DB.prepare(
          'SELECT * FROM expenses WHERE user_id = ? AND is_recurring = 1'
        ).bind(userId).all();

        if (!recurringExpenses || recurringExpenses.length === 0) {
          return { generated: 0 };
        }

        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        const requestedDate = new Date(year, month - 1, 1);
        let generatedCount = 0;

        for (const expense of recurringExpenses) {
          const originalDate = new Date(expense.date);
          const originalYear = originalDate.getFullYear();
          const originalMonth = originalDate.getMonth() + 1;

          if (originalYear === year && originalMonth === month) {
            continue;
          }

          if (requestedDate < new Date(originalYear, originalMonth - 1, 1)) {
            continue;
          }

          const existingGenerated = await env.DB.prepare(
            `SELECT id FROM expenses WHERE user_id = ? AND parent_recurring_id = ? AND date LIKE ?`
          ).bind(userId, expense.id, monthStr + '%').first();

          if (existingGenerated) {
            continue;
          }

          const day = Math.min(originalDate.getDate(), new Date(year, month, 0).getDate());
          const newDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const newId = 'exp-gen-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

          await env.DB.prepare(
            `INSERT INTO expenses (id, amount, category, description, date, is_recurring, recurring_type, user_id, payment_method, card_id, expense_type, parent_recurring_id) 
             VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?, ?, ?, ?)`
          ).bind(
            newId, expense.amount, expense.category, expense.description || '',
            newDate, userId, expense.payment_method || 'cash',
            expense.card_id || null, expense.expense_type || 'regular', expense.id
          ).run();

          generatedCount++;
        }

        return { generated: generatedCount };
      }

      // Generate monthly loan payments
      async function generateLoanPayments(userId, year, month) {
        const { results: activeLoans } = await env.DB.prepare(
          `SELECT * FROM loans WHERE user_id = ? AND status = 'active'`
        ).bind(userId).all();

        if (!activeLoans || activeLoans.length === 0) {
          return { generated: 0 };
        }

        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        let generatedCount = 0;

        for (const loan of activeLoans) {
          const startDate = new Date(loan.start_date);
          const endDate = new Date(loan.end_date);
          const requestedDate = new Date(year, month - 1, 15);

          if (requestedDate < startDate || requestedDate > endDate) {
            continue;
          }

          const existingPayment = await env.DB.prepare(
            `SELECT id FROM expenses WHERE user_id = ? AND loan_id = ? AND date LIKE ?`
          ).bind(userId, loan.id, monthStr + '%').first();

          if (existingPayment) {
            continue;
          }

          const paymentDay = startDate.getDate();
          const day = Math.min(paymentDay, new Date(year, month, 0).getDate());
          const newDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const newId = 'exp-loan-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

          await env.DB.prepare(
            `INSERT INTO expenses (id, amount, category, description, date, is_recurring, user_id, expense_type, loan_id) 
             VALUES (?, ?, ?, ?, ?, 0, ?, 'loan', ?)`
          ).bind(
            newId, loan.monthly_payment, loan.category || 'הלוואה',
            `תשלום הלוואה - ${loan.loan_name}`, newDate, userId, loan.id
          ).run();

          generatedCount++;
        }

        return { generated: generatedCount };
      }

      // Generate monthly installment payments
      async function generateInstallmentPayments(userId, year, month) {
        const { results: activeInstallments } = await env.DB.prepare(
          `SELECT * FROM installment_plans WHERE user_id = ? AND status = 'active'`
        ).bind(userId).all();

        if (!activeInstallments || activeInstallments.length === 0) {
          return { generated: 0 };
        }

        const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
        let generatedCount = 0;

        for (const inst of activeInstallments) {
          const firstPaymentDate = new Date(inst.first_payment_date);
          const firstYear = firstPaymentDate.getFullYear();
          const firstMonth = firstPaymentDate.getMonth() + 1;

          const monthsDiff = (year - firstYear) * 12 + (month - firstMonth);

          if (monthsDiff < 0 || monthsDiff >= inst.total_installments) {
            continue;
          }

          const existingPayment = await env.DB.prepare(
            `SELECT id FROM expenses WHERE user_id = ? AND installment_plan_id = ? AND date LIKE ?`
          ).bind(userId, inst.id, monthStr + '%').first();

          if (existingPayment) {
            continue;
          }

          const paymentDay = firstPaymentDate.getDate();
          const day = Math.min(paymentDay, new Date(year, month, 0).getDate());
          const newDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          const newId = 'exp-inst-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
          const currentInstallment = monthsDiff + 1;

          await env.DB.prepare(
            `INSERT INTO expenses (id, amount, category, description, date, is_recurring, user_id, card_id, expense_type, installment_plan_id) 
             VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'installment', ?)`
          ).bind(
            newId, inst.installment_amount, inst.category || 'תשלומים',
            `${inst.description} (${currentInstallment}/${inst.total_installments})`,
            newDate, userId, inst.card_id || null, inst.id
          ).run();

          generatedCount++;
        }

        return { generated: generatedCount };
      }

      // ========== ADMIN ENDPOINTS ==========

      if (path === '/api/admin/stats' && request.method === 'GET') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
        const freeUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_plan = 'free'").first();
        const trialUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_plan = 'trial'").first();
        const proUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_plan = 'pro'").first();
        
        // Users joined this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        const newUsersThisWeek = await env.DB.prepare(
          "SELECT COUNT(*) as count FROM users WHERE created_at >= ?"
        ).bind(weekAgoStr).first();

        // Active users (logged in last 30 days) - for now just count all
        const activeUsers = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();

        return new Response(JSON.stringify({ 
          success: true, 
          data: {
            totalUsers: userCount?.count || 0,
            freeUsers: freeUsers?.count || 0,
            trialUsers: trialUsers?.count || 0,
            proUsers: proUsers?.count || 0,
            newUsersThisWeek: newUsersThisWeek?.count || 0,
            activeUsers: activeUsers?.count || 0
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (path === '/api/admin/users' && request.method === 'GET') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { results } = await env.DB.prepare(
          'SELECT id, name, email, is_admin, subscription_plan, subscription_status, account_status, created_at FROM users ORDER BY created_at DESC'
        ).all();

        return new Response(JSON.stringify({ success: true, data: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET single user with stats (for View User modal) - ANONYMOUS DATA
      if (path.match(/^\/api\/admin\/users\/[^\/]+\/stats$/) && request.method === 'GET') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const targetUserId = path.split('/')[4];
        
        const user = await env.DB.prepare(
          'SELECT id, name, email, is_admin, subscription_plan, subscription_status, account_status, created_at FROM users WHERE id = ?'
        ).bind(targetUserId).first();

        if (!user) {
          return new Response(JSON.stringify({ success: false, error: 'משתמש לא נמצא' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Activity counts (anonymous - no amounts)
        const expenseCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM expenses WHERE user_id = ?'
        ).bind(targetUserId).first();

        const incomeCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM incomes WHERE user_id = ?'
        ).bind(targetUserId).first();

        const budgetCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM budgets WHERE user_id = ?'
        ).bind(targetUserId).first();

        const cardCount = await env.DB.prepare(
          'SELECT COUNT(*) as count FROM cards WHERE user_id = ?'
        ).bind(targetUserId).first();

        // Last activity date
        const lastExpense = await env.DB.prepare(
          'SELECT created_at FROM expenses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
        ).bind(targetUserId).first();

        const lastIncome = await env.DB.prepare(
          'SELECT created_at FROM incomes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
        ).bind(targetUserId).first();

        // Determine last activity
        let lastActivity = user.created_at;
        if (lastExpense && lastExpense.created_at > lastActivity) {
          lastActivity = lastExpense.created_at;
        }
        if (lastIncome && lastIncome.created_at > lastActivity) {
          lastActivity = lastIncome.created_at;
        }

        // Total actions
        const totalActions = (expenseCount?.count || 0) + (incomeCount?.count || 0) + (budgetCount?.count || 0);

        // Activity level
        let activityLevel = 'לא פעיל';
        if (totalActions > 50) {
          activityLevel = 'פעיל מאוד';
        } else if (totalActions > 20) {
          activityLevel = 'פעיל';
        } else if (totalActions > 5) {
          activityLevel = 'פעיל חלקית';
        } else if (totalActions > 0) {
          activityLevel = 'התחיל להשתמש';
        }

        return new Response(JSON.stringify({
          success: true,
          data: {
            user: user,
            activity: {
              totalActions: totalActions,
              expensesCount: expenseCount?.count || 0,
              incomesCount: incomeCount?.count || 0,
              budgetsCount: budgetCount?.count || 0,
              cardsCount: cardCount?.count || 0,
              lastActivity: lastActivity,
              activityLevel: activityLevel,
              registeredAt: user.created_at
            }
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // UPDATE user (for Edit User modal)
      if (path.match(/^\/api\/admin\/users\/[^\/]+$/) && request.method === 'PUT') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const targetUserId = path.split('/').pop();
        const body = await request.json();

        await env.DB.prepare(
          `UPDATE users SET 
            name = ?, 
            email = ?, 
            subscription_plan = ?, 
            is_admin = ?,
            subscription_status = ?,
            account_status = ?
           WHERE id = ?`
        ).bind(
          body.name,
          body.email.toLowerCase(),
          body.subscription_plan || 'free',
          (body.role === 'admin' || body.is_admin) ? 1 : 0,
          body.subscription_status || 'active',
          body.account_status || 'active',
          targetUserId
        ).run();

        return new Response(JSON.stringify({ success: true, message: 'המשתמש עודכן בהצלחה' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // DELETE user
      if (path.match(/^\/api\/admin\/users\/[^\/]+$/) && request.method === 'DELETE') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const targetUserId = path.split('/').pop();

        if (targetUserId === userId) {
          return new Response(JSON.stringify({ success: false, error: 'לא ניתן למחוק את עצמך' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.DB.prepare('DELETE FROM expenses WHERE user_id = ?').bind(targetUserId).run();
        await env.DB.prepare('DELETE FROM incomes WHERE user_id = ?').bind(targetUserId).run();
        await env.DB.prepare('DELETE FROM budgets WHERE user_id = ?').bind(targetUserId).run();
        await env.DB.prepare('DELETE FROM cards WHERE user_id = ?').bind(targetUserId).run();
        await env.DB.prepare('DELETE FROM loans WHERE user_id = ?').bind(targetUserId).run();
        await env.DB.prepare('DELETE FROM installment_plans WHERE user_id = ?').bind(targetUserId).run();
        await env.DB.prepare('DELETE FROM feedback WHERE user_id = ?').bind(targetUserId).run();
        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(targetUserId).run();

        return new Response(JSON.stringify({ success: true, message: 'המשתמש נמחק בהצלחה' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // CREATE new user (for Add User modal)
      if (path === '/api/admin/users' && request.method === 'POST') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const body = await request.json();
        const { email, password, name, is_admin, subscription_plan } = body;

        if (!email || !password || !name) {
          return new Response(JSON.stringify({ success: false, error: 'נא למלא את כל השדות' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
        if (existingUser) {
          return new Response(JSON.stringify({ success: false, error: 'המשתמש כבר קיים במערכת' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const passwordHash = await hashPassword(password);
        const newUserId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

        await env.DB.prepare(
          'INSERT INTO users (id, email, password_hash, name, is_admin, subscription_plan, subscription_status, account_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(
          newUserId,
          email.toLowerCase(),
          passwordHash,
          name,
          is_admin ? 1 : 0,
          subscription_plan || 'free',
          'active',
          'active'
        ).run();

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'המשתמש נוצר בהצלחה',
          data: { id: newUserId }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // RESET password
      if (path === '/api/admin/reset-password' && request.method === 'POST') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const body = await request.json();
        const { user_id, new_password } = body;

        if (!user_id || !new_password) {
          return new Response(JSON.stringify({ success: false, error: 'נא למלא את כל השדות' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (new_password.length < 6) {
          return new Response(JSON.stringify({ success: false, error: 'סיסמה חייבת להיות לפחות 6 תווים' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const passwordHash = await hashPassword(new_password);

        await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
          .bind(passwordHash, user_id).run();

        return new Response(JSON.stringify({ success: true, message: 'הסיסמה אופסה בהצלחה' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GET all feedback (for admin)
      if (path === '/api/admin/feedback' && request.method === 'GET') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { results } = await env.DB.prepare(
          'SELECT * FROM feedback ORDER BY created_at DESC'
        ).all();

        return new Response(JSON.stringify({ success: true, data: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // UPDATE feedback
      if (path.match(/^\/api\/admin\/feedback\/[^\/]+$/) && request.method === 'PUT') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const feedbackId = path.split('/').pop();
        const body = await request.json();

        await env.DB.prepare(
          'UPDATE feedback SET status = ?, admin_notes = ? WHERE id = ?'
        ).bind(body.status || 'new', body.admin_notes || '', feedbackId).run();

        return new Response(JSON.stringify({ success: true, message: 'המשוב עודכן בהצלחה' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // DELETE feedback
      if (path.match(/^\/api\/admin\/feedback\/[^\/]+$/) && request.method === 'DELETE') {
        if (!await isUserAdmin(userId)) {
          return new Response(JSON.stringify({ success: false, error: 'גישה נדחתה' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const feedbackId = path.split('/').pop();

        await env.DB.prepare('DELETE FROM feedback WHERE id = ?').bind(feedbackId).run();

        return new Response(JSON.stringify({ success: true, message: 'המשוב נמחק בהצלחה' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== PROFILE ==========

      if (path === '/api/profile' && request.method === 'PUT') {
        const body = await request.json();
        const { name, email } = body;

        if (!name || !email) {
          return new Response(JSON.stringify({ success: false, error: 'נא למלא את כל השדות' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check if email already exists (for another user)
        const existing = await env.DB.prepare(
          'SELECT id FROM users WHERE email = ? AND id != ?'
        ).bind(email, userId).first();

        if (existing) {
          return new Response(JSON.stringify({ success: false, error: 'האימייל כבר קיים במערכת' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.DB.prepare(
          'UPDATE users SET name = ?, email = ? WHERE id = ?'
        ).bind(name, email, userId).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/change-password' && request.method === 'POST') {
        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
          return new Response(JSON.stringify({ success: false, error: 'נא למלא את כל השדות' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (newPassword.length < 6) {
          return new Response(JSON.stringify({ success: false, error: 'הסיסמה חייבת להכיל לפחות 6 תווים' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get current user
        const user = await env.DB.prepare('SELECT password FROM users WHERE id = ?').bind(userId).first();
        if (!user) {
          return new Response(JSON.stringify({ success: false, error: 'משתמש לא נמצא' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Verify current password
        const currentHash = await hashPassword(currentPassword);
        if (currentHash !== user.password) {
          return new Response(JSON.stringify({ success: false, error: 'הסיסמה הנוכחית שגויה' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Update password
        const newHash = await hashPassword(newPassword);
        await env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(newHash, userId).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== CARDS ==========

      if (path === '/api/cards' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC'
        ).bind(userId).all();
        
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/cards' && request.method === 'POST') {
        const body = await request.json();
        const id = 'card-' + Date.now();

        await env.DB.prepare(
          'INSERT INTO cards (id, user_id, card_name, last_four, color, billing_day) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(id, userId, body.card_name, body.last_four || null, body.color || '#667eea', body.billing_day || null).run();

        return new Response(JSON.stringify({ success: true, data: { id } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.startsWith('/api/cards/') && request.method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json();
        
        await env.DB.prepare(
          'UPDATE cards SET card_name = ?, last_four = ?, color = ?, billing_day = ? WHERE id = ? AND user_id = ?'
        ).bind(body.card_name, body.last_four || null, body.color || '#667eea', body.billing_day || null, id, userId).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.startsWith('/api/cards/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM cards WHERE id = ? AND user_id = ?').bind(id, userId).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== CATEGORIES ==========

      // GET all categories
      if (path === '/api/categories' && request.method === 'GET') {
        let { results } = await env.DB.prepare(
          'SELECT * FROM categories WHERE user_id = ? ORDER BY type, name'
        ).bind(userId).all();
        
        // If no categories exist, create defaults
        if (!results || results.length === 0) {
          const defaultCategories = [
            { name: 'מזון וסופר', type: 'expense', icon: '🛒', color: '#10B981' },
            { name: 'מסעדות', type: 'expense', icon: '🍔', color: '#F59E0B' },
            { name: 'תחבורה', type: 'expense', icon: '🚗', color: '#3B82F6' },
            { name: 'דיור', type: 'expense', icon: '🏠', color: '#8B5CF6' },
            { name: 'חשבונות', type: 'expense', icon: '💡', color: '#EF4444' },
            { name: 'טלפון ואינטרנט', type: 'expense', icon: '📱', color: '#06B6D4' },
            { name: 'בילויים', type: 'expense', icon: '🎮', color: '#EC4899' },
            { name: 'ביגוד', type: 'expense', icon: '👕', color: '#667eea' },
            { name: 'בריאות', type: 'expense', icon: '💊', color: '#14B8A6' },
            { name: 'חופשות', type: 'expense', icon: '✈️', color: '#F97316' },
            { name: 'חינוך', type: 'expense', icon: '🎓', color: '#6366F1' },
            { name: 'קניות', type: 'expense', icon: '🛍️', color: '#A855F7' },
            { name: 'ספורט', type: 'expense', icon: '🏃', color: '#22C55E' },
            { name: 'מתנות', type: 'expense', icon: '🎁', color: '#E11D48' },
            { name: 'אחר', type: 'expense', icon: '📦', color: '#6B7280' },
            { name: 'משכורת', type: 'income', icon: '💰', color: '#10B981' },
            { name: 'בונוס', type: 'income', icon: '🎁', color: '#F59E0B' },
            { name: 'השקעות', type: 'income', icon: '📈', color: '#3B82F6' },
            { name: 'מתנה', type: 'income', icon: '🎀', color: '#EC4899' },
            { name: 'אחר', type: 'income', icon: '📦', color: '#6B7280' }
          ];

          results = [];
          for (const cat of defaultCategories) {
            const catId = 'cat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
            await env.DB.prepare(
              'INSERT INTO categories (id, user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)'
            ).bind(catId, userId, cat.name, cat.type, cat.icon, cat.color).run();
            results.push({ id: catId, user_id: userId, ...cat });
          }
        }
        
        return new Response(JSON.stringify({ success: true, data: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // POST new category
      if (path === '/api/categories' && request.method === 'POST') {
        const body = await request.json();
        
        if (!body.name || !body.type) {
          return new Response(JSON.stringify({ success: false, error: 'נא למלא שם וסוג קטגוריה' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check for duplicate name
        const existing = await env.DB.prepare(
          'SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ?'
        ).bind(userId, body.name, body.type).first();

        if (existing) {
          return new Response(JSON.stringify({ success: false, error: 'קטגוריה עם שם זה כבר קיימת' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const id = 'cat-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
        
        await env.DB.prepare(
          'INSERT INTO categories (id, user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(id, userId, body.name, body.type, body.icon || '📦', body.color || '#667eea').run();
        
        return new Response(JSON.stringify({ 
          success: true, 
          data: { id, user_id: userId, name: body.name, type: body.type, icon: body.icon || '📦', color: body.color || '#667eea' }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // PUT update category
      if (path.match(/^\/api\/categories\/[^\/]+$/) && request.method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json();

        // Get old category name for updating expenses/incomes
        const oldCategory = await env.DB.prepare(
          'SELECT name, type FROM categories WHERE id = ? AND user_id = ?'
        ).bind(id, userId).first();

        if (!oldCategory) {
          return new Response(JSON.stringify({ success: false, error: 'קטגוריה לא נמצאה' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check for duplicate name (excluding current)
        if (body.name && body.name !== oldCategory.name) {
          const duplicate = await env.DB.prepare(
            'SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ? AND id != ?'
          ).bind(userId, body.name, oldCategory.type, id).first();

          if (duplicate) {
            return new Response(JSON.stringify({ success: false, error: 'קטגוריה עם שם זה כבר קיימת' }), {
              status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        // Update category
        await env.DB.prepare(
          'UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?'
        ).bind(body.name || oldCategory.name, body.icon || '📦', body.color || '#667eea', id, userId).run();

        // Update expenses/incomes with old category name to new name
        if (body.name && body.name !== oldCategory.name) {
          if (oldCategory.type === 'expense') {
            await env.DB.prepare(
              'UPDATE expenses SET category = ? WHERE user_id = ? AND category = ?'
            ).bind(body.name, userId, oldCategory.name).run();
          } else {
            await env.DB.prepare(
              'UPDATE incomes SET source = ? WHERE user_id = ? AND source = ?'
            ).bind(body.name, userId, oldCategory.name).run();
          }
        }
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // DELETE category
      if (path.match(/^\/api\/categories\/[^\/]+$/) && request.method === 'DELETE') {
        const id = path.split('/').pop();

        // Get category info
        const category = await env.DB.prepare(
          'SELECT name, type FROM categories WHERE id = ? AND user_id = ?'
        ).bind(id, userId).first();

        if (!category) {
          return new Response(JSON.stringify({ success: false, error: 'קטגוריה לא נמצאה' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check if category is in use
        let inUse = false;
        if (category.type === 'expense') {
          const expenseCount = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND category = ?'
          ).bind(userId, category.name).first();
          inUse = expenseCount && expenseCount.count > 0;
        } else {
          const incomeCount = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM incomes WHERE user_id = ? AND source = ?'
          ).bind(userId, category.name).first();
          inUse = incomeCount && incomeCount.count > 0;
        }

        if (inUse) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'לא ניתן למחוק קטגוריה בשימוש. יש להעביר או למחוק את ההוצאות/הכנסות המשויכות אליה תחילה.' 
          }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        await env.DB.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').bind(id, userId).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== LOANS ==========

      if (path === '/api/loans' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC'
        ).bind(userId).all();
        
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/loans' && request.method === 'POST') {
        const body = await request.json();
        const id = 'loan-' + Date.now();

        const startDate = new Date(body.start_date);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + body.total_months);

        await env.DB.prepare(
          `INSERT INTO loans (id, user_id, loan_name, lender, original_amount, total_months, monthly_payment, interest_rate, start_date, end_date, remaining_amount, remaining_months, status, card_id, category) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
        ).bind(
          id, userId, body.loan_name, body.lender || null, body.original_amount,
          body.total_months, body.monthly_payment, body.interest_rate || null,
          body.start_date, endDate.toISOString().split('T')[0],
          body.original_amount, body.total_months, body.card_id || null, body.category || 'הלוואה'
        ).run();

        return new Response(JSON.stringify({ success: true, data: { id } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.match(/^\/api\/loans\/[^\/]+$/) && request.method === 'DELETE') {
        const loanId = path.split('/').pop();
        await env.DB.prepare('DELETE FROM loans WHERE id = ? AND user_id = ?').bind(loanId, userId).run();
        await env.DB.prepare('DELETE FROM expenses WHERE loan_id = ? AND user_id = ?').bind(loanId, userId).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== INSTALLMENTS ==========

      if (path === '/api/installments' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM installment_plans WHERE user_id = ? ORDER BY created_at DESC'
        ).bind(userId).all();
        
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/installments' && request.method === 'POST') {
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

        return new Response(JSON.stringify({ success: true, data: { id, installment_amount: installmentAmount } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.match(/^\/api\/installments\/[^\/]+$/) && request.method === 'DELETE') {
        const instId = path.split('/').pop();
        await env.DB.prepare('DELETE FROM installment_plans WHERE id = ? AND user_id = ?').bind(instId, userId).run();
        await env.DB.prepare('DELETE FROM expenses WHERE installment_plan_id = ? AND user_id = ?').bind(instId, userId).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== EXPENSES ==========

      if (path === '/api/expenses' && request.method === 'GET') {
        const monthParam = url.searchParams.get('month');
        
        if (monthParam) {
          const [year, month] = monthParam.split('-').map(Number);
          await generateRecurringExpenses(userId, year, month);
          await generateLoanPayments(userId, year, month);
          await generateInstallmentPayments(userId, year, month);
        }

        const { results } = await env.DB.prepare(
          'SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC'
        ).bind(userId).all();
        
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/expenses' && request.method === 'POST') {
        const body = await request.json();
        const id = 'exp-' + Date.now();

        await env.DB.prepare(
          `INSERT INTO expenses (id, amount, category, description, date, is_recurring, recurring_type, user_id, payment_method, card_id, expense_type, installment_plan_id, loan_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id, body.amount, body.category, body.description || '', body.date,
          body.isRecurring ? 1 : 0, body.recurringType || null, userId,
          body.paymentMethod || 'cash', body.cardId || null,
          body.expenseType || 'regular', body.installmentPlanId || null, body.loanId || null
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.match(/^\/api\/expenses\/[^\/]+$/) && request.method === 'PUT') {
        const expId = path.split('/').pop();
        const body = await request.json();

        await env.DB.prepare(
          `UPDATE expenses SET amount = ?, category = ?, description = ?, date = ?, is_recurring = ?, recurring_type = ?, payment_method = ?, card_id = ?
           WHERE id = ? AND user_id = ?`
        ).bind(
          body.amount, body.category, body.description || '', body.date,
          body.isRecurring ? 1 : 0, body.recurringType || null,
          body.paymentMethod || 'cash', body.cardId || null, expId, userId
        ).run();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.startsWith('/api/expenses/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        
        const expense = await env.DB.prepare('SELECT is_recurring FROM expenses WHERE id = ? AND user_id = ?').bind(id, userId).first();
        if (expense && expense.is_recurring === 1) {
          await env.DB.prepare('DELETE FROM expenses WHERE parent_recurring_id = ? AND user_id = ?').bind(id, userId).run();
        }
        
        await env.DB.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?').bind(id, userId).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== INCOMES ==========

      if (path === '/api/incomes' && request.method === 'GET') {
        const monthParam = url.searchParams.get('month');
        
        if (monthParam) {
          const [year, month] = monthParam.split('-').map(Number);
          await generateRecurringIncomes(userId, year, month);
        }

        const { results } = await env.DB.prepare(
          'SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC'
        ).bind(userId).all();
        
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/incomes' && request.method === 'POST') {
        const body = await request.json();
        const id = 'inc-' + Date.now();

        await env.DB.prepare(
          'INSERT INTO incomes (id, amount, source, date, is_recurring, recurring_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(id, body.amount, body.source, body.date, body.isRecurring ? 1 : 0, body.recurringType || null, userId).run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.startsWith('/api/incomes/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        
        const income = await env.DB.prepare('SELECT is_recurring FROM incomes WHERE id = ? AND user_id = ?').bind(id, userId).first();
        if (income && income.is_recurring === 1) {
          await env.DB.prepare('DELETE FROM incomes WHERE parent_recurring_id = ? AND user_id = ?').bind(id, userId).run();
        }
        
        await env.DB.prepare('DELETE FROM incomes WHERE id = ? AND user_id = ?').bind(id, userId).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== BUDGETS ==========

      if (path === '/api/budgets' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC'
        ).bind(userId).all();
        
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path === '/api/budgets' && request.method === 'POST') {
        const body = await request.json();
        const id = 'bdg-' + Date.now();

        await env.DB.prepare('INSERT INTO budgets (id, category, amount, period, user_id) VALUES (?, ?, ?, ?, ?)')
          .bind(id, body.category, body.amount, body.period, userId).run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (path.startsWith('/api/budgets/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        await env.DB.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').bind(id, userId).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== DASHBOARD ==========

      if (path === '/api/dashboard' && request.method === 'GET') {
        const { results: expensesData } = await env.DB.prepare(
          'SELECT SUM(amount) as total, COUNT(*) as count FROM expenses WHERE user_id = ?'
        ).bind(userId).all();
        
        const { results: incomesData } = await env.DB.prepare(
          'SELECT SUM(amount) as total, COUNT(*) as count FROM incomes WHERE user_id = ?'
        ).bind(userId).all();
        
        const { results: categoryData } = await env.DB.prepare(
          'SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC'
        ).bind(userId).all();

        return new Response(JSON.stringify({
          success: true,
          data: {
            expenses: { total: expensesData[0]?.total || 0, count: expensesData[0]?.count || 0 },
            incomes: { total: incomesData[0]?.total || 0, count: incomesData[0]?.count || 0 },
            balance: (incomesData[0]?.total || 0) - (expensesData[0]?.total || 0),
            categories: categoryData
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ========== MONTHLY STATS ==========

      if (path === '/api/monthly-stats' && request.method === 'GET') {
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

        return new Response(JSON.stringify({ success: true, data: monthlyStats }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // ========== AI CHAT ==========

      if (path === '/api/ai-chat' && request.method === 'POST') {
        const body = await request.json();
        const { message, context } = body;

        let systemPrompt = `אתה יועץ כלכלי של FlowEco. תן תשובות קצרות (2-3 משפטים).`;
        if (context) {
          if (context.totalIncomes) systemPrompt += ` הכנסות: ₪${context.totalIncomes}.`;
          if (context.totalExpenses) systemPrompt += ` הוצאות: ₪${context.totalExpenses}.`;
          if (context.balance !== undefined) systemPrompt += ` יתרה: ₪${context.balance}.`;
        }

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
            max_tokens: 500
          })
        });

        if (!openaiResponse.ok) {
          return new Response(JSON.stringify({ success: false, error: 'שגיאה ב-AI' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const aiData = await openaiResponse.json();
        return new Response(JSON.stringify({
          success: true,
          data: { message: aiData.choices[0].message.content }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ========== FEEDBACK ==========

      if (path === '/api/feedback' && request.method === 'POST') {
        const body = await request.json();
        const user = await env.DB.prepare('SELECT name, email FROM users WHERE id = ?').bind(userId).first();
        const feedbackId = 'feedback-' + Date.now();

        await env.DB.prepare(
          'INSERT INTO feedback (id, user_id, user_name, user_email, category, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(feedbackId, userId, user.name, user.email, body.category, body.message, 'new').run();

        return new Response(JSON.stringify({ success: true, message: 'המשוב נשלח!' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: false, error: 'Endpoint not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// ========== HELPER FUNCTIONS ==========

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'floweco-salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password, hash) {
  return await hashPassword(password) === hash;
}

async function createToken(userId, email) {
  const payload = { userId, email, exp: Date.now() + (30 * 24 * 60 * 60 * 1000) };
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload) + 'floweco-secret-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const signature = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return btoa(JSON.stringify(payload)) + '.' + signature;
}

async function getUserIdFromToken(token) {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    
    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp < Date.now()) return null;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload) + 'floweco-secret-2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const expectedSig = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return signature === expectedSig ? payload.userId : null;
  } catch { return null; }
}
