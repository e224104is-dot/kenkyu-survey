// ===============================
// Google Apps Script のURL
// ===============================
const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbx3JehUTUFr8JKL9T84pytAzv1j7pjCqc18e0pEDForsz6r_vsmkSP62PRlcgtFDlgd/exec";

// ===============================
// Big Five 質問データ（10問）
// ===============================
const questions = [
  { text: "外向的で、社交的である", trait: "E", reverse: false },
  { text: "内気で、物静かである", trait: "E", reverse: true },

  { text: "批判的で、衝突しやすい", trait: "A", reverse: true },
  { text: "寛容で、協調的である", trait: "A", reverse: false },

  { text: "信頼でき、しっかりしている", trait: "C", reverse: false },
  { text: "だらしなく、不注意である", trait: "C", reverse: true },

  { text: "不安になりやすく、心配性である", trait: "N", reverse: false },
  { text: "感情的に安定していて、落ち着いている", trait: "N", reverse: true },

  { text: "新しい経験に進んで取り組み、創造的である", trait: "O", reverse: false },
  { text: "伝統的で、創造性に欠ける", trait: "O", reverse: true }
];

// ===============================
// 質問順シャッフル
// ===============================
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ===============================
// 状態管理
// ===============================
let currentIndex = 0;
const answers = [];

// ===============================
// DOM取得
// ===============================
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const progressEl = document.getElementById("progress");
const nextBtn = document.getElementById("nextBtn");
const appEl = document.getElementById("app");

// ===============================
// 質問表示（文章のみ選択肢）
// ===============================
function renderQuestion() {
  const q = questions[currentIndex];

  progressEl.textContent = `質問 ${currentIndex + 1} / ${questions.length}`;
  questionEl.textContent = q.text;

  choicesEl.innerHTML = "";

  const labels = [
    "まったく当てはまらない",
    "あまり当てはまらない",
    "どちらともいえない",
    "やや当てはまる",
    "とても当てはまる"
  ];

  for (let i = 1; i <= 5; i++) {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="radio" name="choice" value="${i}">
      ${labels[i - 1]}
    `;
    choicesEl.appendChild(label);
  }
}

// ===============================
// Big Five スコア計算
// ===============================
function calculateScores() {
  const scores = { E: [], A: [], C: [], N: [], O: [] };

  answers.forEach(a => {
    const value = a.reverse ? 6 - a.value : a.value;
    scores[a.trait].push(value);
  });

  const result = {};
  for (const trait in scores) {
    result[trait] = (
      scores[trait].reduce((sum, v) => sum + v, 0) /
      scores[trait].length
    ).toFixed(2);
  }

  return result;
}

// ===============================
// Google Sheets へ送信
// ===============================
function sendToGoogleSheets(scores) {
  fetch(ENDPOINT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      E: scores.E,
      A: scores.A,
      C: scores.C,
      N: scores.N,
      O: scores.O,
      answers: answers.map(a => a.value)
    })
  }).catch(err => {
    console.error("送信エラー:", err);
  });
}

// ===============================
// 結果表示
// ===============================
function showResult() {
  const scores = calculateScores();
  sendToGoogleSheets(scores);

  appEl.innerHTML = `
    <h1>診断結果</h1>
    <ul>
      <li>外向性（E）：${scores.E}</li>
      <li>協調性（A）：${scores.A}</li>
      <li>誠実性（C）：${scores.C}</li>
      <li>神経症傾向（N）：${scores.N}</li>
      <li>開放性（O）：${scores.O}</li>
    </ul>
    <p>ご回答ありがとうございました。</p>
  `;
}

// ===============================
// 次へボタン
// ===============================
nextBtn.addEventListener("click", () => {
  const selected = document.querySelector("input[name='choice']:checked");
  if (!selected) {
    alert("回答を選んでください");
    return;
  }

  answers.push({
    trait: questions[currentIndex].trait,
    reverse: questions[currentIndex].reverse,
    value: Number(selected.value)
  });

  currentIndex++;

  if (currentIndex < questions.length) {
    renderQuestion();
  } else {
    showResult();
  }
});

// ===============================
// 初期化
// ===============================
shuffle(questions);
renderQuestion();
