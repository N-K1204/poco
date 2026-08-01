// Poco Pro - Controller Logic

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1532953246061035731/JngZ2PorycVIurpCJzFMOGSnsZ5dtdkJIohOEF4sGoOKZv4rP5fPEts-jYrHFihbc528";

let selectedButtonItem = null;

document.addEventListener('DOMContentLoaded', () => {
  renderButtons();
});

// ステップ切り替え処理
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

// レンダリング処理
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

// --- 確認モーダル制御 ---
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

function handleOverlayClick(event, overlayId) {
  if (event.target.id === overlayId) {
    document.getElementById(overlayId).classList.remove('active');
  }
}

// --- Discord 送信機能 ---
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
// Firebase リアルタイムしりとり
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyB150ycs-Kea3XpbLJp-woQoigB3dfQKlg",
  authDomain: "poco-app-a97ba.firebaseapp.com",
  databaseURL: "https://poco-app-a97ba-default-rtdb.asia-southeast1.firebasedatabase.app", // ※Realtime Database作成後に確定します
  projectId: "poco-app-a97ba",
  storageBucket: "poco-app-a97ba.firebasestorage.app",
  messagingSenderId: "725824798305",
  appId: "1:725824798305:web:cd6192c353dbac36baf420",
  measurementId: "G-8ZPPCMDTQN"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const shiritoriRef = db.ref('shiritori/words');

function openShiritoriModal() {
  document.getElementById('shiritori-overlay').classList.add('active');
  listenShiritoriUpdates();
}

function closeShiritoriModal() {
  document.getElementById('shiritori-overlay').classList.remove('active');
}

// しりとり更新検知（古い順に下に積み重ね）
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

    // 上から下（古い順）へ表示
    historyContainer.innerHTML = wordsList.map(item => `
      <div class="history-item">
        <span class="word">${item.word}</span>
        <span class="time">${item.time}</span>
      </div>
    `).join('');

    // 最下部へスクロール
    historyContainer.scrollTop = historyContainer.scrollHeight;
  });
}

// しりとり単語送信（重複チェック機能付き）
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

// しりとりリセット確認モーダル制御
function openShiritoriResetConfirm() {
  document.getElementById('shiritori-reset-overlay').classList.add('active');
}

function closeShiritoriResetConfirm() {
  document.getElementById('shiritori-reset-overlay').classList.remove('active');
}

function executeShiritoriReset() {
  shiritoriRef.remove();
  closeShiritoriResetConfirm();
  showToast('しりとりをリセットしました');
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
