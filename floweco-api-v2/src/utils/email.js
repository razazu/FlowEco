// ========================================
// FlowEco API - Email Utilities
// ========================================

// Send verification email via Resend
export async function sendVerificationEmail(email, code, userName, resendApiKey) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FlowEco <noreply@flowraz.io>',
        to: email,
        subject: '🔐 קוד אימות - FlowEco',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; border-radius: 16px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">💰 FlowEco</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">ניהול פיננסי חכם</p>
            </div>
            
            <div style="background: #1a1a2e; padding: 30px; border-radius: 16px; margin-top: 20px; color: #fff;">
              <h2 style="color: #10B981; margin-top: 0;">שלום ${userName || ''}! 👋</h2>
              <p style="color: #ccc; line-height: 1.6; font-size: 16px;">קוד האימות שלך הוא:</p>
              
              <div style="background: rgba(102, 126, 234, 0.2); border: 2px solid #667eea; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #667eea;">${code}</span>
              </div>
              
              <p style="color: #999; font-size: 14px;">⏰ הקוד תקף ל-10 דקות בלבד</p>
              <p style="color: #999; font-size: 14px;">אם לא ביקשת קוד זה, התעלם מהודעה זו.</p>
            </div>
            
            <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} FlowEco - כל הזכויות שמורות
            </p>
          </div>
        `
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// Send budget alert email
export async function sendBudgetAlertEmail(email, userName, category, spent, budget, percentage, resendApiKey) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FlowEco <notifications@flowraz.io>',
        to: email,
        subject: `⚠️ התראת תקציב - ${category}`,
        html: `
          <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #F59E0B, #EF4444); padding: 30px; border-radius: 16px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">💰 FlowEco</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">התראת תקציב</p>
            </div>
            
            <div style="background: #1E293B; padding: 30px; border-radius: 16px; margin-top: 20px; color: #F1F5F9;">
              <h2 style="color: #F59E0B; margin-top: 0;">שלום ${userName || ''}! 👋</h2>
              <p style="color: #94A3B8; line-height: 1.6;">הגעת ל-<strong style="color: #EF4444;">${percentage}%</strong> מהתקציב שהגדרת לקטגוריה:</p>
              
              <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #F59E0B;">${category}</div>
                <div style="margin-top: 15px;">
                  <span style="color: #94A3B8;">הוצאת:</span>
                  <span style="color: #EF4444; font-weight: bold; font-size: 20px;"> ₪${Math.round(spent).toLocaleString()}</span>
                  <span style="color: #94A3B8;"> מתוך </span>
                  <span style="color: #10B981; font-weight: bold; font-size: 20px;">₪${Math.round(budget).toLocaleString()}</span>
                </div>
                <div style="background: #374151; border-radius: 10px; height: 12px; margin-top: 15px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, #F59E0B, #EF4444); height: 100%; width: ${Math.min(percentage, 100)}%; border-radius: 10px;"></div>
                </div>
              </div>
              
              <p style="color: #64748B; font-size: 14px; text-align: center;">
                <a href="https://flowraz.io/dashboard/?page=budgets" style="color: #8B5CF6;">לצפייה בתקציבים שלך</a>
              </p>
            </div>
            
            <p style="text-align: center; color: #64748B; font-size: 12px; margin-top: 20px;">
              © 2025 FlowEco - ניהול פיננסי חכם
            </p>
          </div>
        `
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Budget alert email error:', error);
    return false;
  }
}

// Send test notification email
export async function sendTestNotificationEmail(email, userName, resendApiKey) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'FlowEco <notifications@flowraz.io>',
        to: email,
        subject: '🔔 בדיקת התראות - FlowEco',
        html: `
          <div dir="rtl" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 30px; border-radius: 16px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">💰 FlowEco</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">מערכת התראות</p>
            </div>
            
            <div style="background: #1E293B; padding: 30px; border-radius: 16px; margin-top: 20px; color: #F1F5F9;">
              <h2 style="color: #10B981; margin-top: 0;">שלום ${userName || ''}! 👋</h2>
              <p style="color: #94A3B8; line-height: 1.6;">זוהי הודעת בדיקה - מערכת ההתראות עובדת מצוין!</p>
              
              <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
                <span style="font-size: 48px;">✅</span>
                <p style="color: #8B5CF6; font-weight: 600; margin: 10px 0 0 0;">ההתראות פועלות!</p>
              </div>
              
              <p style="color: #64748B; font-size: 14px;">תקבל התראות על מנויים שעומדים להתחדש לפי ההגדרות שלך.</p>
            </div>
            
            <p style="text-align: center; color: #64748B; font-size: 12px; margin-top: 20px;">
              © 2025 FlowEco - ניהול פיננסי חכם
            </p>
          </div>
        `
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Test notification email error:', error);
    return false;
  }
}
