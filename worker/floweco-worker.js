var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/utils/constants.js
var VAT_RATE = 0.18;
var DEFAULT_CATEGORIES = [
  { name: "\u05DE\u05D6\u05D5\u05DF \u05D5\u05E1\u05D5\u05E4\u05E8", type: "expense", icon: "\u{1F6D2}", color: "#10B981" },
  { name: "\u05DE\u05E1\u05E2\u05D3\u05D5\u05EA", type: "expense", icon: "\u{1F354}", color: "#F59E0B" },
  { name: "\u05EA\u05D7\u05D1\u05D5\u05E8\u05D4", type: "expense", icon: "\u{1F697}", color: "#3B82F6" },
  { name: "\u05D3\u05D9\u05D5\u05E8", type: "expense", icon: "\u{1F3E0}", color: "#8B5CF6" },
  { name: "\u05D7\u05E9\u05D1\u05D5\u05E0\u05D5\u05EA", type: "expense", icon: "\u{1F4A1}", color: "#EF4444" },
  { name: "\u05D8\u05DC\u05E4\u05D5\u05DF \u05D5\u05D0\u05D9\u05E0\u05D8\u05E8\u05E0\u05D8", type: "expense", icon: "\u{1F4F1}", color: "#06B6D4" },
  { name: "\u05D1\u05D9\u05DC\u05D5\u05D9\u05D9\u05DD", type: "expense", icon: "\u{1F3AE}", color: "#EC4899" },
  { name: "\u05D1\u05D9\u05D2\u05D5\u05D3", type: "expense", icon: "\u{1F455}", color: "#667eea" },
  { name: "\u05D1\u05E8\u05D9\u05D0\u05D5\u05EA", type: "expense", icon: "\u{1F48A}", color: "#14B8A6" },
  { name: "\u05D7\u05D5\u05E4\u05E9\u05D5\u05EA", type: "expense", icon: "\u2708\uFE0F", color: "#F97316" },
  { name: "\u05D7\u05D9\u05E0\u05D5\u05DA", type: "expense", icon: "\u{1F393}", color: "#6366F1" },
  { name: "\u05D1\u05D9\u05D8\u05D5\u05D7\u05D9\u05DD", type: "expense", icon: "\u{1F6E1}\uFE0F", color: "#0EA5E9" },
  { name: "\u05DE\u05E0\u05D5\u05D9\u05D9\u05DD", type: "expense", icon: "\u{1F4FA}", color: "#A855F7" },
  { name: "\u05EA\u05D7\u05D1\u05D9\u05D1\u05D9\u05DD", type: "expense", icon: "\u{1F3A8}", color: "#F472B6" },
  { name: "\u05E7\u05E0\u05D9\u05D5\u05EA", type: "expense", icon: "\u{1F6CD}\uFE0F", color: "#A855F7" },
  { name: "\u05E1\u05E4\u05D5\u05E8\u05D8", type: "expense", icon: "\u{1F3C3}", color: "#22C55E" },
  { name: "\u05DE\u05EA\u05E0\u05D5\u05EA", type: "expense", icon: "\u{1F381}", color: "#E11D48" },
  { name: "\u05D0\u05D7\u05E8", type: "expense", icon: "\u{1F4E6}", color: "#6B7280" },
  { name: "\u05DE\u05E9\u05DB\u05D5\u05E8\u05EA", type: "income", icon: "\u{1F4B0}", color: "#10B981" },
  { name: "\u05D1\u05D5\u05E0\u05D5\u05E1", type: "income", icon: "\u{1F381}", color: "#F59E0B" },
  { name: "\u05D4\u05E9\u05E7\u05E2\u05D5\u05EA", type: "income", icon: "\u{1F4C8}", color: "#3B82F6" },
  { name: "\u05DE\u05EA\u05E0\u05D4", type: "income", icon: "\u{1F380}", color: "#EC4899" },
  { name: "\u05D0\u05D7\u05E8", type: "income", icon: "\u{1F4E6}", color: "#6B7280" }
];
var ALLOWED_ORIGINS = [
  "https://flowraz.io",
  "https://www.flowraz.io",
  "https://floweco.app",
  "https://www.floweco.app",
  "http://localhost:3000",
  "http://localhost:8080"
];

// src/utils/cors.js
function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const isAllowedOrigin = ALLOWED_ORIGINS.some(
    (allowed) => origin === allowed || origin.endsWith(".flowraz.io")
  );
  const allowOrigin = isAllowedOrigin ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-App-Version, X-PWA-Installed",
    "Access-Control-Max-Age": "86400",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block"
  };
}
__name(getCorsHeaders, "getCorsHeaders");
function handleOptions(corsHeaders) {
  return new Response(null, { headers: corsHeaders });
}
__name(handleOptions, "handleOptions");

// src/utils/response.js
function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0"
    }
  });
}
__name(jsonResponse, "jsonResponse");

// src/utils/auth.js
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");
async function verifyPassword(password, hash, salt) {
  if (await hashPassword(password, salt) === hash)
    return true;
  if (await hashPassword(password, "floweco-salt-2025") === hash)
    return true;
  return false;
}
__name(verifyPassword, "verifyPassword");
async function createToken(userId, email, secret) {
  const payload = {
    userId,
    email,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1e3
    // 30 days
  };
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload) + secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const signature = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return btoa(JSON.stringify(payload)) + "." + signature;
}
__name(createToken, "createToken");
async function getUserIdFromToken(token, secret) {
  try {
    if (!token || token.length < 10 || token.length > 2e3 || !token.includes(".")) {
      return null;
    }
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature)
      return null;
    const payload = JSON.parse(atob(payloadB64));
    if (payload.exp < Date.now())
      return null;
    const encoder = new TextEncoder();
    let data = encoder.encode(JSON.stringify(payload) + secret);
    let hashBuffer = await crypto.subtle.digest("SHA-256", data);
    let expectedSig = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
    if (signature === expectedSig)
      return payload.userId;
    data = encoder.encode(JSON.stringify(payload) + "floweco-secret-2025");
    hashBuffer = await crypto.subtle.digest("SHA-256", data);
    expectedSig = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
    return signature === expectedSig ? payload.userId : null;
  } catch {
    return null;
  }
}
__name(getUserIdFromToken, "getUserIdFromToken");
function parseUserAgent(userAgent) {
  if (!userAgent)
    return { deviceType: "unknown", browser: "unknown" };
  let deviceType = "Desktop";
  if (/Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(userAgent)) {
    if (/iPad|Tablet/i.test(userAgent)) {
      deviceType = "Tablet";
    } else {
      deviceType = "Mobile";
    }
  }
  let browser = "Other";
  if (userAgent.includes("Firefox/")) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    browser = "Firefox " + (match ? match[1] : "");
  } else if (userAgent.includes("Edg/")) {
    const match = userAgent.match(/Edg\/(\d+)/);
    browser = "Edge " + (match ? match[1] : "");
  } else if (userAgent.includes("Chrome/")) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    browser = "Chrome " + (match ? match[1] : "");
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome")) {
    const match = userAgent.match(/Version\/(\d+)/);
    browser = "Safari " + (match ? match[1] : "");
  } else if (userAgent.includes("Opera") || userAgent.includes("OPR/")) {
    browser = "Opera";
  }
  return { deviceType, browser };
}
__name(parseUserAgent, "parseUserAgent");
function generateVerificationCode() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
__name(generateVerificationCode, "generateVerificationCode");
async function isUserAdmin(db, userId) {
  const user = await db.prepare("SELECT is_admin FROM users WHERE id = ?").bind(userId).first();
  return user && user.is_admin === 1;
}
__name(isUserAdmin, "isUserAdmin");

