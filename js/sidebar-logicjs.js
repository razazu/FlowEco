// ========================================
// FlowEco Sidebar v2 - Logic
// ========================================

(function() {
    'use strict';

    // Guard - check if sidebar exists
    var sidebar = document.getElementById('floweco-sidebar');
    if (!sidebar) return;

    console.log('📱 FlowEco Sidebar v2 Loading...');

    // ========================================
    // ELEMENTS
    // ========================================

    var overlay = document.getElementById('sbOverlay');
    var toggleBtn = document.getElementById('sbToggle');
    var closeBtn = document.getElementById('sbClose');
    var logoutBtn = document.getElementById('sbLogout');
    var adminLink = document.getElementById('sbAdminLink');
    var userAvatar = document.getElementById('sbUserAvatar');
    var userName = document.getElementById('sbUserName');
    var userPlan = document.getElementById('sbUserPlan');

    // ========================================
    // SIDEBAR TOGGLE
    // ========================================

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    function toggleSidebar() {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    // ========================================
    // LOGOUT
    // ========================================

    function logout() {
        if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
            localStorage.removeItem('floweco_token');
            localStorage.removeItem('floweco_user');
            window.location.href = '/login';
        }
    }

    // ========================================
    // INIT USER
    // ========================================

    function initUser() {
        try {
            var userStr = localStorage.getItem('floweco_user');

            if (!userStr) {
                if (userName) userName.textContent = 'אורח';
                if (userPlan) userPlan.textContent = 'לא מחובר';
                if (userAvatar) userAvatar.textContent = '?';
                return;
            }

            var user = JSON.parse(userStr);
            var fullName = user.name || 'משתמש';
            var firstLetter = fullName.trim().charAt(0) || 'מ';

            if (userName) userName.textContent = fullName;
            if (userAvatar) userAvatar.textContent = firstLetter;

            if (userPlan) {
                if (user.is_admin === 1) {
                    userPlan.textContent = 'מנהל מערכת';
                } else {
                    userPlan.textContent = 'תוכנית Free';
                }
            }

            // Show admin link if admin
            if (user.is_admin === 1 && adminLink) {
                adminLink.classList.add('show');
            }

        } catch (err) {
            console.error('Error loading user:', err);
            if (userName) userName.textContent = 'משתמש';
            if (userPlan) userPlan.textContent = 'Free';
            if (userAvatar) userAvatar.textContent = 'מ';
        }
    }

    // ========================================
    // INIT ACTIVE LINK
    // ========================================

    function initActiveLink() {
        var currentPath = window.location.pathname;
        var navLinks = document.querySelectorAll('.sb-nav-link');

        for (var i = 0; i < navLinks.length; i++) {
            var link = navLinks[i];
            var href = link.getAttribute('href');

            if (href) {
                // Check if current path matches
                var pageName = href.replace('/', '');
                if (currentPath.indexOf(pageName) !== -1 && pageName !== '') {
                    link.classList.add('active');
                }
            }

            // Close sidebar on mobile when clicking link
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
            });
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeSidebar();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            closeSidebar();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });

    // Handle resize
    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth > 768) {
                closeSidebar();
            }
        }, 150);
    });

    // ========================================
    // GLOBAL API
    // ========================================

    window.FlowEcoSidebar = {
        open: openSidebar,
        close: closeSidebar,
        toggle: toggleSidebar,
        logout: logout
    };

    // ========================================
    // INIT
    // ========================================

    initUser();
    initActiveLink();

    console.log('📱 FlowEco Sidebar v2 Ready!');

})();