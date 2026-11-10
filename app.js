// Lab Money Tracker - Phone Page
// Direct Supabase Client (Static / GitHub Pages compatible)

(function () {
  'use strict';

  // --- State ---
  const state = {
    user: null,
    deviceId: getOrCreateDeviceId(),
    currentScreen: 'income',
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
    authScreen: document.getElementById('auth-screen'),
    appContainer: document.getElementById('app-container'),
    userDisplay: document.getElementById('user-display'),
    logoutBtn: document.getElementById('logout-btn'),

    // Login Form
    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    loginEmailError: document.getElementById('login-email-error'),
    loginPasswordError: document.getElementById('login-password-error'),
    loginError: document.getElementById('login-error'),
    loginBtn: document.getElementById('login-btn'),

    // Bottom Navigation
    navItems: document.querySelectorAll('.nav-item'),

    // Screens
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

  // --- Number & Date Formatters ---
  function formatAmount(num) {
    const val = Number(num) || 0;
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
    const disabled = state.isOffline || state.isSubmitting;
    
    // Save/Submit buttons
    if (el.incomeSubmitBtn) el.incomeSubmitBtn.disabled = disabled;
    if (el.expenseSubmitBtn) el.expenseSubmitBtn.disabled = disabled;

    // Action buttons in list
    document.querySelectorAll('.btn-action').forEach(btn => {
      btn.disabled = disabled;
    });
  }

  window.addEventListener('online', () => {
    updateOnlineStatus();
    showToast('Back online.');
    if (state.user) {
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
      button.disabled = state.isOffline;
      if (spinner) spinner.classList.add('hidden');
    }
  }

  // --- Supabase Client Initialization ---
  const config = window.SUPABASE_CONFIG || {};
  const supabaseUrl = config.SUPABASE_URL || '';
  const supabaseKey = config.SUPABASE_KEY || '';

  let supabase = null;
  if (!supabaseUrl || !supabaseKey || supabaseKey === 'PASTE_PUBLISHABLE_KEY_HERE') {
    // Show configuration warning
    console.warn('Supabase credentials not configured in config.js');
  } else {
    try {
      supabase = window.supabase.createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err.message);
    }
  }

  // --- Auth Flow ---
  async function initAuth() {
    if (!supabase) {
      el.loginError.textContent = 'Configuration required: please configure your Supabase publishable key in config.js.';
      el.loginError.classList.remove('hidden');
      return;
    }

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        showToast(error.message, 'error');
        showAuthScreen();
      } else if (data && data.session) {
        handleUserSignedIn(data.session.user);
      } else {
        showAuthScreen();
      }
    } catch (err) {
      showToast('Authentication initialization failed: ' + err.message, 'error');
      showAuthScreen();
    }

    supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        handleUserSignedIn(session.user);
      } else {
        handleUserSignedOut();
      }
    });
  }

  function showAuthScreen() {
    el.authScreen.classList.remove('hidden');
    el.appContainer.classList.add('hidden');
    state.user = null;
  }

  function handleUserSignedIn(user) {
    state.user = user;
    el.authScreen.classList.add('hidden');
    el.appContainer.classList.remove('hidden');
    
    // Set user display email (safe textContent)
    if (el.userDisplay && user.email) {
      el.userDisplay.textContent = user.email;
    }

    // Initialize form dates to today
    const today = getLocalTodayISO();
    if (!el.incomeDate.value) el.incomeDate.value = today;
    if (!el.expenseDate.value) el.expenseDate.value = today;
    if (!el.summaryDate.value) el.summaryDate.value = today;
    if (!el.summaryMonth.value) el.summaryMonth.value = getLocalMonthISO();
    if (!el.summaryYear.value) el.summaryYear.value = new Date().getFullYear();

    loadAllData();
  }

  function handleUserSignedOut() {
    state.user = null;
    state.income = [];
    state.expenses = [];
    state.expenseItems = [];
    showAuthScreen();
  }

  // Login form submission
  el.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    el.loginError.classList.add('hidden');
    el.loginError.textContent = '';
    el.loginEmailError.classList.add('hidden');
    el.loginPasswordError.classList.add('hidden');

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
      el.loginError.textContent = 'Supabase client is not configured. Check config.js.';
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
        el.loginError.textContent = error.message || 'Invalid email or password.';
        el.loginError.classList.remove('hidden');
      } else {
        el.loginForm.reset();
      }
    } catch (err) {
      el.loginError.textContent = 'Connection error. Please try again.';
      el.loginError.classList.remove('hidden');
    } finally {
      setButtonBusy(el.loginBtn, false);
    }
  });

  // Logout button
  el.logoutBtn.addEventListener('click', async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      showToast(err.message, 'error');
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

    // Update bottom nav active state
    el.navItems.forEach(item => {
      if (item.dataset.target === screenName) {
        item.setAttribute('aria-current', 'page');
        item.classList.add('active');
      } else {
        item.removeAttribute('aria-current');
        item.classList.remove('active');
      }
    });

    // Toggle screen views
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

    // Show skeletons
    el.incomeSkeleton.classList.remove('hidden');
    el.expenseSkeleton.classList.remove('hidden');

    try {
      // 1. Fetch Income
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

      // Render UI
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

  // --- Render Income List ---
  function renderIncomeList() {
    el.incomeList.innerHTML = '';
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
      amountEl.textContent = formatAmount(entry.amount);
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

  // --- Render Expense List ---
  function renderExpenseList() {
    el.expenseList.innerHTML = '';
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
      amountEl.textContent = formatAmount(entry.total_amount);
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
          amtSpan.textContent = formatAmount(item.amount);
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

    let hasError = false;
    if (!dateVal) {
      el.incomeDateError.textContent = 'Please select a valid date.';
      el.incomeDateError.classList.remove('hidden');
      el.incomeDate.focus();
      hasError = true;
    }
    if (isNaN(amountVal) || amountVal <= 0) {
      el.incomeAmountError.textContent = 'Amount must be a positive number.';
      el.incomeAmountError.classList.remove('hidden');
      if (!hasError) el.incomeAmount.focus();
      hasError = true;
    }
    if (hasError) return;

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

        if (updateErr) throw updateErr;

        // Entry history
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
        // Create mode
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

        if (insertErr) throw insertErr;

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
      showToast('Error saving income: ' + err.message, 'error');
    } finally {
      state.isSubmitting = false;
      setButtonBusy(el.incomeSubmitBtn, false);
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

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'breakdown-amount';
    amountInput.step = '0.01';
    amountInput.min = '0.01';
    amountInput.inputMode = 'decimal';
    amountInput.placeholder = '0.00';
    amountInput.value = amount;
    amountInput.setAttribute('aria-label', 'Breakdown line amount');

    // Live update helper on change
    amountInput.addEventListener('input', updateBreakdownCalculation);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove-line';
    removeBtn.setAttribute('aria-label', 'Remove line');
    removeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
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
      sum += val;
    });

    const sumRounded = round2(sum);

    el.breakdownHelper.textContent = `Breakdown ${formatAmount(sumRounded)} of ${formatAmount(totalRounded)}`;

    if (sumRounded > totalRounded) {
      el.breakdownHelper.classList.add('exceeded');
      el.breakdownError.textContent = 'Breakdown sum cannot exceed total expense amount.';
      el.breakdownError.classList.remove('hidden');
      return false;
    } else {
      el.breakdownHelper.classList.remove('exceeded');
      el.breakdownError.textContent = '';
      el.breakdownError.classList.add('hidden');
      return true;
    }
  }

  el.expenseTotal.addEventListener('input', updateBreakdownCalculation);

  // --- Add / Edit Expense Handling ---
  function startEditExpense(entry) {
    el.expenseEditId.value = entry.id;
    el.expenseDate.value = entry.date;
    el.expenseTotal.value = entry.total_amount;
    
    // Clear and populate breakdown lines
    el.breakdownItemsList.innerHTML = '';
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
    el.breakdownItemsList.innerHTML = '';
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

    let hasError = false;
    if (!dateVal) {
      el.expenseDateError.textContent = 'Please select a valid date.';
      el.expenseDateError.classList.remove('hidden');
      el.expenseDate.focus();
      hasError = true;
    }
    if (isNaN(totalVal) || totalVal <= 0) {
      el.expenseTotalError.textContent = 'Total amount must be a positive number.';
      el.expenseTotalError.classList.remove('hidden');
      if (!hasError) el.expenseTotal.focus();
      hasError = true;
    }

    // Strict Breakdown Rule validation
    const totalRounded = round2(totalVal);
    let breakdownSum = 0;
    const formLines = [];

    const rows = el.breakdownItemsList.querySelectorAll('.breakdown-row');
    rows.forEach(r => {
      const labelInput = r.querySelector('.breakdown-label');
      const amtInput = r.querySelector('.breakdown-amount');
      const label = labelInput ? labelInput.value.trim() : '';
      const amt = parseFloat(amtInput ? amtInput.value : 0) || 0;
      const itemId = r.dataset.itemId || null;

      if (amt > 0 || label) {
        breakdownSum += amt;
        formLines.push({
          id: itemId,
          label: label || 'Item',
          amount: round2(amt)
        });
      }
    });

    const sumRounded = round2(breakdownSum);
    if (sumRounded > totalRounded) {
      el.breakdownError.textContent = 'Breakdown sum cannot exceed total expense amount.';
      el.breakdownError.classList.remove('hidden');
      hasError = true;
    }

    if (hasError) return;

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

        // Entry history for expense
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
            // New breakdown line
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
        // Create mode
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

        // Insert breakdown lines
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
      showToast('Error saving expense: ' + err.message, 'error');
    } finally {
      state.isSubmitting = false;
      setButtonBusy(el.expenseSubmitBtn, false);
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
    el.dialogDetails.textContent = `Date: ${item.date} • Amount: ${formatAmount(amountVal)}`;

    if (typeof el.deleteDialog.showModal === 'function') {
      el.deleteDialog.showModal();
    } else {
      // Fallback
      el.deleteDialog.setAttribute('open', '');
    }

    // Cancel is focused by default
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

        // Entry history
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

        // Entry history for expense
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

        // 2. Also mark active breakdown lines as deleted
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

    el.sumIncome.textContent = formatAmount(totalIncome);
    el.sumExpense.textContent = formatAmount(totalExpense);

    const sign = netProfit >= 0 ? '+' : '-';
    el.sumProfit.textContent = `${sign}${formatAmount(Math.abs(netProfit))}`;

    if (netProfit >= 0) {
      el.sumProfit.className = 'card-summary-value profit-positive';
    } else {
      el.sumProfit.className = 'card-summary-value profit-negative';
    }
  }

  // --- Initial Setup on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    updateOnlineStatus();
    initAuth();
  });

})();

