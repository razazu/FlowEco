<?php
/**
 * FlowEco Settings Page
 * Shortcode: [floweco_settings]
 * WPCodeBox: PHP, Plugins Loaded
 */

if (!defined('ABSPATH')) exit;

add_shortcode('floweco_settings', function() {
    ob_start();
    ?>
    <div class="fe-settings" dir="rtl">
        
        <!-- Header -->
        <div class="fe-settings-header">
            <h1 class="fe-settings-title">
                <span class="fe-title-icon">⚙️</span>
                הגדרות
            </h1>
            <p class="fe-settings-subtitle">נהל את החשבון וההעדפות שלך</p>
        </div>

        <!-- Settings Grid -->
        <div class="fe-settings-grid">
            
            <!-- Profile Section -->
            <div class="fe-settings-card">
                <div class="fe-card-header">
                    <h3><span>👤</span> פרופיל</h3>
                </div>
                <div class="fe-card-body">
                    <form id="feProfileForm" class="fe-form">
                        <div class="fe-form-group">
                            <label>שם מלא</label>
                            <input type="text" id="feProfileName" class="fe-input" placeholder="השם שלך">
                        </div>
                        <div class="fe-form-group">
                            <label>אימייל</label>
                            <input type="email" id="feProfileEmail" class="fe-input" placeholder="email@example.com">
                        </div>
                        <button type="submit" class="fe-btn fe-btn-primary">
                            <span>💾</span> שמור שינויים
                        </button>
                    </form>
                </div>
            </div>

            <!-- Change Password Section -->
            <div class="fe-settings-card">
                <div class="fe-card-header">
                    <h3><span>🔐</span> שינוי סיסמה</h3>
                </div>
                <div class="fe-card-body">
                    <form id="fePasswordForm" class="fe-form">
                        <div class="fe-form-group">
                            <label>סיסמה נוכחית</label>
                            <input type="password" id="feCurrentPassword" class="fe-input" placeholder="••••••••">
                        </div>
                        <div class="fe-form-group">
                            <label>סיסמה חדשה</label>
                            <input type="password" id="feNewPassword" class="fe-input" placeholder="••••••••">
                        </div>
                        <div class="fe-form-group">
                            <label>אימות סיסמה חדשה</label>
                            <input type="password" id="feConfirmPassword" class="fe-input" placeholder="••••••••">
                        </div>
                        <button type="submit" class="fe-btn fe-btn-primary">
                            <span>🔑</span> עדכן סיסמה
                        </button>
                    </form>
                </div>
            </div>

            <!-- Credit Cards Section -->
            <div class="fe-settings-card wide">
                <div class="fe-card-header">
                    <h3><span>💳</span> כרטיסי אשראי</h3>
                    <button class="fe-btn fe-btn-small" onclick="FlowEcoSettings.openCardModal()">
                        <span>➕</span> הוסף כרטיס
                    </button>
                </div>
                <div class="fe-card-body">
                    <div class="fe-cards-list" id="feCardsList">
                        <!-- Will be populated by JS -->
                        <div class="fe-empty-state">
                            <span>💳</span>
                            <p>אין כרטיסים. הוסף את הכרטיס הראשון שלך!</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Categories Section -->
            <div class="fe-settings-card wide">
                <div class="fe-card-header">
                    <h3><span>🏷️</span> קטגוריות</h3>
                    <button class="fe-btn fe-btn-small" onclick="FlowEcoSettings.openCategoryModal()">
                        <span>➕</span> הוסף קטגוריה
                    </button>
                </div>
                <div class="fe-card-body">
                    <div class="fe-categories-grid" id="feCategoriesList">
                        <!-- Will be populated by JS -->
                    </div>
                </div>
            </div>

            <!-- Display Preferences -->
            <div class="fe-settings-card">
                <div class="fe-card-header">
                    <h3><span>🎨</span> העדפות תצוגה</h3>
                </div>
                <div class="fe-card-body">
                    <form id="fePreferencesForm" class="fe-form">
                        <div class="fe-form-group">
                            <label>מטבע ברירת מחדל</label>
                            <select id="feCurrency" class="fe-select">
                                <option value="ILS" selected>₪ שקל ישראלי</option>
                                <option value="USD">$ דולר אמריקאי</option>
                                <option value="EUR">€ יורו</option>
                            </select>
                        </div>
                        <div class="fe-form-group">
                            <label>יום התחלת חודש</label>
                            <select id="feMonthStart" class="fe-select">
                                <option value="1" selected>1 בחודש</option>
                                <option value="10">10 בחודש</option>
                                <option value="15">15 בחודש</option>
                            </select>
                        </div>
                        <button type="submit" class="fe-btn fe-btn-primary">
                            <span>💾</span> שמור העדפות
                        </button>
                    </form>
                </div>
            </div>

            <!-- Data Management -->
            <div class="fe-settings-card danger">
                <div class="fe-card-header">
                    <h3><span>⚠️</span> ניהול נתונים</h3>
                </div>
                <div class="fe-card-body">
                    <div class="fe-data-actions">
                        <div class="fe-data-action">
                            <div class="fe-data-info">
                                <h4>ייצוא נתונים</h4>
                                <p>הורד את כל הנתונים שלך כקובץ JSON</p>
                            </div>
                            <button class="fe-btn fe-btn-secondary" onclick="FlowEcoSettings.exportData()">
                                <span>📥</span> ייצוא
                            </button>
                        </div>
                        <div class="fe-data-action danger">
                            <div class="fe-data-info">
                                <h4>מחיקת חשבון</h4>
                                <p>מחק את החשבון וכל הנתונים לצמיתות</p>
                            </div>
                            <button class="fe-btn fe-btn-danger" onclick="FlowEcoSettings.confirmDeleteAccount()">
                                <span>🗑️</span> מחק חשבון
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- Add/Edit Card Modal -->
        <div class="fe-modal-overlay" id="feCardModal">
            <div class="fe-modal">
                <div class="fe-modal-header">
                    <h3 id="feCardModalTitle">הוסף כרטיס</h3>
                    <button class="fe-modal-close" onclick="FlowEcoSettings.closeCardModal()">✕</button>
                </div>
                <div class="fe-modal-body">
                    <form id="feCardForm" class="fe-form">
                        <input type="hidden" id="feCardId">
                        <div class="fe-form-group">
                            <label>שם/כינוי הכרטיס</label>
                            <input type="text" id="feCardName" class="fe-input" placeholder="לדוגמה: ויזה כחול" required>
                        </div>
                        <div class="fe-form-group">
                            <label>4 ספרות אחרונות (אופציונלי)</label>
                            <input type="text" id="feCardDigits" class="fe-input" placeholder="1234" maxlength="4" pattern="[0-9]*">
                        </div>
                        <div class="fe-form-group">
                            <label>צבע</label>
                            <div class="fe-color-picker" id="feCardColorPicker">
                                <button type="button" class="fe-color-btn active" data-color="#667eea" style="background: #667eea"></button>
                                <button type="button" class="fe-color-btn" data-color="#EC4899" style="background: #EC4899"></button>
                                <button type="button" class="fe-color-btn" data-color="#10B981" style="background: #10B981"></button>
                                <button type="button" class="fe-color-btn" data-color="#F59E0B" style="background: #F59E0B"></button>
                                <button type="button" class="fe-color-btn" data-color="#3B82F6" style="background: #3B82F6"></button>
                                <button type="button" class="fe-color-btn" data-color="#8B5CF6" style="background: #8B5CF6"></button>
                                <button type="button" class="fe-color-btn" data-color="#EF4444" style="background: #EF4444"></button>
                                <button type="button" class="fe-color-btn" data-color="#06B6D4" style="background: #06B6D4"></button>
                            </div>
                            <input type="hidden" id="feCardColor" value="#667eea">
                        </div>
                        <div class="fe-form-group">
                            <label>יום חיוב בחודש</label>
                            <input type="number" id="feCardBillingDay" class="fe-input" placeholder="10" min="1" max="31">
                        </div>
                    </form>
                </div>
                <div class="fe-modal-footer">
                    <button class="fe-btn fe-btn-secondary" onclick="FlowEcoSettings.closeCardModal()">ביטול</button>
                    <button class="fe-btn fe-btn-primary" onclick="FlowEcoSettings.saveCard()">
                        <span>💾</span> שמור
                    </button>
                </div>
            </div>
        </div>

        <!-- Add/Edit Category Modal -->
        <div class="fe-modal-overlay" id="feCategoryModal">
            <div class="fe-modal">
                <div class="fe-modal-header">
                    <h3 id="feCategoryModalTitle">הוסף קטגוריה</h3>
                    <button class="fe-modal-close" onclick="FlowEcoSettings.closeCategoryModal()">✕</button>
                </div>
                <div class="fe-modal-body">
                    <form id="feCategoryForm" class="fe-form">
                        <input type="hidden" id="feCategoryId">
                        <div class="fe-form-group">
                            <label>שם הקטגוריה</label>
                            <input type="text" id="feCategoryName" class="fe-input" placeholder="לדוגמה: בילויים" required>
                        </div>
                        <div class="fe-form-group">
                            <label>סוג</label>
                            <select id="feCategoryType" class="fe-select">
                                <option value="expense">הוצאה</option>
                                <option value="income">הכנסה</option>
                            </select>
                        </div>
                        <div class="fe-form-group">
                            <label>אייקון</label>
                            <div class="fe-icon-picker" id="feCategoryIconPicker">
                                <button type="button" class="fe-icon-btn active" data-icon="🛒">🛒</button>
                                <button type="button" class="fe-icon-btn" data-icon="🍔">🍔</button>
                                <button type="button" class="fe-icon-btn" data-icon="🚗">🚗</button>
                                <button type="button" class="fe-icon-btn" data-icon="🏠">🏠</button>
                                <button type="button" class="fe-icon-btn" data-icon="💡">💡</button>
                                <button type="button" class="fe-icon-btn" data-icon="📱">📱</button>
                                <button type="button" class="fe-icon-btn" data-icon="🎮">🎮</button>
                                <button type="button" class="fe-icon-btn" data-icon="👕">👕</button>
                                <button type="button" class="fe-icon-btn" data-icon="💊">💊</button>
                                <button type="button" class="fe-icon-btn" data-icon="✈️">✈️</button>
                                <button type="button" class="fe-icon-btn" data-icon="🎓">🎓</button>
                                <button type="button" class="fe-icon-btn" data-icon="💰">💰</button>
                                <button type="button" class="fe-icon-btn" data-icon="🎁">🎁</button>
                                <button type="button" class="fe-icon-btn" data-icon="🏋️">🏋️</button>
                                <button type="button" class="fe-icon-btn" data-icon="🐕">🐕</button>
                                <button type="button" class="fe-icon-btn" data-icon="👶">👶</button>
                            </div>
                            <input type="hidden" id="feCategoryIcon" value="🛒">
                        </div>
                        <div class="fe-form-group">
                            <label>צבע</label>
                            <div class="fe-color-picker" id="feCategoryColorPicker">
                                <button type="button" class="fe-color-btn active" data-color="#667eea" style="background: #667eea"></button>
                                <button type="button" class="fe-color-btn" data-color="#EC4899" style="background: #EC4899"></button>
                                <button type="button" class="fe-color-btn" data-color="#10B981" style="background: #10B981"></button>
                                <button type="button" class="fe-color-btn" data-color="#F59E0B" style="background: #F59E0B"></button>
                                <button type="button" class="fe-color-btn" data-color="#3B82F6" style="background: #3B82F6"></button>
                                <button type="button" class="fe-color-btn" data-color="#8B5CF6" style="background: #8B5CF6"></button>
                                <button type="button" class="fe-color-btn" data-color="#EF4444" style="background: #EF4444"></button>
                                <button type="button" class="fe-color-btn" data-color="#06B6D4" style="background: #06B6D4"></button>
                            </div>
                            <input type="hidden" id="feCategoryColor" value="#667eea">
                        </div>
                    </form>
                </div>
                <div class="fe-modal-footer">
                    <button class="fe-btn fe-btn-secondary" onclick="FlowEcoSettings.closeCategoryModal()">ביטול</button>
                    <button class="fe-btn fe-btn-primary" onclick="FlowEcoSettings.saveCategory()">
                        <span>💾</span> שמור
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="fe-modal-overlay" id="feDeleteModal">
            <div class="fe-modal small">
                <div class="fe-modal-header danger">
                    <h3>⚠️ אישור מחיקה</h3>
                    <button class="fe-modal-close" onclick="FlowEcoSettings.closeDeleteModal()">✕</button>
                </div>
                <div class="fe-modal-body">
                    <p id="feDeleteMessage">האם אתה בטוח שברצונך למחוק?</p>
                    <p class="fe-warning-text">פעולה זו לא ניתנת לביטול!</p>
                </div>
                <div class="fe-modal-footer">
                    <button class="fe-btn fe-btn-secondary" onclick="FlowEcoSettings.closeDeleteModal()">ביטול</button>
                    <button class="fe-btn fe-btn-danger" id="feDeleteConfirmBtn">
                        <span>🗑️</span> מחק
                    </button>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="fe-settings-footer">
            <div class="fe-footer-brand">
                <span class="fe-footer-logo">💰</span>
                <span class="fe-footer-name">FlowEco</span>
                <span class="fe-footer-version">גרסה 2.0</span>
            </div>
            <div class="fe-footer-contact">
                <span class="fe-footer-title">צור קשר</span>
                <div class="fe-footer-links">
                    <a href="mailto:info@razazulay.com" class="fe-footer-link">
                        <span>📧</span> info@razazulay.com
                    </a>
                    <a href="tel:0558989018" class="fe-footer-link">
                        <span>📞</span> 055-898-9018
                    </a>
                    <a href="https://wa.me/972558989018" target="_blank" class="fe-footer-link whatsapp">
                        <span>💬</span> WhatsApp
                    </a>
                </div>
            </div>
            <div class="fe-footer-copy">
                © 2025 FlowEco by <a href="https://flowraz.io" target="_blank">FlowRaz</a>. כל הזכויות שמורות.
            </div>
        </div>

        <!-- Toast Messages -->
        <div class="fe-toast-container" id="feToastContainer"></div>

    </div>
    <?php
    return ob_get_clean();
});