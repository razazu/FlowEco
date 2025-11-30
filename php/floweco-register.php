<?php
/**
 * FlowEco Register Page
 * Shortcode: [floweco_register]
 * WPCodeBox: PHP, Frontend, Plugins Loaded
 */

if (!defined('ABSPATH')) exit;

add_shortcode('floweco_register', function() {
    ob_start();
    ?>
    <div class="fe-register-page" dir="rtl">
        <div class="fe-register-card">
            
            <!-- Header -->
            <div class="fe-register-header">
                <div class="fe-logo">
                    <span class="fe-logo-icon">💰</span>
                    <span class="fe-logo-text">FlowEco</span>
                </div>
                <h1 class="fe-title">יצירת חשבון חדש</h1>
                <p class="fe-subtitle">הצטרף אלינו וקח שליטה על הכספים שלך</p>
            </div>

            <!-- Form -->
            <form class="fe-register-form" id="feRegisterForm">
                
                <!-- Name -->
                <div class="fe-form-group">
                    <label class="fe-label">
                        <span>👤</span> שם מלא
                    </label>
                    <input 
                        type="text" 
                        id="feRegisterName" 
                        class="fe-input"
                        placeholder="לדוגמה: רז אזולאי"
                        required
                        minlength="2"
                    />
                </div>

                <!-- Email -->
                <div class="fe-form-group">
                    <label class="fe-label">
                        <span>📧</span> אימייל
                    </label>
                    <input 
                        type="email" 
                        id="feRegisterEmail" 
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
                        id="feRegisterPassword" 
                        class="fe-input"
                        placeholder="לפחות 6 תווים"
                        required
                        minlength="6"
                    />
                    <span class="fe-hint">הסיסמה חייבת להכיל לפחות 6 תווים</span>
                </div>

                <!-- Messages -->
                <div class="fe-error" id="feRegisterError"></div>
                <div class="fe-success" id="feRegisterSuccess"></div>

                <!-- Button -->
                <button type="submit" class="fe-btn-success" id="feRegisterBtn">
                    <span>הרשם עכשיו</span>
                    <span>→</span>
                </button>

            </form>

            <!-- Footer -->
            <div class="fe-register-footer">
                <span>כבר יש לך חשבון?</span>
                <a href="/login">התחבר כאן</a>
            </div>

        </div>
    </div>

    <style>
    /* ============================================
       FlowEco Register Styles
       ============================================ */
    .fe-register-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .fe-register-card {
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

    .fe-register-card::before {
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
    .fe-register-header {
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
    .fe-register-form {
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

    .fe-hint {
        font-size: 0.75rem;
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
    .fe-btn-success {
        background: linear-gradient(135deg, #10B981, #059669) !important;
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
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        width: 100%;
    }

    .fe-btn-success:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .fe-btn-success:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }

    /* Footer */
    .fe-register-footer {
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

    .fe-register-footer a {
        color: #10B981 !important;
        font-weight: 600;
        text-decoration: none;
    }

    .fe-register-footer a:hover {
        color: #059669 !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .fe-register-card {
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
        if (window.feRegisterInitialized) return;
        window.feRegisterInitialized = true;

        var API_BASE = 'https://floweco-api.razazulai.workers.dev';

        // Check if already logged in
        var token = localStorage.getItem('floweco_token');
        if (token) {
            window.location.href = '/dashboard';
            return;
        }

        // Wait for DOM
        document.addEventListener('DOMContentLoaded', function() {
            var form = document.getElementById('feRegisterForm');
            if (!form) return;

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                handleRegister();
            });
        });

        function handleRegister() {
            var name = document.getElementById('feRegisterName').value.trim();
            var email = document.getElementById('feRegisterEmail').value.trim();
            var password = document.getElementById('feRegisterPassword').value;
            var btn = document.getElementById('feRegisterBtn');
            var errorEl = document.getElementById('feRegisterError');
            var successEl = document.getElementById('feRegisterSuccess');

            // Hide messages
            errorEl.className = 'fe-error';
            successEl.className = 'fe-success';

            // Disable button
            btn.disabled = true;
            btn.innerHTML = '<span>נרשם...</span>';

            // API Call
            fetch(API_BASE + '/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
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
                    successEl.textContent = '✅ נרשמת בהצלחה! מעביר לדשבורד...';
                    successEl.className = 'fe-success show';

                    // Redirect
                    setTimeout(function() {
                        window.location.href = '/dashboard';
                    }, 1500);
                } else {
                    // Show error
                    errorEl.textContent = '⚠️ ' + (data.error || 'שגיאה ברישום');
                    errorEl.className = 'fe-error show';
                    btn.disabled = false;
                    btn.innerHTML = '<span>הרשם עכשיו</span><span>→</span>';
                }
            })
            .catch(function(error) {
                console.error('Register error:', error);
                errorEl.textContent = '⚠️ שגיאת רשת. בדוק את החיבור לאינטרנט.';
                errorEl.className = 'fe-error show';
                btn.disabled = false;
                btn.innerHTML = '<span>הרשם עכשיו</span><span>→</span>';
            });
        }
    })();
    </script>
    <?php
    return ob_get_clean();
});