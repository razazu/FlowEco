// ========================================
// FlowEco Expenses v2 - Core Logic
// ========================================

(function() {
    'use strict';

    // Guard - only run on expenses page
    if (!document.querySelector('.expenses-page-v2')) return;

    console.log('💸 FlowEco Expenses v2 Loading...');

    // ========================================
    // CONFIG & STATE
    // ========================================

    const API_URL = 'https://floweco-api.razazulai.workers.dev';

    const state = {
        expenses: [],
        loans: [],
        installments: [],
        cards: [],
        categories: [],
        summary: {},
        selectedDate: new Date(),
        currentTab: 'regular',
        filters: {
            search: '',
            category: '',
            card: '',
            sort: 'date-desc'
        },
        pagination: {
            regular: { page: 1, perPage: 10 }
        }
    };

    const hebrewMonths = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

    let categoryIcons = {};

    // ========================================
    // API HELPERS
    // ========================================

    function getToken() {
        return localStorage.getItem('floweco_token');
    }

    async function apiRequest(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${API_URL}${endpoint}`, options);
        return response.json();
    }

    function getMonthParam() {
        return `${state.selectedDate.getFullYear()}-${String(state.selectedDate.getMonth() + 1).padStart(2, '0')}`;
    }

    // ========================================
    // DATA FETCHING
    // ========================================

    async function fetchAllData() {
        try {
            const monthParam = getMonthParam();
            
            const [expensesRes, loansRes, installmentsRes, cardsRes, categoriesRes] = await Promise.all([
                apiRequest(`/api/expenses?month=${monthParam}`),
                apiRequest('/api/loans'),
                apiRequest('/api/installments'),
                apiRequest('/api/cards'),
                apiRequest('/api/categories')
            ]);

            if (expensesRes.success) state.expenses = expensesRes.data || [];
            if (loansRes.success) state.loans = loansRes.data || [];
            if (installmentsRes.success) state.installments = installmentsRes.data || [];
            if (cardsRes.success) state.cards = cardsRes.data || [];
            if (categoriesRes.success) {
                state.categories = categoriesRes.data || [];
                categoryIcons = {};
                state.categories.forEach(cat => {
                    categoryIcons[cat.name] = cat.icon;
                });
            }

            populateCardSelects();
            populateCategorySelects();
            updateMonthDisplay();
            updateSummary();
            renderCurrentTab();

        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('שגיאה בטעינת נתונים', 'error');
        }
    }

    function populateCategorySelects() {
        const selects = ['expCategory', 'addExpCategory', 'editExpCategory', 'addInstCategory'];
        const expenseCategories = state.categories.filter(c => c.type === 'expense');

        selects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;

            const currentValue = select.value;
            const isFilter = id === 'expCategory';

            if (isFilter) {
                select.innerHTML = '<option value="">כל הקטגוריות</option>';
            } else {
                select.innerHTML = '<option value="">בחר קטגוריה...</option>';
            }

            expenseCategories.forEach(cat => {
                select.innerHTML += `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`;
            });

            if (currentValue) select.value = currentValue;
        });
    }

    // ========================================
    // MONTH NAVIGATION
    // ========================================

    function updateMonthDisplay() {
        const month = state.selectedDate.getMonth();
        const year = state.selectedDate.getFullYear();
        document.getElementById('expMonthLabel').textContent = `${hebrewMonths[month]} ${year}`;
    }

    function changeMonth(delta) {
        state.selectedDate.setMonth(state.selectedDate.getMonth() + delta);
        fetchAllData();
    }

    function goToCurrentMonth() {
        state.selectedDate = new Date();
        fetchAllData();
    }

    // ========================================
    // SUMMARY CALCULATIONS
    // ========================================

    function getMonthExpenses() {
        const year = state.selectedDate.getFullYear();
        const month = state.selectedDate.getMonth();

        return state.expenses.filter(exp => {
            const expDate = new Date(exp.date);
            return expDate.getFullYear() === year && expDate.getMonth() === month;
        });
    }

    function getActiveLoans() {
        return state.loans.filter(loan => loan.status === 'active');
    }

    function getActiveInstallments() {
        const year = state.selectedDate.getFullYear();
        const month = state.selectedDate.getMonth();

        return state.installments.filter(inst => {
            if (inst.status !== 'active') return false;
            
            const startDate = new Date(inst.first_payment_date);
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            
            const endDate = new Date(startYear, startMonth + inst.total_installments - 1, 1);
            const endYear = endDate.getFullYear();
            const endMonth = endDate.getMonth();
            
            const selectedMonthNum = year * 12 + month;
            const startMonthNum = startYear * 12 + startMonth;
            const endMonthNum = endYear * 12 + endMonth;
            
            return selectedMonthNum >= startMonthNum && selectedMonthNum <= endMonthNum;
        });
    }

    function updateSummary() {
        const monthExpenses = getMonthExpenses();
        const activeLoans = getActiveLoans();
        const activeInstallments = getActiveInstallments();

        const regularTotal = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const loansTotal = activeLoans.reduce((sum, loan) => sum + (loan.monthly_payment || 0), 0);
        const installmentsTotal = activeInstallments.reduce((sum, inst) => sum + (inst.installment_amount || 0), 0);
        const grandTotal = regularTotal + loansTotal + installmentsTotal;

        document.getElementById('expTotalMonth').textContent = `₪${grandTotal.toLocaleString('he-IL')}`;
        document.getElementById('expRegular').textContent = `₪${regularTotal.toLocaleString('he-IL')}`;
        document.getElementById('expInstallments').textContent = `₪${installmentsTotal.toLocaleString('he-IL')}`;
        document.getElementById('expLoans').textContent = `₪${loansTotal.toLocaleString('he-IL')}`;

        updateCardsBreakdown(monthExpenses, grandTotal);
    }

    function updateCardsBreakdown(expenses, total) {
        const cardsList = document.getElementById('expCardsList');
        const byCard = {};

        expenses.forEach(exp => {
            const cardId = exp.card_id || 'cash';
            if (!byCard[cardId]) {
                byCard[cardId] = { amount: 0, name: 'מזומן', icon: '💵' };
            }
            byCard[cardId].amount += exp.amount || 0;
        });

        state.cards.forEach(card => {
            if (byCard[card.id]) {
                byCard[card.id].name = card.card_name;
                byCard[card.id].icon = '💳';
            }
        });

        if (Object.keys(byCard).length === 0) {
            cardsList.innerHTML = '<div class="exp-empty-hint">אין נתונים להצגה</div>';
            return;
        }

        cardsList.innerHTML = Object.entries(byCard)
            .sort((a, b) => b[1].amount - a[1].amount)
            .map(([id, data]) => {
                const percent = total > 0 ? (data.amount / total * 100) : 0;
                return `
                    <div class="exp-card-breakdown-item">
                        <span class="exp-card-breakdown-icon">${data.icon}</span>
                        <div class="exp-card-breakdown-info">
                            <div class="exp-card-breakdown-name">${data.name}</div>
                            <div class="exp-card-breakdown-bar">
                                <div class="exp-card-breakdown-fill" style="width: ${percent}%"></div>
                            </div>
                        </div>
                        <span class="exp-card-breakdown-amount">₪${data.amount.toLocaleString('he-IL')}</span>
                    </div>
                `;
            }).join('');
    }

    // ========================================
    // TABS
    // ========================================

    function switchTab(tab) {
        state.currentTab = tab;

        document.querySelectorAll('.exp-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        document.getElementById('sectionRegular').classList.toggle('hidden', tab !== 'regular');
        document.getElementById('sectionInstallments').classList.toggle('hidden', tab !== 'installments');
        document.getElementById('sectionLoans').classList.toggle('hidden', tab !== 'loans');

        renderCurrentTab();
    }

    function renderCurrentTab() {
        switch (state.currentTab) {
            case 'regular': renderExpenses(); break;
            case 'installments': renderInstallments(); break;
            case 'loans': renderLoans(); break;
        }
    }

    // ========================================
    // RENDER EXPENSES
    // ========================================

    function renderExpenses() {
        const list = document.getElementById('expRegularList');
        let expenses = getMonthExpenses();

        const { search, category, card, sort } = state.filters;

        if (search) {
            const s = search.toLowerCase();
            expenses = expenses.filter(e => 
                (e.description || '').toLowerCase().includes(s) ||
                (e.category || '').toLowerCase().includes(s)
            );
        }

        if (category) expenses = expenses.filter(e => e.category === category);
        if (card) expenses = expenses.filter(e => e.card_id === card);

        expenses.sort((a, b) => {
            switch (sort) {
                case 'date-desc': return new Date(b.date) - new Date(a.date);
                case 'date-asc': return new Date(a.date) - new Date(b.date);
                case 'amount-desc': return b.amount - a.amount;
                case 'amount-asc': return a.amount - b.amount;
                default: return 0;
            }
        });

        const activeInstallments = getActiveInstallments();
        const activeLoans = getActiveLoans();
        const totalItems = expenses.length + activeInstallments.length + activeLoans.length;

        document.getElementById('expRegularCount').textContent = `${totalItems} פריטים`;

        const { page, perPage } = state.pagination.regular;
        const totalPages = Math.ceil(expenses.length / perPage) || 1;
        const start = (page - 1) * perPage;
        const pageExpenses = expenses.slice(start, start + perPage);

        let html = '';

        if (pageExpenses.length === 0 && activeInstallments.length === 0 && activeLoans.length === 0) {
            list.innerHTML = `
                <div class="exp-empty">
                    <div class="exp-empty-icon">🛒</div>
                    <div class="exp-empty-text">אין הוצאות בחודש זה</div>
                    <div class="exp-empty-hint">לחץ על "הוצאה" להוספת הוצאה חדשה</div>
                </div>
            `;
            document.getElementById('expRegularPageInfo').textContent = `עמוד 1 מתוך 1`;
            return;
        }

        html += pageExpenses.map(exp => {
            const icon = categoryIcons[exp.category] || '📦';
            const date = new Date(exp.date).toLocaleDateString('he-IL');
            const cardName = getCardName(exp.card_id);
            const paymentIcon = exp.payment_method === 'card' ? '💳' : exp.payment_method === 'bank' ? '🏦' : '💵';
            const isRecurring = exp.is_recurring === 1 || exp.is_recurring === true;

            return `
                <div class="exp-item" onclick="FlowEcoExp.editExpense('${exp.id}')">
                    <div class="exp-item-main">
                        <div class="exp-item-icon cat-${exp.category}">${icon}</div>
                        <div class="exp-item-info">
                            <div class="exp-item-title">${exp.category}</div>
                            <div class="exp-item-desc">${exp.description || 'ללא תיאור'}</div>
                        </div>
                        <div class="exp-item-amount">₪${(exp.amount || 0).toLocaleString('he-IL')}</div>
                    </div>
                    <div class="exp-item-meta">
                        <span class="exp-item-tag">📅 ${date}</span>
                        <span class="exp-item-tag">${paymentIcon} ${cardName}</span>
                        ${isRecurring ? '<span class="exp-item-tag recurring">🔄 חוזר</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        activeInstallments.forEach(inst => {
            const icon = categoryIcons[inst.category] || '💳';
            const cardName = getCardName(inst.card_id);
            
            const startDate = new Date(inst.first_payment_date);
            const startMonthNum = startDate.getFullYear() * 12 + startDate.getMonth();
            const selectedMonthNum = state.selectedDate.getFullYear() * 12 + state.selectedDate.getMonth();
            const currentPayment = selectedMonthNum - startMonthNum + 1;
            const remaining = inst.total_installments - currentPayment;
            
            html += `
                <div class="exp-item" onclick="FlowEcoExp.editInstallment('${inst.id}')" style="border-color: rgba(139, 92, 246, 0.4);">
                    <div class="exp-item-main">
                        <div class="exp-item-icon" style="background: rgba(139, 92, 246, 0.2);">${icon}</div>
                        <div class="exp-item-info">
                            <div class="exp-item-title">${inst.description}</div>
                            <div class="exp-item-desc">תשלום ${currentPayment} מתוך ${inst.total_installments} | נותרו ${remaining}</div>
                        </div>
                        <div class="exp-item-amount">₪${(inst.installment_amount || 0).toLocaleString('he-IL')}</div>
                    </div>
                    <div class="exp-item-meta">
                        <span class="exp-item-tag" style="background: rgba(139, 92, 246, 0.2); color: #A78BFA;">💳 תשלומים</span>
                        <span class="exp-item-tag">💳 ${cardName}</span>
                    </div>
                </div>
            `;
        });

        activeLoans.forEach(loan => {
            html += `
                <div class="exp-item" onclick="FlowEcoExp.editLoan('${loan.id}')" style="border-color: rgba(245, 158, 11, 0.4);">
                    <div class="exp-item-main">
                        <div class="exp-item-icon" style="background: rgba(245, 158, 11, 0.2);">🏦</div>
                        <div class="exp-item-info">
                            <div class="exp-item-title">${loan.loan_name}</div>
                            <div class="exp-item-desc">${loan.lender || 'הלוואה'}${loan.remaining_months ? ` | נותרו ${loan.remaining_months} חודשים` : ''}</div>
                        </div>
                        <div class="exp-item-amount">₪${(loan.monthly_payment || 0).toLocaleString('he-IL')}</div>
                    </div>
                    <div class="exp-item-meta">
                        <span class="exp-item-tag" style="background: rgba(245, 158, 11, 0.2); color: #FBBF24;">🏦 הלוואה</span>
                        ${loan.remaining_amount ? `<span class="exp-item-tag">📅 יתרה: ₪${(loan.remaining_amount || 0).toLocaleString('he-IL')}</span>` : ''}
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
        document.getElementById('expRegularPageInfo').textContent = `עמוד ${page} מתוך ${totalPages}`;
    }

    // ========================================
    // RENDER INSTALLMENTS
    // ========================================

    function renderInstallments() {
        const list = document.getElementById('expInstList');
        const activeInstallments = getActiveInstallments();
        const year = state.selectedDate.getFullYear();
        const month = state.selectedDate.getMonth();

        document.getElementById('expInstCount').textContent = `${activeInstallments.length} פריטים`;

        if (activeInstallments.length === 0) {
            list.innerHTML = `
                <div class="exp-empty">
                    <div class="exp-empty-icon">💳</div>
                    <div class="exp-empty-text">אין תשלומים פעילים</div>
                    <div class="exp-empty-hint">בחר "כרטיס אשראי" והזן מספר תשלומים</div>
                </div>
            `;
            return;
        }

        list.innerHTML = activeInstallments.map(inst => {
            const icon = categoryIcons[inst.category] || '🛍️';
            const cardName = getCardName(inst.card_id);
            
            const startDate = new Date(inst.first_payment_date);
            const startMonthNum = startDate.getFullYear() * 12 + startDate.getMonth();
            const selectedMonthNum = year * 12 + month;
            const monthsPassed = selectedMonthNum - startMonthNum;
            const currentPayment = monthsPassed + 1;
            const remaining = inst.total_installments - currentPayment;
            
            const progress = (currentPayment / inst.total_installments) * 100;

            return `
                <div class="exp-item" onclick="FlowEcoExp.editInstallment('${inst.id}')">
                    <div class="exp-item-main">
                        <div class="exp-item-icon">${icon}</div>
                        <div class="exp-item-info">
                            <div class="exp-item-title">${inst.description}</div>
                            <div class="exp-item-desc">סה"כ: ₪${(inst.original_amount || 0).toLocaleString('he-IL')}</div>
                            <div class="exp-item-progress">
                                <div class="exp-item-progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <div class="exp-item-progress-text">תשלום ${currentPayment} מתוך ${inst.total_installments}</div>
                        </div>
                        <div class="exp-item-amount">₪${(inst.installment_amount || 0).toLocaleString('he-IL')}/חודש</div>
                    </div>
                    <div class="exp-item-meta">
                        <span class="exp-item-tag">💳 ${cardName}</span>
                        <span class="exp-item-tag">📅 נותרו ${remaining} תשלומים</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========================================
    // RENDER LOANS
    // ========================================

    function renderLoans() {
        const list = document.getElementById('expLoansList');
        const loans = getActiveLoans();

        document.getElementById('expLoansCount').textContent = `${loans.length} פריטים`;

        if (loans.length === 0) {
            list.innerHTML = `
                <div class="exp-empty">
                    <div class="exp-empty-icon">🏦</div>
                    <div class="exp-empty-text">אין הלוואות פעילות</div>
                    <div class="exp-empty-hint">לחץ על "הלוואה" להוספת הלוואה</div>
                </div>
            `;
            return;
        }

        list.innerHTML = loans.map(loan => {
            const hasDetails = loan.total_months && loan.remaining_months;
            const progress = hasDetails ? ((loan.total_months - loan.remaining_months) / loan.total_months) * 100 : 0;
            const endDate = loan.end_date ? new Date(loan.end_date).toLocaleDateString('he-IL') : '-';

            return `
                <div class="exp-item" onclick="FlowEcoExp.editLoan('${loan.id}')">
                    <div class="exp-item-main">
                        <div class="exp-item-icon">🏦</div>
                        <div class="exp-item-info">
                            <div class="exp-item-title">${loan.loan_name}</div>
                            <div class="exp-item-desc">${loan.lender || 'לא צוין'}</div>
                            ${hasDetails ? `
                            <div class="exp-item-progress">
                                <div class="exp-item-progress-fill" style="width: ${progress}%"></div>
                            </div>
                            ` : ''}
                        </div>
                        <div class="exp-item-amount">₪${(loan.monthly_payment || 0).toLocaleString('he-IL')}/חודש</div>
                    </div>
                    <div class="exp-loan-details">
                        ${loan.original_amount ? `
                        <div class="exp-loan-detail">
                            <span class="exp-loan-detail-label">סכום מקורי</span>
                            <span class="exp-loan-detail-value">₪${(loan.original_amount || 0).toLocaleString('he-IL')}</span>
                        </div>
                        ` : ''}
                        ${loan.remaining_amount ? `
                        <div class="exp-loan-detail">
                            <span class="exp-loan-detail-label">יתרה לסילוק</span>
                            <span class="exp-loan-detail-value">₪${(loan.remaining_amount || 0).toLocaleString('he-IL')}</span>
                        </div>
                        ` : ''}
                        ${loan.remaining_months ? `
                        <div class="exp-loan-detail">
                            <span class="exp-loan-detail-label">חודשים שנותרו</span>
                            <span class="exp-loan-detail-value">${loan.remaining_months || 0}</span>
                        </div>
                        ` : ''}
                        ${loan.end_date ? `
                        <div class="exp-loan-detail">
                            <span class="exp-loan-detail-label">תאריך סיום</span>
                            <span class="exp-loan-detail-value">${endDate}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ========================================
    // FILTERS & PAGINATION
    // ========================================

    function applyFilters() {
        state.filters.search = document.getElementById('expSearch').value;
        state.filters.category = document.getElementById('expCategory').value;
        state.filters.card = document.getElementById('expCard').value;
        state.filters.sort = document.getElementById('expSort').value;
        state.pagination.regular.page = 1;
        renderCurrentTab();
    }

    function resetFilters() {
        document.getElementById('expSearch').value = '';
        document.getElementById('expCategory').value = '';
        document.getElementById('expCard').value = '';
        document.getElementById('expSort').value = 'date-desc';
        state.filters = { search: '', category: '', card: '', sort: 'date-desc' };
        state.pagination.regular.page = 1;
        renderCurrentTab();
    }

    function prevPage(type) {
        if (state.pagination[type].page > 1) {
            state.pagination[type].page--;
            renderCurrentTab();
        }
    }

    function nextPage(type) {
        const total = type === 'regular' ? getMonthExpenses().length : 0;
        const totalPages = Math.ceil(total / state.pagination[type].perPage);
        if (state.pagination[type].page < totalPages) {
            state.pagination[type].page++;
            renderCurrentTab();
        }
    }

    // ========================================
    // CARD HELPERS
    // ========================================

    function getCardName(cardId) {
        if (!cardId) return 'מזומן';
        const card = state.cards.find(c => c.id === cardId);
        return card ? card.card_name : 'לא ידוע';
    }

    function populateCardSelects() {
        const selects = ['expCard', 'addExpCard', 'editExpCard', 'addInstCard', 'addLoanCard'];

        selects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;

            const currentValue = select.value;
            const isFilter = id === 'expCard';

            select.innerHTML = isFilter ? '<option value="">כל הכרטיסים</option>' : '<option value="">ללא</option>';

            state.cards.forEach(card => {
                select.innerHTML += `<option value="${card.id}">💳 ${card.card_name}</option>`;
            });

            if (currentValue) select.value = currentValue;
        });
    }

    // ========================================
    // MODALS
    // ========================================

    function openModal(id) {
        document.getElementById(id).classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(id) {
        document.getElementById(id).classList.remove('show');
        document.body.style.overflow = '';
    }

    // ========================================
    // TOGGLE LOAN DETAILS
    // ========================================

    function toggleLoanDetails(prefix) {
        const section = document.getElementById(`${prefix}LoanDetailsSection`);
        const icon = document.getElementById(`${prefix}LoanExpandIcon`);
        const btn = icon?.closest('.exp-btn-expand');
        
        if (!section || !icon) return;
        
        if (section.classList.contains('hidden')) {
            section.classList.remove('hidden');
            icon.textContent = '▲';
            if (btn) btn.classList.add('expanded');
        } else {
            section.classList.add('hidden');
            icon.textContent = '▼';
            if (btn) btn.classList.remove('expanded');
        }
    }

    // ========================================
    // QUICK ADD CARD
    // ========================================

    function openQuickAddCard() {
        document.getElementById('formQuickAddCard').reset();
        document.getElementById('quickCardColor').value = '#667eea';
        
        const colorPicker = document.getElementById('quickCardColorPicker');
        colorPicker.querySelectorAll('.exp-color-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.color === '#667eea');
        });
        
        openModal('modalQuickAddCard');
        
        colorPicker.querySelectorAll('.exp-color-option').forEach(opt => {
            opt.onclick = function() {
                colorPicker.querySelectorAll('.exp-color-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('quickCardColor').value = this.dataset.color;
            };
        });
    }

    async function saveQuickCard(e) {
        e.preventDefault();

        const data = {
            card_name: document.getElementById('quickCardName').value,
            last_four: document.getElementById('quickCardDigits').value || null,
            color: document.getElementById('quickCardColor').value
        };

        try {
            const res = await apiRequest('/api/cards', 'POST', data);
            if (res.success) {
                showToast('כרטיס נוסף בהצלחה! 💳');
                closeModal('modalQuickAddCard');
                
                if (res.data) {
                    state.cards.push(res.data);
                } else {
                    const cardsRes = await apiRequest('/api/cards');
                    if (cardsRes.success) state.cards = cardsRes.data || [];
                }
                
                populateCardSelects();
                
                const newCardId = res.data?.id;
                if (newCardId) {
                    const selects = ['addExpCard', 'editExpCard', 'addInstCard', 'addLoanCard'];
                    selects.forEach(id => {
                        const select = document.getElementById(id);
                        if (select && !select.closest('.hidden')) {
                            select.value = newCardId;
                        }
                    });
                }
            } else {
                showToast(res.error || 'שגיאה בהוספת כרטיס', 'error');
            }
        } catch (error) {
            showToast('שגיאה בשמירה', 'error');
        }
    }

    // ========================================
    // ADD EXPENSE
    // ========================================

    function openAddExpense() {
        document.getElementById('formAddExpense').reset();
        document.getElementById('addExpDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('addExpCardGroup').classList.add('hidden');
        document.getElementById('addExpInstallmentsGroup').classList.add('hidden');
        document.getElementById('addExpRecurringGroup').classList.add('hidden');
        openModal('modalAddExpense');
    }

    function toggleCardSelect(prefix) {
        const payment = document.getElementById(`${prefix}ExpPayment`).value;
        const cardGroup = document.getElementById(`${prefix}ExpCardGroup`);
        const installmentsGroup = document.getElementById(`${prefix}ExpInstallmentsGroup`);
        
        const isCard = payment === 'card';
        cardGroup.classList.toggle('hidden', !isCard);
        
        if (installmentsGroup) {
            installmentsGroup.classList.toggle('hidden', !isCard);
            if (!isCard) {
                const instInput = document.getElementById(`${prefix}ExpInstallments`);
                if (instInput) instInput.value = 1;
            }
        }
    }

    function toggleRecurring(prefix) {
        const checkbox = document.getElementById(`${prefix}ExpRecurring`);
        const group = document.getElementById(`${prefix}ExpRecurringGroup`);
        if (checkbox && group) {
            group.classList.toggle('hidden', !checkbox.checked);
        }
    }

    async function saveExpense(e) {
        e.preventDefault();

        const paymentMethod = document.getElementById('addExpPayment').value;
        const installments = parseInt(document.getElementById('addExpInstallments')?.value) || 1;
        
        const baseData = {
            amount: parseFloat(document.getElementById('addExpAmount').value),
            category: document.getElementById('addExpCategory').value,
            description: document.getElementById('addExpDescription').value,
            date: document.getElementById('addExpDate').value,
            paymentMethod: paymentMethod,
            cardId: document.getElementById('addExpCard').value || null,
            isRecurring: document.getElementById('addExpRecurring').checked,
            recurringType: document.getElementById('addExpRecurringType').value
        };

        try {
            if (paymentMethod === 'card' && installments > 1) {
                const instData = {
                    description: baseData.description || baseData.category,
                    original_amount: baseData.amount,
                    total_installments: installments,
                    first_payment_date: baseData.date,
                    category: baseData.category,
                    card_id: baseData.cardId
                };
                const res = await apiRequest('/api/installments', 'POST', instData);
                if (res.success) {
                    showToast(`נוסף בהצלחה! ${installments} תשלומים ✅`);
                    closeModal('modalAddExpense');
                    fetchAllData();
                } else {
                    showToast(res.error || 'שגיאה', 'error');
                }
            } else {
                const res = await apiRequest('/api/expenses', 'POST', baseData);
                if (res.success) {
                    showToast('הוצאה נוספה בהצלחה! ✅');
                    closeModal('modalAddExpense');
                    fetchAllData();
                } else {
                    showToast(res.error || 'שגיאה', 'error');
                }
            }
        } catch (error) {
            showToast('שגיאה בשמירה', 'error');
        }
    }

    // ========================================
    // EDIT EXPENSE
    // ========================================

    function editExpense(id) {
        const exp = state.expenses.find(e => e.id === id);
        if (!exp) {
            showToast('הוצאה לא נמצאה', 'error');
            return;
        }

        document.getElementById('editExpId').value = id;
        document.getElementById('editExpAmount').value = exp.amount;
        document.getElementById('editExpCategory').value = exp.category;
        document.getElementById('editExpDescription').value = exp.description || '';
        document.getElementById('editExpDate').value = exp.date;
        document.getElementById('editExpPayment').value = exp.payment_method || 'cash';
        document.getElementById('editExpCard').value = exp.card_id || '';
        
        // Set recurring checkbox
        const isRecurring = exp.is_recurring === 1 || exp.is_recurring === true;
        document.getElementById('editExpRecurring').checked = isRecurring;
        document.getElementById('editExpRecurringGroup').classList.toggle('hidden', !isRecurring);
        document.getElementById('editExpRecurringType').value = exp.recurring_type || 'monthly';

        toggleCardSelect('edit');
        openModal('modalEditExpense');
    }

    async function updateExpense(e) {
        e.preventDefault();

        const id = document.getElementById('editExpId').value;
        if (!id) {
            showToast('שגיאה: לא נמצא מזהה הוצאה', 'error');
            return;
        }

        const isRecurring = document.getElementById('editExpRecurring').checked;
        
        const data = {
            amount: parseFloat(document.getElementById('editExpAmount').value),
            category: document.getElementById('editExpCategory').value,
            description: document.getElementById('editExpDescription').value,
            date: document.getElementById('editExpDate').value,
            paymentMethod: document.getElementById('editExpPayment').value,
            cardId: document.getElementById('editExpCard').value || null,
            isRecurring: isRecurring,
            recurringType: isRecurring ? document.getElementById('editExpRecurringType').value : null
        };

        try {
            const res = await apiRequest(`/api/expenses/${id}`, 'PUT', data);
            if (res.success) {
                showToast('הוצאה עודכנה! ✅');
                closeModal('modalEditExpense');
                fetchAllData();
            } else {
                showToast(res.error || 'שגיאה', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showToast('שגיאה בעדכון', 'error');
        }
    }

    async function deleteExpense() {
        const id = document.getElementById('editExpId').value;
        if (!id) {
            showToast('שגיאה: לא נמצא מזהה הוצאה', 'error');
            return;
        }
        
        if (!confirm('למחוק את ההוצאה?')) return;

        try {
            const res = await apiRequest(`/api/expenses/${id}`, 'DELETE');
            if (res.success) {
                showToast('הוצאה נמחקה! 🗑️');
                closeModal('modalEditExpense');
                fetchAllData();
            } else {
                showToast(res.error || 'שגיאה במחיקה', 'error');
            }
        } catch (error) {
            console.error('Delete error:', error);
            showToast('שגיאה במחיקה', 'error');
        }
    }

    // ========================================
    // INSTALLMENTS
    // ========================================

    function openAddInstallment() {
        document.getElementById('formAddInstallment').reset();
        document.getElementById('addInstDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('addInstMonthly').textContent = '₪0';
        openModal('modalAddInstallment');
    }

    function calcInstallment() {
        const amount = parseFloat(document.getElementById('addInstAmount').value) || 0;
        const count = parseInt(document.getElementById('addInstCount').value) || 1;
        const monthly = amount / count;
        document.getElementById('addInstMonthly').textContent = `₪${monthly.toLocaleString('he-IL', { maximumFractionDigits: 2 })}`;
    }

    async function saveInstallment(e) {
        e.preventDefault();

        const data = {
            description: document.getElementById('addInstDescription').value,
            original_amount: parseFloat(document.getElementById('addInstAmount').value),
            total_installments: parseInt(document.getElementById('addInstCount').value),
            first_payment_date: document.getElementById('addInstDate').value,
            category: document.getElementById('addInstCategory').value,
            card_id: document.getElementById('addInstCard').value || null
        };

        try {
            const res = await apiRequest('/api/installments', 'POST', data);
            if (res.success) {
                showToast('תשלומים נוספו בהצלחה! ✅');
                closeModal('modalAddInstallment');
                fetchAllData();
            } else {
                showToast(res.error || 'שגיאה', 'error');
            }
        } catch (error) {
            showToast('שגיאה בשמירה', 'error');
        }
    }

    function editInstallment(id) {
        const inst = state.installments.find(i => i.id === id);
        if (!inst) {
            showToast('תשלומים לא נמצאו', 'error');
            return;
        }

        document.getElementById('editInstId').value = id;
        document.getElementById('editInstDescription').value = inst.description;
        document.getElementById('editInstAmount').value = inst.original_amount;
        document.getElementById('editInstRemaining').value = inst.remaining_installments;
        document.getElementById('editInstStatus').value = inst.status;

        openModal('modalEditInstallment');
    }

    async function updateInstallment(e) {
        e.preventDefault();

        const id = document.getElementById('editInstId').value;
        const inst = state.installments.find(i => i.id === id);

        const data = {
            description: document.getElementById('editInstDescription').value,
            original_amount: parseFloat(document.getElementById('editInstAmount').value),
            total_installments: inst.total_installments,
            installment_amount: inst.installment_amount,
            first_payment_date: inst.first_payment_date,
            card_id: inst.card_id,
            category: inst.category,
            remaining_installments: parseInt(document.getElementById('editInstRemaining').value),
            status: document.getElementById('editInstStatus').value
        };

        try {
            const res = await apiRequest(`/api/installments/${id}`, 'PUT', data);
            if (res.success) {
                showToast('תשלומים עודכנו! ✅');
                closeModal('modalEditInstallment');
                fetchAllData();
            }
        } catch (error) {
            showToast('שגיאה בעדכון', 'error');
        }
    }

    async function deleteInstallment() {
        const id = document.getElementById('editInstId').value;
        if (!id) {
            showToast('שגיאה: לא נמצא מזהה', 'error');
            return;
        }
        
        if (!confirm('למחוק את התשלומים?')) return;

        try {
            const res = await apiRequest(`/api/installments/${id}`, 'DELETE');
            if (res.success) {
                showToast('תשלומים נמחקו! 🗑️');
                closeModal('modalEditInstallment');
                fetchAllData();
            }
        } catch (error) {
            showToast('שגיאה במחיקה', 'error');
        }
    }

    // ========================================
    // LOANS - SIMPLIFIED
    // ========================================

    function openAddLoan() {
        document.getElementById('formAddLoan').reset();
        
        // הסתר פרטים נוספים כברירת מחדל
        const detailsSection = document.getElementById('addLoanDetailsSection');
        const expandIcon = document.getElementById('addLoanExpandIcon');
        const expandBtn = expandIcon?.closest('.exp-btn-expand');
        
        if (detailsSection) detailsSection.classList.add('hidden');
        if (expandIcon) expandIcon.textContent = '▼';
        if (expandBtn) expandBtn.classList.remove('expanded');
        
        // תאריך ברירת מחדל - היום
        document.getElementById('addLoanStart').value = new Date().toISOString().split('T')[0];
        
        openModal('modalAddLoan');
    }

    function calcLoan() {
        const amount = parseFloat(document.getElementById('addLoanAmount').value) || 0;
        const months = parseInt(document.getElementById('addLoanMonths').value) || 1;
        const monthly = amount / months;
        document.getElementById('addLoanMonthly').value = monthly.toFixed(2);
    }

    async function saveLoan(e) {
        e.preventDefault();

        const loanName = document.getElementById('addLoanName').value;
        const monthlyPayment = parseFloat(document.getElementById('addLoanMonthly').value);
        
        // שדות אופציונליים
        const lender = document.getElementById('addLoanLender').value || null;
        const originalAmount = parseFloat(document.getElementById('addLoanAmount').value) || null;
        const totalMonths = parseInt(document.getElementById('addLoanMonths').value) || null;
        const interestRate = parseFloat(document.getElementById('addLoanInterest').value) || null;
        const startDate = document.getElementById('addLoanStart').value || new Date().toISOString().split('T')[0];
        const cardId = document.getElementById('addLoanCard').value || null;
        const notes = document.getElementById('addLoanNotes').value || null;

        // חישוב תאריך סיום אם יש תקופה
        let endDate = null;
        if (totalMonths) {
            const start = new Date(startDate);
            start.setMonth(start.getMonth() + totalMonths);
            endDate = start.toISOString().split('T')[0];
        }

        const data = {
            loan_name: loanName,
            lender: lender,
            original_amount: originalAmount,
            total_months: totalMonths,
            monthly_payment: monthlyPayment,
            interest_rate: interestRate,
            start_date: startDate,
            end_date: endDate,
            remaining_amount: originalAmount,
            remaining_months: totalMonths,
            card_id: cardId,
            notes: notes
        };

        try {
            const res = await apiRequest('/api/loans', 'POST', data);
            if (res.success) {
                showToast('הלוואה נוספה בהצלחה! ✅');
                closeModal('modalAddLoan');
                fetchAllData();
            } else {
                showToast(res.error || 'שגיאה', 'error');
            }
        } catch (error) {
            showToast('שגיאה בשמירה', 'error');
        }
    }

    function editLoan(id) {
        const loan = state.loans.find(l => l.id === id);
        if (!loan) {
            showToast('הלוואה לא נמצאה', 'error');
            return;
        }

        document.getElementById('editLoanId').value = id;
        document.getElementById('editLoanName').value = loan.loan_name;
        document.getElementById('editLoanMonthly').value = loan.monthly_payment;
        document.getElementById('editLoanLender').value = loan.lender || '';
        document.getElementById('editLoanRemaining').value = loan.remaining_amount || '';
        document.getElementById('editLoanMonthsLeft').value = loan.remaining_months || '';
        document.getElementById('editLoanStatus').value = loan.status;
        document.getElementById('editLoanNotes').value = loan.notes || '';

        // הסתר פרטים נוספים כברירת מחדל
        const detailsSection = document.getElementById('editLoanDetailsSection');
        const expandIcon = document.getElementById('editLoanExpandIcon');
        const expandBtn = expandIcon?.closest('.exp-btn-expand');
        
        if (detailsSection) detailsSection.classList.add('hidden');
        if (expandIcon) expandIcon.textContent = '▼';
        if (expandBtn) expandBtn.classList.remove('expanded');

        openModal('modalEditLoan');
    }

    async function updateLoan(e) {
        e.preventDefault();

        const id = document.getElementById('editLoanId').value;
        const loan = state.loans.find(l => l.id === id);

        const data = {
            loan_name: document.getElementById('editLoanName').value,
            lender: document.getElementById('editLoanLender').value || null,
            original_amount: loan.original_amount,
            total_months: loan.total_months,
            monthly_payment: parseFloat(document.getElementById('editLoanMonthly').value),
            interest_rate: loan.interest_rate,
            start_date: loan.start_date,
            end_date: loan.end_date,
            remaining_amount: parseFloat(document.getElementById('editLoanRemaining').value) || null,
            remaining_months: parseInt(document.getElementById('editLoanMonthsLeft').value) || null,
            status: document.getElementById('editLoanStatus').value,
            card_id: loan.card_id,
            category: loan.category,
            notes: document.getElementById('editLoanNotes').value || null
        };

        try {
            const res = await apiRequest(`/api/loans/${id}`, 'PUT', data);
            if (res.success) {
                showToast('הלוואה עודכנה! ✅');
                closeModal('modalEditLoan');
                fetchAllData();
            }
        } catch (error) {
            showToast('שגיאה בעדכון', 'error');
        }
    }

    async function deleteLoan() {
        const id = document.getElementById('editLoanId').value;
        if (!id) {
            showToast('שגיאה: לא נמצא מזהה', 'error');
            return;
        }
        
        if (!confirm('למחוק את ההלוואה?')) return;

        try {
            const res = await apiRequest(`/api/loans/${id}`, 'DELETE');
            if (res.success) {
                showToast('הלוואה נמחקה! 🗑️');
                closeModal('modalEditLoan');
                fetchAllData();
            }
        } catch (error) {
            showToast('שגיאה במחיקה', 'error');
        }
    }

    // ========================================
    // TOAST
    // ========================================

    function showToast(message, type = 'success') {
        const toast = document.getElementById('expToast');
        toast.textContent = message;
        toast.className = 'exp-toast ' + type + ' show';

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ========================================
    // GLOBAL API
    // ========================================

    window.FlowEcoExp = {
        changeMonth,
        goToCurrentMonth,
        switchTab,
        applyFilters,
        resetFilters,
        prevPage,
        nextPage,
        closeModal,
        openAddExpense,
        toggleCardSelect,
        toggleRecurring,
        saveExpense,
        editExpense,
        updateExpense,
        deleteExpense,
        openAddInstallment,
        calcInstallment,
        saveInstallment,
        editInstallment,
        updateInstallment,
        deleteInstallment,
        openAddLoan,
        calcLoan,
        saveLoan,
        editLoan,
        updateLoan,
        deleteLoan,
        toggleLoanDetails,
        openQuickAddCard,
        saveQuickCard
    };

    // ========================================
    // INIT
    // ========================================

    fetchAllData();

    console.log('💸 FlowEco Expenses v2 Ready!');

})();