// src/utils/email.js
async function sendVerificationEmail(email, code, userName, resendApiKey) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "FlowEco <noreply@flowraz.io>",
        to: email,
        subject: "\u{1F510} \u05E7\u05D5\u05D3 \u05D0\u05D9\u05DE\u05D5\u05EA - FlowEco",
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; border-radius: 16px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">\u{1F4B0} FlowEco</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">\u05E0\u05D9\u05D4\u05D5\u05DC \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9 \u05D7\u05DB\u05DD</p>
            </div>
            
            <div style="background: #1a1a2e; padding: 30px; border-radius: 16px; margin-top: 20px; color: #fff;">
              <h2 style="color: #10B981; margin-top: 0;">\u05E9\u05DC\u05D5\u05DD ${userName || ""}! \u{1F44B}</h2>
              <p style="color: #ccc; line-height: 1.6; font-size: 16px;">\u05E7\u05D5\u05D3 \u05D4\u05D0\u05D9\u05DE\u05D5\u05EA \u05E9\u05DC\u05DA \u05D4\u05D5\u05D0:</p>
              
              <div style="background: rgba(102, 126, 234, 0.2); border: 2px solid #667eea; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #667eea;">${code}</span>
              </div>
              
              <p style="color: #999; font-size: 14px;">\u23F0 \u05D4\u05E7\u05D5\u05D3 \u05EA\u05E7\u05E3 \u05DC-10 \u05D3\u05E7\u05D5\u05EA \u05D1\u05DC\u05D1\u05D3</p>
              <p style="color: #999; font-size: 14px;">\u05D0\u05DD \u05DC\u05D0 \u05D1\u05D9\u05E7\u05E9\u05EA \u05E7\u05D5\u05D3 \u05D6\u05D4, \u05D4\u05EA\u05E2\u05DC\u05DD \u05DE\u05D4\u05D5\u05D3\u05E2\u05D4 \u05D6\u05D5.</p>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} FlowEco - \u05DB\u05DC \u05D4\u05D6\u05DB\u05D5\u05D9\u05D5\u05EA \u05E9\u05DE\u05D5\u05E8\u05D5\u05EA
            </p>
          </div>
        `
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}
__name(sendVerificationEmail, "sendVerificationEmail");
async function sendBudgetAlertEmail(email, userName, category, spent, budget, percentage, resendApiKey) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "FlowEco <notifications@flowraz.io>",
        to: email,
        subject: `\u26A0\uFE0F \u05D4\u05EA\u05E8\u05D0\u05EA \u05EA\u05E7\u05E6\u05D9\u05D1 - ${category}`,
        html: `
          <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 30px; border-radius: 16px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">\u{1F4B0} FlowEco</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">\u05D4\u05EA\u05E8\u05D0\u05EA \u05EA\u05E7\u05E6\u05D9\u05D1</p>
            </div>
            
            <div style="background: #1E293B; padding: 30px; border-radius: 16px; margin-top: 20px; color: #F1F5F9;">
              <h2 style="color: #F59E0B; margin-top: 0;">\u05E9\u05DC\u05D5\u05DD ${userName || ""}! \u{1F44B}</h2>
              <p style="color: #94A3B8; line-height: 1.6;">\u05D4\u05D2\u05E2\u05EA \u05DC-<strong style="color: #EF4444;">${percentage}%</strong> \u05DE\u05D4\u05EA\u05E7\u05E6\u05D9\u05D1 \u05E9\u05D4\u05D2\u05D3\u05E8\u05EA \u05DC\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4:</p>
              
              <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #F59E0B;">${category}</div>
                <div style="margin-top: 15px;">
                  <span style="color: #94A3B8;">\u05D4\u05D5\u05E6\u05D0\u05EA:</span>
                  <span style="color: #EF4444; font-weight: bold; font-size: 20px;"> \u20AA${Math.round(spent).toLocaleString()}</span>
                  <span style="color: #94A3B8;"> \u05DE\u05EA\u05D5\u05DA </span>
                  <span style="color: #10B981; font-weight: bold; font-size: 20px;">\u20AA${Math.round(budget).toLocaleString()}</span>
                </div>
                <div style="background: #374151; border-radius: 10px; height: 12px; margin-top: 15px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #F59E0B, #EF4444); height: 100%; width: ${Math.min(percentage, 100)}%; border-radius: 10px;"></div>
                </div>
              </div>
              
              <p style="color: #64748B; font-size: 14px; text-align: center;">
                <a href="https://flowraz.io/dashboard/?page=budgets" style="color: #8B5CF6;">\u05DC\u05E6\u05E4\u05D9\u05D9\u05D4 \u05D1\u05EA\u05E7\u05E6\u05D9\u05D1\u05D9\u05DD \u05E9\u05DC\u05DA</a>
              </p>
            </div>
            
            <p style="text-align: center; color: #64748B; font-size: 12px; margin-top: 20px;">
              \xA9 2025 FlowEco - \u05E0\u05D9\u05D4\u05D5\u05DC \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9 \u05D7\u05DB\u05DD
            </p>
          </div>
        `
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Budget alert email error:", error);
    return false;
  }
}
__name(sendBudgetAlertEmail, "sendBudgetAlertEmail");
async function sendTestNotificationEmail(email, userName, resendApiKey) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "FlowEco <notifications@flowraz.io>",
        to: email,
        subject: "\u{1F514} \u05D1\u05D3\u05D9\u05E7\u05EA \u05D4\u05EA\u05E8\u05D0\u05D5\u05EA - FlowEco",
        html: `
          <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 30px; border-radius: 16px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">\u{1F4B0} FlowEco</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">\u05DE\u05E2\u05E8\u05DB\u05EA \u05D4\u05EA\u05E8\u05D0\u05D5\u05EA</p>
            </div>
            
            <div style="background: #1E293B; padding: 30px; border-radius: 16px; margin-top: 20px; color: #F1F5F9;">
              <h2 style="color: #10B981; margin-top: 0;">\u05E9\u05DC\u05D5\u05DD ${userName || ""}! \u{1F44B}</h2>
              <p style="color: #94A3B8; line-height: 1.6;">\u05D6\u05D5\u05D4\u05D9 \u05D4\u05D5\u05D3\u05E2\u05EA \u05D1\u05D3\u05D9\u05E7\u05D4 - \u05DE\u05E2\u05E8\u05DB\u05EA \u05D4\u05D4\u05EA\u05E8\u05D0\u05D5\u05EA \u05E2\u05D5\u05D1\u05D3\u05EA \u05DE\u05E6\u05D5\u05D9\u05DF!</p>
              
              <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <span style="font-size: 48px;">\u2705</span>
                <p style="color: #8B5CF6; font-weight: 600; margin: 10px 0 0 0;">\u05D4\u05D4\u05EA\u05E8\u05D0\u05D5\u05EA \u05E4\u05D5\u05E2\u05DC\u05D5\u05EA!</p>
              </div>
              
              <p style="color: #64748B; font-size: 14px;">\u05EA\u05E7\u05D1\u05DC \u05D4\u05EA\u05E8\u05D0\u05D5\u05EA \u05E2\u05DC \u05DE\u05E0\u05D5\u05D9\u05D9\u05DD \u05E9\u05E2\u05D5\u05DE\u05D3\u05D9\u05DD \u05DC\u05D4\u05EA\u05D7\u05D3\u05E9 \u05DC\u05E4\u05D9 \u05D4\u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05E9\u05DC\u05DA.</p>
            </div>
            
            <p style="text-align: center; color: #64748B; font-size: 12px; margin-top: 20px;">
              \xA9 2025 FlowEco - \u05E0\u05D9\u05D4\u05D5\u05DC \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9 \u05D7\u05DB\u05DD
            </p>
          </div>
        `
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Test notification email error:", error);
    return false;
  }
}
__name(sendTestNotificationEmail, "sendTestNotificationEmail");

// src/routes/auth.js
async function handleSendCode(request, env, corsHeaders) {
  const body = await request.json();
  const { email, userId, userName, type = "registration" } = body;
  if (!email) {
    return jsonResponse({ success: false, error: "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
  await env.DB.prepare(
    "DELETE FROM verification_codes WHERE email = ? AND type = ?"
  ).bind(email.toLowerCase(), type).run();
  await env.DB.prepare(
    "INSERT INTO verification_codes (user_id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(userId || "", email.toLowerCase(), code, type, expiresAt).run();
  const sent = await sendVerificationEmail(email, code, userName, env.RESEND_API_KEY);
  if (!sent) {
    return jsonResponse({ success: false, error: "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E9\u05DC\u05D9\u05D7\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC" }, 500, corsHeaders);
  }
  return jsonResponse({ success: true, message: "\u05E7\u05D5\u05D3 \u05E0\u05E9\u05DC\u05D7 \u05DC\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC" }, 200, corsHeaders);
}
__name(handleSendCode, "handleSendCode");
async function handleVerifyCode(request, env, corsHeaders) {
  const body = await request.json();
  const { email, code } = body;
  if (!email || !code) {
    return jsonResponse({ success: false, error: "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D5\u05E7\u05D5\u05D3 \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  const record = await env.DB.prepare(
    `SELECT * FROM verification_codes 
     WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
     ORDER BY created_at DESC LIMIT 1`
  ).bind(email.toLowerCase(), code).first();
  if (!record) {
    return jsonResponse({ success: false, error: "\u05E7\u05D5\u05D3 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D0\u05D5 \u05E4\u05D2 \u05EA\u05D5\u05E7\u05E3" }, 400, corsHeaders);
  }
  await env.DB.prepare(
    "UPDATE verification_codes SET used = 1 WHERE id = ?"
  ).bind(record.id).run();
  await env.DB.prepare(
    "UPDATE users SET email_verified = 1 WHERE email = ?"
  ).bind(email.toLowerCase()).run();
  const user = await env.DB.prepare(
    "SELECT id, email, name, is_admin FROM users WHERE email = ?"
  ).bind(email.toLowerCase()).first();
  if (!user) {
    return jsonResponse({ success: false, error: "\u05DE\u05E9\u05EA\u05DE\u05E9 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, 404, corsHeaders);
  }
  const token = await createToken(user.id, user.email, env.JWT_SECRET);
  return jsonResponse({
    success: true,
    message: "\u05D4\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D0\u05D5\u05DE\u05EA \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4!",
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin || 0
      }
    }
  }, 200, corsHeaders);
}
__name(handleVerifyCode, "handleVerifyCode");
async function handleResendCode(request, env, corsHeaders) {
  const body = await request.json();
  const { email } = body;
  if (!email) {
    return jsonResponse({ success: false, error: "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  const user = await env.DB.prepare(
    "SELECT id, name, email_verified FROM users WHERE email = ?"
  ).bind(email.toLowerCase()).first();
  if (!user) {
    return jsonResponse({ success: false, error: "\u05DE\u05E9\u05EA\u05DE\u05E9 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, 404, corsHeaders);
  }
  if (user.email_verified === 1) {
    return jsonResponse({ success: false, error: "\u05D4\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05DB\u05D1\u05E8 \u05DE\u05D0\u05D5\u05DE\u05EA" }, 400, corsHeaders);
  }
  const recentCode = await env.DB.prepare(
    `SELECT created_at FROM verification_codes 
     WHERE email = ? AND created_at > datetime('now', '-1 minute')
     ORDER BY created_at DESC LIMIT 1`
  ).bind(email.toLowerCase()).first();
  if (recentCode) {
    return jsonResponse({ success: false, error: "\u05E0\u05D0 \u05DC\u05D4\u05DE\u05EA\u05D9\u05DF \u05D3\u05E7\u05D4 \u05DC\u05E4\u05E0\u05D9 \u05E9\u05DC\u05D9\u05D7\u05D4 \u05DE\u05D7\u05D3\u05E9" }, 429, corsHeaders);
  }
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
  await env.DB.prepare(
    "DELETE FROM verification_codes WHERE email = ?"
  ).bind(email.toLowerCase()).run();
  await env.DB.prepare(
    "INSERT INTO verification_codes (user_id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(user.id, email.toLowerCase(), code, "registration", expiresAt).run();
  const sent = await sendVerificationEmail(email, code, user.name, env.RESEND_API_KEY);
  if (!sent) {
    return jsonResponse({ success: false, error: "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E9\u05DC\u05D9\u05D7\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC" }, 500, corsHeaders);
  }
  return jsonResponse({ success: true, message: "\u05E7\u05D5\u05D3 \u05D7\u05D3\u05E9 \u05E0\u05E9\u05DC\u05D7 \u05DC\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC" }, 200, corsHeaders);
}
__name(handleResendCode, "handleResendCode");
async function handleRegister(request, env, corsHeaders) {
  const body = await request.json();
  const { email, password, name } = body;
  if (!email || !password || !name) {
    return jsonResponse({ success: false, error: "\u05E0\u05D0 \u05DC\u05DE\u05DC\u05D0 \u05D0\u05EA \u05DB\u05DC \u05D4\u05E9\u05D3\u05D5\u05EA" }, 400, corsHeaders);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return jsonResponse({ success: false, error: "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF" }, 400, corsHeaders);
  }
  if (password.length < 6) {
    return jsonResponse({ success: false, error: "\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05D9\u05D5\u05EA \u05DC\u05E4\u05D7\u05D5\u05EA 6 \u05EA\u05D5\u05D5\u05D9\u05DD" }, 400, corsHeaders);
  }
  const existingUser = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
  if (existingUser) {
    return jsonResponse({ success: false, error: "\u05D4\u05DE\u05E9\u05EA\u05DE\u05E9 \u05DB\u05D1\u05E8 \u05E7\u05D9\u05D9\u05DD \u05D1\u05DE\u05E2\u05E8\u05DB\u05EA" }, 400, corsHeaders);
  }
  const passwordHash = await hashPassword(password, env.PASSWORD_SALT);
  const userId = "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  const userAgent = request.headers.get("User-Agent") || "";
  const { deviceType, browser } = parseUserAgent(userAgent);
  const appVersion = request.headers.get("X-App-Version") || null;
  const pwaInstalled = request.headers.get("X-PWA-Installed") === "true" ? 1 : 0;
  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, name, subscription_plan, subscription_status, terms_accepted, terms_version, 
     last_login, login_count, user_agent, device_type, browser, app_version, pwa_installed, email_verified) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    userId,
    email.toLowerCase(),
    passwordHash,
    name,
    "free",
    "active",
    (/* @__PURE__ */ new Date()).toISOString(),
    "2025-12",
    (/* @__PURE__ */ new Date()).toISOString(),
    0,
    userAgent,
    deviceType,
    browser,
    appVersion,
    pwaInstalled,
    0
  ).run();
  await env.DB.prepare(
    "INSERT INTO user_activity_log (user_id, action_type, details) VALUES (?, ?, ?)"
  ).bind(userId, "register", JSON.stringify({ deviceType, browser })).run();
  for (const cat of DEFAULT_CATEGORIES) {
    const catId = "cat-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
    await env.DB.prepare(
      "INSERT INTO categories (id, user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(catId, userId, cat.name, cat.type, cat.icon, cat.color).run();
  }
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
  await env.DB.prepare(
    "INSERT INTO verification_codes (user_id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(userId, email.toLowerCase(), code, "registration", expiresAt).run();
  const sent = await sendVerificationEmail(email, code, name, env.RESEND_API_KEY);
  if (!sent) {
    return jsonResponse({
      success: true,
      requiresVerification: true,
      message: "\u05D4\u05D7\u05E9\u05D1\u05D5\u05DF \u05E0\u05D5\u05E6\u05E8, \u05D0\u05DA \u05D4\u05D9\u05EA\u05D4 \u05D1\u05E2\u05D9\u05D4 \u05D1\u05E9\u05DC\u05D9\u05D7\u05EA \u05D4\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC. \u05E0\u05E1\u05D4 \u05DC\u05E9\u05DC\u05D5\u05D7 \u05E9\u05D5\u05D1.",
      data: { userId, email: email.toLowerCase(), name }
    }, 200, corsHeaders);
  }
  return jsonResponse({
    success: true,
    requiresVerification: true,
    message: "\u05E0\u05E8\u05E9\u05DE\u05EA \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4! \u05E7\u05D5\u05D3 \u05D0\u05D9\u05DE\u05D5\u05EA \u05E0\u05E9\u05DC\u05D7 \u05DC\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05E9\u05DC\u05DA.",
    data: { userId, email: email.toLowerCase(), name }
  }, 200, corsHeaders);
}
__name(handleRegister, "handleRegister");
async function handleLogin(request, env, corsHeaders) {
  const body = await request.json();
  const { email, password } = body;
  if (!email || !password) {
    return jsonResponse({ success: false, error: "\u05E0\u05D0 \u05DC\u05DE\u05DC\u05D0 \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D5\u05E1\u05D9\u05E1\u05DE\u05D4" }, 400, corsHeaders);
  }
  const user = await env.DB.prepare(
    "SELECT id, email, password_hash, name, is_admin, email_verified FROM users WHERE email = ?"
  ).bind(email.toLowerCase()).first();
  if (!user) {
    return jsonResponse({ success: false, error: "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D0\u05D5 \u05E1\u05D9\u05E1\u05DE\u05D4 \u05E9\u05D2\u05D5\u05D9\u05D9\u05DD" }, 401, corsHeaders);
  }
  const isValid = await verifyPassword(password, user.password_hash, env.PASSWORD_SALT);
  if (!isValid) {
    return jsonResponse({ success: false, error: "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05D0\u05D5 \u05E1\u05D9\u05E1\u05DE\u05D4 \u05E9\u05D2\u05D5\u05D9\u05D9\u05DD" }, 401, corsHeaders);
  }
  if (user.email_verified !== 1) {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3).toISOString();
    await env.DB.prepare("DELETE FROM verification_codes WHERE email = ?").bind(email.toLowerCase()).run();
    await env.DB.prepare(
      "INSERT INTO verification_codes (user_id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(user.id, email.toLowerCase(), code, "registration", expiresAt).run();
    await sendVerificationEmail(email, code, user.name, env.RESEND_API_KEY);
    return jsonResponse({
      success: true,
      requiresVerification: true,
      message: "\u05D4\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05E2\u05D3\u05D9\u05D9\u05DF \u05DC\u05D0 \u05D0\u05D5\u05DE\u05EA. \u05E7\u05D5\u05D3 \u05D7\u05D3\u05E9 \u05E0\u05E9\u05DC\u05D7 \u05D0\u05DC\u05D9\u05DA.",
      data: { userId: user.id, email: user.email, name: user.name }
    }, 200, corsHeaders);
  }
  const newHash = await hashPassword(password, env.PASSWORD_SALT);
  if (newHash !== user.password_hash) {
    await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, user.id).run();
  }
  const userAgent = request.headers.get("User-Agent") || "";
  const { deviceType, browser } = parseUserAgent(userAgent);
  const appVersion = request.headers.get("X-App-Version") || null;
  const pwaInstalled = request.headers.get("X-PWA-Installed") === "true" ? 1 : 0;
  await env.DB.prepare(
    `UPDATE users SET 
     last_login = ?, 
     login_count = COALESCE(login_count, 0) + 1,
     user_agent = ?,
     device_type = ?,
     browser = ?,
     app_version = COALESCE(?, app_version),
     pwa_installed = CASE WHEN ? = 1 THEN 1 ELSE pwa_installed END
     WHERE id = ?`
  ).bind(
    (/* @__PURE__ */ new Date()).toISOString(),
    userAgent,
    deviceType,
    browser,
    appVersion,
    pwaInstalled,
    user.id
  ).run();
  await env.DB.prepare(
    "INSERT INTO user_activity_log (user_id, action_type, details) VALUES (?, ?, ?)"
  ).bind(user.id, "login", JSON.stringify({ deviceType, browser })).run();
  const token = await createToken(user.id, user.email, env.JWT_SECRET);
  return jsonResponse({
    success: true,
    message: "\u05D4\u05EA\u05D7\u05D1\u05E8\u05EA \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4!",
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_admin: user.is_admin || 0
      }
    }
  }, 200, corsHeaders);
}
__name(handleLogin, "handleLogin");

// src/routes/profile.js
async function handleUpdateProfile(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { name, email } = body;
  if (!name || !email) {
    return jsonResponse({ success: false, error: "\u05E0\u05D0 \u05DC\u05DE\u05DC\u05D0 \u05D0\u05EA \u05DB\u05DC \u05D4\u05E9\u05D3\u05D5\u05EA" }, 400, corsHeaders);
  }
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ? AND id != ?").bind(email, userId).first();
  if (existing) {
    return jsonResponse({ success: false, error: "\u05D4\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC \u05DB\u05D1\u05E8 \u05E7\u05D9\u05D9\u05DD \u05D1\u05DE\u05E2\u05E8\u05DB\u05EA" }, 400, corsHeaders);
  }
  await env.DB.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").bind(name, email, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateProfile, "handleUpdateProfile");
async function handleChangePassword(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return jsonResponse({ success: false, error: "\u05D4\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05DB\u05D9\u05DC \u05DC\u05E4\u05D7\u05D5\u05EA 6 \u05EA\u05D5\u05D5\u05D9\u05DD" }, 400, corsHeaders);
  }
  const user = await env.DB.prepare("SELECT password_hash FROM users WHERE id = ?").bind(userId).first();
  if (!user) {
    return jsonResponse({ success: false, error: "\u05DE\u05E9\u05EA\u05DE\u05E9 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, 404, corsHeaders);
  }
  const isValid = await verifyPassword(currentPassword, user.password_hash, env.PASSWORD_SALT);
  if (!isValid) {
    return jsonResponse({ success: false, error: "\u05D4\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D4\u05E0\u05D5\u05DB\u05D7\u05D9\u05EA \u05E9\u05D2\u05D5\u05D9\u05D4" }, 400, corsHeaders);
  }
  const newHash = await hashPassword(newPassword, env.PASSWORD_SALT);
  await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(newHash, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleChangePassword, "handleChangePassword");
async function handleDeleteAccount(env, userId, corsHeaders) {
  const tables = [
    "expenses",
    "incomes",
    "budgets",
    "cards",
    "loans",
    "installment_plans",
    "categories",
    "feedback",
    "user_errors",
    "user_activity_log",
    "verification_codes",
    "subscriptions",
    "financial_goals",
    "goal_contributions",
    "excluded_recurring",
    "business_expenses",
    "business_incomes",
    "business_clients",
    "business_suppliers"
  ];
  for (const table of tables) {
    try {
      await env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(userId).run();
    } catch (e) {
    }
  }
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();
  return jsonResponse({ success: true, message: "\u05D4\u05D7\u05E9\u05D1\u05D5\u05DF \u05E0\u05DE\u05D7\u05E7 \u05D1\u05D4\u05E6\u05DC\u05D7\u05D4" }, 200, corsHeaders);
}
__name(handleDeleteAccount, "handleDeleteAccount");
async function handleUpdatePwaStatus(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { installed } = body;
  await env.DB.prepare("UPDATE users SET pwa_installed = ? WHERE id = ?").bind(installed ? 1 : 0, userId).run();
  await env.DB.prepare(
    "INSERT INTO user_activity_log (user_id, action_type, details) VALUES (?, ?, ?)"
  ).bind(userId, "pwa_install", JSON.stringify({ installed })).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdatePwaStatus, "handleUpdatePwaStatus");
async function handleUpdateAppInfo(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { app_version, pwa_installed } = body;
  const userAgent = request.headers.get("User-Agent") || "";
  const { deviceType, browser } = parseUserAgent(userAgent);
  const pwaValue = pwa_installed ? 1 : null;
  await env.DB.prepare(
    `UPDATE users SET 
     app_version = COALESCE(?, app_version),
     pwa_installed = CASE 
       WHEN pwa_installed = 1 THEN 1 
       WHEN ? = 1 THEN 1 
       ELSE pwa_installed 
     END,
     user_agent = ?,
     device_type = ?,
     browser = ?
     WHERE id = ?`
  ).bind(app_version || null, pwaValue, userAgent, deviceType, browser, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateAppInfo, "handleUpdateAppInfo");
async function handleReportError(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { error_message, error_stack, page } = body;
  if (!error_message) {
    return jsonResponse({ success: false, error: "Missing error message" }, 400, corsHeaders);
  }
  await env.DB.prepare(
    "INSERT INTO user_errors (user_id, error_message, error_stack, page) VALUES (?, ?, ?, ?)"
  ).bind(userId, error_message.substring(0, 500), error_stack?.substring(0, 2e3) || null, page || null).run();
  await env.DB.prepare(
    `UPDATE users SET 
     error_count = COALESCE(error_count, 0) + 1,
     last_error = ?,
     last_error_at = ?
     WHERE id = ?`
  ).bind(error_message.substring(0, 500), (/* @__PURE__ */ new Date()).toISOString(), userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleReportError, "handleReportError");
async function handleGetSettings(env, userId, corsHeaders) {
  const user = await env.DB.prepare(`
    SELECT notifications_enabled, default_notify_days, budget_alerts, budget_alert_threshold
    FROM users WHERE id = ?
  `).bind(userId).first();
  return jsonResponse({
    success: true,
    data: {
      notifications_enabled: user?.notifications_enabled ?? 1,
      subs_reminders: 1,
      default_notify_days: user?.default_notify_days ?? 3,
      budget_alerts: user?.budget_alerts ?? 1,
      budget_alert_threshold: user?.budget_alert_threshold ?? 80
    }
  }, 200, corsHeaders);
}
__name(handleGetSettings, "handleGetSettings");
async function handleUpdateSettings(request, env, userId, corsHeaders) {
  const body = await request.json();
  await env.DB.prepare(`
    UPDATE users 
    SET notifications_enabled = ?, default_notify_days = ?, budget_alerts = ?, budget_alert_threshold = ?
    WHERE id = ?
  `).bind(
    body.notifications_enabled ?? 1,
    body.default_notify_days ?? 3,
    body.budget_alerts ?? 1,
    body.budget_alert_threshold ?? 80,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateSettings, "handleUpdateSettings");

// src/utils/recurring.js
function isMonthInRecurringRange(monthStr, startDate, endDate) {
  const [year, month] = monthStr.split("-").map(Number);
  const requestedMonthNum = year * 12 + month;
  const start = new Date(startDate);
  const startMonthNum = start.getFullYear() * 12 + (start.getMonth() + 1);
  if (requestedMonthNum < startMonthNum)
    return false;
  if (endDate) {
    const [endYear, endMonth] = endDate.split("-").map(Number);
    const endMonthNum = endYear * 12 + endMonth;
    if (requestedMonthNum > endMonthNum)
      return false;
  }
  return true;
}
__name(isMonthInRecurringRange, "isMonthInRecurringRange");
async function generateRecurringIncomes(db, userId, year, month) {
  const { results: recurringIncomes } = await db.prepare(
    "SELECT * FROM incomes WHERE user_id = ? AND is_recurring = 1"
  ).bind(userId).all();
  if (!recurringIncomes || recurringIncomes.length === 0)
    return { generated: 0 };
  const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
  const requestedDate = new Date(year, month - 1, 1);
  let generatedCount = 0;
  const { results: exclusions } = await db.prepare(
    "SELECT parent_recurring_id, excluded_month FROM excluded_recurring WHERE user_id = ? AND type = ?"
  ).bind(userId, "income").all();
  const excludedSet = new Set((exclusions || []).map((e) => `${e.parent_recurring_id}|${e.excluded_month}`));
  for (const income of recurringIncomes) {
    const originalDate = new Date(income.date);
    const originalYear = originalDate.getFullYear();
    const originalMonth = originalDate.getMonth() + 1;
    if (originalYear === year && originalMonth === month)
      continue;
    if (requestedDate < new Date(originalYear, originalMonth - 1, 1))
      continue;
    if (income.recurring_end_date && !isMonthInRecurringRange(monthStr, income.date, income.recurring_end_date))
      continue;
    if (excludedSet.has(`${income.id}|${monthStr}`))
      continue;
    const existingGenerated = await db.prepare(
      `SELECT id FROM incomes WHERE user_id = ? AND parent_recurring_id = ? AND date LIKE ?`
    ).bind(userId, income.id, monthStr + "%").first();
    if (existingGenerated)
      continue;
    const day = Math.min(originalDate.getDate(), new Date(year, month, 0).getDate());
    const newDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const newId = "inc-gen-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
    await db.prepare(
      `INSERT INTO incomes (id, amount, source, description, date, is_recurring, recurring_type, user_id, parent_recurring_id) 
       VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?)`
    ).bind(newId, income.amount, income.source, income.description || "", newDate, userId, income.id).run();
    generatedCount++;
  }
  return { generated: generatedCount };
}
__name(generateRecurringIncomes, "generateRecurringIncomes");
async function generateRecurringExpenses(db, userId, year, month) {
  const now = /* @__PURE__ */ new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const maxFutureMonths = 12;
  const requestedMonthNum = year * 12 + month;
  const currentMonthNum = currentYear * 12 + currentMonth;
  if (requestedMonthNum > currentMonthNum + maxFutureMonths) {
    return { generated: 0 };
  }
  const { results: recurringExpenses } = await db.prepare(
    "SELECT * FROM expenses WHERE user_id = ? AND is_recurring = 1"
  ).bind(userId).all();
  if (!recurringExpenses || recurringExpenses.length === 0)
    return { generated: 0 };
  const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
  const requestedDate = new Date(year, month - 1, 1);
  let generatedCount = 0;
  const { results: exclusions } = await db.prepare(
    "SELECT parent_recurring_id, excluded_month FROM excluded_recurring WHERE user_id = ? AND type = ?"
  ).bind(userId, "expense").all();
  const excludedSet = new Set((exclusions || []).map((e) => `${e.parent_recurring_id}|${e.excluded_month}`));
  for (const expense of recurringExpenses) {
    const originalDate = new Date(expense.date);
    const originalYear = originalDate.getFullYear();
    const originalMonth = originalDate.getMonth() + 1;
    if (originalYear === year && originalMonth === month)
      continue;
    if (requestedDate < new Date(originalYear, originalMonth - 1, 1))
      continue;
    if (expense.recurring_end_date && !isMonthInRecurringRange(monthStr, expense.date, expense.recurring_end_date))
      continue;
    if (excludedSet.has(`${expense.id}|${monthStr}`))
      continue;
    const existingGenerated = await db.prepare(
      `SELECT id FROM expenses WHERE user_id = ? AND parent_recurring_id = ? AND date LIKE ?`
    ).bind(userId, expense.id, monthStr + "%").first();
    if (existingGenerated)
      continue;
    const day = Math.min(originalDate.getDate(), new Date(year, month, 0).getDate());
    const newDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
    const newId = "exp-gen-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
    await db.prepare(
      `INSERT INTO expenses (id, amount, category, description, date, is_recurring, recurring_type, user_id, payment_method, card_id, expense_type, parent_recurring_id) 
       VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?, ?, 'regular', ?)`
    ).bind(
      newId,
      expense.amount,
      expense.category,
      expense.description || "",
      newDate,
      userId,
      expense.payment_method || "cash",
      expense.card_id || null,
      expense.id
    ).run();
    generatedCount++;
  }
  return { generated: generatedCount };
}
__name(generateRecurringExpenses, "generateRecurringExpenses");

// src/routes/finance.js
async function handleGetExpenses(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month");
  if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number);
    await generateRecurringExpenses(env.DB, userId, year, month);
  }
  const { results } = await env.DB.prepare(
    'SELECT * FROM expenses WHERE user_id = ? AND expense_type = "regular" ORDER BY date DESC'
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetExpenses, "handleGetExpenses");
async function handleGetExpense(env, userId, expenseId, corsHeaders) {
  const expense = await env.DB.prepare(
    "SELECT * FROM expenses WHERE id = ? AND user_id = ?"
  ).bind(expenseId, userId).first();
  if (!expense) {
    return jsonResponse({ success: false, error: "Expense not found" }, 404, corsHeaders);
  }
  return jsonResponse({ success: true, data: expense }, 200, corsHeaders);
}
__name(handleGetExpense, "handleGetExpense");
async function handleCreateExpense(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "exp-" + Date.now();
  await env.DB.prepare(
    `INSERT INTO expenses (id, amount, category, description, date, is_recurring, recurring_type, user_id, payment_method, card_id, expense_type) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'regular')`
  ).bind(
    id,
    body.amount,
    body.category,
    body.description || "",
    body.date,
    body.isRecurring ? 1 : 0,
    body.recurringType || null,
    userId,
    body.paymentMethod || "cash",
    body.cardId || null
  ).run();
  await checkBudgetAlert(env, userId, body.category, body.date, body.paymentMethod, body.cardId);
  return jsonResponse({ success: true, id }, 200, corsHeaders);
}
__name(handleCreateExpense, "handleCreateExpense");
async function handleUpdateExpense(request, env, userId, expenseId, corsHeaders) {
  const body = await request.json();
  const existingExpense = await env.DB.prepare(
    "SELECT parent_recurring_id FROM expenses WHERE id = ? AND user_id = ?"
  ).bind(expenseId, userId).first();
  let isRecurring = body.isRecurring ? 1 : 0;
  let recurringType = body.recurringType || null;
  let recurringEndDate = body.recurringEndDate || null;
  if (existingExpense && existingExpense.parent_recurring_id) {
    isRecurring = 0;
    recurringType = null;
    recurringEndDate = null;
  }
  await env.DB.prepare(
    `UPDATE expenses SET amount = ?, category = ?, description = ?, date = ?, is_recurring = ?, recurring_type = ?, recurring_end_date = ?, payment_method = ?, card_id = ?
     WHERE id = ? AND user_id = ?`
  ).bind(
    body.amount,
    body.category,
    body.description || "",
    body.date,
    isRecurring,
    recurringType,
    recurringEndDate,
    body.paymentMethod || "cash",
    body.cardId || null,
    expenseId,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateExpense, "handleUpdateExpense");
async function handleDeleteExpense(env, userId, expenseId, corsHeaders) {
  const expense = await env.DB.prepare(
    "SELECT is_recurring, parent_recurring_id, date FROM expenses WHERE id = ? AND user_id = ?"
  ).bind(expenseId, userId).first();
  if (expense && expense.is_recurring === 1) {
    await env.DB.prepare("DELETE FROM expenses WHERE parent_recurring_id = ? AND user_id = ?").bind(expenseId, userId).run();
    await env.DB.prepare("DELETE FROM excluded_recurring WHERE parent_recurring_id = ? AND user_id = ?").bind(expenseId, userId).run();
  } else if (expense && expense.parent_recurring_id) {
    const month = expense.date.substring(0, 7);
    const excludeId = "excl-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
    await env.DB.prepare(
      "INSERT OR IGNORE INTO excluded_recurring (id, user_id, parent_recurring_id, excluded_month, type) VALUES (?, ?, ?, ?, ?)"
    ).bind(excludeId, userId, expense.parent_recurring_id, month, "expense").run();
  }
  await env.DB.prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?").bind(expenseId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteExpense, "handleDeleteExpense");
async function handleExpenseRecurring(request, env, userId, expenseId, corsHeaders) {
  const body = await request.json();
  const expense = await env.DB.prepare(
    "SELECT is_recurring, date FROM expenses WHERE id = ? AND user_id = ?"
  ).bind(expenseId, userId).first();
  if (!expense || expense.is_recurring !== 1) {
    return jsonResponse({ success: false, error: "Not a recurring expense" }, 400, corsHeaders);
  }
  if (body.action === "stop") {
    const now = /* @__PURE__ */ new Date();
    const prevMonth = now.getMonth();
    const year = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = prevMonth === 0 ? 12 : prevMonth;
    const endDate = `${year}-${month.toString().padStart(2, "0")}`;
    await env.DB.prepare(
      "UPDATE expenses SET recurring_end_date = ? WHERE id = ? AND user_id = ?"
    ).bind(endDate, expenseId, userId).run();
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    await env.DB.prepare(
      "DELETE FROM expenses WHERE parent_recurring_id = ? AND user_id = ? AND date >= ?"
    ).bind(expenseId, userId, currentMonthStr + "-01").run();
    return jsonResponse({ success: true, endDate }, 200, corsHeaders);
  }
  if (body.action === "setEndDate") {
    const endDate = body.endDate;
    await env.DB.prepare(
      "UPDATE expenses SET recurring_end_date = ? WHERE id = ? AND user_id = ?"
    ).bind(endDate, expenseId, userId).run();
    const [endYear, endMonth] = endDate.split("-").map(Number);
    const deleteAfter = `${endYear}-${endMonth.toString().padStart(2, "0")}`;
    await env.DB.prepare(
      "DELETE FROM expenses WHERE parent_recurring_id = ? AND user_id = ? AND date > ?"
    ).bind(expenseId, userId, deleteAfter + "-31").run();
    return jsonResponse({ success: true, endDate }, 200, corsHeaders);
  }
  if (body.action === "removeEndDate") {
    await env.DB.prepare(
      "UPDATE expenses SET recurring_end_date = NULL WHERE id = ? AND user_id = ?"
    ).bind(expenseId, userId).run();
    return jsonResponse({ success: true }, 200, corsHeaders);
  }
  return jsonResponse({ success: false, error: "Invalid action" }, 400, corsHeaders);
}
__name(handleExpenseRecurring, "handleExpenseRecurring");
async function handleGetIncomes(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month");
  if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number);
    await generateRecurringIncomes(env.DB, userId, year, month);
  }
  const { results } = await env.DB.prepare(
    "SELECT * FROM incomes WHERE user_id = ? ORDER BY date DESC"
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetIncomes, "handleGetIncomes");
async function handleGetIncome(env, userId, incomeId, corsHeaders) {
  const income = await env.DB.prepare(
    "SELECT * FROM incomes WHERE id = ? AND user_id = ?"
  ).bind(incomeId, userId).first();
  if (!income) {
    return jsonResponse({ success: false, error: "Income not found" }, 404, corsHeaders);
  }
  return jsonResponse({ success: true, data: income }, 200, corsHeaders);
}
__name(handleGetIncome, "handleGetIncome");
async function handleCreateIncome(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "inc-" + Date.now();
  await env.DB.prepare(
    "INSERT INTO incomes (id, amount, source, description, date, is_recurring, recurring_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, body.amount, body.source, body.description || "", body.date, body.isRecurring ? 1 : 0, body.recurringType || null, userId).run();
  return jsonResponse({ success: true, id }, 200, corsHeaders);
}
__name(handleCreateIncome, "handleCreateIncome");
async function handleUpdateIncome(request, env, userId, incomeId, corsHeaders) {
  const body = await request.json();
  const existingIncome = await env.DB.prepare(
    "SELECT parent_recurring_id FROM incomes WHERE id = ? AND user_id = ?"
  ).bind(incomeId, userId).first();
  let isRecurring = body.isRecurring ? 1 : 0;
  let recurringType = body.recurringType || null;
  let recurringEndDate = body.recurringEndDate || null;
  if (existingIncome && existingIncome.parent_recurring_id) {
    isRecurring = 0;
    recurringType = null;
    recurringEndDate = null;
  }
  await env.DB.prepare(
    `UPDATE incomes SET amount = ?, source = ?, description = ?, date = ?, is_recurring = ?, recurring_type = ?, recurring_end_date = ? WHERE id = ? AND user_id = ?`
  ).bind(body.amount, body.source, body.description || "", body.date, isRecurring, recurringType, recurringEndDate, incomeId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateIncome, "handleUpdateIncome");
async function handleDeleteIncome(env, userId, incomeId, corsHeaders) {
  const income = await env.DB.prepare(
    "SELECT is_recurring, parent_recurring_id, date FROM incomes WHERE id = ? AND user_id = ?"
  ).bind(incomeId, userId).first();
  if (income && income.is_recurring === 1) {
    await env.DB.prepare("DELETE FROM incomes WHERE parent_recurring_id = ? AND user_id = ?").bind(incomeId, userId).run();
    await env.DB.prepare("DELETE FROM excluded_recurring WHERE parent_recurring_id = ? AND user_id = ?").bind(incomeId, userId).run();
  } else if (income && income.parent_recurring_id) {
    const month = income.date.substring(0, 7);
    const excludeId = "excl-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
    await env.DB.prepare(
      "INSERT OR IGNORE INTO excluded_recurring (id, user_id, parent_recurring_id, excluded_month, type) VALUES (?, ?, ?, ?, ?)"
    ).bind(excludeId, userId, income.parent_recurring_id, month, "income").run();
  }
  await env.DB.prepare("DELETE FROM incomes WHERE id = ? AND user_id = ?").bind(incomeId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteIncome, "handleDeleteIncome");
async function handleIncomeRecurring(request, env, userId, incomeId, corsHeaders) {
  const body = await request.json();
  const income = await env.DB.prepare(
    "SELECT is_recurring, date FROM incomes WHERE id = ? AND user_id = ?"
  ).bind(incomeId, userId).first();
  if (!income || income.is_recurring !== 1) {
    return jsonResponse({ success: false, error: "Not a recurring income" }, 400, corsHeaders);
  }
  if (body.action === "stop") {
    const now = /* @__PURE__ */ new Date();
    const prevMonth = now.getMonth();
    const year = prevMonth === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = prevMonth === 0 ? 12 : prevMonth;
    const endDate = `${year}-${month.toString().padStart(2, "0")}`;
    await env.DB.prepare(
      "UPDATE incomes SET recurring_end_date = ? WHERE id = ? AND user_id = ?"
    ).bind(endDate, incomeId, userId).run();
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    await env.DB.prepare(
      "DELETE FROM incomes WHERE parent_recurring_id = ? AND user_id = ? AND date >= ?"
    ).bind(incomeId, userId, currentMonthStr + "-01").run();
    return jsonResponse({ success: true, endDate }, 200, corsHeaders);
  }
  if (body.action === "setEndDate") {
    const endDate = body.endDate;
    await env.DB.prepare(
      "UPDATE incomes SET recurring_end_date = ? WHERE id = ? AND user_id = ?"
    ).bind(endDate, incomeId, userId).run();
    const [endYear, endMonth] = endDate.split("-").map(Number);
    const deleteAfter = `${endYear}-${endMonth.toString().padStart(2, "0")}`;
    await env.DB.prepare(
      "DELETE FROM incomes WHERE parent_recurring_id = ? AND user_id = ? AND date > ?"
    ).bind(incomeId, userId, deleteAfter + "-31").run();
    return jsonResponse({ success: true, endDate }, 200, corsHeaders);
  }
  if (body.action === "removeEndDate") {
    await env.DB.prepare(
      "UPDATE incomes SET recurring_end_date = NULL WHERE id = ? AND user_id = ?"
    ).bind(incomeId, userId).run();
    return jsonResponse({ success: true }, 200, corsHeaders);
  }
  return jsonResponse({ success: false, error: "Invalid action" }, 400, corsHeaders);
}
__name(handleIncomeRecurring, "handleIncomeRecurring");
async function handleGetBudgets(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetBudgets, "handleGetBudgets");
async function handleCreateBudget(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "bdg-" + Date.now();
  await env.DB.prepare(
    "INSERT INTO budgets (id, category, amount, period, user_id, alert_enabled) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, body.category, body.amount, body.period, userId, body.alert_enabled ?? 1).run();
  return jsonResponse({ success: true, id }, 200, corsHeaders);
}
__name(handleCreateBudget, "handleCreateBudget");
async function handleUpdateBudget(request, env, userId, budgetId, corsHeaders) {
  const body = await request.json();
  if (!body.category || !body.amount) {
    return jsonResponse({ success: false, error: "\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 \u05D5\u05E1\u05DB\u05D5\u05DD \u05D4\u05DD \u05E9\u05D3\u05D5\u05EA \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  await env.DB.prepare(
    "UPDATE budgets SET category = ?, amount = ?, period = ?, alert_enabled = ? WHERE id = ? AND user_id = ?"
  ).bind(body.category, body.amount, body.period || "monthly", body.alert_enabled ?? 1, budgetId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateBudget, "handleUpdateBudget");
async function handleDeleteBudget(env, userId, budgetId, corsHeaders) {
  await env.DB.prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?").bind(budgetId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteBudget, "handleDeleteBudget");
async function handleGetCategories(env, userId, corsHeaders) {
  let { results } = await env.DB.prepare(
    "SELECT * FROM categories WHERE user_id = ? ORDER BY type, name"
  ).bind(userId).all();
  if (!results || results.length === 0) {
    results = [];
    for (const cat of DEFAULT_CATEGORIES) {
      const catId = "cat-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      await env.DB.prepare(
        "INSERT INTO categories (id, user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(catId, userId, cat.name, cat.type, cat.icon, cat.color).run();
      results.push({ id: catId, user_id: userId, ...cat });
    }
  }
  return jsonResponse({ success: true, data: results }, 200, corsHeaders);
}
__name(handleGetCategories, "handleGetCategories");
async function handleCreateCategory(request, env, userId, corsHeaders) {
  const body = await request.json();
  if (!body.name || !body.type) {
    return jsonResponse({ success: false, error: "\u05E0\u05D0 \u05DC\u05DE\u05DC\u05D0 \u05E9\u05DD \u05D5\u05E1\u05D5\u05D2 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4" }, 400, corsHeaders);
  }
  const existing = await env.DB.prepare(
    "SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ?"
  ).bind(userId, body.name, body.type).first();
  if (existing) {
    return jsonResponse({ success: false, error: "\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 \u05E2\u05DD \u05E9\u05DD \u05D6\u05D4 \u05DB\u05D1\u05E8 \u05E7\u05D9\u05D9\u05DE\u05EA" }, 400, corsHeaders);
  }
  const id = "cat-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  await env.DB.prepare(
    "INSERT INTO categories (id, user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, userId, body.name, body.type, body.icon || "\u{1F4E6}", body.color || "#667eea").run();
  return jsonResponse({
    success: true,
    data: { id, user_id: userId, name: body.name, type: body.type, icon: body.icon || "\u{1F4E6}", color: body.color || "#667eea" }
  }, 200, corsHeaders);
}
__name(handleCreateCategory, "handleCreateCategory");
async function handleUpdateCategory(request, env, userId, categoryId, corsHeaders) {
  const body = await request.json();
  const oldCategory = await env.DB.prepare(
    "SELECT name, type FROM categories WHERE id = ? AND user_id = ?"
  ).bind(categoryId, userId).first();
  if (!oldCategory) {
    return jsonResponse({ success: false, error: "\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D4" }, 404, corsHeaders);
  }
  await env.DB.prepare(
    "UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ? AND user_id = ?"
  ).bind(body.name || oldCategory.name, body.icon || "\u{1F4E6}", body.color || "#667eea", categoryId, userId).run();
  if (body.name && body.name !== oldCategory.name) {
    if (oldCategory.type === "expense") {
      await env.DB.prepare("UPDATE expenses SET category = ? WHERE user_id = ? AND category = ?").bind(body.name, userId, oldCategory.name).run();
    } else {
      await env.DB.prepare("UPDATE incomes SET source = ? WHERE user_id = ? AND source = ?").bind(body.name, userId, oldCategory.name).run();
    }
  }
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateCategory, "handleUpdateCategory");
async function handleDeleteCategory(env, userId, categoryId, corsHeaders) {
  const category = await env.DB.prepare(
    "SELECT name, type FROM categories WHERE id = ? AND user_id = ?"
  ).bind(categoryId, userId).first();
  if (!category) {
    return jsonResponse({ success: false, error: "\u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D4" }, 404, corsHeaders);
  }
  await env.DB.prepare("DELETE FROM categories WHERE id = ? AND user_id = ?").bind(categoryId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteCategory, "handleDeleteCategory");
async function handleGetCards(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetCards, "handleGetCards");
async function handleCreateCard(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "card-" + Date.now();
  await env.DB.prepare(
    "INSERT INTO cards (id, user_id, card_name, last_four, color, billing_day) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, userId, body.card_name, body.last_four || null, body.color || "#667eea", body.billing_day || null).run();
  return jsonResponse({ success: true, data: { id, card_name: body.card_name, color: body.color || "#667eea" } }, 200, corsHeaders);
}
__name(handleCreateCard, "handleCreateCard");
async function handleUpdateCard(request, env, userId, cardId, corsHeaders) {
  const body = await request.json();
  await env.DB.prepare(
    "UPDATE cards SET card_name = ?, last_four = ?, color = ?, billing_day = ? WHERE id = ? AND user_id = ?"
  ).bind(body.card_name, body.last_four || null, body.color || "#667eea", body.billing_day || null, cardId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateCard, "handleUpdateCard");
async function handleDeleteCard(env, userId, cardId, corsHeaders) {
  await env.DB.prepare("DELETE FROM cards WHERE id = ? AND user_id = ?").bind(cardId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteCard, "handleDeleteCard");
async function handleGetLoans(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM loans WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetLoans, "handleGetLoans");
async function handleCreateLoan(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "loan-" + Date.now();
  if (!body.loan_name || !body.monthly_payment) {
    return jsonResponse({ success: false, error: "\u05E0\u05D0 \u05DC\u05DE\u05DC\u05D0 \u05E9\u05DD \u05D4\u05DC\u05D5\u05D5\u05D0\u05D4 \u05D5\u05D4\u05D7\u05D6\u05E8 \u05D7\u05D5\u05D3\u05E9\u05D9" }, 400, corsHeaders);
  }
  let endDate = body.end_date || null;
  if (!endDate && body.start_date && body.total_months) {
    const start = new Date(body.start_date);
    start.setMonth(start.getMonth() + body.total_months);
    endDate = start.toISOString().split("T")[0];
  }
  await env.DB.prepare(
    `INSERT INTO loans (id, user_id, loan_name, lender, original_amount, total_months, monthly_payment, interest_rate, start_date, end_date, remaining_amount, remaining_months, status, card_id, category, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`
  ).bind(
    id,
    userId,
    body.loan_name,
    body.lender || null,
    body.original_amount || null,
    body.total_months || null,
    body.monthly_payment,
    body.interest_rate || null,
    body.start_date || null,
    endDate,
    body.remaining_amount || body.original_amount,
    body.remaining_months || body.total_months,
    body.card_id || null,
    body.category || "\u05D4\u05DC\u05D5\u05D5\u05D0\u05D4",
    body.notes || null
  ).run();
  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}
__name(handleCreateLoan, "handleCreateLoan");
async function handleUpdateLoan(request, env, userId, loanId, corsHeaders) {
  const body = await request.json();
  await env.DB.prepare(
    `UPDATE loans SET loan_name = ?, lender = ?, original_amount = ?, total_months = ?, monthly_payment = ?, 
     interest_rate = ?, start_date = ?, end_date = ?, remaining_amount = ?, remaining_months = ?, 
     status = ?, card_id = ?, category = ?, notes = ? WHERE id = ? AND user_id = ?`
  ).bind(
    body.loan_name,
    body.lender || null,
    body.original_amount || null,
    body.total_months || null,
    body.monthly_payment,
    body.interest_rate || null,
    body.start_date || null,
    body.end_date || null,
    body.remaining_amount || null,
    body.remaining_months || null,
    body.status || "active",
    body.card_id || null,
    body.category || "\u05D4\u05DC\u05D5\u05D5\u05D0\u05D4",
    body.notes || null,
    loanId,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateLoan, "handleUpdateLoan");
async function handleDeleteLoan(env, userId, loanId, corsHeaders) {
  await env.DB.prepare("DELETE FROM loans WHERE id = ? AND user_id = ?").bind(loanId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteLoan, "handleDeleteLoan");
async function handleGetInstallments(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM installment_plans WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetInstallments, "handleGetInstallments");
async function handleCreateInstallment(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "inst-" + Date.now();
  const installmentAmount = body.original_amount / body.total_installments;
  await env.DB.prepare(
    `INSERT INTO installment_plans (id, user_id, description, original_amount, total_installments, installment_amount, first_payment_date, card_id, category, remaining_installments, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`
  ).bind(
    id,
    userId,
    body.description,
    body.original_amount,
    body.total_installments,
    installmentAmount,
    body.first_payment_date,
    body.card_id || null,
    body.category || "\u05E7\u05E0\u05D9\u05D5\u05EA",
    body.total_installments
  ).run();
  return jsonResponse({ success: true, data: { id, installment_amount: installmentAmount } }, 200, corsHeaders);
}
__name(handleCreateInstallment, "handleCreateInstallment");
async function handleUpdateInstallment(request, env, userId, instId, corsHeaders) {
  const body = await request.json();
  const installmentAmount = body.installment_amount || body.original_amount / body.total_installments;
  await env.DB.prepare(
    `UPDATE installment_plans SET description = ?, original_amount = ?, total_installments = ?, installment_amount = ?, 
     first_payment_date = ?, card_id = ?, category = ?, remaining_installments = ?, status = ? WHERE id = ? AND user_id = ?`
  ).bind(
    body.description,
    body.original_amount,
    body.total_installments,
    installmentAmount,
    body.first_payment_date,
    body.card_id || null,
    body.category || "\u05E7\u05E0\u05D9\u05D5\u05EA",
    body.remaining_installments,
    body.status || "active",
    instId,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateInstallment, "handleUpdateInstallment");
async function handleDeleteInstallment(env, userId, instId, corsHeaders) {
  await env.DB.prepare("DELETE FROM installment_plans WHERE id = ? AND user_id = ?").bind(instId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteInstallment, "handleDeleteInstallment");
async function checkBudgetAlert(env, userId, category, expenseDate, paymentMethod, cardId) {
  try {
    let getBillingMonth = function(expense, cards2) {
      const expDate = new Date(expense.date);
      if (expense.payment_method !== "card" || !expense.card_id) {
        return { year: expDate.getFullYear(), month: expDate.getMonth() };
      }
      let card = null;
      for (let i = 0; i < cards2.length; i++) {
        if (cards2[i].id === expense.card_id) {
          card = cards2[i];
          break;
        }
      }
      const billingDay = card && card.billing_day || 1;
      let billingYear = expDate.getFullYear();
      let billingMonth = expDate.getMonth();
      if (expDate.getDate() < billingDay) {
        billingMonth--;
        if (billingMonth < 0) {
          billingMonth = 11;
          billingYear--;
        }
      }
      return { year: billingYear, month: billingMonth };
    };
    __name(getBillingMonth, "getBillingMonth");
    const user = await env.DB.prepare(
      "SELECT email, name, budget_alerts, budget_alert_threshold FROM users WHERE id = ?"
    ).bind(userId).first();
    if (!user || user.budget_alerts !== 1)
      return;
    const budget = await env.DB.prepare(
      "SELECT id, amount, alert_enabled FROM budgets WHERE user_id = ? AND category = ? AND period = ?"
    ).bind(userId, category, "\u05D7\u05D5\u05D3\u05E9\u05D9").first();
    if (!budget || budget.alert_enabled === 0)
      return;
    const cardsResult = await env.DB.prepare(
      "SELECT id, billing_day FROM cards WHERE user_id = ?"
    ).bind(userId).all();
    const cards = cardsResult.results || [];
    const currentBilling = getBillingMonth({
      date: expenseDate,
      payment_method: paymentMethod || "cash",
      card_id: cardId || null
    }, cards);
    const allExpenses = await env.DB.prepare(
      "SELECT date, amount, payment_method, card_id FROM expenses WHERE user_id = ? AND category = ?"
    ).bind(userId, category).all();
    let spent = 0;
    for (const exp of allExpenses.results || []) {
      const expBilling = getBillingMonth(exp, cards);
      if (expBilling.year === currentBilling.year && expBilling.month === currentBilling.month) {
        spent += parseFloat(exp.amount) || 0;
      }
    }
    const percentage = Math.round(spent / budget.amount * 100);
    const threshold = user.budget_alert_threshold || 80;
    if (percentage >= threshold) {
      const alertKey = `${budget.id}-${currentBilling.year}-${currentBilling.month}`;
      const alreadySent = await env.DB.prepare(
        "SELECT id FROM budget_alert_log WHERE user_id = ? AND alert_key = ?"
      ).bind(userId, alertKey).first();
      if (!alreadySent) {
        await sendBudgetAlertEmail(
          user.email,
          user.name,
          category,
          spent,
          budget.amount,
          percentage,
          env.RESEND_API_KEY
        );
        const logId = "bal-" + Date.now();
        await env.DB.prepare(
          "INSERT INTO budget_alert_log (id, user_id, budget_id, alert_key, percentage_at_alert) VALUES (?, ?, ?, ?, ?)"
        ).bind(logId, userId, budget.id, alertKey, percentage).run();
      }
    }
  } catch (alertError) {
    console.error("Budget alert error:", alertError);
  }
}
__name(checkBudgetAlert, "checkBudgetAlert");

// src/routes/dashboard.js
async function handleDashboard(env, userId, corsHeaders) {
  const { results: expensesData } = await env.DB.prepare(
    "SELECT SUM(amount) as total, COUNT(*) as count FROM expenses WHERE user_id = ?"
  ).bind(userId).all();
  const { results: incomesData } = await env.DB.prepare(
    "SELECT SUM(amount) as total, COUNT(*) as count FROM incomes WHERE user_id = ?"
  ).bind(userId).all();
  const { results: categoryData } = await env.DB.prepare(
    "SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC"
  ).bind(userId).all();
  return jsonResponse({
    success: true,
    data: {
      expenses: { total: expensesData[0]?.total || 0, count: expensesData[0]?.count || 0 },
      incomes: { total: incomesData[0]?.total || 0, count: incomesData[0]?.count || 0 },
      balance: (incomesData[0]?.total || 0) - (expensesData[0]?.total || 0),
      categories: categoryData
    }
  }, 200, corsHeaders);
}
__name(handleDashboard, "handleDashboard");
async function handleMonthlyStats(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const months = parseInt(url.searchParams.get("months")) || 6;
  const monthlyStats = [];
  const now = /* @__PURE__ */ new Date();
  const monthNames = ["\u05D9\u05E0\u05D5\u05D0\u05E8", "\u05E4\u05D1\u05E8\u05D5\u05D0\u05E8", "\u05DE\u05E8\u05E5", "\u05D0\u05E4\u05E8\u05D9\u05DC", "\u05DE\u05D0\u05D9", "\u05D9\u05D5\u05E0\u05D9", "\u05D9\u05D5\u05DC\u05D9", "\u05D0\u05D5\u05D2\u05D5\u05E1\u05D8", "\u05E1\u05E4\u05D8\u05DE\u05D1\u05E8", "\u05D0\u05D5\u05E7\u05D8\u05D5\u05D1\u05E8", "\u05E0\u05D5\u05D1\u05DE\u05D1\u05E8", "\u05D3\u05E6\u05DE\u05D1\u05E8"];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-${new Date(year, date.getMonth() + 1, 0).getDate()}`;
    const expensesData = await env.DB.prepare(
      "SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?"
    ).bind(userId, startDate, endDate).first();
    const incomesData = await env.DB.prepare(
      "SELECT SUM(amount) as total FROM incomes WHERE user_id = ? AND date >= ? AND date <= ?"
    ).bind(userId, startDate, endDate).first();
    monthlyStats.push({
      month: `${year}-${month}`,
      monthName: monthNames[date.getMonth()] + " " + year,
      incomes: incomesData?.total || 0,
      expenses: expensesData?.total || 0,
      balance: (incomesData?.total || 0) - (expensesData?.total || 0)
    });
  }
  return jsonResponse({ success: true, data: monthlyStats }, 200, corsHeaders);
}
__name(handleMonthlyStats, "handleMonthlyStats");

