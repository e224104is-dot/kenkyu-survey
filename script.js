const ENDPOINT_URL =
  "https://script.google.com/macros/s/AKfycbxZeVjG0ALAXbV-QPS2UFNSA65aV9PT8lX7QTamSHQ06PUobHUFvB1oXs_oAJFpXKp9/exec";

const questions = [
  { id: "Q1", text: "外向的で、社交的である", trait: "E", reverse: false },
  { id: "Q2", text: "内気で、物静かである", trait: "E", reverse: true },
  { id: "Q3", text: "批判的で、衝突しやすい", trait: "A", reverse: true },
  { id: "Q4", text: "寛容で、協調的である", trait: "A", reverse: false },
  { id: "Q5", text: "信頼でき、しっかりしている", trait: "C", reverse: false },
  { id: "Q6", text: "だらしなく、不注意である", trait: "C", reverse: true },
  { id: "Q7", text: "不安になりやすく、心配性である", trait: "N", reverse: false },
  { id: "Q8", text: "感情的に安定していて、落ち着いている", trait: "N", reverse: true },
  { id: "Q9", text: "新しい経験に進んで取り組み、創造的である", trait: "O", reverse: false },
  { id: "Q10", text: "伝統的で、創造性に欠ける", trait: "O", reverse: true }
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
    const q = questions.find(q => q.id === a.id);
    const value = q.reverse ? 6 - a.value : a.value;
    scores[q.trait].push(value);
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
  const now = new Date();
  const timestamp =
    now.getFullYear() + "/" +
    String(now.getMonth() + 1).padStart(2, "0") + "/" +
    String(now.getDate()).padStart(2, "0") + " " +
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");

  const params = new URLSearchParams();

  params.append("timestamp", timestamp);
  params.append("E", scores.E);
  params.append("A", scores.A);
  params.append("C", scores.C);
  params.append("N", scores.N);
  params.append("O", scores.O);
  params.append("responses", JSON.stringify(answers));

  fetch(ENDPOINT_URL, {
    method: "POST",
    body: params
  });
}

function showResult() {
  const scores = calculateScores();
  sendToGoogleSheets(scores);

  appEl.innerHTML = `
    <h1>ご回答ありがとうございました</h1>
    <p>
      アンケートはこれで終了です。<br>
      ご協力いただき、誠にありがとうございました。
    </p>
  `;
}

nextBtn.addEventListener("click", () => {
  const selected = document.querySelector("input[name='choice']:checked");
  if (!selected) {
    alert("回答を選んでください");
    return;
  }

  answers.push({
    id: questions[currentIndex].id,
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
