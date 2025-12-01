<?php
add_shortcode('floweco_ai_advisor_v2', function() {
    return '
<div class="ai-advisor-page-v2">

    <!-- HEADER -->
    <div class="ai-header">
        <div class="ai-header-top">
            <div>
                <h1 class="ai-title">🤖 היועץ הפיננסי</h1>
                <p class="ai-subtitle">יועץ כלכלי אישי מבוסס AI - זמין 24/7</p>
            </div>
            <div class="ai-badge">
                <span class="ai-badge-icon">✨</span>
                <span class="ai-badge-text">מופעל ב-AI</span>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="ai-summary-cards">
            <div class="ai-summary-card ai-card-income">
                <div class="ai-card-icon">💰</div>
                <div class="ai-card-content">
                    <span class="ai-card-label">הכנסות</span>
                    <span class="ai-card-value" id="miniIncomes">₪0</span>
                </div>
            </div>
            <div class="ai-summary-card ai-card-expense">
                <div class="ai-card-icon">💸</div>
                <div class="ai-card-content">
                    <span class="ai-card-label">הוצאות</span>
                    <span class="ai-card-value" id="miniExpenses">₪0</span>
                </div>
            </div>
            <div class="ai-summary-card ai-card-balance">
                <div class="ai-card-icon">📊</div>
                <div class="ai-card-content">
                    <span class="ai-card-label">יתרה</span>
                    <span class="ai-card-value" id="miniBalance">₪0</span>
                </div>
            </div>
            <div class="ai-summary-card ai-card-budget">
                <div class="ai-card-icon">🎯</div>
                <div class="ai-card-content">
                    <span class="ai-card-label">תקציב</span>
                    <span class="ai-card-value" id="miniBudget">₪0</span>
                </div>
            </div>
        </div>
    </div>

    <!-- CHAT CONTAINER -->
    <div class="ai-chat-container">
        <div class="ai-messages-area" id="messagesArea">
            <div class="ai-message-group ai-group">
                <div class="ai-message-avatar">🤖</div>
                <div class="ai-message-bubble ai-bubble">
                    <p><strong>שלום! 👋 אני הכלכלן החכם של FlowEco.</strong></p>
                    <p>אני כאן לעזור לך לנהל את הכספים שלך בצורה חכמה יותר.</p>
                    <p>אתה יכול לשאול אותי על:</p>
                    <ul class="ai-welcome-list">
                        <li>💰 ההכנסות וההוצאות שלך</li>
                        <li>📊 המצב הכלכלי שלך</li>
                        <li>💡 טיפים לחיסכון</li>
                        <li>🎯 ניהול תקציב</li>
                    </ul>
                    <p>במה אני יכול לעזור לך היום?</p>
                </div>
            </div>
        </div>
        
        <div class="ai-typing-indicator" id="typingIndicator">
            <div class="ai-message-avatar">🤖</div>
            <div class="ai-typing-bubble">
                <span></span><span></span><span></span>
            </div>
        </div>
    </div>

    <!-- SUGGESTIONS -->
    <div class="ai-suggestions">
        <div class="ai-suggestions-title">💡 שאלות מוצעות</div>
        <div class="ai-suggestions-grid">
            <button class="ai-suggestion-btn" onclick="FlowEcoAI.sendSuggestion(\'מה המצב הכלכלי שלי?\')">
                <span class="ai-suggestion-icon">📊</span>
                <span>מה המצב הכלכלי שלי?</span>
            </button>
            <button class="ai-suggestion-btn" onclick="FlowEcoAI.sendSuggestion(\'איך אני יכול לחסוך יותר?\')">
                <span class="ai-suggestion-icon">💡</span>
                <span>איך אני יכול לחסוך?</span>
            </button>
            <button class="ai-suggestion-btn" onclick="FlowEcoAI.sendSuggestion(\'מה ההוצאה הכי גדולה שלי?\')">
                <span class="ai-suggestion-icon">🔍</span>
                <span>ההוצאה הכי גדולה?</span>
            </button>
            <button class="ai-suggestion-btn" onclick="FlowEcoAI.sendSuggestion(\'תן לי טיפים לניהול תקציב\')">
                <span class="ai-suggestion-icon">🎯</span>
                <span>טיפים לתקציב</span>
            </button>
        </div>
    </div>

    <!-- INPUT AREA -->
    <div class="ai-input-container">
        <div class="ai-input-wrapper">
            <textarea id="messageInput" placeholder="כתוב את השאלה שלך כאן..." maxlength="500" rows="1"></textarea>
            <button id="sendButton" class="ai-send-button">
                <span>📤</span>
            </button>
        </div>
        <div class="ai-input-footer">
            <span class="ai-input-hint">💡 Enter לשליחה</span>
            <span class="ai-char-counter" id="charCounter">0/500</span>
        </div>
    </div>

</div>
';
});