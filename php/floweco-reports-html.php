<?php
/**
 * FlowEco Reports Page - Smart Tools
 * Shortcode: [floweco_reports]
 * WPCodeBox: PHP, Frontend, Plugins Loaded
 */

if (!defined('ABSPATH')) exit;

add_shortcode('floweco_reports', function() {
    ob_start();
    ?>
    <div class="fe-reports" dir="rtl">
        
        <!-- Header -->
        <div class="fe-reports-header">
            <div class="fe-reports-title-section">
                <h1 class="fe-reports-title">
                    <span class="fe-title-icon">📊</span>
                    דוחות וניתוחים
                </h1>
                <p class="fe-reports-subtitle">כלים חכמים לניתוח הכספים שלך</p>
            </div>
            
            <!-- Date Range Picker -->
            <div class="fe-date-range">
                <div class="fe-date-group">
                    <label>מתאריך</label>
                    <input type="date" id="feReportDateFrom" class="fe-date-input">
                </div>
                <div class="fe-date-group">
                    <label>עד תאריך</label>
                    <input type="date" id="feReportDateTo" class="fe-date-input">
                </div>
                <button class="fe-btn-refresh" onclick="FlowEcoReports.refresh()">
                    🔄 רענן
                </button>
            </div>
        </div>

        <!-- Quick Stats Bar -->
        <div class="fe-quick-stats">
            <div class="fe-quick-stat income">
                <span class="fe-quick-icon">💰</span>
                <div class="fe-quick-content">
                    <span class="fe-quick-label">סה"כ הכנסות</span>
                    <span class="fe-quick-value" id="feTotalIncome">₪0</span>
                </div>
            </div>
            <div class="fe-quick-stat expense">
                <span class="fe-quick-icon">💸</span>
                <div class="fe-quick-content">
                    <span class="fe-quick-label">סה"כ הוצאות</span>
                    <span class="fe-quick-value" id="feTotalExpense">₪0</span>
                </div>
            </div>
            <div class="fe-quick-stat balance">
                <span class="fe-quick-icon">📈</span>
                <div class="fe-quick-content">
                    <span class="fe-quick-label">יתרה</span>
                    <span class="fe-quick-value" id="feBalance">₪0</span>
                </div>
            </div>
            <div class="fe-quick-stat savings">
                <span class="fe-quick-icon">🎯</span>
                <div class="fe-quick-content">
                    <span class="fe-quick-label">אחוז חיסכון</span>
                    <span class="fe-quick-value" id="feSavingsRate">0%</span>
                </div>
            </div>
        </div>

        <!-- Export Buttons -->
        <div class="fe-export-bar">
            <button class="fe-btn-export pdf" onclick="FlowEcoReports.exportPDF()">
                <span>📄</span> ייצוא PDF
            </button>
            <button class="fe-btn-export excel" onclick="FlowEcoReports.exportExcel()">
                <span>📊</span> ייצוא Excel
            </button>
            <button class="fe-btn-export print" onclick="FlowEcoReports.print()">
                <span>🖨️</span> הדפסה
            </button>
        </div>

        <!-- Reports Grid -->
        <div class="fe-reports-grid">
            
            <!-- Chart 1: Expenses by Category (Pie) -->
            <div class="fe-report-card large">
                <div class="fe-card-header">
                    <h3><span>🥧</span> הוצאות לפי קטגוריה</h3>
                    <div class="fe-card-actions">
                        <button class="fe-chart-toggle active" data-chart="pie" onclick="FlowEcoReports.toggleChart('category', 'pie')">עוגה</button>
                        <button class="fe-chart-toggle" data-chart="bar" onclick="FlowEcoReports.toggleChart('category', 'bar')">עמודות</button>
                    </div>
                </div>
                <div class="fe-card-body">
                    <canvas id="feCategoryChart"></canvas>
                </div>
                <div class="fe-card-legend" id="feCategoryLegend"></div>
            </div>

            <!-- Chart 2: Monthly Trends (Line) -->
            <div class="fe-report-card large">
                <div class="fe-card-header">
                    <h3><span>📈</span> מגמות חודשיות</h3>
                    <select class="fe-chart-select" id="feTrendMonths" onchange="FlowEcoReports.updateTrends()">
                        <option value="6">6 חודשים</option>
                        <option value="12" selected>12 חודשים</option>
                        <option value="24">24 חודשים</option>
                    </select>
                </div>
                <div class="fe-card-body">
                    <canvas id="feTrendsChart"></canvas>
                </div>
            </div>

            <!-- Chart 3: Income vs Expenses -->
            <div class="fe-report-card">
                <div class="fe-card-header">
                    <h3><span>⚖️</span> הכנסות מול הוצאות</h3>
                </div>
                <div class="fe-card-body">
                    <canvas id="feIncomeVsExpenseChart"></canvas>
                </div>
            </div>

            <!-- Chart 4: Budget vs Actual -->
            <div class="fe-report-card">
                <div class="fe-card-header">
                    <h3><span>🎯</span> תקציב מול ביצוע</h3>
                </div>
                <div class="fe-card-body">
                    <canvas id="feBudgetChart"></canvas>
                </div>
                <div class="fe-budget-summary" id="feBudgetSummary"></div>
            </div>

            <!-- Chart 5: By Credit Card -->
            <div class="fe-report-card">
                <div class="fe-card-header">
                    <h3><span>💳</span> הוצאות לפי כרטיס</h3>
                </div>
                <div class="fe-card-body">
                    <canvas id="feCardChart"></canvas>
                </div>
            </div>

            <!-- Chart 6: Recurring Expenses -->
            <div class="fe-report-card">
                <div class="fe-card-header">
                    <h3><span>🔄</span> הוצאות קבועות</h3>
                </div>
                <div class="fe-card-body">
                    <div class="fe-recurring-list" id="feRecurringList">
                        <!-- Will be populated by JS -->
                    </div>
                </div>
                <div class="fe-recurring-total">
                    <span>סה"כ חודשי:</span>
                    <span id="feRecurringTotal">₪0</span>
                </div>
            </div>

            <!-- Period Comparison -->
            <div class="fe-report-card wide">
                <div class="fe-card-header">
                    <h3><span>📅</span> השוואת תקופות</h3>
                    <div class="fe-compare-selects">
                        <select class="fe-chart-select" id="feComparePeriod1">
                            <option value="current">החודש הנוכחי</option>
                            <option value="last">החודש הקודם</option>
                            <option value="quarter">רבעון נוכחי</option>
                        </select>
                        <span class="fe-vs">VS</span>
                        <select class="fe-chart-select" id="feComparePeriod2">
                            <option value="last">החודש הקודם</option>
                            <option value="lastyear">אשתקד</option>
                            <option value="quarter">רבעון קודם</option>
                        </select>
                        <button class="fe-btn-compare" onclick="FlowEcoReports.compare()">השווה</button>
                    </div>
                </div>
                <div class="fe-card-body">
                    <div class="fe-comparison-grid" id="feComparisonGrid">
                        <div class="fe-compare-col">
                            <h4 id="feCompareTitle1">החודש הנוכחי</h4>
                            <div class="fe-compare-stats" id="feCompareStats1"></div>
                        </div>
                        <div class="fe-compare-diff" id="feCompareDiff">
                            <!-- Difference indicators -->
                        </div>
                        <div class="fe-compare-col">
                            <h4 id="feCompareTitle2">החודש הקודם</h4>
                            <div class="fe-compare-stats" id="feCompareStats2"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Expenses Table -->
            <div class="fe-report-card wide">
                <div class="fe-card-header">
                    <h3><span>🏆</span> הוצאות גדולות</h3>
                    <select class="fe-chart-select" id="feTopCount" onchange="FlowEcoReports.updateTopExpenses()">
                        <option value="5">Top 5</option>
                        <option value="10" selected>Top 10</option>
                        <option value="20">Top 20</option>
                    </select>
                </div>
                <div class="fe-card-body">
                    <div class="fe-table-wrapper">
                        <table class="fe-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>תיאור</th>
                                    <th>קטגוריה</th>
                                    <th>תאריך</th>
                                    <th>סכום</th>
                                </tr>
                            </thead>
                            <tbody id="feTopExpensesBody">
                                <!-- Will be populated by JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Insights & Tips -->
            <div class="fe-report-card insights">
                <div class="fe-card-header">
                    <h3><span>💡</span> תובנות חכמות</h3>
                </div>
                <div class="fe-card-body">
                    <div class="fe-insights-list" id="feInsightsList">
                        <!-- Will be populated by JS -->
                    </div>
                </div>
            </div>

        </div>

        <!-- Loading Overlay -->
        <div class="fe-loading-overlay" id="feReportsLoading">
            <div class="fe-loading-spinner"></div>
            <span>טוען נתונים...</span>
        </div>

    </div>
    <?php
    return ob_get_clean();
});