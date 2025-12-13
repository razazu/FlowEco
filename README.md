# 💰 FlowEco - Smart Financial Management

<div align="center">

![FlowEco Logo](https://img.shields.io/badge/FlowEco-v2.0_BETA-10B981?style=for-the-badge)

**Personal Finance Management App for Hebrew Speakers** 🇮🇱

[![WordPress](https://img.shields.io/badge/WordPress-21759B?style=flat-square&logo=wordpress&logoColor=white)](https://wordpress.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)

[🌐 Demo](https://flowraz.io) · [🐛 Report Bug](https://github.com/razazu/FlowEco/issues) · [💡 Feature Request](https://github.com/razazu/FlowEco/issues)

</div>

---
 
## ✨ Features

- 📊 **Smart Dashboard** - Complete financial overview
- 💸 **Expense Management** - Track expenses with categories, payments & loans
- 💰 **Income Management** - Track recurring and one-time income
- 🎯 **Monthly Budgets** - Set budgets per category with alerts
- 🤖 **AI Financial Advisor** - AI-powered financial advice using OpenAI
- 📈 **Reports & Charts** - 7 chart types with smart insights
- ⚙️ **Advanced Settings** - Full customization
- 👥 **Admin Panel** - User and system management
- 📱 **PWA Support** - Install as mobile app (Android + iOS)
- 🌙 **Dark Mode** - Modern and eye-friendly design

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | AI |
|----------|---------|----------|-----|
| WordPress | Cloudflare Workers | Cloudflare D1 | OpenAI GPT |
| Elementor | JWT Auth | SQLite | |
| WPCodeBox | REST API | | |

---

## 📁 Project Structure

```
floweco/
├── 📂 css/                              # Styles (11 files)
│   ├── floweco-global-font.css
│   ├── floweco-background-grid.css
│   ├── floweco-dashboard-styles-v2.css
│   ├── floweco-expenses-styles-v2.css
│   ├── floweco-incomes-styles-v2.css
│   ├── budgets-styles.css
│   ├── floweco-reports-styles.css
│   ├── floweco-settings-styles.css
│   ├── admin-styles.css
│   ├── ai-advisor-styles.css
│   └── sidebar-styles.css
│
├── 📂 js/                               # Logic (11 files)
│   ├── floweco-core-config.js
│   ├── core-auth-guard.js
│   ├── floweco-dashboard-core-v2.js
│   ├── floweco-expenses-core-v2.js
│   ├── floweco-incomes-core-v2.js
│   ├── budgets-logic.js
│   ├── floweco-reports-logic.js
│   ├── floweco-settings-logic.js
│   ├── admin-logic.js
│   ├── ai-advisor-logic.js
│   └── sidebar-logic.js
│
├── 📂 php/                              # HTML & Shortcodes (12 files)
│   ├── floweco-manifest.php
│   ├── floweco-login.php
│   ├── floweco-register.php
│   ├── floweco-dashboard-v2.php
│   ├── floweco-expenses-v2.php
│   ├── floweco-incomes-v2.php
│   ├── budgets.php
│   ├── floweco-reports-html.php
│   ├── floweco-settings-html.php
│   ├── admin.php
│   ├── ai-advisor.php
│   └── sidebar.php
│
├── 📂 html/                             # PWA Templates (3 files)
│   ├── floweco-pwa-meta.html
│   ├── floweco-pwa-install.html
│   └── floweco-mini-header.html
│
└── 📄 README.md
```

**Total: 37 files**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | User registration |
| POST | `/api/login` | User login |
| GET | `/api/expenses` | Get expenses |
| POST | `/api/expenses` | Add expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| GET | `/api/incomes` | Get incomes |
| GET | `/api/budgets` | Get budgets |
| GET | `/api/cards` | Get credit cards |
| GET | `/api/categories` | Get categories |
| POST | `/api/ai/advice` | AI financial advice |

---

## 🗺️ Roadmap

- [x] Full expense management system
- [x] Income management
- [x] Budget management
- [x] AI Financial Advisor
- [x] Reports & Charts
- [x] Category management
- [x] Advanced settings
- [x] Admin panel
- [x] PWA Support
- [ ] PDF/Excel export
- [ ] Push notifications

---

## 📅 Last Updated

**December 1, 2025**

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [FlowRaz](https://flowraz.io)**

</div>
