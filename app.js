// Poco Pro - Controller Logic

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE";

let selectedButtonItem = null;

document.addEventListener('DOMContentLoaded', () => {
  renderButtons();
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

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');

  step1.classList.remove('active');
  step2.classList.add('active');

  document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-${statusType}`).classList.add('active');
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
    document.getElementById(overlayId).classList.remove('active');
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
// Firebase 設定
// ==========================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appstamp.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- しりとり ---
const shiritoriRef = db.ref('shiritori/words');

function openShiritoriModal() {
  document.getElementById('shiritori-overlay').classList.add('active');
  listenShiritoriUpdates();
}

function closeShiritoriModal() {
  document.getElementById('shiritori-overlay').classList.remove('active');
}

function listenShiritoriUpdates() {
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
  shiritoriRef.remove().then(() => {
    closeShiritoriResetConfirm();
    showToast('しりとりをリセットしました');
  });
}

// ==========================================
// 5W1H リアルタイムヒアリング (時間設定機能付き)
// ==========================================

let userRole = 'koyama';
let hearingTimerInterval = null;
let hearingRemainingSeconds = 180;
const hearingStateRef = db.ref('hearing/live_state');
const hearingLogRef = db.ref('hearing/records');

function openHearingModal(role) {
  userRole = role;
  document.getElementById('hearing-overlay').classList.add('active');
  document.getElementById('hearing-finish-box').classList.add('hidden');

  if (role === 'admin') {
    document.getElementById('hearing-admin-box').classList.remove('hidden');
    document.getElementById('hearing-koyama-box').classList.add('hidden');
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
  hearingStateRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    if (data.isFinished) {
      stopHearingTimer();
      document.getElementById('hearing-admin-box').classList.add('hidden');
      document.getElementById('hearing-koyama-box').classList.add('hidden');
      document.getElementById('hearing-finish-box').classList.remove('hidden');
      return;
    }

    if (data.remainingSeconds !== undefined) {
      hearingRemainingSeconds = data.remainingSeconds;
      updateTimerUI();
    }

    if (data.currentQuestion && userRole === 'koyama') {
      document.getElementById('koyama-q-display').innerText = data.currentQuestion;
    }

    if (data.lastAnswer && userRole === 'admin') {
      document.getElementById('admin-last-reply').innerText = `${data.lastQuestion || '質問'} ➔ 「${data.lastAnswer}」`;
    }
  });
}

// 【管理者】質問＆設定した制限時間を送信
function sendAdminQuestion() {
  const qText = document.getElementById('admin-question-input').value.trim();
  if (!qText) return showToast('質問を入力してください');

  const selectedSeconds = parseInt(document.getElementById('admin-timer-select').value, 10) || 180;

  // はじめて送信する際にドロップダウンで選択した時間でタイマー起動
  if (!hearingTimerInterval) {
    hearingRemainingSeconds = selectedSeconds;
    startHearingTimer();
  }

  hearingStateRef.update({
    currentQuestion: qText,
    remainingSeconds: hearingRemainingSeconds,
    isFinished: false
  });

  showToast('質問を小山くんに送信しました');
  document.getElementById('admin-question-input').value = '';
}

// 【小山くん】回答の送信
function submitKoyamaAnswer() {
  const ansText = document.getElementById('koyama-answer-input').value.trim();
  if (!ansText) return showToast('ことばを入力してね');

  recordKoyamaResponse(ansText);
  document.getElementById('koyama-answer-input').value = '';
}

// 【小山くん】「？」ボタン送信
function submitKoyamaQuestionMark() {
  recordKoyamaResponse('？（わからない・質問の言い換え希望）');
}

function recordKoyamaResponse(answerText) {
  hearingStateRef.once('value', (snapshot) => {
    const data = snapshot.val() || {};
    const currentQ = data.currentQuestion || '質問';

    hearingStateRef.update({
      lastQuestion: currentQ,
      lastAnswer: answerText
    });

    hearingLogRef.push({
      question: currentQ,
      answer: answerText,
      timestamp: new Date().toISOString()
    });

    sendHearingLogToDiscord(currentQ, answerText);
    showToast('こたえを送信しました');
  });
}

function startHearingTimer() {
  stopHearingTimer();
  updateTimerUI();

  hearingTimerInterval = setInterval(() => {
    hearingRemainingSeconds--;
    
    if (userRole === 'admin') {
      hearingStateRef.update({ remainingSeconds: hearingRemainingSeconds });
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
    timerText.style.display = 'inline';
    timerText.innerText = `あと ${mins}:${formattedSecs}`;
    timerHourglass.classList.add('hidden');
  } else {
    timerText.style.display = 'none';
    timerHourglass.classList.remove('hidden');
  }
}

function finishHearingProcess() {
  stopHearingTimer();
  hearingStateRef.update({ isFinished: true });
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
  toast.innerText = msg;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}
