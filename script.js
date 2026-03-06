/* ============================================
   EDUVERSE — Main Application Script
   ============================================ */

// ==========================================
// QUIZ DATA
// ==========================================
const quizData = {
  english: [
    {
      question: "Which of the following is the correct past tense of 'go'?",
      options: ["Goed", "Went", "Gone", "Going"],
      correct: 1
    },
    {
      question: "Choose the correct sentence:",
      options: [
        "She don't like apples.",
        "She doesn't likes apples.",
        "She doesn't like apples.",
        "She not like apples."
      ],
      correct: 2
    },
    {
      question: "What is a synonym for 'happy'?",
      options: ["Sad", "Joyful", "Angry", "Tired"],
      correct: 1
    },
    {
      question: "Which word is an antonym of 'ancient'?",
      options: ["Old", "Historic", "Modern", "Classic"],
      correct: 2
    },
    {
      question: "Identify the noun in: 'The cat sat on the mat.'",
      options: ["sat", "on", "the", "cat"],
      correct: 3
    },
    {
      question: "What is the plural of 'child'?",
      options: ["Childs", "Children", "Childen", "Childrens"],
      correct: 1
    },
    {
      question: "Which sentence uses the correct form of 'there/their/they're'?",
      options: [
        "Their going to the store.",
        "They're car is new.",
        "There going to be late.",
        "They're going to the park."
      ],
      correct: 3
    },
    {
      question: "What type of word is 'quickly'?",
      options: ["Noun", "Adjective", "Adverb", "Verb"],
      correct: 2
    },
    {
      question: "Which of these is a compound sentence?",
      options: [
        "I like pizza.",
        "I like pizza, and she likes pasta.",
        "The big red dog.",
        "Running through the field."
      ],
      correct: 1
    },
    {
      question: "What does the prefix 'un-' mean?",
      options: ["Again", "Before", "Not", "After"],
      correct: 2
    }
  ],
  math: [
    {
      question: "What is 15 × 12?",
      options: ["160", "170", "180", "190"],
      correct: 2
    },
    {
      question: "Solve: 3x + 7 = 22. What is x?",
      options: ["3", "4", "5", "6"],
      correct: 2
    },
    {
      question: "What is the square root of 144?",
      options: ["10", "11", "12", "14"],
      correct: 2
    },
    {
      question: "What is 25% of 200?",
      options: ["25", "40", "50", "75"],
      correct: 2
    },
    {
      question: "What is the area of a rectangle with length 8 and width 5?",
      options: ["13", "26", "35", "40"],
      correct: 3
    },
    {
      question: "Simplify: 2/4 + 1/4",
      options: ["1/2", "3/4", "1", "3/8"],
      correct: 1
    },
    {
      question: "What is the value of 2³ (2 to the power of 3)?",
      options: ["4", "6", "8", "16"],
      correct: 2
    },
    {
      question: "If a triangle has angles of 90° and 45°, what is the third angle?",
      options: ["35°", "40°", "45°", "55°"],
      correct: 2
    },
    {
      question: "What is the next number in the pattern: 2, 6, 18, 54, ...?",
      options: ["72", "108", "162", "216"],
      correct: 2
    },
    {
      question: "A shop gives a 20% discount on a $150 item. What is the final price?",
      options: ["$100", "$110", "$120", "$130"],
      correct: 2
    }
  ]
};

