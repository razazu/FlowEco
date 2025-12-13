// ========================================
// FlowEco API - Auth Utilities
// ========================================

// Hash password with SHA-256
export async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Verify password (supports legacy salt)
export async function verifyPassword(password, hash, salt) {
  if (await hashPassword(password, salt) === hash) return true;
  if (await hashPassword(password, 'floweco-salt-2025') === hash) return true;
  return false;
}

// Create JWT-like token
export async function createToken(userId, email, secret) {
  const payload = { 
    userId, 
    email, 
    exp: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
  };
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload) + secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return btoa(JSON.stringify(payload)) + '.' + signature;
}

// Get user ID from token
export async function getUserIdFromToken(token, secret) {
  try {
    if (!token || token.length < 10 || token.length > 2000 || !token.includes('.')) {
      return null;
    }
    
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    
    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp < Date.now()) return null;
    
    const encoder = new TextEncoder();
    
    // Try current secret
    let data = encoder.encode(JSON.stringify(payload) + secret);
    let hashBuffer = await crypto.subtle.digest('SHA-256', data);
    let expectedSig = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    if (signature === expectedSig) return payload.userId;
    
    // Try legacy secret
    data = encoder.encode(JSON.stringify(payload) + 'floweco-secret-2025');
    hashBuffer = await crypto.subtle.digest('SHA-256', data);
    expectedSig = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === expectedSig ? payload.userId : null;
  } catch { 
    return null; 
  }
}

// Parse user agent for device info
export function parseUserAgent(userAgent) {
  if (!userAgent) return { deviceType: 'unknown', browser: 'unknown' };
  
  let deviceType = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(userAgent)) {
    if (/iPad|Tablet/i.test(userAgent)) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Mobile';
    }
  }
  
  let browser = 'Other';
  if (userAgent.includes('Firefox/')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    browser = 'Firefox ' + (match ? match[1] : '');
  } else if (userAgent.includes('Edg/')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    browser = 'Edge ' + (match ? match[1] : '');
  } else if (userAgent.includes('Chrome/')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    browser = 'Chrome ' + (match ? match[1] : '');
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    browser = 'Safari ' + (match ? match[1] : '');
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR/')) {
    browser = 'Opera';
  }
  
  return { deviceType, browser };
}

// Generate 6-digit verification code
export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if user is admin
export async function isUserAdmin(db, userId) {
  const user = await db.prepare('SELECT is_admin FROM users WHERE id = ?')
    .bind(userId)
    .first();
  return user && user.is_admin === 1;
}
