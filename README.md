# 💰 FlowEco - ניהול פיננסי חכם

<div align="center">

![FlowEco Logo](https://img.shields.io/badge/FlowEco-v2.0_BETA-10B981?style=for-the-badge)

**אפליקציית ניהול פיננסי אישי בעברית** 🇮🇱

[![WordPress](https://img.shields.io/badge/WordPress-21759B?style=flat-square&logo=wordpress&logoColor=white)](https://wordpress.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)

[🌐 Demo](https://flowraz.io) · [🐛 דיווח באג](https://github.com/YOUR_USERNAME/floweco/issues) · [💡 בקשת פיצ'ר](https://github.com/YOUR_USERNAME/floweco/issues)

</div>

---

## ✨ פיצ'רים

- 📊 **דשבורד חכם** - סקירה מלאה של המצב הפיננסי
- 💸 **ניהול הוצאות** - מעקב הוצאות עם קטגוריות, תשלומים, הלוואות
- 💰 **ניהול הכנסות** - מעקב הכנסות קבועות וחד-פעמיות
- 🎯 **תקציב חודשי** - הגדרת תקציב לפי קטגוריה עם התראות
- 🤖 **כלכלן חכם AI** - ייעוץ פיננסי מבוסס בינה מלאכותית
- 📈 **דוחות וגרפים** - 7 סוגי גרפים ותובנות חכמות
- 💳 **ניהול כרטיסי אשראי** - מעקב הוצאות לפי כרטיס
- 🔄 **הוצאות/הכנסות קבועות** - חיזוי אוטומטי לחודשים הבאים
- 🌙 **מצב כהה** - עיצוב מודרני ונעים לעיניים
- 📱 **רספונסיבי** - תמיכה מלאה במובייל

---

## 🛠️ טכנולוגיות

| Frontend | Backend | Database | AI |
|----------|---------|----------|-----|
| WordPress | Cloudflare Workers | Cloudflare D1 | OpenAI GPT |
| Elementor | JWT Auth | SQLite | |
| WPCodeBox | REST API | | |

---

## 📁 מבנה הפרויקט

```
floweco/
├── 📂 css/              # קבצי עיצוב
│   ├── sidebar-styles.css
│   ├── dashboard-styles.css
│   ├── expenses-styles.css
│   ├── incomes-styles.css
│   ├── budgets-styles.css
│   ├── reports-styles.css
│   ├── settings-styles.css
│   ├── admin-styles.css
│   └── ai-advisor-styles.css
│
├── 📂 js/               # לוגיקה
│   ├── core-config.js
│   ├── core-auth-guard.js
│   ├── sidebar-logic.js
│   ├── dashboard-logic.js
│   ├── expenses-logic.js
│   ├── incomes-logic.js
│   ├── budgets-logic.js
│   ├── reports-logic.js
│   ├── settings-logic.js
│   ├── admin-logic.js
│   └── ai-advisor-logic.js
│
├── 📂 php/              # HTML & Shortcodes
│   ├── sidebar-html.php
│   ├── dashboard.php
│   ├── expenses.php
│   ├── incomes.php
│   ├── budgets.php
│   ├── reports.php
│   ├── settings.php
│   ├── admin.php
│   ├── ai-advisor.php
│   ├── login.php
│   └── register.php
│
├── 📂 worker/           # Cloudflare Worker API
│   └── floweco-worker.js
│
└── 📄 README.md
```

---

## 🚀 התקנה

### דרישות מקדימות
- WordPress עם Elementor
- WPCodeBox (או תוסף snippets אחר)
- חשבון Cloudflare (Workers + D1)
- מפתח OpenAI API (לכלכלן החכם)

### שלבים

1. **הגדרת Cloudflare Worker:**
   ```bash
   # העלה את worker/floweco-worker.js ל-Cloudflare Workers
   # צור D1 Database בשם floweco-db
   # הגדר Environment Variables: JWT_SECRET, OPENAI_API_KEY
   ```

2. **ייבוא ל-WPCodeBox:**
   - העלה את כל קבצי ה-PHP, CSS, JS לתיקיות מתאימות
   - או השתמש ב-Import מקובץ JSON

3. **יצירת עמודים ב-WordPress:**
   - צור עמודים עם Shortcodes מתאימים
   - `[floweco_dashboard]`, `[floweco_expenses]`, וכו'

---

## 📡 API Endpoints

| Method | Endpoint | תיאור |
|--------|----------|-------|
| POST | `/api/register` | הרשמה |
| POST | `/api/login` | התחברות |
| GET | `/api/expenses` | קבלת הוצאות |
| POST | `/api/expenses` | הוספת הוצאה |
| PUT | `/api/expenses/:id` | עדכון הוצאה |
| DELETE | `/api/expenses/:id` | מחיקת הוצאה |
| GET | `/api/incomes` | קבלת הכנסות |
| GET | `/api/budgets` | קבלת תקציבים |
| GET | `/api/cards` | קבלת כרטיסים |
| GET | `/api/categories` | קבלת קטגוריות |
| POST | `/api/ai/advice` | ייעוץ AI |

---

## 📸 צילומי מסך

> *בקרוב...*

---

## 🗺️ Roadmap

- [x] מערכת הוצאות מלאה
- [x] מערכת הכנסות
- [x] ניהול תקציב
- [x] כלכלן חכם AI
- [x] דוחות וגרפים
- [x] ניהול קטגוריות
- [ ] ייצוא PDF/Excel
- [ ] התראות Push
- [ ] סנכרון בנקים
- [ ] אפליקציית מובייל

---

## 🤝 תרומה

תרומות מתקבלות בברכה! אנא פתחו Issue או Pull Request.

---

## 📄 רישיון

MIT License - ראה קובץ [LICENSE](LICENSE) לפרטים.

---

<div align="center">

**נבנה עם ❤️ על ידי [FlowRaz](https://flowraz.io)**

</div>