// ==========================================
// ACHIEVEMENTS DATA
// ==========================================
const achievementsDef = [
  { id: "first_quiz", icon: "🎯", name: "First Steps", desc: "Complete your first quiz", condition: s => s.totalQuizzes >= 1 },
  { id: "five_quizzes", icon: "📚", name: "Bookworm", desc: "Complete 5 quizzes", condition: s => s.totalQuizzes >= 5 },
  { id: "ten_quizzes", icon: "🎓", name: "Scholar", desc: "Complete 10 quizzes", condition: s => s.totalQuizzes >= 10 },
  { id: "perfect_score", icon: "💎", name: "Perfectionist", desc: "Score 100% on any quiz", condition: s => s.hasPerfect },
  { id: "english_master", icon: "📖", name: "Wordsmith", desc: "Complete 3 English quizzes", condition: s => s.englishCount >= 3 },
  { id: "math_master", icon: "🔢", name: "Mathematician", desc: "Complete 3 Math quizzes", condition: s => s.mathCount >= 3 },
  { id: "streak_3", icon: "🔥", name: "On Fire", desc: "Reach a 3-day streak", condition: s => s.streak >= 3 },
  { id: "xp_500", icon: "⭐", name: "Rising Star", desc: "Earn 500 XP", condition: s => s.xp >= 500 },
  { id: "high_scorer", icon: "🏅", name: "High Scorer", desc: "Score 80%+ on 3 quizzes", condition: s => s.highScoreCount >= 3 },
  { id: "all_subjects", icon: "🌟", name: "Well-Rounded", desc: "Complete both English & Math", condition: s => s.englishCount >= 1 && s.mathCount >= 1 }
];

// ==========================================
// STATE MANAGEMENT
// ==========================================
const STORAGE_KEY = "eduverse_data";

function getDefaultState() {
  return {
    history: [],
    streak: 0,
    lastActiveDate: null,
    settings: {
      dailyReminder: true,
      achievementAlerts: true,
      showCorrectAnswer: true,
      soundEffects: false
    }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...getDefaultState(), ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return getDefaultState();
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let appState = loadState();

// ==========================================
// DERIVED STATS
// ==========================================
function getStats() {
  const h = appState.history;
  const totalQuizzes = h.length;
  const totalCorrect = h.reduce((a, r) => a + r.correct, 0);
  const totalQuestions = h.reduce((a, r) => a + r.total, 0);
  const englishCount = h.filter(r => r.subject === "english").length;
  const mathCount = h.filter(r => r.subject === "math").length;
  const hasPerfect = h.some(r => r.correct === r.total);
  const highScoreCount = h.filter(r => (r.correct / r.total) >= 0.8).length;
  const avgAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const xp = h.reduce((a, r) => a + r.correct * 10 + (r.correct === r.total ? 50 : 0), 0);

  const bestEnglish = h.filter(r => r.subject === "english").reduce((best, r) => {
    const pct = Math.round((r.correct / r.total) * 100);
    return pct > best ? pct : best;
  }, 0);

  const bestMath = h.filter(r => r.subject === "math").reduce((best, r) => {
    const pct = Math.round((r.correct / r.total) * 100);
    return pct > best ? pct : best;
  }, 0);

  return {
    totalQuizzes, totalCorrect, totalQuestions, englishCount, mathCount,
    hasPerfect, highScoreCount, avgAccuracy, xp, bestEnglish, bestMath,
    streak: appState.streak
  };
}

// ==========================================
// STREAK
// ==========================================
function updateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (appState.lastActiveDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (appState.lastActiveDate === yesterday) {
    appState.streak += 1;
  } else if (appState.lastActiveDate !== today) {
    appState.streak = 1;
  }
  appState.lastActiveDate = today;
  saveState(appState);
}

// ==========================================
// SPA ROUTER
// ==========================================
const navItems = document.querySelectorAll(".nav-item[data-view]");
const views = document.querySelectorAll(".view");

function navigateTo(viewId) {
  views.forEach(v => v.classList.remove("active"));
  navItems.forEach(n => n.classList.remove("active"));

  const target = document.getElementById(`view-${viewId}`);
  const navTarget = document.querySelector(`.nav-item[data-view="${viewId}"]`);

  if (target) target.classList.add("active");
  if (navTarget) navTarget.classList.add("active");

  // Close mobile sidebar
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");

  // Refresh content for the view
  if (viewId === "dashboard") refreshDashboard();
  if (viewId === "daily-tasks") renderDailyTasks();
  if (viewId === "task-history") renderHistory();
  if (viewId === "profile") renderProfile();
  if (viewId === "achievements") renderAchievements();
  if (viewId === "settings") refreshSettings();
}

navItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo(item.dataset.view);
  });
});

// ==========================================
// MOBILE SIDEBAR
// ==========================================
document.getElementById("mobileToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarOverlay").classList.toggle("show");
});

document.getElementById("sidebarOverlay").addEventListener("click", () => {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");
});

