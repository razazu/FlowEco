<?php
add_shortcode('floweco_admin_panel', function() {
    return '
<div class="admin-panel-v2">

    <!-- ========== HEADER ========== -->
    <div class="adm-header">
        <div class="adm-header-top">
            <div>
                <h1 class="adm-title">👑 פאנל ניהול</h1>
                <p class="adm-subtitle">שליטה מלאה על המערכת והמשתמשים</p>
            </div>
            <button class="adm-btn adm-btn-primary" onclick="FlowEcoAdmin.openAddUser()">
                <span>➕</span>
                <span>משתמש חדש</span>
            </button>
        </div>

        <!-- Stats Cards -->
        <div class="adm-stats-grid" id="admStatsGrid">
            <div class="adm-stat-card" style="--card-color: #667eea;">
                <div class="adm-stat-icon">👥</div>
                <div class="adm-stat-content">
                    <span class="adm-stat-label">סה"כ משתמשים</span>
                    <span class="adm-stat-value" id="statTotalUsers">0</span>
                </div>
            </div>
            <div class="adm-stat-card" style="--card-color: #10b981;">
                <div class="adm-stat-icon">🆓</div>
                <div class="adm-stat-content">
                    <span class="adm-stat-label">משתמשים Free</span>
                    <span class="adm-stat-value" id="statFreeUsers">0</span>
                </div>
            </div>
            <div class="adm-stat-card" style="--card-color: #f59e0b;">
                <div class="adm-stat-icon">🧪</div>
                <div class="adm-stat-content">
                    <span class="adm-stat-label">בתקופת ניסיון</span>
                    <span class="adm-stat-value" id="statTrialUsers">0</span>
                </div>
            </div>
            <div class="adm-stat-card" style="--card-color: #8b5cf6;">
                <div class="adm-stat-icon">💎</div>
                <div class="adm-stat-content">
                    <span class="adm-stat-label">מנויי Pro</span>
                    <span class="adm-stat-value" id="statProUsers">0</span>
                </div>
            </div>
            <div class="adm-stat-card" style="--card-color: #ec4899;">
                <div class="adm-stat-icon">📈</div>
                <div class="adm-stat-content">
                    <span class="adm-stat-label">הצטרפו השבוע</span>
                    <span class="adm-stat-value" id="statNewUsers">0</span>
                </div>
            </div>
            <div class="adm-stat-card" style="--card-color: #06b6d4;">
                <div class="adm-stat-icon">⚡</div>
                <div class="adm-stat-content">
                    <span class="adm-stat-label">משתמשים פעילים</span>
                    <span class="adm-stat-value" id="statActiveUsers">0</span>
                </div>
            </div>
        </div>
    </div>

    <!-- ========== USERS SECTION ========== -->
    <div class="adm-section">
        <div class="adm-section-header">
            <h2>👥 ניהול משתמשים</h2>
            <div class="adm-filters">
                <input type="text" class="adm-search" id="userSearch" placeholder="🔍 חיפוש..." oninput="FlowEcoAdmin.filterUsers()">
                <select class="adm-select" id="planFilter" onchange="FlowEcoAdmin.filterUsers()">
                    <option value="all">כל התוכניות</option>
                    <option value="free">🆓 Free</option>
                    <option value="trial">🧪 Trial</option>
                    <option value="pro">💎 Pro</option>
                </select>
                <select class="adm-select" id="roleFilter" onchange="FlowEcoAdmin.filterUsers()">
                    <option value="all">כל התפקידים</option>
                    <option value="admin">👑 Admin</option>
                    <option value="user">👤 משתמש</option>
                </select>
            </div>
        </div>

        <div class="adm-table-container">
            <table class="adm-table">
                <thead>
                    <tr>
                        <th>משתמש</th>
                        <th>תוכנית</th>
                        <th>תפקיד</th>
                        <th>תאריך הצטרפות</th>
                        <th>פעולות</th>
                    </tr>
                </thead>
                <tbody id="usersTableBody">
                    <tr>
                        <td colspan="5" class="adm-loading">טוען משתמשים...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="adm-pagination" id="usersPagination"></div>
    </div>

    <!-- ========== FEEDBACK SECTION ========== -->
    <div class="adm-section">
        <div class="adm-accordion">
            <button class="adm-accordion-toggle" onclick="FlowEcoAdmin.toggleFeedback()">
                <span>💬 משובים מהמשתמשים</span>
                <span class="adm-accordion-icon" id="feedbackIcon">▼</span>
            </button>
            <div class="adm-accordion-content" id="feedbackContent">
                <div class="adm-filters" style="margin-bottom: 1rem;">
                    <select class="adm-select" id="feedbackStatusFilter" onchange="FlowEcoAdmin.filterFeedbacks()">
                        <option value="all">כל הסטטוסים</option>
                        <option value="new">חדש</option>
                        <option value="in-progress">בטיפול</option>
                        <option value="resolved">טופל</option>
                    </select>
                    <select class="adm-select" id="feedbackCategoryFilter" onchange="FlowEcoAdmin.filterFeedbacks()">
                        <option value="all">כל הסוגים</option>
                        <option value="bug">🐛 באג</option>
                        <option value="feature">💡 הצעה</option>
                        <option value="question">❓ שאלה</option>
                    </select>
                </div>
                <div class="adm-table-container">
                    <table class="adm-table">
                        <thead>
                            <tr>
                                <th>משתמש</th>
                                <th>סוג</th>
                                <th>הודעה</th>
                                <th>סטטוס</th>
                                <th>תאריך</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody id="feedbackTableBody">
                            <tr>
                                <td colspan="6" class="adm-loading">טוען משובים...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

</div>

<!-- ========== VIEW USER MODAL ========== -->
<div class="adm-modal-overlay" id="modalViewUser">
    <div class="adm-modal adm-modal-lg">
        <div class="adm-modal-header">
            <h2>👁️ פרטי משתמש</h2>
            <button class="adm-modal-close" onclick="FlowEcoAdmin.closeModal(\'modalViewUser\')">&times;</button>
        </div>
        <div class="adm-modal-body" id="viewUserContent">
            <!-- יתמלא דינמית -->
        </div>
    </div>
</div>

<!-- ========== EDIT USER MODAL ========== -->
<div class="adm-modal-overlay" id="modalEditUser">
    <div class="adm-modal">
        <div class="adm-modal-header">
            <h2>✏️ עריכת משתמש</h2>
            <button class="adm-modal-close" onclick="FlowEcoAdmin.closeModal(\'modalEditUser\')">&times;</button>
        </div>
        <form id="formEditUser" onsubmit="FlowEcoAdmin.saveUser(event)">
            <div class="adm-modal-body">
                <input type="hidden" id="editUserId">
                <div class="adm-form-grid">
                    <div class="adm-form-group full-width">
                        <label>שם מלא *</label>
                        <input type="text" class="adm-input" id="editUserName" required>
                    </div>
                    <div class="adm-form-group full-width">
                        <label>אימייל *</label>
                        <input type="email" class="adm-input" id="editUserEmail" required>
                    </div>
                    <div class="adm-form-group">
                        <label>תוכנית</label>
                        <select class="adm-input" id="editUserPlan">
                            <option value="free">🆓 Free</option>
                            <option value="trial">🧪 Trial</option>
                            <option value="pro">💎 Pro</option>
                        </select>
                    </div>
                    <div class="adm-form-group">
                        <label>תפקיד</label>
                        <select class="adm-input" id="editUserRole">
                            <option value="user">👤 משתמש</option>
                            <option value="admin">👑 Admin</option>
                        </select>
                    </div>
                    <div class="adm-form-group">
                        <label>סטטוס מנוי</label>
                        <select class="adm-input" id="editUserSubStatus">
                            <option value="active">✅ פעיל</option>
                            <option value="expired">⏰ פג תוקף</option>
                            <option value="cancelled">❌ בוטל</option>
                        </select>
                    </div>
                    <div class="adm-form-group">
                        <label>סטטוס חשבון</label>
                        <select class="adm-input" id="editUserStatus">
                            <option value="active">✅ פעיל</option>
                            <option value="blocked">🚫 חסום</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="adm-modal-footer">
                <button type="button" class="adm-btn adm-btn-cancel" onclick="FlowEcoAdmin.closeModal(\'modalEditUser\')">ביטול</button>
                <button type="submit" class="adm-btn adm-btn-save">💾 שמור</button>
            </div>
        </form>
    </div>
</div>

<!-- ========== RESET PASSWORD MODAL ========== -->
<div class="adm-modal-overlay" id="modalResetPassword">
    <div class="adm-modal">
        <div class="adm-modal-header">
            <h2>🔄 איפוס סיסמה</h2>
            <button class="adm-modal-close" onclick="FlowEcoAdmin.closeModal(\'modalResetPassword\')">&times;</button>
        </div>
        <form id="formResetPassword" onsubmit="FlowEcoAdmin.resetPassword(event)">
            <div class="adm-modal-body">
                <input type="hidden" id="resetUserId">
                <div class="adm-warning-box">
                    ⚠️ הסיסמה החדשה תחליף את הקיימת מיידית
                </div>
                <div class="adm-user-info-box" id="resetUserInfo"></div>
                <div class="adm-form-group">
                    <label>סיסמה חדשה *</label>
                    <input type="password" class="adm-input" id="resetNewPassword" required minlength="6">
                </div>
                <div class="adm-form-group">
                    <label>אימות סיסמה *</label>
                    <input type="password" class="adm-input" id="resetConfirmPassword" required minlength="6">
                </div>
            </div>
            <div class="adm-modal-footer">
                <button type="button" class="adm-btn adm-btn-cancel" onclick="FlowEcoAdmin.closeModal(\'modalResetPassword\')">ביטול</button>
                <button type="submit" class="adm-btn adm-btn-warning">🔄 אפס סיסמה</button>
            </div>
        </form>
    </div>
</div>

<!-- ========== DELETE USER MODAL ========== -->
<div class="adm-modal-overlay" id="modalDeleteUser">
    <div class="adm-modal">
        <div class="adm-modal-header adm-modal-header-danger">
            <h2>🗑️ מחיקת משתמש</h2>
            <button class="adm-modal-close" onclick="FlowEcoAdmin.closeModal(\'modalDeleteUser\')">&times;</button>
        </div>
        <form id="formDeleteUser" onsubmit="FlowEcoAdmin.deleteUser(event)">
            <div class="adm-modal-body">
                <input type="hidden" id="deleteUserId">
                <div class="adm-danger-box">
                    ⚠️ פעולה בלתי הפיכה! כל נתוני המשתמש יימחקו לצמיתות
                </div>
                <div class="adm-user-info-box" id="deleteUserInfo"></div>
                <div class="adm-form-group">
                    <label class="adm-checkbox">
                        <input type="checkbox" id="deleteConfirm" required>
                        <span>אני מאשר/ת את המחיקה ומבין/ה שלא ניתן לשחזר</span>
                    </label>
                </div>
            </div>
            <div class="adm-modal-footer">
                <button type="button" class="adm-btn adm-btn-cancel" onclick="FlowEcoAdmin.closeModal(\'modalDeleteUser\')">ביטול</button>
                <button type="submit" class="adm-btn adm-btn-danger">🗑️ מחק לצמיתות</button>
            </div>
        </form>
    </div>
</div>

<!-- ========== ADD USER MODAL ========== -->
<div class="adm-modal-overlay" id="modalAddUser">
    <div class="adm-modal">
        <div class="adm-modal-header adm-modal-header-success">
            <h2>➕ משתמש חדש</h2>
            <button class="adm-modal-close" onclick="FlowEcoAdmin.closeModal(\'modalAddUser\')">&times;</button>
        </div>
        <form id="formAddUser" onsubmit="FlowEcoAdmin.addUser(event)">
            <div class="adm-modal-body">
                <div class="adm-form-grid">
                    <div class="adm-form-group full-width">
                        <label>שם מלא *</label>
                        <input type="text" class="adm-input" id="addUserName" required minlength="2">
                    </div>
                    <div class="adm-form-group full-width">
                        <label>אימייל *</label>
                        <input type="email" class="adm-input" id="addUserEmail" required>
                    </div>
                    <div class="adm-form-group full-width">
                        <label>סיסמה *</label>
                        <input type="password" class="adm-input" id="addUserPassword" required minlength="6">
                        <button type="button" class="adm-btn-link" onclick="FlowEcoAdmin.generatePassword()">🎲 צור סיסמה</button>
                    </div>
                    <div class="adm-form-group">
                        <label>תפקיד</label>
                        <select class="adm-input" id="addUserRole">
                            <option value="user">👤 משתמש</option>
                            <option value="admin">👑 Admin</option>
                        </select>
                    </div>
                    <div class="adm-form-group">
                        <label>סטטוס</label>
                        <select class="adm-input" id="addUserStatus">
                            <option value="active">✅ פעיל</option>
                            <option value="blocked">🚫 חסום</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="adm-modal-footer">
                <button type="button" class="adm-btn adm-btn-cancel" onclick="FlowEcoAdmin.closeModal(\'modalAddUser\')">ביטול</button>
                <button type="submit" class="adm-btn adm-btn-success">➕ צור משתמש</button>
            </div>
        </form>
    </div>
</div>

<!-- ========== VIEW FEEDBACK MODAL ========== -->
<div class="adm-modal-overlay" id="modalViewFeedback">
    <div class="adm-modal">
        <div class="adm-modal-header">
            <h2>💬 צפייה במשוב</h2>
            <button class="adm-modal-close" onclick="FlowEcoAdmin.closeModal(\'modalViewFeedback\')">&times;</button>
        </div>
        <div class="adm-modal-body" id="viewFeedbackContent"></div>
    </div>
</div>

<!-- ========== EDIT FEEDBACK MODAL ========== -->
<div class="adm-modal-overlay" id="modalEditFeedback">
    <div class="adm-modal">
        <div class="adm-modal-header">
            <h2>✏️ עדכון משוב</h2>
            <button class="adm-modal-close" onclick="FlowEcoAdmin.closeModal(\'modalEditFeedback\')">&times;</button>
        </div>
        <form id="formEditFeedback" onsubmit="FlowEcoAdmin.saveFeedback(event)">
            <div class="adm-modal-body">
                <input type="hidden" id="editFeedbackId">
                <div class="adm-form-group">
                    <label>סטטוס</label>
                    <select class="adm-input" id="editFeedbackStatus">
                        <option value="new">חדש</option>
                        <option value="in-progress">בטיפול</option>
                        <option value="resolved">טופל</option>
                        <option value="closed">סגור</option>
                    </select>
                </div>
                <div class="adm-form-group">
                    <label>הערות Admin</label>
                    <textarea class="adm-input" id="editFeedbackNotes" rows="3"></textarea>
                </div>
            </div>
            <div class="adm-modal-footer">
                <button type="button" class="adm-btn adm-btn-cancel" onclick="FlowEcoAdmin.closeModal(\'modalEditFeedback\')">ביטול</button>
                <button type="submit" class="adm-btn adm-btn-save">💾 שמור</button>
            </div>
        </form>
    </div>
</div>

<!-- Toast -->
<div class="adm-toast" id="admToast"></div>

';
});