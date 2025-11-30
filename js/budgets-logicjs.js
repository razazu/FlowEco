// ========================================
// FlowEco Budgets v2 - Core Logic
// ========================================

(function() {
    'use strict';

    // Guard - only run on budgets page
    if (!document.querySelector('.budgets-page-v2')) return;

    console.log('🎯 FlowEco Budgets v2 Loading...');

    // ========================================
    // CONFIG & STATE
    // ========================================

    var API_URL = 'https://floweco-api.razazulai.workers.dev';

    var state = {
        budgets: [],
        expenses: [],
        categories: [],
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear()
    };

    // Will be populated from API
    var categoryIcons = {};

    // ========================================
    // API HELPERS
    // ========================================

    function getToken() {
        return localStorage.getItem('floweco_token');
    }

    function apiRequest(endpoint, method, body) {
        method = method || 'GET';
        
        var options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }

        return fetch(API_URL + endpoint, options).then(function(res) {
            return res.json();
        });
    }

    // ========================================
    // DATA FETCHING
    // ========================================

    function fetchAllData() {
        Promise.all([
            apiRequest('/api/budgets'),
            apiRequest('/api/expenses'),
            apiRequest('/api/categories')
        ]).then(function(results) {
            var budgetsRes = results[0];
            var expensesRes = results[1];
            var categoriesRes = results[2];

            if (budgetsRes.success) {
                state.budgets = budgetsRes.data || [];
            }
            if (expensesRes.success) {
                state.expenses = expensesRes.data || [];
            }
            if (categoriesRes.success) {
                state.categories = categoriesRes.data || [];
                // Build categoryIcons map
                categoryIcons = {};
                for (var i = 0; i < state.categories.length; i++) {
                    var cat = state.categories[i];
                    categoryIcons[cat.name] = cat.icon;
                }
            }

            populateCategorySelects();
            updateSummary();
            renderBudgets();

        }).catch(function(error) {
            console.error('Error fetching data:', error);
            showToast('שגיאה בטעינת נתונים', 'error');
        });
    }

    // ========================================
    // POPULATE CATEGORY SELECTS
    // ========================================

    function populateCategorySelects() {
        var selectIds = ['addBdgCategory', 'editBdgCategory'];
        var expenseCategories = state.categories.filter(function(c) {
            return c.type === 'expense';
        });

        for (var i = 0; i < selectIds.length; i++) {
            var select = document.getElementById(selectIds[i]);
            if (!select) continue;

            var currentValue = select.value;
            select.innerHTML = '<option value="">בחר קטגוריה...</option>';

            for (var j = 0; j < expenseCategories.length; j++) {
                var cat = expenseCategories[j];
                var option = document.createElement('option');
                option.value = cat.name;
                option.textContent = cat.icon + ' ' + cat.name;
                select.appendChild(option);
            }

            if (currentValue) {
                select.value = currentValue;
            }
        }
    }

    // ========================================
    // GET MONTH EXPENSES
    // ========================================

    function getMonthExpenses() {
        return state.expenses.filter(function(exp) {
            var expDate = new Date(exp.date);
            return expDate.getMonth() === state.currentMonth && 
                   expDate.getFullYear() === state.currentYear;
        });
    }

    // ========================================
    // UPDATE SUMMARY
    // ========================================

    function updateSummary() {
        var monthExpenses = getMonthExpenses();

        var totalBudgets = 0;
        for (var i = 0; i < state.budgets.length; i++) {
            totalBudgets += parseFloat(state.budgets[i].amount) || 0;
        }

        var totalSpent = 0;
        for (var j = 0; j < monthExpenses.length; j++) {
            totalSpent += parseFloat(monthExpenses[j].amount) || 0;
        }

        var remaining = totalBudgets - totalSpent;

        // Update UI
        var totalEl = document.getElementById('bdgTotalBudgets');
        var spentEl = document.getElementById('bdgTotalSpent');
        var remainingEl = document.getElementById('bdgRemaining');
        var activeEl = document.getElementById('bdgActiveCount');

        if (totalEl) totalEl.textContent = '₪' + Math.round(totalBudgets).toLocaleString('he-IL');
        if (spentEl) spentEl.textContent = '₪' + Math.round(totalSpent).toLocaleString('he-IL');
        if (activeEl) activeEl.textContent = state.budgets.length;

        if (remainingEl) {
            remainingEl.textContent = '₪' + Math.round(remaining).toLocaleString('he-IL');
            if (remaining < 0) {
                remainingEl.style.color = '#EF4444';
            } else if (remaining < totalBudgets * 0.2) {
                remainingEl.style.color = '#F59E0B';
            } else {
                remainingEl.style.color = '#10B981';
            }
        }
    }

    // ========================================
    // RENDER BUDGETS
    // ========================================

    function renderBudgets() {
        var list = document.getElementById('bdgList');
        var countEl = document.getElementById('bdgCount');

        if (countEl) {
            countEl.textContent = state.budgets.length + ' תקציבים';
        }

        if (state.budgets.length === 0) {
            list.innerHTML = '<div class="bdg-empty">' +
                '<div class="bdg-empty-icon">🎯</div>' +
                '<div class="bdg-empty-text">אין תקציבים מוגדרים</div>' +
                '<div class="bdg-empty-hint">לחץ על "תקציב חדש" כדי להתחיל</div>' +
            '</div>';
            return;
        }

        var monthExpenses = getMonthExpenses();
        var html = '';

        for (var i = 0; i < state.budgets.length; i++) {
            var budget = state.budgets[i];
            var budgetAmount = parseFloat(budget.amount) || 0;

            // Calculate spent for this category
            var spent = 0;
            for (var j = 0; j < monthExpenses.length; j++) {
                if (monthExpenses[j].category === budget.category) {
                    spent += parseFloat(monthExpenses[j].amount) || 0;
                }
            }

            var remaining = budgetAmount - spent;
            var percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

            // Determine status
            var progressClass = '';
            var percentageClass = 'success';
            if (percentage >= 100) {
                progressClass = 'danger';
                percentageClass = 'danger';
            } else if (percentage >= 80) {
                progressClass = 'warning';
                percentageClass = 'warning';
            }

            var icon = categoryIcons[budget.category] || '📦';

            html += '<div class="bdg-item cat-' + budget.category + '" onclick="FlowEcoBdg.editBudget(\'' + budget.id + '\')">' +
                '<div class="bdg-item-main">' +
                    '<div class="bdg-item-icon">' + icon + '</div>' +
                    '<div class="bdg-item-info">' +
                        '<div class="bdg-item-title">' + budget.category + '</div>' +
                        '<div class="bdg-item-subtitle">' + budget.period + '</div>' +
                    '</div>' +
                    '<div class="bdg-item-amount">' +
                        '<div class="bdg-item-budget">₪' + Math.round(budgetAmount).toLocaleString('he-IL') + '</div>' +
                        '<div class="bdg-item-spent">הוצאו: ₪' + Math.round(spent).toLocaleString('he-IL') + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="bdg-item-progress">' +
                    '<div class="bdg-progress-bar">' +
                        '<div class="bdg-progress-fill ' + progressClass + '" style="width: ' + Math.min(percentage, 100) + '%"></div>' +
                    '</div>' +
                    '<div class="bdg-item-stats">' +
                        '<span class="bdg-item-percentage ' + percentageClass + '">' + Math.round(percentage) + '% מהתקציב</span>' +
                        '<span class="bdg-item-remaining">נותרו: ₪' + Math.round(remaining).toLocaleString('he-IL') + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }

        list.innerHTML = html;
    }

    // ========================================
    // MODALS
    // ========================================

    function openModal(id) {
        var modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(id) {
        var modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // ========================================
    // ADD BUDGET
    // ========================================

    function openAddBudget() {
        var form = document.getElementById('formAddBudget');
        if (form) form.reset();
        openModal('modalAddBudget');
    }

    function saveBudget(e) {
        e.preventDefault();

        var category = document.getElementById('addBdgCategory').value;
        var amount = parseFloat(document.getElementById('addBdgAmount').value);
        var period = document.getElementById('addBdgPeriod').value;

        apiRequest('/api/budgets', 'POST', {
            category: category,
            amount: amount,
            period: period
        }).then(function(res) {
            if (res.success) {
                showToast('תקציב נוסף בהצלחה! ✅');
                closeModal('modalAddBudget');
                fetchAllData();
            } else {
                showToast(res.error || 'שגיאה', 'error');
            }
        }).catch(function(error) {
            showToast('שגיאה בשמירה', 'error');
        });
    }

    // ========================================
    // EDIT BUDGET
    // ========================================

    function editBudget(id) {
        var budget = null;
        for (var i = 0; i < state.budgets.length; i++) {
            if (state.budgets[i].id === id) {
                budget = state.budgets[i];
                break;
            }
        }
        if (!budget) return;

        document.getElementById('editBdgId').value = id;
        document.getElementById('editBdgCategory').value = budget.category;
        document.getElementById('editBdgAmount').value = budget.amount;
        document.getElementById('editBdgPeriod').value = budget.period;

        openModal('modalEditBudget');
    }

    function updateBudget(e) {
        e.preventDefault();

        var id = document.getElementById('editBdgId').value;
        var category = document.getElementById('editBdgCategory').value;
        var amount = parseFloat(document.getElementById('editBdgAmount').value);
        var period = document.getElementById('editBdgPeriod').value;

        apiRequest('/api/budgets/' + id, 'PUT', {
            category: category,
            amount: amount,
            period: period
        }).then(function(res) {
            if (res.success) {
                showToast('תקציב עודכן! ✅');
                closeModal('modalEditBudget');
                fetchAllData();
            } else {
                showToast(res.error || 'שגיאה', 'error');
            }
        }).catch(function(error) {
            showToast('שגיאה בעדכון', 'error');
        });
    }

    function deleteBudget() {
        if (!confirm('למחוק את התקציב?')) return;

        var id = document.getElementById('editBdgId').value;

        apiRequest('/api/budgets/' + id, 'DELETE').then(function(res) {
            if (res.success) {
                showToast('תקציב נמחק! 🗑️');
                closeModal('modalEditBudget');
                fetchAllData();
            } else {
                showToast('שגיאה במחיקה', 'error');
            }
        }).catch(function(error) {
            showToast('שגיאה במחיקה', 'error');
        });
    }

    // ========================================
    // TOAST
    // ========================================

    function showToast(message, type) {
        type = type || 'success';
        var toast = document.getElementById('bdgToast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = 'bdg-toast ' + type + ' show';

        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    // ========================================
    // GLOBAL API
    // ========================================

    window.FlowEcoBdg = {
        openAddBudget: openAddBudget,
        saveBudget: saveBudget,
        editBudget: editBudget,
        updateBudget: updateBudget,
        deleteBudget: deleteBudget,
        closeModal: closeModal
    };

    // ========================================
    // INIT
    // ========================================

    fetchAllData();

    console.log('🎯 FlowEco Budgets v2 Ready!');

})();