// ==========================================
// DASHBOARD
// ==========================================
function refreshDashboard() {
  const stats = getStats();
  const now = new Date();

  document.getElementById("current-day").textContent = now.getDate();
  document.getElementById("current-month-year").textContent =
    now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  document.getElementById("stat-total-quizzes").textContent = stats.totalQuizzes;
  document.getElementById("stat-total-correct").textContent = stats.totalCorrect;
  document.getElementById("stat-streak").textContent = stats.streak;
  document.getElementById("stat-xp").textContent = stats.xp;

  // Progress rings
  updateRing("ring-english", "ring-english-text", stats.bestEnglish);
  updateRing("ring-math", "ring-math-text", stats.bestMath);
}

function updateRing(circleId, textId, percent) {
  const circle = document.getElementById(circleId);
  const text = document.getElementById(textId);
  const circumference = 2 * Math.PI * 22; // r = 22
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  text.textContent = percent + "%";
}

// Subject card clicks
document.getElementById("subject-english").addEventListener("click", () => startQuiz("english"));
document.getElementById("subject-math").addEventListener("click", () => startQuiz("math"));

// ==========================================
// QUIZ ENGINE
// ==========================================
let currentQuiz = {
  subject: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  selectedOption: null
};

function startQuiz(subject) {
  currentQuiz.subject = subject;
  currentQuiz.questions = [...quizData[subject]];
  currentQuiz.currentIndex = 0;
  currentQuiz.answers = [];
  currentQuiz.selectedOption = null;

  // Update UI
  const label = subject.charAt(0).toUpperCase() + subject.slice(1);
  document.getElementById("quiz-subject-title").textContent = label + " Quiz";
  document.getElementById("quiz-subject-subtitle").textContent = "Answer all questions to complete the quiz";

  const progressFill = document.getElementById("quiz-progress-fill");
  progressFill.className = "quiz-progress-fill " + subject;

  navigateToQuiz();
  renderQuestion();
}

function navigateToQuiz() {
  views.forEach(v => v.classList.remove("active"));
  navItems.forEach(n => n.classList.remove("active"));
  document.getElementById("view-quiz").classList.add("active");
}

function renderQuestion() {
  const q = currentQuiz.questions[currentQuiz.currentIndex];
  const idx = currentQuiz.currentIndex;
  const total = currentQuiz.questions.length;

  // Progress
  const pct = Math.round(((idx + 1) / total) * 100);
  document.getElementById("quiz-progress-label").textContent = `Question ${idx + 1} of ${total}`;
  document.getElementById("quiz-progress-pct").textContent = pct + "%";
  document.getElementById("quiz-progress-fill").style.width = pct + "%";

  const letters = ["A", "B", "C", "D"];

  const body = document.getElementById("quiz-body");
  body.innerHTML = `
    <div class="quiz-question-card">
      <div class="quiz-question-number">Question ${idx + 1}</div>
      <div class="quiz-question-text">${q.question}</div>
      <div class="quiz-options">
        ${q.options.map((opt, i) => `
          <div class="quiz-option" data-index="${i}" id="quiz-opt-${i}">
            <span class="option-letter">${letters[i]}</span>
            <span>${opt}</span>
          </div>
        `).join("")}
      </div>
    </div>
    <div class="quiz-nav">
      <button class="quiz-btn primary" id="quiz-next-btn" disabled>
        ${idx < total - 1 ? "Next →" : "Finish Quiz ✓"}
      </button>
    </div>
  `;

  currentQuiz.selectedOption = null;

  // Option click handlers
  document.querySelectorAll(".quiz-option").forEach(opt => {
    opt.addEventListener("click", () => selectOption(parseInt(opt.dataset.index)));
  });

  document.getElementById("quiz-next-btn").addEventListener("click", nextQuestion);
}

