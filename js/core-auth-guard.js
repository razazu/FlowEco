(function() {
  // לא לרוץ באלמנטור
  if (window.location.href.includes('elementor-preview')) {
    return;
  }
  // לא לרוץ ב-admin
  if (window.location.pathname.startsWith('/wp-admin')) {
    return;
  }
  
  const token = localStorage.getItem('floweco_token');
  
  if (!token) {
    window.location.href = '/floweco/login';
    return;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 2) throw new Error('Invalid');
    
    const payload = JSON.parse(atob(parts[0]));
    
    if (!payload.exp || payload.exp < Date.now() || !payload.userId) {
      localStorage.removeItem('floweco_token');
      localStorage.removeItem('floweco_user');
      window.location.href = '/floweco/login';
      return;
    }
  } catch (e) {
    localStorage.removeItem('floweco_token');
    localStorage.removeItem('floweco_user');
    window.location.href = '/floweco/login';
  }
})();