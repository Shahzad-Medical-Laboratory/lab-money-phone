// Lab Money Tracker - Phone Page
// Multi-User Supabase Client (Static / GitHub Pages compatible)

(function () {
  'use strict';

  // --- State ---
  const state = {
    user: null,
    profile: null, // { user_id, business_name, currency, created_at, updated_at }
    deviceId: getOrCreateDeviceId(),
    currentScreen: 'income', // 'income' | 'expense' | 'summary'
    currentAuthView: 'login', // 'login' | 'signup' | 'confirm-sent' | 'forgot' | 'recovery'
    isPasswordRecovery: false,
    summaryPeriod: 'daily',
    income: [],
    expenses: [],
    expenseItems: [],
    isOffline: !navigator.onLine,
    isSubmitting: false,
    deleteTarget: null // { type: 'income' | 'expense', item: object }
  };

  // --- DOM Elements ---
  const el = {
    offlineBanner: document.getElementById('offline-banner'),

    // Screens
    authScreen: document.getElementById('auth-screen'),
    setupScreen: document.getElementById('setup-screen'),
    appContainer: document.getElementById('app-container'),

    // Header & Account Panel
    headerBrandName: document.getElementById('header-brand-name'),
    accountToggleBtn: document.getElementById('account-toggle-btn'),
    accountBtnLabel: document.getElementById('account-btn-label'),
    accountBackdrop: document.getElementById('account-backdrop'),
    accountPanel: document.getElementById('account-panel'),
    accountCloseBtn: document.getElementById('account-close-btn'),
    accountEmailDisplay: document.getElementById('account-email-display'),
    accountBusinessDisplay: document.getElementById('account-business-display'),
    accountForm: document.getElementById('account-form'),
    accountBusinessName: document.getElementById('account-business-name'),
    accountNameError: document.getElementById('account-name-error'),
    accountCurrency: document.getElementById('account-currency'),
    accountCustomCurrencyGroup: document.getElementById('account-custom-currency-group'),
    accountCurrencyCustom: document.getElementById('account-currency-custom'),
    accountCurrencyError: document.getElementById('account-currency-error'),
    accountFormError: document.getElementById('account-form-error'),
    accountSaveBtn: document.getElementById('account-save-btn'),
    logoutBtn: document.getElementById('logout-btn'),

    // Auth Views
    viewLogin: document.getElementById('view-login'),
    viewSignup: document.getElementById('view-signup'),
    viewConfirmSent: document.getElementById('view-confirm-sent'),
    viewForgot: document.getElementById('view-forgot'),
    viewRecovery: document.getElementById('view-recovery'),

    // Login Form
    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginEmailError: document.getElementById('login-email-error'),
    loginPasswordError: document.getElementById('login-password-error'),
    loginError: document.getElementById('login-error'),
    loginBtn: document.getElementById('login-btn'),
    loginUnconfirmedBox: document.getElementById('login-unconfirmed-box'),
    loginUnconfirmedMsg: document.getElementById('login-unconfirmed-msg'),
    resendConfirmationBtn: document.getElementById('resend-confirmation-btn'),
    gotoForgotBtn: document.getElementById('goto-forgot-btn'),
    gotoSignupBtn: document.getElementById('goto-signup-btn'),

    // Sign Up Form
    signupForm: document.getElementById('signup-form'),
    signupEmail: document.getElementById('signup-email'),
    signupPassword: document.getElementById('signup-password'),
    signupConfirmPassword: document.getElementById('signup-confirm-password'),
    signupTerms: document.getElementById('signup-terms'),
    signupEmailError: document.getElementById('signup-email-error'),
    signupPasswordError: document.getElementById('signup-password-error'),
    signupConfirmError: document.getElementById('signup-confirm-error'),
    signupTermsError: document.getElementById('signup-terms-error'),
    signupError: document.getElementById('signup-error'),
    signupBtn: document.getElementById('signup-btn'),
    gotoLoginFromSignup: document.getElementById('goto-login-from-signup'),

    // Confirm Sent Screen
    backToLoginFromSent: document.getElementById('back-to-login-from-sent'),

    // Forgot Password Form
    forgotForm: document.getElementById('forgot-form'),
    forgotEmail: document.getElementById('forgot-email'),
    forgotEmailError: document.getElementById('forgot-email-error'),
    forgotError: document.getElementById('forgot-error'),
    forgotSuccess: document.getElementById('forgot-success'),
    forgotBtn: document.getElementById('forgot-btn'),
    gotoLoginFromForgot: document.getElementById('goto-login-from-forgot'),

    // Password Recovery Form
    recoveryForm: document.getElementById('recovery-form'),
    recoveryPassword: document.getElementById('recovery-password'),
    recoveryConfirmPassword: document.getElementById('recovery-confirm-password'),
    recoveryPasswordError: document.getElementById('recovery-password-error'),
    recoveryConfirmError: document.getElementById('recovery-confirm-error'),
    recoveryError: document.getElementById('recovery-error'),
    recoveryBtn: document.getElementById('recovery-btn'),

    // First-Time Setup Form
    setupForm: document.getElementById('setup-form'),
    setupBusinessName: document.getElementById('setup-business-name'),
    setupNameError: document.getElementById('setup-name-error'),
    setupCurrency: document.getElementById('setup-currency'),
    setupCustomCurrencyGroup: document.getElementById('setup-custom-currency-group'),
    setupCurrencyCustom: document.getElementById('setup-currency-custom'),
    setupCurrencyError: document.getElementById('setup-currency-error'),
    setupFormError: document.getElementById('setup-form-error'),
    setupSubmitBtn: document.getElementById('setup-submit-btn'),

    // Bottom Navigation
    navItems: document.querySelectorAll('.nav-item'),

    // Screens Content
    screenIncome: document.getElementById('screen-income'),
    screenExpense: document.getElementById('screen-expense'),
    screenSummary: document.getElementById('screen-summary'),

    // Income Form & List
    incomeFormTitle: document.getElementById('income-form-title'),
    incomeForm: document.getElementById('income-form'),
    incomeEditId: document.getElementById('income-edit-id'),
    incomeDate: document.getElementById('income-date'),
    incomeAmount: document.getElementById('income-amount'),
    incomeNote: document.getElementById('income-note'),
    incomeDateError: document.getElementById('income-date-error'),
    incomeAmountError: document.getElementById('income-amount-error'),
    incomeFormError: document.getElementById('income-form-error'),
    incomeSubmitBtn: document.getElementById('income-submit-btn'),
    incomeCancelBtn: document.getElementById('income-cancel-btn'),
    incomeSkeleton: document.getElementById('income-skeleton'),
    incomeEmpty: document.getElementById('income-empty'),
    incomeList: document.getElementById('income-list'),

    // Expense Form & List
    expenseFormTitle: document.getElementById('expense-form-title'),
    expenseForm: document.getElementById('expense-form'),
    expenseEditId: document.getElementById('expense-edit-id'),
    expenseDate: document.getElementById('expense-date'),
    expenseTotal: document.getElementById('expense-total'),
    expenseDateError: document.getElementById('expense-date-error'),
    expenseTotalError: document.getElementById('expense-total-error'),
    expenseFormError: document.getElementById('expense-form-error'),
    expenseSubmitBtn: document.getElementById('expense-submit-btn'),
    expenseCancelBtn: document.getElementById('expense-cancel-btn'),
    breakdownHelper: document.getElementById('breakdown-helper'),
    breakdownItemsList: document.getElementById('breakdown-items-list'),
    addBreakdownLineBtn: document.getElementById('add-breakdown-line-btn'),
    breakdownError: document.getElementById('breakdown-error'),
    expenseSkeleton: document.getElementById('expense-skeleton'),
    expenseEmpty: document.getElementById('expense-empty'),
    expenseList: document.getElementById('expense-list'),

    // Summary Screen
    segmentBtns: document.querySelectorAll('.segment-btn'),
    pickerDailyWrapper: document.getElementById('picker-daily-wrapper'),
    pickerMonthlyWrapper: document.getElementById('picker-monthly-wrapper'),
    pickerYearlyWrapper: document.getElementById('picker-yearly-wrapper'),
    summaryDate: document.getElementById('summary-date'),
    summaryMonth: document.getElementById('summary-month'),
    summaryYear: document.getElementById('summary-year'),
    sumIncome: document.getElementById('sum-income'),
    sumExpense: document.getElementById('sum-expense'),
    cardProfit: document.getElementById('card-profit'),
    sumProfit: document.getElementById('sum-profit'),

    // Delete Dialog
    deleteDialog: document.getElementById('delete-dialog'),
    dialogTitle: document.getElementById('dialog-title'),
    dialogDetails: document.getElementById('dialog-details'),
    dialogCancelBtn: document.getElementById('dialog-cancel-btn'),
    dialogConfirmBtn: document.getElementById('dialog-confirm-btn'),

    // Toast
    toast: document.getElementById('toast')
  };

  // --- Device ID Helper ---
  function getOrCreateDeviceId() {
    let id = localStorage.getItem('lab_phone_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('lab_phone_device_id', id);
    }
    return id;
  }

  // --- Currency & Number Formatting ---
  // Formats amounts using chosen currency code.
  // Uses Intl.NumberFormat when the code is a valid ISO 4217 currency code;
  // otherwise displays the formatted number followed by the currency code.
  // Display only; stored values are numeric and never change.
  function formatCurrency(num, customCode) {
    const val = Number(num) || 0;
    const code = (customCode || (state.profile && state.profile.currency) || '').trim().toUpperCase();

    if (code) {
      try {
        const formatter = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return formatter.format(val);
      } catch {
        // Not a valid ISO 4217 code -> format number and append code
        const formattedNum = val.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        return `${formattedNum} ${code}`;
      }
    }

    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function round2(num) {
    return Math.round((Number(num) || 0) * 100) / 100;
  }

  function getLocalTodayISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getLocalMonthISO() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  function formatDisplayTime(isoString) {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  }

  // --- Toast Notifications ---
  let toastTimer = null;
  function showToast(message, type = 'info') {
    if (!el.toast) return;
    clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.className = 'toast';
    if (type === 'error') {
      el.toast.classList.add('toast-error');
    }
    el.toast.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      el.toast.classList.add('hidden');
    }, 3800);
  }

  // --- Online / Offline Handling ---
  function updateOnlineStatus() {
    state.isOffline = !navigator.onLine;
    if (state.isOffline) {
      el.offlineBanner.classList.remove('hidden');
    } else {
      el.offlineBanner.classList.add('hidden');
    }
    updateActionButtonsState();
  }

  function updateActionButtonsState() {
    const disabled = Boolean(state.isOffline || state.isSubmitting);
    
    if (el.incomeSubmitBtn) el.incomeSubmitBtn.disabled = disabled;
    if (el.expenseSubmitBtn) el.expenseSubmitBtn.disabled = disabled;

    document.querySelectorAll('.btn-action').forEach(btn => {
      btn.disabled = disabled;
    });
  }

  window.addEventListener('online', () => {
    updateOnlineStatus();
    showToast('Back online.');
    if (state.user && state.profile) {
      loadAllData();
    }
  });

  window.addEventListener('offline', () => {
    updateOnlineStatus();
    showToast('You are offline. Saving is turned off.', 'error');
  });

  // --- Button Loading Spinner Helper ---
  function setButtonBusy(button, isBusy) {
    if (!button) return;
    const spinner = button.querySelector('.btn-spinner');
    if (isBusy) {
      button.setAttribute('aria-busy', 'true');
      button.disabled = true;
      if (spinner) spinner.classList.remove('hidden');
    } else {
      button.removeAttribute('aria-busy');
      button.disabled = Boolean(state.isOffline);
      if (spinner) spinner.classList.add('hidden');
    }
  }

  // --- Supabase Client Initialization ---
  const config = window.SUPABASE_CONFIG || {};
  const supabaseUrl = config.SUPABASE_URL || (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '');
  const supabaseKey = config.SUPABASE_KEY || (typeof SUPABASE_KEY !== 'undefined' ? SUPABASE_KEY : '');

  const supabaseFactory = (typeof window !== 'undefined' && window.supabase) ||
                          (typeof supabase !== 'undefined' ? supabase : null);

  let supabase = null;
  let supabaseInitError = null;

  if (!supabaseUrl || !supabaseKey || supabaseKey === 'PASTE_PUBLISHABLE_KEY_HERE') {
    console.warn('Supabase credentials not configured in config.js');
  } else if (!supabaseFactory || typeof supabaseFactory.createClient !== 'function') {
    supabaseInitError = 'Supabase library not loaded. Ensure vendor/supabase.js is available.';
    console.error(supabaseInitError);
  } else {
    try {
      supabase = supabaseFactory.createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (err) {
      supabaseInitError = err.message;
      console.error('Failed to initialize Supabase client:', err.message);
    }
  }

  // --- Privacy & Safety: Clear All User Data ---
  // On logout or user change, clears every list, form, and in-memory value
  // so a second user on the same phone never sees the first user's data.
  function clearAllUserData() {
    state.user = null;
    state.profile = null;
    state.income = [];
    state.expenses = [];
    state.expenseItems = [];
    state.deleteTarget = null;
    state.isSubmitting = false;

    // Reset forms
    if (el.loginForm) el.loginForm.reset();
    if (el.signupForm) el.signupForm.reset();
    if (el.forgotForm) el.forgotForm.reset();
    if (el.recoveryForm) el.recoveryForm.reset();
    if (el.setupForm) el.setupForm.reset();
    if (el.accountForm) el.accountForm.reset();
    cancelEditIncome();
    cancelEditExpense();

    // Clear lists in DOM
    if (el.incomeList) el.incomeList.replaceChildren();
    if (el.expenseList) el.expenseList.replaceChildren();
    if (el.breakdownItemsList) el.breakdownItemsList.replaceChildren();
    if (el.incomeEmpty) el.incomeEmpty.classList.remove('hidden');
    if (el.expenseEmpty) el.expenseEmpty.classList.remove('hidden');

    // Reset summary displays safely via textContent
    if (el.sumIncome) el.sumIncome.textContent = '0.00';
    if (el.sumExpense) el.sumExpense.textContent = '0.00';
    if (el.sumProfit) {
      el.sumProfit.textContent = '+0.00';
      el.sumProfit.className = 'card-summary-value profit-positive';
    }

    // Reset header & account panel displays
    if (el.headerBrandName) el.headerBrandName.textContent = 'Money Tracker';
    if (el.accountBtnLabel) el.accountBtnLabel.textContent = 'Account';
    if (el.accountEmailDisplay) el.accountEmailDisplay.textContent = '';
    if (el.accountBusinessDisplay) el.accountBusinessDisplay.textContent = '';

    // Close any dialogs or panels
    closeAccountPanel();
    closeDeleteDialog();

    // Clear inline errors
    clearAuthErrors();
    if (el.loginUnconfirmedBox) el.loginUnconfirmedBox.classList.add('hidden');
    if (el.setupFormError) el.setupFormError.classList.add('hidden');
    if (el.accountFormError) el.accountFormError.classList.add('hidden');
  }

  function clearAuthErrors() {
    const errorEls = [
      el.loginEmailError, el.loginPasswordError, el.loginError,
      el.signupEmailError, el.signupPasswordError, el.signupConfirmError, el.signupTermsError, el.signupError,
      el.forgotEmailError, el.forgotError, el.forgotSuccess,
      el.recoveryPasswordError, el.recoveryConfirmError, el.recoveryError,
      el.setupNameError, el.setupCurrencyError, el.setupFormError,
      el.accountNameError, el.accountCurrencyError, el.accountFormError
    ];
    errorEls.forEach(target => {
      if (target) {
        target.classList.add('hidden');
        target.textContent = '';
      }
    });
  }

  // --- Auth View Switching ---
  function showAuthView(viewName) {
    state.currentAuthView = viewName;
    clearAuthErrors();

    if (el.loginUnconfirmedBox) el.loginUnconfirmedBox.classList.add('hidden');

    el.viewLogin.classList.toggle('hidden', viewName !== 'login');
    el.viewSignup.classList.toggle('hidden', viewName !== 'signup');
    el.viewConfirmSent.classList.toggle('hidden', viewName !== 'confirm-sent');
    el.viewForgot.classList.toggle('hidden', viewName !== 'forgot');
    el.viewRecovery.classList.toggle('hidden', viewName !== 'recovery');
  }

  // --- Auth Flow ---
  async function initAuth() {
    if (!supabase) {
      el.loginError.textContent = supabaseInitError
        ? ('Supabase initialization failed: ' + supabaseInitError)
        : 'Configuration required: please configure your Supabase publishable key in config.js.';
      el.loginError.classList.remove('hidden');
      return;
    }

    // Check if recovery link was opened
    if (window.location.hash.includes('type=recovery')) {
      state.isPasswordRecovery = true;
      showAuthScreen();
      showAuthView('recovery');
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        showToast(error.message, 'error');
        showAuthScreen();
      } else if (data && data.session && data.session.user) {
        if (!state.isPasswordRecovery) {
          await handleUserSignedIn(data.session.user);
        }
      } else {
        if (!state.isPasswordRecovery) {
          showAuthScreen();
        }
      }
    } catch (err) {
      showToast('Authentication initialization failed: ' + err.message, 'error');
      showAuthScreen();
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        state.isPasswordRecovery = true;
        showAuthScreen();
        showAuthView('recovery');
        return;
      }

      if (event === 'SIGNED_OUT') {
        handleUserSignedOut();
        return;
      }

      if (session && session.user) {
        if (!state.isPasswordRecovery) {
          await handleUserSignedIn(session.user);
        }
      } else {
        if (!state.isPasswordRecovery) {
          handleUserSignedOut();
        }
      }
    });
  }

  function showAuthScreen() {
    el.authScreen.classList.remove('hidden');
    el.setupScreen.classList.add('hidden');
    el.appContainer.classList.add('hidden');
    showAuthView(state.isPasswordRecovery ? 'recovery' : 'login');
  }

  function handleUserSignedOut() {
    clearAllUserData();
    showAuthScreen();
  }

  async function handleUserSignedIn(user) {
    if (!user) {
      handleUserSignedOut();
      return;
    }

    // If another user was previously signed in on the same phone, clear all old data
    if (state.user && state.user.id !== user.id) {
      clearAllUserData();
    }
    state.user = user;

    // Read user's profiles row
    let profile = null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch warning:', error.message);
      }
      profile = data;
    } catch (err) {
      console.warn('Profile fetch exception:', err.message);
    }

    // Check if first-time setup is needed
    const needsSetup = !profile || !profile.business_name || !profile.business_name.trim() || !profile.currency || !profile.currency.trim();

    if (needsSetup) {
      state.profile = profile || { user_id: user.id, business_name: '', currency: '' };
      showSetupScreen();
    } else {
      state.profile = profile;
      openApp();
    }
  }

  function showSetupScreen() {
    el.authScreen.classList.add('hidden');
    el.appContainer.classList.add('hidden');
    el.setupScreen.classList.remove('hidden');

    el.setupBusinessName.value = (state.profile && state.profile.business_name) || '';

    const currentCurrency = (state.profile && state.profile.currency) || 'PKR';
    const standardCurrencies = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'BDT'];

    if (standardCurrencies.includes(currentCurrency)) {
      el.setupCurrency.value = currentCurrency;
      el.setupCustomCurrencyGroup.classList.add('hidden');
      el.setupCurrencyCustom.value = '';
    } else if (currentCurrency) {
      el.setupCurrency.value = 'OTHER';
      el.setupCustomCurrencyGroup.classList.remove('hidden');
      el.setupCurrencyCustom.value = currentCurrency;
    } else {
      el.setupCurrency.value = 'PKR';
      el.setupCustomCurrencyGroup.classList.add('hidden');
      el.setupCurrencyCustom.value = '';
    }
  }

  function openApp() {
    el.authScreen.classList.add('hidden');
    el.setupScreen.classList.add('hidden');
    el.appContainer.classList.remove('hidden');

    updateHeaderAndAccountInfo();

    // Initialize form dates to today if empty
    const today = getLocalTodayISO();
    if (!el.incomeDate.value) el.incomeDate.value = today;
    if (!el.expenseDate.value) el.expenseDate.value = today;
    if (!el.summaryDate.value) el.summaryDate.value = today;
    if (!el.summaryMonth.value) el.summaryMonth.value = getLocalMonthISO();
    if (!el.summaryYear.value) el.summaryYear.value = new Date().getFullYear();

    updateBreakdownCalculation();
    loadAllData();
  }

  function updateHeaderAndAccountInfo() {
    const bizName = (state.profile && state.profile.business_name) || 'Money Tracker';
    const email = (state.user && state.user.email) || '';

    // Render safely with textContent
    if (el.headerBrandName) el.headerBrandName.textContent = bizName;
    if (el.accountBtnLabel) el.accountBtnLabel.textContent = bizName;
    if (el.accountEmailDisplay) el.accountEmailDisplay.textContent = email;
    if (el.accountBusinessDisplay) el.accountBusinessDisplay.textContent = bizName;

    // Account form values
    if (el.accountBusinessName) el.accountBusinessName.value = bizName;

    const currentCurrency = (state.profile && state.profile.currency) || 'PKR';
    const standardCurrencies = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'BDT'];

    if (standardCurrencies.includes(currentCurrency)) {
      if (el.accountCurrency) el.accountCurrency.value = currentCurrency;
      if (el.accountCustomCurrencyGroup) el.accountCustomCurrencyGroup.classList.add('hidden');
      if (el.accountCurrencyCustom) el.accountCurrencyCustom.value = '';
    } else {
      if (el.accountCurrency) el.accountCurrency.value = 'OTHER';
      if (el.accountCustomCurrencyGroup) el.accountCustomCurrencyGroup.classList.remove('hidden');
      if (el.accountCurrencyCustom) el.accountCurrencyCustom.value = currentCurrency;
    }
  }

  // --- Auth View Nav Buttons ---
  el.gotoSignupBtn.addEventListener('click', () => showAuthView('signup'));
  el.gotoForgotBtn.addEventListener('click', () => showAuthView('forgot'));
  el.gotoLoginFromSignup.addEventListener('click', () => showAuthView('login'));
  el.gotoLoginFromForgot.addEventListener('click', () => showAuthView('login'));
  el.backToLoginFromSent.addEventListener('click', () => showAuthView('login'));

  // --- 1. Login Form Submission ---
  el.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthErrors();

    const email = el.loginEmail.value.trim();
    const password = el.loginPassword.value;

    let hasError = false;
    if (!email) {
      el.loginEmailError.textContent = 'Please enter your email.';
      el.loginEmailError.classList.remove('hidden');
      hasError = true;
    }
    if (!password) {
      el.loginPasswordError.textContent = 'Please enter your password.';
      el.loginPasswordError.classList.remove('hidden');
      if (!hasError) el.loginPassword.focus();
      hasError = true;
    }
    if (hasError) return;

    if (!supabase) {
      el.loginError.textContent = supabaseInitError
        ? ('Supabase initialization failed: ' + supabaseInitError)
        : 'Supabase client is not configured. Check config.js.';
      el.loginError.classList.remove('hidden');
      return;
    }

    setButtonBusy(el.loginBtn, true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('email not confirmed') || error.code === 'email_not_confirmed') {
          el.loginUnconfirmedBox.classList.remove('hidden');
          el.loginUnconfirmedMsg.textContent = 'Your email address has not been confirmed yet.';
        } else {
          el.loginError.textContent = error.message || 'Invalid email or password.';
          el.loginError.classList.remove('hidden');
        }
      } else {
        el.loginForm.reset();
        if (data && data.user) {
          await handleUserSignedIn(data.user);
        }
      }
    } catch (err) {
      el.loginError.textContent = 'Connection error. Please try again.';
      el.loginError.classList.remove('hidden');
    } finally {
      setButtonBusy(el.loginBtn, false);
    }
  });

  // Resend Confirmation Email Button
  el.resendConfirmationBtn.addEventListener('click', async () => {
    const email = el.loginEmail.value.trim();
    if (!email) {
      el.loginEmailError.textContent = 'Please enter your email above.';
      el.loginEmailError.classList.remove('hidden');
      el.loginEmail.focus();
      return;
    }

    setButtonBusy(el.resendConfirmationBtn, true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) {
        showToast(error.message || 'Failed to resend confirmation email.', 'error');
      } else {
        el.loginUnconfirmedMsg.textContent = 'Confirmation email sent. Please check your inbox.';
        showToast('Confirmation email sent.');
      }
    } catch (err) {
      showToast('Error resending confirmation email: ' + err.message, 'error');
    } finally {
      setButtonBusy(el.resendConfirmationBtn, false);
    }
  });

  // --- 2. Sign Up Form Submission ---
  el.signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthErrors();

    const email = el.signupEmail.value.trim();
    const password = el.signupPassword.value;
    const confirmPassword = el.signupConfirmPassword.value;
    const agreedTerms = el.signupTerms.checked;

    let firstInvalid = null;

    if (!email) {
      el.signupEmailError.textContent = 'Please enter a valid email.';
      el.signupEmailError.classList.remove('hidden');
      firstInvalid = el.signupEmail;
    }

    if (!password || password.length < 10) {
      el.signupPasswordError.textContent = 'Password must be at least 10 characters.';
      el.signupPasswordError.classList.remove('hidden');
      if (!firstInvalid) firstInvalid = el.signupPassword;
    }

    if (password !== confirmPassword) {
      el.signupConfirmError.textContent = 'Passwords do not match.';
      el.signupConfirmError.classList.remove('hidden');
      if (!firstInvalid) firstInvalid = el.signupConfirmPassword;
    }

    if (!agreedTerms) {
      el.signupTermsError.textContent = 'You must agree to the Terms and Privacy Policy.';
      el.signupTermsError.classList.remove('hidden');
      if (!firstInvalid) firstInvalid = el.signupTerms;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (!supabase) {
      el.signupError.textContent = 'Supabase client is not configured. Check config.js.';
      el.signupError.classList.remove('hidden');
      return;
    }

    setButtonBusy(el.signupBtn, true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        // If email already exists, show the same neutral message to avoid email enumeration
        if (
          msg.includes('already registered') ||
          msg.includes('already exists') ||
          msg.includes('user already exists') ||
          error.code === 'user_already_exists'
        ) {
          el.signupForm.reset();
          showAuthView('confirm-sent');
          return;
        }

        el.signupError.textContent = error.message || 'Error signing up. Please try again.';
        el.signupError.classList.remove('hidden');
        return;
      }

      // Success -> show neutral confirmation screen
      el.signupForm.reset();
      showAuthView('confirm-sent');
    } catch (err) {
      el.signupError.textContent = 'Connection error. Please try again.';
      el.signupError.classList.remove('hidden');
    } finally {
      setButtonBusy(el.signupBtn, false);
    }
  });

  // --- 3. Forgot Password Form Submission ---
  el.forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthErrors();

    const email = el.forgotEmail.value.trim();
    if (!email) {
      el.forgotEmailError.textContent = 'Please enter your email.';
      el.forgotEmailError.classList.remove('hidden');
      el.forgotEmail.focus();
      return;
    }

    if (!supabase) {
      el.forgotError.textContent = 'Supabase client is not configured. Check config.js.';
      el.forgotError.classList.remove('hidden');
      return;
    }

    setButtonBusy(el.forgotBtn, true);

    try {
      const baseUrl = window.location.origin + window.location.pathname;
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: baseUrl
      });

      // Always show neutral message so nobody can find out which emails are registered
      el.forgotSuccess.textContent = 'If this email has an account, we sent a link.';
      el.forgotSuccess.classList.remove('hidden');
      el.forgotError.classList.add('hidden');
    } catch {
      // Keep neutral message
      el.forgotSuccess.textContent = 'If this email has an account, we sent a link.';
      el.forgotSuccess.classList.remove('hidden');
      el.forgotError.classList.add('hidden');
    } finally {
      setButtonBusy(el.forgotBtn, false);
    }
  });

  // --- 4. Password Recovery Form Submission ---
  el.recoveryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAuthErrors();

    const password = el.recoveryPassword.value;
    const confirmPassword = el.recoveryConfirmPassword.value;

    let firstInvalid = null;

    if (!password || password.length < 10) {
      el.recoveryPasswordError.textContent = 'Password must be at least 10 characters.';
      el.recoveryPasswordError.classList.remove('hidden');
      firstInvalid = el.recoveryPassword;
    }

    if (password !== confirmPassword) {
      el.recoveryConfirmError.textContent = 'Passwords do not match.';
      el.recoveryConfirmError.classList.remove('hidden');
      if (!firstInvalid) firstInvalid = el.recoveryConfirmPassword;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (!supabase) {
      el.recoveryError.textContent = 'Supabase client is not configured. Check config.js.';
      el.recoveryError.classList.remove('hidden');
      return;
    }

    setButtonBusy(el.recoveryBtn, true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        el.recoveryError.textContent = error.message || 'Failed to update password.';
        el.recoveryError.classList.remove('hidden');
      } else {
        showToast('Password updated successfully.');
        state.isPasswordRecovery = false;

        // Clear hash from URL so it doesn't re-trigger recovery view
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        if (data && data.user) {
          await handleUserSignedIn(data.user);
        } else {
          showAuthView('login');
        }
      }
    } catch (err) {
      el.recoveryError.textContent = err.message || 'Connection error. Please try again.';
      el.recoveryError.classList.remove('hidden');
    } finally {
      setButtonBusy(el.recoveryBtn, false);
    }
  });

  // --- 5. First-Time Setup Currency Toggle & Form Submission ---
  el.setupCurrency.addEventListener('change', () => {
    if (el.setupCurrency.value === 'OTHER') {
      el.setupCustomCurrencyGroup.classList.remove('hidden');
      el.setupCurrencyCustom.focus();
    } else {
      el.setupCustomCurrencyGroup.classList.add('hidden');
      el.setupCurrencyCustom.value = '';
    }
  });

  el.setupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    el.setupNameError.classList.add('hidden');
    el.setupCurrencyError.classList.add('hidden');
    el.setupFormError.classList.add('hidden');

    const businessName = el.setupBusinessName.value.trim();
    let currency = el.setupCurrency.value;

    let firstInvalid = null;

    if (!businessName) {
      el.setupNameError.textContent = 'Business name is required.';
      el.setupNameError.classList.remove('hidden');
      firstInvalid = el.setupBusinessName;
    } else if (businessName.length > 100) {
      el.setupNameError.textContent = 'Business name must be at most 100 characters.';
      el.setupNameError.classList.remove('hidden');
      firstInvalid = el.setupBusinessName;
    }

    if (currency === 'OTHER') {
      const customCode = el.setupCurrencyCustom.value.trim().toUpperCase();
      if (!/^[A-Z]{2,8}$/.test(customCode)) {
        el.setupCurrencyError.textContent = 'Currency code must be 2 to 8 uppercase letters.';
        el.setupCurrencyError.classList.remove('hidden');
        if (!firstInvalid) firstInvalid = el.setupCurrencyCustom;
      } else {
        currency = customCode;
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (!supabase || !state.user) return;

    setButtonBusy(el.setupSubmitBtn, true);

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: businessName,
          currency: currency,
          updated_at: now
        })
        .eq('user_id', state.user.id);

      if (error) throw error;

      state.profile = {
        ...(state.profile || {}),
        user_id: state.user.id,
        business_name: businessName,
        currency: currency,
        updated_at: now
      };

      openApp();
    } catch (err) {
      el.setupFormError.textContent = err.message || 'Failed to save setup.';
      el.setupFormError.classList.remove('hidden');
    } finally {
      setButtonBusy(el.setupSubmitBtn, false);
    }
  });

  // --- 6. Account Panel Management ---
  function openAccountPanel() {
    updateHeaderAndAccountInfo();
    el.accountPanel.classList.remove('hidden');
    el.accountBackdrop.classList.remove('hidden');
    el.accountToggleBtn.setAttribute('aria-expanded', 'true');
    el.accountBusinessName.focus();
  }

  function closeAccountPanel() {
    el.accountPanel.classList.add('hidden');
    el.accountBackdrop.classList.add('hidden');
    el.accountToggleBtn.setAttribute('aria-expanded', 'false');
    el.accountFormError.classList.add('hidden');
    el.accountNameError.classList.add('hidden');
    el.accountCurrencyError.classList.add('hidden');
  }

  el.accountToggleBtn.addEventListener('click', () => {
    const isExpanded = el.accountToggleBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeAccountPanel();
    } else {
      openAccountPanel();
    }
  });

  el.accountCloseBtn.addEventListener('click', closeAccountPanel);
  el.accountBackdrop.addEventListener('click', closeAccountPanel);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.accountPanel.classList.contains('hidden')) {
      closeAccountPanel();
    }
  });

  el.accountCurrency.addEventListener('change', () => {
    if (el.accountCurrency.value === 'OTHER') {
      el.accountCustomCurrencyGroup.classList.remove('hidden');
      el.accountCurrencyCustom.focus();
    } else {
      el.accountCustomCurrencyGroup.classList.add('hidden');
      el.accountCurrencyCustom.value = '';
    }
  });

  el.accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    el.accountNameError.classList.add('hidden');
    el.accountCurrencyError.classList.add('hidden');
    el.accountFormError.classList.add('hidden');

    const businessName = el.accountBusinessName.value.trim();
    let currency = el.accountCurrency.value;

    let firstInvalid = null;

    if (!businessName) {
      el.accountNameError.textContent = 'Business name is required.';
      el.accountNameError.classList.remove('hidden');
      firstInvalid = el.accountBusinessName;
    } else if (businessName.length > 100) {
      el.accountNameError.textContent = 'Business name must be at most 100 characters.';
      el.accountNameError.classList.remove('hidden');
      firstInvalid = el.accountBusinessName;
    }

    if (currency === 'OTHER') {
      const customCode = el.accountCurrencyCustom.value.trim().toUpperCase();
      if (!/^[A-Z]{2,8}$/.test(customCode)) {
        el.accountCurrencyError.textContent = 'Currency code must be 2 to 8 uppercase letters.';
        el.accountCurrencyError.classList.remove('hidden');
        if (!firstInvalid) firstInvalid = el.accountCurrencyCustom;
      } else {
        currency = customCode;
      }
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (!supabase || !state.user) return;

    setButtonBusy(el.accountSaveBtn, true);

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: businessName,
          currency: currency,
          updated_at: now
        })
        .eq('user_id', state.user.id);

      if (error) throw error;

      state.profile = {
        ...(state.profile || {}),
        user_id: state.user.id,
        business_name: businessName,
        currency: currency,
        updated_at: now
      };

      updateHeaderAndAccountInfo();
      renderIncomeList();
      renderExpenseList();
      calculateSummary();
      updateBreakdownCalculation();

      showToast('Settings saved.');
      closeAccountPanel();
    } catch (err) {
      el.accountFormError.textContent = err.message || 'Failed to save settings.';
      el.accountFormError.classList.remove('hidden');
    } finally {
      setButtonBusy(el.accountSaveBtn, false);
    }
  });

  // Logout button
  el.logoutBtn.addEventListener('click', async () => {
    if (!supabase) {
      handleUserSignedOut();
      return;
    }
    try {
      await supabase.auth.signOut();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      handleUserSignedOut();
    }
  });

  // --- Screen Navigation ---
  el.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.target;
      switchScreen(target);
    });
  });

  function switchScreen(screenName) {
    state.currentScreen = screenName;

    el.navItems.forEach(item => {
      if (item.dataset.target === screenName) {
        item.setAttribute('aria-current', 'page');
        item.classList.add('active');
      } else {
        item.removeAttribute('aria-current');
        item.classList.remove('active');
      }
    });

    el.screenIncome.classList.toggle('hidden', screenName !== 'income');
    el.screenExpense.classList.toggle('hidden', screenName !== 'expense');
    el.screenSummary.classList.toggle('hidden', screenName !== 'summary');

    if (screenName === 'summary') {
      calculateSummary();
    }
  }

  // --- Data Loading ---
  async function loadAllData() {
    if (!supabase || !state.user) return;

    el.incomeSkeleton.classList.remove('hidden');
    el.expenseSkeleton.classList.remove('hidden');

    try {
      // 1. Fetch Income (RLS automatically scopes to current user)
      const { data: incomeData, error: incomeErr } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (incomeErr) throw incomeErr;
      state.income = incomeData || [];

      // 2. Fetch Expenses
      const { data: expenseData, error: expenseErr } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (expenseErr) throw expenseErr;
      state.expenses = expenseData || [];

      // 3. Fetch Expense Items
      const { data: itemsData, error: itemsErr } = await supabase
        .from('expense_items')
        .select('*');

      if (itemsErr) throw itemsErr;
      state.expenseItems = itemsData || [];

      renderIncomeList();
      renderExpenseList();
      calculateSummary();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('fetch')) {
        updateOnlineStatus();
      }
      showToast('Could not load data: ' + err.message, 'error');
    } finally {
      el.incomeSkeleton.classList.add('hidden');
      el.expenseSkeleton.classList.add('hidden');
      updateActionButtonsState();
    }
  }

  // --- Render Income List (Safe textContent) ---
  function renderIncomeList() {
    el.incomeList.replaceChildren();
    const entries = state.income;

    if (!entries || entries.length === 0) {
      el.incomeEmpty.classList.remove('hidden');
      return;
    }
    el.incomeEmpty.classList.add('hidden');

    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'entry-card';
      if (entry.deleted_at) {
        card.classList.add('is-deleted');
      }

      // Header row: Date and Amount
      const header = document.createElement('div');
      header.className = 'entry-card-header';

      const dateEl = document.createElement('span');
      dateEl.className = 'entry-date';
      dateEl.textContent = entry.date;
      header.appendChild(dateEl);

      const amountEl = document.createElement('span');
      amountEl.className = 'entry-amount income';
      amountEl.textContent = formatCurrency(entry.amount);
      header.appendChild(amountEl);

      card.appendChild(header);

      // Note (if any)
      if (entry.note) {
        const noteEl = document.createElement('div');
        noteEl.className = 'entry-note';
        noteEl.textContent = entry.note;
        card.appendChild(noteEl);
      }

      // Badges
      const badges = document.createElement('div');
      badges.className = 'entry-badges';

      if (entry.edited_on_both) {
        const conflictBadge = document.createElement('span');
        conflictBadge.className = 'badge badge-conflict';
        conflictBadge.textContent = 'Edited on both devices';
        badges.appendChild(conflictBadge);
      }

      if (entry.deleted_at) {
        const delBadge = document.createElement('span');
        delBadge.className = 'badge badge-deleted';
        delBadge.textContent = 'Deleted ' + formatDisplayTime(entry.deleted_at);
        badges.appendChild(delBadge);
      }

      if (badges.childNodes.length > 0) {
        card.appendChild(badges);
      }

      // Actions (only for active entries)
      if (!entry.deleted_at) {
        const actions = document.createElement('div');
        actions.className = 'entry-actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-action';
        editBtn.textContent = 'Edit';
        editBtn.disabled = state.isOffline;
        editBtn.addEventListener('click', () => startEditIncome(entry));
        actions.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn-action btn-action-delete';
        delBtn.textContent = 'Delete';
        delBtn.disabled = state.isOffline;
        delBtn.addEventListener('click', () => promptDelete('income', entry));
        actions.appendChild(delBtn);

        card.appendChild(actions);
      }

      el.incomeList.appendChild(card);
    });
  }

  // --- Render Expense List (Safe textContent) ---
  function renderExpenseList() {
    el.expenseList.replaceChildren();
    const entries = state.expenses;

    if (!entries || entries.length === 0) {
      el.expenseEmpty.classList.remove('hidden');
      return;
    }
    el.expenseEmpty.classList.add('hidden');

    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'entry-card';
      if (entry.deleted_at) {
        card.classList.add('is-deleted');
      }

      // Header row: Date and Amount
      const header = document.createElement('div');
      header.className = 'entry-card-header';

      const dateEl = document.createElement('span');
      dateEl.className = 'entry-date';
      dateEl.textContent = entry.date;
      header.appendChild(dateEl);

      const amountEl = document.createElement('span');
      amountEl.className = 'entry-amount expense';
      amountEl.textContent = formatCurrency(entry.total_amount);
      header.appendChild(amountEl);

      card.appendChild(header);

      // Breakdown Lines Preview (active lines for this expense)
      const lines = state.expenseItems.filter(i => i.expense_id === entry.id && !i.deleted_at);
      if (lines.length > 0) {
        const preview = document.createElement('div');
        preview.className = 'entry-lines-preview';

        lines.forEach(item => {
          const itemEl = document.createElement('div');
          itemEl.className = 'entry-line-item';

          const labelSpan = document.createElement('span');
          labelSpan.textContent = item.label || 'Item';
          itemEl.appendChild(labelSpan);

          const amtSpan = document.createElement('span');
          amtSpan.textContent = formatCurrency(item.amount);
          itemEl.appendChild(amtSpan);

          preview.appendChild(itemEl);
        });

        card.appendChild(preview);
      }

      // Badges
      const badges = document.createElement('div');
      badges.className = 'entry-badges';

      if (entry.edited_on_both) {
        const conflictBadge = document.createElement('span');
        conflictBadge.className = 'badge badge-conflict';
        conflictBadge.textContent = 'Edited on both devices';
        badges.appendChild(conflictBadge);
      }

      if (entry.deleted_at) {
        const delBadge = document.createElement('span');
        delBadge.className = 'badge badge-deleted';
        delBadge.textContent = 'Deleted ' + formatDisplayTime(entry.deleted_at);
        badges.appendChild(delBadge);
      }

      if (badges.childNodes.length > 0) {
        card.appendChild(badges);
      }

      // Actions (only for active entries)
      if (!entry.deleted_at) {
        const actions = document.createElement('div');
        actions.className = 'entry-actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-action';
        editBtn.textContent = 'Edit';
        editBtn.disabled = state.isOffline;
        editBtn.addEventListener('click', () => startEditExpense(entry));
        actions.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn-action btn-action-delete';
        delBtn.textContent = 'Delete';
        delBtn.disabled = state.isOffline;
        delBtn.addEventListener('click', () => promptDelete('expense', entry));
        actions.appendChild(delBtn);

        card.appendChild(actions);
      }

      el.expenseList.appendChild(card);
    });
  }

  // --- Add / Edit Income Handling ---
  function startEditIncome(entry) {
    el.incomeEditId.value = entry.id;
    el.incomeDate.value = entry.date;
    el.incomeAmount.value = entry.amount;
    el.incomeNote.value = entry.note || '';
    
    el.incomeFormTitle.textContent = 'Edit Income';
    el.incomeSubmitBtn.querySelector('.btn-text').textContent = 'Save changes';
    el.incomeCancelBtn.classList.remove('hidden');

    switchScreen('income');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    el.incomeAmount.focus();
  }

  function cancelEditIncome() {
    el.incomeEditId.value = '';
    el.incomeForm.reset();
    el.incomeDate.value = getLocalTodayISO();
    el.incomeFormTitle.textContent = 'Add Income';
    el.incomeSubmitBtn.querySelector('.btn-text').textContent = 'Save Income';
    el.incomeCancelBtn.classList.add('hidden');
    el.incomeDateError.classList.add('hidden');
    el.incomeAmountError.classList.add('hidden');
    el.incomeFormError.classList.add('hidden');
  }

  el.incomeCancelBtn.addEventListener('click', cancelEditIncome);

  if (el.incomeDate) {
    el.incomeDate.addEventListener('input', () => {
      el.incomeDateError.classList.add('hidden');
      el.incomeFormError.classList.add('hidden');
    });
  }
  if (el.incomeAmount) {
    el.incomeAmount.addEventListener('input', () => {
      el.incomeAmountError.classList.add('hidden');
      el.incomeFormError.classList.add('hidden');
    });
  }

  el.incomeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.isOffline) {
      showToast('You are offline. Saving is turned off.', 'error');
      return;
    }

    el.incomeDateError.classList.add('hidden');
    el.incomeAmountError.classList.add('hidden');
    el.incomeFormError.classList.add('hidden');

    const dateVal = el.incomeDate.value.trim();
    const amountVal = parseFloat(el.incomeAmount.value);
    const noteVal = el.incomeNote.value.trim();
    const editId = el.incomeEditId.value;

    let firstInvalid = null;
    if (!dateVal) {
      el.incomeDateError.textContent = 'Please select a valid date.';
      el.incomeDateError.classList.remove('hidden');
      firstInvalid = el.incomeDate;
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      el.incomeAmountError.textContent = 'Amount must be a positive number.';
      el.incomeAmountError.classList.remove('hidden');
      if (!firstInvalid) firstInvalid = el.incomeAmount;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    state.isSubmitting = true;
    setButtonBusy(el.incomeSubmitBtn, true);

    const now = new Date().toISOString();

    try {
      if (editId) {
        // Edit mode
        const oldEntry = state.income.find(i => i.id === editId);
        if (!oldEntry) throw new Error('Entry not found.');

        const updatedEntry = {
          ...oldEntry,
          date: dateVal,
          amount: round2(amountVal),
          note: noteVal || null,
          updated_at: now,
          device_id: state.deviceId
        };

        const { error: updateErr } = await supabase
          .from('income')
          .update({
            date: dateVal,
            amount: round2(amountVal),
            note: noteVal || null,
            updated_at: now,
            device_id: state.deviceId
          })
          .eq('id', editId);

        if (updateErr) {
          showToast(updateErr.message || 'Error updating income.', 'error');
          throw updateErr;
        }

        // Record history - Note: do NOT send user_id in inserts
        const historyRow = {
          id: crypto.randomUUID(),
          table_name: 'income',
          entry_id: editId,
          old_values: JSON.stringify(oldEntry),
          new_values: JSON.stringify(updatedEntry),
          changed_at: now,
          device_id: state.deviceId
        };

        const { error: histErr } = await supabase
          .from('entry_history')
          .insert([historyRow]);

        if (histErr) {
          showToast('Income updated, but history recording failed: ' + histErr.message, 'error');
        } else {
          showToast('Income updated successfully.');
        }

        cancelEditIncome();
      } else {
        // Create mode - Note: do NOT send user_id in inserts
        const newEntry = {
          id: crypto.randomUUID(),
          date: dateVal,
          amount: round2(amountVal),
          note: noteVal || null,
          created_at: now,
          updated_at: now,
          deleted_at: null,
          device_id: state.deviceId,
          edited_on_both: false
        };

        const { error: insertErr } = await supabase
          .from('income')
          .insert([newEntry]);

        if (insertErr) {
          showToast(insertErr.message || 'Error saving income.', 'error');
          throw insertErr;
        }

        showToast('Income saved.');
        cancelEditIncome();
      }

      await loadAllData();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('fetch')) {
        updateOnlineStatus();
      }
      el.incomeFormError.textContent = err.message || 'Failed to save income.';
      el.incomeFormError.classList.remove('hidden');
      showToast(err.message || 'Error saving income.', 'error');
    } finally {
      state.isSubmitting = false;
      setButtonBusy(el.incomeSubmitBtn, false);
      updateActionButtonsState();
    }
  });

  // --- Breakdown Lines Management ---
  function createBreakdownRow(label = '', amount = '', itemId = null) {
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    if (itemId) {
      row.dataset.itemId = itemId;
    }

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.className = 'breakdown-label';
    labelInput.placeholder = 'Item label';
    labelInput.value = label;
    labelInput.maxLength = 100;
    labelInput.setAttribute('aria-label', 'Breakdown line label');
    labelInput.addEventListener('input', updateBreakdownCalculation);

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'breakdown-amount';
    amountInput.step = '0.01';
    amountInput.min = '0.01';
    amountInput.inputMode = 'decimal';
    amountInput.placeholder = '0.00';
    amountInput.value = amount;
    amountInput.setAttribute('aria-label', 'Breakdown line amount');
    amountInput.addEventListener('input', updateBreakdownCalculation);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-line';
    removeBtn.setAttribute('aria-label', 'Remove line');

    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('viewBox', '0 0 24 24');
    svgIcon.setAttribute('width', '18');
    svgIcon.setAttribute('height', '18');
    svgIcon.setAttribute('fill', 'none');
    svgIcon.setAttribute('stroke', 'currentColor');
    svgIcon.setAttribute('stroke-width', '2');
    svgIcon.setAttribute('stroke-linecap', 'round');
    svgIcon.setAttribute('stroke-linejoin', 'round');
    svgIcon.setAttribute('aria-hidden', 'true');

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.setAttribute('x1', '18');
    line1.setAttribute('y1', '6');
    line1.setAttribute('x2', '6');
    line1.setAttribute('y2', '18');

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', '6');
    line2.setAttribute('y1', '6');
    line2.setAttribute('x2', '18');
    line2.setAttribute('y2', '18');

    svgIcon.appendChild(line1);
    svgIcon.appendChild(line2);
    removeBtn.appendChild(svgIcon);

    removeBtn.addEventListener('click', () => {
      row.remove();
      updateBreakdownCalculation();
    });

    row.appendChild(labelInput);
    row.appendChild(amountInput);
    row.appendChild(removeBtn);

    return row;
  }

  el.addBreakdownLineBtn.addEventListener('click', () => {
    const row = createBreakdownRow();
    el.breakdownItemsList.appendChild(row);
    const amountInput = row.querySelector('.breakdown-amount');
    if (amountInput) amountInput.focus();
    updateBreakdownCalculation();
  });

  function updateBreakdownCalculation() {
    const totalVal = parseFloat(el.expenseTotal.value) || 0;
    const totalRounded = round2(totalVal);

    let sum = 0;
    const rows = el.breakdownItemsList.querySelectorAll('.breakdown-row');
    rows.forEach(r => {
      const amtInput = r.querySelector('.breakdown-amount');
      const val = parseFloat(amtInput ? amtInput.value : 0) || 0;
      sum += round2(val);
    });

    const sumRounded = round2(sum);

    if (sumRounded > totalRounded) {
      const diff = round2(sumRounded - totalRounded);
      el.breakdownHelper.textContent = `Breakdown ${formatCurrency(sumRounded)} of ${formatCurrency(totalRounded)} (exceeds total by ${formatCurrency(diff)})`;
      el.breakdownHelper.classList.add('exceeded');
      el.breakdownError.textContent = 'Breakdown sum cannot exceed total expense amount.';
      el.breakdownError.classList.remove('hidden');
      return false;
    } else {
      el.breakdownHelper.textContent = `Breakdown ${formatCurrency(sumRounded)} of ${formatCurrency(totalRounded)}`;
      el.breakdownHelper.classList.remove('exceeded');
      el.breakdownError.textContent = '';
      el.breakdownError.classList.add('hidden');
      return true;
    }
  }

  if (el.expenseDate) {
    el.expenseDate.addEventListener('input', () => {
      el.expenseDateError.classList.add('hidden');
      el.expenseFormError.classList.add('hidden');
    });
  }

  if (el.expenseTotal) {
    el.expenseTotal.addEventListener('input', () => {
      el.expenseTotalError.classList.add('hidden');
      el.expenseFormError.classList.add('hidden');
      updateBreakdownCalculation();
    });
    el.expenseTotal.addEventListener('change', updateBreakdownCalculation);
  }

  // --- Add / Edit Expense Handling ---
  function startEditExpense(entry) {
    el.expenseEditId.value = entry.id;
    el.expenseDate.value = entry.date;
    el.expenseTotal.value = entry.total_amount;
    
    el.breakdownItemsList.replaceChildren();
    const lines = state.expenseItems.filter(i => i.expense_id === entry.id && !i.deleted_at);
    lines.forEach(item => {
      const row = createBreakdownRow(item.label || '', item.amount, item.id);
      el.breakdownItemsList.appendChild(row);
    });

    el.expenseFormTitle.textContent = 'Edit Expense';
    el.expenseSubmitBtn.querySelector('.btn-text').textContent = 'Save changes';
    el.expenseCancelBtn.classList.remove('hidden');

    updateBreakdownCalculation();
    switchScreen('expense');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    el.expenseTotal.focus();
  }

  function cancelEditExpense() {
    el.expenseEditId.value = '';
    el.expenseForm.reset();
    el.expenseDate.value = getLocalTodayISO();
    el.breakdownItemsList.replaceChildren();
    el.expenseFormTitle.textContent = 'Add Expense';
    el.expenseSubmitBtn.querySelector('.btn-text').textContent = 'Save Expense';
    el.expenseCancelBtn.classList.add('hidden');
    el.expenseDateError.classList.add('hidden');
    el.expenseTotalError.classList.add('hidden');
    el.expenseFormError.classList.add('hidden');
    el.breakdownError.classList.add('hidden');
    updateBreakdownCalculation();
  }

  el.expenseCancelBtn.addEventListener('click', cancelEditExpense);

  el.expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.isOffline) {
      showToast('You are offline. Saving is turned off.', 'error');
      return;
    }

    el.expenseDateError.classList.add('hidden');
    el.expenseTotalError.classList.add('hidden');
    el.expenseFormError.classList.add('hidden');
    el.breakdownError.classList.add('hidden');

    const dateVal = el.expenseDate.value.trim();
    const totalVal = parseFloat(el.expenseTotal.value);
    const editId = el.expenseEditId.value;

    let firstInvalid = null;
    if (!dateVal) {
      el.expenseDateError.textContent = 'Please select a valid date.';
      el.expenseDateError.classList.remove('hidden');
      firstInvalid = el.expenseDate;
    }
    if (isNaN(totalVal) || totalVal <= 0) {
      el.expenseTotalError.textContent = 'Total amount must be a positive number.';
      el.expenseTotalError.classList.remove('hidden');
      if (!firstInvalid) firstInvalid = el.expenseTotal;
    }

    // Strict Breakdown Rule validation
    const totalRounded = round2(totalVal || 0);
    let breakdownSum = 0;
    const formLines = [];
    let firstInvalidLineInput = null;

    const rows = el.breakdownItemsList.querySelectorAll('.breakdown-row');
    rows.forEach(r => {
      const labelInput = r.querySelector('.breakdown-label');
      const amtInput = r.querySelector('.breakdown-amount');
      const label = labelInput ? labelInput.value.trim() : '';
      const amtRaw = amtInput ? amtInput.value.trim() : '';
      const amt = parseFloat(amtRaw) || 0;
      const itemId = r.dataset.itemId || null;

      if (label && (isNaN(amt) || amt <= 0)) {
        if (!firstInvalidLineInput) firstInvalidLineInput = amtInput;
      }

      if (amt > 0 || label) {
        breakdownSum += round2(amt);
        formLines.push({
          id: itemId,
          label: label || 'Item',
          amount: round2(amt)
        });
      }
    });

    const sumRounded = round2(breakdownSum);
    if (sumRounded > totalRounded) {
      el.breakdownError.textContent = `Breakdown sum (${formatCurrency(sumRounded)}) cannot exceed total expense amount (${formatCurrency(totalRounded)}).`;
      el.breakdownError.classList.remove('hidden');
      el.breakdownHelper.classList.add('exceeded');
      if (!firstInvalid) {
        const firstAmt = el.breakdownItemsList.querySelector('.breakdown-amount');
        firstInvalid = firstAmt || el.expenseTotal;
      }
    } else if (firstInvalidLineInput && !firstInvalid) {
      el.breakdownError.textContent = 'Please enter a positive amount for breakdown lines.';
      el.breakdownError.classList.remove('hidden');
      firstInvalid = firstInvalidLineInput;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    state.isSubmitting = true;
    setButtonBusy(el.expenseSubmitBtn, true);

    const now = new Date().toISOString();

    try {
      if (editId) {
        // Edit mode
        const oldExpense = state.expenses.find(x => x.id === editId);
        if (!oldExpense) throw new Error('Expense not found.');

        const updatedExpense = {
          ...oldExpense,
          date: dateVal,
          total_amount: totalRounded,
          updated_at: now,
          device_id: state.deviceId
        };

        const { error: updateErr } = await supabase
          .from('expenses')
          .update({
            date: dateVal,
            total_amount: totalRounded,
            updated_at: now,
            device_id: state.deviceId
          })
          .eq('id', editId);

        if (updateErr) throw updateErr;

        // Entry history for expense - do NOT send user_id
        const historyRow = {
          id: crypto.randomUUID(),
          table_name: 'expenses',
          entry_id: editId,
          old_values: JSON.stringify(oldExpense),
          new_values: JSON.stringify(updatedExpense),
          changed_at: now,
          device_id: state.deviceId
        };

        const { error: histErr } = await supabase
          .from('entry_history')
          .insert([historyRow]);

        if (histErr) {
          showToast('Expense updated, but history recording failed: ' + histErr.message, 'error');
        }

        // Handle Breakdown lines diffing
        const oldActiveItems = state.expenseItems.filter(i => i.expense_id === editId && !i.deleted_at);
        const presentItemIds = new Set(formLines.map(l => l.id).filter(Boolean));

        // 1. Removed lines -> soft delete
        for (const oldItem of oldActiveItems) {
          if (!presentItemIds.has(oldItem.id)) {
            const updatedOldItem = {
              ...oldItem,
              deleted_at: now,
              updated_at: now,
              device_id: state.deviceId
            };

            await supabase
              .from('expense_items')
              .update({
                deleted_at: now,
                updated_at: now,
                device_id: state.deviceId
              })
              .eq('id', oldItem.id);

            const { error: itemHistErr } = await supabase
              .from('entry_history')
              .insert([{
                id: crypto.randomUUID(),
                table_name: 'expense_items',
                entry_id: oldItem.id,
                old_values: JSON.stringify(oldItem),
                new_values: JSON.stringify(updatedOldItem),
                changed_at: now,
                device_id: state.deviceId
              }]);

            if (itemHistErr) {
              showToast('History failed for removed item: ' + itemHistErr.message, 'error');
            }
          }
        }

        // 2. Updated or Newly added lines
        for (const line of formLines) {
          if (line.id) {
            // Existing item
            const oldItem = oldActiveItems.find(i => i.id === line.id);
            if (oldItem && (oldItem.label !== line.label || round2(oldItem.amount) !== line.amount)) {
              const updatedItem = {
                ...oldItem,
                label: line.label,
                amount: line.amount,
                updated_at: now,
                device_id: state.deviceId
              };

              await supabase
                .from('expense_items')
                .update({
                  label: line.label,
                  amount: line.amount,
                  updated_at: now,
                  device_id: state.deviceId
                })
                .eq('id', line.id);

              const { error: itemHistErr } = await supabase
                .from('entry_history')
                .insert([{
                  id: crypto.randomUUID(),
                  table_name: 'expense_items',
                  entry_id: line.id,
                  old_values: JSON.stringify(oldItem),
                  new_values: JSON.stringify(updatedItem),
                  changed_at: now,
                  device_id: state.deviceId
                }]);

              if (itemHistErr) {
                showToast('History failed for item update: ' + itemHistErr.message, 'error');
              }
            }
          } else {
            // New breakdown line - do NOT send user_id in inserts
            const newItemId = crypto.randomUUID();
            const newItem = {
              id: newItemId,
              expense_id: editId,
              label: line.label,
              amount: line.amount,
              created_at: now,
              updated_at: now,
              deleted_at: null,
              device_id: state.deviceId
            };

            await supabase
              .from('expense_items')
              .insert([newItem]);

            const { error: itemHistErr } = await supabase
              .from('entry_history')
              .insert([{
                id: crypto.randomUUID(),
                table_name: 'expense_items',
                entry_id: newItemId,
                old_values: null,
                new_values: JSON.stringify(newItem),
                changed_at: now,
                device_id: state.deviceId
              }]);

            if (itemHistErr) {
              showToast('History failed for new item: ' + itemHistErr.message, 'error');
            }
          }
        }

        showToast('Expense updated successfully.');
        cancelEditExpense();
      } else {
        // Create mode - do NOT send user_id in inserts
        const expenseId = crypto.randomUUID();
        const newExpense = {
          id: expenseId,
          date: dateVal,
          total_amount: totalRounded,
          created_at: now,
          updated_at: now,
          deleted_at: null,
          device_id: state.deviceId,
          edited_on_both: false
        };

        const { error: expErr } = await supabase
          .from('expenses')
          .insert([newExpense]);

        if (expErr) throw expErr;

        // Insert breakdown lines - do NOT send user_id in inserts
        if (formLines.length > 0) {
          const itemsToInsert = formLines.map(line => ({
            id: crypto.randomUUID(),
            expense_id: expenseId,
            label: line.label,
            amount: line.amount,
            created_at: now,
            updated_at: now,
            deleted_at: null,
            device_id: state.deviceId
          }));

          const { error: itemsErr } = await supabase
            .from('expense_items')
            .insert(itemsToInsert);

          if (itemsErr) {
            showToast('Expense saved, but lines failed: ' + itemsErr.message, 'error');
          }
        }

        showToast('Expense saved.');
        cancelEditExpense();
      }

      await loadAllData();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('fetch')) {
        updateOnlineStatus();
      }
      el.expenseFormError.textContent = err.message || 'Failed to save expense.';
      el.expenseFormError.classList.remove('hidden');
      showToast(err.message || 'Error saving expense.', 'error');
    } finally {
      state.isSubmitting = false;
      setButtonBusy(el.expenseSubmitBtn, false);
      updateActionButtonsState();
    }
  });

  // --- Delete Confirmation Dialog ---
  function promptDelete(type, item) {
    if (state.isOffline) {
      showToast('You are offline. Deleting is turned off.', 'error');
      return;
    }

    state.deleteTarget = { type, item };

    const typeLabel = type === 'income' ? 'Income' : 'Expense';
    const amountVal = type === 'income' ? item.amount : item.total_amount;

    el.dialogTitle.textContent = `Delete this ${typeLabel.toLowerCase()}?`;
    el.dialogDetails.textContent = `Date: ${item.date} • Amount: ${formatCurrency(amountVal)}`;

    if (typeof el.deleteDialog.showModal === 'function') {
      el.deleteDialog.showModal();
    } else {
      el.deleteDialog.setAttribute('open', '');
    }

    el.dialogCancelBtn.focus();
  }

  function closeDeleteDialog() {
    state.deleteTarget = null;
    if (typeof el.deleteDialog.close === 'function') {
      el.deleteDialog.close();
    } else {
      el.deleteDialog.removeAttribute('open');
    }
  }

  el.dialogCancelBtn.addEventListener('click', closeDeleteDialog);

  el.dialogConfirmBtn.addEventListener('click', async () => {
    if (!state.deleteTarget || state.isOffline) {
      closeDeleteDialog();
      return;
    }

    const { type, item } = state.deleteTarget;
    const now = new Date().toISOString();

    setButtonBusy(el.dialogConfirmBtn, true);

    try {
      if (type === 'income') {
        const updatedItem = {
          ...item,
          deleted_at: now,
          updated_at: now,
          device_id: state.deviceId
        };

        const { error: delErr } = await supabase
          .from('income')
          .update({
            deleted_at: now,
            updated_at: now,
            device_id: state.deviceId
          })
          .eq('id', item.id);

        if (delErr) throw delErr;

        // Entry history - do NOT send user_id
        const { error: histErr } = await supabase
          .from('entry_history')
          .insert([{
            id: crypto.randomUUID(),
            table_name: 'income',
            entry_id: item.id,
            old_values: JSON.stringify(item),
            new_values: JSON.stringify(updatedItem),
            changed_at: now,
            device_id: state.deviceId
          }]);

        if (histErr) {
          showToast('History failed: ' + histErr.message, 'error');
        } else {
          showToast('Income entry deleted.');
        }
      } else if (type === 'expense') {
        const updatedExpense = {
          ...item,
          deleted_at: now,
          updated_at: now,
          device_id: state.deviceId
        };

        // 1. Soft-delete expense
        const { error: delErr } = await supabase
          .from('expenses')
          .update({
            deleted_at: now,
            updated_at: now,
            device_id: state.deviceId
          })
          .eq('id', item.id);

        if (delErr) throw delErr;

        // Entry history for expense - do NOT send user_id
        const { error: histErr } = await supabase
          .from('entry_history')
          .insert([{
            id: crypto.randomUUID(),
            table_name: 'expenses',
            entry_id: item.id,
            old_values: JSON.stringify(item),
            new_values: JSON.stringify(updatedExpense),
            changed_at: now,
            device_id: state.deviceId
          }]);

        if (histErr) {
          showToast('History failed for expense: ' + histErr.message, 'error');
        }

        // 2. Mark active breakdown lines as deleted
        const activeLines = state.expenseItems.filter(i => i.expense_id === item.id && !i.deleted_at);
        for (const line of activeLines) {
          const updatedLine = {
            ...line,
            deleted_at: now,
            updated_at: now,
            device_id: state.deviceId
          };

          await supabase
            .from('expense_items')
            .update({
              deleted_at: now,
              updated_at: now,
              device_id: state.deviceId
            })
            .eq('id', line.id);

          const { error: lineHistErr } = await supabase
            .from('entry_history')
            .insert([{
              id: crypto.randomUUID(),
              table_name: 'expense_items',
              entry_id: line.id,
              old_values: JSON.stringify(line),
              new_values: JSON.stringify(updatedLine),
              changed_at: now,
              device_id: state.deviceId
            }]);

          if (lineHistErr) {
            showToast('History failed for expense line: ' + lineHistErr.message, 'error');
          }
        }

        showToast('Expense entry deleted.');
      }

      closeDeleteDialog();
      await loadAllData();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('fetch')) {
        updateOnlineStatus();
      }
      showToast('Failed to delete: ' + err.message, 'error');
      closeDeleteDialog();
    } finally {
      setButtonBusy(el.dialogConfirmBtn, false);
    }
  });

  // --- Summary Calculations ---
  el.segmentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      el.segmentBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      state.summaryPeriod = btn.dataset.period;

      el.pickerDailyWrapper.classList.toggle('hidden', state.summaryPeriod !== 'daily');
      el.pickerMonthlyWrapper.classList.toggle('hidden', state.summaryPeriod !== 'monthly');
      el.pickerYearlyWrapper.classList.toggle('hidden', state.summaryPeriod !== 'yearly');

      calculateSummary();
    });
  });

  el.summaryDate.addEventListener('change', calculateSummary);
  el.summaryMonth.addEventListener('change', calculateSummary);
  el.summaryYear.addEventListener('input', calculateSummary);

  function calculateSummary() {
    const period = state.summaryPeriod;
    let targetPrefix = '';

    if (period === 'daily') {
      targetPrefix = el.summaryDate.value || getLocalTodayISO();
    } else if (period === 'monthly') {
      targetPrefix = el.summaryMonth.value || getLocalMonthISO();
    } else if (period === 'yearly') {
      targetPrefix = String(el.summaryYear.value || new Date().getFullYear());
    }

    // Filter active (non-deleted) income
    const activeIncome = state.income.filter(item => {
      if (item.deleted_at) return false;
      if (!item.date) return false;
      return item.date.startsWith(targetPrefix);
    });

    // Filter active (non-deleted) expenses
    const activeExpenses = state.expenses.filter(item => {
      if (item.deleted_at) return false;
      if (!item.date) return false;
      return item.date.startsWith(targetPrefix);
    });

    const totalIncome = activeIncome.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalExpense = activeExpenses.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
    const netProfit = totalIncome - totalExpense;

    el.sumIncome.textContent = formatCurrency(totalIncome);
    el.sumExpense.textContent = formatCurrency(totalExpense);

    const sign = netProfit >= 0 ? '+' : '-';
    el.sumProfit.textContent = `${sign}${formatCurrency(Math.abs(netProfit))}`;

    if (netProfit >= 0) {
      el.sumProfit.className = 'card-summary-value profit-positive';
    } else {
      el.sumProfit.className = 'card-summary-value profit-negative';
    }
  }

  // --- Initial Setup on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    updateOnlineStatus();
    updateBreakdownCalculation();
    initAuth();
  });

})();