function selectOption(index) {
  if (currentQuiz.selectedOption !== null) return; // Already answered
  currentQuiz.selectedOption = index;

  const q = currentQuiz.questions[currentQuiz.currentIndex];
  const isCorrect = index === q.correct;

  // Mark selected
  const allOpts = document.querySelectorAll(".quiz-option");
  allOpts.forEach(opt => opt.classList.add("disabled"));

  const selected = document.getElementById(`quiz-opt-${index}`);
  selected.classList.add(isCorrect ? "correct" : "wrong");

  // Show correct answer if setting enabled and answer was wrong
  if (!isCorrect && appState.settings.showCorrectAnswer) {
    document.getElementById(`quiz-opt-${q.correct}`).classList.add("correct");
  }

  // Record answer
  currentQuiz.answers.push({ questionIndex: currentQuiz.currentIndex, selected: index, correct: isCorrect });

  // Enable next
  document.getElementById("quiz-next-btn").disabled = false;
}

function nextQuestion() {
  if (currentQuiz.currentIndex < currentQuiz.questions.length - 1) {
    currentQuiz.currentIndex++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const correctCount = currentQuiz.answers.filter(a => a.correct).length;
  const total = currentQuiz.questions.length;
  const pct = Math.round((correctCount / total) * 100);

  // Save to history
  const record = {
    subject: currentQuiz.subject,
    correct: correctCount,
    total: total,
    percentage: pct,
    date: new Date().toISOString()
  };
  appState.history.push(record);
  updateStreak();
  saveState(appState);

  // Determine color
  const color = pct >= 80 ? "var(--accent-green)" : pct >= 50 ? "var(--accent-orange)" : "var(--accent-red)";

  // Result messaging
  let title, subtitle;
  if (pct === 100) {
    title = "🎉 Perfect Score!";
    subtitle = "Amazing! You got every question right!";
  } else if (pct >= 80) {
    title = "🌟 Great Job!";
    subtitle = "You really know your stuff! Keep it up!";
  } else if (pct >= 50) {
    title = "👍 Good Effort!";
    subtitle = "You're on the right track. Practice makes perfect!";
  } else {
    title = "💪 Keep Trying!";
    subtitle = "Don't give up! Review the material and try again.";
  }

  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (pct / 100) * circumference;

  const body = document.getElementById("quiz-body");
  body.innerHTML = `
    <div class="quiz-results">
      <div class="results-score-circle">
        <svg width="160" height="160">
          <circle class="results-score-bg" cx="80" cy="80" r="60"/>
          <circle class="results-score-fill" cx="80" cy="80" r="60"
            stroke="${color}"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            id="results-ring"/>
        </svg>
        <div class="results-score-value">
          <div class="score-number">${pct}%</div>
          <div class="score-label">Score</div>
        </div>
      </div>

      <h2 class="results-title">${title}</h2>
      <p class="results-subtitle">${subtitle}</p>

      <div class="results-stats">
        <div class="results-stat correct-stat">
          <div class="value">${correctCount}</div>
          <div class="label">Correct</div>
        </div>
        <div class="results-stat wrong-stat">
          <div class="value">${total - correctCount}</div>
          <div class="label">Wrong</div>
        </div>
        <div class="results-stat">
          <div class="value">+${correctCount * 10 + (pct === 100 ? 50 : 0)}</div>
          <div class="label">XP Earned</div>
        </div>
      </div>

      <div class="results-actions">
        <button class="quiz-btn secondary" id="results-back-btn">← Back to Dashboard</button>
        <button class="quiz-btn primary" id="results-retry-btn">Retry Quiz ↻</button>
      </div>
    </div>
  `;

  // Animate the result ring
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById("results-ring").style.strokeDashoffset = offset;
    });
  });

  document.getElementById("results-back-btn").addEventListener("click", () => navigateTo("dashboard"));
  document.getElementById("results-retry-btn").addEventListener("click", () => startQuiz(currentQuiz.subject));
}

// Quiz back button
document.getElementById("quiz-back-btn").addEventListener("click", () => navigateTo("dashboard"));

