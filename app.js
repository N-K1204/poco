// Poco Pro - Controller Logic

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1532953246061035731/JngZ2PorycVIurpCJzFMOGSnsZ5dtdkJIohOEF4sGoOKZv4rP5fPEts-jYrHFihbc528";

let selectedButtonItem = null;

// カレンダー用状態変数
let currentCalendarDate = new Date();
let selectedCalendarDateStr = formatDateKey(new Date());
let calendarEventsData = {};

document.addEventListener('DOMContentLoaded', () => {
  renderButtons();
  listenMissionAndPoints();
  try {
    init3DScene();
  } catch(e) {
    console.warn("3D Scene init postponed:", e);
  }
});

function selectStatus(statusType) {
  if (statusType === 'memo') {
    openMemoModal();
    return;
  }
  if (statusType === 'shiritori') {
    openShiritoriModal();
    return;
  }
  if (statusType === 'game3d') {
    open3DGameModal();
    return;
  }

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');

  step1.classList.remove('active');
  step2.classList.add('active');

  document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
  const targetPanel = document.getElementById(`panel-${statusType}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
}

function resetToStep1() {
  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');

  step2.classList.remove('active');
  step1.classList.add('active');
}

function renderButtons() {
  const statusContainer = document.getElementById('status-grid');
  if (statusContainer) {
    statusContainer.innerHTML = POCO_DATA.statusButtons.map(item => `
      <div class="card-item" onclick="openConfirmModal('${item.id}', 'statusButtons')" role="button">
        ${item.svg}
        <span class="title">${item.label}</span>
      </div>
    `).join('');
  }

  const callContainer = document.getElementById('call-grid');
  if (callContainer) {
    callContainer.innerHTML = POCO_DATA.callButtons.map(item => `
      <div class="card-item" onclick="openConfirmModal('${item.id}', 'callButtons')" role="button">
        ${item.svg}
        <span class="title">${item.label}</span>
      </div>
    `).join('');
  }

  const quickContainer = document.getElementById('quick-grid');
  if (quickContainer) {
    quickContainer.innerHTML = POCO_DATA.quickReplies.map(item => `
      <div class="quick-btn" onclick="openConfirmModal('${item.id}', 'quickReplies')" role="button">
        ${item.svg}
        <span class="label">${item.label}</span>
      </div>
    `).join('');
  }
}

function handleOverlayClick(event, overlayId) {
  if (event.target.id === overlayId) {
    const el = document.getElementById(overlayId);
    if (el) el.classList.remove('active');
  }
}

function openConfirmModal(buttonId, dataSourceKey) {
  const list = POCO_DATA[dataSourceKey];
  selectedButtonItem = list.find(b => b.id === buttonId);
  if (!selectedButtonItem) return;

  document.getElementById('confirm-category').innerText = selectedButtonItem.category;
  document.getElementById('confirm-label').innerText = selectedButtonItem.label;
  document.getElementById('confirm-overlay').classList.add('active');
}

function closeConfirmModal() {
  document.getElementById('confirm-overlay').classList.remove('active');
  selectedButtonItem = null;
}

function openMemoModal() {
  document.getElementById('memo-overlay').classList.add('active');
}

function closeMemoModal() {
  document.getElementById('memo-overlay').classList.remove('active');
}

async function sendSelectedButtonToDiscord() {
  if (!selectedButtonItem) return;

  const discordMessage = {
    embeds: [{
      title: "ステータス更新",
      color: 0x222225,
      fields: [
        { name: "カテゴリ", value: selectedButtonItem.category, inline: true },
        { name: "押されたボタン", value: selectedButtonItem.label, inline: true }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    });

    if (response.ok) {
      showToast('Discordへ送信しました');
      closeConfirmModal();
      resetToStep1();
    } else {
      showToast('送信に失敗しました');
    }
  } catch (error) {
    console.error('Error sending to Discord:', error);
    showToast('送信エラーが発生しました');
  }
}

async function sendMemoToDiscord() {
  const today = document.getElementById('memo-today').value.trim() || 'なし';
  const talk = document.getElementById('memo-talk').value.trim() || 'なし';
  const trouble = document.getElementById('memo-trouble').value.trim() || 'なし';

  if (today === 'なし' && talk === 'なし' && trouble === 'なし') {
    showToast('内容を入力してください');
    return;
  }

  const discordMessage = {
    embeds: [{
      title: "通話まえメモ",
      color: 0x161618,
      fields: [
        { name: "今日あったこと", value: today },
        { name: "話したいこと", value: talk },
        { name: "困っていること・悩み", value: trouble }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    });

    if (response.ok) {
      showToast('Discordへ送信しました');
      closeMemoModal();
      resetToStep1();
    } else {
      showToast('送信に失敗しました');
    }
  } catch (error) {
    console.error('Error sending to Discord:', error);
    showToast('送信エラーが発生しました');
  }
}

// ==========================================
// Firebase 安全な初期化
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyB15Oycs-Kea3XpblJp-woQoigB3dfQKlg",
  authDomain: "poco-app-a97ba.firebaseapp.com",
  databaseURL: "https://poco-app-a97ba-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poco-app-a97ba",
  storageBucket: "poco-app-a97ba.firebasestorage.app",
  messagingSenderId: "725824798305",
  appId: "1:725824798305:web:cd6192c353dbac36baf420",
  measurementId: "G-8ZPPCMDTQN"
};

let db = null;
try {
  if (typeof firebase !== 'undefined' && firebase.apps) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    if (typeof firebase.database === 'function') {
      db = firebase.database();
    }
  }
} catch (e) {
  console.warn("Firebase initialization skipped or failed:", e);
}

// ==========================================
// ミッション ＆ 累計ポイントシステム（モーダル対応・カレンダー同期）
// ==========================================

let currentMissionData = {
  title: "今日はお休み・準備中",
  points: 0,
  isCompleted: false
};
let userTotalPoints = 0;

function openMissionModal() {
  const modal = document.getElementById('mission-setting-overlay');
  if (modal) {
    modal.classList.add('active');
    const dateInput = document.getElementById('modal-mission-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = formatDateKey(new Date());
    }
  }
}

function closeMissionModal() {
  const modal = document.getElementById('mission-setting-overlay');
  if (modal) modal.classList.remove('active');
}

function listenMissionAndPoints() {
  if (!db) return;

  const todayStr = formatDateKey(new Date());

  db.ref(`mission/by_date/${todayStr}`).on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
      currentMissionData = data;
      renderMissionUI();
    } else {
      document.getElementById('today-mission-title').innerText = "今日のミッションはまだありません";
      document.getElementById('today-mission-points-label').innerText = "管理者からの配信をお待ちください";
      document.getElementById('mission-complete-btn').style.display = "none";
    }
  });

  db.ref('user/points').on('value', (snapshot) => {
    const pts = snapshot.val();
    userTotalPoints = pts || 0;
    document.getElementById('user-points-display').innerText = userTotalPoints.toLocaleString();
  });
}

function renderMissionUI() {
  const titleEl = document.getElementById('today-mission-title');
  const pointsLabelEl = document.getElementById('today-mission-points-label');
  const completeBtn = document.getElementById('mission-complete-btn');

  if (!titleEl || !pointsLabelEl || !completeBtn) return;

  titleEl.innerText = currentMissionData.title || "今日のミッションはまだありません";
  pointsLabelEl.innerText = `獲得報酬: +${currentMissionData.points || 0} PT`;

  if (currentMissionData.isCompleted) {
    completeBtn.innerText = "達成済み！";
    completeBtn.disabled = true;
    completeBtn.style.opacity = "0.5";
    completeBtn.style.display = "block";
  } else {
    completeBtn.innerText = "ミッション達成！ポイントGET";
    completeBtn.disabled = false;
    completeBtn.style.opacity = "1";
    completeBtn.style.display = "block";
  }
}

function completeTodayMission() {
  if (currentMissionData.isCompleted) return;

  const earnedPts = parseInt(currentMissionData.points, 10) || 0;
  const newTotalPts = userTotalPoints + earnedPts;
  const todayStr = formatDateKey(new Date());

  if (db) {
    db.ref(`mission/by_date/${todayStr}`).update({ isCompleted: true });
    db.ref('user/points').set(newTotalPts);
    db.ref(`calendar/events/${todayStr}`).push({
      title: `【ミッション達成】${currentMissionData.title} (+${earnedPts}PT)`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMissionLog: true
    });
  }

  showToast(`おめでとう！ ${earnedPts} PT ゲット！`);
}

// ミッション専用設定モーダルからの送信
function submitMissionFromModal() {
  const dateInput = document.getElementById('modal-mission-date');
  const titleInput = document.getElementById('modal-mission-title');
  const pointsInput = document.getElementById('modal-mission-points');

  let targetDateStr = dateInput ? dateInput.value : '';
  if (!targetDateStr) targetDateStr = formatDateKey(new Date());

  const mTitle = titleInput.value.trim();
  const mPoints = parseInt(pointsInput.value, 10) || 50;

  if (!mTitle) return showToast('ミッション内容を入力してください');

  saveMissionToDB(targetDateStr, mTitle, mPoints);
  closeMissionModal();
  titleInput.value = '';
}

// DBおよびカレンダー・表への一括同期関数
function saveMissionToDB(targetDateStr, title, points) {
  if (db) {
    db.ref(`mission/by_date/${targetDateStr}`).set({
      date: targetDateStr,
      title: title,
      points: points,
      isCompleted: false,
      timestamp: Date.now()
    });

    db.ref(`calendar/events/${targetDateStr}`).push({
      title: `🎯 【ミッション】${title} (+${points}PT)`,
      time: '終日',
      isMissionLog: true,
      timestamp: Date.now()
    });
  }
  showToast(`${targetDateStr} のミッションをカレンダーに共有しました`);
}

// 管理者画面からの送信
function sendAdminMission() {
  const dateInput = document.getElementById('admin-mission-date');
  const titleInput = document.getElementById('admin-mission-input');
  const pointsInput = document.getElementById('admin-mission-points');

  let targetDateStr = dateInput ? dateInput.value : '';
  if (!targetDateStr) targetDateStr = formatDateKey(new Date());

  const mTitle = titleInput.value.trim();
  const mPoints = parseInt(pointsInput.value, 10) || 50;

  if (!mTitle) return showToast('ミッション内容を入力してください');

  saveMissionToDB(targetDateStr, mTitle, mPoints);
  titleInput.value = '';
}

// ==========================================
// 共有カレンダー機能
// ==========================================

function openCalendarModal() {
  document.getElementById('calendar-overlay').classList.add('active');
  renderCalendar();
  listenCalendarEvents();
}

function closeCalendarModal() {
  document.getElementById('calendar-overlay').classList.remove('active');
}

function changeCalendarMonth(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderCalendar();
}

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const label = document.getElementById('calendar-month-label');
  if (label) label.innerText = `${year}年 ${month + 1}月`;

  const daysGrid = document.getElementById('calendar-days-grid');
  if (!daysGrid) return;
  daysGrid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'calendar-day empty';
    daysGrid.appendChild(emptyCell);
  }

  const todayStr = formatDateKey(new Date());

  for (let d = 1; d <= lastDate; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = formatDateKey(dateObj);

    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    if (dateStr === todayStr) dayCell.classList.add('today');
    if (dateStr === selectedCalendarDateStr) dayCell.classList.add('selected');

    dayCell.innerText = d;

    if (calendarEventsData[dateStr]) {
      const dot = document.createElement('span');
      dot.className = 'event-dot';
      dayCell.appendChild(dot);
    }

    dayCell.onclick = () => {
      selectedCalendarDateStr = dateStr;
      renderCalendar();
      renderSelectedDateEvents();
    };

    daysGrid.appendChild(dayCell);
  }

  renderSelectedDateEvents();
}

function listenCalendarEvents() {
  if (!db) return;
  db.ref('calendar/events').on('value', (snapshot) => {
    calendarEventsData = snapshot.val() || {};
    renderCalendar();
  });
}

function renderSelectedDateEvents() {
  const label = document.getElementById('selected-date-label');
  const container = document.getElementById('selected-date-events');
  if (!label || !container) return;

  label.innerText = `${selectedCalendarDateStr} の予定・ミッション一覧`;

  const dayData = calendarEventsData[selectedCalendarDateStr];
  if (!dayData) {
    container.innerHTML = '<p class="no-events">予定・ミッションはありません</p>';
    return;
  }

  const list = Object.values(dayData);
  container.innerHTML = list.map(ev => `
    <div class="event-item ${ev.isMissionLog ? 'mission-event' : ''}">
      <span class="event-time">${ev.time || '終日'}</span>
      <span class="event-title">${ev.title}</span>
    </div>
  `).join('');
}

function submitCalendarEvent() {
  const titleInput = document.getElementById('event-title-input');
  const timeInput = document.getElementById('event-time-input');

  const title = titleInput.value.trim();
  const time = timeInput.value.trim();

  if (!title) return showToast('予定のタイトルを入力してください');

  if (db) {
    db.ref(`calendar/events/${selectedCalendarDateStr}`).push({
      title: title,
      time: time || '終日',
      isMissionLog: false,
      timestamp: Date.now()
    });
  }

  showToast('カレンダーに共有追加しました');
  titleInput.value = '';
  timeInput.value = '';
}

function formatDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// --- しりとり ---
function openShiritoriModal() {
  document.getElementById('shiritori-overlay').classList.add('active');
  listenShiritoriUpdates();
}

function closeShiritoriModal() {
  document.getElementById('shiritori-overlay').classList.remove('active');
}

function listenShiritoriUpdates() {
  if (!db) return;
  const shiritoriRef = db.ref('shiritori/words');
  shiritoriRef.limitToLast(50).on('value', (snapshot) => {
    const data = snapshot.val();
    const historyContainer = document.getElementById('shiritori-history');
    const lastWordEl = document.getElementById('last-word');
    const nextCharEl = document.getElementById('next-char');

    if (!data) {
      historyContainer.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.85rem;">単語を入力してスタート！</p>';
      lastWordEl.innerText = '（まだ単語がありません）';
      nextCharEl.innerText = 'ー';
      return;
    }

    const wordsList = Object.values(data);
    const latestWord = wordsList[wordsList.length - 1].word;

    lastWordEl.innerText = latestWord;
    const cleanWord = latestWord.replace(/[ぁ-ぉ]/g, letter => String.fromCharCode(letter.charCodeAt(0) + 1));
    const lastChar = cleanWord.slice(-1);
    nextCharEl.innerText = lastChar === 'ー' ? cleanWord.slice(-2, -1) : lastChar;

    historyContainer.innerHTML = wordsList.map(item => `
      <div class="history-item">
        <span class="word">${item.word}</span>
        <span class="time">${item.time}</span>
      </div>
    `).join('');

    historyContainer.scrollTop = historyContainer.scrollHeight;
  });
}

function sendShiritoriWord() {
  const inputEl = document.getElementById('shiritori-input');
  const word = inputEl.value.trim();

  if (!word) return;
  if (!db) return showToast('Firebaseの設定が必要です');

  const shiritoriRef = db.ref('shiritori/words');
  shiritoriRef.once('value', (snapshot) => {
    const data = snapshot.val();

    if (data) {
      const existingWords = Object.values(data).map(item => item.word);
      if (existingWords.includes(word)) {
        showToast(`「${word}」はすでに使われています！`);
        return;
      }
    }

    if (word.endsWith('ん')) {
      showToast('「ん」がつきました！リセットします');
      shiritoriRef.remove();
      inputEl.value = '';
      return;
    }

    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    shiritoriRef.push({
      word: word,
      time: timeStr
    });

    inputEl.value = '';
  });
}

function openShiritoriResetConfirm() {
  document.getElementById('shiritori-reset-overlay').classList.add('active');
}

function closeShiritoriResetConfirm() {
  document.getElementById('shiritori-reset-overlay').classList.remove('active');
}

function executeShiritoriReset() {
  if (!db) return closeShiritoriResetConfirm();
  db.ref('shiritori/words').remove().then(() => {
    closeShiritoriResetConfirm();
    showToast('しりとりをリセットしました');
  });
}

// ==========================================
// 5W1H リアルタイム対話セッション
// ==========================================

let userRole = 'koyama';
let hearingTimerInterval = null;
let hearingRemainingSeconds = 180;
let isTimerActive = false;

function openHearingModal(role) {
  userRole = role;
  document.getElementById('hearing-overlay').classList.add('active');
  document.getElementById('hearing-finish-box').classList.add('hidden');

  const footerCloseBtn = document.getElementById('hearing-footer-close-btn');
  if (footerCloseBtn) footerCloseBtn.classList.remove('hidden');

  if (role === 'admin') {
    document.getElementById('hearing-admin-box').classList.remove('hidden');
    document.getElementById('hearing-koyama-box').classList.add('hidden');

    const dateInput = document.getElementById('admin-mission-date');
    if (dateInput && !dateInput.value) {
      dateInput.value = formatDateKey(new Date());
    }
  } else {
    document.getElementById('hearing-admin-box').classList.add('hidden');
    document.getElementById('hearing-koyama-box').classList.remove('hidden');
  }

  listenHearingSync();
}

function closeHearingModal() {
  stopHearingTimer();
  document.getElementById('hearing-overlay').classList.remove('active');
}

function listenHearingSync() {
  if (!db) {
    if (isTimerActive) startHearingTimer();
    return;
  }

  const hearingStateRef = db.ref('hearing/live_state');
  hearingStateRef.off();
  hearingStateRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const footerCloseBtn = document.getElementById('hearing-footer-close-btn');

    if (!data) return;

    if (data.remainingSeconds !== undefined) {
      hearingRemainingSeconds = data.remainingSeconds;
      updateTimerUI();
    }

    if (data.isTimerActive !== undefined) {
      isTimerActive = data.isTimerActive;
    }

    if (userRole === 'koyama' && isTimerActive && !data.isFinished) {
      startHearingTimer();
    } else if (userRole !== 'admin') {
      stopHearingTimer();
    }

    if (data.isFinished) {
      stopHearingTimer();
      document.getElementById('hearing-admin-box').classList.add('hidden');
      document.getElementById('hearing-koyama-box').classList.add('hidden');
      document.getElementById('hearing-finish-box').classList.remove('hidden');
      if (footerCloseBtn) footerCloseBtn.classList.add('hidden');
      return;
    } else {
      document.getElementById('hearing-finish-box').classList.add('hidden');
      if (footerCloseBtn) footerCloseBtn.classList.remove('hidden');

      if (userRole === 'admin') {
        document.getElementById('hearing-admin-box').classList.remove('hidden');
        document.getElementById('hearing-koyama-box').classList.add('hidden');
      } else if (userRole === 'koyama') {
        document.getElementById('hearing-admin-box').classList.add('hidden');
        document.getElementById('hearing-koyama-box').classList.remove('hidden');
      }
    }

    if (userRole === 'koyama') {
      const qDisplay = document.getElementById('koyama-q-display');
      if (qDisplay) {
        qDisplay.innerText = data.currentQuestion || '（質問を待っています...）';
      }
    }

    if (userRole === 'admin') {
      const replyDisplay = document.getElementById('admin-last-reply');
      if (replyDisplay && data.lastAnswer) {
        replyDisplay.innerText = `${data.lastQuestion || '質問'}\n➔ 「${data.lastAnswer}」`;
      }
    }
  });
}

function sendAdminQuestion() {
  const qText = document.getElementById('admin-question-input').value.trim();
  if (!qText) return showToast('質問を入力してください');

  const selectedSeconds = parseInt(document.getElementById('admin-timer-select').value, 10) || 180;

  hearingRemainingSeconds = selectedSeconds;
  isTimerActive = true;
  startHearingTimer();

  if (db) {
    db.ref('hearing/live_state').update({
      currentQuestion: qText,
      remainingSeconds: hearingRemainingSeconds,
      isTimerActive: true,
      isFinished: false,
      timestamp: Date.now()
    });
  }

  showToast('質問を配信しました');
  document.getElementById('admin-question-input').value = '';
}

function submitKoyamaAnswer() {
  const ansText = document.getElementById('koyama-answer-input').value.trim();
  if (!ansText) return showToast('ことばを入力してね');

  recordKoyamaResponse(ansText);
  document.getElementById('koyama-answer-input').value = '';
}

function submitKoyamaQuestionMark() {
  openKoyamaQuestionConfirm();
}

function openKoyamaQuestionConfirm() {
  document.getElementById('koyama-question-confirm-overlay').classList.add('active');
}

function closeKoyamaQuestionConfirm() {
  document.getElementById('koyama-question-confirm-overlay').classList.remove('active');
}

function executeKoyamaQuestionSubmit() {
  closeKoyamaQuestionConfirm();
  recordKoyamaResponse('？（わからない・質問の意味の言い換え希望）');
}

function recordKoyamaResponse(answerText) {
  if (!db) {
    showToast('回答を送信しました');
    return;
  }

  const hearingStateRef = db.ref('hearing/live_state');
  const hearingLogRef = db.ref('hearing/records');

  hearingStateRef.once('value', (snapshot) => {
    const data = snapshot.val() || {};
    const currentQ = data.currentQuestion || '質問';

    hearingStateRef.update({
      lastQuestion: currentQ,
      lastAnswer: answerText,
      timestamp: Date.now()
    });

    hearingLogRef.push({
      question: currentQ,
      answer: answerText,
      timestamp: new Date().toISOString()
    });

    sendHearingLogToDiscord(currentQ, answerText);
    showToast('回答を送信しました');
  });
}

function resetHearingProcess() {
  stopHearingTimer();
  hearingRemainingSeconds = 180;
  isTimerActive = false;

  document.getElementById('hearing-finish-box').classList.add('hidden');
  const footerCloseBtn = document.getElementById('hearing-footer-close-btn');
  if (footerCloseBtn) footerCloseBtn.classList.remove('hidden');

  const koyamaDisplay = document.getElementById('koyama-q-display');
  if (koyamaDisplay) koyamaDisplay.innerText = '（質問を待っています...）';

  const replyDisplay = document.getElementById('admin-last-reply');
  if (replyDisplay) replyDisplay.innerText = '（応答待機中...）';

  const qInput = document.getElementById('admin-question-input');
  if (qInput) qInput.value = '';

  const aInput = document.getElementById('koyama-answer-input');
  if (aInput) aInput.value = '';

  if (userRole === 'admin') {
    document.getElementById('hearing-admin-box').classList.remove('hidden');
    document.getElementById('hearing-koyama-box').classList.add('hidden');
  } else {
    document.getElementById('hearing-admin-box').classList.add('hidden');
    document.getElementById('hearing-koyama-box').classList.remove('hidden');
  }

  updateTimerUI();

  if (db) {
    db.ref('hearing/live_state').set({
      currentQuestion: '（質問を待っています...）',
      lastAnswer: '',
      lastQuestion: '',
      remainingSeconds: 180,
      isTimerActive: false,
      isFinished: false,
      timestamp: Date.now()
    });
  }

  showToast('初期状態にリセットしました');
}

function startHearingTimer() {
  if (hearingTimerInterval) return;
  updateTimerUI();

  hearingTimerInterval = setInterval(() => {
    hearingRemainingSeconds--;

    if (hearingRemainingSeconds < 0) hearingRemainingSeconds = 0;

    if (userRole === 'admin' && db) {
      db.ref('hearing/live_state').update({ remainingSeconds: hearingRemainingSeconds });
    }

    updateTimerUI();

    if (hearingRemainingSeconds <= 0) {
      finishHearingProcess();
    }
  }, 1000);
}

function stopHearingTimer() {
  if (hearingTimerInterval) {
    clearInterval(hearingTimerInterval);
    hearingTimerInterval = null;
  }
}

function updateTimerUI() {
  const timerText = document.getElementById('timer-text');
  const timerHourglass = document.getElementById('timer-hourglass');

  const mins = Math.floor(hearingRemainingSeconds / 60);
  const secs = hearingRemainingSeconds % 60;
  const formattedSecs = String(secs).padStart(2, '0');

  if (hearingRemainingSeconds > 10) {
    if (timerText) {
      timerText.style.display = 'inline';
      timerText.innerText = `あと ${mins}:${formattedSecs}`;
    }
    if (timerHourglass) timerHourglass.classList.add('hidden');
  } else {
    if (timerText) timerText.style.display = 'none';
    if (timerHourglass) timerHourglass.classList.remove('hidden');
  }
}

function finishHearingProcess() {
  stopHearingTimer();
  isTimerActive = false;

  document.getElementById('hearing-admin-box').classList.add('hidden');
  document.getElementById('hearing-koyama-box').classList.add('hidden');
  document.getElementById('hearing-finish-box').classList.remove('hidden');

  const footerCloseBtn = document.getElementById('hearing-footer-close-btn');
  if (footerCloseBtn) footerCloseBtn.classList.add('hidden');

  if (db) {
    db.ref('hearing/live_state').update({
      isFinished: true,
      isTimerActive: false
    });
  }
}

async function sendHearingLogToDiscord(qKey, answer) {
  const discordMessage = {
    embeds: [{
      title: "ヒアリング記録",
      color: 0x3b82f6,
      fields: [
        { name: qKey, value: answer, inline: true }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordMessage)
    });
  } catch (e) {
    console.error('Discord Log Error:', e);
  }
}

// Toast 表示制御
let toastTimer = null;

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }

  toast.classList.remove('show');
  toast.innerText = msg;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    toastTimer = null;
  }, 1800);
}

// ==========================================
// 3D タクティカルバトル Engine (Three.js)
// ==========================================

let scene3D, camera3D, renderer3D, playerLight;
let player3D, enemy3D;
let walls3D = [], taskPoints3D = [];
let game3DActive = false;
let cameraViewMode = 'TPS';
let moveDir = { x: 0, z: 0 };
let taskProgress = 0;
let wallBoundingBoxes = [];

function open3DGameModal() {
  document.getElementById('game3d-overlay').classList.add('active');
  setTimeout(() => {
    onWindowResize3D();
    if (renderer3D && scene3D && camera3D) {
      renderer3D.render(scene3D, camera3D);
    }
  }, 100);
}

function close3DGameModal() {
  stop3DGame();
  document.getElementById('game3d-overlay').classList.remove('active');
}

function setCameraViewMode(mode) {
  cameraViewMode = mode;
  const tpsBtn = document.getElementById('view-tps-btn');
  const fpsBtn = document.getElementById('view-fps-btn');
  if (tpsBtn) tpsBtn.classList.toggle('active', mode === 'TPS');
  if (fpsBtn) fpsBtn.classList.toggle('active', mode === 'FPS');

  if (game3DActive) {
    showToast(`視点を「${mode === 'FPS' ? '一人称 (FPS)' : '三人称 (TPS)'}」に切り替えました`);
  }
}

function init3DScene() {
  const container = document.getElementById('canvas3d-container');
  if (!container || typeof THREE === 'undefined') return;

  scene3D = new THREE.Scene();
  scene3D.background = new THREE.Color(0x050507);
  scene3D.fog = new THREE.FogExp2(0x050507, 0.04);

  camera3D = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);

  renderer3D = new THREE.WebGLRenderer({ antialias: true });
  renderer3D.setSize(window.innerWidth, window.innerHeight);
  renderer3D.shadowMap.enabled = true;
  container.appendChild(renderer3D.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene3D.add(ambientLight);

  playerLight = new THREE.SpotLight(0xffffff, 2.5);
  playerLight.angle = Math.PI / 3;
  playerLight.penumbra = 0.5;
  playerLight.castShadow = true;
  scene3D.add(playerLight);

  const floorGeo = new THREE.PlaneGeometry(60, 60);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x121318, roughness: 0.8 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene3D.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x22242c });
  const wallLayout = [
    { x: 0, z: -15, w: 30, h: 4, d: 1 },
    { x: -15, z: 0, w: 1, h: 4, d: 30 },
    { x: 15, z: 0, w: 1, h: 4, d: 30 },
    { x: 0, z: 15, w: 30, h: 4, d: 1 },
    { x: -5, z: -5, w: 10, h: 4, d: 1 },
    { x: 5, z: 5, w: 10, h: 4, d: 1 },
    { x: 0, z: 0, w: 1, h: 4, d: 8 },
    { x: -8, z: 6, w: 1, h: 4, d: 10 },
    { x: 8, z: -6, w: 1, h: 4, d: 10 }
  ];

  wallBoundingBoxes = [];
  wallLayout.forEach(w => {
    const geo = new THREE.BoxGeometry(w.w, w.h, w.d);
    const wall = new THREE.Mesh(geo, wallMat);
    wall.position.set(w.x, w.h / 2, w.z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene3D.add(wall);
    walls3D.push(wall);

    wallBoundingBoxes.push({
      minX: w.x - w.w / 2 - 0.7,
      maxX: w.x + w.w / 2 + 0.7,
      minZ: w.z - w.d / 2 - 0.7,
      maxZ: w.z + w.d / 2 + 0.7
    });
  });

  const taskGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);
  const taskMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
  const taskPositions = [{ x: -10, z: -10 }, { x: 10, z: -10 }, { x: -10, z: 10 }, { x: 10, z: 10 }];

  taskPositions.forEach(tp => {
    const taskMesh = new THREE.Mesh(taskGeo, taskMat);
    taskMesh.position.set(tp.x, 0.1, tp.z);
    scene3D.add(taskMesh);
    taskPoints3D.push(taskMesh);
  });

  const playerGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.8, 16);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  player3D = new THREE.Mesh(playerGeo, playerMat);
  player3D.position.set(0, 0.9, 0);
  player3D.castShadow = true;
  scene3D.add(player3D);

  const enemyMat = new THREE.MeshStandardMaterial({ color: 0xe54b4b });
  enemy3D = new THREE.Mesh(playerGeo, enemyMat);
  enemy3D.position.set(12, 0.9, -12);
  enemy3D.castShadow = true;
  scene3D.add(enemy3D);

  window.addEventListener('resize', onWindowResize3D);
}

function onWindowResize3D() {
  if (!renderer3D || !camera3D) return;
  camera3D.aspect = window.innerWidth / window.innerHeight;
  camera3D.updateProjectionMatrix();
  renderer3D.setSize(window.innerWidth, window.innerHeight);
}

function toggle3DGame() {
  game3DActive = !game3DActive;
  const btn = document.getElementById('game3d-start-btn');
  const statusEl = document.getElementById('game3d-status');

  if (game3DActive) {
    if (btn) btn.innerText = 'STOP';
    if (statusEl) statusEl.innerText = 'PLAYING';
    taskProgress = 0;
    updateTaskUI();
    animate3D();
  } else {
    stop3DGame();
  }
}

function stop3DGame() {
  game3DActive = false;
  const btn = document.getElementById('game3d-start-btn');
  const statusEl = document.getElementById('game3d-status');

  if (btn) btn.innerText = 'START';
  if (statusEl) statusEl.innerText = 'STANDBY';
}

function handle3DMove(dir) {
  if (!game3DActive) return;
  const speed = 0.35;
  if (dir === 'up') moveDir.z = -speed;
  if (dir === 'down') moveDir.z = speed;
  if (dir === 'left') moveDir.x = -speed;
  if (dir === 'right') moveDir.x = speed;
}

function stop3DMove() {
  moveDir = { x: 0, z: 0 };
}

function trigger3DDash() {
  if (!game3DActive) return;
  movePlayerWithCollision(moveDir.x * 8, moveDir.z * 8);
}

function movePlayerWithCollision(dx, dz) {
  if (!player3D) return;
  const nextX = player3D.position.x + dx;
  const nextZ = player3D.position.z + dz;

  let canMoveX = true;
  let canMoveZ = true;

  for (let box of wallBoundingBoxes) {
    if (nextX > box.minX && nextX < box.maxX && player3D.position.z > box.minZ && player3D.position.z < box.maxZ) {
      canMoveX = false;
    }
    if (player3D.position.x > box.minX && player3D.position.x < box.maxX && nextZ > box.minZ && nextZ < box.maxZ) {
      canMoveZ = false;
    }
  }

  if (canMoveX) player3D.position.x = nextX;
  if (canMoveZ) player3D.position.z = nextZ;
}

function updateTaskUI() {
  const fill = document.getElementById('task-bar-fill');
  if (fill) fill.style.width = `${taskProgress}%`;
}

function animate3D() {
  if (!game3DActive) return;

  requestAnimationFrame(animate3D);

  movePlayerWithCollision(moveDir.x, moveDir.z);

  if (playerLight && player3D) {
    playerLight.position.set(player3D.position.x, 10, player3D.position.z + 2);
    playerLight.target = player3D;
  }

  taskPoints3D.forEach(tp => {
    if (!player3D) return;
    const dist = Math.hypot(player3D.position.x - tp.position.x, player3D.position.z - tp.position.z);
    if (dist < 1.5 && taskProgress < 100) {
      taskProgress = Math.min(100, taskProgress + 0.4);
      updateTaskUI();
      if (taskProgress >= 100) {
        showToast('ミッション完了！脱出成功！');
        stop3DGame();
      }
    }
  });

  if (player3D && enemy3D) {
    const dx = player3D.position.x - enemy3D.position.x;
    const dz = player3D.position.z - enemy3D.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist > 0.8) {
      enemy3D.position.x += (dx / dist) * 0.11;
      enemy3D.position.z += (dz / dist) * 0.11;
    } else {
      showToast('鬼に確保されました！');
      stop3DGame();
      return;
    }

    if (cameraViewMode === 'FPS') {
      camera3D.position.set(player3D.position.x, 1.6, player3D.position.z);
      const lookTargetX = player3D.position.x + (moveDir.x || (dx / dist));
      const lookTargetZ = player3D.position.z + (moveDir.z || (dz / dist));
      camera3D.lookAt(lookTargetX, 1.6, lookTargetZ);
    } else {
      camera3D.position.x = player3D.position.x;
      camera3D.position.y = 16;
      camera3D.position.z = player3D.position.z + 12;
      camera3D.lookAt(player3D.position.x, 0, player3D.position.z);
    }
  }

  if (renderer3D && scene3D && camera3D) {
    renderer3D.render(scene3D, camera3D);
  }
}
