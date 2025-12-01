// ========================================
// FlowEco Admin Panel v2 - Core Logic
// ========================================

(function() {
    'use strict';

    // Guard
    if (!document.querySelector('.admin-panel-v2')) return;

    console.log('👑 FlowEco Admin Panel v2 Loading...');

    // ========================================
    // CONFIG & STATE
    // ========================================

    var API_URL = 'https://floweco-api.razazulai.workers.dev';

    var state = {
        users: [],
        filteredUsers: [],
        feedbacks: [],
        filteredFeedbacks: [],
        currentPage: 1,
        usersPerPage: 10
    };

    // ========================================
    // AUTH CHECK
    // ========================================

    var token = localStorage.getItem('floweco_token');
    var user = null;
    
    try {
        user = JSON.parse(localStorage.getItem('floweco_user') || '{}');
    } catch (e) {
        user = {};
    }

    if (!token) {
        alert('נדרשת התחברות');
        window.location.href = '/login';
        return;
    }

    // ========================================
    // API HELPERS
    // ========================================

    function apiRequest(endpoint, method, body) {
        method = method || 'GET';
        
        var options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }

        return fetch(API_URL + endpoint, options).then(function(res) {
            return res.json();
        });
    }

    // ========================================
    // LOAD STATS
    // ========================================

    function loadStats() {
        apiRequest('/api/admin/stats').then(function(res) {
            if (res.success && res.data) {
                var stats = res.data;
                setEl('statTotalUsers', stats.totalUsers || 0);
                setEl('statFreeUsers', stats.freeUsers || 0);
                setEl('statTrialUsers', stats.trialUsers || 0);
                setEl('statProUsers', stats.proUsers || 0);
                setEl('statNewUsers', stats.newUsersThisWeek || 0);
                setEl('statActiveUsers', stats.activeUsers || 0);
            }
        }).catch(function(err) {
            console.error('Error loading stats:', err);
        });
    }

    function setEl(id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    // ========================================
    // LOAD USERS
    // ========================================

    function loadUsers() {
        apiRequest('/api/admin/users').then(function(res) {
            if (res.success) {
                state.users = res.data || [];
                state.filteredUsers = state.users.slice();
                renderUsers();
            } else {
                showTableError('usersTableBody', res.error || 'שגיאה בטעינת משתמשים');
            }
        }).catch(function(err) {
            showTableError('usersTableBody', err.message);
        });
    }

    function filterUsers() {
        var search = (document.getElementById('userSearch').value || '').toLowerCase();
        var plan = document.getElementById('planFilter').value;
        var role = document.getElementById('roleFilter').value;

        state.filteredUsers = state.users.filter(function(u) {
            var matchSearch = u.name.toLowerCase().indexOf(search) !== -1 || 
                            u.email.toLowerCase().indexOf(search) !== -1;
            var matchPlan = plan === 'all' || u.subscription_plan === plan;
            var matchRole = role === 'all' || u.role === role;
            return matchSearch && matchPlan && matchRole;
        });

        state.currentPage = 1;
        renderUsers();
    }

    function renderUsers() {
        var tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        if (state.filteredUsers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="adm-loading">לא נמצאו משתמשים</td></tr>';
            renderPagination();
            return;
        }

        var start = (state.currentPage - 1) * state.usersPerPage;
        var end = start + state.usersPerPage;
        var pageUsers = state.filteredUsers.slice(start, end);

        var html = '';
        for (var i = 0; i < pageUsers.length; i++) {
            var u = pageUsers[i];
            var initial = (u.name || 'U').charAt(0).toUpperCase();
            var date = formatDate(u.created_at);
            var planBadge = getPlanBadge(u.subscription_plan);
            var isAdmin = u.is_admin === 1 || u.is_admin === true || u.role === 'admin';
            var roleBadge = isAdmin ? 
                '<span class="adm-badge adm-badge-admin">👑 Admin</span>' : 
                '<span class="adm-badge adm-badge-user">👤 משתמש</span>';

            html += '<tr>' +
                '<td>' +
                    '<div class="adm-user-cell">' +
                        '<div class="adm-user-avatar">' + initial + '</div>' +
                        '<div class="adm-user-info">' +
                            '<div class="adm-user-name">' + u.name + '</div>' +
                            '<div class="adm-user-email">' + u.email + '</div>' +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '<td>' + planBadge + '</td>' +
                '<td>' + roleBadge + '</td>' +
                '<td>' + date + '</td>' +
                '<td>' +
                    '<div class="adm-actions">' +
                        '<button class="adm-action-btn" onclick="FlowEcoAdmin.viewUser(\'' + u.id + '\')" title="צפייה">👁️</button>' +
                        '<button class="adm-action-btn" onclick="FlowEcoAdmin.editUser(\'' + u.id + '\')" title="עריכה">✏️</button>' +
                        '<button class="adm-action-btn" onclick="FlowEcoAdmin.openResetPassword(\'' + u.id + '\')" title="איפוס סיסמה">🔄</button>' +
                        '<button class="adm-action-btn" onclick="FlowEcoAdmin.openDeleteUser(\'' + u.id + '\')" title="מחיקה">🗑️</button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
        }

        tbody.innerHTML = html;
        renderPagination();
    }

    function renderPagination() {
        var container = document.getElementById('usersPagination');
        if (!container) return;

        var total = Math.ceil(state.filteredUsers.length / state.usersPerPage);
        if (total <= 1) {
            container.innerHTML = '<span class="adm-page-info">' + state.filteredUsers.length + ' משתמשים</span>';
            return;
        }

        var html = '<button class="adm-page-btn" onclick="FlowEcoAdmin.changePage(' + (state.currentPage - 1) + ')"' + 
                   (state.currentPage === 1 ? ' disabled' : '') + '>←</button>';
        
        for (var p = 1; p <= total; p++) {
            html += '<button class="adm-page-btn' + (p === state.currentPage ? ' active' : '') + 
                    '" onclick="FlowEcoAdmin.changePage(' + p + ')">' + p + '</button>';
        }
        
        html += '<button class="adm-page-btn" onclick="FlowEcoAdmin.changePage(' + (state.currentPage + 1) + ')"' + 
                (state.currentPage === total ? ' disabled' : '') + '>→</button>';
        html += '<span class="adm-page-info">' + state.filteredUsers.length + ' משתמשים</span>';

        container.innerHTML = html;
    }

    function changePage(page) {
        var total = Math.ceil(state.filteredUsers.length / state.usersPerPage);
        if (page < 1 || page > total) return;
        state.currentPage = page;
        renderUsers();
    }

    function getPlanBadge(plan) {
        switch (plan) {
            case 'trial': return '<span class="adm-badge adm-badge-trial">🧪 Trial</span>';
            case 'pro': return '<span class="adm-badge adm-badge-pro">💎 Pro</span>';
            default: return '<span class="adm-badge adm-badge-free">🆓 Free</span>';
        }
    }

    // ========================================
    // VIEW USER
    // ========================================

    function viewUser(userId) {
        var content = document.getElementById('viewUserContent');
        content.innerHTML = '<div class="adm-loading">טוען...</div>';
        openModal('modalViewUser');

        apiRequest('/api/admin/users/' + userId + '/stats').then(function(res) {
            if (!res.success) {
                content.innerHTML = '<div class="adm-danger-box">' + (res.error || 'שגיאה') + '</div>';
                return;
            }

            var data = res.data;
            var u = data.user;
            var activity = data.activity;
            var initial = (u.name || 'U').charAt(0).toUpperCase();

            var html = '<div class="adm-view-header">' +
                '<div class="adm-view-avatar">' + initial + '</div>' +
                '<div class="adm-view-info">' +
                    '<h3>' + u.name + '</h3>' +
                    '<p>' + u.email + '</p>' +
                    '<span class="adm-badge adm-badge-' + (u.subscription_plan || 'free') + '">' + (u.subscription_plan || 'free') + '</span>' +
                    (u.is_admin ? ' <span class="adm-badge adm-badge-admin">מנהל</span>' : '') +
                '</div>' +
            '</div>';

            // Activity Stats
            html += '<div class="adm-view-stats">' +
                '<div class="adm-view-stat">' +
                    '<div class="adm-view-stat-value">' + (activity.totalActions || 0) + '</div>' +
                    '<div class="adm-view-stat-label">פעולות</div>' +
                '</div>' +
                '<div class="adm-view-stat">' +
                    '<div class="adm-view-stat-value">' + (activity.expensesCount || 0) + '</div>' +
                    '<div class="adm-view-stat-label">הוצאות</div>' +
                '</div>' +
                '<div class="adm-view-stat">' +
                    '<div class="adm-view-stat-value">' + (activity.incomesCount || 0) + '</div>' +
                    '<div class="adm-view-stat-label">הכנסות</div>' +
                '</div>' +
                '<div class="adm-view-stat">' +
                    '<div class="adm-view-stat-value">' + (activity.budgetsCount || 0) + '</div>' +
                    '<div class="adm-view-stat-label">תקציבים</div>' +
                '</div>' +
                '<div class="adm-view-stat">' +
                    '<div class="adm-view-stat-value">' + (activity.cardsCount || 0) + '</div>' +
                    '<div class="adm-view-stat-label">כרטיסים</div>' +
                '</div>' +
            '</div>';

            // Activity Details
            html += '<div class="adm-view-section"><h4>📊 פרטי פעילות</h4>';
            html += '<div class="adm-activity-details">';
            
            // Activity Level with color
            var levelClass = 'inactive';
            if (activity.activityLevel === 'פעיל מאוד') levelClass = 'very-active';
            else if (activity.activityLevel === 'פעיל') levelClass = 'active';
            else if (activity.activityLevel === 'פעיל חלקית') levelClass = 'partial';
            else if (activity.activityLevel === 'התחיל להשתמש') levelClass = 'started';
            
            html += '<div class="adm-activity-item">' +
                '<span class="adm-activity-label">📈 רמת פעילות:</span>' +
                '<span class="adm-activity-value adm-level-' + levelClass + '">' + activity.activityLevel + '</span>' +
            '</div>';
            
            html += '<div class="adm-activity-item">' +
                '<span class="adm-activity-label">📅 תאריך הרשמה:</span>' +
                '<span class="adm-activity-value">' + formatDate(activity.registeredAt) + '</span>' +
            '</div>';
            
            html += '<div class="adm-activity-item">' +
                '<span class="adm-activity-label">🕐 פעילות אחרונה:</span>' +
                '<span class="adm-activity-value">' + formatDate(activity.lastActivity) + '</span>' +
            '</div>';
            
            // Days since registration
            var regDate = new Date(activity.registeredAt);
            var today = new Date();
            var daysSinceReg = Math.floor((today - regDate) / (1000 * 60 * 60 * 24));
            
            html += '<div class="adm-activity-item">' +
                '<span class="adm-activity-label">⏱️ ימים מאז הרשמה:</span>' +
                '<span class="adm-activity-value">' + daysSinceReg + ' ימים</span>' +
            '</div>';
            
            html += '</div></div>';

            content.innerHTML = html;
        }).catch(function(err) {
            content.innerHTML = '<div class="adm-danger-box">' + err.message + '</div>';
        });
    }

    // ========================================
    // EDIT USER
    // ========================================

    function editUser(userId) {
        var user = findUser(userId);
        if (!user) return;

        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserPlan').value = user.subscription_plan || 'free';
        // Check is_admin field from database
        var isAdmin = user.is_admin === 1 || user.is_admin === true;
        document.getElementById('editUserRole').value = isAdmin ? 'admin' : 'user';
        document.getElementById('editUserSubStatus').value = user.subscription_status || 'active';
        document.getElementById('editUserStatus').value = user.account_status || user.status || 'active';

        openModal('modalEditUser');
    }

    function saveUser(e) {
        e.preventDefault();

        var id = document.getElementById('editUserId').value;
        var data = {
            name: document.getElementById('editUserName').value,
            email: document.getElementById('editUserEmail').value,
            subscription_plan: document.getElementById('editUserPlan').value,
            role: document.getElementById('editUserRole').value,
            subscription_status: document.getElementById('editUserSubStatus').value,
            status: document.getElementById('editUserStatus').value
        };

        apiRequest('/api/admin/users/' + id, 'PUT', data).then(function(res) {
            if (res.success) {
                showToast('משתמש עודכן בהצלחה! ✅');
                closeModal('modalEditUser');
                loadUsers();
                loadStats();
            } else {
                alert('שגיאה: ' + (res.error || 'לא ידוע'));
            }
        }).catch(function(err) {
            alert('שגיאה: ' + err.message);
        });
    }

    // ========================================
    // RESET PASSWORD
    // ========================================

    function openResetPassword(userId) {
        var user = findUser(userId);
        if (!user) return;

        document.getElementById('resetUserId').value = user.id;
        document.getElementById('resetUserInfo').innerHTML = 
            '<div><strong>' + user.name + '</strong></div><div style="color:#9CA3AF;font-size:0.85rem">' + user.email + '</div>';
        document.getElementById('resetNewPassword').value = '';
        document.getElementById('resetConfirmPassword').value = '';

        openModal('modalResetPassword');
    }

    function resetPassword(e) {
        e.preventDefault();

        var id = document.getElementById('resetUserId').value;
        var newPass = document.getElementById('resetNewPassword').value;
        var confirm = document.getElementById('resetConfirmPassword').value;

        if (newPass !== confirm) {
            alert('הסיסמאות לא תואמות');
            return;
        }

        if (newPass.length < 6) {
            alert('סיסמה חייבת להיות לפחות 6 תווים');
            return;
        }

        apiRequest('/api/admin/reset-password', 'POST', {
            targetUserId: id,
            newPassword: newPass
        }).then(function(res) {
            if (res.success) {
                showToast('סיסמה אופסה בהצלחה! ✅');
                closeModal('modalResetPassword');
            } else {
                alert('שגיאה: ' + (res.error || 'לא ידוע'));
            }
        }).catch(function(err) {
            alert('שגיאה: ' + err.message);
        });
    }

    // ========================================
    // DELETE USER
    // ========================================

    function openDeleteUser(userId) {
        var user = findUser(userId);
        if (!user) return;

        document.getElementById('deleteUserId').value = user.id;
        document.getElementById('deleteUserInfo').innerHTML = 
            '<div style="display:flex;align-items:center;gap:0.75rem">' +
                '<div class="adm-user-avatar">' + user.name.charAt(0).toUpperCase() + '</div>' +
                '<div><strong>' + user.name + '</strong><br><span style="color:#9CA3AF;font-size:0.85rem">' + user.email + '</span></div>' +
            '</div>';
        document.getElementById('deleteConfirm').checked = false;

        openModal('modalDeleteUser');
    }

    function deleteUser(e) {
        e.preventDefault();

        var id = document.getElementById('deleteUserId').value;
        
        if (!document.getElementById('deleteConfirm').checked) {
            alert('יש לאשר את המחיקה');
            return;
        }

        if (!confirm('אישור אחרון - למחוק את המשתמש?')) {
            return;
        }

        apiRequest('/api/admin/users/' + id, 'DELETE').then(function(res) {
            if (res.success) {
                showToast('משתמש נמחק! 🗑️');
                closeModal('modalDeleteUser');
                loadUsers();
                loadStats();
            } else {
                alert('שגיאה: ' + (res.error || 'לא ידוע'));
            }
        }).catch(function(err) {
            alert('שגיאה: ' + err.message);
        });
    }

    // ========================================
    // ADD USER
    // ========================================

    function openAddUser() {
        document.getElementById('formAddUser').reset();
        openModal('modalAddUser');
    }

    function addUser(e) {
        e.preventDefault();

        var data = {
            name: document.getElementById('addUserName').value,
            email: document.getElementById('addUserEmail').value,
            password: document.getElementById('addUserPassword').value,
            role: document.getElementById('addUserRole').value,
            status: document.getElementById('addUserStatus').value
        };

        apiRequest('/api/admin/users', 'POST', data).then(function(res) {
            if (res.success) {
                showToast('משתמש נוצר בהצלחה! ✅');
                closeModal('modalAddUser');
                loadUsers();
                loadStats();
            } else {
                alert('שגיאה: ' + (res.error || 'לא ידוע'));
            }
        }).catch(function(err) {
            alert('שגיאה: ' + err.message);
        });
    }

    function generatePassword() {
        var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        var password = '';
        for (var i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        document.getElementById('addUserPassword').value = password;
        document.getElementById('addUserPassword').type = 'text';
    }

    // ========================================
    // FEEDBACKS
    // ========================================

    function toggleFeedback() {
        var content = document.getElementById('feedbackContent');
        var icon = document.getElementById('feedbackIcon');
        
        content.classList.toggle('open');
        icon.classList.toggle('open');

        if (content.classList.contains('open')) {
            loadFeedbacks();
        }
    }

    function loadFeedbacks() {
        apiRequest('/api/admin/feedback').then(function(res) {
            if (res.success) {
                state.feedbacks = res.data || [];
                state.filteredFeedbacks = state.feedbacks.slice();
                renderFeedbacks();
            }
        }).catch(function(err) {
            showTableError('feedbackTableBody', err.message);
        });
    }

    function filterFeedbacks() {
        var status = document.getElementById('feedbackStatusFilter').value;
        var category = document.getElementById('feedbackCategoryFilter').value;

        state.filteredFeedbacks = state.feedbacks.filter(function(f) {
            var matchStatus = status === 'all' || f.status === status;
            var matchCategory = category === 'all' || f.category === category;
            return matchStatus && matchCategory;
        });

        renderFeedbacks();
    }

    function renderFeedbacks() {
        var tbody = document.getElementById('feedbackTableBody');
        if (!tbody) return;

        if (state.filteredFeedbacks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="adm-loading">אין משובים</td></tr>';
            return;
        }

        var html = '';
        for (var i = 0; i < state.filteredFeedbacks.length; i++) {
            var f = state.filteredFeedbacks[i];
            var categoryBadge = getCategoryBadge(f.category);
            var statusBadge = getStatusBadge(f.status);

            html += '<tr>' +
                '<td>' +
                    '<div class="adm-user-info">' +
                        '<div class="adm-user-name">' + f.user_name + '</div>' +
                        '<div class="adm-user-email">' + f.user_email + '</div>' +
                    '</div>' +
                '</td>' +
                '<td>' + categoryBadge + '</td>' +
                '<td class="adm-message-cell">' + f.message + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + formatDate(f.created_at) + '</td>' +
                '<td>' +
                    '<div class="adm-actions">' +
                        '<button class="adm-action-btn" onclick="FlowEcoAdmin.viewFeedback(\'' + f.id + '\')" title="צפייה">👁️</button>' +
                        '<button class="adm-action-btn" onclick="FlowEcoAdmin.editFeedback(\'' + f.id + '\')" title="עריכה">✏️</button>' +
                        '<button class="adm-action-btn" onclick="FlowEcoAdmin.deleteFeedback(\'' + f.id + '\')" title="מחיקה">🗑️</button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
        }

        tbody.innerHTML = html;
    }

    function getCategoryBadge(cat) {
        switch (cat) {
            case 'bug': return '<span class="adm-badge adm-badge-bug">🐛 באג</span>';
            case 'feature': return '<span class="adm-badge adm-badge-feature">💡 הצעה</span>';
            case 'question': return '<span class="adm-badge adm-badge-question">❓ שאלה</span>';
            default: return '<span class="adm-badge">' + cat + '</span>';
        }
    }

    function getStatusBadge(status) {
        switch (status) {
            case 'new': return '<span class="adm-badge adm-badge-new">חדש</span>';
            case 'in-progress': return '<span class="adm-badge adm-badge-in-progress">בטיפול</span>';
            case 'resolved': return '<span class="adm-badge adm-badge-resolved">טופל</span>';
            default: return '<span class="adm-badge">' + status + '</span>';
        }
    }

    function viewFeedback(feedbackId) {
        var f = findFeedback(feedbackId);
        if (!f) return;

        var categoryLabels = { 'bug': '🐛 באג', 'feature': '💡 הצעה', 'question': '❓ שאלה', 'other': '📦 אחר' };
        var statusLabels = { 'new': 'חדש', 'in-progress': 'בטיפול', 'resolved': 'טופל', 'closed': 'סגור' };

        var html = '<div style="margin-bottom:1rem">' +
            '<div style="color:#9CA3AF;font-size:0.8rem;margin-bottom:0.25rem">משתמש</div>' +
            '<div style="font-weight:600">' + f.user_name + '</div>' +
            '<div style="color:#9CA3AF;font-size:0.85rem">' + f.user_email + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:1rem;margin-bottom:1rem">' +
            '<div><span style="color:#9CA3AF;font-size:0.8rem">סוג:</span> ' + (categoryLabels[f.category] || f.category) + '</div>' +
            '<div><span style="color:#9CA3AF;font-size:0.8rem">סטטוס:</span> ' + (statusLabels[f.status] || f.status) + '</div>' +
        '</div>' +
        '<div style="margin-bottom:1rem">' +
            '<div style="color:#9CA3AF;font-size:0.8rem;margin-bottom:0.5rem">הודעה</div>' +
            '<div style="background:rgba(255,255,255,0.05);padding:1rem;border-radius:8px;line-height:1.6">' + f.message + '</div>' +
        '</div>';

        if (f.admin_notes) {
            html += '<div>' +
                '<div style="color:#9CA3AF;font-size:0.8rem;margin-bottom:0.5rem">הערות Admin</div>' +
                '<div style="background:rgba(139,92,246,0.1);padding:1rem;border-radius:8px">' + f.admin_notes + '</div>' +
            '</div>';
        }

        document.getElementById('viewFeedbackContent').innerHTML = html;
        openModal('modalViewFeedback');
    }

    function editFeedback(feedbackId) {
        var f = findFeedback(feedbackId);
        if (!f) return;

        document.getElementById('editFeedbackId').value = f.id;
        document.getElementById('editFeedbackStatus').value = f.status;
        document.getElementById('editFeedbackNotes').value = f.admin_notes || '';

        openModal('modalEditFeedback');
    }

    function saveFeedback(e) {
        e.preventDefault();

        var id = document.getElementById('editFeedbackId').value;
        var data = {
            status: document.getElementById('editFeedbackStatus').value,
            admin_notes: document.getElementById('editFeedbackNotes').value
        };

        apiRequest('/api/admin/feedback/' + id, 'PUT', data).then(function(res) {
            if (res.success) {
                showToast('משוב עודכן! ✅');
                closeModal('modalEditFeedback');
                loadFeedbacks();
            } else {
                alert('שגיאה: ' + (res.error || 'לא ידוע'));
            }
        }).catch(function(err) {
            alert('שגיאה: ' + err.message);
        });
    }

    function deleteFeedback(feedbackId) {
        if (!confirm('למחוק את המשוב?')) return;

        apiRequest('/api/admin/feedback/' + feedbackId, 'DELETE').then(function(res) {
            if (res.success) {
                showToast('משוב נמחק! 🗑️');
                loadFeedbacks();
            } else {
                alert('שגיאה: ' + (res.error || 'לא ידוע'));
            }
        }).catch(function(err) {
            alert('שגיאה: ' + err.message);
        });
    }

    // ========================================
    // HELPERS
    // ========================================

    function findUser(id) {
        for (var i = 0; i < state.users.length; i++) {
            if (state.users[i].id === id) return state.users[i];
        }
        return null;
    }

    function findFeedback(id) {
        for (var i = 0; i < state.feedbacks.length; i++) {
            if (state.feedbacks[i].id === id) return state.feedbacks[i];
        }
        return null;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        var d = new Date(dateStr);
        return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
    }

    function showTableError(tbodyId, message) {
        var tbody = document.getElementById(tbodyId);
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="adm-loading" style="color:#EF4444">❌ ' + message + '</td></tr>';
        }
    }

    // ========================================
    // MODALS
    // ========================================

    function openModal(id) {
        var modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(id) {
        var modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // ========================================
    // TOAST
    // ========================================

    function showToast(message, type) {
        type = type || 'success';
        var toast = document.getElementById('admToast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = 'adm-toast ' + type + ' show';

        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    // ========================================
    // GLOBAL API
    // ========================================

    window.FlowEcoAdmin = {
        // Users
        filterUsers: filterUsers,
        changePage: changePage,
        viewUser: viewUser,
        editUser: editUser,
        saveUser: saveUser,
        openResetPassword: openResetPassword,
        resetPassword: resetPassword,
        openDeleteUser: openDeleteUser,
        deleteUser: deleteUser,
        openAddUser: openAddUser,
        addUser: addUser,
        generatePassword: generatePassword,
        
        // Feedbacks
        toggleFeedback: toggleFeedback,
        filterFeedbacks: filterFeedbacks,
        viewFeedback: viewFeedback,
        editFeedback: editFeedback,
        saveFeedback: saveFeedback,
        deleteFeedback: deleteFeedback,
        
        // Modals
        closeModal: closeModal
    };

    // ========================================
    // INIT
    // ========================================

    loadStats();
    loadUsers();

    // Close modal on ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var modals = document.querySelectorAll('.adm-modal-overlay.show');
            for (var i = 0; i < modals.length; i++) {
                modals[i].classList.remove('show');
            }
            document.body.style.overflow = '';
        }
    });

    // Close modal on overlay click
    var overlays = document.querySelectorAll('.adm-modal-overlay');
    for (var i = 0; i < overlays.length; i++) {
        overlays[i].addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }

    console.log('👑 FlowEco Admin Panel v2 Ready!');

})();