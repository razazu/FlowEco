/**
 * FlowEco Settings Page
 * JavaScript Logic
 */

(function() {
    // Prevent duplicate initialization
    if (window.FlowEcoSettings) return;

    var API_BASE = 'https://floweco-api.razazulai.workers.dev';
    
    // State
    var state = {
        user: null,
        cards: [],
        categories: [],
        deleteCallback: null
    };

    // Default categories
    var defaultCategories = [
        { name: 'מזון וסופר', icon: '🛒', color: '#10B981', type: 'expense' },
        { name: 'מסעדות', icon: '🍔', color: '#F59E0B', type: 'expense' },
        { name: 'תחבורה', icon: '🚗', color: '#3B82F6', type: 'expense' },
        { name: 'דיור', icon: '🏠', color: '#8B5CF6', type: 'expense' },
        { name: 'חשבונות', icon: '💡', color: '#EC4899', type: 'expense' },
        { name: 'טלפון ואינטרנט', icon: '📱', color: '#06B6D4', type: 'expense' },
        { name: 'בילויים', icon: '🎮', color: '#667eea', type: 'expense' },
        { name: 'ביגוד', icon: '👕', color: '#EF4444', type: 'expense' },
        { name: 'בריאות', icon: '💊', color: '#10B981', type: 'expense' },
        { name: 'חופשות', icon: '✈️', color: '#F59E0B', type: 'expense' },
        { name: 'חינוך', icon: '🎓', color: '#3B82F6', type: 'expense' },
        { name: 'משכורת', icon: '💰', color: '#10B981', type: 'income' },
        { name: 'בונוס', icon: '🎁', color: '#8B5CF6', type: 'income' },
        { name: 'השקעות', icon: '📈', color: '#06B6D4', type: 'income' }
    ];

    // Initialize
    function init() {
        // Only run on settings page
        if (!document.querySelector('.fe-settings')) return;
        
        console.log('⚙️ FlowEco Settings Loading...');
        
        loadUserData();
        loadCards();
        loadCategories();
        setupEventListeners();
        
        console.log('⚙️ FlowEco Settings Ready!');
    }

    // Get auth token
    function getToken() {
        return localStorage.getItem('floweco_token');
    }

    // Get user from localStorage
    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('floweco_user'));
        } catch (e) {
            return null;
        }
    }

    // API Call
    function apiCall(endpoint, method, data, callback) {
        var token = getToken();
        if (!token) {
            window.location.href = '/login';
            return;
        }

        var options = {
            method: method || 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        fetch(API_BASE + endpoint, options)
            .then(function(response) {
                return response.json();
            })
            .then(function(result) {
                if (callback) callback(result);
            })
            .catch(function(error) {
                console.error('API Error:', error);
                showToast('שגיאה בתקשורת עם השרת', 'error');
            });
    }

    // Load user data
    function loadUserData() {
        var user = getUser();
        if (user) {
            state.user = user;
            document.getElementById('feProfileName').value = user.name || '';
            document.getElementById('feProfileEmail').value = user.email || '';
        }
    }

    // Load cards
    function loadCards() {
        apiCall('/api/cards', 'GET', null, function(result) {
            if (result.success) {
                state.cards = result.data || [];
                renderCards();
            }
        });
    }

    // Load categories from API
    function loadCategories() {
        apiCall('/api/categories', 'GET', null, function(result) {
            if (result.success) {
                state.categories = result.data || [];
                renderCategories();
            } else {
                showToast('שגיאה בטעינת קטגוריות', 'error');
            }
        });
    }

    // Save categories - no longer used (API handles it)
    function saveCategories() {
        // Categories are now saved via API
    }

    // Render cards
    function renderCards() {
        var container = document.getElementById('feCardsList');
        if (!container) return;

        if (state.cards.length === 0) {
            container.innerHTML = 
                '<div class="fe-empty-state">' +
                    '<span>💳</span>' +
                    '<p>אין כרטיסים. הוסף את הכרטיס הראשון שלך!</p>' +
                '</div>';
            return;
        }

        container.innerHTML = state.cards.map(function(card) {
            var digits = card.last_four ? '•••• ' + card.last_four : '';
            var color = card.color || '#667eea';
            return '<div class="fe-credit-card" style="border-right-color: ' + color + '">' +
                '<div class="fe-card-icon" style="background: ' + color + '">💳</div>' +
                '<div class="fe-card-info">' +
                    '<div class="fe-card-name">' + card.card_name + '</div>' +
                    '<div class="fe-card-digits">' + digits + '</div>' +
                '</div>' +
                '<div class="fe-card-actions">' +
                    '<button class="fe-card-action-btn" onclick="FlowEcoSettings.editCard(\'' + card.id + '\')" title="עריכה">✏️</button>' +
                    '<button class="fe-card-action-btn delete" onclick="FlowEcoSettings.confirmDeleteCard(\'' + card.id + '\')" title="מחיקה">🗑️</button>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    // Render categories
    function renderCategories() {
        var container = document.getElementById('feCategoriesList');
        if (!container) return;

        if (state.categories.length === 0) {
            container.innerHTML = 
                '<div class="fe-empty-state">' +
                    '<span>🏷️</span>' +
                    '<p>אין קטגוריות</p>' +
                '</div>';
            return;
        }

        container.innerHTML = state.categories.map(function(cat) {
            var color = cat.color || '#667eea';
            var typeLabel = cat.type === 'income' ? 'הכנסה' : 'הוצאה';
            return '<div class="fe-category-item">' +
                '<div class="fe-category-actions">' +
                    '<button class="fe-category-action-btn" onclick="FlowEcoSettings.editCategory(\'' + cat.id + '\')" title="עריכה">✏️</button>' +
                    '<button class="fe-category-action-btn delete" onclick="FlowEcoSettings.confirmDeleteCategory(\'' + cat.id + '\')" title="מחיקה">🗑️</button>' +
                '</div>' +
                '<div class="fe-category-icon" style="background: ' + color + '20; color: ' + color + '">' + cat.icon + '</div>' +
                '<div class="fe-category-name">' + cat.name + '</div>' +
                '<div class="fe-category-type ' + cat.type + '">' + typeLabel + '</div>' +
            '</div>';
        }).join('');
    }

    // Setup event listeners
    function setupEventListeners() {
        // Profile form
        var profileForm = document.getElementById('feProfileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveProfile();
            });
        }

        // Password form
        var passwordForm = document.getElementById('fePasswordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                changePassword();
            });
        }

        // Preferences form
        var prefsForm = document.getElementById('fePreferencesForm');
        if (prefsForm) {
            prefsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                savePreferences();
            });
        }

        // Color pickers
        setupColorPicker('feCardColorPicker', 'feCardColor');
        setupColorPicker('feCategoryColorPicker', 'feCategoryColor');

        // Icon picker
        setupIconPicker('feCategoryIconPicker', 'feCategoryIcon');
    }

    // Setup color picker
    function setupColorPicker(pickerId, inputId) {
        var picker = document.getElementById(pickerId);
        if (!picker) return;

        picker.addEventListener('click', function(e) {
            if (e.target.classList.contains('fe-color-btn')) {
                var buttons = picker.querySelectorAll('.fe-color-btn');
                buttons.forEach(function(btn) { btn.classList.remove('active'); });
                e.target.classList.add('active');
                document.getElementById(inputId).value = e.target.dataset.color;
            }
        });
    }

    // Setup icon picker
    function setupIconPicker(pickerId, inputId) {
        var picker = document.getElementById(pickerId);
        if (!picker) return;

        picker.addEventListener('click', function(e) {
            if (e.target.classList.contains('fe-icon-btn')) {
                var buttons = picker.querySelectorAll('.fe-icon-btn');
                buttons.forEach(function(btn) { btn.classList.remove('active'); });
                e.target.classList.add('active');
                document.getElementById(inputId).value = e.target.dataset.icon;
            }
        });
    }

    // Save profile
    function saveProfile() {
        var name = document.getElementById('feProfileName').value.trim();
        var email = document.getElementById('feProfileEmail').value.trim();

        if (!name || !email) {
            showToast('נא למלא את כל השדות', 'error');
            return;
        }

        apiCall('/api/profile', 'PUT', { name: name, email: email }, function(result) {
            if (result.success) {
                // Update localStorage
                var user = getUser() || {};
                user.name = name;
                user.email = email;
                localStorage.setItem('floweco_user', JSON.stringify(user));
                showToast('הפרופיל עודכן בהצלחה!', 'success');
            } else {
                showToast(result.error || 'שגיאה בעדכון הפרופיל', 'error');
            }
        });
    }

    // Change password
    function changePassword() {
        var current = document.getElementById('feCurrentPassword').value;
        var newPass = document.getElementById('feNewPassword').value;
        var confirm = document.getElementById('feConfirmPassword').value;

        if (!current || !newPass || !confirm) {
            showToast('נא למלא את כל השדות', 'error');
            return;
        }

        if (newPass.length < 6) {
            showToast('הסיסמה חייבת להכיל לפחות 6 תווים', 'error');
            return;
        }

        if (newPass !== confirm) {
            showToast('הסיסמאות לא תואמות', 'error');
            return;
        }

        apiCall('/api/change-password', 'POST', { 
            currentPassword: current, 
            newPassword: newPass 
        }, function(result) {
            if (result.success) {
                showToast('הסיסמה שונתה בהצלחה!', 'success');
                document.getElementById('fePasswordForm').reset();
            } else {
                showToast(result.error || 'שגיאה בשינוי הסיסמה', 'error');
            }
        });
    }

    // Save preferences
    function savePreferences() {
        var currency = document.getElementById('feCurrency').value;
        var monthStart = document.getElementById('feMonthStart').value;

        localStorage.setItem('floweco_currency', currency);
        localStorage.setItem('floweco_month_start', monthStart);

        showToast('ההעדפות נשמרו!', 'success');
    }

    // === CARD MODAL ===

    function openCardModal(cardId) {
        var modal = document.getElementById('feCardModal');
        var title = document.getElementById('feCardModalTitle');
        
        if (cardId) {
            var card = state.cards.find(function(c) { return c.id === cardId; });
            if (card) {
                title.textContent = 'עריכת כרטיס';
                document.getElementById('feCardId').value = card.id;
                document.getElementById('feCardName').value = card.card_name;
                document.getElementById('feCardDigits').value = card.last_four || '';
                document.getElementById('feCardColor').value = card.color || '#667eea';
                document.getElementById('feCardBillingDay').value = card.billing_day || '';
                
                // Select color
                selectColor('feCardColorPicker', card.color || '#667eea');
            }
        } else {
            title.textContent = 'הוסף כרטיס';
            document.getElementById('feCardForm').reset();
            document.getElementById('feCardId').value = '';
            document.getElementById('feCardColor').value = '#667eea';
            selectColor('feCardColorPicker', '#667eea');
        }

        modal.classList.add('show');
    }

    function closeCardModal() {
        document.getElementById('feCardModal').classList.remove('show');
    }

    function saveCard() {
        var id = document.getElementById('feCardId').value;
        var name = document.getElementById('feCardName').value.trim();
        var digits = document.getElementById('feCardDigits').value.trim();
        var color = document.getElementById('feCardColor').value;
        var billingDay = document.getElementById('feCardBillingDay').value;

        if (!name) {
            showToast('נא להזין שם לכרטיס', 'error');
            return;
        }

        var data = {
            card_name: name,
            last_four: digits || null,
            color: color,
            billing_day: billingDay ? parseInt(billingDay) : null
        };

        if (id) {
            // Update
            apiCall('/api/cards/' + id, 'PUT', data, function(result) {
                if (result.success) {
                    showToast('הכרטיס עודכן בהצלחה!', 'success');
                    closeCardModal();
                    loadCards();
                } else {
                    showToast(result.error || 'שגיאה בעדכון הכרטיס', 'error');
                }
            });
        } else {
            // Create
            apiCall('/api/cards', 'POST', data, function(result) {
                if (result.success) {
                    showToast('הכרטיס נוסף בהצלחה!', 'success');
                    closeCardModal();
                    loadCards();
                } else {
                    showToast(result.error || 'שגיאה בהוספת הכרטיס', 'error');
                }
            });
        }
    }

    function editCard(cardId) {
        openCardModal(cardId);
    }

    function confirmDeleteCard(cardId) {
        var card = state.cards.find(function(c) { return c.id === cardId; });
        if (!card) return;

        document.getElementById('feDeleteMessage').textContent = 
            'האם אתה בטוח שברצונך למחוק את הכרטיס "' + card.card_name + '"?';
        
        state.deleteCallback = function() {
            apiCall('/api/cards/' + cardId, 'DELETE', null, function(result) {
                if (result.success) {
                    showToast('הכרטיס נמחק בהצלחה!', 'success');
                    closeDeleteModal();
                    loadCards();
                } else {
                    showToast(result.error || 'שגיאה במחיקת הכרטיס', 'error');
                }
            });
        };

        document.getElementById('feDeleteConfirmBtn').onclick = state.deleteCallback;
        document.getElementById('feDeleteModal').classList.add('show');
    }

    // === CATEGORY MODAL ===

    function openCategoryModal(catId) {
        var modal = document.getElementById('feCategoryModal');
        var title = document.getElementById('feCategoryModalTitle');
        
        if (catId) {
            var cat = state.categories.find(function(c) { return c.id === catId; });
            if (cat) {
                title.textContent = 'עריכת קטגוריה';
                document.getElementById('feCategoryId').value = cat.id;
                document.getElementById('feCategoryName').value = cat.name;
                document.getElementById('feCategoryType').value = cat.type;
                document.getElementById('feCategoryType').disabled = true; // Can't change type
                document.getElementById('feCategoryIcon').value = cat.icon;
                document.getElementById('feCategoryColor').value = cat.color;
                
                selectColor('feCategoryColorPicker', cat.color);
                selectIcon('feCategoryIconPicker', cat.icon);
            }
        } else {
            title.textContent = 'הוסף קטגוריה';
            document.getElementById('feCategoryForm').reset();
            document.getElementById('feCategoryId').value = '';
            document.getElementById('feCategoryType').disabled = false;
            document.getElementById('feCategoryIcon').value = '🛒';
            document.getElementById('feCategoryColor').value = '#667eea';
            selectColor('feCategoryColorPicker', '#667eea');
            selectIcon('feCategoryIconPicker', '🛒');
        }

        modal.classList.add('show');
    }

    function closeCategoryModal() {
        document.getElementById('feCategoryModal').classList.remove('show');
    }

    function saveCategory() {
        var catId = document.getElementById('feCategoryId').value;
        var name = document.getElementById('feCategoryName').value.trim();
        var type = document.getElementById('feCategoryType').value;
        var icon = document.getElementById('feCategoryIcon').value;
        var color = document.getElementById('feCategoryColor').value;

        if (!name) {
            showToast('נא להזין שם לקטגוריה', 'error');
            return;
        }

        var data = {
            name: name,
            type: type,
            icon: icon,
            color: color
        };

        if (catId) {
            // Update existing category
            apiCall('/api/categories/' + catId, 'PUT', data, function(result) {
                if (result.success) {
                    showToast('הקטגוריה עודכנה בהצלחה!', 'success');
                    closeCategoryModal();
                    loadCategories();
                } else {
                    showToast(result.error || 'שגיאה בעדכון הקטגוריה', 'error');
                }
            });
        } else {
            // Create new category
            apiCall('/api/categories', 'POST', data, function(result) {
                if (result.success) {
                    showToast('הקטגוריה נוספה בהצלחה!', 'success');
                    closeCategoryModal();
                    loadCategories();
                } else {
                    showToast(result.error || 'שגיאה בהוספת הקטגוריה', 'error');
                }
            });
        }
    }

    function editCategory(catId) {
        openCategoryModal(catId);
    }

    function confirmDeleteCategory(catId) {
        var cat = state.categories.find(function(c) { return c.id === catId; });
        if (!cat) return;

        document.getElementById('feDeleteMessage').textContent = 
            'האם אתה בטוח שברצונך למחוק את הקטגוריה "' + cat.name + '"?';
        
        state.deleteCallback = function() {
            apiCall('/api/categories/' + catId, 'DELETE', null, function(result) {
                if (result.success) {
                    showToast('הקטגוריה נמחקה בהצלחה!', 'success');
                    closeDeleteModal();
                    loadCategories();
                } else {
                    showToast(result.error || 'שגיאה במחיקת הקטגוריה', 'error');
                }
            });
        };

        document.getElementById('feDeleteConfirmBtn').onclick = state.deleteCallback;
        document.getElementById('feDeleteModal').classList.add('show');
    }

    // === DELETE MODAL ===

    function closeDeleteModal() {
        document.getElementById('feDeleteModal').classList.remove('show');
        state.deleteCallback = null;
    }

    // === HELPERS ===

    function selectColor(pickerId, color) {
        var picker = document.getElementById(pickerId);
        if (!picker) return;
        
        var buttons = picker.querySelectorAll('.fe-color-btn');
        buttons.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.dataset.color === color) {
                btn.classList.add('active');
            }
        });
    }

    function selectIcon(pickerId, icon) {
        var picker = document.getElementById(pickerId);
        if (!picker) return;
        
        var buttons = picker.querySelectorAll('.fe-icon-btn');
        buttons.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.dataset.icon === icon) {
                btn.classList.add('active');
            }
        });
    }

    // Export data
    function exportData() {
        var data = {
            user: getUser(),
            cards: state.cards,
            categories: state.categories,
            preferences: {
                currency: localStorage.getItem('floweco_currency'),
                monthStart: localStorage.getItem('floweco_month_start')
            },
            exportDate: new Date().toISOString()
        };

        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'floweco-export-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);

        showToast('הנתונים יוצאו בהצלחה!', 'success');
    }

    // Delete account confirmation
    function confirmDeleteAccount() {
        document.getElementById('feDeleteMessage').innerHTML = 
            '<strong>האם אתה בטוח שברצונך למחוק את החשבון?</strong><br>' +
            'כל הנתונים שלך יימחקו לצמיתות ולא יהיה ניתן לשחזר אותם.';
        
        state.deleteCallback = function() {
            apiCall('/api/delete-account', 'DELETE', null, function(result) {
                if (result.success) {
                    localStorage.clear();
                    window.location.href = '/';
                } else {
                    showToast(result.error || 'שגיאה במחיקת החשבון', 'error');
                }
            });
        };

        document.getElementById('feDeleteConfirmBtn').onclick = state.deleteCallback;
        document.getElementById('feDeleteModal').classList.add('show');
    }

    // Show toast message
    function showToast(message, type) {
        var container = document.getElementById('feToastContainer');
        if (!container) return;

        var toast = document.createElement('div');
        toast.className = 'fe-toast ' + type;
        toast.innerHTML = '<span>' + (type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠') + '</span> ' + message;
        
        container.appendChild(toast);

        setTimeout(function() {
            toast.style.opacity = '0';
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Public API
    window.FlowEcoSettings = {
        openCardModal: openCardModal,
        closeCardModal: closeCardModal,
        saveCard: saveCard,
        editCard: editCard,
        confirmDeleteCard: confirmDeleteCard,
        openCategoryModal: openCategoryModal,
        closeCategoryModal: closeCategoryModal,
        saveCategory: saveCategory,
        editCategory: editCategory,
        confirmDeleteCategory: confirmDeleteCategory,
        closeDeleteModal: closeDeleteModal,
        exportData: exportData,
        confirmDeleteAccount: confirmDeleteAccount
    };

    // Initialize when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();