// ==========================================
// DAILY TASKS
// ==========================================
function renderDailyTasks() {
  const stats = getStats();
  const tasks = [
    { title: "Complete an English Quiz", desc: "Practice grammar and vocabulary", tag: "english", done: stats.englishCount > 0 && appState.lastActiveDate === new Date().toISOString().slice(0, 10) },
    { title: "Complete a Math Quiz", desc: "Sharpen your calculation skills", tag: "math", done: stats.mathCount > 0 && appState.lastActiveDate === new Date().toISOString().slice(0, 10) },
    { title: "Score above 80%", desc: "Aim for excellence in any subject", tag: null, done: appState.history.some(r => r.percentage >= 80 && r.date.slice(0, 10) === new Date().toISOString().slice(0, 10)) }
  ];

  const container = document.getElementById("daily-task-list");
  container.innerHTML = tasks.map(t => `
    <div class="task-item">
      <div class="task-checkbox ${t.done ? "checked" : ""}">
        ${t.done ? "✓" : ""}
      </div>
      <div class="task-item-info">
        <h4>${t.title}</h4>
        <p>${t.desc}</p>
      </div>
      ${t.tag ? `<span class="task-tag ${t.tag}">${t.tag.charAt(0).toUpperCase() + t.tag.slice(1)}</span>` : ""}
    </div>
  `).join("");

  // Update badge
  const remaining = tasks.filter(t => !t.done).length;
  document.getElementById("daily-task-count").textContent = remaining;
}

// ==========================================
// TASK HISTORY
// ==========================================
function renderHistory() {
  const container = document.getElementById("history-list");
  const history = [...appState.history].reverse();

  if (history.length === 0) {
    container.innerHTML = `
      <div class="task-item" style="justify-content: center; color: var(--text-muted);">
        No quiz history yet. Complete a quiz to see your results here!
      </div>
    `;
    return;
  }

  container.innerHTML = history.map(r => {
    const date = new Date(r.date);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const isEnglish = r.subject === "english";
    const color = r.percentage >= 80 ? "var(--accent-green)" : r.percentage >= 50 ? "var(--accent-orange)" : "var(--accent-red)";

    return `
      <div class="history-item">
        <div class="history-icon" style="background: ${isEnglish ? "rgba(139,92,246,0.15)" : "rgba(6,182,212,0.15)"}">
          ${isEnglish ? "📖" : "🔢"}
        </div>
        <div class="history-info">
          <h4>${isEnglish ? "English" : "Math"} Quiz</h4>
          <p>${dateStr} · ${r.correct}/${r.total} correct</p>
        </div>
        <div class="history-score" style="color: ${color}">${r.percentage}%</div>
      </div>
    `;
  }).join("");
}

// ==========================================
// PROFILE
// ==========================================
function renderProfile() {
  const stats = getStats();
  document.getElementById("profile-quizzes").textContent = stats.totalQuizzes;
  document.getElementById("profile-accuracy").textContent = stats.avgAccuracy + "%";
  document.getElementById("profile-xp").textContent = stats.xp;
}

// ==========================================
// ACHIEVEMENTS
// ==========================================
function renderAchievements() {
  const stats = getStats();
  const container = document.getElementById("achievements-grid");

  container.innerHTML = achievementsDef.map(a => {
    const unlocked = a.condition(stats);
    return `
      <div class="achievement-card ${unlocked ? "" : "locked"}">
        <div class="achievement-icon">${a.icon}</div>
        <h4>${a.name}</h4>
        <p>${a.desc}</p>
      </div>
    `;
  }).join("");
}

// ==========================================
// SETTINGS
// ==========================================
function refreshSettings() {
  document.querySelectorAll(".toggle-switch").forEach(toggle => {
    const key = toggle.dataset.setting;
    if (key && appState.settings[key] !== undefined) {
      toggle.classList.toggle("active", appState.settings[key]);
    }
  });
}

document.querySelectorAll(".toggle-switch").forEach(toggle => {
  toggle.addEventListener("click", () => {
    const key = toggle.dataset.setting;
    if (key && appState.settings[key] !== undefined) {
      appState.settings[key] = !appState.settings[key];
      toggle.classList.toggle("active", appState.settings[key]);
      saveState(appState);
    }
  });
});

document.getElementById("reset-progress-btn").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
    appState = getDefaultState();
    saveState(appState);
    navigateTo("dashboard");
  }
});

// ==========================================
// INIT
// ==========================================
function init() {
  updateStreak();
  refreshDashboard();
  renderDailyTasks();
}

init();
