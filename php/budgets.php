<?php
add_shortcode('floweco_budgets_v2', function() {
    return '
<div class="budgets-page-v2">

    <!-- HEADER -->
    <div class="bdg-header">
        <div class="bdg-header-top">
            <div>
                <h1 class="bdg-title">🎯 תקציבים</h1>
                <p class="bdg-subtitle">נהל את התקציבים שלך לפי קטגוריות</p>
            </div>
            <button class="bdg-btn bdg-btn-primary" onclick="FlowEcoBdg.openAddBudget()">
                <span>➕</span>
                <span>תקציב חדש</span>
            </button>
        </div>

        <!-- Summary Cards -->
        <div class="bdg-summary-cards">
            <div class="bdg-summary-card bdg-card-total">
                <div class="bdg-card-icon">💰</div>
                <div class="bdg-card-content">
                    <span class="bdg-card-label">סה"כ תקציבים</span>
                    <span class="bdg-card-value" id="bdgTotalBudgets">₪0</span>
                </div>
            </div>
            <div class="bdg-summary-card bdg-card-spent">
                <div class="bdg-card-icon">💸</div>
                <div class="bdg-card-content">
                    <span class="bdg-card-label">הוצאו החודש</span>
                    <span class="bdg-card-value" id="bdgTotalSpent">₪0</span>
                </div>
            </div>
            <div class="bdg-summary-card bdg-card-remaining">
                <div class="bdg-card-icon">📊</div>
                <div class="bdg-card-content">
                    <span class="bdg-card-label">יתרה זמינה</span>
                    <span class="bdg-card-value" id="bdgRemaining">₪0</span>
                </div>
            </div>
            <div class="bdg-summary-card bdg-card-active">
                <div class="bdg-card-icon">📋</div>
                <div class="bdg-card-content">
                    <span class="bdg-card-label">קטגוריות פעילות</span>
                    <span class="bdg-card-value" id="bdgActiveCount">0</span>
                </div>
            </div>
        </div>
    </div>

    <!-- BUDGETS LIST -->
    <div class="bdg-section">
        <div class="bdg-section-header">
            <h3>📊 התקציבים שלי</h3>
            <span class="bdg-count" id="bdgCount">0 תקציבים</span>
        </div>
        <div class="bdg-list" id="bdgList">
            <!-- יתמלא דינמית -->
        </div>
    </div>

</div>

<!-- ========== ADD BUDGET MODAL ========== -->
<div class="bdg-modal-overlay" id="modalAddBudget">
    <div class="bdg-modal">
        <div class="bdg-modal-header">
            <h2 class="bdg-modal-title">➕ הגדר תקציב חדש</h2>
            <button class="bdg-modal-close" onclick="FlowEcoBdg.closeModal(\'modalAddBudget\')">&times;</button>
        </div>
        <form id="formAddBudget" onsubmit="FlowEcoBdg.saveBudget(event)">
            <div class="bdg-form-grid">
                <div class="bdg-form-group full-width">
                    <label class="bdg-form-label">📂 קטגוריה *</label>
                    <select class="bdg-form-select" id="addBdgCategory" required>
                        <option value="">בחר קטגוריה...</option>
                        <!-- יתמלא דינמית מה-API -->
                    </select>
                </div>
                <div class="bdg-form-group">
                    <label class="bdg-form-label">💰 סכום תקציב *</label>
                    <div class="bdg-input-wrapper">
                        <span class="bdg-input-prefix">₪</span>
                        <input type="number" step="1" min="1" class="bdg-form-input" id="addBdgAmount" placeholder="5000" required>
                    </div>
                </div>
                <div class="bdg-form-group">
                    <label class="bdg-form-label">📅 תקופה *</label>
                    <select class="bdg-form-select" id="addBdgPeriod" required>
                        <option value="חודשי">📅 חודשי</option>
                        <option value="שנתי">📆 שנתי</option>
                    </select>
                </div>
            </div>
            <div class="bdg-modal-footer">
                <button type="button" class="bdg-btn bdg-btn-cancel" onclick="FlowEcoBdg.closeModal(\'modalAddBudget\')">ביטול</button>
                <button type="submit" class="bdg-btn bdg-btn-save">💾 שמור תקציב</button>
            </div>
        </form>
    </div>
</div>

<!-- ========== EDIT BUDGET MODAL ========== -->
<div class="bdg-modal-overlay" id="modalEditBudget">
    <div class="bdg-modal">
        <div class="bdg-modal-header">
            <h2 class="bdg-modal-title">✏️ ערוך תקציב</h2>
            <button class="bdg-modal-close" onclick="FlowEcoBdg.closeModal(\'modalEditBudget\')">&times;</button>
        </div>
        <form id="formEditBudget" onsubmit="FlowEcoBdg.updateBudget(event)">
            <input type="hidden" id="editBdgId">
            <div class="bdg-form-grid">
                <div class="bdg-form-group full-width">
                    <label class="bdg-form-label">📂 קטגוריה</label>
                    <select class="bdg-form-select" id="editBdgCategory" required>
                        <!-- יתמלא דינמית מה-API -->
                    </select>
                </div>
                <div class="bdg-form-group">
                    <label class="bdg-form-label">💰 סכום תקציב *</label>
                    <div class="bdg-input-wrapper">
                        <span class="bdg-input-prefix">₪</span>
                        <input type="number" step="1" min="1" class="bdg-form-input" id="editBdgAmount" required>
                    </div>
                </div>
                <div class="bdg-form-group">
                    <label class="bdg-form-label">📅 תקופה</label>
                    <select class="bdg-form-select" id="editBdgPeriod" required>
                        <option value="חודשי">📅 חודשי</option>
                        <option value="שנתי">📆 שנתי</option>
                    </select>
                </div>
            </div>
            <div class="bdg-modal-footer">
                <button type="button" class="bdg-btn bdg-btn-danger" onclick="FlowEcoBdg.deleteBudget()">🗑️ מחק</button>
                <button type="button" class="bdg-btn bdg-btn-cancel" onclick="FlowEcoBdg.closeModal(\'modalEditBudget\')">ביטול</button>
                <button type="submit" class="bdg-btn bdg-btn-save">💾 שמור</button>
            </div>
        </form>
    </div>
</div>

<!-- Toast -->
<div class="bdg-toast" id="bdgToast"></div>

';
});