// src/routes/subscriptions.js
async function handleGetSubscriptions(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY next_billing_date ASC"
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetSubscriptions, "handleGetSubscriptions");
async function handleGetSubscription(env, userId, subId, corsHeaders) {
  const subscription = await env.DB.prepare(
    "SELECT * FROM subscriptions WHERE id = ? AND user_id = ?"
  ).bind(subId, userId).first();
  if (!subscription) {
    return jsonResponse({ success: false, error: "\u05DE\u05E0\u05D5\u05D9 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, 404, corsHeaders);
  }
  return jsonResponse({ success: true, data: subscription }, 200, corsHeaders);
}
__name(handleGetSubscription, "handleGetSubscription");
async function handleCreateSubscription(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "sub-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  if (!body.name || !body.amount || !body.billing_cycle) {
    return jsonResponse({ success: false, error: "\u05E9\u05DD, \u05E1\u05DB\u05D5\u05DD \u05D5\u05DE\u05D7\u05D6\u05D5\u05E8 \u05D7\u05D9\u05D5\u05D1 \u05D4\u05DD \u05E9\u05D3\u05D5\u05EA \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  const user = await env.DB.prepare(
    "SELECT default_notify_days FROM users WHERE id = ?"
  ).bind(userId).first();
  const defaultNotifyDays = user?.default_notify_days ?? 3;
  await env.DB.prepare(
    `INSERT INTO subscriptions (
      id, user_id, name, amount, billing_cycle, category, 
      next_billing_date, start_date, status, notify_before_days, notes, icon, color
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    userId,
    body.name,
    body.amount,
    body.billing_cycle,
    body.category || "\u05DE\u05E0\u05D5\u05D9\u05D9\u05DD",
    body.next_billing_date || body.start_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    body.start_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    body.status || "active",
    body.notify_before_days ?? defaultNotifyDays,
    body.notes || null,
    body.icon || "\u{1F4FA}",
    body.color || "#8B5CF6"
  ).run();
  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}
__name(handleCreateSubscription, "handleCreateSubscription");
async function handleUpdateSubscription(request, env, userId, subId, corsHeaders) {
  const body = await request.json();
  await env.DB.prepare(
    `UPDATE subscriptions SET 
      name = ?, amount = ?, billing_cycle = ?, category = ?,
      next_billing_date = ?, status = ?, notify_before_days = ?, 
      notes = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?`
  ).bind(
    body.name,
    body.amount,
    body.billing_cycle,
    body.category || "\u05DE\u05E0\u05D5\u05D9\u05D9\u05DD",
    body.next_billing_date,
    body.status || "active",
    body.notify_before_days ?? 3,
    body.notes || null,
    body.icon || "\u{1F4FA}",
    body.color || "#8B5CF6",
    subId,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateSubscription, "handleUpdateSubscription");
async function handleDeleteSubscription(env, userId, subId, corsHeaders) {
  await env.DB.prepare("DELETE FROM subscriptions WHERE id = ? AND user_id = ?").bind(subId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteSubscription, "handleDeleteSubscription");
async function handleCancelSubscription(env, userId, subId, corsHeaders) {
  await env.DB.prepare(
    `UPDATE subscriptions SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(subId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleCancelSubscription, "handleCancelSubscription");
async function handleReactivateSubscription(env, userId, subId, corsHeaders) {
  await env.DB.prepare(
    `UPDATE subscriptions SET status = 'active', updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(subId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleReactivateSubscription, "handleReactivateSubscription");
async function handleSubscriptionsSummary(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM subscriptions WHERE user_id = ?"
  ).bind(userId).all();
  const subs = results || [];
  const active = subs.filter((s) => s.status === "active");
  let monthlyTotal = 0;
  for (const sub of active) {
    const amount = parseFloat(sub.amount) || 0;
    switch (sub.billing_cycle) {
      case "weekly":
        monthlyTotal += amount * 4.33;
        break;
      case "monthly":
        monthlyTotal += amount;
        break;
      case "quarterly":
        monthlyTotal += amount / 3;
        break;
      case "yearly":
        monthlyTotal += amount / 12;
        break;
      default:
        monthlyTotal += amount;
    }
  }
  const today = /* @__PURE__ */ new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  const upcoming = active.filter((s) => {
    const nextDate = new Date(s.next_billing_date);
    return nextDate >= today && nextDate <= nextWeek;
  });
  return jsonResponse({
    success: true,
    data: {
      total: subs.length,
      active: active.length,
      cancelled: subs.filter((s) => s.status === "cancelled").length,
      monthlyTotal: Math.round(monthlyTotal * 100) / 100,
      yearlyTotal: Math.round(monthlyTotal * 12 * 100) / 100,
      upcomingCount: upcoming.length,
      upcoming
    }
  }, 200, corsHeaders);
}
__name(handleSubscriptionsSummary, "handleSubscriptionsSummary");
async function handleTestNotification(env, userId, corsHeaders) {
  const user = await env.DB.prepare(
    "SELECT email, name FROM users WHERE id = ?"
  ).bind(userId).first();
  if (!user) {
    return jsonResponse({ success: false, error: "\u05DE\u05E9\u05EA\u05DE\u05E9 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, 404, corsHeaders);
  }
  const sent = await sendTestNotificationEmail(user.email, user.name, env.RESEND_API_KEY);
  if (!sent) {
    return jsonResponse({ success: false, error: "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E9\u05DC\u05D9\u05D7\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC" }, 500, corsHeaders);
  }
  return jsonResponse({ success: true, message: "\u05D4\u05D5\u05D3\u05E2\u05EA \u05D1\u05D3\u05D9\u05E7\u05D4 \u05E0\u05E9\u05DC\u05D7\u05D4!" }, 200, corsHeaders);
}
__name(handleTestNotification, "handleTestNotification");

// src/routes/goals.js
async function handleGetGoals(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM financial_goals WHERE user_id = ? ORDER BY priority ASC, created_at DESC"
  ).bind(userId).all();
  const goalsWithProgress = (results || []).map((goal) => ({
    ...goal,
    progress: goal.target_amount > 0 ? Math.min(100, Math.round(goal.current_amount / goal.target_amount * 100)) : 0,
    remaining: Math.max(0, goal.target_amount - goal.current_amount)
  }));
  return jsonResponse({ success: true, data: goalsWithProgress }, 200, corsHeaders);
}
__name(handleGetGoals, "handleGetGoals");
async function handleGetGoal(env, userId, goalId, corsHeaders) {
  const goal = await env.DB.prepare(
    "SELECT * FROM financial_goals WHERE id = ? AND user_id = ?"
  ).bind(goalId, userId).first();
  if (!goal) {
    return jsonResponse({ success: false, error: "\u05D9\u05E2\u05D3 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, 404, corsHeaders);
  }
  const { results: contributions } = await env.DB.prepare(
    "SELECT * FROM goal_contributions WHERE goal_id = ? AND user_id = ? ORDER BY date DESC"
  ).bind(goalId, userId).all();
  return jsonResponse({
    success: true,
    data: {
      ...goal,
      progress: goal.target_amount > 0 ? Math.min(100, Math.round(goal.current_amount / goal.target_amount * 100)) : 0,
      remaining: Math.max(0, goal.target_amount - goal.current_amount),
      contributions: contributions || []
    }
  }, 200, corsHeaders);
}
__name(handleGetGoal, "handleGetGoal");
async function handleCreateGoal(request, env, userId, corsHeaders) {
  const body = await request.json();
  if (!body.name || !body.target_amount) {
    return jsonResponse({ success: false, error: "\u05E9\u05DD \u05D5\u05D9\u05E2\u05D3 \u05D4\u05DD \u05E9\u05D3\u05D5\u05EA \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  const id = "goal-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  await env.DB.prepare(
    `INSERT INTO financial_goals (id, user_id, name, target_amount, current_amount, deadline, category, priority, icon, color, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    userId,
    body.name,
    body.target_amount,
    body.current_amount || 0,
    body.deadline || null,
    body.category || "general",
    body.priority || 2,
    body.icon || "\u{1F3AF}",
    body.color || "#667eea",
    body.notes || null
  ).run();
  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}
__name(handleCreateGoal, "handleCreateGoal");
async function handleUpdateGoal(request, env, userId, goalId, corsHeaders) {
  const body = await request.json();
  await env.DB.prepare(
    `UPDATE financial_goals SET 
     name = ?, target_amount = ?, current_amount = ?, deadline = ?, 
     category = ?, priority = ?, icon = ?, color = ?, notes = ?, 
     status = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(
    body.name,
    body.target_amount,
    body.current_amount || 0,
    body.deadline || null,
    body.category || "general",
    body.priority || 2,
    body.icon || "\u{1F3AF}",
    body.color || "#667eea",
    body.notes || null,
    body.status || "active",
    goalId,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateGoal, "handleUpdateGoal");
async function handleDeleteGoal(env, userId, goalId, corsHeaders) {
  await env.DB.prepare("DELETE FROM goal_contributions WHERE goal_id = ? AND user_id = ?").bind(goalId, userId).run();
  await env.DB.prepare("DELETE FROM financial_goals WHERE id = ? AND user_id = ?").bind(goalId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteGoal, "handleDeleteGoal");
async function handleAddContribution(request, env, userId, goalId, corsHeaders) {
  const body = await request.json();
  if (!body.amount) {
    return jsonResponse({ success: false, error: "\u05E1\u05DB\u05D5\u05DD \u05D4\u05D5\u05D0 \u05E9\u05D3\u05D4 \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  const contributionId = "contrib-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  const date = body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  await env.DB.prepare(
    "INSERT INTO goal_contributions (id, goal_id, user_id, amount, date, notes) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(contributionId, goalId, userId, body.amount, date, body.notes || null).run();
  await env.DB.prepare(
    "UPDATE financial_goals SET current_amount = current_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
  ).bind(body.amount, goalId, userId).run();
  const goal = await env.DB.prepare(
    "SELECT current_amount, target_amount FROM financial_goals WHERE id = ? AND user_id = ?"
  ).bind(goalId, userId).first();
  if (goal && goal.current_amount >= goal.target_amount) {
    await env.DB.prepare(
      "UPDATE financial_goals SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?"
    ).bind(goalId, userId).run();
  }
  return jsonResponse({
    success: true,
    data: {
      id: contributionId,
      newTotal: goal ? goal.current_amount : body.amount,
      isCompleted: goal ? goal.current_amount >= goal.target_amount : false
    }
  }, 200, corsHeaders);
}
__name(handleAddContribution, "handleAddContribution");
async function handleDeleteContribution(env, userId, contributionId, corsHeaders) {
  const contribution = await env.DB.prepare(
    "SELECT goal_id, amount FROM goal_contributions WHERE id = ? AND user_id = ?"
  ).bind(contributionId, userId).first();
  if (!contribution) {
    return jsonResponse({ success: false, error: "\u05D4\u05E4\u05E7\u05D3\u05D4 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D4" }, 404, corsHeaders);
  }
  await env.DB.prepare("DELETE FROM goal_contributions WHERE id = ? AND user_id = ?").bind(contributionId, userId).run();
  await env.DB.prepare(
    'UPDATE financial_goals SET current_amount = MAX(0, current_amount - ?), status = "active", updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
  ).bind(contribution.amount, contribution.goal_id, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteContribution, "handleDeleteContribution");
async function handleGoalsStats(env, userId, corsHeaders) {
  const { results: goals } = await env.DB.prepare(
    "SELECT * FROM financial_goals WHERE user_id = ?"
  ).bind(userId).all();
  const activeGoals = (goals || []).filter((g) => g.status === "active");
  const completedGoals = (goals || []).filter((g) => g.status === "completed");
  const totalTarget = activeGoals.reduce((sum, g) => sum + (g.target_amount || 0), 0);
  const totalSaved = activeGoals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
  return jsonResponse({
    success: true,
    data: {
      totalGoals: (goals || []).length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTarget,
      totalSaved,
      overallProgress: totalTarget > 0 ? Math.round(totalSaved / totalTarget * 100) : 0
    }
  }, 200, corsHeaders);
}
__name(handleGoalsStats, "handleGoalsStats");

// src/routes/business.js
async function handleGetBizExpenses(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month");
  let query = "SELECT * FROM business_expenses WHERE user_id = ?";
  let params = [userId];
  if (monthParam) {
    query += " AND date LIKE ?";
    params.push(monthParam + "%");
  }
  query += " ORDER BY date DESC";
  const { results } = await env.DB.prepare(query).bind(...params).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetBizExpenses, "handleGetBizExpenses");
async function handleGetBizExpense(env, userId, expId, corsHeaders) {
  const expense = await env.DB.prepare(
    "SELECT * FROM business_expenses WHERE id = ? AND user_id = ?"
  ).bind(expId, userId).first();
  if (!expense) {
    return jsonResponse({ success: false, error: "\u05D4\u05D5\u05E6\u05D0\u05D4 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D4" }, 404, corsHeaders);
  }
  return jsonResponse({ success: true, data: expense }, 200, corsHeaders);
}
__name(handleGetBizExpense, "handleGetBizExpense");
async function handleCreateBizExpense(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "biz-exp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  await env.DB.prepare(
    `INSERT INTO business_expenses (id, user_id, amount, category, description, date, includes_vat, supplier_id, invoice_number) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    userId,
    body.amount,
    body.category,
    body.description || "",
    body.date,
    body.includesVat ? 1 : 0,
    body.supplierId || null,
    body.invoiceNumber || null
  ).run();
  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}
__name(handleCreateBizExpense, "handleCreateBizExpense");
async function handleUpdateBizExpense(request, env, userId, expId, corsHeaders) {
  const body = await request.json();
  await env.DB.prepare(
    `UPDATE business_expenses SET amount = ?, category = ?, description = ?, date = ?, 
     includes_vat = ?, supplier_id = ?, invoice_number = ? WHERE id = ? AND user_id = ?`
  ).bind(
    body.amount,
    body.category,
    body.description || "",
    body.date,
    body.includesVat ? 1 : 0,
    body.supplierId || null,
    body.invoiceNumber || null,
    expId,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateBizExpense, "handleUpdateBizExpense");
async function handleDeleteBizExpense(env, userId, expId, corsHeaders) {
  await env.DB.prepare("DELETE FROM business_expenses WHERE id = ? AND user_id = ?").bind(expId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteBizExpense, "handleDeleteBizExpense");
async function handleGetBizIncomes(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month");
  let query = "SELECT * FROM business_incomes WHERE user_id = ?";
  let params = [userId];
  if (monthParam) {
    query += " AND date LIKE ?";
    params.push(monthParam + "%");
  }
  query += " ORDER BY date DESC";
  const { results } = await env.DB.prepare(query).bind(...params).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetBizIncomes, "handleGetBizIncomes");
async function handleGetBizIncome(env, userId, incId, corsHeaders) {
  const income = await env.DB.prepare(
    "SELECT * FROM business_incomes WHERE id = ? AND user_id = ?"
  ).bind(incId, userId).first();
  if (!income) {
    return jsonResponse({ success: false, error: "\u05D4\u05DB\u05E0\u05E1\u05D4 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D4" }, 404, corsHeaders);
  }
  return jsonResponse({ success: true, data: income }, 200, corsHeaders);
}
__name(handleGetBizIncome, "handleGetBizIncome");
async function handleCreateBizIncome(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "biz-inc-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  await env.DB.prepare(
    `INSERT INTO business_incomes (id, user_id, amount, source, description, date, includes_vat, client_id, invoice_number) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    userId,
    body.amount,
    body.source,
    body.description || "",
    body.date,
    body.includesVat ? 1 : 0,
    body.clientId || null,
    body.invoiceNumber || null
  ).run();
  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}
__name(handleCreateBizIncome, "handleCreateBizIncome");
async function handleUpdateBizIncome(request, env, userId, incId, corsHeaders) {
  const body = await request.json();
  await env.DB.prepare(
    `UPDATE business_incomes SET amount = ?, source = ?, description = ?, date = ?, 
     includes_vat = ?, client_id = ?, invoice_number = ? WHERE id = ? AND user_id = ?`
  ).bind(
    body.amount,
    body.source,
    body.description || "",
    body.date,
    body.includesVat ? 1 : 0,
    body.clientId || null,
    body.invoiceNumber || null,
    incId,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateBizIncome, "handleUpdateBizIncome");
async function handleDeleteBizIncome(env, userId, incId, corsHeaders) {
  await env.DB.prepare("DELETE FROM business_incomes WHERE id = ? AND user_id = ?").bind(incId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteBizIncome, "handleDeleteBizIncome");
async function handleBizDashboard(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const monthParam = url.searchParams.get("month");
  let expQuery = "SELECT * FROM business_expenses WHERE user_id = ?";
  let incQuery = "SELECT * FROM business_incomes WHERE user_id = ?";
  let params = [userId];
  if (monthParam) {
    expQuery += " AND date LIKE ?";
    incQuery += " AND date LIKE ?";
    params.push(monthParam + "%");
  }
  const { results: expenses } = await env.DB.prepare(expQuery).bind(...params).all();
  const { results: incomes } = await env.DB.prepare(incQuery).bind(...params).all();
  let totalExpenses = 0, totalExpensesNet = 0, totalExpensesVat = 0;
  let totalIncomes = 0, totalIncomesNet = 0, totalIncomesVat = 0;
  (expenses || []).forEach((exp) => {
    const amount = parseFloat(exp.amount) || 0;
    totalExpenses += amount;
    if (exp.includes_vat === 1) {
      totalExpensesNet += amount / (1 + VAT_RATE);
      totalExpensesVat += amount - amount / (1 + VAT_RATE);
    } else {
      totalExpensesNet += amount;
    }
  });
  (incomes || []).forEach((inc) => {
    const amount = parseFloat(inc.amount) || 0;
    totalIncomes += amount;
    if (inc.includes_vat === 1) {
      totalIncomesNet += amount / (1 + VAT_RATE);
      totalIncomesVat += amount - amount / (1 + VAT_RATE);
    } else {
      totalIncomesNet += amount;
    }
  });
  return jsonResponse({
    success: true,
    data: {
      expenses: {
        total: totalExpenses,
        net: totalExpensesNet,
        vat: totalExpensesVat,
        count: (expenses || []).length
      },
      incomes: {
        total: totalIncomes,
        net: totalIncomesNet,
        vat: totalIncomesVat,
        count: (incomes || []).length
      },
      profit: totalIncomesNet - totalExpensesNet,
      vatBalance: totalIncomesVat - totalExpensesVat
    }
  }, 200, corsHeaders);
}
__name(handleBizDashboard, "handleBizDashboard");
async function handleVatReport(request, env, userId, corsHeaders) {
  const url = new URL(request.url);
  const startMonth = url.searchParams.get("startMonth");
  const endMonth = url.searchParams.get("endMonth");
  if (!startMonth || !endMonth) {
    return jsonResponse({ success: false, error: "\u05D7\u05D5\u05D1\u05D4 \u05DC\u05E6\u05D9\u05D9\u05DF \u05EA\u05E7\u05D5\u05E4\u05D4" }, 400, corsHeaders);
  }
  const { results: expenses } = await env.DB.prepare(
    `SELECT * FROM business_expenses WHERE user_id = ? AND date >= ? AND date <= ?`
  ).bind(userId, startMonth + "-01", endMonth + "-31").all();
  const { results: incomes } = await env.DB.prepare(
    `SELECT * FROM business_incomes WHERE user_id = ? AND date >= ? AND date <= ?`
  ).bind(userId, startMonth + "-01", endMonth + "-31").all();
  let vatCollected = 0, vatPaid = 0;
  let totalIncomesGross = 0, totalIncomesNet = 0;
  let totalExpensesGross = 0, totalExpensesNet = 0;
  (incomes || []).forEach((inc) => {
    const amount = parseFloat(inc.amount) || 0;
    totalIncomesGross += amount;
    if (inc.includes_vat === 1) {
      totalIncomesNet += amount / (1 + VAT_RATE);
      vatCollected += amount - amount / (1 + VAT_RATE);
    } else {
      totalIncomesNet += amount;
    }
  });
  (expenses || []).forEach((exp) => {
    const amount = parseFloat(exp.amount) || 0;
    totalExpensesGross += amount;
    if (exp.includes_vat === 1) {
      totalExpensesNet += amount / (1 + VAT_RATE);
      vatPaid += amount - amount / (1 + VAT_RATE);
    } else {
      totalExpensesNet += amount;
    }
  });
  return jsonResponse({
    success: true,
    data: {
      period: { start: startMonth, end: endMonth },
      incomes: {
        gross: totalIncomesGross,
        net: totalIncomesNet,
        vatCollected,
        count: (incomes || []).length,
        items: incomes || []
      },
      expenses: {
        gross: totalExpensesGross,
        net: totalExpensesNet,
        vatPaid,
        count: (expenses || []).length,
        items: expenses || []
      },
      vatBalance: vatCollected - vatPaid,
      vatStatus: vatCollected - vatPaid >= 0 ? "payment" : "refund"
    }
  }, 200, corsHeaders);
}
__name(handleVatReport, "handleVatReport");
async function handleGetClients(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM business_clients WHERE user_id = ? ORDER BY name ASC"
  ).bind(userId).all();
  const clientsWithStats = await Promise.all((results || []).map(async (client) => {
    const incomeStats = await env.DB.prepare(
      "SELECT SUM(amount) as total, COUNT(*) as count FROM business_incomes WHERE user_id = ? AND client_id = ?"
    ).bind(userId, client.id).first();
    return {
      ...client,
      total_income: incomeStats?.total || 0,
      transaction_count: incomeStats?.count || 0
    };
  }));
  return jsonResponse({ success: true, data: clientsWithStats }, 200, corsHeaders);
}
__name(handleGetClients, "handleGetClients");
async function handleGetClient(env, userId, clientId, corsHeaders) {
  const client = await env.DB.prepare(
    "SELECT * FROM business_clients WHERE id = ? AND user_id = ?"
  ).bind(clientId, userId).first();
  if (!client) {
    return jsonResponse({ success: false, error: "\u05DC\u05E7\u05D5\u05D7 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, 404, corsHeaders);
  }
  const { results: incomes } = await env.DB.prepare(
    "SELECT * FROM business_incomes WHERE user_id = ? AND client_id = ? ORDER BY date DESC"
  ).bind(userId, clientId).all();
  const totalIncome = (incomes || []).reduce((sum, inc) => sum + (parseFloat(inc.amount) || 0), 0);
  return jsonResponse({
    success: true,
    data: {
      ...client,
      incomes: incomes || [],
      total_income: totalIncome,
      transaction_count: (incomes || []).length
    }
  }, 200, corsHeaders);
}
__name(handleGetClient, "handleGetClient");
async function handleCreateClient(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "client-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  if (!body.name) {
    return jsonResponse({ success: false, error: "\u05E9\u05DD \u05DC\u05E7\u05D5\u05D7 \u05D4\u05D5\u05D0 \u05E9\u05D3\u05D4 \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  await env.DB.prepare(
    `INSERT INTO business_clients (id, user_id, name, contact_name, phone, email, address, tax_id, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    userId,
    body.name,
    body.contactName || null,
    body.phone || null,
    body.email || null,
    body.address || null,
    body.taxId || null,
    body.notes || null
  ).run();
  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}
__name(handleCreateClient, "handleCreateClient");
async function handleUpdateClient(request, env, userId, clientId, corsHeaders) {
  const body = await request.json();
  await env.DB.prepare(
    `UPDATE business_clients SET name = ?, contact_name = ?, phone = ?, email = ?, 
     address = ?, tax_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(
    body.name,
    body.contactName || null,
    body.phone || null,
    body.email || null,
    body.address || null,
    body.taxId || null,
    body.notes || null,
    clientId,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateClient, "handleUpdateClient");
async function handleDeleteClient(env, userId, clientId, corsHeaders) {
  await env.DB.prepare(
    "UPDATE business_incomes SET client_id = NULL WHERE client_id = ? AND user_id = ?"
  ).bind(clientId, userId).run();
  await env.DB.prepare(
    "DELETE FROM business_clients WHERE id = ? AND user_id = ?"
  ).bind(clientId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteClient, "handleDeleteClient");
async function handleGetSuppliers(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM business_suppliers WHERE user_id = ? ORDER BY name ASC"
  ).bind(userId).all();
  const suppliersWithStats = await Promise.all((results || []).map(async (supplier) => {
    const expenseStats = await env.DB.prepare(
      "SELECT SUM(amount) as total, COUNT(*) as count FROM business_expenses WHERE user_id = ? AND supplier_id = ?"
    ).bind(userId, supplier.id).first();
    return {
      ...supplier,
      total_expense: expenseStats?.total || 0,
      transaction_count: expenseStats?.count || 0
    };
  }));
  return jsonResponse({ success: true, data: suppliersWithStats }, 200, corsHeaders);
}
__name(handleGetSuppliers, "handleGetSuppliers");
async function handleGetSupplier(env, userId, supplierId, corsHeaders) {
  const supplier = await env.DB.prepare(
    "SELECT * FROM business_suppliers WHERE id = ? AND user_id = ?"
  ).bind(supplierId, userId).first();
  if (!supplier) {
    return jsonResponse({ success: false, error: "\u05E1\u05E4\u05E7 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, 404, corsHeaders);
  }
  const { results: expenses } = await env.DB.prepare(
    "SELECT * FROM business_expenses WHERE user_id = ? AND supplier_id = ? ORDER BY date DESC"
  ).bind(userId, supplierId).all();
  const totalExpense = (expenses || []).reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
  return jsonResponse({
    success: true,
    data: {
      ...supplier,
      expenses: expenses || [],
      total_expense: totalExpense,
      transaction_count: (expenses || []).length
    }
  }, 200, corsHeaders);
}
__name(handleGetSupplier, "handleGetSupplier");
async function handleCreateSupplier(request, env, userId, corsHeaders) {
  const body = await request.json();
  const id = "supplier-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  if (!body.name) {
    return jsonResponse({ success: false, error: "\u05E9\u05DD \u05E1\u05E4\u05E7 \u05D4\u05D5\u05D0 \u05E9\u05D3\u05D4 \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  await env.DB.prepare(
    `INSERT INTO business_suppliers (id, user_id, name, contact_name, phone, email, address, tax_id, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    userId,
    body.name,
    body.contactName || null,
    body.phone || null,
    body.email || null,
    body.address || null,
    body.taxId || null,
    body.notes || null
  ).run();
  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}
__name(handleCreateSupplier, "handleCreateSupplier");
async function handleUpdateSupplier(request, env, userId, supplierId, corsHeaders) {
  const body = await request.json();
  await env.DB.prepare(
    `UPDATE business_suppliers SET name = ?, contact_name = ?, phone = ?, email = ?, 
     address = ?, tax_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ?`
  ).bind(
    body.name,
    body.contactName || null,
    body.phone || null,
    body.email || null,
    body.address || null,
    body.taxId || null,
    body.notes || null,
    supplierId,
    userId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleUpdateSupplier, "handleUpdateSupplier");
async function handleDeleteSupplier(env, userId, supplierId, corsHeaders) {
  await env.DB.prepare(
    "UPDATE business_expenses SET supplier_id = NULL WHERE supplier_id = ? AND user_id = ?"
  ).bind(supplierId, userId).run();
  await env.DB.prepare(
    "DELETE FROM business_suppliers WHERE id = ? AND user_id = ?"
  ).bind(supplierId, userId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleDeleteSupplier, "handleDeleteSupplier");

// src/routes/ai.js
async function handleAiChat(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { message, context, mode, history } = body;
  const isBusinessMode = mode === "business" || context && context.mode === "business";
  let systemPrompt;
  if (isBusinessMode) {
    systemPrompt = `\u05D0\u05EA\u05D4 \u05D9\u05D5\u05E2\u05E5 \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9 \u05DC\u05E2\u05E1\u05E7\u05D9\u05DD \u05E7\u05D8\u05E0\u05D9\u05DD \u05D1\u05D9\u05E9\u05E8\u05D0\u05DC \u05DE\u05D8\u05E2\u05DD FlowEco.
\u05EA\u05DF \u05EA\u05E9\u05D5\u05D1\u05D5\u05EA \u05E7\u05E6\u05E8\u05D5\u05EA \u05D5\u05DE\u05E7\u05E6\u05D5\u05E2\u05D9\u05D5\u05EA (2-4 \u05DE\u05E9\u05E4\u05D8\u05D9\u05DD).
\u05D3\u05D1\u05E8 \u05D1\u05E2\u05D1\u05E8\u05D9\u05EA \u05E4\u05E9\u05D5\u05D8\u05D4 \u05D5\u05DE\u05D5\u05D1\u05E0\u05EA.

\u05D4\u05E0\u05D7\u05D9\u05D5\u05EA \u05D7\u05E9\u05D5\u05D1\u05D5\u05EA:
- \u05DE\u05E2"\u05DE \u05D1\u05D9\u05E9\u05E8\u05D0\u05DC \u05D4\u05D5\u05D0 18%
- \u05D4\u05EA\u05D9\u05D9\u05D7\u05E1 \u05DC\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05DE\u05D5\u05DB\u05E8\u05D5\u05EA \u05DC\u05DE\u05E1
- \u05D4\u05D6\u05DB\u05E8 \u05EA\u05D6\u05E8\u05D9\u05DD \u05DE\u05D6\u05D5\u05DE\u05E0\u05D9\u05DD \u05D5\u05E8\u05D5\u05D5\u05D7\u05D9\u05D5\u05EA
- \u05D4\u05D9\u05D4 \u05DE\u05D5\u05D3\u05E2 \u05DC\u05D3\u05D9\u05D5\u05D5\u05D7\u05D9\u05DD \u05D3\u05D5-\u05D7\u05D5\u05D3\u05E9\u05D9\u05D9\u05DD \u05DC\u05DE\u05E2"\u05DE
- \u05D0\u05DC \u05EA\u05EA\u05DF \u05D9\u05D9\u05E2\u05D5\u05E5 \u05DE\u05E1 \u05E1\u05E4\u05E6\u05D9\u05E4\u05D9 - \u05D4\u05E4\u05E0\u05D4 \u05DC\u05E8\u05D5\u05D0\u05D4 \u05D7\u05E9\u05D1\u05D5\u05DF`;
    if (context) {
      systemPrompt += "\n\n\u05E0\u05EA\u05D5\u05E0\u05D9 \u05D4\u05E2\u05E1\u05E7 \u05D4\u05D7\u05D5\u05D3\u05E9\u05D9\u05D9\u05DD:";
      if (context.totalIncomes !== void 0)
        systemPrompt += `
\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA \u05D1\u05E8\u05D5\u05D8\u05D5: \u20AA${Math.round(context.totalIncomes).toLocaleString()}`;
      if (context.totalIncomesNet !== void 0)
        systemPrompt += `
\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA \u05E0\u05D8\u05D5: \u20AA${Math.round(context.totalIncomesNet).toLocaleString()}`;
      if (context.totalExpenses !== void 0)
        systemPrompt += `
\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05D1\u05E8\u05D5\u05D8\u05D5: \u20AA${Math.round(context.totalExpenses).toLocaleString()}`;
      if (context.totalExpensesNet !== void 0)
        systemPrompt += `
\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05E0\u05D8\u05D5: \u20AA${Math.round(context.totalExpensesNet).toLocaleString()}`;
      if (context.profit !== void 0)
        systemPrompt += `
\u05E8\u05D5\u05D5\u05D7 \u05E0\u05D8\u05D5: \u20AA${Math.round(context.profit).toLocaleString()}`;
      if (context.vatCollected !== void 0)
        systemPrompt += `
\u05DE\u05E2"\u05DE \u05E2\u05E1\u05E7\u05D0\u05D5\u05EA (\u05E9\u05D2\u05D1\u05D4): \u20AA${Math.round(context.vatCollected).toLocaleString()}`;
      if (context.vatPaid !== void 0)
        systemPrompt += `
\u05DE\u05E2"\u05DE \u05EA\u05E9\u05D5\u05DE\u05D5\u05EA (\u05E9\u05E9\u05D9\u05DC\u05DD): \u20AA${Math.round(context.vatPaid).toLocaleString()}`;
      if (context.vatBalance !== void 0) {
        const vatStatus = context.vatBalance >= 0 ? "\u05DC\u05EA\u05E9\u05DC\u05D5\u05DD" : "\u05DC\u05D4\u05D7\u05D6\u05E8";
        systemPrompt += `
\u05D9\u05EA\u05E8\u05EA \u05DE\u05E2"\u05DE ${vatStatus}: \u20AA${Math.abs(Math.round(context.vatBalance)).toLocaleString()}`;
      }
      if (context.expenseCategories && context.expenseCategories.length > 0) {
        systemPrompt += "\n\n\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4:";
        context.expenseCategories.forEach((cat) => {
          systemPrompt += `
- ${cat.category}: \u20AA${Math.round(cat.amount).toLocaleString()}`;
        });
      }
    }
  } else {
    systemPrompt = `\u05D0\u05EA\u05D4 \u05D9\u05D5\u05E2\u05E5 \u05DB\u05DC\u05DB\u05DC\u05D9 \u05D0\u05D9\u05E9\u05D9 \u05E9\u05DC FlowEco.
\u05EA\u05DF \u05EA\u05E9\u05D5\u05D1\u05D5\u05EA \u05E7\u05E6\u05E8\u05D5\u05EA \u05D5\u05DE\u05E2\u05E9\u05D9\u05D5\u05EA (2-3 \u05DE\u05E9\u05E4\u05D8\u05D9\u05DD).
\u05D3\u05D1\u05E8 \u05D1\u05E2\u05D1\u05E8\u05D9\u05EA \u05E4\u05E9\u05D5\u05D8\u05D4 \u05D5\u05E0\u05E2\u05D9\u05DE\u05D4.
\u05E2\u05D6\u05D5\u05E8 \u05DC\u05DE\u05E9\u05EA\u05DE\u05E9 \u05DC\u05E0\u05D4\u05DC \u05D0\u05EA \u05D4\u05EA\u05E7\u05E6\u05D9\u05D1 \u05D4\u05D0\u05D9\u05E9\u05D9, \u05DC\u05D7\u05E1\u05D5\u05DA \u05DB\u05E1\u05E3 \u05D5\u05DC\u05E7\u05D1\u05DC \u05D4\u05D7\u05DC\u05D8\u05D5\u05EA \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9\u05D5\u05EA \u05D8\u05D5\u05D1\u05D5\u05EA.`;
    if (context) {
      systemPrompt += "\n\n\u05E0\u05EA\u05D5\u05E0\u05D9\u05DD \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9\u05D9\u05DD:";
      if (context.totalIncomes !== void 0)
        systemPrompt += `
\u05D4\u05DB\u05E0\u05E1\u05D5\u05EA \u05D4\u05D7\u05D5\u05D3\u05E9: \u20AA${context.totalIncomes}`;
      if (context.totalExpenses !== void 0)
        systemPrompt += `
\u05D4\u05D5\u05E6\u05D0\u05D5\u05EA \u05D4\u05D7\u05D5\u05D3\u05E9: \u20AA${context.totalExpenses}`;
      if (context.balance !== void 0)
        systemPrompt += `
\u05D9\u05EA\u05E8\u05D4: \u20AA${context.balance}`;
    }
  }
  const messages = [
    { role: "system", content: systemPrompt }
  ];
  if (history && Array.isArray(history)) {
    history.slice(-6).forEach((h) => {
      if (h.role && h.content) {
        messages.push({ role: h.role, content: h.content });
      }
    });
  }
  messages.push({ role: "user", content: message });
  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      messages: messages,
      max_completion_tokens: 600,
      reasoning_effort: "low"
    })
  });
  if (!openaiResponse.ok) {
    console.error("OpenAI Error:", await openaiResponse.text());
    return jsonResponse({ success: false, error: "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1-AI" }, 500, corsHeaders);
  }
  const aiData = await openaiResponse.json();
  return jsonResponse({
    success: true,
    data: {
      message: aiData.choices[0].message.content,
      mode: isBusinessMode ? "business" : "personal"
    }
  }, 200, corsHeaders);
}
__name(handleAiChat, "handleAiChat");
async function handleAiInsight(request, env, corsHeaders) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return jsonResponse({ success: false, error: "Missing prompt" }, 400, corsHeaders);
    }
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          {
            role: "system",
            content: "\u05D0\u05EA\u05D4 \u05D9\u05D5\u05E2\u05E5 \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9 \u05D7\u05DB\u05DD \u05E9\u05E0\u05D5\u05EA\u05DF \u05EA\u05D5\u05D1\u05E0\u05D5\u05EA \u05E7\u05E6\u05E8\u05D5\u05EA \u05D5\u05DE\u05DE\u05D5\u05E7\u05D3\u05D5\u05EA \u05D1\u05E2\u05D1\u05E8\u05D9\u05EA. \u05D4\u05EA\u05D5\u05D1\u05E0\u05D5\u05EA \u05E9\u05DC\u05DA \u05E4\u05E8\u05E7\u05D8\u05D9\u05D5\u05EA, \u05DE\u05E2\u05D5\u05D3\u05D3\u05D5\u05EA \u05D5\u05DE\u05D1\u05D5\u05E1\u05E1\u05D5\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD. \u05EA\u05DE\u05D9\u05D3 \u05EA\u05E2\u05E0\u05D4 \u05D1\u05E2\u05D1\u05E8\u05D9\u05EA \u05D1\u05DC\u05D1\u05D3, \u05D1\u05E1\u05D2\u05E0\u05D5\u05DF \u05D9\u05D3\u05D9\u05D3\u05D5\u05EA\u05D9 \u05D5\u05DE\u05E7\u05E6\u05D5\u05E2\u05D9. \u05EA\u05DF \u05EA\u05D5\u05D1\u05E0\u05D4 \u05D0\u05D7\u05EA \u05D1\u05DC\u05D1\u05D3, \u05E2\u05D3 2 \u05DE\u05E9\u05E4\u05D8\u05D9\u05DD."
          },
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 600,
        reasoning_effort: "low"
      })
    });
    const openaiResult = await openaiResponse.json();
    if (openaiResult.error) {
      console.error("OpenAI error:", openaiResult.error);
      return jsonResponse({
        success: false,
        error: "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E7\u05D1\u05DC\u05EA \u05EA\u05D5\u05D1\u05E0\u05D4 \u05DE\u05D4\u05D1\u05D9\u05E0\u05D4 \u05D4\u05DE\u05DC\u05D0\u05DB\u05D5\u05EA\u05D9\u05EA"
      }, 500, corsHeaders);
    }
    const insight = openaiResult.choices?.[0]?.message?.content?.trim();
    if (!insight) {
      return jsonResponse({
        success: false,
        error: "\u05DC\u05D0 \u05D4\u05EA\u05E7\u05D1\u05DC\u05D4 \u05EA\u05D5\u05D1\u05E0\u05D4"
      }, 500, corsHeaders);
    }
    return jsonResponse({
      success: true,
      insight
    }, 200, corsHeaders);
  } catch (error) {
    console.error("AI insight error:", error);
    return jsonResponse({
      success: false,
      error: "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E2\u05D9\u05D1\u05D5\u05D3 \u05D4\u05D1\u05E7\u05E9\u05D4"
    }, 500, corsHeaders);
  }
}
__name(handleAiInsight, "handleAiInsight");

