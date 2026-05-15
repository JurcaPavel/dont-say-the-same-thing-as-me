(function () {
  'use strict';

  const DEFAULT_QUESTIONS = [
    { question: 'Name a fruit that is yellow.', answer: '' },
    { question: 'Name a famous scientist.', answer: '' },
    { question: 'Name a country in Europe.', answer: '' }
  ];

  const STORAGE_KEY = 'dssst-game-state';

  let questions = clone(DEFAULT_QUESTIONS);
  let currentIndex = 0;
  let playerCount = 4;

  // Elements
  const $ = (id) => document.getElementById(id);
  const setupScreen = $('setup-screen');
  const gameScreen = $('game-screen');
  const playerSlider = $('player-count');
  const playerOut = $('player-count-out');
  const uploadInput = $('json-upload');
  const uploadStatus = $('upload-status');
  const startBtn = $('start-btn');
  const playerDisplay = $('player-display');
  const qCurrent = $('q-current');
  const qTotal = $('q-total');
  const questionText = $('question-text');
  const answerInput = $('answer-input');
  const prevBtn = $('prev-btn');
  const nextBtn = $('next-btn');
  const exportBtn = $('export-btn');
  const resetBtn = $('reset-btn');

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        questions, currentIndex, playerCount
      }));
    } catch (e) { /* storage full or unavailable */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.questions) && saved.questions.length > 0) {
        questions = saved.questions;
        currentIndex = Math.min(saved.currentIndex || 0, questions.length - 1);
        playerCount = saved.playerCount || 4;
        playerSlider.value = playerCount;
        playerOut.textContent = playerCount;
        if (questions.length !== DEFAULT_QUESTIONS.length || hasAnswers(questions)) {
          uploadStatus.textContent = `Restored: ${questions.length} questions`;
        }
      }
    } catch (e) { /* corrupted state, ignore */ }
  }

  function hasAnswers(qs) {
    return qs.some(q => q.answer && q.answer.length > 0);
  }

  function renderQuestion() {
    qCurrent.textContent = currentIndex + 1;
    qTotal.textContent = questions.length;
    questionText.textContent = questions[currentIndex].question;
    answerInput.value = questions[currentIndex].answer || '';
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === questions.length - 1;
  }

  function setStatus(msg, type) {
    uploadStatus.textContent = msg;
    uploadStatus.className = 'status' + (type ? ' ' + type : '');
  }

  // Player count slider
  playerSlider.addEventListener('input', (e) => {
    playerCount = parseInt(e.target.value, 10);
    playerOut.textContent = playerCount;
  });

  // JSON upload
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!Array.isArray(parsed)) throw new Error('Expected a JSON array');
        const valid = parsed.filter(q => q && typeof q.question === 'string');
        if (valid.length === 0) throw new Error('No valid questions found');
        questions = valid.map(q => ({
          question: q.question,
          answer: typeof q.answer === 'string' ? q.answer : ''
        }));
        currentIndex = 0;
        setStatus(`Loaded ${questions.length} questions from ${file.name}`, 'success');
        saveState();
      } catch (err) {
        setStatus(`Error: ${err.message}`, 'error');
      }
    };
    reader.onerror = () => setStatus('Could not read file', 'error');
    reader.readAsText(file);
  });

  // Answer typing
  answerInput.addEventListener('input', (e) => {
    questions[currentIndex].answer = e.target.value;
    saveState();
  });

  // Start
  startBtn.addEventListener('click', () => {
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    playerDisplay.textContent = playerCount;
    renderQuestion();
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

  // Keyboard shortcuts (only when not typing in answer)
  document.addEventListener('keydown', (e) => {
    if (gameScreen.classList.contains('hidden')) return;
    if (document.activeElement === answerInput) return;
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
    questions = clone(DEFAULT_QUESTIONS);
    currentIndex = 0;
    playerCount = 4;
    playerSlider.value = playerCount;
    playerOut.textContent = playerCount;
    setStatus('Using 3 default questions');
    setupScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    saveState();
  });

  // Init
  loadState();
})();
