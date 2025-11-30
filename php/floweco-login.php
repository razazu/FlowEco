<?php
/**
 * FlowEco Login Page
 * Shortcode: [floweco_login]
 * WPCodeBox: PHP, Frontend, Plugins Loaded
 */

if (!defined('ABSPATH')) exit;

add_shortcode('floweco_login', function() {
    ob_start();
    ?>
    <div class="fe-login-page" dir="rtl">
        <div class="fe-login-card">
            
            <!-- Header -->
            <div class="fe-login-header">
                <div class="fe-logo">
                    <span class="fe-logo-icon">💰</span>
                    <span class="fe-logo-text">FlowEco</span>
                </div>
                <h1 class="fe-title">ברוך שובך!</h1>
                <p class="fe-subtitle">התחבר לחשבון שלך והמשך לנהל את הכספים</p>
            </div>

            <!-- Form -->
            <form class="fe-login-form" id="feLoginForm">
                
                <!-- Email -->
                <div class="fe-form-group">
                    <label class="fe-label">
                        <span>📧</span> אימייל
                    </label>
                    <input 
                        type="email" 
                        id="feLoginEmail" 
                        class="fe-input"
                        placeholder="your@email.com"
                        required
                    />
                </div>

                <!-- Password -->
                <div class="fe-form-group">
                    <label class="fe-label">
                        <span>🔑</span> סיסמה
                    </label>
                    <input 
                        type="password" 
                        id="feLoginPassword" 
                        class="fe-input"
                        placeholder="הסיסמה שלך"
                        required
                        minlength="6"
                    />
                </div>

                <!-- Messages -->
                <div class="fe-error" id="feLoginError"></div>
                <div class="fe-success" id="feLoginSuccess"></div>

                <!-- Button -->
                <button type="submit" class="fe-btn-primary" id="feLoginBtn">
                    <span>התחבר</span>
                    <span>→</span>
                </button>

            </form>

            <!-- Footer -->
            <div class="fe-login-footer">
                <span>עדיין אין לך חשבון?</span>
                <a href="/register">הירשם עכשיו</a>
            </div>

        </div>
    </div>

    <style>
    /* ============================================
       FlowEco Login Styles
       ============================================ */
    .fe-login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .fe-login-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        padding: 3rem;
        max-width: 480px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        position: relative;
        overflow: hidden;
    }

    .fe-login-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #10B981, #3B82F6, #10B981);
        background-size: 200% 100%;
        animation: feShimmer 3s infinite;
    }

    @keyframes feShimmer {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }

    /* Header */
    .fe-login-header {
        text-align: center;
        margin-bottom: 2.5rem;
    }

    .fe-logo {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
    }

    .fe-logo-icon {
        font-size: 3rem;
        line-height: 1;
    }

    .fe-logo-text {
        font-size: 2rem;
        font-weight: 700;
        background: linear-gradient(135deg, #10B981, #3B82F6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .fe-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #F9FAFB !important;
        margin: 0 0 0.5rem 0;
    }

    .fe-subtitle {
        font-size: 0.95rem;
        color: #9CA3AF !important;
        margin: 0;
    }

    /* Form */
    .fe-login-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .fe-form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .fe-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #F9FAFB !important;
    }

    .fe-input {
        background: rgba(255, 255, 255, 0.08) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 12px !important;
        padding: 0.875rem 1rem !important;
        font-size: 1rem !important;
        color: #F9FAFB !important;
        transition: all 0.3s ease;
        width: 100%;
        box-sizing: border-box;
    }

    .fe-input:focus {
        outline: none !important;
        border-color: #10B981 !important;
        background: rgba(255, 255, 255, 0.12) !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }

    .fe-input::placeholder {
        color: #6B7280 !important;
    }

    /* Messages */
    .fe-error {
        display: none;
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        padding: 0.875rem 1rem;
        color: #FCA5A5 !important;
        font-size: 0.875rem;
    }

    .fe-error.show {
        display: block;
    }

    .fe-success {
        display: none;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 12px;
        padding: 0.875rem 1rem;
        color: #6EE7B7 !important;
        font-size: 0.875rem;
    }

    .fe-success.show {
        display: block;
    }

    /* Button */
    .fe-btn-primary {
        background: linear-gradient(135deg, #3B82F6, #2563EB) !important;
        border: none !important;
        border-radius: 12px !important;
        padding: 1rem 1.5rem !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        color: white !important;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        width: 100%;
    }

    .fe-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .fe-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    /* Footer */
    .fe-login-footer {
        text-align: center;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #9CA3AF !important;
    }

    .fe-login-footer a {
        color: #10B981 !important;
        font-weight: 600;
        text-decoration: none;
    }

    .fe-login-footer a:hover {
        color: #059669 !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .fe-login-card {
            padding: 2rem 1.5rem;
        }

        .fe-logo-icon {
            font-size: 2.5rem;
        }

        .fe-logo-text {
            font-size: 1.75rem;
        }

        .fe-title {
            font-size: 1.5rem;
        }
    }
    </style>

    <script>
    (function() {
        // Prevent duplicate initialization
        if (window.feLoginInitialized) return;
        window.feLoginInitialized = true;

        var API_BASE = 'https://floweco-api.razazulai.workers.dev';

        // Check if already logged in
        var token = localStorage.getItem('floweco_token');
        if (token) {
            window.location.href = '/dashboard';
            return;
        }

        // Wait for DOM
        document.addEventListener('DOMContentLoaded', function() {
            var form = document.getElementById('feLoginForm');
            if (!form) return;

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin();
            });
        });

        function handleLogin() {
            var email = document.getElementById('feLoginEmail').value.trim();
            var password = document.getElementById('feLoginPassword').value;
            var btn = document.getElementById('feLoginBtn');
            var errorEl = document.getElementById('feLoginError');
            var successEl = document.getElementById('feLoginSuccess');

            // Hide messages
            errorEl.className = 'fe-error';
            successEl.className = 'fe-success';

            // Disable button
            btn.disabled = true;
            btn.innerHTML = '<span>מתחבר...</span>';

            // API Call
            fetch(API_BASE + '/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.success) {
                    // Save token
                    localStorage.setItem('floweco_token', data.data.token);
                    localStorage.setItem('floweco_user', JSON.stringify(data.data.user));

                    // Show success
                    successEl.textContent = '✅ התחברת בהצלחה! מעביר לדשבורד...';
                    successEl.className = 'fe-success show';

                    // Redirect
                    setTimeout(function() {
                        window.location.href = '/dashboard';
                    }, 1000);
                } else {
                    // Show error
                    errorEl.textContent = '⚠️ ' + (data.error || 'שגיאה בהתחברות');
                    errorEl.className = 'fe-error show';
                    btn.disabled = false;
                    btn.innerHTML = '<span>התחבר</span><span>→</span>';
                }
            })
            .catch(function(error) {
                console.error('Login error:', error);
                errorEl.textContent = '⚠️ שגיאת רשת. בדוק את החיבור לאינטרנט.';
                errorEl.className = 'fe-error show';
                btn.disabled = false;
                btn.innerHTML = '<span>התחבר</span><span>→</span>';
            });
        }
    })();
    </script>
    <?php
    return ob_get_clean();
});