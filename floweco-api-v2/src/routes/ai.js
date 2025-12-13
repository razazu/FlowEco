// ========================================
// FlowEco API - AI Routes
// ========================================

import { jsonResponse } from '../utils/response.js';
import { VAT_RATE } from '../utils/constants.js';

// ========== AI CHAT ==========
export async function handleAiChat(request, env, userId, corsHeaders) {
  const body = await request.json();
  const { message, context, mode, history } = body;

  const isBusinessMode = mode === 'business' || (context && context.mode === 'business');

  let systemPrompt;

  if (isBusinessMode) {
    systemPrompt = `אתה יועץ פיננסי לעסקים קטנים בישראל מטעם FlowEco.
תן תשובות קצרות ומקצועיות (2-4 משפטים).
דבר בעברית פשוטה ומובנת.

הנחיות חשובות:
- מע"מ בישראל הוא 18%
- התייחס להוצאות מוכרות למס
- הזכר תזרים מזומנים ורווחיות
- היה מודע לדיווחים דו-חודשיים למע"מ
- אל תתן ייעוץ מס ספציפי - הפנה לרואה חשבון`;

    if (context) {
      systemPrompt += '\n\nנתוני העסק החודשיים:';
      if (context.totalIncomes !== undefined) systemPrompt += `\nהכנסות ברוטו: ₪${Math.round(context.totalIncomes).toLocaleString()}`;
      if (context.totalIncomesNet !== undefined) systemPrompt += `\nהכנסות נטו: ₪${Math.round(context.totalIncomesNet).toLocaleString()}`;
      if (context.totalExpenses !== undefined) systemPrompt += `\nהוצאות ברוטו: ₪${Math.round(context.totalExpenses).toLocaleString()}`;
      if (context.totalExpensesNet !== undefined) systemPrompt += `\nהוצאות נטו: ₪${Math.round(context.totalExpensesNet).toLocaleString()}`;
      if (context.profit !== undefined) systemPrompt += `\nרווח נטו: ₪${Math.round(context.profit).toLocaleString()}`;
      if (context.vatCollected !== undefined) systemPrompt += `\nמע"מ עסקאות (שגבה): ₪${Math.round(context.vatCollected).toLocaleString()}`;
      if (context.vatPaid !== undefined) systemPrompt += `\nמע"מ תשומות (ששילם): ₪${Math.round(context.vatPaid).toLocaleString()}`;
      if (context.vatBalance !== undefined) {
        const vatStatus = context.vatBalance >= 0 ? 'לתשלום' : 'להחזר';
        systemPrompt += `\nיתרת מע"מ ${vatStatus}: ₪${Math.abs(Math.round(context.vatBalance)).toLocaleString()}`;
      }
      if (context.expenseCategories && context.expenseCategories.length > 0) {
        systemPrompt += '\n\nהוצאות לפי קטגוריה:';
        context.expenseCategories.forEach(cat => {
          systemPrompt += `\n- ${cat.category}: ₪${Math.round(cat.amount).toLocaleString()}`;
        });
      }
    }
  } else {
    systemPrompt = `אתה יועץ כלכלי אישי של FlowEco.
תן תשובות קצרות ומעשיות (2-3 משפטים).
דבר בעברית פשוטה ונעימה.
עזור למשתמש לנהל את התקציב האישי, לחסוך כסף ולקבל החלטות פיננסיות טובות.`;

    if (context) {
      systemPrompt += '\n\nנתונים פיננסיים:';
      if (context.totalIncomes !== undefined) systemPrompt += `\nהכנסות החודש: ₪${context.totalIncomes}`;
      if (context.totalExpenses !== undefined) systemPrompt += `\nהוצאות החודש: ₪${context.totalExpenses}`;
      if (context.balance !== undefined) systemPrompt += `\nיתרה: ₪${context.balance}`;
    }
  }

  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      if (h.role && h.content) {
        messages.push({ role: h.role, content: h.content });
      }
    });
  }

  messages.push({ role: 'user', content: message });

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 600,
      temperature: 0.7
    })
  });

  if (!openaiResponse.ok) {
    console.error('OpenAI Error:', await openaiResponse.text());
    return jsonResponse({ success: false, error: 'שגיאה ב-AI' }, 500, corsHeaders);
  }

  const aiData = await openaiResponse.json();
  
  return jsonResponse({
    success: true,
    data: { 
      message: aiData.choices[0].message.content,
      mode: isBusinessMode ? 'business' : 'personal'
    }
  }, 200, corsHeaders);
}

// ========== AI INSIGHT ==========
export async function handleAiInsight(request, env, corsHeaders) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return jsonResponse({ success: false, error: 'Missing prompt' }, 400, corsHeaders);
    }
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'אתה יועץ פיננסי חכם שנותן תובנות קצרות וממוקדות בעברית. התובנות שלך פרקטיות, מעודדות ומבוססות נתונים. תמיד תענה בעברית בלבד, בסגנון ידידותי ומקצועי. תן תובנה אחת בלבד, עד 2 משפטים.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      })
    });
    
    const openaiResult = await openaiResponse.json();
    
    if (openaiResult.error) {
      console.error('OpenAI error:', openaiResult.error);
      return jsonResponse({ 
        success: false, 
        error: 'שגיאה בקבלת תובנה מהבינה המלאכותית' 
      }, 500, corsHeaders);
    }
    
    const insight = openaiResult.choices?.[0]?.message?.content?.trim();
    
    if (!insight) {
      return jsonResponse({ 
        success: false, 
        error: 'לא התקבלה תובנה' 
      }, 500, corsHeaders);
    }
    
    return jsonResponse({ 
      success: true, 
      insight 
    }, 200, corsHeaders);
    
  } catch (error) {
    console.error('AI insight error:', error);
    return jsonResponse({ 
      success: false, 
      error: 'שגיאה בעיבוד הבקשה' 
    }, 500, corsHeaders);
  }
}
