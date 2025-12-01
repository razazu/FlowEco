<?php
add_shortcode('floweco_sidebar', function() {
    return '

<div class="floweco-sidebar" id="floweco-sidebar">
    
    <!-- Close Button (Mobile) -->
    <button class="sb-close" id="sbClose" aria-label="סגור תפריט">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    </button>

    <!-- Header -->
    <div class="sb-header">
        <div class="sb-logo">
            <div class="sb-logo-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
            </div>
            <div class="sb-logo-text">
                <span class="sb-logo-title">FlowEco</span>
                <div class="sb-logo-badges">
                    <span class="sb-badge sb-badge-version">v2.0</span>
                    <span class="sb-badge sb-badge-beta">BETA</span>
                </div>
            </div>
        </div>
        <p class="sb-credit">FlowRaz <a href="https://flowraz.io" target="_blank" rel="noopener">By</a></p>
    </div>

    <!-- Navigation -->
    <nav class="sb-nav">
        
        <div class="sb-nav-section">
            <span class="sb-nav-title">ראשי</span>
            
            <a href="/dashboard" class="sb-nav-link" data-page="dashboard">
                <span class="sb-nav-icon">🏠</span>
                <span class="sb-nav-text">דף הבית</span>
            </a>
            
            <a href="/expenses" class="sb-nav-link" data-page="expenses">
                <span class="sb-nav-icon">💸</span>
                <span class="sb-nav-text">הוצאות</span>
            </a>
            
            <a href="/incomes" class="sb-nav-link" data-page="incomes">
                <span class="sb-nav-icon">💰</span>
                <span class="sb-nav-text">הכנסות</span>
            </a>
            
            <a href="/budget" class="sb-nav-link" data-page="budget">
                <span class="sb-nav-icon">🎯</span>
                <span class="sb-nav-text">תקציב</span>
            </a>
        </div>

        <div class="sb-nav-section">
            <span class="sb-nav-title">כלים חכמים</span>
            
            <a href="/ai-advisor" class="sb-nav-link sb-nav-ai" data-page="ai-advisor">
                <span class="sb-nav-icon">🤖</span>
                <span class="sb-nav-text">הכלכלן החכם</span>
                <span class="sb-badge sb-badge-ai">AI</span>
            </a>
            
            <a href="/reports" class="sb-nav-link" data-page="reports">
                <span class="sb-nav-icon">📊</span>
                <span class="sb-nav-text">דוחות</span>   
            </a>
        </div>

        <div class="sb-nav-spacer"></div>

        <div class="sb-nav-section">
            <a href="/settings" class="sb-nav-link" data-page="settings">
                <span class="sb-nav-icon">⚙️</span>
                <span class="sb-nav-text">הגדרות</span>
            </a>
            
            <a href="/admin-panel" class="sb-nav-link sb-nav-admin" data-page="admin" id="sbAdminLink">
                <span class="sb-nav-icon">🛡️</span>
                <span class="sb-nav-text">פאנל ניהול</span>
                <span class="sb-badge sb-badge-admin">Admin</span>
            </a>
        </div>
    </nav>

    <!-- Footer -->
    <div class="sb-footer">
        <div class="sb-user">
            <div class="sb-user-avatar" id="sbUserAvatar">?</div>
            <div class="sb-user-info">
                <span class="sb-user-name" id="sbUserName">טוען...</span>
                <span class="sb-user-plan" id="sbUserPlan">...</span>
            </div>
        </div>
        <button class="sb-logout" id="sbLogout" title="התנתק">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
        </button>
    </div>

</div>

<!-- Mobile Toggle Button -->
<button class="sb-toggle" id="sbToggle" aria-label="פתח תפריט">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
</button>

<!-- Overlay -->
<div class="sb-overlay" id="sbOverlay"></div>

';
});