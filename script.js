document.addEventListener('DOMContentLoaded', () => {
    // --- 設定 ---
    const USER_PASSWORD = '06060325';     // ★★★★★ 弟さんのパスワードを設定 ★★★★★
    const ADMIN_PASSWORD = 'maito#2025_SecureKey!'; // ★★★★★ あなたの管理者パスワードを設定 ★★★★★

    // --- DOM要素の取得 ---
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const adminLoginButton = document.getElementById('admin-login-button');
    const togglePassword = document.getElementById('toggle-password');
    const errorMessage = document.getElementById('error-message');
    const themeToggle = document.getElementById('theme-toggle');
    // (カレンダー関連のDOM要素は変更なし)
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const monthYearEl = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const selectedDateEl = document.getElementById('selected-date');
    const statusTextEl = document.getElementById('status-text');
    const actionButton = document.getElementById('action-button');
    const rejectButton = document.getElementById('reject-button');


    // --- 状態管理 ---
    let currentDate = new Date();
    let selectedDate = null;
    let isAdmin = false; // 管理者モードかどうかのフラグ
    let rentalData = JSON.parse(localStorage.getItem('smartwatchRentalData')) || {};

    // --- 関数 ---

    // データの保存
    const saveData = () => {
        localStorage.setItem('smartwatchRentalData', JSON.stringify(rentalData));
    };

    // パスワードチェック
    const checkPassword = (mode) => {
        const password = passwordInput.value;
        const correctPassword = (mode === 'admin') ? ADMIN_PASSWORD : USER_PASSWORD;

        if (password === correctPassword) {
            isAdmin = (mode === 'admin');
            loginScreen.classList.remove('active');
            appScreen.classList.add('active');
            if (isAdmin) {
                document.body.classList.add('admin-mode');
            }
            renderCalendar();
        } else {
            errorMessage.textContent = 'パスワードが違います';
            passwordInput.value = '';
        }
    };
    
    // YYYY-MM-DD形式の文字列を返す
    const formatDateKey = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // カレンダーの描画
    const renderCalendar = () => {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYearEl.textContent = `${year}年 ${month + 1}月`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDay = firstDayOfMonth.getDay();
        const totalDays = lastDayOfMonth.getDate();

        // 今日の日付（時刻情報なし）
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < startDay; i++) {
            calendarGrid.appendChild(document.createElement('div')).classList.add('date-cell', 'empty');
        }

        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('div');
            cell.classList.add('date-cell');
            cell.textContent = day;
            
            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            const dateKey = formatDateKey(date);
            cell.dataset.dateKey = dateKey;

            // 過去の日付かどうか判定
            if (date < today) {
                cell.classList.add('past-date');
            }
            
            if (date.toDateString() === today.toDateString()) {
                cell.classList.add('today');
            }

            // ステータスに応じてクラスを設定
            const status = rentalData[dateKey];
            if (status === 'applied') {
                cell.classList.add('applied');
            } else if (status === 'rejected') {
                cell.classList.add('rejected');
            } else {
                cell.classList.add('not-applied');
            }
            
            calendarGrid.appendChild(cell);
        }
        updateDetailsPanel();
    };

    // 詳細パネルの更新
    const updateDetailsPanel = () => {
        // 管理者ボタンの表示制御
        const adminButtons = document.querySelectorAll('.admin-only');
        adminButtons.forEach(btn => btn.style.display = isAdmin ? 'inline-block' : 'none');
        
        if (!selectedDate) {
            selectedDateEl.textContent = '日付を選択してください';
            statusTextEl.textContent = '-';
            actionButton.disabled = true;
            rejectButton.disabled = true;
            actionButton.textContent = 'アクション';
            actionButton.className = '';
            return;
        }
        
        const date = new Date(selectedDate.replace(/-/g, '/'));
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        selectedDateEl.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${dayOfWeek})`;
        
        const status = rentalData[selectedDate];
        let statusMessage = '';
        
        actionButton.disabled = false;
        rejectButton.disabled = isAdmin;

        switch(status) {
            case 'applied':
                statusMessage = '申請済み';
                statusTextEl.style.color = 'var(--applied-color)';
                actionButton.textContent = '申請を取り消す';
                actionButton.className = 'cancel';
                break;
            case 'rejected':
                statusMessage = '棄却済み';
                statusTextEl.style.color = 'var(--rejected-color)';
                actionButton.textContent = isAdmin ? '棄却を解除' : '申請できません';
                actionButton.className = 'apply';
                if (!isAdmin) actionButton.disabled = true;
                rejectButton.disabled = true;
                break;
            default:
                statusMessage = '未申請';
                statusTextEl.style.color = 'var(--text-color)';
                actionButton.textContent = 'この日で申請する';
                actionButton.className = 'apply';
                break;
        }
        statusTextEl.textContent = statusMessage;
    };
    
    // --- イベントリスナー ---
    loginButton.addEventListener('click', () => checkPassword('user'));
    adminLoginButton.addEventListener('click', () => checkPassword('admin'));
    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkPassword('user'); });
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye-slash');
    });

    prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

    calendarGrid.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('date-cell') && !target.classList.contains('empty') && !target.classList.contains('past-date')) {
            const currentlySelected = document.querySelector('.date-cell.selected');
            if (currentlySelected) currentlySelected.classList.remove('selected');
            
            target.classList.add('selected');
            selectedDate = target.dataset.dateKey;
            updateDetailsPanel();
        }
    });
    
    actionButton.addEventListener('click', () => {
        if (!selectedDate) return;
        const status = rentalData[selectedDate];

        if (status === 'applied') { // 申請済み -> 未申請へ
            delete rentalData[selectedDate];
        } else if (status === 'rejected' && isAdmin) { // 棄却済み -> 未申請へ (管理者のみ)
            delete rentalData[selectedDate];
        } else if (!status) { // 未申請 -> 申請済みへ
            rentalData[selectedDate] = 'applied';
        }
        
        saveData();
        renderCalendar();
        document.querySelector(`[data-date-key="${selectedDate}"]`)?.classList.add('selected');
        updateDetailsPanel();
    });

    rejectButton.addEventListener('click', () => {
        if (!selectedDate || !isAdmin) return;
        rentalData[selectedDate] = 'rejected';
        saveData();
        renderCalendar();
        document.querySelector(`[data-date-key="${selectedDate}"]`)?.classList.add('selected');
        updateDetailsPanel();
    });

    // --- ダークモード処理 ---
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    };
    themeToggle.addEventListener('change', () => {
        const theme = themeToggle.checked ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        applyTheme(theme);
    });
    // 初期読み込み時にテーマを適用
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
});