// src/routes/feedback.js
async function handleCreateFeedback(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { type, message, rating } = body;
  if (!message) {
    return jsonResponse({ success: false, error: "\u05D4\u05D5\u05D3\u05E2\u05D4 \u05D4\u05D9\u05D0 \u05E9\u05D3\u05D4 \u05D7\u05D5\u05D1\u05D4" }, 400, corsHeaders);
  }
  const id = "fb-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
  await env.DB.prepare(
    `INSERT INTO feedback (id, user_id, type, message, rating, status) 
     VALUES (?, ?, ?, ?, ?, 'new')`
  ).bind(id, userId, type || "general", message, rating || null).run();
  return jsonResponse({ success: true, data: { id } }, 200, corsHeaders);
}
__name(handleCreateFeedback, "handleCreateFeedback");
async function handleGetFeedback(env, userId, corsHeaders) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(userId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleGetFeedback, "handleGetFeedback");

// src/routes/admin.js
async function handleAdminStats(env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const userCount = await env.DB.prepare("SELECT COUNT(*) as count FROM users").first();
  const freeUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_plan = 'free'").first();
  const trialUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_plan = 'trial'").first();
  const proUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_plan = 'pro'").first();
  const weekAgo = /* @__PURE__ */ new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];
  const newUsersThisWeek = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM users WHERE created_at >= ?"
  ).bind(weekAgoStr).first();
  const activeUsers = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM users WHERE last_login >= ?"
  ).bind(weekAgoStr).first();
  const pwaUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE pwa_installed = 1").first();
  const mobileUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE device_type = 'Mobile'").first();
  const desktopUsers = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE device_type = 'Desktop'").first();
  const usersWithErrors = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE error_count > 0").first();
  return jsonResponse({
    success: true,
    data: {
      totalUsers: userCount?.count || 0,
      freeUsers: freeUsers?.count || 0,
      trialUsers: trialUsers?.count || 0,
      proUsers: proUsers?.count || 0,
      newUsersThisWeek: newUsersThisWeek?.count || 0,
      activeUsers: activeUsers?.count || 0,
      pwaUsers: pwaUsers?.count || 0,
      mobileUsers: mobileUsers?.count || 0,
      desktopUsers: desktopUsers?.count || 0,
      usersWithErrors: usersWithErrors?.count || 0
    }
  }, 200, corsHeaders);
}
__name(handleAdminStats, "handleAdminStats");
async function handleAdminUsers(env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const { results } = await env.DB.prepare(
    `SELECT id, name, email, is_admin, subscription_plan, subscription_status, account_status, created_at, 
     last_login, login_count, device_type, browser, app_version, pwa_installed, error_count, email_verified 
     FROM users ORDER BY created_at DESC`
  ).all();
  const expenseCounts = await env.DB.prepare(
    `SELECT user_id, COUNT(*) as count FROM expenses GROUP BY user_id`
  ).all();
  const expenseMap = Object.fromEntries(expenseCounts.results.map((r) => [r.user_id, r.count]));
  const incomeCounts = await env.DB.prepare(
    `SELECT user_id, COUNT(*) as count FROM incomes GROUP BY user_id`
  ).all();
  const incomeMap = Object.fromEntries(incomeCounts.results.map((r) => [r.user_id, r.count]));
  const lastExpenses = await env.DB.prepare(
    `SELECT user_id, MAX(created_at) as last_date FROM expenses GROUP BY user_id`
  ).all();
  const lastExpenseMap = Object.fromEntries(lastExpenses.results.map((r) => [r.user_id, r.last_date]));
  const lastIncomes = await env.DB.prepare(
    `SELECT user_id, MAX(created_at) as last_date FROM incomes GROUP BY user_id`
  ).all();
  const lastIncomeMap = Object.fromEntries(lastIncomes.results.map((r) => [r.user_id, r.last_date]));
  const enrichedUsers = (results || []).map((user) => {
    const lastExp = lastExpenseMap[user.id];
    const lastInc = lastIncomeMap[user.id];
    const lastActivity = [lastExp, lastInc, user.last_login].filter(Boolean).sort().reverse()[0] || user.created_at;
    const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1e3 * 60 * 60 * 24));
    let activity_status = "inactive";
    if (daysSinceActivity <= 7)
      activity_status = "active";
    else if (daysSinceActivity <= 30)
      activity_status = "weak";
    return {
      ...user,
      expenses_count: expenseMap[user.id] || 0,
      incomes_count: incomeMap[user.id] || 0,
      last_activity: lastActivity,
      activity_status
    };
  });
  return jsonResponse({ success: true, data: enrichedUsers }, 200, corsHeaders);
}
__name(handleAdminUsers, "handleAdminUsers");
async function handleAdminUserStats(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const user = await env.DB.prepare(
    `SELECT id, name, email, is_admin, subscription_plan, subscription_status, account_status, created_at, 
     last_login, login_count, user_agent, device_type, browser, app_version, pwa_installed, 
     error_count, last_error, last_error_at, email_verified 
     FROM users WHERE id = ?`
  ).bind(targetUserId).first();
  if (!user) {
    return jsonResponse({ success: false, error: "\u05DE\u05E9\u05EA\u05DE\u05E9 \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0" }, 404, corsHeaders);
  }
  const expenseCount = await env.DB.prepare("SELECT COUNT(*) as count FROM expenses WHERE user_id = ?").bind(targetUserId).first();
  const incomeCount = await env.DB.prepare("SELECT COUNT(*) as count FROM incomes WHERE user_id = ?").bind(targetUserId).first();
  const budgetCount = await env.DB.prepare("SELECT COUNT(*) as count FROM budgets WHERE user_id = ?").bind(targetUserId).first();
  const cardCount = await env.DB.prepare("SELECT COUNT(*) as count FROM cards WHERE user_id = ?").bind(targetUserId).first();
  const loanCount = await env.DB.prepare("SELECT COUNT(*) as count FROM loans WHERE user_id = ?").bind(targetUserId).first();
  const installmentCount = await env.DB.prepare("SELECT COUNT(*) as count FROM installment_plans WHERE user_id = ?").bind(targetUserId).first();
  const lastExpense = await env.DB.prepare("SELECT created_at FROM expenses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").bind(targetUserId).first();
  const lastIncome = await env.DB.prepare("SELECT created_at FROM incomes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").bind(targetUserId).first();
  const { results: recentActivity } = await env.DB.prepare(
    "SELECT action_type, details, created_at FROM user_activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 10"
  ).bind(targetUserId).all();
  const { results: recentErrors } = await env.DB.prepare(
    "SELECT error_message, page, created_at FROM user_errors WHERE user_id = ? ORDER BY created_at DESC LIMIT 5"
  ).bind(targetUserId).all();
  const totalActions = (expenseCount?.count || 0) + (incomeCount?.count || 0) + (budgetCount?.count || 0);
  let activityLevel = "\u05DC\u05D0 \u05E4\u05E2\u05D9\u05DC";
  if (totalActions > 50)
    activityLevel = "\u05E4\u05E2\u05D9\u05DC \u05DE\u05D0\u05D5\u05D3";
  else if (totalActions > 20)
    activityLevel = "\u05E4\u05E2\u05D9\u05DC";
  else if (totalActions > 5)
    activityLevel = "\u05E4\u05E2\u05D9\u05DC \u05D7\u05DC\u05E7\u05D9\u05EA";
  else if (totalActions > 0)
    activityLevel = "\u05D4\u05EA\u05D7\u05D9\u05DC \u05DC\u05D4\u05E9\u05EA\u05DE\u05E9";
  const daysSinceRegistration = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1e3 * 60 * 60 * 24));
  const lastActivityDate = [lastExpense?.created_at, lastIncome?.created_at, user.last_login].filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || user.created_at;
  return jsonResponse({
    success: true,
    data: {
      user,
      activity: {
        totalActions,
        expensesCount: expenseCount?.count || 0,
        incomesCount: incomeCount?.count || 0,
        budgetsCount: budgetCount?.count || 0,
        cardsCount: cardCount?.count || 0,
        loansCount: loanCount?.count || 0,
        installmentsCount: installmentCount?.count || 0,
        activityLevel,
        registeredAt: user.created_at,
        lastLogin: user.last_login,
        loginCount: user.login_count || 0,
        lastActivity: lastActivityDate,
        daysSinceRegistration
      },
      technical: {
        deviceType: user.device_type || "\u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2",
        browser: user.browser || "\u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2",
        appVersion: user.app_version || "\u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2",
        pwaInstalled: user.pwa_installed === 1,
        errorCount: user.error_count || 0,
        lastError: user.last_error || null,
        lastErrorAt: user.last_error_at || null,
        emailVerified: user.email_verified === 1
      },
      recentActivity: recentActivity || [],
      recentErrors: recentErrors || []
    }
  }, 200, corsHeaders);
}
__name(handleAdminUserStats, "handleAdminUserStats");
async function handleAdminUserErrors(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const { results } = await env.DB.prepare(
    "SELECT * FROM user_errors WHERE user_id = ? ORDER BY created_at DESC LIMIT 50"
  ).bind(targetUserId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleAdminUserErrors, "handleAdminUserErrors");
async function handleAdminUserActivity(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const { results } = await env.DB.prepare(
    "SELECT * FROM user_activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 100"
  ).bind(targetUserId).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleAdminUserActivity, "handleAdminUserActivity");
async function handleAdminClearErrors(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  await env.DB.prepare("DELETE FROM user_errors WHERE user_id = ?").bind(targetUserId).run();
  await env.DB.prepare("UPDATE users SET error_count = 0, last_error = NULL, last_error_at = NULL WHERE id = ?").bind(targetUserId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleAdminClearErrors, "handleAdminClearErrors");
async function handleAdminUpdateUser(request, env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const body = await request.json();
  await env.DB.prepare(
    `UPDATE users SET name = ?, email = ?, subscription_plan = ?, is_admin = ?, subscription_status = ?, account_status = ? WHERE id = ?`
  ).bind(
    body.name,
    body.email.toLowerCase(),
    body.subscription_plan || "free",
    body.role === "admin" || body.is_admin ? 1 : 0,
    body.subscription_status || "active",
    body.account_status || "active",
    targetUserId
  ).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleAdminUpdateUser, "handleAdminUpdateUser");
async function handleAdminDeleteUser(env, userId, targetUserId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  if (targetUserId === userId) {
    return jsonResponse({ success: false, error: "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05DE\u05D7\u05D5\u05E7 \u05D0\u05EA \u05E2\u05E6\u05DE\u05DA" }, 400, corsHeaders);
  }
  const tables = [
    "expenses",
    "incomes",
    "budgets",
    "cards",
    "loans",
    "installment_plans",
    "categories",
    "feedback",
    "user_errors",
    "user_activity_log",
    "verification_codes",
    "subscriptions",
    "financial_goals",
    "goal_contributions",
    "excluded_recurring",
    "business_expenses",
    "business_incomes",
    "business_clients",
    "business_suppliers"
  ];
  for (const table of tables) {
    try {
      await env.DB.prepare(`DELETE FROM ${table} WHERE user_id = ?`).bind(targetUserId).run();
    } catch (e) {
    }
  }
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(targetUserId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleAdminDeleteUser, "handleAdminDeleteUser");
async function handleAdminCreateUser(request, env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const body = await request.json();
  const { email, password, name, is_admin, subscription_plan } = body;
  if (!email || !password || !name) {
    return jsonResponse({ success: false, error: "\u05E0\u05D0 \u05DC\u05DE\u05DC\u05D0 \u05D0\u05EA \u05DB\u05DC \u05D4\u05E9\u05D3\u05D5\u05EA" }, 400, corsHeaders);
  }
  const existingUser = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase()).first();
  if (existingUser) {
    return jsonResponse({ success: false, error: "\u05D4\u05DE\u05E9\u05EA\u05DE\u05E9 \u05DB\u05D1\u05E8 \u05E7\u05D9\u05D9\u05DD \u05D1\u05DE\u05E2\u05E8\u05DB\u05EA" }, 400, corsHeaders);
  }
  const passwordHash = await hashPassword(password, env.PASSWORD_SALT);
  const newUserId = "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, name, is_admin, subscription_plan, subscription_status, account_status, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(newUserId, email.toLowerCase(), passwordHash, name, is_admin ? 1 : 0, subscription_plan || "free", "active", "active", 1).run();
  return jsonResponse({ success: true, data: { id: newUserId } }, 200, corsHeaders);
}
__name(handleAdminCreateUser, "handleAdminCreateUser");
async function handleAdminResetPassword(request, env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const body = await request.json();
  const { user_id, new_password } = body;
  if (!user_id || !new_password || new_password.length < 6) {
    return jsonResponse({ success: false, error: "\u05E1\u05D9\u05E1\u05DE\u05D4 \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05D9\u05D5\u05EA \u05DC\u05E4\u05D7\u05D5\u05EA 6 \u05EA\u05D5\u05D5\u05D9\u05DD" }, 400, corsHeaders);
  }
  const passwordHash = await hashPassword(new_password, env.PASSWORD_SALT);
  await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(passwordHash, user_id).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleAdminResetPassword, "handleAdminResetPassword");
async function handleAdminFeedback(env, userId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const { results } = await env.DB.prepare(`
    SELECT 
      f.id,
      f.user_id,
      f.type as category,
      f.message,
      f.rating,
      f.status,
      f.admin_notes,
      f.created_at,
      f.updated_at,
      u.name as user_name,
      u.email as user_email
    FROM feedback f
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `).all();
  return jsonResponse({ success: true, data: results || [] }, 200, corsHeaders);
}
__name(handleAdminFeedback, "handleAdminFeedback");
async function handleAdminUpdateFeedback(request, env, userId, feedbackId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  const body = await request.json();
  await env.DB.prepare("UPDATE feedback SET status = ?, admin_notes = ? WHERE id = ?").bind(body.status || "new", body.admin_notes || "", feedbackId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleAdminUpdateFeedback, "handleAdminUpdateFeedback");
async function handleAdminDeleteFeedback(env, userId, feedbackId, corsHeaders) {
  if (!await isUserAdmin(env.DB, userId)) {
    return jsonResponse({ success: false, error: "\u05D2\u05D9\u05E9\u05D4 \u05E0\u05D3\u05D7\u05EA\u05D4" }, 403, corsHeaders);
  }
  await env.DB.prepare("DELETE FROM feedback WHERE id = ?").bind(feedbackId).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}
__name(handleAdminDeleteFeedback, "handleAdminDeleteFeedback");

// src/index.js
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = getCorsHeaders(request);
    if (method === "OPTIONS") {
      return handleOptions(corsHeaders);
    }
    if (path === "/health" || path === "/api/health") {
      return jsonResponse({ success: true, status: "healthy", version: "2.0.0", timestamp: Date.now() }, 200, corsHeaders);
    }
    try {
      if (path === "/api/auth/send-code" && method === "POST") {
        return handleSendCode(request, env, corsHeaders);
      }
      if (path === "/api/auth/verify-code" && method === "POST") {
        return handleVerifyCode(request, env, corsHeaders);
      }
      if (path === "/api/auth/resend-code" && method === "POST") {
        return handleResendCode(request, env, corsHeaders);
      }
      if (path === "/api/register" && method === "POST") {
        return handleRegister(request, env, corsHeaders);
      }
      if (path === "/api/login" && method === "POST") {
        return handleLogin(request, env, corsHeaders);
      }
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return jsonResponse({ success: false, error: "\u05E0\u05D3\u05E8\u05E9\u05EA \u05D4\u05EA\u05D7\u05D1\u05E8\u05D5\u05EA" }, 401, corsHeaders);
      }
      const token = authHeader.replace("Bearer ", "");
      const userId = await getUserIdFromToken(token, env.JWT_SECRET);
      if (!userId) {
        return jsonResponse({ success: false, error: "Token \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF" }, 401, corsHeaders);
      }
      const userExists = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(userId).first();
      if (!userExists) {
        return jsonResponse({ success: false, error: "\u05D4\u05DE\u05E9\u05EA\u05DE\u05E9 \u05DC\u05D0 \u05E7\u05D9\u05D9\u05DD \u05D1\u05DE\u05E2\u05E8\u05DB\u05EA" }, 401, corsHeaders);
      }
      if (path === "/api/profile" && method === "PUT") {
        return handleUpdateProfile(request, env, userId, corsHeaders);
      }
      if (path === "/api/change-password" && method === "POST") {
        return handleChangePassword(request, env, userId, corsHeaders);
      }
      if (path === "/api/delete-account" && method === "DELETE") {
        return handleDeleteAccount(env, userId, corsHeaders);
      }
      if (path === "/api/update-pwa-status" && method === "POST") {
        return handleUpdatePwaStatus(request, env, userId, corsHeaders);
      }
      if (path === "/api/update-app-info" && method === "POST") {
        return handleUpdateAppInfo(request, env, userId, corsHeaders);
      }
      if (path === "/api/report-error" && method === "POST") {
        return handleReportError(request, env, userId, corsHeaders);
      }
      if (path === "/api/settings" && method === "GET") {
        return handleGetSettings(env, userId, corsHeaders);
      }
      if (path === "/api/settings" && method === "PUT") {
        return handleUpdateSettings(request, env, userId, corsHeaders);
      }
      if (path === "/api/dashboard" && method === "GET") {
        return handleDashboard(env, userId, corsHeaders);
      }
      if (path === "/api/monthly-stats" && method === "GET") {
        return handleMonthlyStats(request, env, userId, corsHeaders);
      }
      if (path === "/api/expenses" && method === "GET") {
        return handleGetExpenses(request, env, userId, corsHeaders);
      }
      if (path === "/api/expenses" && method === "POST") {
        return handleCreateExpense(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/expenses\/[^\/]+\/recurring$/) && method === "PATCH") {
        const expenseId = path.split("/")[3];
        return handleExpenseRecurring(request, env, userId, expenseId, corsHeaders);
      }
      if (path.match(/^\/api\/expenses\/[^\/]+$/) && method === "GET") {
        const expenseId = path.split("/").pop();
        return handleGetExpense(env, userId, expenseId, corsHeaders);
      }
      if (path.match(/^\/api\/expenses\/[^\/]+$/) && method === "PUT") {
        const expenseId = path.split("/").pop();
        return handleUpdateExpense(request, env, userId, expenseId, corsHeaders);
      }
      if (path.match(/^\/api\/expenses\/[^\/]+$/) && method === "DELETE") {
        const expenseId = path.split("/").pop();
        return handleDeleteExpense(env, userId, expenseId, corsHeaders);
      }
      if (path === "/api/incomes" && method === "GET") {
        return handleGetIncomes(request, env, userId, corsHeaders);
      }
      if (path === "/api/incomes" && method === "POST") {
        return handleCreateIncome(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/incomes\/[^\/]+\/recurring$/) && method === "PATCH") {
        const incomeId = path.split("/")[3];
        return handleIncomeRecurring(request, env, userId, incomeId, corsHeaders);
      }
      if (path.match(/^\/api\/incomes\/[^\/]+$/) && method === "GET") {
        const incomeId = path.split("/").pop();
        return handleGetIncome(env, userId, incomeId, corsHeaders);
      }
      if (path.match(/^\/api\/incomes\/[^\/]+$/) && method === "PUT") {
        const incomeId = path.split("/").pop();
        return handleUpdateIncome(request, env, userId, incomeId, corsHeaders);
      }
      if (path.match(/^\/api\/incomes\/[^\/]+$/) && method === "DELETE") {
        const incomeId = path.split("/").pop();
        return handleDeleteIncome(env, userId, incomeId, corsHeaders);
      }
      if (path === "/api/budgets" && method === "GET") {
        return handleGetBudgets(env, userId, corsHeaders);
      }
      if (path === "/api/budgets" && method === "POST") {
        return handleCreateBudget(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/budgets\/[^\/]+$/) && method === "PUT") {
        const budgetId = path.split("/").pop();
        return handleUpdateBudget(request, env, userId, budgetId, corsHeaders);
      }
      if (path.match(/^\/api\/budgets\/[^\/]+$/) && method === "DELETE") {
        const budgetId = path.split("/").pop();
        return handleDeleteBudget(env, userId, budgetId, corsHeaders);
      }
      if (path === "/api/categories" && method === "GET") {
        return handleGetCategories(env, userId, corsHeaders);
      }
      if (path === "/api/categories" && method === "POST") {
        return handleCreateCategory(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/categories\/[^\/]+$/) && method === "PUT") {
        const categoryId = path.split("/").pop();
        return handleUpdateCategory(request, env, userId, categoryId, corsHeaders);
      }
      if (path.match(/^\/api\/categories\/[^\/]+$/) && method === "DELETE") {
        const categoryId = path.split("/").pop();
        return handleDeleteCategory(env, userId, categoryId, corsHeaders);
      }
      if (path === "/api/cards" && method === "GET") {
        return handleGetCards(env, userId, corsHeaders);
      }
      if (path === "/api/cards" && method === "POST") {
        return handleCreateCard(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/cards\/[^\/]+$/) && method === "PUT") {
        const cardId = path.split("/").pop();
        return handleUpdateCard(request, env, userId, cardId, corsHeaders);
      }
      if (path.match(/^\/api\/cards\/[^\/]+$/) && method === "DELETE") {
        const cardId = path.split("/").pop();
        return handleDeleteCard(env, userId, cardId, corsHeaders);
      }
      if (path === "/api/loans" && method === "GET") {
        return handleGetLoans(env, userId, corsHeaders);
      }
      if (path === "/api/loans" && method === "POST") {
        return handleCreateLoan(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/loans\/[^\/]+$/) && method === "PUT") {
        const loanId = path.split("/").pop();
        return handleUpdateLoan(request, env, userId, loanId, corsHeaders);
      }
      if (path.match(/^\/api\/loans\/[^\/]+$/) && method === "DELETE") {
        const loanId = path.split("/").pop();
        return handleDeleteLoan(env, userId, loanId, corsHeaders);
      }
      if (path === "/api/installments" && method === "GET") {
        return handleGetInstallments(env, userId, corsHeaders);
      }
      if (path === "/api/installments" && method === "POST") {
        return handleCreateInstallment(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/installments\/[^\/]+$/) && method === "PUT") {
        const instId = path.split("/").pop();
        return handleUpdateInstallment(request, env, userId, instId, corsHeaders);
      }
      if (path.match(/^\/api\/installments\/[^\/]+$/) && method === "DELETE") {
        const instId = path.split("/").pop();
        return handleDeleteInstallment(env, userId, instId, corsHeaders);
      }
      if (path === "/api/subscriptions" && method === "GET") {
        return handleGetSubscriptions(env, userId, corsHeaders);
      }
      if (path === "/api/subscriptions" && method === "POST") {
        return handleCreateSubscription(request, env, userId, corsHeaders);
      }
      if (path === "/api/subscriptions/summary" && method === "GET") {
        return handleSubscriptionsSummary(env, userId, corsHeaders);
      }
      if (path === "/api/subscriptions/test-notification" && method === "POST") {
        return handleTestNotification(env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+\/cancel$/) && method === "POST") {
        const subId = path.split("/")[3];
        return handleCancelSubscription(env, userId, subId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+\/reactivate$/) && method === "POST") {
        const subId = path.split("/")[3];
        return handleReactivateSubscription(env, userId, subId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+$/) && method === "GET") {
        const subId = path.split("/").pop();
        return handleGetSubscription(env, userId, subId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+$/) && method === "PUT") {
        const subId = path.split("/").pop();
        return handleUpdateSubscription(request, env, userId, subId, corsHeaders);
      }
      if (path.match(/^\/api\/subscriptions\/[^\/]+$/) && method === "DELETE") {
        const subId = path.split("/").pop();
        return handleDeleteSubscription(env, userId, subId, corsHeaders);
      }
      if (path === "/api/goals" && method === "GET") {
        return handleGetGoals(env, userId, corsHeaders);
      }
      if (path === "/api/goals" && method === "POST") {
        return handleCreateGoal(request, env, userId, corsHeaders);
      }
      if (path === "/api/goals/stats" && method === "GET") {
        return handleGoalsStats(env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/contributions\/[^\/]+$/) && method === "DELETE") {
        const contributionId = path.split("/").pop();
        return handleDeleteContribution(env, userId, contributionId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/[^\/]+\/contribute$/) && method === "POST") {
        const goalId = path.split("/")[3];
        return handleAddContribution(request, env, userId, goalId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/[^\/]+$/) && method === "GET") {
        const goalId = path.split("/").pop();
        return handleGetGoal(env, userId, goalId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/[^\/]+$/) && method === "PUT") {
        const goalId = path.split("/").pop();
        return handleUpdateGoal(request, env, userId, goalId, corsHeaders);
      }
      if (path.match(/^\/api\/goals\/[^\/]+$/) && method === "DELETE") {
        const goalId = path.split("/").pop();
        return handleDeleteGoal(env, userId, goalId, corsHeaders);
      }
      if (path === "/api/biz/expenses" && method === "GET") {
        return handleGetBizExpenses(request, env, userId, corsHeaders);
      }
      if (path === "/api/biz/expenses" && method === "POST") {
        return handleCreateBizExpense(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/expenses\/[^\/]+$/) && method === "GET") {
        const expId = path.split("/").pop();
        return handleGetBizExpense(env, userId, expId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/expenses\/[^\/]+$/) && method === "PUT") {
        const expId = path.split("/").pop();
        return handleUpdateBizExpense(request, env, userId, expId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/expenses\/[^\/]+$/) && method === "DELETE") {
        const expId = path.split("/").pop();
        return handleDeleteBizExpense(env, userId, expId, corsHeaders);
      }
      if (path === "/api/biz/incomes" && method === "GET") {
        return handleGetBizIncomes(request, env, userId, corsHeaders);
      }
      if (path === "/api/biz/incomes" && method === "POST") {
        return handleCreateBizIncome(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/incomes\/[^\/]+$/) && method === "GET") {
        const incId = path.split("/").pop();
        return handleGetBizIncome(env, userId, incId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/incomes\/[^\/]+$/) && method === "PUT") {
        const incId = path.split("/").pop();
        return handleUpdateBizIncome(request, env, userId, incId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/incomes\/[^\/]+$/) && method === "DELETE") {
        const incId = path.split("/").pop();
        return handleDeleteBizIncome(env, userId, incId, corsHeaders);
      }
      if (path === "/api/biz/dashboard" && method === "GET") {
        return handleBizDashboard(request, env, userId, corsHeaders);
      }
      if (path === "/api/biz/vat-report" && method === "GET") {
        return handleVatReport(request, env, userId, corsHeaders);
      }
      if (path === "/api/biz/clients" && method === "GET") {
        return handleGetClients(env, userId, corsHeaders);
      }
      if (path === "/api/biz/clients" && method === "POST") {
        return handleCreateClient(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/clients\/[^\/]+$/) && method === "GET") {
        const clientId = path.split("/").pop();
        return handleGetClient(env, userId, clientId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/clients\/[^\/]+$/) && method === "PUT") {
        const clientId = path.split("/").pop();
        return handleUpdateClient(request, env, userId, clientId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/clients\/[^\/]+$/) && method === "DELETE") {
        const clientId = path.split("/").pop();
        return handleDeleteClient(env, userId, clientId, corsHeaders);
      }
      if (path === "/api/biz/suppliers" && method === "GET") {
        return handleGetSuppliers(env, userId, corsHeaders);
      }
      if (path === "/api/biz/suppliers" && method === "POST") {
        return handleCreateSupplier(request, env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/suppliers\/[^\/]+$/) && method === "GET") {
        const supplierId = path.split("/").pop();
        return handleGetSupplier(env, userId, supplierId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/suppliers\/[^\/]+$/) && method === "PUT") {
        const supplierId = path.split("/").pop();
        return handleUpdateSupplier(request, env, userId, supplierId, corsHeaders);
      }
      if (path.match(/^\/api\/biz\/suppliers\/[^\/]+$/) && method === "DELETE") {
        const supplierId = path.split("/").pop();
        return handleDeleteSupplier(env, userId, supplierId, corsHeaders);
      }
      if (path === "/api/ai-chat" && method === "POST") {
        return handleAiChat(request, env, userId, corsHeaders);
      }
      if (path === "/api/ai/insight" && method === "POST") {
        return handleAiInsight(request, env, corsHeaders);
      }
      if (path === "/api/feedback" && method === "POST") {
        return handleCreateFeedback(request, env, userId, corsHeaders);
      }
      if (path === "/api/feedback" && method === "GET") {
        return handleGetFeedback(env, userId, corsHeaders);
      }
      if (path === "/api/admin/stats" && method === "GET") {
        return handleAdminStats(env, userId, corsHeaders);
      }
      if (path === "/api/admin/users" && method === "GET") {
        return handleAdminUsers(env, userId, corsHeaders);
      }
      if (path === "/api/admin/users" && method === "POST") {
        return handleAdminCreateUser(request, env, userId, corsHeaders);
      }
      if (path === "/api/admin/reset-password" && method === "POST") {
        return handleAdminResetPassword(request, env, userId, corsHeaders);
      }
      if (path === "/api/admin/feedback" && method === "GET") {
        return handleAdminFeedback(env, userId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+\/stats$/) && method === "GET") {
        const targetUserId = path.split("/")[4];
        return handleAdminUserStats(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+\/errors$/) && method === "GET") {
        const targetUserId = path.split("/")[4];
        return handleAdminUserErrors(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+\/activity$/) && method === "GET") {
        const targetUserId = path.split("/")[4];
        return handleAdminUserActivity(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+\/clear-errors$/) && method === "POST") {
        const targetUserId = path.split("/")[4];
        return handleAdminClearErrors(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+$/) && method === "PUT") {
        const targetUserId = path.split("/").pop();
        return handleAdminUpdateUser(request, env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/users\/[^\/]+$/) && method === "DELETE") {
        const targetUserId = path.split("/").pop();
        return handleAdminDeleteUser(env, userId, targetUserId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/feedback\/[^\/]+$/) && method === "PUT") {
        const feedbackId = path.split("/").pop();
        return handleAdminUpdateFeedback(request, env, userId, feedbackId, corsHeaders);
      }
      if (path.match(/^\/api\/admin\/feedback\/[^\/]+$/) && method === "DELETE") {
        const feedbackId = path.split("/").pop();
        return handleAdminDeleteFeedback(env, userId, feedbackId, corsHeaders);
      }
      return jsonResponse({ success: false, error: "Endpoint not found" }, 404, corsHeaders);
    } catch (error) {
      console.error("Worker error:", error);
      return jsonResponse({ success: false, error: "\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05E9\u05E8\u05EA", details: error.message }, 500, corsHeaders);
    }
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
