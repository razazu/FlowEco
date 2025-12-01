// ========================================
// FlowEco AI Advisor v2 - Core Logic
// ========================================

(function() {
    'use strict';

    // Guard - only run on AI advisor page
    if (!document.querySelector('.ai-advisor-page-v2')) return;

    console.log('🤖 FlowEco AI Advisor v2 Loading...');

    // ========================================
    // CONFIG & STATE
    // ========================================

    const API_URL = 'https://floweco-api.razazulai.workers.dev';

    const state = {
        history: [],
        financialContext: {},
        isTyping: false
    };

    // ========================================
    // API HELPERS
    // ========================================

    function getToken() {
        return localStorage.getItem('floweco_token');
    }

    async function apiRequest(endpoint, method, body) {
        method = method || 'GET';
        body = body || null;
        
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

        var response = await fetch(API_URL + endpoint, options);
        return response.json();
    }

    // ========================================
    // DATA LOADING
    // ========================================

    async function loadFinancialData() {
        var token = getToken();
        if (!token) {
            console.log('AI Advisor: No token found');
            return;
        }

        try {
            var results = await Promise.all([
                apiRequest('/api/expenses'),
                apiRequest('/api/incomes'),
                apiRequest('/api/budgets')
            ]);

            var expenses = results[0];
            var incomes = results[1];
            var budgets = results[2];

            state.financialContext = {
                expenses: (expenses.success && expenses.data) ? expenses.data : [],
                incomes: (incomes.success && incomes.data) ? incomes.data : [],
                budgets: (budgets.success && budgets.data) ? budgets.data : []
            };

            updateStats();
            console.log('🤖 Financial data loaded');

        } catch (error) {
            console.error('AI Advisor Error:', error);
        }
    }

    // ========================================
    // UPDATE STATS
    // ========================================

    function updateStats() {
        var data = state.financialContext;
        
        var totalExpenses = 0;
        var totalIncomes = 0;
        var totalBudget = 0;

        for (var i = 0; i < data.expenses.length; i++) {
            totalExpenses += parseFloat(data.expenses[i].amount) || 0;
        }

        for (var j = 0; j < data.incomes.length; j++) {
            totalIncomes += parseFloat(data.incomes[j].amount) || 0;
        }

        for (var k = 0; k < data.budgets.length; k++) {
            totalBudget += parseFloat(data.budgets[k].amount) || 0;
        }

        var balance = totalIncomes - totalExpenses;

        // Update UI
        var incomesEl = document.getElementById('miniIncomes');
        var expensesEl = document.getElementById('miniExpenses');
        var balanceEl = document.getElementById('miniBalance');
        var budgetEl = document.getElementById('miniBudget');

        if (incomesEl) incomesEl.textContent = '₪' + totalIncomes.toLocaleString('he-IL');
        if (expensesEl) expensesEl.textContent = '₪' + totalExpenses.toLocaleString('he-IL');
        if (budgetEl) budgetEl.textContent = '₪' + totalBudget.toLocaleString('he-IL');
        
        if (balanceEl) {
            balanceEl.textContent = '₪' + balance.toLocaleString('he-IL');
            balanceEl.style.color = balance >= 0 ? '#10B981' : '#EF4444';
        }
    }

    // ========================================
    // SEND MESSAGE
    // ========================================

    async function sendMessage() {
        var input = document.getElementById('messageInput');
        var msg = input.value.trim();

        if (!msg || state.isTyping) return;

        // Add user message to UI
        addMessageToUI(msg, 'user');

        // Clear input
        input.value = '';
        updateCharCounter();

        // Show typing
        state.isTyping = true;
        var typingEl = document.getElementById('typingIndicator');
        if (typingEl) typingEl.classList.add('active');

        try {
            var response = await apiRequest('/api/ai-chat', 'POST', {
                message: msg,
                context: {
                    totalIncomes: getTotalIncomes(),
                    totalExpenses: getTotalExpenses(),
                    balance: getTotalIncomes() - getTotalExpenses()
                },
                history: state.history.slice(-6)
            });

            if (response.success && response.data && response.data.message) {
                addMessageToUI(response.data.message, 'ai');
                state.history.push(
                    { role: 'user', content: msg },
                    { role: 'assistant', content: response.data.message }
                );
            } else {
                addMessageToUI('אופס, הייתה בעיה. נסה שוב.', 'ai');
            }

        } catch (error) {
            console.error('AI Chat Error:', error);
            addMessageToUI('שגיאה בתקשורת עם השרת.', 'ai');
        } finally {
            state.isTyping = false;
            if (typingEl) typingEl.classList.remove('active');
        }
    }

    function getTotalIncomes() {
        var total = 0;
        var incomes = state.financialContext.incomes || [];
        for (var i = 0; i < incomes.length; i++) {
            total += parseFloat(incomes[i].amount) || 0;
        }
        return total;
    }

    function getTotalExpenses() {
        var total = 0;
        var expenses = state.financialContext.expenses || [];
        for (var i = 0; i < expenses.length; i++) {
            total += parseFloat(expenses[i].amount) || 0;
        }
        return total;
    }

    // ========================================
    // ADD MESSAGE TO UI
    // ========================================

    function addMessageToUI(text, type) {
        var area = document.getElementById('messagesArea');
        if (!area) return;

        var div = document.createElement('div');
        div.className = 'ai-message-group ' + (type === 'user' ? 'user-group' : 'ai-group');

        var avatar = type === 'user' ? '👤' : '🤖';
        var bubbleClass = type === 'user' ? 'user-bubble' : 'ai-bubble';
        var formattedText = text.replace(/\n/g, '<br>');

        div.innerHTML = '<div class="ai-message-avatar">' + avatar + '</div>' +
            '<div class="ai-message-bubble ' + bubbleClass + '">' +
            '<p>' + formattedText + '</p>' +
            '</div>';

        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    }

    // ========================================
    // SEND SUGGESTION
    // ========================================

    function sendSuggestion(text) {
        var input = document.getElementById('messageInput');
        if (input) {
            input.value = text;
            sendMessage();
        }
    }

    // ========================================
    // CHAR COUNTER
    // ========================================

    function updateCharCounter() {
        var input = document.getElementById('messageInput');
        var counter = document.getElementById('charCounter');
        if (input && counter) {
            counter.textContent = input.value.length + '/500';
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    function setupEventListeners() {
        var input = document.getElementById('messageInput');
        var sendBtn = document.getElementById('sendButton');

        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                sendMessage();
            });
        }

        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            input.addEventListener('input', function() {
                updateCharCounter();
            });
        }
    }

    // ========================================
    // GLOBAL API
    // ========================================

    window.FlowEcoAI = {
        sendSuggestion: sendSuggestion,
        sendMessage: sendMessage
    };

    // ========================================
    // INIT
    // ========================================

    loadFinancialData();
    setupEventListeners();

    console.log('🤖 FlowEco AI Advisor v2 Ready!');

})();