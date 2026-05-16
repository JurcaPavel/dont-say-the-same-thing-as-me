(function () {
  'use strict';

  const STORAGE_KEY = 'dssst-game-state';

  let allQuestions = [];
  let questions = [];
  let currentIndex = 0;
  let playerCount = 4;
  let selectedCategory = 'all';
  let selectedDifficulty = 'easy';
  let progress = {}; // last question index per "category|difficulty"

  // Elements
  const $ = (id) => document.getElementById(id);
  const setupScreen = $('setup-screen');
  const gameScreen = $('game-screen');
  const playerSlider = $('player-count');
  const playerOut = $('player-count-out');
  const uploadStatus = $('upload-status');
  const startBtn = $('start-btn');
  const playerDisplay = $('player-display');
  const eliminateBtn = $('eliminate-btn');
  const qJump = $('q-jump');
  const qTotal = $('q-total');
  const questionText = $('question-text');
  const questionTextCs = $('question-text-cs');
  const answerInput = $('answer-input');
  const prevBtn = $('prev-btn');
  const nextBtn = $('next-btn');
  const exportBtn = $('export-btn');
  const resetBtn = $('reset-btn');
  const gameMetaLabel = $('game-meta-label');
  const categoryBtns = document.querySelectorAll('#category-grid .btn-category');
  const difficultyBtns = document.querySelectorAll('#difficulty-grid .btn-category');

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function progressKey() {
    return selectedCategory + '|' + selectedDifficulty;
  }

  function saveState() {
    // While a game is in progress, remember where we are for this
    // category + difficulty so we resume here next time.
    if (!gameScreen.classList.contains('hidden')) {
      progress[progressKey()] = currentIndex;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentIndex, playerCount, selectedCategory, selectedDifficulty, progress
      }));
    } catch (e) { /* storage full or unavailable */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw);
      if (saved && typeof saved === 'object') {
        currentIndex = Math.min(saved.currentIndex || 0, allQuestions.length - 1);
        if (saved.progress && typeof saved.progress === 'object') progress = saved.progress;
        playerCount = saved.playerCount || 4;
        playerSlider.value = playerCount;
        playerOut.textContent = playerCount;
        if (saved.selectedCategory) applyCategory(saved.selectedCategory);
        if (saved.selectedDifficulty) {
          // Legacy: the old single "eliminating" difficulty was split into
          // eliminating-2..6 and eliminating-7plus. Fall back to the largest bucket.
          const d = saved.selectedDifficulty === 'eliminating'
            ? 'eliminating-2' : saved.selectedDifficulty;
          applyDifficulty(d);
        }
        return true;
      }
    } catch (e) { /* corrupted state, ignore */ }
    return false;
  }

  function applyCategory(cat) {
    selectedCategory = cat;
    categoryBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.category === cat));
    updateStatus();
  }

  function applyDifficulty(diff) {
    selectedDifficulty = diff;
    difficultyBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.difficulty === diff));
    updateStatus();
  }

  function countMatching() {
    return allQuestions.filter(q =>
      (selectedCategory === 'all' || q.category === selectedCategory) &&
      q.difficulty === selectedDifficulty
    ).length;
  }

  function updateStatus() {
    const count = countMatching();
    if (count === 0) {
      setStatus('No questions for this combination.', 'error');
    } else {
      setStatus(`${count} question${count !== 1 ? 's' : ''} available`);
    }
    startBtn.disabled = count === 0;
  }

  function renderQuestion() {
    qJump.value = currentIndex + 1;
    qJump.max = questions.length;
    qTotal.textContent = questions.length;
    questionText.textContent = questions[currentIndex].question;
    questionTextCs.textContent = questions[currentIndex]['question-cs'] || '';
    answerInput.value = questions[currentIndex].answer || '';
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === questions.length - 1;
  }

  function setStatus(msg, type) {
    uploadStatus.textContent = msg;
    uploadStatus.className = 'status' + (type ? ' ' + type : '');
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // "eliminating-7plus" -> "Eliminating 7+", "easy" -> "Easy"
  function formatDifficulty(d) {
    if (d && d.indexOf('eliminating-') === 0) {
      return 'Eliminating ' + d.slice('eliminating-'.length).replace('plus', '+');
    }
    return capitalize(d);
  }

  // Category buttons
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => applyCategory(btn.dataset.category));
  });

  // Difficulty buttons
  difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => applyDifficulty(btn.dataset.difficulty));
  });

  // Player count slider
  playerSlider.addEventListener('input', (e) => {
    playerCount = parseInt(e.target.value, 10);
    playerOut.textContent = playerCount;
  });

  // Answer typing
  answerInput.addEventListener('input', (e) => {
    questions[currentIndex].answer = e.target.value;
    saveState();
  });

  // Start
  startBtn.addEventListener('click', () => {
    questions = clone(allQuestions).filter(q =>
      (selectedCategory === 'all' || q.category === selectedCategory) &&
      q.difficulty === selectedDifficulty
    );
    if (questions.length === 0) return;
    const resumeAt = progress[progressKey()];
    currentIndex = (typeof resumeAt === 'number')
      ? Math.min(Math.max(resumeAt, 0), questions.length - 1)
      : 0;
    const catLabel = selectedCategory === 'all' ? 'All' : capitalize(selectedCategory);
    gameMetaLabel.textContent = `${catLabel} · ${formatDifficulty(selectedDifficulty)}`;
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    playerDisplay.textContent = playerCount;
    renderQuestion();
    saveState();
  });

  // Eliminate player
  eliminateBtn.addEventListener('click', () => {
    if (playerCount <= 1) return;
    playerCount--;
    playerDisplay.textContent = playerCount;
    eliminateBtn.disabled = playerCount <= 1;
    saveState();
  });

  // Navigation
  function goPrev() {
    if (currentIndex > 0) { currentIndex--; renderQuestion(); saveState(); }
  }
  function goNext() {
    if (currentIndex < questions.length - 1) { currentIndex++; renderQuestion(); saveState(); }
  }
  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  // Jump to a question by number
  function jumpToQuestion() {
    const n = parseInt(qJump.value, 10);
    if (!isNaN(n) && n >= 1 && n <= questions.length) {
      currentIndex = n - 1;
      renderQuestion();
      saveState();
    } else {
      qJump.value = currentIndex + 1; // restore valid value
    }
  }
  qJump.addEventListener('change', jumpToQuestion);
  qJump.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { jumpToQuestion(); qJump.blur(); }
  });

  // Keyboard shortcuts (only when not typing in answer)
  document.addEventListener('keydown', (e) => {
    if (gameScreen.classList.contains('hidden')) return;
    if (document.activeElement === answerInput) return;
    if (document.activeElement === qJump) return;
    if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'ArrowRight') goNext();
  });

  // Export
  exportBtn.addEventListener('click', () => {
    const data = JSON.stringify(questions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `game-answers-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    if (!confirm('Start a new game? This will clear all your answers.')) return;
    currentIndex = 0;
    playerCount = 4;
    playerSlider.value = playerCount;
    playerOut.textContent = playerCount;
    updateStatus();
    setupScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    saveState();
  });

  // Init — questions preloaded from questions.js
  function init() {
    allQuestions = QUESTIONS.map(q => ({
      category: q.category || 'general',
      difficulty: q.difficulty || 'normal',
      question: q.question,
      'question-cs': typeof q['question-cs'] === 'string' ? q['question-cs'] : '',
      answer: ''
    }));
    loadState();
    updateStatus();
  }

  init();
})();
