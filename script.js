const ENDPOINT_URL =
  "https://script.google.com/macros/s/AKfycbxXoqb1Dq6fgL8cab3AWPXfOb42zITibaq9PBGzg8yjTWJKbuaq5EFzdgEDoI_kv0w/exec";

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

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

let currentIndex = 0;
const answers = [];

const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const progressEl = document.getElementById("progress");
const nextBtn = document.getElementById("nextBtn");
const appEl = document.getElementById("app");

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

function sendToGoogleSheets(scores) {
  const params = new URLSearchParams();

  params.append("timestamp", new Date().toISOString());
  params.append("E", scores.E);
  params.append("A", scores.A);
  params.append("C", scores.C);
  params.append("N", scores.N);
  params.append("O", scores.O);
  params.append(
    "responses",
    JSON.stringify(
      answers.map(a => ({
        question: a.question,
        trait: a.trait,
        reverse: a.reverse,
        value: a.value
      }))
    )
  );

  fetch(ENDPOINT_URL, {
    method: "POST",
    body: params
  });
}

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

nextBtn.addEventListener("click", () => {
  const selected = document.querySelector("input[name='choice']:checked");
  if (!selected) {
    alert("回答を選んでください");
    return;
  }

  answers.push({
    question: questions[currentIndex].text,
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

shuffle(questions);
renderQuestion();
