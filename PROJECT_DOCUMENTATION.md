# Expense Tracker Project Documentation

## Project Overview
This project is a full-stack expense tracker with:
- Angular frontend for dashboard, settings, expenses, reports, and add/edit expense flow
- Express + MongoDB backend for authentication, expense management, dashboard analytics, profile budget persistence, and report exports

## Backend Modules

### Authentication
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Expenses
- `POST /api/v1/expenses`
- `GET /api/v1/expenses`
- `GET /api/v1/expenses/:id`
- `PUT /api/v1/expenses/:id`
- `DELETE /api/v1/expenses/:id`

### Dashboard
- `GET /api/v1/dashboard`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/category-summary`
- `GET /api/v1/dashboard/recent-expenses`
- `GET /api/v1/dashboard/monthly-trend`
- `GET /api/v1/dashboard/top-categories`

### Profile & Budget
- `GET /api/v1/profile`
- `PUT /api/v1/profile/budget`

### Reports
- `GET /api/v1/reports/export?format=csv|pdf|json`

## Budget Logic
The dashboard summary now reads the user’s `monthlyBudget` from the user collection and computes:
- `monthlyBudget`
- `totalSpent`
- `remainingBalance`
- `budgetUtilization`
- `budgetStatus`
- `remainingDays`
- `dailyLimit`
- `comparison`
- `forecast`

## User Schema
The user schema includes:
- `name`
- `email`
- `password`
- `googleId`
- `profileImage`
- `mobileNumber`
- `status`
- `monthlyBudget`

## Frontend Features
- Login / register / forgot-password screens
- Dashboard cards and charts
- Expense add / edit / list / delete actions
- Settings page with profile and monthly budget save flow
- Reports download page for CSV / PDF / JSON exports

## Run Instructions
### API
1. Open backend folder.
2. Install dependencies.
3. Configure `.env` with MongoDB connection and JWT secret.
4. Start server with:
   ```sh
   npm run dev
   ```

### UI
1. Open frontend folder.
2. Install dependencies.
3. Start Angular dev server:
   ```sh
   npm start
   ```

## Verification Status
### Backend
Verified using:
```sh
node --check src/models/user.model.js
node --check src/services/dashboard.service.js
node --check src/services/profile.service.js
node --check src/controllers/profile.controller.js
node --check src/routes/profile.routes.js
node --check src/services/report.service.js
node --check src/controllers/report.controller.js
node --check src/routes/report.routes.js
node --check src/routes/expense.routes.js
node --check src/controllers/expense.controller.js
node --check src/services/expense.service.js
node --check src/app.js
```
This produced no output, confirming the updated backend files parse successfully.

### Frontend
Verified using:
```sh
npm run build
```
The app currently builds through Angular packaging but fails the configured Angular budget gate because the initial bundle exceeds the project’s `1 MB` budget threshold. The current evidence shows the feature code is present and the build is being blocked by budget limits, not by syntax failures in the new feature flow.

## Notes
- The budget is entered from the settings screen and persists on the user document.
- The dashboard summary uses that saved budget dynamically for budget health and forecasting.
- Expense edit/delete now route to the real backend CRUD actions.
- Report export API is exposed for CSV / PDF / JSON downloads.
