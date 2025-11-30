<?php
/**
 * FlowEco Incomes v2
 * Shortcode: [floweco_incomes_v2]
 */

function floweco_incomes_v2_shortcode() {
    ob_start();
    ?>
    
    <div class="inc-container" dir="rtl">
        
        <!-- ========== HEADER ========== -->
        <header class="inc-header">
            <div class="inc-header-top">
                <div class="inc-header-info">
                    <h1 class="inc-title">💰 ההכנסות שלי</h1>
                    <p class="inc-subtitle">ניהול הכנסות קבועות וחד-פעמיות</p>
                </div>
                <button class="inc-btn-add" onclick="FlowEcoInc.openAddModal()">
                    <span>➕</span>
                    <span>הכנסה</span>
                </button>
            </div>
            
            <!-- Month Selector -->
<div class="inc-month-selector">
    <button class="inc-month-btn" onclick="FlowEcoInc.changeMonth(-1)">◀</button>
    <div class="inc-month-display">
        <span class="inc-month-label" id="incMonthLabel">נובמבר 2025</span>
        <button class="inc-btn-today hidden" id="incBtnToday" onclick="FlowEcoInc.goToCurrentMonth()">היום</button>
    </div>
    <button class="inc-month-btn" id="incNextBtn" onclick="FlowEcoInc.changeMonth(1)">▶</button>
</div>
        </header>

        <!-- ========== SUMMARY CARDS ========== -->
        <section class="inc-summary">
            <div class="inc-summary-card total">
                <div class="inc-card-icon">💰</div>
                <div class="inc-card-info">
                    <span class="inc-card-label">סה"כ החודש</span>
                    <span class="inc-card-value" id="incTotal">₪0</span>
                </div>
            </div>
            <div class="inc-summary-card recurring">
                <div class="inc-card-icon">🔄</div>
                <div class="inc-card-info">
                    <span class="inc-card-label">הכנסות קבועות</span>
                    <span class="inc-card-value" id="incRecurring">₪0</span>
                </div>
            </div>
            <div class="inc-summary-card onetime">
                <div class="inc-card-icon">💵</div>
                <div class="inc-card-info">
                    <span class="inc-card-label">חד-פעמיות</span>
                    <span class="inc-card-value" id="incOnetime">₪0</span>
                </div>
            </div>
            <div class="inc-summary-card balance">
                <div class="inc-card-icon">📊</div>
                <div class="inc-card-info">
                    <span class="inc-card-label">יתרה צפויה</span>
                    <span class="inc-card-value" id="incBalance">₪0</span>
                </div>
            </div>
        </section>

        <!-- ========== FILTERS ========== -->
        <section class="inc-filters">
            <div class="inc-filter-row">
                <div class="inc-filter-group search">
                    <span class="inc-filter-icon">🔍</span>
                    <input type="text" id="incSearch" class="inc-filter-input" placeholder="חיפוש..." oninput="FlowEcoInc.applyFilters()">
                </div>
                <select id="incCategoryFilter" class="inc-filter-select" onchange="FlowEcoInc.applyFilters()">
                    <option value="">כל הקטגוריות</option>
                    <!-- יתמלא דינמית מה-API -->
                </select>
                <select id="incTypeFilter" class="inc-filter-select" onchange="FlowEcoInc.applyFilters()">
                    <option value="all">כל הסוגים</option>
                    <option value="recurring">🔄 קבוע</option>
                    <option value="onetime">📌 חד-פעמי</option>
                </select>
                <select id="incSort" class="inc-filter-select" onchange="FlowEcoInc.applyFilters()">
                    <option value="date-desc">חדש לישן</option>
                    <option value="date-asc">ישן לחדש</option>
                    <option value="amount-desc">סכום ↓</option>
                    <option value="amount-asc">סכום ↑</option>
                </select>
                <button class="inc-btn-reset" onclick="FlowEcoInc.resetFilters()">🔄 איפוס</button>
            </div>
        </section>

        <!-- ========== INCOMES LIST ========== -->
        <section class="inc-list-section">
            <div class="inc-list-header">
                <h2 class="inc-list-title">📋 רשימת הכנסות</h2>
                <span class="inc-list-count" id="incCount">0 פריטים</span>
            </div>
            
            <div class="inc-list" id="incList">
                <div class="inc-empty">
                    <div class="inc-empty-icon">💰</div>
                    <div class="inc-empty-text">אין הכנסות בחודש זה</div>
                    <div class="inc-empty-hint">לחץ על "הכנסה" להוספת הכנסה חדשה</div>
                </div>
            </div>
            
           <!-- Pagination -->
<div class="inc-pagination">
    <button class="inc-page-btn" id="incPrevBtn" onclick="FlowEcoInc.prevPage()">◄ הקודם</button>
    <span class="inc-page-info" id="incPageInfo">עמוד 1 מתוך 1</span>
    <button class="inc-page-btn" id="incNextPageBtn" onclick="FlowEcoInc.nextPage()">הבא ►</button>
</div>
        </section>
    </div>

    <!-- ========== ADD MODAL ========== -->
    <div class="inc-modal-overlay" id="incAddModal">
        <div class="inc-modal">
            <div class="inc-modal-header">
                <h2 class="inc-modal-title">💰 הוסף הכנסה</h2>
                <button class="inc-modal-close" onclick="FlowEcoInc.closeAddModal()">✕</button>
            </div>
            <form id="incAddForm" onsubmit="FlowEcoInc.submitAdd(event)">
                <div class="inc-modal-body">
                    
                    <div class="inc-form-group">
                        <label class="inc-form-label">💵 סכום <span class="required">*</span></label>
                        <div class="inc-input-prefix">
                            <span class="inc-prefix">₪</span>
                            <input type="number" id="addIncAmount" class="inc-form-input" placeholder="0.00" step="0.01" min="0" required>
                        </div>
                    </div>
                    
                    <div class="inc-form-group">
                        <label class="inc-form-label">📂 קטגוריה <span class="required">*</span></label>
                        <select id="addIncSource" class="inc-form-select" required>
                            <option value="">בחר קטגוריה...</option>
                            <!-- יתמלא דינמית מה-API -->
                        </select>
                    </div>
                    
                    <div class="inc-form-group">
                        <label class="inc-form-label">📅 תאריך <span class="required">*</span></label>
                        <input type="date" id="addIncDate" class="inc-form-input" required>
                    </div>
                    
                    <div class="inc-form-group">
                        <label class="inc-checkbox">
                            <input type="checkbox" id="addIncRecurring" onchange="FlowEcoInc.toggleRecurring('add')">
                            <span>🔄 הכנסה קבועה (חוזרת)</span>
                        </label>
                    </div>
                    
                    <div class="inc-form-group hidden" id="addIncRecurringGroup">
                        <label class="inc-form-label">תדירות</label>
                        <select id="addIncRecurringType" class="inc-form-select">
                            <option value="monthly">חודשי</option>
                            <option value="weekly">שבועי</option>
                            <option value="yearly">שנתי</option>
                        </select>
                    </div>
                    
                </div>
                <div class="inc-modal-footer">
                    <button type="button" class="inc-btn secondary" onclick="FlowEcoInc.closeAddModal()">ביטול</button>
                    <button type="submit" class="inc-btn primary">💾 שמור</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ========== EDIT MODAL ========== -->
    <div class="inc-modal-overlay" id="incEditModal">
        <div class="inc-modal">
            <div class="inc-modal-header">
                <h2 class="inc-modal-title">✏️ ערוך הכנסה</h2>
                <button class="inc-modal-close" onclick="FlowEcoInc.closeEditModal()">✕</button>
            </div>
            <form id="incEditForm" onsubmit="FlowEcoInc.submitEdit(event)">
                <input type="hidden" id="editIncId">
                <div class="inc-modal-body">
                    
                    <div class="inc-form-group">
                        <label class="inc-form-label">💵 סכום <span class="required">*</span></label>
                        <div class="inc-input-prefix">
                            <span class="inc-prefix">₪</span>
                            <input type="number" id="editIncAmount" class="inc-form-input" step="0.01" min="0" required>
                        </div>
                    </div>
                    
                    <div class="inc-form-group">
                        <label class="inc-form-label">📂 קטגוריה <span class="required">*</span></label>
                        <select id="editIncSource" class="inc-form-select" required>
                            <!-- יתמלא דינמית מה-API -->
                        </select>
                    </div>
                    
                    <div class="inc-form-group">
                        <label class="inc-form-label">📅 תאריך <span class="required">*</span></label>
                        <input type="date" id="editIncDate" class="inc-form-input" required>
                    </div>
                    
                    <div class="inc-form-group">
                        <label class="inc-checkbox">
                            <input type="checkbox" id="editIncRecurring" onchange="FlowEcoInc.toggleRecurring('edit')">
                            <span>🔄 הכנסה קבועה (חוזרת)</span>
                        </label>
                    </div>
                    
                    <div class="inc-form-group hidden" id="editIncRecurringGroup">
                        <label class="inc-form-label">תדירות</label>
                        <select id="editIncRecurringType" class="inc-form-select">
                            <option value="monthly">חודשי</option>
                            <option value="weekly">שבועי</option>
                            <option value="yearly">שנתי</option>
                        </select>
                    </div>
                    
                </div>
                <div class="inc-modal-footer">
                    <button type="button" class="inc-btn secondary" onclick="FlowEcoInc.closeEditModal()">ביטול</button>
                    <button type="submit" class="inc-btn primary">💾 שמור שינויים</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Toast -->
    <div class="inc-toast" id="incToast"></div>

    <?php
    return ob_get_clean();
}

add_shortcode('floweco_incomes_v2', 'floweco_incomes_v2_shortcode');
?>