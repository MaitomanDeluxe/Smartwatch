document.addEventListener('DOMContentLoaded', () => {
    // --- 設定 ---
    const CORRECT_PASSWORD = '06060325'; // ★★★★★ ここに好きなパスワードを設定 ★★★★★

    // --- DOM要素の取得 ---
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app-screen');
    const passwordInput = document.getElementById('password-input');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const monthYearEl = document.getElementById('month-year');
    const calendarGrid = document.getElementById('calendar-grid');
    const selectedDateEl = document.getElementById('selected-date');
    const statusTextEl = document.getElementById('status-text');
    const actionButton = document.getElementById('action-button');

    // --- 状態管理 ---
    let currentDate = new Date();
    let selectedDate = null;
    let rentalData = JSON.parse(localStorage.getItem('smartwatchRentalData')) || {};

    // --- 関数 ---
    // データの保存
    const saveData = () => {
        localStorage.setItem('smartwatchRentalData', JSON.stringify(rentalData));
    };

    // パスワードチェック
    const checkPassword = () => {
        if (passwordInput.value === CORRECT_PASSWORD) {
            loginScreen.classList.remove('active');
            appScreen.classList.add('active');
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
        const startDay = firstDayOfMonth.getDay(); // 0:日曜, 1:月曜...
        const totalDays = lastDayOfMonth.getDate();

        // 空のセルを追加
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('date-cell', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        // 日付セルを追加
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('div');
            cell.classList.add('date-cell');
            cell.textContent = day;
            
            const date = new Date(year, month, day);
            const dateKey = formatDateKey(date);

            // 今日の日付にマーク
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                cell.classList.add('today');
            }

            // ステータスに応じてクラスを設定
            if (rentalData[dateKey] === 'applied') {
                cell.classList.add('applied');
            } else {
                cell.classList.add('not-applied');
            }
            
            cell.dataset.dateKey = dateKey;
            calendarGrid.appendChild(cell);
        }
        updateDetailsPanel();
    };

    // 詳細パネルの更新
    const updateDetailsPanel = () => {
        if (!selectedDate) {
            selectedDateEl.textContent = '日付を選択してください';
            statusTextEl.textContent = '-';
            actionButton.disabled = true;
            actionButton.textContent = 'アクション';
            actionButton.className = '';
            return;
        }
        
        const date = new Date(selectedDate.replace(/-/g, '/')); // Safari対応
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        selectedDateEl.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${dayOfWeek})`;
        
        const isApplied = rentalData[selectedDate] === 'applied';
        
        statusTextEl.textContent = isApplied ? '申請済み' : '未申請';
        statusTextEl.style.color = isApplied ? 'var(--applied-color)' : 'var(--text-color)';
        
        actionButton.disabled = false;
        actionButton.textContent = isApplied ? '申請を取り消す' : 'この日で申請する';
        actionButton.className = isApplied ? 'cancel' : 'apply';
    };
    
    // --- イベントリスナー ---
    loginButton.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    calendarGrid.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('date-cell') && !target.classList.contains('empty')) {
            // 選択中のスタイルをリセット
            const currentlySelected = document.querySelector('.date-cell.selected');
            if(currentlySelected) {
                currentlySelected.classList.remove('selected');
            }
            
            // 新しく選択した日付にスタイルを適用
            target.classList.add('selected');
            selectedDate = target.dataset.dateKey;
            updateDetailsPanel();
        }
    });
    
    actionButton.addEventListener('click', () => {
        if (!selectedDate) return;
        
        const isApplied = rentalData[selectedDate] === 'applied';
        if (isApplied) {
            delete rentalData[selectedDate]; // 申請を取り消す
        } else {
            rentalData[selectedDate] = 'applied'; // 申請する
        }
        
        saveData();
        renderCalendar();
        
        // アクション後も選択状態を維持
        const targetCell = document.querySelector(`[data-date-key="${selectedDate}"]`);
        if (targetCell) {
            targetCell.classList.add('selected');
        }
    });

});
