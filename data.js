// Poco Pro - Data Configuration

const POCO_DATA = {
  // 1. 感情・状態ボタン
  statusButtons: [
    {
      id: 'status_calm',
      category: '今の状態',
      label: '落ち着いている',
      toast: '「落ち着いている」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
    },
    {
      id: 'status_stuck',
      category: '今の状態',
      label: '言葉がつまっている',
      toast: '「言葉がつまっている」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
    },
    {
      id: 'status_tired',
      category: '今の状態',
      label: 'つかれている',
      toast: '「つかれている」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2H6v2H4v14h16V6h-2V4h-4V2h-4z"/><path d="M12 11v4"/></svg>`
    },
    {
      id: 'status_confused',
      category: '今の状態',
      label: 'パニック・不安',
      toast: '「パニック・不安」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`
    },
    {
      id: 'status_quiet',
      category: '今の状態',
      label: '静かにしたい',
      toast: '「静かにしたい」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`
    },
    {
      id: 'status_change',
      category: '今の状態',
      label: '予定変更で困惑',
      toast: '「予定変更で困惑」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    }
  ],

  // 2. 通話・連絡の希望ボタン
  callButtons: [
    {
      id: 'call_now',
      category: '通話の希望',
      label: '今すぐ電話したい',
      toast: '「今すぐ電話したい」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
    },
    {
      id: 'call_later',
      category: '通話の希望',
      label: 'あとで電話したい',
      toast: '「あとで電話したい」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
    },
    {
      id: 'call_listen',
      category: '通話の希望',
      label: '聞くだけならできる',
      toast: '「聞くだけならできる」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`
    },
    {
      id: 'call_no',
      category: '通話の希望',
      label: '今日は電話不可',
      toast: '「今日は電話不可」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.5 16.5A12.08 12.08 0 0 1 12 18c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/></svg>`
    }
  ],

  // 3. クイック応答ボタン
  quickReplies: [
    {
      id: 'quick_yes',
      category: 'クイック応答',
      label: 'はい / 了解',
      toast: '「はい / 了解」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    },
    {
      id: 'quick_no',
      category: 'クイック応答',
      label: 'いいえ / ちがう',
      toast: '「いいえ / ちがう」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
    },
    {
      id: 'quick_wait',
      category: 'クイック応答',
      label: '少し待って',
      toast: '「少し待って」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
    },
    {
      id: 'quick_thanks',
      category: 'クイック応答',
      label: 'ありがとう',
      toast: '「ありがとう」を選択しました',
      svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    }
  ]
};
