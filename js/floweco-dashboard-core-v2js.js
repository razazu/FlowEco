// ========================================
// FlowEco Dashboard v2 - Core Logic (Fixed)
// ========================================

(function() {
    'use strict';

    const API_URL = 'https://floweco-api.razazulai.workers.dev';

    // ========== HELPERS ==========
    function getToken() {
        return localStorage.getItem('floweco_token');
    }

    function formatCurrency(amount) {
        const n = Number(amount) || 0;
        return '₪' + Math.round(n).toLocaleString('he-IL');
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
    }

    function getHebrewDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return now.toLocaleDateString('he-IL', options);
    }

    function setToday(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = new Date().toISOString().split('T')[0];
        }
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('dashToast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `dash-toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            }
        };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(API_URL + endpoint, options);
        return response.json();
    }

    // ========== CATEGORY COLORS ==========
    const CATEGORY_COLORS = {
        'מזון ומכולת': '#22C55E',
        'תחבורה': '#3B82F6',
        'בילויים': '#F43F5E',
        'קניות': '#A855F7',
        'דיור': '#EF4444',
        'חשמל': '#F59E0B',
        'מים': '#06B6D4',
        'גז': '#DC2626',
        'ארנונה': '#8B5CF6',
        'ביטוחים': '#10B981',
        'מנויים': '#EC4899',
        'בריאות': '#14B8A6',
        'חינוך': '#0EA5E9',
        'תחביבים': '#F97316',
        'ספורט': '#84CC16',
        'טיפוח': '#D946EF',
        'חיות מחמד': '#FB923C',
        'מתנות': '#E879F9',
        'אחר': '#6B7280'
    };

    function getCategoryColor(category) {
        const clean = (category || '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        for (const key in CATEGORY_COLORS) {
            if (clean.includes(key)) return CATEGORY_COLORS[key];
        }
        return '#6B7280';
    }

    function getCategoryIcon(category) {
        const icons = {
            'מזון': '🛒', 'תחבורה': '🚗', 'בילויים': '🎉', 'קניות': '🛍️',
            'דיור': '🏠', 'חשמל': '⚡', 'מים': '💧', 'גז': '🔥',
            'ארנונה': '🏛️', 'ביטוחים': '🛡️', 'מנויים': '📺', 'בריאות': '💊',
            'חינוך': '📚', 'תחביבים': '🎨', 'ספורט': '⚽', 'טיפוח': '💄',
            'חיות': '🐾', 'מתנות': '🎁', 'אחר': '📌'
        };
        for (const key in icons) {
            if ((category || '').includes(key)) return icons[key];
        }
        return '📦';
    }

    // ========== INIT ==========
    async function init() {
        // Guard - only run on dashboard page
        if (!document.querySelector('.dash-container')) {
            return;
        }

        console.log('📊 FlowEco Dashboard v2 Loading...');

        // Set user name
        const user = JSON.parse(localStorage.getItem('floweco_user') || '{}');
        const nameEl = document.getElementById('dashUserName');
        if (nameEl) nameEl.textContent = user.name || 'משתמש';

        // Set date
        const dateEl = document.getElementById('dashDate');
        if (dateEl) dateEl.textContent = getHebrewDate();

        // Set default dates
        setToday('expDate');
        setToday('incDate');

        // Load all data
        await loadSummary();
        await loadRecentExpenses();
        await loadInsights();
        await initCharts();

        console.log('✅ FlowEco Dashboard v2 Ready!');
    }

    // ========== SUMMARY ==========
    async function loadSummary() {
        try {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const [expRes, incRes] = await Promise.all([
                apiRequest('/api/expenses'),
                apiRequest('/api/incomes')
            ]);

            const monthExpenses = (expRes.data || []).filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            const monthIncomes = (incRes.data || []).filter(i => {
                const d = new Date(i.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            const totalExpenses = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            const totalIncomes = monthIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
            const balance = totalIncomes - totalExpenses;
            const savingsPercent = totalIncomes > 0 ? Math.round((balance / totalIncomes) * 100) : 0;

            // Update DOM with null checks
            const totalIncomeEl = document.getElementById('dashTotalIncome');
            const totalExpensesEl = document.getElementById('dashTotalExpenses');
            const balanceEl = document.getElementById('dashBalance');
            const savingsEl = document.getElementById('dashSavingsPercent');

            if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(totalIncomes);
            if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(totalExpenses);
            if (balanceEl) {
                balanceEl.textContent = formatCurrency(balance);
                balanceEl.style.color = balance < 0 ? '#EF4444' : balance > 0 ? '#10B981' : '';
            }
            if (savingsEl) savingsEl.textContent = savingsPercent + '%';

        } catch (err) {
            console.error('Summary error:', err);
        }
    }

    // ========== RECENT EXPENSES ==========
    async function loadRecentExpenses() {
        const list = document.getElementById('recentExpensesList');
        if (!list) return;

        try {
            const res = await apiRequest('/api/expenses');
            const expenses = (res.data || []).slice(0, 5);

            if (expenses.length === 0) {
                list.innerHTML = `
                    <div class="dash-recent-empty">
                        <p>אין הוצאות להצגה</p>
                        <button class="dash-empty-btn" onclick="FlowEcoDash.openExpenseModal()">הוסף הוצאה</button>
                    </div>
                `;
                return;
            }

            list.innerHTML = expenses.map(exp => {
                const icon = getCategoryIcon(exp.category);
                return `
                    <div class="dash-recent-item">
                        <div class="dash-recent-icon">${icon}</div>
                        <div class="dash-recent-info">
                            <div class="dash-recent-title">${exp.description || exp.category}</div>
                            <div class="dash-recent-meta">📅 ${formatDate(exp.date)} • ${exp.category}</div>
                        </div>
                        <div class="dash-recent-amount">-${formatCurrency(exp.amount)}</div>
                    </div>
                `;
            }).join('');

        } catch (err) {
            console.error('Recent expenses error:', err);
            list.innerHTML = '<div class="dash-recent-empty">שגיאה בטעינת נתונים</div>';
        }
    }

    // ========== AI INSIGHTS ==========
    async function loadInsights() {
        const loading = document.getElementById('aiLoading');
        const error = document.getElementById('aiError');
        const grid = document.getElementById('aiInsightsGrid');
        const actions = document.getElementById('aiActions');

        if (!loading || !error || !grid || !actions) return;

        loading.style.display = 'block';
        error.style.display = 'none';
        grid.style.display = 'none';
        actions.style.display = 'none';

        try {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const [expRes, incRes, budRes] = await Promise.all([
                apiRequest('/api/expenses'),
                apiRequest('/api/incomes'),
                apiRequest('/api/budgets')
            ]);

            const monthExpenses = (expRes.data || []).filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            const monthIncomes = (incRes.data || []).filter(i => {
                const d = new Date(i.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            const totalExpenses = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
            const totalIncomes = monthIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
            const balance = totalIncomes - totalExpenses;

            // Category totals
            const categoryTotals = {};
            monthExpenses.forEach(exp => {
                const cat = (exp.category || '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
                categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount || 0);
            });

            const sortedCategories = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a);
            const topCategory = sortedCategories[0] || ['אחר', 0];

            // Generate cards
            const cards = [];

            // Balance card
            if (balance < 0) {
                cards.push(`
                    <div class="dash-insight-card critical">
                        <div class="dash-insight-header">
                            <span class="dash-insight-tag critical">⚠️ קריטי</span>
                            <span class="dash-insight-time">החודש</span>
                        </div>
                        <h4 class="dash-insight-title">גירעון בחשבון</h4>
                        <p class="dash-insight-value">${formatCurrency(Math.abs(balance))} <span>גירעון</span></p>
                        <p class="dash-insight-detail">💡 צמצם הוצאות או הגדל הכנסות</p>
                    </div>
                `);
            } else if (balance > 0) {
                const savingsPercent = totalIncomes > 0 ? Math.round((balance / totalIncomes) * 100) : 0;
                cards.push(`
                    <div class="dash-insight-card success">
                        <div class="dash-insight-header">
                            <span class="dash-insight-tag success">✓ מצוין</span>
                            <span class="dash-insight-time">החודש</span>
                        </div>
                        <h4 class="dash-insight-title">עודף בחשבון</h4>
                        <p class="dash-insight-value">${formatCurrency(balance)} <span>${savingsPercent}% חיסכון</span></p>
                        <p class="dash-insight-detail">💡 שקול להעביר לחיסכון</p>
                    </div>
                `);
            }

            // Top category
            if (topCategory[0] && topCategory[0] !== 'אחר' && totalExpenses > 0) {
                const percent = Math.round((topCategory[1] / totalExpenses) * 100);
                const isHigh = percent > 50;
                cards.push(`
                    <div class="dash-insight-card ${isHigh ? 'warning' : 'info'}">
                        <div class="dash-insight-header">
                            <span class="dash-insight-tag ${isHigh ? 'warning' : 'info'}">${isHigh ? '⚠️ גבוה' : 'ℹ️ תובנה'}</span>
                            <span class="dash-insight-time">החודש</span>
                        </div>
                        <h4 class="dash-insight-title">הוצאה מובילה: ${topCategory[0]}</h4>
                        <p class="dash-insight-value">${percent}% <span>מכלל ההוצאות</span></p>
                        <div class="dash-insight-bar">
                            <div class="dash-insight-bar-fill ${isHigh ? 'warning' : 'success'}" style="width: ${percent}%"></div>
                        </div>
                        <p class="dash-insight-detail">${formatCurrency(topCategory[1])} מתוך ${formatCurrency(totalExpenses)}</p>
                    </div>
                `);
            }

            // Budget cards
            const budgets = budRes.data || [];
            budgets.slice(0, 2).forEach(budget => {
                const catExpenses = categoryTotals[budget.category] || 0;
                const percent = budget.amount ? Math.round((catExpenses / budget.amount) * 100) : 0;
                const remaining = budget.amount - catExpenses;
                
                let type = 'success';
                if (percent >= 90) type = 'critical';
                else if (percent >= 75) type = 'warning';

                cards.push(`
                    <div class="dash-insight-card ${type}">
                        <div class="dash-insight-header">
                            <span class="dash-insight-tag ${type}">${type === 'critical' ? '⚠️ קריטי' : type === 'warning' ? '⚠️ אזהרה' : '✓ טוב'}</span>
                            <span class="dash-insight-time">תקציב</span>
                        </div>
                        <h4 class="dash-insight-title">תקציב ${budget.category}</h4>
                        <p class="dash-insight-value">${percent}% <span>מהתקציב</span></p>
                        <div class="dash-insight-bar">
                            <div class="dash-insight-bar-fill ${type}" style="width: ${Math.min(percent, 100)}%"></div>
                        </div>
                        <p class="dash-insight-detail">${formatCurrency(remaining)} נותרו</p>
                    </div>
                `);
            });

            // Empty state
            if (cards.length === 0) {
                cards.push(`
                    <div class="dash-insight-card info">
                        <div class="dash-insight-header">
                            <span class="dash-insight-tag info">ℹ️ מידע</span>
                        </div>
                        <h4 class="dash-insight-title">התחל את המסע הפיננסי</h4>
                        <p class="dash-insight-detail">הוסף הוצאות והכנסות לקבלת תובנות מותאמות אישית</p>
                    </div>
                `);
            }

            grid.innerHTML = cards.join('');

            loading.style.display = 'none';
            grid.style.display = 'grid';
            actions.style.display = 'grid';

        } catch (err) {
            console.error('Insights error:', err);
            loading.style.display = 'none';
            error.style.display = 'block';
            const errorMsg = document.getElementById('aiErrorMessage');
            if (errorMsg) errorMsg.textContent = err.message || 'שגיאה בטעינת נתונים';
        }
    }

    // ========== CHARTS ==========
    async function initCharts() {
        await initPieChart();
        await initBarChart();
    }

    async function initPieChart() {
        const ctx = document.getElementById('dashPieChart');
        const empty = document.getElementById('pieChartEmpty');
        if (!ctx || typeof Chart === 'undefined') return;

        try {
            const res = await apiRequest('/api/dashboard');
            const categories = res.data?.categories || [];

            if (categories.length === 0) {
                ctx.style.display = 'none';
                if (empty) empty.style.display = 'flex';
                return;
            }

            const labels = categories.map(c => c.category);
            const data = categories.map(c => parseFloat(c.total));
            const colors = categories.map(c => getCategoryColor(c.category));

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: colors,
                        borderWidth: 2,
                        borderColor: 'rgba(0, 0, 0, 0.3)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            rtl: true,
                            labels: {
                                color: '#E5E7EB',
                                font: { size: 11 },
                                padding: 10,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            rtl: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${context.label}: ${formatCurrency(value)} (${percent}%)`;
                                }
                            }
                        }
                    }
                }
            });

            ctx.style.display = 'block';
            if (empty) empty.style.display = 'none';

        } catch (err) {
            console.error('Pie chart error:', err);
            if (ctx) ctx.style.display = 'none';
            if (empty) empty.style.display = 'flex';
        }
    }

    async function initBarChart() {
        const ctx = document.getElementById('dashBarChart');
        const empty = document.getElementById('barChartEmpty');
        const title = document.getElementById('barChartTitle');
        if (!ctx || typeof Chart === 'undefined') return;

        try {
            const isMobile = window.innerWidth <= 768;
            const months = isMobile ? 3 : 6;

            if (title) title.textContent = `📈 מעקב ${months} חודשים`;

            const res = await apiRequest(`/api/monthly-stats?months=${months}`);
            const data = res.data || [];

            const hasData = data.some(m => m.incomes > 0 || m.expenses > 0);
            if (!hasData) {
                ctx.style.display = 'none';
                if (empty) empty.style.display = 'flex';
                return;
            }

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(m => m.monthName),
                    datasets: [
                        {
                            label: 'הכנסות',
                            data: data.map(m => m.incomes),
                            backgroundColor: '#10B981',
                            borderRadius: 6
                        },
                        {
                            label: 'הוצאות',
                            data: data.map(m => m.expenses),
                            backgroundColor: '#EF4444',
                            borderRadius: 6
                        },
                        {
                            label: 'חיסכון',
                            data: data.map(m => m.balance),
                            backgroundColor: '#3B82F6',
                            borderRadius: 6
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            rtl: true,
                            labels: {
                                color: '#E5E7EB',
                                font: { size: isMobile ? 10 : 12 },
                                padding: 10,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            rtl: true,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#9CA3AF',
                                font: { size: isMobile ? 9 : 11 },
                                callback: v => isMobile && v >= 1000 ? '₪' + (v/1000).toFixed(0) + 'K' : formatCurrency(v)
                            },
                            grid: { color: 'rgba(255,255,255,0.05)' }
                        },
                        x: {
                            ticks: {
                                color: '#9CA3AF',
                                font: { size: isMobile ? 9 : 11 }
                            },
                            grid: { display: false }
                        }
                    },
                    barPercentage: isMobile ? 0.7 : 0.8
                }
            });

            ctx.style.display = 'block';
            if (empty) empty.style.display = 'none';

        } catch (err) {
            console.error('Bar chart error:', err);
            if (ctx) ctx.style.display = 'none';
            if (empty) empty.style.display = 'flex';
        }
    }

    // ========== MODALS ==========
    function openExpenseModal() {
        const modal = document.getElementById('expenseModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setToday('expDate');
            setTimeout(() => document.getElementById('expAmount')?.focus(), 100);
        }
    }

    function closeExpenseModal() {
        const modal = document.getElementById('expenseModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            document.getElementById('expenseForm')?.reset();
            setToday('expDate');
        }
    }

    function openIncomeModal() {
        const modal = document.getElementById('incomeModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setToday('incDate');
            setTimeout(() => document.getElementById('incAmount')?.focus(), 100);
        }
    }

    function closeIncomeModal() {
        const modal = document.getElementById('incomeModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            document.getElementById('incomeForm')?.reset();
            setToday('incDate');
        }
    }

    // ========== FORM SUBMIT ==========
    async function submitExpense(e) {
        e.preventDefault();

        const amountEl = document.getElementById('expAmount');
        const categoryEl = document.getElementById('expCategory');
        const descEl = document.getElementById('expDescription');
        const dateEl = document.getElementById('expDate');
        const recurringEl = document.getElementById('expRecurring');

        if (!amountEl || !categoryEl || !dateEl) return;

        const data = {
            amount: parseFloat(amountEl.value),
            category: categoryEl.value,
            description: descEl ? descEl.value : '',
            date: dateEl.value,
            isRecurring: recurringEl ? recurringEl.checked : false
        };

        try {
            const res = await apiRequest('/api/expenses', 'POST', data);
            if (res.success) {
                showToast('✅ הוצאה נשמרה בהצלחה!', 'success');
                closeExpenseModal();
                refresh();
            } else {
                showToast('❌ ' + (res.error || 'שגיאה בשמירה'), 'error');
            }
        } catch (err) {
            showToast('❌ שגיאה בחיבור לשרת', 'error');
        }
    }

    async function submitIncome(e) {
        e.preventDefault();

        const amountEl = document.getElementById('incAmount');
        const sourceEl = document.getElementById('incSource');
        const dateEl = document.getElementById('incDate');
        const recurringEl = document.getElementById('incRecurring');

        if (!amountEl || !sourceEl || !dateEl) return;

        const data = {
            amount: parseFloat(amountEl.value),
            source: sourceEl.value,
            date: dateEl.value,
            isRecurring: recurringEl ? recurringEl.checked : false
        };

        try {
            const res = await apiRequest('/api/incomes', 'POST', data);
            if (res.success) {
                showToast('✅ הכנסה נשמרה בהצלחה!', 'success');
                closeIncomeModal();
                refresh();
            } else {
                showToast('❌ ' + (res.error || 'שגיאה בשמירה'), 'error');
            }
        } catch (err) {
            showToast('❌ שגיאה בחיבור לשרת', 'error');
        }
    }

    // ========== REFRESH ==========
    async function refresh() {
        await loadSummary();
        await loadRecentExpenses();
        await loadInsights();
        showToast('🔄 הנתונים עודכנו', 'success');
    }

    // ========== GLOBAL API ==========
    window.FlowEcoDash = {
        openExpenseModal,
        closeExpenseModal,
        openIncomeModal,
        closeIncomeModal,
        submitExpense,
        submitIncome,
        refresh,
        loadInsights
    };

    // ========== EVENTS ==========
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeExpenseModal();
            closeIncomeModal();
        }
    });

    // Close modal on overlay click
    document.addEventListener('click', e => {
        if (e.target.classList.contains('dash-modal-overlay')) {
            closeExpenseModal();
            closeIncomeModal();
        }
    });

    // ========== INIT ==========
    document.addEventListener('DOMContentLoaded', init);

})();