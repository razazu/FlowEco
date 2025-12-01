/**
 * FlowEco Reports - Smart Tools
 * JavaScript Logic with Chart.js
 */

(function() {
    // Prevent duplicate initialization
    if (window.FlowEcoReports) return;

    // Load Chart.js if not available
    function loadChartJS(callback) {
        if (typeof Chart !== 'undefined') {
            callback();
            return;
        }
        
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
        script.onload = callback;
        script.onerror = function() {
            console.error('Failed to load Chart.js');
        };
        document.head.appendChild(script);
    }

    var API_BASE = 'https://floweco-api.razazulai.workers.dev';
    
    // State
    var state = {
        expenses: [],
        incomes: [],
        budgets: [],
        cards: [],
        dateFrom: null,
        dateTo: null,
        charts: {}
    };

    // Chart.js Colors - Vibrant palette
    var chartColors = [
        '#667eea', // Primary purple
        '#EC4899', // Pink
        '#10B981', // Green
        '#F59E0B', // Orange
        '#3B82F6', // Blue
        '#8B5CF6', // Purple
        '#06B6D4', // Cyan
        '#EF4444', // Red
        '#84CC16', // Lime
        '#F97316', // Deep Orange
        '#14B8A6', // Teal
        '#A855F7'  // Violet
    ];

    var chartColorsTransparent = chartColors.map(function(c) {
        return c + '40';
    });

    // Initialize
    function init() {
        // Only run on reports page
        if (!document.querySelector('.fe-reports')) return;
        
        console.log('📊 FlowEco Reports Loading...');
        
        // Set default dates (current month)
        var now = new Date();
        var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        var dateFromInput = document.getElementById('feReportDateFrom');
        var dateToInput = document.getElementById('feReportDateTo');
        
        if (dateFromInput && dateToInput) {
            dateFromInput.value = formatDateForInput(firstDay);
            dateToInput.value = formatDateForInput(lastDay);
        }
        
        // Load data
        loadAllData();
        
        console.log('📊 FlowEco Reports Ready!');
    }

    // Format date for input
    function formatDateForInput(date) {
        var year = date.getFullYear();
        var month = (date.getMonth() + 1).toString().padStart(2, '0');
        var day = date.getDate().toString().padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    // Get auth token
    function getToken() {
        return localStorage.getItem('floweco_token');
    }

    // API Call
    function apiCall(endpoint, callback) {
        var token = getToken();
        if (!token) {
            window.location.href = '/login';
            return;
        }

        fetch(API_BASE + endpoint, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.success) {
                callback(data.data);
            } else {
                console.error('API Error:', data.error);
            }
        })
        .catch(function(error) {
            console.error('Fetch error:', error);
        });
    }

    // Load all data
    function loadAllData() {
        showLoading(true);
        
        var loaded = 0;
        var total = 4;

        function checkComplete() {
            loaded++;
            if (loaded >= total) {
                showLoading(false);
                renderAllCharts();
            }
        }

        apiCall('/api/expenses', function(data) {
            state.expenses = data || [];
            checkComplete();
        });

        apiCall('/api/incomes', function(data) {
            state.incomes = data || [];
            checkComplete();
        });

        apiCall('/api/budgets', function(data) {
            state.budgets = data || [];
            checkComplete();
        });

        apiCall('/api/cards', function(data) {
            state.cards = data || [];
            checkComplete();
        });
    }

    // Show/hide loading
    function showLoading(show) {
        var overlay = document.getElementById('feReportsLoading');
        if (overlay) {
            overlay.className = show ? 'fe-loading-overlay show' : 'fe-loading-overlay';
        }
    }

    // Filter data by date range
    function filterByDate(data) {
        var fromInput = document.getElementById('feReportDateFrom');
        var toInput = document.getElementById('feReportDateTo');
        
        if (!fromInput || !toInput) return data;
        
        var from = fromInput.value ? new Date(fromInput.value) : null;
        var to = toInput.value ? new Date(toInput.value) : null;
        
        if (!from && !to) return data;
        
        return data.filter(function(item) {
            var itemDate = new Date(item.date);
            if (from && itemDate < from) return false;
            if (to && itemDate > to) return false;
            return true;
        });
    }

    // Render all charts
    function renderAllCharts() {
        updateQuickStats();
        renderCategoryChart();
        renderTrendsChart();
        renderIncomeVsExpenseChart();
        renderBudgetChart();
        renderCardChart();
        renderRecurringList();
        renderTopExpenses();
        renderInsights();
    }

    // Update quick stats
    function updateQuickStats() {
        var filteredExpenses = filterByDate(state.expenses);
        var filteredIncomes = filterByDate(state.incomes);
        
        var totalExpense = filteredExpenses.reduce(function(sum, e) {
            return sum + parseFloat(e.amount || 0);
        }, 0);
        
        var totalIncome = filteredIncomes.reduce(function(sum, i) {
            return sum + parseFloat(i.amount || 0);
        }, 0);
        
        var balance = totalIncome - totalExpense;
        var savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
        
        document.getElementById('feTotalIncome').textContent = '₪' + formatNumber(totalIncome);
        document.getElementById('feTotalExpense').textContent = '₪' + formatNumber(totalExpense);
        document.getElementById('feBalance').textContent = '₪' + formatNumber(balance);
        document.getElementById('feSavingsRate').textContent = savingsRate.toFixed(1) + '%';
        
        // Color balance
        var balanceEl = document.getElementById('feBalance');
        if (balance >= 0) {
            balanceEl.style.color = '#10B981';
        } else {
            balanceEl.style.color = '#EF4444';
        }
    }

    // Format number
    function formatNumber(num) {
        return Math.abs(num).toLocaleString('he-IL', { maximumFractionDigits: 0 });
    }

    // Render Category Chart (Pie/Bar)
    function renderCategoryChart(type) {
        type = type || 'pie';
        var ctx = document.getElementById('feCategoryChart');
        if (!ctx) return;

        var filteredExpenses = filterByDate(state.expenses);
        
        // Group by category
        var categories = {};
        filteredExpenses.forEach(function(e) {
            var cat = e.category || 'אחר';
            if (!categories[cat]) categories[cat] = 0;
            categories[cat] += parseFloat(e.amount || 0);
        });
        
        var labels = Object.keys(categories);
        var data = Object.values(categories);
        
        // Destroy existing chart
        if (state.charts.category) {
            state.charts.category.destroy();
        }
        
        state.charts.category = new Chart(ctx, {
            type: type === 'pie' ? 'doughnut' : 'bar',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: type === 'pie' ? chartColors : chartColorsTransparent,
                    borderColor: chartColors,
                    borderWidth: type === 'pie' ? 0 : 2,
                    borderRadius: type === 'bar' ? 8 : 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ₪' + formatNumber(context.raw);
                            }
                        }
                    }
                },
                scales: type === 'bar' ? {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                } : {}
            }
        });
        
        // Render legend
        renderCategoryLegend(labels, data);
    }

    // Render category legend
    function renderCategoryLegend(labels, data) {
        var container = document.getElementById('feCategoryLegend');
        if (!container) return;
        
        var total = data.reduce(function(a, b) { return a + b; }, 0);
        
        container.innerHTML = labels.map(function(label, i) {
            var percent = total > 0 ? ((data[i] / total) * 100).toFixed(1) : 0;
            return '<div class="fe-legend-item">' +
                '<span class="fe-legend-color" style="background: ' + chartColors[i % chartColors.length] + '"></span>' +
                '<span>' + label + ' (' + percent + '%)</span>' +
                '</div>';
        }).join('');
    }

    // Render Trends Chart (Line)
    function renderTrendsChart() {
        var ctx = document.getElementById('feTrendsChart');
        if (!ctx) return;

        var monthsSelect = document.getElementById('feTrendMonths');
        var months = monthsSelect ? parseInt(monthsSelect.value) : 12;
        
        // Generate month labels
        var labels = [];
        var expenseData = [];
        var incomeData = [];
        var now = new Date();
        
        for (var i = months - 1; i >= 0; i--) {
            var date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            var monthStr = date.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' });
            labels.push(monthStr);
            
            var year = date.getFullYear();
            var month = date.getMonth();
            
            // Sum expenses for this month
            var monthExpenses = state.expenses.filter(function(e) {
                var d = new Date(e.date);
                return d.getFullYear() === year && d.getMonth() === month;
            }).reduce(function(sum, e) {
                return sum + parseFloat(e.amount || 0);
            }, 0);
            
            // Sum incomes for this month
            var monthIncomes = state.incomes.filter(function(inc) {
                var d = new Date(inc.date);
                return d.getFullYear() === year && d.getMonth() === month;
            }).reduce(function(sum, inc) {
                return sum + parseFloat(inc.amount || 0);
            }, 0);
            
            expenseData.push(monthExpenses);
            incomeData.push(monthIncomes);
        }
        
        // Destroy existing chart
        if (state.charts.trends) {
            state.charts.trends.destroy();
        }
        
        state.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'הכנסות',
                        data: incomeData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'הוצאות',
                        data: expenseData,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#9CA3AF',
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ₪' + formatNumber(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#9CA3AF',
                            callback: function(value) {
                                return '₪' + formatNumber(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        });
    }

    // Render Income vs Expense Chart
    function renderIncomeVsExpenseChart() {
        var ctx = document.getElementById('feIncomeVsExpenseChart');
        if (!ctx) return;

        var filteredExpenses = filterByDate(state.expenses);
        var filteredIncomes = filterByDate(state.incomes);
        
        var totalExpense = filteredExpenses.reduce(function(sum, e) {
            return sum + parseFloat(e.amount || 0);
        }, 0);
        
        var totalIncome = filteredIncomes.reduce(function(sum, i) {
            return sum + parseFloat(i.amount || 0);
        }, 0);
        
        // Destroy existing chart
        if (state.charts.incomeVsExpense) {
            state.charts.incomeVsExpense.destroy();
        }
        
        state.charts.incomeVsExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['הכנסות', 'הוצאות'],
                datasets: [{
                    data: [totalIncome, totalExpense],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderColor: [
                        '#10B981',
                        '#EF4444'
                    ],
                    borderWidth: 2,
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '₪' + formatNumber(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#9CA3AF',
                            callback: function(value) {
                                return '₪' + formatNumber(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        });
    }

    // Render Budget Chart
    function renderBudgetChart() {
        var ctx = document.getElementById('feBudgetChart');
        if (!ctx) return;

        var filteredExpenses = filterByDate(state.expenses);
        
        // Calculate actual spending per category
        var actualSpending = {};
        filteredExpenses.forEach(function(e) {
            var cat = e.category || 'אחר';
            if (!actualSpending[cat]) actualSpending[cat] = 0;
            actualSpending[cat] += parseFloat(e.amount || 0);
        });
        
        // Get budget data
        var labels = [];
        var budgetData = [];
        var actualData = [];
        
        state.budgets.forEach(function(b) {
            labels.push(b.category);
            budgetData.push(parseFloat(b.amount || 0));
            actualData.push(actualSpending[b.category] || 0);
        });
        
        if (labels.length === 0) {
            ctx.parentElement.innerHTML = '<div class="fe-empty-state">לא הוגדרו תקציבים</div>';
            return;
        }
        
        // Destroy existing chart
        if (state.charts.budget) {
            state.charts.budget.destroy();
        }
        
        state.charts.budget = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'תקציב',
                        data: budgetData,
                        backgroundColor: 'rgba(102, 126, 234, 0.5)',
                        borderColor: '#667eea',
                        borderWidth: 2,
                        borderRadius: 6
                    },
                    {
                        label: 'בפועל',
                        data: actualData,
                        backgroundColor: actualData.map(function(a, i) {
                            return a > budgetData[i] ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)';
                        }),
                        borderColor: actualData.map(function(a, i) {
                            return a > budgetData[i] ? '#EF4444' : '#10B981';
                        }),
                        borderWidth: 2,
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
                        labels: {
                            color: '#9CA3AF',
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        });
        
        // Render budget summary
        renderBudgetSummary(labels, budgetData, actualData);
    }

    // Render budget summary
    function renderBudgetSummary(labels, budgetData, actualData) {
        var container = document.getElementById('feBudgetSummary');
        if (!container) return;
        
        var totalBudget = budgetData.reduce(function(a, b) { return a + b; }, 0);
        var totalActual = actualData.reduce(function(a, b) { return a + b; }, 0);
        var remaining = totalBudget - totalActual;
        
        container.innerHTML = 
            '<div class="fe-budget-item">' +
                '<span class="fe-budget-item-label">סה"כ תקציב</span>' +
                '<span class="fe-budget-item-value">₪' + formatNumber(totalBudget) + '</span>' +
            '</div>' +
            '<div class="fe-budget-item">' +
                '<span class="fe-budget-item-label">סה"כ בפועל</span>' +
                '<span class="fe-budget-item-value">₪' + formatNumber(totalActual) + '</span>' +
            '</div>' +
            '<div class="fe-budget-item">' +
                '<span class="fe-budget-item-label">נותר</span>' +
                '<span class="fe-budget-item-value ' + (remaining >= 0 ? 'under' : 'over') + '">₪' + formatNumber(remaining) + '</span>' +
            '</div>';
    }

    // Render Card Chart
    function renderCardChart() {
        var ctx = document.getElementById('feCardChart');
        if (!ctx) return;

        var filteredExpenses = filterByDate(state.expenses);
        
        // Group by card
        var cardSpending = { 'מזומן': 0 };
        state.cards.forEach(function(c) {
            cardSpending[c.card_name] = 0;
        });
        
        filteredExpenses.forEach(function(e) {
            var cardName = 'מזומן';
            if (e.card_id) {
                var card = state.cards.find(function(c) { return c.id === e.card_id; });
                if (card) cardName = card.card_name;
            }
            if (!cardSpending[cardName]) cardSpending[cardName] = 0;
            cardSpending[cardName] += parseFloat(e.amount || 0);
        });
        
        // Filter out zero values
        var labels = [];
        var data = [];
        Object.keys(cardSpending).forEach(function(key) {
            if (cardSpending[key] > 0) {
                labels.push(key);
                data.push(cardSpending[key]);
            }
        });
        
        if (labels.length === 0) {
            ctx.parentElement.innerHTML = '<div class="fe-empty-state">אין נתונים</div>';
            return;
        }
        
        // Destroy existing chart
        if (state.charts.card) {
            state.charts.card.destroy();
        }
        
        state.charts.card = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: chartColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9CA3AF',
                            usePointStyle: true,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ₪' + formatNumber(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }

    // Render Recurring List
    function renderRecurringList() {
        var container = document.getElementById('feRecurringList');
        var totalEl = document.getElementById('feRecurringTotal');
        if (!container) return;
        
        var recurring = state.expenses.filter(function(e) {
            return e.is_recurring === 1;
        });
        
        if (recurring.length === 0) {
            container.innerHTML = '<div class="fe-empty-state">אין הוצאות קבועות</div>';
            if (totalEl) totalEl.textContent = '₪0';
            return;
        }
        
        var total = recurring.reduce(function(sum, e) {
            return sum + parseFloat(e.amount || 0);
        }, 0);
        
        container.innerHTML = recurring.map(function(e) {
            return '<div class="fe-recurring-item">' +
                '<span class="fe-recurring-item-name">' + (e.description || e.category) + '</span>' +
                '<span class="fe-recurring-item-amount">₪' + formatNumber(e.amount) + '</span>' +
                '</div>';
        }).join('');
        
        if (totalEl) totalEl.textContent = '₪' + formatNumber(total);
    }

    // Render Top Expenses
    function renderTopExpenses() {
        var tbody = document.getElementById('feTopExpensesBody');
        var countSelect = document.getElementById('feTopCount');
        if (!tbody) return;
        
        var count = countSelect ? parseInt(countSelect.value) : 10;
        var filteredExpenses = filterByDate(state.expenses);
        
        // Sort by amount descending
        var sorted = filteredExpenses.slice().sort(function(a, b) {
            return parseFloat(b.amount) - parseFloat(a.amount);
        }).slice(0, count);
        
        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #9CA3AF;">אין הוצאות בתקופה זו</td></tr>';
            return;
        }
        
        tbody.innerHTML = sorted.map(function(e, i) {
            var date = new Date(e.date).toLocaleDateString('he-IL');
            return '<tr>' +
                '<td class="rank">' + (i + 1) + '</td>' +
                '<td>' + (e.description || '-') + '</td>' +
                '<td><span class="category-badge">' + e.category + '</span></td>' +
                '<td>' + date + '</td>' +
                '<td class="amount">₪' + formatNumber(e.amount) + '</td>' +
                '</tr>';
        }).join('');
    }

    // Render Insights
    function renderInsights() {
        var container = document.getElementById('feInsightsList');
        if (!container) return;
        
        var insights = generateInsights();
        
        if (insights.length === 0) {
            container.innerHTML = '<div class="fe-empty-state">אין מספיק נתונים לתובנות</div>';
            return;
        }
        
        container.innerHTML = insights.map(function(insight) {
            return '<div class="fe-insight-item ' + insight.type + '">' +
                '<span class="fe-insight-icon">' + insight.icon + '</span>' +
                '<div class="fe-insight-content">' +
                    '<div class="fe-insight-title">' + insight.title + '</div>' +
                    '<div class="fe-insight-desc">' + insight.desc + '</div>' +
                '</div>' +
                '</div>';
        }).join('');
    }

    // Generate insights
    function generateInsights() {
        var insights = [];
        var filteredExpenses = filterByDate(state.expenses);
        var filteredIncomes = filterByDate(state.incomes);
        
        var totalExpense = filteredExpenses.reduce(function(sum, e) {
            return sum + parseFloat(e.amount || 0);
        }, 0);
        
        var totalIncome = filteredIncomes.reduce(function(sum, i) {
            return sum + parseFloat(i.amount || 0);
        }, 0);
        
        // Savings rate insight
        if (totalIncome > 0) {
            var savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
            if (savingsRate >= 20) {
                insights.push({
                    type: 'positive',
                    icon: '🎉',
                    title: 'חיסכון מעולה!',
                    desc: 'אתה חוסך ' + savingsRate.toFixed(1) + '% מההכנסות שלך. המשך כך!'
                });
            } else if (savingsRate < 0) {
                insights.push({
                    type: 'negative',
                    icon: '⚠️',
                    title: 'הוצאות עולות על ההכנסות',
                    desc: 'ההוצאות שלך גבוהות מההכנסות ב-₪' + formatNumber(Math.abs(totalIncome - totalExpense))
                });
            }
        }
        
        // Find highest category
        var categories = {};
        filteredExpenses.forEach(function(e) {
            var cat = e.category || 'אחר';
            if (!categories[cat]) categories[cat] = 0;
            categories[cat] += parseFloat(e.amount || 0);
        });
        
        var sortedCats = Object.entries(categories).sort(function(a, b) {
            return b[1] - a[1];
        });
        
        if (sortedCats.length > 0) {
            var topCat = sortedCats[0];
            var percent = totalExpense > 0 ? ((topCat[1] / totalExpense) * 100).toFixed(1) : 0;
            insights.push({
                type: 'info',
                icon: '📊',
                title: 'הקטגוריה הגדולה ביותר',
                desc: topCat[0] + ' מהווה ' + percent + '% מההוצאות (₪' + formatNumber(topCat[1]) + ')'
            });
        }
        
        // Budget alerts
        state.budgets.forEach(function(b) {
            var spent = categories[b.category] || 0;
            var budget = parseFloat(b.amount);
            if (spent > budget) {
                insights.push({
                    type: 'warning',
                    icon: '🔔',
                    title: 'חריגה מתקציב',
                    desc: 'חרגת בקטגוריית ' + b.category + ' ב-₪' + formatNumber(spent - budget)
                });
            }
        });
        
        // Recurring expenses
        var recurringTotal = state.expenses.filter(function(e) {
            return e.is_recurring === 1;
        }).reduce(function(sum, e) {
            return sum + parseFloat(e.amount || 0);
        }, 0);
        
        if (recurringTotal > 0 && totalIncome > 0) {
            var recurringPercent = (recurringTotal / totalIncome) * 100;
            insights.push({
                type: recurringPercent > 50 ? 'warning' : 'info',
                icon: '🔄',
                title: 'הוצאות קבועות',
                desc: 'הוצאות קבועות מהוות ' + recurringPercent.toFixed(1) + '% מההכנסות שלך'
            });
        }
        
        return insights;
    }

    // Toggle chart type
    function toggleChart(chartName, type) {
        if (chartName === 'category') {
            // Update buttons
            var buttons = document.querySelectorAll('.fe-card-actions .fe-chart-toggle');
            buttons.forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.dataset.chart === type) btn.classList.add('active');
            });
            renderCategoryChart(type);
        }
    }

    // Update trends
    function updateTrends() {
        renderTrendsChart();
    }

    // Update top expenses
    function updateTopExpenses() {
        renderTopExpenses();
    }

    // Compare periods
    function compare() {
        // Simplified comparison
        var stats1 = document.getElementById('feCompareStats1');
        var stats2 = document.getElementById('feCompareStats2');
        var diff = document.getElementById('feCompareDiff');
        
        // Current month
        var now = new Date();
        var currentMonth = state.expenses.filter(function(e) {
            var d = new Date(e.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        
        // Last month
        var lastMonth = state.expenses.filter(function(e) {
            var d = new Date(e.date);
            var lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
        });
        
        var currentTotal = currentMonth.reduce(function(s, e) { return s + parseFloat(e.amount); }, 0);
        var lastTotal = lastMonth.reduce(function(s, e) { return s + parseFloat(e.amount); }, 0);
        
        if (stats1) {
            stats1.innerHTML = 
                '<div class="fe-compare-stat-item">' +
                    '<span class="fe-compare-stat-label">הוצאות</span>' +
                    '<span class="fe-compare-stat-value">₪' + formatNumber(currentTotal) + '</span>' +
                '</div>';
        }
        
        if (stats2) {
            stats2.innerHTML = 
                '<div class="fe-compare-stat-item">' +
                    '<span class="fe-compare-stat-label">הוצאות</span>' +
                    '<span class="fe-compare-stat-value">₪' + formatNumber(lastTotal) + '</span>' +
                '</div>';
        }
        
        if (diff) {
            var change = currentTotal - lastTotal;
            var isPositive = change < 0; // Less spending is positive
            diff.innerHTML = 
                '<div class="fe-diff-item ' + (isPositive ? 'positive' : 'negative') + '">' +
                    (isPositive ? '↓' : '↑') + ' ₪' + formatNumber(Math.abs(change)) +
                '</div>';
        }
    }

    // Refresh
    function refresh() {
        loadAllData();
    }

    // Export PDF (placeholder)
    function exportPDF() {
        alert('ייצוא PDF - בקרוב!');
    }

    // Export Excel (placeholder)
    function exportExcel() {
        alert('ייצוא Excel - בקרוב!');
    }

    // Print
    function printReport() {
        window.print();
    }

    // Public API
    window.FlowEcoReports = {
        refresh: refresh,
        toggleChart: toggleChart,
        updateTrends: updateTrends,
        updateTopExpenses: updateTopExpenses,
        compare: compare,
        exportPDF: exportPDF,
        exportExcel: exportExcel,
        print: printReport
    };

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadChartJS(init);
        });
    } else {
        loadChartJS(init);
    }
})();