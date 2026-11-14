# Lab Money Tracker - Phone Page

A multi-user, online-only phone page for the Lab Money Tracker, built with plain HTML, CSS, and JavaScript. Designed to run directly in mobile browsers and hostable on GitHub Pages.

## Features

- **Multi-User Authentication:** Anyone can sign up with email and password (minimum 10 characters). Includes email confirmation resend, password reset via email, and in-app password recovery.
- **Account & Profile Setup:** First-time onboarding prompts for business name and display currency (PKR, USD, EUR, GBP, AED, SAR, INR, BDT, or custom ISO / abbreviation code). The header Account panel allows reviewing and editing business name and currency at any time, plus secure logout.
- **Data Isolation:** All income, expenses, breakdown lines, and history entries are strictly isolated per user via database Row Level Security (`user_id`).
- **Income & Expense Tracking:** Add, edit, and soft-delete income and itemized expenses. Strict breakdown rules guarantee item lines do not exceed total expenses.
- **Summary & Analytics:** Real-time calculation of daily, monthly, and yearly totals and net profit formatted with the user's chosen currency code.
- **Privacy & Clean Logout:** Complete in-memory and UI state clearance upon sign-out so consecutive users on a shared phone never see another user's data.
- **Legal Transparency:** Built-in draft Terms of Service (`terms.html`) and Privacy Policy (`privacy.html`).

## Local Testing

1. Open a terminal in this directory.
2. Run:
   ```bash
   node dev-server.js
   ```
3. Open your browser to [http://localhost:8080](http://localhost:8080).

## Configuration

Configure your public Supabase key in `config.js`:
- Open `config.js`.
- Replace `"PASTE_PUBLISHABLE_KEY_HERE"` with your project's publishable (anon) key:
  ```javascript
  const SUPABASE_KEY = "your-actual-anon-key";
  ```

## Security Note

**No secrets belong in this repository.**
- Only the Supabase project URL (`https://shtuskajyplhqtjmlnhd.supabase.co`) and the public (publishable) key may appear in `config.js`.
- Never put a service role key, secret key, database password, or user account password in any file in this repository.
- Tokens, passwords, and secret keys are never printed or logged.
- Row Level Security ensures users can only read and mutate their own records.
