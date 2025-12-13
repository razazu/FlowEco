// ========================================
// FlowEco API v2 - Main Router
// Modular Cloudflare Worker
// ========================================

import { getCorsHeaders, handleOptions } from './utils/cors.js';
import { jsonResponse } from './utils/response.js';
import { getUserIdFromToken } from './utils/auth.js';

// Auth Routes
import { 
  handleSendCode, handleVerifyCode, handleResendCode, 
  handleRegister, handleLogin 
} from './routes/auth.js';

// Profile Routes
import { 
  handleUpdateProfile, handleChangePassword, handleDeleteAccount,
  handleUpdatePwaStatus, handleUpdateAppInfo, handleReportError,
  handleGetSettings, handleUpdateSettings
} from './routes/profile.js';

// Finance Routes
import {
  handleGetExpenses, handleGetExpense, handleCreateExpense, 
  handleUpdateExpense, handleDeleteExpense, handleExpenseRecurring,
  handleGetIncomes, handleGetIncome, handleCreateIncome,
  handleUpdateIncome, handleDeleteIncome, handleIncomeRecurring,
  handleGetBudgets, handleCreateBudget, handleUpdateBudget, handleDeleteBudget,
  handleGetCategories, handleCreateCategory, handleUpdateCategory, handleDeleteCategory,
  handleGetCards, handleCreateCard, handleUpdateCard, handleDeleteCard,
  handleGetLoans, handleCreateLoan, handleUpdateLoan, handleDeleteLoan,
  handleGetInstallments, handleCreateInstallment, handleUpdateInstallment, handleDeleteInstallment
} from './routes/finance.js';

// Dashboard Routes
import { handleDashboard, handleMonthlyStats } from './routes/dashboard.js';

// Subscriptions Routes
import {
  handleGetSubscriptions, handleGetSubscription, handleCreateSubscription,
  handleUpdateSubscription, handleDeleteSubscription, handleCancelSubscription,
  handleReactivateSubscription, handleSubscriptionsSummary, handleTestNotification
} from './routes/subscriptions.js';

// Goals Routes
import {
  handleGetGoals, handleGetGoal, handleCreateGoal, handleUpdateGoal, handleDeleteGoal,
  handleAddContribution, handleDeleteContribution, handleGoalsStats
} from './routes/goals.js';

// Business Routes
import {
  handleGetBizExpenses, handleGetBizExpense, handleCreateBizExpense, 
  handleUpdateBizExpense, handleDeleteBizExpense,
  handleGetBizIncomes, handleGetBizIncome, handleCreateBizIncome,
  handleUpdateBizIncome, handleDeleteBizIncome,
  handleBizDashboard, handleVatReport,
  handleGetClients, handleGetClient, handleCreateClient, handleUpdateClient, handleDeleteClient,
  handleGetSuppliers, handleGetSupplier, handleCreateSupplier, handleUpdateSupplier, handleDeleteSupplier
} from './routes/business.js';

// AI Routes
import { handleAiChat, handleAiInsight } from './routes/ai.js';

// Feedback Routes
import { handleCreateFeedback, handleGetFeedback } from './routes/feedback.js';

// Admin Routes
import {
  handleAdminStats, handleAdminUsers, handleAdminUserStats,
  handleAdminUserErrors, handleAdminUserActivity, handleAdminClearErrors,
  handleAdminUpdateUser, handleAdminDeleteUser, handleAdminCreateUser,
  handleAdminResetPassword, handleAdminFeedback, handleAdminUpdateFeedback, handleAdminDeleteFeedback
} from './routes/admin.js';


