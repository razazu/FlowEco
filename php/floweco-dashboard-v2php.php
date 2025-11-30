<?php
/**
 * FlowEco Dashboard v2
 * Shortcode: [floweco_dashboard_v2]
 */

function floweco_dashboard_v2_shortcode() {
    ob_start();
    ?>
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    
    <div class="dash-container" dir="rtl">
        
        <!-- ========== HEADER ========== -->
        <header class="dash-header">
            <div class="dash-header-content">
                <div class="dash-greeting">
                    <h1 class="dash-title">שלום, <span id="dashUserName">משתמש</span> 👋</h1>
                    <p class="dash-subtitle" id="dashDate">טוען...</p>
                </div>
                <div class="dash-header-actions">
                    <button class="dash-btn-refresh" onclick="FlowEcoDash.refresh()" title="רענן נתונים">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                    </button>
                </div>
            </div>
        </header>

        <!-- ========== SUMMARY CARDS ========== -->
        <section class="dash-summary">
            <div class="dash-summary-card income">
                <div class="dash-card-icon">💰</div>
                <div class="dash-card-info">
                    <span class="dash-card-label">הכנסות החודש</span>
                    <span class="dash-card-value" id="dashTotalIncome">₪0</span>
                </div>
            </div>
            <div class="dash-summary-card expenses">
                <div class="dash-card-icon">💸</div>
                <div class="dash-card-info">
                    <span class="dash-card-label">הוצאות החודש</span>
                    <span class="dash-card-value" id="dashTotalExpenses">₪0</span>
                </div>
            </div>
            <div class="dash-summary-card balance">
                <div class="dash-card-icon">📊</div>
                <div class="dash-card-info">
                    <span class="dash-card-label">יתרה</span>
                    <span class="dash-card-value" id="dashBalance">₪0</span>
                </div>
            </div>
            <div class="dash-summary-card savings">
                <div class="dash-card-icon">🎯</div>
                <div class="dash-card-info">
                    <span class="dash-card-label">אחוז חיסכון</span>
                    <span class="dash-card-value" id="dashSavingsPercent">0%</span>
                </div>
            </div>
        </section>

        <!-- ========== QUICK ACTIONS ========== -->
        <section class="dash-actions">
            <button class="dash-action-btn expense" onclick="FlowEcoDash.openExpenseModal()">
                <span class="dash-action-icon">💸</span>
                <span class="dash-action-text">הוצאה</span>
            </button>
            <button class="dash-action-btn income" onclick="FlowEcoDash.openIncomeModal()">
                <span class="dash-action-icon">💰</span>
                <span class="dash-action-text">הכנסה</span>
            </button>
            <a href="/ai-advisor" class="dash-action-btn ai">
                <span class="dash-action-icon">🤖</span>
                <span class="dash-action-text">יועץ AI</span>
            </a>
            <a href="/expenses" class="dash-action-btn view">
                <span class="dash-action-icon">📋</span>
                <span class="dash-action-text">כל ההוצאות</span>
            </a>
        </section>

        <!-- ========== MAIN GRID ========== -->
        <div class="dash-grid">
            
            <!-- LEFT: AI Insights -->
            <section class="dash-ai-section">
                <div class="dash-section-header">
                    <h2 class="dash-section-title">
                        <span class="dash-ai-badge">AI</span>
                        תובנות חכמות
                    </h2>
                </div>
                
                <!-- Loading -->
                <div class="dash-ai-loading" id="aiLoading">
                    <div class="dash-ai-spinner"></div>
                    <p>מנתח את הנתונים שלך...</p>
                </div>
                
                <!-- Error -->
                <div class="dash-ai-error" id="aiError" style="display: none;">
                    <span class="dash-ai-error-icon">⚠️</span>
                    <p id="aiErrorMessage">שגיאה בטעינת נתונים</p>
                    <button class="dash-btn-retry" onclick="FlowEcoDash.loadInsights()">נסה שוב</button>
                </div>
                
                <!-- Insights Grid -->
                <div class="dash-ai-grid" id="aiInsightsGrid" style="display: none;"></div>
                
                <!-- AI Actions -->
                <div class="dash-ai-actions" id="aiActions" style="display: none;">
                    <a href="/ai-advisor" class="dash-ai-btn primary">
                        <span>💬</span>
                        <span>שוחח עם היועץ</span>
                    </a>
                    <button class="dash-ai-btn secondary" onclick="FlowEcoDash.loadInsights()">
                        <span>🔄</span>
                        <span>רענן</span>
                    </button>
                </div>
            </section>

            <!-- RIGHT: Charts & Recent -->
            <section class="dash-charts-section">
                
                <!-- Charts Row -->
                <div class="dash-charts-row">
                    <!-- Pie Chart -->
                    <div class="dash-chart-card">
                        <h3 class="dash-chart-title">📊 התפלגות הוצאות</h3>
                        <div class="dash-chart-wrapper">
                            <canvas id="dashPieChart"></canvas>
                            <div class="dash-chart-empty" id="pieChartEmpty" style="display: none;">
                                <span class="dash-empty-icon">📊</span>
                                <p>אין נתונים להצגה</p>
                                <a href="/expenses" class="dash-empty-btn">הוסף הוצאה</a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Bar Chart -->
                    <div class="dash-chart-card">
                        <h3 class="dash-chart-title" id="barChartTitle">📈 מעקב חודשי</h3>
                        <div class="dash-chart-wrapper">
                            <canvas id="dashBarChart"></canvas>
                            <div class="dash-chart-empty" id="barChartEmpty" style="display: none;">
                                <span class="dash-empty-icon">📈</span>
                                <p>אין היסטוריה</p>
                                <a href="/incomes" class="dash-empty-btn">הוסף הכנסה</a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Expenses -->
                <div class="dash-recent-card">
                    <div class="dash-recent-header">
                        <h3 class="dash-chart-title">🧾 הוצאות אחרונות</h3>
                        <a href="/expenses" class="dash-view-all">צפה בהכל ←</a>
                    </div>
                    <div class="dash-recent-list" id="recentExpensesList">
                        <div class="dash-recent-loading">טוען...</div>
                    </div>
                </div>
            </section>
        </div>
    </div>

    <!-- ========== EXPENSE MODAL ========== -->
    <div class="dash-modal-overlay" id="expenseModal">
        <div class="dash-modal">
            <div class="dash-modal-header">
                <h2 class="dash-modal-title">💸 הוסף הוצאה</h2>
                <button class="dash-modal-close" onclick="FlowEcoDash.closeExpenseModal()">✕</button>
            </div>
            <form id="expenseForm" onsubmit="FlowEcoDash.submitExpense(event)">
                <div class="dash-modal-body">
                    
                    <div class="dash-form-group">
                        <label class="dash-form-label">💰 סכום <span class="required">*</span></label>
                        <div class="dash-input-prefix">
                            <span class="dash-prefix">₪</span>
                            <input type="number" id="expAmount" class="dash-form-input" placeholder="0.00" step="0.01" min="0" required>
                        </div>
                    </div>
                    
                    <div class="dash-form-group">
                        <label class="dash-form-label">🏷️ קטגוריה <span class="required">*</span></label>
                        <select id="expCategory" class="dash-form-select" required>
                            <option value="">בחר קטגוריה...</option>
                            <optgroup label="הוצאות קבועות">
                                <option value="🏠 דיור">🏠 דיור</option>
                                <option value="⚡ חשמל">⚡ חשמל</option>
                                <option value="💧 מים">💧 מים</option>
                                <option value="🔥 גז">🔥 גז</option>
                                <option value="🏛️ ארנונה">🏛️ ארנונה</option>
                                <option value="🛡️ ביטוחים">🛡️ ביטוחים</option>
                                <option value="📺 מנויים">📺 מנויים</option>
                            </optgroup>
                            <optgroup label="הוצאות משתנות">
                                <option value="🛒 מזון ומכולת">🛒 מזון ומכולת</option>
                                <option value="🚗 תחבורה">🚗 תחבורה</option>
                                <option value="🎉 בילויים">🎉 בילויים</option>
                                <option value="🛍️ קניות">🛍️ קניות</option>
                                <option value="💊 בריאות">💊 בריאות</option>
                                <option value="📚 חינוך">📚 חינוך</option>
                                <option value="🎨 תחביבים">🎨 תחביבים</option>
                                <option value="⚽ ספורט">⚽ ספורט</option>
                                <option value="💄 טיפוח">💄 טיפוח</option>
                                <option value="🐾 חיות מחמד">🐾 חיות מחמד</option>
                                <option value="🎁 מתנות">🎁 מתנות</option>
                                <option value="📌 אחר">📌 אחר</option>
                            </optgroup>
                        </select>
                    </div>
                    
                    <div class="dash-form-group">
                        <label class="dash-form-label">📝 תיאור</label>
                        <input type="text" id="expDescription" class="dash-form-input" placeholder="למשל: קניות בסופר..." maxlength="100">
                    </div>
                    
                    <div class="dash-form-group">
                        <label class="dash-form-label">📅 תאריך <span class="required">*</span></label>
                        <input type="date" id="expDate" class="dash-form-input" required>
                    </div>
                    
                    <div class="dash-form-group">
                        <label class="dash-checkbox">
                            <input type="checkbox" id="expRecurring">
                            <span>🔄 הוצאה חוזרת</span>
                        </label>
                    </div>
                    
                </div>
                <div class="dash-modal-footer">
                    <button type="button" class="dash-btn secondary" onclick="FlowEcoDash.closeExpenseModal()">ביטול</button>
                    <button type="submit" class="dash-btn primary expense">💾 שמור</button>
                </div>
            </form>
        </div>
    </div>

    <!-- ========== INCOME MODAL ========== -->
    <div class="dash-modal-overlay" id="incomeModal">
        <div class="dash-modal">
            <div class="dash-modal-header">
                <h2 class="dash-modal-title">💰 הוסף הכנסה</h2>
                <button class="dash-modal-close" onclick="FlowEcoDash.closeIncomeModal()">✕</button>
            </div>
            <form id="incomeForm" onsubmit="FlowEcoDash.submitIncome(event)">
                <div class="dash-modal-body">
                    
                    <div class="dash-form-group">
                        <label class="dash-form-label">💵 סכום <span class="required">*</span></label>
                        <div class="dash-input-prefix">
                            <span class="dash-prefix">₪</span>
                            <input type="number" id="incAmount" class="dash-form-input" placeholder="0.00" step="0.01" min="0" required>
                        </div>
                    </div>
                    
                    <div class="dash-form-group">
                        <label class="dash-form-label">📝 מקור ההכנסה <span class="required">*</span></label>
                        <input type="text" id="incSource" class="dash-form-input" placeholder="למשל: משכורת, בונוס..." maxlength="100" required>
                    </div>
                    
                    <div class="dash-form-group">
                        <label class="dash-form-label">📅 תאריך <span class="required">*</span></label>
                        <input type="date" id="incDate" class="dash-form-input" required>
                    </div>
                    
                    <div class="dash-form-group">
                        <label class="dash-checkbox">
                            <input type="checkbox" id="incRecurring">
                            <span>🔄 הכנסה קבועה</span>
                        </label>
                    </div>
                    
                </div>
                <div class="dash-modal-footer">
                    <button type="button" class="dash-btn secondary" onclick="FlowEcoDash.closeIncomeModal()">ביטול</button>
                    <button type="submit" class="dash-btn primary income">💾 שמור</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Toast -->
    <div class="dash-toast" id="dashToast"></div>

    <?php
    return ob_get_clean();
}

add_shortcode('floweco_dashboard_v2', 'floweco_dashboard_v2_shortcode');
?>