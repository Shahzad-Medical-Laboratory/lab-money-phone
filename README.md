# Lab Money Tracker - Phone Page

An online-only phone page for the lab money tracker, built with plain HTML, CSS, and JavaScript. Designed to run directly in mobile browsers and hostable on GitHub Pages.

## Local Testing

1. Open a terminal in this directory.
2. Run:
   ```bash
   node dev-server.js
   ```
3. Open your browser to [http://localhost:8080](http://localhost:8080).

## Configuration

Before using the app, configure your public Supabase key in `config.js`:
- Open `config.js`.
- Replace `"PASTE_PUBLISHABLE_KEY_HERE"` with your project's publishable (anon) key:
  ```javascript
  const SUPABASE_KEY = "your-actual-anon-key";
  ```

## Security Note

**No secrets belong in this repository.**
- Only the Supabase project URL and the public (publishable / anon) key may appear in `config.js`.
- Never put a service role key, secret key, database password, or user account password in any file in this repository.
- Authentication occurs securely directly via the Supabase client using email and password in the browser session.

