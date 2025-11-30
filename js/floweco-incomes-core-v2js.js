// ========================================
// FlowEco Incomes v2 - Core Logic (Updated with Categories)
// ========================================

(function() {
    'use strict';

    const API_URL = 'https://floweco-api.razazulai.workers.dev';

    // ========== STATE ==========
    const state = {
        incomes: [],
        categories: [],
        filtered: [],
        selectedDate: new Date(),
        pagination: { page: 1, perPage: 10 }
    };

    // Will be populated from API
    let categoryIcons = {};

    const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

    // ========== HELPERS ==========
    function getToken() {
        return localStorage.getItem('floweco_token');
    }

    function formatCurrency(amount) {
        return '₪' + Math.round(Number(amount) || 0).toLocaleString('he-IL');
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }

    function setToday(inputId) {
        const input = document.getElementById(inputId);
        if (input) input.value = new Date().toISOString().split('T')[0];
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('incToast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = `inc-toast show ${type}`;
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

    // ========== MONTH NAVIGATION ==========
    function updateMonthDisplay() {
        const label = document.getElementById('incMonthLabel');
        const todayBtn = document.getElementById('incBtnToday');
        const nextBtn = document.getElementById('incNextBtn');

        if (!label) return;

        const now = new Date();
        const isCurrentMonth = state.selectedDate.getMonth() === now.getMonth() &&
                              state.selectedDate.getFullYear() === now.getFullYear();

        label.textContent = `${hebrewMonths[state.selectedDate.getMonth()]} ${state.selectedDate.getFullYear()}`;

        if (todayBtn) todayBtn.classList.toggle('hidden', isCurrentMonth);
        if (nextBtn) nextBtn.disabled = false;
    }

    async function changeMonth(direction) {
        state.selectedDate.setMonth(state.selectedDate.getMonth() + direction);
        updateMonthDisplay();
        await refresh();
    }

    async function goToCurrentMonth() {
        state.selectedDate = new Date();
        updateMonthDisplay();
        await refresh();
    }

    // ========== DATA ==========
    async function fetchIncomes() {
        try {
            const year = state.selectedDate.getFullYear();
            const month = state.selectedDate.getMonth() + 1;
            const monthParam = `${year}-${month.toString().padStart(2, '0')}`;
            
            const result = await apiRequest(`/api/incomes?month=${monthParam}`);
            if (result.success) {
                state.incomes = result.data || [];
                console.log(`✅ Loaded ${state.incomes.length} incomes`);
            }
        } catch (err) {
            console.error('Error fetching incomes:', err);
        }
    }

    async function fetchCategories() {
        try {
            const result = await apiRequest('/api/categories');
            if (result.success) {
                state.categories = result.data || [];
                // Build categoryIcons map
                categoryIcons = {};
                state.categories.forEach(cat => {
                    categoryIcons[cat.name] = cat.icon;
                });
                populateCategorySelects();
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    }

    function populateCategorySelects() {
        const selectIds = ['addIncSource', 'editIncSource'];
        const filterSelectId = 'incCategoryFilter';
        
        // Get only income categories
        const incomeCategories = state.categories.filter(c => c.type === 'income');

        // Populate form selects
        selectIds.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;

            const currentValue = select.value;
            select.innerHTML = '<option value="">בחר קטגוריה...</option>';

            incomeCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = `${cat.icon} ${cat.name}`;
                select.appendChild(option);
            });

            if (currentValue) select.value = currentValue;
        });

        // Populate filter select
        const filterSelect = document.getElementById(filterSelectId);
        if (filterSelect) {
            const currentValue = filterSelect.value;
            filterSelect.innerHTML = '<option value="">כל הקטגוריות</option>';

            incomeCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = `${cat.icon} ${cat.name}`;
                filterSelect.appendChild(option);
            });

            if (currentValue) filterSelect.value = currentValue;
        }
    }

    function getMonthIncomes() {
        const month = state.selectedDate.getMonth();
        const year = state.selectedDate.getFullYear();
        return state.incomes.filter(inc => {
            const d = new Date(inc.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    }

    // ========== SUMMARY ==========
    async function updateSummary() {
        const monthIncomes = getMonthIncomes();

        const total = monthIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
        // Check both is_recurring and parent_recurring_id
        const recurring = monthIncomes.filter(i => i.is_recurring === 1 || i.is_recurring === true || i.parent_recurring_id)
            .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
        const onetime = total - recurring;

        // Calculate balance (incomes - expenses)
        let balance = total;
        try {
            const expRes = await apiRequest('/api/expenses');
            if (expRes.success) {
                const month = state.selectedDate.getMonth();
                const year = state.selectedDate.getFullYear();
                const monthExpenses = (expRes.data || []).filter(e => {
                    const d = new Date(e.date);
                    return d.getMonth() === month && d.getFullYear() === year;
                });
                const totalExpenses = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                balance = total - totalExpenses;
            }
        } catch (e) {
            console.log('Could not fetch expenses for balance');
        }

        // Update DOM with null checks
        const totalEl = document.getElementById('incTotal');
        const recurringEl = document.getElementById('incRecurring');
        const onetimeEl = document.getElementById('incOnetime');
        const balanceEl = document.getElementById('incBalance');

        if (totalEl) totalEl.textContent = formatCurrency(total);
        if (recurringEl) recurringEl.textContent = formatCurrency(recurring);
        if (onetimeEl) onetimeEl.textContent = formatCurrency(onetime);
        if (balanceEl) {
            balanceEl.textContent = formatCurrency(balance);
            balanceEl.style.color = balance >= 0 ? '#10B981' : '#EF4444';
        }
    }

    // ========== FILTERS ==========
    function applyFilters() {
        let filtered = getMonthIncomes();

        // Search
        const searchEl = document.getElementById('incSearch');
        const search = searchEl ? searchEl.value.toLowerCase() : '';
        if (search) {
            filtered = filtered.filter(i => (i.source || '').toLowerCase().includes(search));
        }

        // Category filter
        const categoryEl = document.getElementById('incCategoryFilter');
        const categoryFilter = categoryEl ? categoryEl.value : '';
        if (categoryFilter) {
            filtered = filtered.filter(i => i.source === categoryFilter);
        }

        // Type filter
        const typeEl = document.getElementById('incTypeFilter');
        const typeFilter = typeEl ? typeEl.value : 'all';
        if (typeFilter === 'recurring') {
            filtered = filtered.filter(i => i.is_recurring === 1 || i.is_recurring === true);
        } else if (typeFilter === 'onetime') {
            filtered = filtered.filter(i => i.is_recurring === 0 || i.is_recurring === false);
        }

        // Sort
        const sortEl = document.getElementById('incSort');
        const sort = sortEl ? sortEl.value : 'date-desc';
        filtered.sort((a, b) => {
            switch (sort) {
                case 'date-desc': return new Date(b.date) - new Date(a.date);
                case 'date-asc': return new Date(a.date) - new Date(b.date);
                case 'amount-desc': return b.amount - a.amount;
                case 'amount-asc': return a.amount - b.amount;
                default: return 0;
            }
        });

        state.filtered = filtered;
        state.pagination.page = 1;
        renderList();
    }

    function resetFilters() {
        const searchEl = document.getElementById('incSearch');
        const categoryEl = document.getElementById('incCategoryFilter');
        const typeEl = document.getElementById('incTypeFilter');
        const sortEl = document.getElementById('incSort');
        
        if (searchEl) searchEl.value = '';
        if (categoryEl) categoryEl.value = '';
        if (typeEl) typeEl.value = 'all';
        if (sortEl) sortEl.value = 'date-desc';
        applyFilters();
    }

    // ========== RENDER ==========
    function renderList() {
        const list = document.getElementById('incList');
        if (!list) return;

        const { page, perPage } = state.pagination;
        const totalPages = Math.ceil(state.filtered.length / perPage) || 1;
        const start = (page - 1) * perPage;
        const pageData = state.filtered.slice(start, start + perPage);

        const countEl = document.getElementById('incCount');
        if (countEl) countEl.textContent = `${state.filtered.length} פריטים`;

        if (pageData.length === 0) {
            list.innerHTML = `
                <div class="inc-empty">
                    <div class="inc-empty-icon">💰</div>
                    <div class="inc-empty-text">אין הכנסות בחודש זה</div>
                    <div class="inc-empty-hint">לחץ על "הכנסה" להוספת הכנסה חדשה</div>
                </div>
            `;
        } else {
            list.innerHTML = pageData.map(inc => {
                // Check if recurring - either directly or generated from recurring
                const isRecurring = inc.is_recurring === 1 || inc.is_recurring === true || inc.parent_recurring_id;
                const icon = categoryIcons[inc.source] || '💰';
                return `
                    <div class="inc-item" onclick="FlowEcoInc.openEditModal('${inc.id}')">
                        <div class="inc-item-main">
                            <div class="inc-item-icon">${icon}</div>
                            <div class="inc-item-info">
                                <div class="inc-item-source">${inc.source}</div>
                                <div class="inc-item-date">📅 ${formatDate(inc.date)}</div>
                            </div>
                            <div class="inc-item-amount">+${formatCurrency(inc.amount)}</div>
                        </div>
                        <div class="inc-item-meta">
                            <span class="inc-item-tag ${isRecurring ? 'recurring' : 'onetime'}">
                                ${isRecurring ? '🔄 קבוע' : '📌 חד-פעמי'}
                            </span>
                            <div class="inc-item-actions">
                                <button class="inc-item-btn edit" onclick="event.stopPropagation(); FlowEcoInc.openEditModal('${inc.id}')">✏️</button>
                                <button class="inc-item-btn delete" onclick="event.stopPropagation(); FlowEcoInc.deleteIncome('${inc.id}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Pagination
        const pageInfoEl = document.getElementById('incPageInfo');
        const prevBtn = document.getElementById('incPrevBtn');
        const nextBtn = document.getElementById('incNextPageBtn');

        if (pageInfoEl) pageInfoEl.textContent = `עמוד ${page} מתוך ${totalPages}`;
        if (prevBtn) prevBtn.disabled = page === 1;
        if (nextBtn) nextBtn.disabled = page === totalPages;
    }

    function prevPage() {
        if (state.pagination.page > 1) {
            state.pagination.page--;
            renderList();
        }
    }

    function nextPage() {
        const totalPages = Math.ceil(state.filtered.length / state.pagination.perPage);
        if (state.pagination.page < totalPages) {
            state.pagination.page++;
            renderList();
        }
    }

    // ========== ADD MODAL ==========
    function openAddModal() {
        const modal = document.getElementById('incAddModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setToday('addIncDate');
            const recurringGroup = document.getElementById('addIncRecurringGroup');
            if (recurringGroup) recurringGroup.classList.add('hidden');
            setTimeout(() => {
                const amountEl = document.getElementById('addIncAmount');
                if (amountEl) amountEl.focus();
            }, 100);
        }
    }

    function closeAddModal() {
        const modal = document.getElementById('incAddModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            const form = document.getElementById('incAddForm');
            if (form) form.reset();
            const recurringGroup = document.getElementById('addIncRecurringGroup');
            if (recurringGroup) recurringGroup.classList.add('hidden');
        }
    }

    async function submitAdd(e) {
        e.preventDefault();

        const amountEl = document.getElementById('addIncAmount');
        const sourceEl = document.getElementById('addIncSource');
        const dateEl = document.getElementById('addIncDate');
        const recurringEl = document.getElementById('addIncRecurring');
        const recurringTypeEl = document.getElementById('addIncRecurringType');

        if (!amountEl || !sourceEl || !dateEl) return;

        const data = {
            amount: parseFloat(amountEl.value),
            source: sourceEl.value,
            date: dateEl.value,
            isRecurring: recurringEl ? recurringEl.checked : false,
            recurringType: (recurringEl && recurringEl.checked && recurringTypeEl) 
                ? recurringTypeEl.value 
                : null
        };

        try {
            const res = await apiRequest('/api/incomes', 'POST', data);
            if (res.success) {
                showToast('✅ הכנסה נוספה בהצלחה!', 'success');
                closeAddModal();
                await refresh();
            } else {
                showToast('❌ ' + (res.error || 'שגיאה בשמירה'), 'error');
            }
        } catch (err) {
            showToast('❌ שגיאה בחיבור לשרת', 'error');
        }
    }

    // ========== EDIT MODAL ==========
    function openEditModal(id) {
        const income = state.incomes.find(i => i.id === id || i.id === parseInt(id));
        if (!income) {
            showToast('❌ לא נמצאה הכנסה', 'error');
            return;
        }

        const idEl = document.getElementById('editIncId');
        const amountEl = document.getElementById('editIncAmount');
        const sourceEl = document.getElementById('editIncSource');
        const dateEl = document.getElementById('editIncDate');
        const recurringEl = document.getElementById('editIncRecurring');
        const recurringGroup = document.getElementById('editIncRecurringGroup');
        const recurringTypeEl = document.getElementById('editIncRecurringType');

        if (idEl) idEl.value = income.id;
        if (amountEl) amountEl.value = income.amount;
        if (sourceEl) sourceEl.value = income.source;
        if (dateEl) dateEl.value = income.date;
        if (recurringEl) recurringEl.checked = income.is_recurring ? true : false;

        if (income.is_recurring) {
            if (recurringGroup) recurringGroup.classList.remove('hidden');
            if (recurringTypeEl) recurringTypeEl.value = income.recurring_type || 'monthly';
        } else {
            if (recurringGroup) recurringGroup.classList.add('hidden');
        }

        const modal = document.getElementById('incEditModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeEditModal() {
        const modal = document.getElementById('incEditModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            const form = document.getElementById('incEditForm');
            if (form) form.reset();
            const recurringGroup = document.getElementById('editIncRecurringGroup');
            if (recurringGroup) recurringGroup.classList.add('hidden');
        }
    }

    async function submitEdit(e) {
        e.preventDefault();

        const idEl = document.getElementById('editIncId');
        const amountEl = document.getElementById('editIncAmount');
        const sourceEl = document.getElementById('editIncSource');
        const dateEl = document.getElementById('editIncDate');
        const recurringEl = document.getElementById('editIncRecurring');
        const recurringTypeEl = document.getElementById('editIncRecurringType');

        if (!idEl || !amountEl || !sourceEl || !dateEl) return;

        const id = idEl.value;
        const data = {
            amount: parseFloat(amountEl.value),
            source: sourceEl.value,
            date: dateEl.value,
            isRecurring: recurringEl ? recurringEl.checked : false,
            recurringType: (recurringEl && recurringEl.checked && recurringTypeEl) 
                ? recurringTypeEl.value 
                : null
        };

        try {
            // Delete old and create new
            await apiRequest(`/api/incomes/${id}`, 'DELETE');
            const res = await apiRequest('/api/incomes', 'POST', data);
            
            if (res.success) {
                showToast('✅ הכנסה עודכנה בהצלחה!', 'success');
                closeEditModal();
                await refresh();
            } else {
                showToast('❌ שגיאה בעדכון', 'error');
            }
        } catch (err) {
            showToast('❌ שגיאה בחיבור לשרת', 'error');
        }
    }

    // ========== TOGGLE RECURRING ==========
    function toggleRecurring(prefix) {
        const checkbox = document.getElementById(`${prefix}IncRecurring`);
        const group = document.getElementById(`${prefix}IncRecurringGroup`);
        if (checkbox && group) {
            group.classList.toggle('hidden', !checkbox.checked);
        }
    }

    // ========== DELETE ==========
    async function deleteIncome(id) {
        if (!confirm('למחוק הכנסה זו?')) return;

        try {
            const res = await apiRequest(`/api/incomes/${id}`, 'DELETE');
            if (res.success) {
                showToast('✅ הכנסה נמחקה!', 'success');
                await refresh();
            } else {
                showToast('❌ שגיאה במחיקה', 'error');
            }
        } catch (err) {
            showToast('❌ שגיאה בחיבור לשרת', 'error');
        }
    }

    // ========== REFRESH ==========
    async function refresh() {
        await fetchIncomes();
        await updateSummary();
        applyFilters();
    }

    // ========== INIT ==========
    async function init() {
        // Guard - only run on incomes page
        if (!document.querySelector('.inc-container')) {
            return;
        }

        console.log('💰 FlowEco Incomes v2 Loading...');
        updateMonthDisplay();
        setToday('addIncDate');
        await fetchCategories();
        await refresh();
        console.log('✅ FlowEco Incomes v2 Ready!');
    }

    // ========== GLOBAL API ==========
    window.FlowEcoInc = {
        changeMonth,
        goToCurrentMonth,
        applyFilters,
        resetFilters,
        prevPage,
        nextPage,
        openAddModal,
        closeAddModal,
        submitAdd,
        openEditModal,
        closeEditModal,
        submitEdit,
        toggleRecurring,
        deleteIncome,
        refresh
    };

    // ========== EVENTS ==========
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeAddModal();
            closeEditModal();
        }
    });

    // ========== START ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();