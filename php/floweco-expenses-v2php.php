<?php
add_shortcode("floweco_expenses_v2", function () {
    return '
<div class="expenses-page-v2">

    <!-- HEADER -->
    <div class="exp-header">
        <div class="exp-header-top">
            <div>
                <h1 class="exp-title">💸 ההוצאות שלי</h1>
                <p class="exp-subtitle">ניהול הוצאות, תשלומים והלוואות</p>
            </div>
            <div class="exp-header-buttons">
                <button class="exp-btn exp-btn-primary" onclick="FlowEcoExp.openAddExpense()">
                    <span>➕</span>
                    <span>הוצאה</span>
                </button>
                
                <button class="exp-btn exp-btn-tertiary" onclick="FlowEcoExp.openAddLoan()">
                    <span>🏦</span>
                    <span>הלוואה</span>
                </button>
            </div>
        </div>

       <!-- Month Selector -->
<div class="exp-month-selector">
    <button class="exp-month-btn" onclick="FlowEcoExp.changeMonth(-1)">◀</button>
    <div class="exp-month-display">
        <span class="exp-month-label" id="expMonthLabel">נובמבר 2025</span>
        <button class="exp-btn-today hidden" id="expBtnToday" onclick="FlowEcoExp.goToCurrentMonth()">היום</button>
    </div>
    <button class="exp-month-btn" id="expNextBtn" onclick="FlowEcoExp.changeMonth(1)">▶</button>
</div>

        <!-- Summary Cards -->
        <div class="exp-summary-cards">
            <div class="exp-summary-card exp-card-total">
                <div class="exp-card-icon">💰</div>
                <div class="exp-card-content">
                    <span class="exp-card-label">סה"כ החודש</span>
                    <span class="exp-card-value" id="expTotalMonth">₪0</span>
                </div>
            </div>
            <div class="exp-summary-card exp-card-regular">
                <div class="exp-card-icon">🛒</div>
                <div class="exp-card-content">
                    <span class="exp-card-label">הוצאות שוטפות</span>
                    <span class="exp-card-value" id="expRegular">₪0</span>
                </div>
            </div>
            <div class="exp-summary-card exp-card-installments">
                <div class="exp-card-icon">💳</div>
                <div class="exp-card-content">
                    <span class="exp-card-label">תשלומים</span>
                    <span class="exp-card-value" id="expInstallments">₪0</span>
                </div>
            </div>
            <div class="exp-summary-card exp-card-loans">
                <div class="exp-card-icon">🏦</div>
                <div class="exp-card-content">
                    <span class="exp-card-label">הלוואות</span>
                    <span class="exp-card-value" id="expLoans">₪0</span>
                </div>
            </div>
        </div>

        <!-- Cards Breakdown -->
        <div class="exp-cards-breakdown" id="expCardsBreakdown">
            <h3 class="exp-section-title">📊 פילוח לפי כרטיס</h3>
            <div class="exp-cards-list" id="expCardsList">
                <!-- יתמלא דינמית -->
            </div>
        </div>
    </div>

    <!-- TABS -->
    <div class="exp-tabs">
        <button class="exp-tab active" data-tab="regular" onclick="FlowEcoExp.switchTab(\'regular\')">
            🛒 שוטף
        </button>
        <button class="exp-tab" data-tab="installments" onclick="FlowEcoExp.switchTab(\'installments\')">
            💳 תשלומים
        </button>
        <button class="exp-tab" data-tab="loans" onclick="FlowEcoExp.switchTab(\'loans\')">
            🏦 הלוואות
        </button>
    </div>

    <!-- FILTERS -->
    <div class="exp-filters">
        <div class="exp-filter-group">
            <input type="text" class="exp-filter-input" id="expSearch" placeholder="🔍 חיפוש..." oninput="FlowEcoExp.applyFilters()">
        </div>
        <div class="exp-filter-group">
            <select class="exp-filter-select" id="expCategory" onchange="FlowEcoExp.applyFilters()">
                <option value="">כל הקטגוריות</option>
                <!-- יתמלא דינמית מה-API -->
            </select>
        </div>
        <div class="exp-filter-group">
            <select class="exp-filter-select" id="expCard" onchange="FlowEcoExp.applyFilters()">
                <option value="">כל הכרטיסים</option>
                <!-- יתמלא דינמית -->
            </select>
        </div>
        <div class="exp-filter-group">
            <select class="exp-filter-select" id="expSort" onchange="FlowEcoExp.applyFilters()">
                <option value="date-desc">תאריך (חדש לישן)</option>
                <option value="date-asc">תאריך (ישן לחדש)</option>
                <option value="amount-desc">סכום (גבוה לנמוך)</option>
                <option value="amount-asc">סכום (נמוך לגבוה)</option>
            </select>
        </div>
        <button class="exp-btn-reset" onclick="FlowEcoExp.resetFilters()">🔄 איפוס</button>
    </div>

    <!-- CONTENT SECTIONS -->
    
    <!-- Regular Expenses -->
    <div class="exp-section" id="sectionRegular">
        <div class="exp-section-header">
            <h3>🛒 הוצאות שוטפות</h3>
            <span class="exp-count" id="expRegularCount">0 פריטים</span>
        </div>
        <div class="exp-list" id="expRegularList">
            <!-- יתמלא דינמית -->
        </div>
        <div class="exp-pagination" id="expRegularPagination">
            <button class="exp-page-btn" onclick="FlowEcoExp.prevPage(\'regular\')">◄ הקודם</button>
            <span class="exp-page-info" id="expRegularPageInfo">עמוד 1 מתוך 1</span>
            <button class="exp-page-btn" onclick="FlowEcoExp.nextPage(\'regular\')">הבא ►</button>
        </div>
    </div>

    <!-- Installments -->
    <div class="exp-section hidden" id="sectionInstallments">
        <div class="exp-section-header">
            <h3>💳 תשלומים פעילים</h3>
            <span class="exp-count" id="expInstCount">0 פריטים</span>
        </div>
        <div class="exp-list" id="expInstList">
            <!-- יתמלא דינמית -->
        </div>
    </div>

    <!-- Loans -->
    <div class="exp-section hidden" id="sectionLoans">
        <div class="exp-section-header">
            <h3>🏦 הלוואות פעילות</h3>
            <span class="exp-count" id="expLoansCount">0 פריטים</span>
        </div>
        <div class="exp-list" id="expLoansList">
            <!-- יתמלא דינמית -->
        </div>
    </div>

</div>

<!-- ========== MODALS ========== -->

<!-- Add Expense Modal -->
<div class="exp-modal-overlay" id="modalAddExpense">
    <div class="exp-modal">
        <div class="exp-modal-header">
            <h2 class="exp-modal-title">➕ הוסף הוצאה</h2>
            <button class="exp-modal-close" onclick="FlowEcoExp.closeModal(\'modalAddExpense\')">&times;</button>
        </div>
        <form id="formAddExpense" onsubmit="FlowEcoExp.saveExpense(event)">
            <div class="exp-form-grid">
                <div class="exp-form-group">
                    <label class="exp-form-label">💰 סכום *</label>
                    <div class="exp-input-wrapper">
                        <span class="exp-input-prefix">₪</span>
                        <input type="number" step="0.01" class="exp-form-input" id="addExpAmount" required>
                    </div>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📂 קטגוריה *</label>
                    <select class="exp-form-select" id="addExpCategory" required>
                        <option value="">בחר קטגוריה...</option>
                        <!-- יתמלא דינמית מה-API -->
                    </select>
                </div>
                <div class="exp-form-group full-width">
                    <label class="exp-form-label">📝 תיאור</label>
                    <input type="text" class="exp-form-input" id="addExpDescription" placeholder="לדוגמה: קניות בסופר">
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📅 תאריך *</label>
                    <input type="date" class="exp-form-input" id="addExpDate" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💳 אמצעי תשלום</label>
                    <select class="exp-form-select" id="addExpPayment" onchange="FlowEcoExp.toggleCardSelect(\'add\')">
                        <option value="cash">💵 מזומן</option>
                        <option value="card">💳 כרטיס אשראי</option>
                        <option value="bank">🏦 העברה בנקאית</option>
                    </select>
                </div>
                <div class="exp-form-group hidden" id="addExpCardGroup">
                    <label class="exp-form-label">💳 בחר כרטיס</label>
                    <div class="exp-card-select-wrapper">
                        <select class="exp-form-select" id="addExpCard">
                            <option value="">ללא</option>
                            <!-- יתמלא דינמית -->
                        </select>
                        <button type="button" class="exp-btn-add-card" onclick="FlowEcoExp.openQuickAddCard()" title="הוסף כרטיס חדש">➕</button>
                    </div>
                </div>
                <div class="exp-form-group hidden" id="addExpInstallmentsGroup">
                    <label class="exp-form-label">🔢 מספר תשלומים</label>
                    <input type="number" min="1" max="36" value="1" class="exp-form-input" id="addExpInstallments">
                    <small style="color: var(--exp-text-muted); font-size: 0.75rem;">1 = תשלום רגיל, 2+ = פריסה לתשלומים</small>
                </div>
                <div class="exp-form-group full-width">
                    <label class="exp-checkbox-label">
                        <input type="checkbox" id="addExpRecurring" onchange="FlowEcoExp.toggleRecurring(\'add\')">
                        <span class="exp-checkbox-text">🔄 הוצאה חוזרת</span>
                    </label>
                </div>
                <div class="exp-form-group hidden" id="addExpRecurringGroup">
                    <label class="exp-form-label">תדירות</label>
                    <select class="exp-form-select" id="addExpRecurringType">
                        <option value="monthly">חודשי</option>
                        <option value="weekly">שבועי</option>
                        <option value="yearly">שנתי</option>
                    </select>
                </div>
            </div>
            <div class="exp-modal-footer">
                <button type="button" class="exp-btn exp-btn-cancel" onclick="FlowEcoExp.closeModal(\'modalAddExpense\')">ביטול</button>
                <button type="submit" class="exp-btn exp-btn-save">💾 שמור</button>
            </div>
        </form>
    </div>
</div>

<!-- Quick Add Card Modal -->
<div class="exp-modal-overlay" id="modalQuickAddCard">
    <div class="exp-modal exp-modal-small">
        <div class="exp-modal-header">
            <h2 class="exp-modal-title">💳 הוסף כרטיס חדש</h2>
            <button class="exp-modal-close" onclick="FlowEcoExp.closeModal(\'modalQuickAddCard\')">&times;</button>
        </div>
        <form id="formQuickAddCard" onsubmit="FlowEcoExp.saveQuickCard(event)">
            <div class="exp-form-grid">
                <div class="exp-form-group full-width">
                    <label class="exp-form-label">💳 שם הכרטיס *</label>
                    <input type="text" class="exp-form-input" id="quickCardName" placeholder="לדוגמה: ויזה כאל" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">🔢 4 ספרות אחרונות</label>
                    <input type="text" class="exp-form-input" id="quickCardDigits" maxlength="4" placeholder="1234">
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">🎨 צבע</label>
                    <div class="exp-color-picker" id="quickCardColorPicker">
                        <div class="exp-color-option selected" data-color="#667eea" style="background: #667eea;"></div>
                        <div class="exp-color-option" data-color="#EC4899" style="background: #EC4899;"></div>
                        <div class="exp-color-option" data-color="#10B981" style="background: #10B981;"></div>
                        <div class="exp-color-option" data-color="#F59E0B" style="background: #F59E0B;"></div>
                        <div class="exp-color-option" data-color="#3B82F6" style="background: #3B82F6;"></div>
                        <div class="exp-color-option" data-color="#8B5CF6" style="background: #8B5CF6;"></div>
                        <div class="exp-color-option" data-color="#EF4444" style="background: #EF4444;"></div>
                        <div class="exp-color-option" data-color="#06B6D4" style="background: #06B6D4;"></div>
                    </div>
                    <input type="hidden" id="quickCardColor" value="#667eea">
                </div>
            </div>
            <div class="exp-modal-footer">
                <button type="button" class="exp-btn exp-btn-cancel" onclick="FlowEcoExp.closeModal(\'modalQuickAddCard\')">ביטול</button>
                <button type="submit" class="exp-btn exp-btn-save">💾 הוסף כרטיס</button>
            </div>
        </form>
    </div>
</div>

<!-- Add Installment Modal -->
<div class="exp-modal-overlay" id="modalAddInstallment">
    <div class="exp-modal">
        <div class="exp-modal-header">
            <h2 class="exp-modal-title">💳 הוסף תשלומים</h2>
            <button class="exp-modal-close" onclick="FlowEcoExp.closeModal(\'modalAddInstallment\')">&times;</button>
        </div>
        <form id="formAddInstallment" onsubmit="FlowEcoExp.saveInstallment(event)">
            <div class="exp-form-grid">
                <div class="exp-form-group full-width">
                    <label class="exp-form-label">📝 תיאור הרכישה *</label>
                    <input type="text" class="exp-form-input" id="addInstDescription" placeholder="לדוגמה: טלוויזיה 55 אינץ" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💰 סכום כולל *</label>
                    <div class="exp-input-wrapper">
                        <span class="exp-input-prefix">₪</span>
                        <input type="number" step="0.01" class="exp-form-input" id="addInstAmount" required oninput="FlowEcoExp.calcInstallment()">
                    </div>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">🔢 מספר תשלומים *</label>
                    <input type="number" min="2" max="60" class="exp-form-input" id="addInstCount" required oninput="FlowEcoExp.calcInstallment()">
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💵 תשלום חודשי</label>
                    <div class="exp-calculated-value" id="addInstMonthly">₪0</div>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📅 תאריך תשלום ראשון *</label>
                    <input type="date" class="exp-form-input" id="addInstDate" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📂 קטגוריה</label>
                    <select class="exp-form-select" id="addInstCategory">
                        <!-- יתמלא דינמית מה-API -->
                    </select>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💳 כרטיס אשראי</label>
                    <div class="exp-card-select-wrapper">
                        <select class="exp-form-select" id="addInstCard">
                            <!-- יתמלא דינמית -->
                        </select>
                        <button type="button" class="exp-btn-add-card" onclick="FlowEcoExp.openQuickAddCard()" title="הוסף כרטיס חדש">➕</button>
                    </div>
                </div>
            </div>
            <div class="exp-modal-footer">
                <button type="button" class="exp-btn exp-btn-cancel" onclick="FlowEcoExp.closeModal(\'modalAddInstallment\')">ביטול</button>
                <button type="submit" class="exp-btn exp-btn-save">💾 שמור</button>
            </div>
        </form>
    </div>
</div>

<!-- Add Loan Modal -->
<div class="exp-modal-overlay" id="modalAddLoan">
    <div class="exp-modal">
        <div class="exp-modal-header">
            <h2 class="exp-modal-title">🏦 הוסף הלוואה</h2>
            <button class="exp-modal-close" onclick="FlowEcoExp.closeModal(\'modalAddLoan\')">&times;</button>
        </div>
        <form id="formAddLoan" onsubmit="FlowEcoExp.saveLoan(event)">
            <div class="exp-form-grid">
                <div class="exp-form-group">
                    <label class="exp-form-label">📝 שם ההלוואה *</label>
                    <input type="text" class="exp-form-input" id="addLoanName" placeholder="לדוגמה: הלוואת רכב" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">🏛️ גוף מלווה</label>
                    <input type="text" class="exp-form-input" id="addLoanLender" placeholder="לדוגמה: בנק הפועלים">
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💰 סכום ההלוואה *</label>
                    <div class="exp-input-wrapper">
                        <span class="exp-input-prefix">₪</span>
                        <input type="number" step="0.01" class="exp-form-input" id="addLoanAmount" required oninput="FlowEcoExp.calcLoan()">
                    </div>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📆 תקופה (חודשים) *</label>
                    <input type="number" min="1" max="360" class="exp-form-input" id="addLoanMonths" required oninput="FlowEcoExp.calcLoan()">
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💵 החזר חודשי *</label>
                    <div class="exp-input-wrapper">
                        <span class="exp-input-prefix">₪</span>
                        <input type="number" step="0.01" class="exp-form-input" id="addLoanMonthly" required>
                    </div>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📊 ריבית שנתית (%)</label>
                    <input type="number" step="0.01" class="exp-form-input" id="addLoanInterest" placeholder="לדוגמה: 4.5">
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📅 תאריך התחלה *</label>
                    <input type="date" class="exp-form-input" id="addLoanStart" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💳 משויך לכרטיס</label>
                    <div class="exp-card-select-wrapper">
                        <select class="exp-form-select" id="addLoanCard">
                            <option value="">ללא</option>
                            <!-- יתמלא דינמית -->
                        </select>
                        <button type="button" class="exp-btn-add-card" onclick="FlowEcoExp.openQuickAddCard()" title="הוסף כרטיס חדש">➕</button>
                    </div>
                </div>
                <div class="exp-form-group full-width">
                    <label class="exp-form-label">📝 הערות</label>
                    <textarea class="exp-form-textarea" id="addLoanNotes" rows="2" placeholder="הערות נוספות..."></textarea>
                </div>
            </div>
            <div class="exp-modal-footer">
                <button type="button" class="exp-btn exp-btn-cancel" onclick="FlowEcoExp.closeModal(\'modalAddLoan\')">ביטול</button>
                <button type="submit" class="exp-btn exp-btn-save">💾 שמור</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Expense Modal -->
<div class="exp-modal-overlay" id="modalEditExpense">
    <div class="exp-modal">
        <div class="exp-modal-header">
            <h2 class="exp-modal-title">✏️ ערוך הוצאה</h2>
            <button class="exp-modal-close" onclick="FlowEcoExp.closeModal(\'modalEditExpense\')">&times;</button>
        </div>
        <form id="formEditExpense" onsubmit="FlowEcoExp.updateExpense(event)">
            <input type="hidden" id="editExpId">
            <div class="exp-form-grid">
                <div class="exp-form-group">
                    <label class="exp-form-label">💰 סכום *</label>
                    <div class="exp-input-wrapper">
                        <span class="exp-input-prefix">₪</span>
                        <input type="number" step="0.01" class="exp-form-input" id="editExpAmount" required>
                    </div>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📂 קטגוריה *</label>
                    <select class="exp-form-select" id="editExpCategory" required>
                        <!-- יתמלא דינמית מה-API -->
                    </select>
                </div>
                <div class="exp-form-group full-width">
                    <label class="exp-form-label">📝 תיאור</label>
                    <input type="text" class="exp-form-input" id="editExpDescription">
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📅 תאריך *</label>
                    <input type="date" class="exp-form-input" id="editExpDate" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💳 אמצעי תשלום</label>
                    <select class="exp-form-select" id="editExpPayment" onchange="FlowEcoExp.toggleCardSelect(\'edit\')">
                        <option value="cash">💵 מזומן</option>
                        <option value="card">💳 כרטיס אשראי</option>
                        <option value="bank">🏦 העברה בנקאית</option>
                    </select>
                </div>
                <div class="exp-form-group hidden" id="editExpCardGroup">
                    <label class="exp-form-label">💳 בחר כרטיס</label>
                    <div class="exp-card-select-wrapper">
                        <select class="exp-form-select" id="editExpCard">
                            <!-- יתמלא דינמית -->
                        </select>
                        <button type="button" class="exp-btn-add-card" onclick="FlowEcoExp.openQuickAddCard()" title="הוסף כרטיס חדש">➕</button>
                    </div>
                </div>
            </div>
            <div class="exp-modal-footer">
                <button type="button" class="exp-btn exp-btn-danger" onclick="FlowEcoExp.deleteExpense()">🗑️ מחק</button>
                <button type="button" class="exp-btn exp-btn-cancel" onclick="FlowEcoExp.closeModal(\'modalEditExpense\')">ביטול</button>
                <button type="submit" class="exp-btn exp-btn-save">💾 שמור</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Installment Modal -->
<div class="exp-modal-overlay" id="modalEditInstallment">
    <div class="exp-modal">
        <div class="exp-modal-header">
            <h2 class="exp-modal-title">✏️ ערוך תשלומים</h2>
            <button class="exp-modal-close" onclick="FlowEcoExp.closeModal(\'modalEditInstallment\')">&times;</button>
        </div>
        <form id="formEditInstallment" onsubmit="FlowEcoExp.updateInstallment(event)">
            <input type="hidden" id="editInstId">
            <div class="exp-form-grid">
                <div class="exp-form-group full-width">
                    <label class="exp-form-label">📝 תיאור</label>
                    <input type="text" class="exp-form-input" id="editInstDescription" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💰 סכום כולל</label>
                    <div class="exp-input-wrapper">
                        <span class="exp-input-prefix">₪</span>
                        <input type="number" step="0.01" class="exp-form-input" id="editInstAmount" required>
                    </div>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">🔢 תשלומים שנותרו</label>
                    <input type="number" min="0" class="exp-form-input" id="editInstRemaining" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📊 סטטוס</label>
                    <select class="exp-form-select" id="editInstStatus">
                        <option value="active">פעיל</option>
                        <option value="completed">הושלם</option>
                    </select>
                </div>
            </div>
            <div class="exp-modal-footer">
                <button type="button" class="exp-btn exp-btn-danger" onclick="FlowEcoExp.deleteInstallment()">🗑️ מחק</button>
                <button type="button" class="exp-btn exp-btn-cancel" onclick="FlowEcoExp.closeModal(\'modalEditInstallment\')">ביטול</button>
                <button type="submit" class="exp-btn exp-btn-save">💾 שמור</button>
            </div>
        </form>
    </div>
</div>

<!-- Edit Loan Modal -->
<div class="exp-modal-overlay" id="modalEditLoan">
    <div class="exp-modal">
        <div class="exp-modal-header">
            <h2 class="exp-modal-title">✏️ ערוך הלוואה</h2>
            <button class="exp-modal-close" onclick="FlowEcoExp.closeModal(\'modalEditLoan\')">&times;</button>
        </div>
        <form id="formEditLoan" onsubmit="FlowEcoExp.updateLoan(event)">
            <input type="hidden" id="editLoanId">
            <div class="exp-form-grid">
                <div class="exp-form-group">
                    <label class="exp-form-label">📝 שם ההלוואה</label>
                    <input type="text" class="exp-form-input" id="editLoanName" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">🏛️ גוף מלווה</label>
                    <input type="text" class="exp-form-input" id="editLoanLender">
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💰 יתרה לסילוק</label>
                    <div class="exp-input-wrapper">
                        <span class="exp-input-prefix">₪</span>
                        <input type="number" step="0.01" class="exp-form-input" id="editLoanRemaining" required>
                    </div>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📆 חודשים שנותרו</label>
                    <input type="number" min="0" class="exp-form-input" id="editLoanMonthsLeft" required>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">💵 החזר חודשי</label>
                    <div class="exp-input-wrapper">
                        <span class="exp-input-prefix">₪</span>
                        <input type="number" step="0.01" class="exp-form-input" id="editLoanMonthly" required>
                    </div>
                </div>
                <div class="exp-form-group">
                    <label class="exp-form-label">📊 סטטוס</label>
                    <select class="exp-form-select" id="editLoanStatus">
                        <option value="active">פעיל</option>
                        <option value="completed">הושלם</option>
                    </select>
                </div>
                <div class="exp-form-group full-width">
                    <label class="exp-form-label">📝 הערות</label>
                    <textarea class="exp-form-textarea" id="editLoanNotes" rows="2"></textarea>
                </div>
            </div>
            <div class="exp-modal-footer">
                <button type="button" class="exp-btn exp-btn-danger" onclick="FlowEcoExp.deleteLoan()">🗑️ מחק</button>
                <button type="button" class="exp-btn exp-btn-cancel" onclick="FlowEcoExp.closeModal(\'modalEditLoan\')">ביטול</button>
                <button type="submit" class="exp-btn exp-btn-save">💾 שמור</button>
            </div>
        </form>
    </div>
</div>

<!-- Toast -->
<div class="exp-toast" id="expToast"></div>

';
});