export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = getCorsHeaders(request);

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return handleOptions(corsHeaders);
    }

    // Health check
    if (path === '/health' || path === '/api/health') {
      return jsonResponse({ success: true, status: 'healthy', version: '2.0.0', timestamp: Date.now() }, 200, corsHeaders);
    }

    try {
      // ==========================================
      // PUBLIC ROUTES (no auth required)
      // ==========================================
      
      if (path === '/api/auth/send-code' && method === 'POST') {
        return handleSendCode(request, env, corsHeaders);
      }
      if (path === '/api/auth/verify-code' && method === 'POST') {
        return handleVerifyCode(request, env, corsHeaders);
      }
      if (path === '/api/auth/resend-code' && method === 'POST') {
        return handleResendCode(request, env, corsHeaders);
      }
      if (path === '/api/register' && method === 'POST') {
        return handleRegister(request, env, corsHeaders);
      }
      if (path === '/api/login' && method === 'POST') {
        return handleLogin(request, env, corsHeaders);
      }

      // ==========================================
      // PROTECTED ROUTES (auth required)
      // ==========================================
      
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return jsonResponse({ success: false, error: 'נדרשת התחברות' }, 401, corsHeaders);
      }
      
      const token = authHeader.replace('Bearer ', '');
      const userId = await getUserIdFromToken(token, env.JWT_SECRET);
      
      if (!userId) {
        return jsonResponse({ success: false, error: 'Token לא תקין' }, 401, corsHeaders);
      }

      const userExists = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
      if (!userExists) {
        return jsonResponse({ success: false, error: 'המשתמש לא קיים במערכת' }, 401, corsHeaders);
      }

      // ==========================================
      // PROFILE & SETTINGS
      // ==========================================
      
      if (path === '/api/profile' && method === 'PUT') {
        return handleUpdateProfile(request, env, userId, corsHeaders);
      }
      if (path === '/api/change-password' && method === 'POST') {
        return handleChangePassword(request, env, userId, corsHeaders);
      }
      if (path === '/api/delete-account' && method === 'DELETE') {
        return handleDeleteAccount(env, userId, corsHeaders);
      }
      if (path === '/api/update-pwa-status' && method === 'POST') {
        return handleUpdatePwaStatus(request, env, userId, corsHeaders);
      }
      if (path === '/api/update-app-info' && method === 'POST') {
        return handleUpdateAppInfo(request, env, userId, corsHeaders);
      }
      if (path === '/api/report-error' && method === 'POST') {
        return handleReportError(request, env, userId, corsHeaders);
      }
      if (path === '/api/settings' && method === 'GET') {
        return handleGetSettings(env, userId, corsHeaders);
      }
      if (path === '/api/settings' && method === 'PUT') {
        return handleUpdateSettings(request, env, userId, corsHeaders);
      }

      // ==========================================
      // DASHBOARD & STATS
      // ==========================================
      
      if (path === '/api/dashboard' && method === 'GET') {
        return handleDashboard(env, userId, corsHeaders);
      }
      if (path === '/api/monthly-stats' && method === 'GET') {
        return handleMonthlyStats(request, env, userId, corsHeaders);
      }

      // ==========================================
      // EXPENSES
      // ==========================================
      
      if (path === '/api/expenses' && method === 'GET') {
        return handleGetExpenses(request, env, userId, corsHeaders);
      }
      if (path === '/api/expenses' && method === 'POST') {
        return handleCreateExpense(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/expenses\/[^\/]+\/recurring$/) && method === 'PATCH') {
        const expenseId = path.split('/')[3];
        return handleExpenseRecurring(request, env, userId, expenseId, corsHeaders);
      }
      if (path.match(/^\/api\/expenses\/[^\/]+$/) && method === 'GET') {
        const expenseId = path.split('/').pop();
        return handleGetExpense(env, userId, expenseId, corsHeaders);
      }
      if (path.match(/^\/api\/expenses\/[^\/]+$/) && method === 'PUT') {
        const expenseId = path.split('/').pop();
        return handleUpdateExpense(request, env, userId, expenseId, corsHeaders);
      }
      if (path.match(/^\/api\/expenses\/[^\/]+$/) && method === 'DELETE') {
        const expenseId = path.split('/').pop();
        return handleDeleteExpense(env, userId, expenseId, corsHeaders);
      }

      // ==========================================
      // INCOMES
      // ==========================================
      
      if (path === '/api/incomes' && method === 'GET') {
        return handleGetIncomes(request, env, userId, corsHeaders);
      }
      if (path === '/api/incomes' && method === 'POST') {
        return handleCreateIncome(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/incomes\/[^\/]+\/recurring$/) && method === 'PATCH') {
        const incomeId = path.split('/')[3];
        return handleIncomeRecurring(request, env, userId, incomeId, corsHeaders);
      }
      if (path.match(/^\/api\/incomes\/[^\/]+$/) && method === 'GET') {
        const incomeId = path.split('/').pop();
        return handleGetIncome(env, userId, incomeId, corsHeaders);
      }
      if (path.match(/^\/api\/incomes\/[^\/]+$/) && method === 'PUT') {
        const incomeId = path.split('/').pop();
        return handleUpdateIncome(request, env, userId, incomeId, corsHeaders);
      }
      if (path.match(/^\/api\/incomes\/[^\/]+$/) && method === 'DELETE') {
        const incomeId = path.split('/').pop();
        return handleDeleteIncome(env, userId, incomeId, corsHeaders);
      }

      // ==========================================
      // BUDGETS
      // ==========================================
      
      if (path === '/api/budgets' && method === 'GET') {
        return handleGetBudgets(env, userId, corsHeaders);
      }
      if (path === '/api/budgets' && method === 'POST') {
        return handleCreateBudget(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/budgets\/[^\/]+$/) && method === 'PUT') {
        const budgetId = path.split('/').pop();
        return handleUpdateBudget(request, env, userId, budgetId, corsHeaders);
      }
      if (path.match(/^\/api\/budgets\/[^\/]+$/) && method === 'DELETE') {
        const budgetId = path.split('/').pop();
        return handleDeleteBudget(env, userId, budgetId, corsHeaders);
      }

      // ==========================================
      // CATEGORIES
      // ==========================================
      
      if (path === '/api/categories' && method === 'GET') {
        return handleGetCategories(env, userId, corsHeaders);
      }
      if (path === '/api/categories' && method === 'POST') {
        return handleCreateCategory(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/categories\/[^\/]+$/) && method === 'PUT') {
        const categoryId = path.split('/').pop();
        return handleUpdateCategory(request, env, userId, categoryId, corsHeaders);
      }
      if (path.match(/^\/api\/categories\/[^\/]+$/) && method === 'DELETE') {
        const categoryId = path.split('/').pop();
        return handleDeleteCategory(env, userId, categoryId, corsHeaders);
      }

      // ==========================================
      // CARDS
      // ==========================================
      
      if (path === '/api/cards' && method === 'GET') {
        return handleGetCards(env, userId, corsHeaders);
      }
      if (path === '/api/cards' && method === 'POST') {
        return handleCreateCard(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/cards\/[^\/]+$/) && method === 'PUT') {
        const cardId = path.split('/').pop();
        return handleUpdateCard(request, env, userId, cardId, corsHeaders);
      }
      if (path.match(/^\/api\/cards\/[^\/]+$/) && method === 'DELETE') {
        const cardId = path.split('/').pop();
        return handleDeleteCard(env, userId, cardId, corsHeaders);
      }

      // ==========================================
      // LOANS
      // ==========================================
      
      if (path === '/api/loans' && method === 'GET') {
        return handleGetLoans(env, userId, corsHeaders);
      }
      if (path === '/api/loans' && method === 'POST') {
        return handleCreateLoan(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/loans\/[^\/]+$/) && method === 'PUT') {
        const loanId = path.split('/').pop();
        return handleUpdateLoan(request, env, userId, loanId, corsHeaders);
      }
      if (path.match(/^\/api\/loans\/[^\/]+$/) && method === 'DELETE') {
        const loanId = path.split('/').pop();
        return handleDeleteLoan(env, userId, loanId, corsHeaders);
      }

      // ==========================================
      // INSTALLMENTS
      // ==========================================
      
      if (path === '/api/installments' && method === 'GET') {
        return handleGetInstallments(env, userId, corsHeaders);
      }
      if (path === '/api/installments' && method === 'POST') {
        return handleCreateInstallment(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/installments\/[^\/]+$/) && method === 'PUT') {
        const instId = path.split('/').pop();
        return handleUpdateInstallment(request, env, userId, instId, corsHeaders);
      }
      if (path.match(/^\/api\/installments\/[^\/]+$/) && method === 'DELETE') {
        const instId = path.split('/').pop();
        return handleDeleteInstallment(env, userId, instId, corsHeaders);
      }

      // ==========================================
      // SUBSCRIPTIONS
      // ==========================================
      
      if (path === '/api/subscriptions' && method === 'GET') {
        return handleGetSubscriptions(env, userId, corsHeaders);
      }
      if (path === '/api/subscriptions' && method === 'POST') {
        return handleCreateSubscription(request, env, userId, corsHeaders);
      }
      if (path === '/api/subscriptions/summary' && method === 'GET') {
        return handleSubscriptionsSummary(env, userId, corsHeaders);
      }
      if (path === '/api/subscriptions/test-notification' && method === 'POST') {
        return handleTestNotification(env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+\/cancel$/) && method === 'POST') {
        const subId = path.split('/')[3];
        return handleCancelSubscription(env, userId, subId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+\/reactivate$/) && method === 'POST') {
        const subId = path.split('/')[3];
        return handleReactivateSubscription(env, userId, subId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+$/) && method === 'GET') {
        const subId = path.split('/').pop();
        return handleGetSubscription(env, userId, subId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+$/) && method === 'PUT') {
        const subId = path.split('/').pop();
        return handleUpdateSubscription(request, env, userId, subId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+$/) && method === 'DELETE') {
        const subId = path.split('/').pop();
        return handleDeleteSubscription(env, userId, subId, corsHeaders);
      }

      // ==========================================
      // GOALS
      // ==========================================
      
      if (path === '/api/goals' && method === 'GET') {
        return handleGetGoals(env, userId, corsHeaders);
      }
      if (path === '/api/goals' && method === 'POST') {
        return handleCreateGoal(request, env, userId, corsHeaders);
      }
      if (path === '/api/goals/stats' && method === 'GET') {
        return handleGoalsStats(env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/contributions\/[^\/]+$/) && method === 'DELETE') {
        const contributionId = path.split('/').pop();
        return handleDeleteContribution(env, userId, contributionId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/[^\/]+\/contribute$/) && method === 'POST') {
        const goalId = path.split('/')[3];
        return handleAddContribution(request, env, userId, goalId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/[^\/]+$/) && method === 'GET') {
        const goalId = path.split('/').pop();
        return handleGetGoal(env, userId, goalId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/[^\/]+$/) && method === 'PUT') {
        const goalId = path.split('/').pop();
        return handleUpdateGoal(request, env, userId, goalId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/[^\/]+$/) && method === 'DELETE') {
        const goalId = path.split('/').pop();
        return handleDeleteGoal(env, userId, goalId, corsHeaders);
      }

      // ==========================================
      // BUSINESS MODE
      // ==========================================
      
      // Business Expenses
      if (path === '/api/biz/expenses' && method === 'GET') {
        return handleGetBizExpenses(request, env, userId, corsHeaders);
      }
      if (path === '/api/biz/expenses' && method === 'POST') {
        return handleCreateBizExpense(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/expenses\/[^\/]+$/) && method === 'GET') {
        const expId = path.split('/').pop();
        return handleGetBizExpense(env, userId, expId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/expenses\/[^\/]+$/) && method === 'PUT') {
        const expId = path.split('/').pop();
        return handleUpdateBizExpense(request, env, userId, expId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/expenses\/[^\/]+$/) && method === 'DELETE') {
        const expId = path.split('/').pop();
        return handleDeleteBizExpense(env, userId, expId, corsHeaders);
      }

      // Business Incomes
      if (path === '/api/biz/incomes' && method === 'GET') {
        return handleGetBizIncomes(request, env, userId, corsHeaders);
      }
      if (path === '/api/biz/incomes' && method === 'POST') {
        return handleCreateBizIncome(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/incomes\/[^\/]+$/) && method === 'GET') {
        const incId = path.split('/').pop();
        return handleGetBizIncome(env, userId, incId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/incomes\/[^\/]+$/) && method === 'PUT') {
        const incId = path.split('/').pop();
        return handleUpdateBizIncome(request, env, userId, incId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/incomes\/[^\/]+$/) && method === 'DELETE') {
        const incId = path.split('/').pop();
        return handleDeleteBizIncome(env, userId, incId, corsHeaders);
      }

      // Business Dashboard & VAT
      if (path === '/api/biz/dashboard' && method === 'GET') {
        return handleBizDashboard(request, env, userId, corsHeaders);
      }
      if (path === '/api/biz/vat-report' && method === 'GET') {
        return handleVatReport(request, env, userId, corsHeaders);
      }

      // Clients
      if (path === '/api/biz/clients' && method === 'GET') {
        return handleGetClients(env, userId, corsHeaders);
      }
      if (path === '/api/biz/clients' && method === 'POST') {
        return handleCreateClient(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/clients\/[^\/]+$/) && method === 'GET') {
        const clientId = path.split('/').pop();
        return handleGetClient(env, userId, clientId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/clients\/[^\/]+$/) && method === 'PUT') {
        const clientId = path.split('/').pop();
        return handleUpdateClient(request, env, userId, clientId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/clients\/[^\/]+$/) && method === 'DELETE') {
        const clientId = path.split('/').pop();
        return handleDeleteClient(env, userId, clientId, corsHeaders);
      }

      // Suppliers
      if (path === '/api/biz/suppliers' && method === 'GET') {
        return handleGetSuppliers(env, userId, corsHeaders);
      }
      if (path === '/api/biz/suppliers' && method === 'POST') {
        return handleCreateSupplier(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/suppliers\/[^\/]+$/) && method === 'GET') {
        const supplierId = path.split('/').pop();
        return handleGetSupplier(env, userId, supplierId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/suppliers\/[^\/]+$/) && method === 'PUT') {
        const supplierId = path.split('/').pop();
        return handleUpdateSupplier(request, env, userId, supplierId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/suppliers\/[^\/]+$/) && method === 'DELETE') {
        const supplierId = path.split('/').pop();
        return handleDeleteSupplier(env, userId, supplierId, corsHeaders);
      }

      // ==========================================
      // AI
      // ==========================================
      
      if (path === '/api/ai-chat' && method === 'POST') {
        return handleAiChat(request, env, userId, corsHeaders);
      }
      if (path === '/api/ai/insight' && method === 'POST') {
        return handleAiInsight(request, env, corsHeaders);
      }

      // ==========================================
      // FEEDBACK
      // ==========================================
      
      if (path === '/api/feedback' && method === 'POST') {
        return handleCreateFeedback(request, env, userId, corsHeaders);
      }
      if (path === '/api/feedback' && method === 'GET') {
        return handleGetFeedback(env, userId, corsHeaders);
      }

      // ==========================================
      // ADMIN
      // ==========================================
      
      if (path === '/api/admin/stats' && method === 'GET') {
        return handleAdminStats(env, userId, corsHeaders);
      }
      if (path === '/api/admin/users' && method === 'GET') {
        return handleAdminUsers(env, userId, corsHeaders);
      }
      if (path === '/api/admin/users' && method === 'POST') {
        return handleAdminCreateUser(request, env, userId, corsHeaders);
      }
      if (path === '/api/admin/reset-password' && method === 'POST') {
        return handleAdminResetPassword(request, env, userId, corsHeaders);
      }
      if (path === '/api/admin/feedback' && method === 'GET') {
        return handleAdminFeedback(env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+\/stats$/) && method === 'GET') {
        const targetUserId = path.split('/')[4];
        return handleAdminUserStats(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+\/errors$/) && method === 'GET') {
        const targetUserId = path.split('/')[4];
        return handleAdminUserErrors(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+\/activity$/) && method === 'GET') {
        const targetUserId = path.split('/')[4];
        return handleAdminUserActivity(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+\/clear-errors$/) && method === 'POST') {
        const targetUserId = path.split('/')[4];
        return handleAdminClearErrors(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+$/) && method === 'PUT') {
        const targetUserId = path.split('/').pop();
        return handleAdminUpdateUser(request, env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+$/) && method === 'DELETE') {
        const targetUserId = path.split('/').pop();
        return handleAdminDeleteUser(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/feedback\/[^\/]+$/) && method === 'PUT') {
        const feedbackId = path.split('/').pop();
        return handleAdminUpdateFeedback(request, env, userId, feedbackId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/feedback\/[^\/]+$/) && method === 'DELETE') {
        const feedbackId = path.split('/').pop();
        return handleAdminDeleteFeedback(env, userId, feedbackId, corsHeaders);
      }

      // ==========================================
      // 404 - Not Found
      // ==========================================
      
      return jsonResponse({ success: false, error: 'Endpoint not found' }, 404, corsHeaders);

    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ success: false, error: 'שגיאה בשרת', details: error.message }, 500, corsHeaders);
    }
  }
};
