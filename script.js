/* ═══════════════════════════════════════════════════════
   A WORLD OF CHANGE — Test · script.js
   Flow (World Without Rules Test v2): Vocabulary → Comprehension →
   Written Response → Cloze, in order; each part opens when the one
   before it is turned in. No right/wrong while testing; the score shows
   at the end of each part.
   - Locked until the student has finished all three parts of the
     A World of Change Review on this computer (Marcos 10/7) — Teacher
     PIN can let one student skip that.
   - One try. A finished test shows "Test Already Completed"; a retake
     needs the Teacher PIN (new session ids, labeled "Retake").
   - Same question ids + skill tags as the review, so the dashboard
     compares review → test skill by skill.
   - Written: R.A.D. — three boxes (Restate, Answer, Detail) per question,
     each with sentence starters to read and retype (Marcos 10/9; the 10/7
     hint + ____ version failed in class).
   Game keys: awoc-test-vocab · awoc-test-comp · awoc-test-cloze
   Written: action:'written' → awoc_test_written
   PIN: 9377
═══════════════════════════════════════════════════════ */

/* ── CONFIG ─────────────────────────────────────────── */
const TEST_OPEN     = true;    // false = students locked out; only Teacher Access works. Set true to open.
const INSTRUCT_SECS = 20;
const READ_SECS     = 12;
const STORAGE_KEY   = 'awoct_session_v1';        // + ':' + name — each student's unfinished multiple-choice part
const SCORES_KEY    = 'awoct_scores_v1';         // finished parts: { name, section, round, … }
const WRITTEN_KEY   = 'awoct_written_v1';        // turned-in written answers: { name, round }
const DRAFT_KEY     = 'awoct_written_draft_v1';  // + ':' + name — each student's written answers being typed
const ROUNDS_KEY    = 'awoct_rounds_v1';         // { name: 1 = first try, 2+ = retakes }
const GATE_PASS_KEY = 'awoct_review_pass_v1';    // { name: true } — Teacher PIN skipped the review check
const REVIEW_SCORES_KEY = 'awoc_review_scores_v1';   // the review site's finished sections (same origin)

/* Saved progress and drafts are kept per student, so one student on a shared
   Chromebook can never wipe (or be handed) another student's place. */
function progressKey(name) { return STORAGE_KEY + ':' + name; }
function draftKey(name)    { return DRAFT_KEY + ':' + name; }
function newSessionBase()  { return 'AWOCT-' + Math.random().toString(36).slice(2, 9).toUpperCase(); }

// Fixed order — students cannot skip or reorder parts
const SECTION_SEQUENCE = ['vocab', 'comp', 'written', 'cloze'];
const GAME_KEYS = { vocab: 'awoc-test-vocab', comp: 'awoc-test-comp', cloze: 'awoc-test-cloze' };
const WRITTEN_GAME = 'awoc_test_written';
const WRITTEN_MIN_WORDS = 10;

// Story pages beside Comprehension and Written (the test's page numbers: title page = page 2)
const STORY_PAGES = [2, 3, 4, 5];

/* ── SHEET ──────────────────────────────────────────── */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzv8CWv1yyi8NeH04now9UxVL4IZm5yMqqsEGMcgGdrcAOWVB-aSp5siTvSSJXIUpzFMA/exec';

let tabSwitchCount = 0;

function readJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? fallback : v; } catch (e) { return fallback; }
}

/* Question HTML → plain text (Part II vocab underlines the word) */
function plainText(html) {
  return String(html || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(t) {
  return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* One saved miss: "[ID] (Skill) question (picked: answer)" — the standard every
   review/test uses. Skill comes from data/skills.js by question id. */
function missEntry(m) {
  const skill  = m.skill || (window.SKILLS || {})[m.id] || 'Unsorted';
  const picked = m.yourAnswer == null || m.yourAnswer === '' ? '' :
    ` (picked: ${String(m.yourAnswer).replace(/\s*\|\s*/g, ' / ').replace(/\s+/g, ' ').trim()})`;
  return `[${m.id}] (${skill}) ${plainText(m.q)}${picked}`;
}

/* First try = "Original", then "Retake 1", "Retake 2" … (the dashboard shows it per attempt) */
function roundLabel(round) { return round > 1 ? `Retake ${round - 1}` : 'Original'; }

// Same id for the partial rows and the final row of one part, so the final
// row replaces the in-progress row. The base is saved with the progress, so
// a resume after closing the tab keeps it too.
function attemptSessionId() {
  return (app.sessionBase || 'AWOCT-X') + '-' + (app.currentSection || 'x') + '-R' + (app.round || 1);
}

function scoreBody(done) {
  const total = app.currentBank.length;
  const pct   = total ? Math.round((app.score / total) * 100) : 0;
  return {
    action:         'submit',
    game:           GAME_KEYS[app.currentSection] || 'awoc-test',
    sessionId:      attemptSessionId(),
    name:           app.studentName || 'Unknown',
    form:           roundLabel(app.round || 1),
    section:        app.currentSection || '?',
    attempt:        app.round || 1,
    score:          app.score,
    total,
    percent:        pct,
    status:         done ? 'Complete' : `In Progress (Q${app.currentIndex + 1}/${total})`,
    done,
    elapsed:        app.timerSeconds,
    tabSwitches:    tabSwitchCount,
    wrongQuestions: (app.missedQuestions || []).map(missEntry).join(' | '),
    startedAt:      app.startedAt || '',
    finishedAt:     app.finishedAt || '',
    events:         JSON.stringify(app.events || []),
    timestamp:      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
  };
}

function submitScorePartial() {
  fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scoreBody(false)) }).catch(() => {});
}

function submitScoreFinal() {
  fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scoreBody(true)) }).catch(() => {});
}

/* Written answers: fixed 7-column row in the "awoc_test_written" tab (w1, w2, elapsed).
   No chronology fields — the handler ignores extra keys. */
function writtenSessionId(name, round) {
  return 'AWOCT-' + (String(name || '').replace(/[^A-Za-z0-9]/g, '') || 'guest') + '-written-R' + round;
}

function submitWrittenToSheet(name, round, responses, elapsedStr) {
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action:    'written',
      game:      WRITTEN_GAME,
      sessionId: writtenSessionId(name, round),
      name:      name || 'Unknown',
      w1: responses.W1 || '', w2: responses.W2 || '', w3: '',
      elapsed:   elapsedStr,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    })
  }).catch(() => {});
}

function saveWrittenDraftToServer(name, round, draft) {
  fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'draft', game: WRITTEN_GAME,
      name, sessionId: writtenSessionId(name, round),
      w1: draft.W1 || '', w2: draft.W2 || '', w3: ''
    })
  }).catch(() => {});
}

/* ── ROSTER ─────────────────────────────────────────── */
const ROSTER = [
  { name: "Mr. O (Teacher)",           id: "9377" },
  { name: "Avery, Jo'Von",             id: "10053632" },
  { name: "Belasquez Bonilla, Eduin",  id: "10058674" },
  { name: "Castaneda, Kelvin",         id: "10053248" },
  { name: "Chicas-Santos, Allison",    id: "10066737" },
  { name: "Collado, Roniel",           id: "10060249" },
  { name: "Dejesus, Michael",          id: "10049434" },
  { name: "Dock, Fakeem",              id: "10059720" },
  { name: "Douglas, Iyana",            id: "10070980" },
  { name: "Dumphrey, Christopher",     id: "10060696" },
  { name: "Flores, Kiara",             id: "10052834" },
  { name: "Johnson, Destiny",          id: "10052926" },
  { name: "Jones, Tahji",              id: "10060315" },
  { name: "Lawrence, Eric",            id: "10057451" },
  { name: "Madero, Jovany",            id: "10076374" },
  { name: "Pettway, Lanaura",          id: "10060616" },
  { name: "Polanco Soriano, Thiara",   id: "10060503" },
  { name: "Roberts, Robyn",            id: "10060925" },
  { name: "Rojas, Alanie",             id: "10076388" },
  { name: "Sanchez Rodriguez, Johanelyz", id: "10076767" },
  { name: "Vega, Taishmara",           id: "10054043" },
  { name: "Watts, Autumn",             id: "10039032" },
  { name: "Zelaya-Osorto, Nazareth",   id: "10053626" }
];

const GUEST_SLOTS = {
  '937701': 'Guest 1', '937702': 'Guest 2', '937703': 'Guest 3',
  '937704': 'Guest 4', '937705': 'Guest 5', '937706': 'Guest 6',
  '937707': 'Guest 7', '937708': 'Guest 8', '937709': 'Guest 9',
  '937710': 'Guest 10'
};

const SECTION_LABELS = { vocab: 'Vocabulary', comp: 'Comprehension', written: 'Written Response', cloze: 'Cloze' };

function sectionBank(section) {
  return section === 'vocab' ? window.VOCAB_BANK : section === 'comp' ? window.COMP_BANK : window.CLOZE_BANK;
}

/* ── BUILD DROPDOWN ─────────────────────────────────── */
(function buildRoster() {
  const sel = document.getElementById('name-select');
  ROSTER.forEach(s => {
    const o = document.createElement('option');
    o.value = s.name; o.textContent = s.name;
    sel.appendChild(o);
  });
  const div = document.createElement('option');
  div.disabled = true; div.textContent = '── Guest Slots ──';
  sel.appendChild(div);
  Object.entries(GUEST_SLOTS).forEach(([code, label]) => {
    const o = document.createElement('option');
    o.value = `GUEST:${code}`; o.textContent = `🙋 ${label}`;
    sel.appendChild(o);
  });
})();

/* ── ROUNDS, PARTS, REVIEW GATE ─────────────────────── */
function getRound(name) { return readJSON(ROUNDS_KEY, {})[name] || 1; }

function getCompletedSections(name) {
  const round = getRound(name);
  const done = new Set(readJSON(SCORES_KEY, [])
    .filter(s => s.name === name && s.done && (s.round || 1) === round).map(s => s.section));
  if (readJSON(WRITTEN_KEY, []).some(w => w.name === name && (w.round || 1) === round)) done.add('written');
  return done;
}

function getNextSection(name) {
  const done = getCompletedSections(name);
  return SECTION_SEQUENCE.find(s => !done.has(s)) || null;
}

/* The review must be finished first: all three sections, at least once, on this
   computer. The review lives on the same site (mroteacher.com), so its saved
   scores are readable here. */
function reviewStatus(name) {
  const done = new Set(readJSON(REVIEW_SCORES_KEY, []).filter(s => s.name === name && s.done).map(s => s.section));
  return { vocab: done.has('vocab'), comp: done.has('comp'), cloze: done.has('cloze') };
}

function reviewGateOpen(name) {
  if (readJSON(GATE_PASS_KEY, {})[name]) return true;
  const r = reviewStatus(name);
  return r.vocab && r.comp && r.cloze;
}

const STEP_META = [
  { key: 'vocab',   label: '📚 Vocabulary',       sub: `${(window.VOCAB_BANK || []).length} questions` },
  { key: 'comp',    label: '📖 Comprehension',     sub: `${(window.COMP_BANK || []).length} questions` },
  { key: 'written', label: '✍️ Written Response',  sub: `${(window.WRITTEN_PROMPTS || []).length} questions — your teacher grades these` },
  { key: 'cloze',   label: '✏️ Cloze (Fill-in)',   sub: `${(window.CLOZE_BANK || []).length} questions` }
];

function renderTestSequence(name) {
  const completed = getCompletedSections(name);
  const next      = getNextSection(name);
  const round     = getRound(name);

  const label = document.getElementById('sequence-label');
  if (label) label.textContent = round > 1 ? `Step 2 — Your Test (Retake ${round - 1})` : 'Step 2 — Your Test';

  const container = document.getElementById('test-sequence');
  if (!container) return;
  container.innerHTML = STEP_META.map((step, i) => {
    const done    = completed.has(step.key);
    const current = step.key === next;
    const bg      = done ? '#d4edda' : current ? '#eaf2ff' : '#f5f5f5';
    const border  = done ? '#28a745' : current ? '#a9c4f5' : '#e0e0e0';
    const color   = done ? '#155724' : current ? 'var(--primary)' : '#888';
    const icon    = done ? '✅' : current ? '▶' : (i + 1);
    const subText = done ? 'Done' : step.sub;
    const upNext  = current
      ? '<span style="font-size:0.72rem;font-weight:bold;background:var(--primary);color:white;border-radius:6px;padding:3px 10px;white-space:nowrap;">UP NEXT</span>'
      : '';
    return `<div style="display:flex;align-items:center;gap:14px;background:${bg};border:2px solid ${border};border-radius:12px;padding:11px 15px;margin-bottom:8px;">
      <div style="font-size:1.3rem;min-width:28px;text-align:center;color:${color};">${icon}</div>
      <div style="flex:1;">
        <div style="font-weight:bold;color:${color};font-size:var(--fs);">${step.label}</div>
        <div style="font-size:0.77rem;color:${done ? '#388e3c' : current ? '#555' : '#888'};margin-top:2px;">${subText}</div>
      </div>
      ${upNext}
    </div>`;
  }).join('');

  const btn = document.getElementById('btn-start-next');
  if (!btn) return;
  const meta = STEP_META.find(s => s.key === next);
  btn.disabled = !meta;
  btn.textContent = meta ? `▶ Start — ${meta.label}` : '🎉 All parts complete!';
}

/* Sign-in screen for this student: review gate → completed → the part list */
function renderStudentHome(name) {
  const gate = document.getElementById('review-gate');
  const doneCard = document.getElementById('completed-container');
  const seq = document.getElementById('section-select');
  const rc = document.getElementById('resume-container');
  [gate, doneCard, seq, rc].forEach(el => el && el.classList.add('hidden'));

  if (!reviewGateOpen(name)) {
    const r = reviewStatus(name);
    document.getElementById('review-gate-list').innerHTML = '<ul class="gate-list">' +
      [['vocab', '📚 Vocabulary'], ['comp', '📖 Comprehension'], ['cloze', '✏️ Cloze']].map(([k, l]) =>
        `<li class="${r[k] ? 'ok' : 'todo'}">${r[k] ? '✅' : '⬜'} Review — ${l}</li>`).join('') + '</ul>';
    gate.classList.remove('hidden');
    return;
  }
  if (!getNextSection(name)) {
    const round = getRound(name);
    document.getElementById('completed-detail').textContent = round > 1
      ? `You have finished all four parts of the test (Retake ${round - 1}).`
      : 'You have finished all four parts of the test.';
    doneCard.classList.remove('hidden');
    return;
  }
  seq.classList.remove('hidden');
  renderTestSequence(name);
  app.checkResume();
}

/* ── GENERAL HELPERS ─────────────────────────────────── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getFirstName(name) {
  if (!name) return 'Student';
  const parts = name.split(',');
  return parts.length > 1 ? parts[1].trim().split(' ')[0] : name.split(' ')[0];
}

function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length;
}

function wrapWords(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  let idx = 0;
  function walk(node) {
    if (node.nodeType === 3) {
      const text = node.textContent.replace(/—/g, ' — ').replace(/  +/g, ' ');
      const frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(part => {
        if (/\S/.test(part)) {
          const sp = document.createElement('span');
          sp.className = 'wrd'; sp.dataset.wi = idx++; sp.textContent = part;
          frag.appendChild(sp);
        } else if (part) {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else {
      [...node.childNodes].forEach(walk);
    }
  }
  walk(tmp);
  return tmp.innerHTML;
}

function choiceHtml(text) { return text.replace(/—/g, ' — '); }

function letterGradeStudent(pct) {
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 67) return 'D+';
  if (pct >= 63) return 'D';
  if (pct >= 60) return 'D-';
  return 'F';
}

/* ── SPEECH ─────────────────────────────────────────── */
let activeSpeakBtn   = null;
let reviewMode       = false;
let reviewAutoRun    = false;
let pinModalCallback = null;

let hlTimer = null;
function stopActiveSpeech() {
  clearTimeout(hlTimer);
  window.speechSynthesis.cancel();
  document.querySelectorAll('.wrd.hl').forEach(e => e.classList.remove('hl'));
  if (activeSpeakBtn) { activeSpeakBtn.textContent = '🔊'; activeSpeakBtn = null; }
}

/* ── HIGHLIGHT FALLBACK ─────────────────────────────
   Some voices (and some browsers) never fire word-boundary
   events, so the highlight would never move. If no boundary
   arrives shortly after speaking starts, step through the
   words on a timer paced by word length and speech rate. */
function addHighlightFallback(u, spans) {
  let fired = false, i = 0;
  const prevB = u.onboundary, prevE = u.onend;
  u.onboundary = e => { if (e.name === 'word' && !fired) { fired = true; clearTimeout(hlTimer); } if (prevB) prevB(e); };
  u.onend = e => { clearTimeout(hlTimer); spans.forEach(s => s.classList.remove('hl')); if (prevE) prevE(e); };
  const step = () => {
    if (fired) return;
    spans.forEach(s => s.classList.remove('hl'));
    if (i >= spans.length) return;
    const w = spans[i++];
    w.classList.add('hl');
    const len = (w.textContent || '').replace(/[^A-Za-z0-9]/g, '').length;
    hlTimer = setTimeout(step, Math.max(280, len * 70 + 120) / (u.rate || 1));
  };
  clearTimeout(hlTimer);
  hlTimer = setTimeout(step, 500);
}

/* Read one element aloud with word highlighting (toggle: tap again to stop).
   Icons are skipped; "…" is read as a pause. */
function speakElement(btn, el, rate) {
  if (activeSpeakBtn === btn) { stopActiveSpeech(); return; }
  stopActiveSpeech();
  if (!el) return;
  if (!el.querySelector('.wrd')) el.innerHTML = wrapWords(el.innerHTML);
  // skip labels marked data-noread (the R / A / D badge) and icon-only words
  const spans = Array.from(el.querySelectorAll('.wrd'))
    .filter(s => /[A-Za-z0-9_]/.test(s.textContent) && !s.closest('[data-noread]'));
  if (!spans.length) return;
  activeSpeakBtn = btn; btn.textContent = '⏹';
  // a short pause between lines: end a line with a period when it has no punctuation
  const words = spans.map(s => s.textContent.replace(/_{2,}/g, 'blank'));
  spans.forEach((s, i) => {
    const next = spans[i + 1];
    if (next && s.closest('div,p,li') !== next.closest('div,p,li') && !/[.!?:,;"”]$/.test(words[i])) words[i] += '.';
  });
  const text = words.join(' ');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = rate || 0.92;
  let hlIdx = 0;
  u.onboundary = e => {
    if (e.name !== 'word') return;
    spans.forEach(s => s.classList.remove('hl'));
    if (spans[hlIdx]) spans[hlIdx].classList.add('hl');
    hlIdx++;
  };
  u.onend = () => {
    spans.forEach(s => s.classList.remove('hl'));
    if (activeSpeakBtn === btn) { btn.textContent = '🔊'; activeSpeakBtn = null; }
  };
  addHighlightFallback(u, spans);
  window.speechSynthesis.speak(u);
}

function speakDir(btn) { speakElement(btn, btn.closest('.dir-section').querySelector('.dir-text'), 0.92); }
function speakWrittenPrompt(btn, promptId) { speakElement(btn, document.getElementById('prompt-text-' + promptId), 0.92); }

/* ── READ-ALOUD INTRO SPEAKS ITSELF ─────────────────
   Marcos 10/6: the "Read Aloud is Available!" screen announces itself
   the moment it opens — no reading, no button. The click on "Let's Begin"
   is the user gesture the browser needs. The icons are said as words, and
   each word lights up as it is read. Leaving the screen (app.show) cancels
   the speech. */
const INTRO_SAY = { '🔊': 'the speaker button', '⏹': 'the stop button', '—': ',' };
const INTRO_RATE = 0.82;   // Marcos 10/6: 0.92 ran ahead of the highlight
let introToken = 0, introTimer = null;
let introMsPerChar = null, introMsPerWord = null;   // learned from this device's voice
function speakReadAloudIntro() {
  stopActiveSpeech();
  clearTimeout(introTimer);
  const screen = document.getElementById('readaloud-screen');
  const els = Array.from(screen.querySelectorAll('.ra-read'));
  els.forEach(el => { if (!el.querySelector('.wrd')) el.innerHTML = wrapWords(el.innerHTML); });
  // One piece per SENTENCE (Marcos 10/6: the end of a long sentence lost its
  // highlight). Each piece = the words to say + the on-screen word each one lights.
  const pieces = [];
  els.forEach(el => {
    let words = [], wordSpan = [];
    const flush = () => { if (words.length) pieces.push({ words, wordSpan }); words = []; wordSpan = []; };
    el.querySelectorAll('.wrd').forEach(sp => {
      const t = sp.textContent.replace(/️/g, '').trim();
      const key = t.replace(/[.!?,]+$/, ''), punct = t.slice(key.length);   // "🔊." → icon + "."
      let say = INTRO_SAY[key] != null ? INTRO_SAY[key] + punct : (/[A-Za-z0-9]/.test(t) ? t : '');
      if (!say) return;
      if (say === ',') { if (words.length) words[words.length - 1] += ','; return; }
      if (/^the /.test(say) && /^(every|each)$/i.test(words[words.length - 1] || '')) say = say.slice(4);
      // past-tense "read" ("is read aloud") must sound like "red", not "reed" (Marcos 10/6)
      if (/^read[.!?,]?$/i.test(say) && /^(is|was|are|were|be|been|being)$/i.test(words[words.length - 1] || '')) say = say.replace(/^read/i, 'red');
      say.split(' ').forEach(w => { words.push(w); wordSpan.push(sp); });
      if (/[.!?]$/.test(say)) flush();
    });
    if (words.length && !/[.!?,]$/.test(words[words.length - 1])) words[words.length - 1] += '.';
    flush();
  });
  const factor = (typeof READ_SPEEDS !== 'undefined' && typeof readSpeed !== 'undefined' && READ_SPEEDS[readSpeed]) ? READ_SPEEDS[readSpeed].factor : 1;
  const rate = INTRO_RATE * factor;
  const token = ++introToken;
  const live = () => token === introToken && !screen.classList.contains('hidden');
  const sayPiece = k => {
    if (!live() || k >= pieces.length) return;
    const p = pieces[k];
    const text = p.words.join(' ');
    const starts = []; let pos = 0;
    p.words.forEach(w => { starts.push(pos); pos += w.length + 1; });
    const lit = new Set(p.wordSpan);
    let idx = -1, lastHeard = 0, startedAt = 0, viaVoice = false;
    const mark = j => {
      j = Math.max(0, Math.min(j, p.words.length - 1));
      if (j === idx) return;
      idx = j;
      lit.forEach(sp => sp.classList.remove('hl'));
      p.wordSpan[j].classList.add('hl');
    };
    // Watchdog: when the voice goes quiet about word positions (some voices
    // never report them, Chrome sometimes stops partway), step on at a
    // speaking pace — never past the last word, which stays lit until the end.
    const wordMs = w => introMsPerChar ? 0.92 * (w.length + 1) * introMsPerChar : (120 + w.replace(/[^A-Za-z0-9]/g, '').length * 55) / rate;
    const tick = () => {
      if (!live()) return;
      const base = wordMs(p.words[idx] || ''), quiet = Date.now() - lastHeard;
      const avg = Math.max(base, introMsPerWord || 0);
      if (idx >= 0 && viaVoice && quiet > avg * 1.8) {
        const n = Math.max(1, Math.floor(quiet / avg));
        viaVoice = false; mark(idx + n); lastHeard += n * avg;
      } else if (idx >= 0 && !viaVoice && quiet > base) {
        mark(idx + 1); lastHeard = Math.min(Date.now(), lastHeard + base);
      }
      introTimer = setTimeout(tick, 60);
    };
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = rate;
    u.onstart = () => { startedAt = lastHeard = Date.now(); mark(0); clearTimeout(introTimer); tick(); };
    u.onboundary = e => {
      if (e.name !== 'word') return;
      let j = 0;
      while (j + 1 < starts.length && starts[j + 1] <= e.charIndex) j++;
      mark(j); lastHeard = Date.now(); viaVoice = true;
    };
    u.onend = () => {
      clearTimeout(introTimer);
      const took = Date.now() - startedAt;
      if (startedAt && live() && took > 300) {
        const perChar = took / (text.length + 1);
        introMsPerChar = introMsPerChar ? (introMsPerChar + perChar) / 2 : perChar;
        const perWord = took / p.words.length;
        introMsPerWord = introMsPerWord ? (introMsPerWord + perWord) / 2 : perWord;
      }
      lit.forEach(sp => sp.classList.remove('hl'));
      if (live()) introTimer = setTimeout(() => sayPiece(k + 1), 250);
    };
    window.speechSynthesis.speak(u);
  };
  sayPiece(0);
}

/* ── SESSION EVENT LOG ───────────────────────────────
   start · leave · return · resume · close · finish, each with the
   on-task clock. elapsed is time ON TASK: the timer pauses while the
   page is hidden and counts ticks, so a slept device cannot inflate it. */
function logEvent(kind, extra) {
  if (!app.events) app.events = [];
  app.events.push(Object.assign({
    at: new Date().toISOString(),
    e:  kind,
    q:  (app.currentIndex || 0) + 1,
    on: app.timerSeconds || 0
  }, extra || {}));
  if (app.events.length > 200) app.events.splice(0, app.events.length - 200);
}

/* ══════════════════════════════════════════════════════
   APP OBJECT
══════════════════════════════════════════════════════ */
const app = {

  studentName:      '',
  currentSection:   '',
  currentBank:      [],
  currentIndex:     0,
  score:            0,
  missedQuestions:  [],
  responses:        {},
  round:            1,
  sessionBase:      '',
  selectedIndices:  new Set(),
  questionLocked:   false,
  timerSeconds:     0,
  timerInterval:    null,
  timerOn:          false,
  instructInterval: null,
  readInterval:     null,

  show(id) {
    ['start-screen','readaloud-screen','directions-screen','quiz-screen','end-screen','written-screen','scoreboard-screen']
      .forEach(s => document.getElementById(s).classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    // Leaving the quiz screen drops the two-sided Comprehension layout; leaving
    // the written screen drops its two-sided layout too
    if (id !== 'quiz-screen') this._applyCompLayout(false);
    if (id !== 'written-screen') { document.body.classList.remove('written-active'); this._stopWrittenTimer(); }
    window.scrollTo(0, 0);   // every new screen starts at the top
    window.speechSynthesis.cancel();
  },

  /* ── TWO-SIDED COMPREHENSION LAYOUT ── */
  _applyCompLayout(isComp) {
    const qs = document.getElementById('quiz-screen');
    if (qs) qs.classList.toggle('comp-mode', isComp);
    document.body.classList.toggle('comp-active', isComp);
  },

  _setupStoryPanel(targetId) {
    const panel = document.getElementById(targetId);
    if (!panel || panel.querySelector('.story-page')) return;
    panel.innerHTML = STORY_PAGES.map(p =>
      `<figure class="story-page" data-page="${p}">
         <span class="story-page-label">Page ${p}</span>
         <img src="assets/story/page-${p}.webp?v=pages2" alt="A World of Change — page ${p}" class="story-page-img">
       </figure>`
    ).join('');
    // Page positions are only known once the pictures load — open to the
    // current question's page again when each one arrives (first question).
    if (targetId === 'story-panel-imgs') {
      panel.querySelectorAll('img').forEach(img => img.addEventListener('load', () => {
        const q = this.currentBank[this.currentIndex];
        if (this.currentSection === 'comp' && q) this._focusStoryPage(q.page);
      }));
    }
  },

  /* Open the story to the page this question is about and ring it */
  _focusStoryPage(page) {
    const panel  = document.getElementById('story-panel-imgs');
    const header = document.getElementById('story-panel-header');
    if (!panel) return;
    panel.querySelectorAll('.story-page').forEach(f => f.classList.toggle('story-focus', Number(f.dataset.page) === page));
    const fig = panel.querySelector(`.story-page[data-page="${page}"]`);
    if (header) header.textContent = fig ? `📖 A World of Change — look at page ${page}` : '📖 A World of Change';
    if (fig) panel.scrollTop = Math.max(0, fig.offsetTop - 6);
  },

  init() {
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── WELCOME / DIRECTIONS ── */
  showReadAloudIntro() {
    if (!TEST_OPEN) return;
    document.getElementById('welcome-panel').classList.add('hidden');
    this.show('readaloud-screen');
    setTimeout(speakReadAloudIntro, 150);   // announces itself (show() just cancelled any speech)
    const btn = document.getElementById('readaloud-btn');
    const fill = document.getElementById('readaloud-fill');
    const count = document.getElementById('readaloud-count');
    btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
    count.textContent = 6; fill.style.transition = 'none'; fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = 'width 6s linear'; fill.style.width = '0%';
    }));
    let remaining = 6;
    const iv = setInterval(() => {
      remaining--; count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv); btn.disabled = false; btn.style.opacity = '1';
        btn.style.cursor = 'pointer'; btn.textContent = "✅ Got It — Show Me the Directions!";
      }
    }, 1000);
  },

  showDirections() {
    this.show('directions-screen');
    this.startInstructionsTimer();
  },

  showLogin() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    window.speechSynthesis.cancel();
    document.querySelectorAll('.dir-text .wrd.hl').forEach(e => e.classList.remove('hl'));
    this.studentName = '';
    ['resume-container', 'section-select', 'review-gate', 'completed-container']
      .forEach(id => document.getElementById(id).classList.add('hidden'));
    const lc = document.getElementById('login-step-card');
    if (lc) lc.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.add('hidden');
    document.getElementById('student-login-panel').classList.remove('hidden');
  },

  /* ── NAME SELECT / LOGIN ── */
  onNameSelect() {
    const val = document.getElementById('name-select').value;
    const pinSec = document.getElementById('pin-section');
    const guestSec = document.getElementById('guest-name-section');
    document.getElementById('login-error').textContent = '';
    if (!val) { pinSec.classList.add('hidden'); return; }
    pinSec.classList.remove('hidden');
    if (val.startsWith('GUEST:')) {
      guestSec.classList.remove('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter guest code:';
    } else {
      guestSec.classList.add('hidden');
      document.getElementById('pin-label').textContent = '🔒 Enter your student number:';
    }
    setTimeout(() => document.getElementById('student-pin').focus(), 80);
  },

  attemptLogin() {
    const selVal = document.getElementById('name-select').value;
    const pin    = document.getElementById('student-pin').value.trim();
    const errEl  = document.getElementById('login-error');
    errEl.textContent = '';
    if (!selVal) { errEl.textContent = '⚠️ Please select your name.'; return; }
    if (!pin)    { errEl.textContent = '⚠️ Please enter your student number.'; return; }

    let displayName = '';
    if (selVal.startsWith('GUEST:')) {
      const code = selVal.replace('GUEST:', '');
      if (pin !== code) { errEl.textContent = '❌ Incorrect guest code. Try again.'; return; }
      const firstName = (document.getElementById('guest-display-name').value || '').trim();
      if (!firstName) { errEl.textContent = '⚠️ Please enter your first name.'; return; }
      displayName = firstName + ' (Guest)';
    } else {
      const student = ROSTER.find(s => s.name === selVal);
      if (!student || student.id !== pin) { errEl.textContent = '❌ Incorrect student number. Try again.'; return; }
      displayName = selVal;
    }

    this.studentName = displayName;
    document.getElementById('student-pin').value = '';
    const lc = document.getElementById('login-step-card');
    if (lc) lc.classList.add('hidden');
    renderStudentHome(displayName);
  },

  /* ── REVIEW GATE (Teacher PIN skip) ── */
  skipReviewGate() {
    if (!this.studentName) return;
    this.showPinModal(
      '🔑 Start Without the Review',
      `Enter Teacher PIN to let ${getFirstName(this.studentName)} take the test before finishing the review on this computer.`,
      () => {
        const pass = readJSON(GATE_PASS_KEY, {});
        pass[this.studentName] = true;
        localStorage.setItem(GATE_PASS_KEY, JSON.stringify(pass));
        renderStudentHome(this.studentName);
      }
    );
  },

  /* ── RETAKE (Teacher PIN) ── */
  requestRetake() {
    if (!this.studentName) return;
    this.showPinModal(
      '🔑 Allow a Retake',
      `Enter Teacher PIN to let ${getFirstName(this.studentName)} take the whole test again. The first scores are kept.`,
      () => {
        const rounds = readJSON(ROUNDS_KEY, {});
        rounds[this.studentName] = getRound(this.studentName) + 1;
        localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds));
        localStorage.removeItem(progressKey(this.studentName));
        renderStudentHome(this.studentName);
      }
    );
  },

  /* ── SEQUENTIAL PART START ── */
  startNextSection() {
    if (!this.studentName || !reviewGateOpen(this.studentName)) return;
    const next = getNextSection(this.studentName);
    if (!next) { renderStudentHome(this.studentName); return; }
    if (next === 'written') this.showWrittenScreen();
    else this.startSession(next);
  },

  continueToNextSection() {
    stopConfetti();
    if (reviewMode) { this._showReviewPicker(); return; }
    const next = getNextSection(this.studentName);
    if (!next) { this.showScores(true); return; }
    if (next === 'written') this.showWrittenScreen();
    else this.startSession(next);
  },

  /* ── TEACHER REVIEW MODE ── */
  promptTeacherReview() {
    const pin = prompt('Enter Teacher PIN to access Review Mode:');
    if (pin !== '9377') { if (pin !== null) alert('Incorrect PIN.'); return; }
    this.studentName = 'Mr. O (Teacher)';
    reviewMode = true;
    this._showReviewPicker();
  },

  _showReviewPicker() {
    const section = prompt('Choose a part to preview:\n1 — Vocabulary\n2 — Comprehension\n3 — Written Response\n4 — Cloze\n\nEnter 1, 2, 3, or 4:');
    const map = { '1': 'vocab', '2': 'comp', '3': 'written', '4': 'cloze' };
    if (!map[section]) { if (section !== null) alert('Invalid choice.'); this.exitReviewMode(); return; }
    if (map[section] === 'written') { this.showWrittenScreen(); return; }
    const mode = prompt('Mode:\n1 — Manual (tap Next)\n2 — Auto-run\n\nEnter 1 or 2:');
    if (mode !== '1' && mode !== '2') { if (mode !== null) alert('Invalid.'); this.exitReviewMode(); return; }
    reviewAutoRun = (mode === '2');
    this.startSession(map[section]);
  },

  exitReviewMode() {
    reviewMode = false; reviewAutoRun = false;
    this.stopTimerEngine();
    this.studentName = '';
    document.getElementById('review-mode-banner').classList.add('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  _autoAnswer() {
    const q = this.currentBank[this.currentIndex];
    const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
    document.querySelectorAll('.answer-btn').forEach((btn, i) => {
      if (answers.includes(i)) { this.selectedIndices.add(i); btn.classList.add('selected'); }
    });
    setTimeout(() => { if (reviewMode) this.confirmAnswer(); }, 600);
  },

  /* ── START A MULTIPLE-CHOICE PART ── */
  startSession(section) {
    document.getElementById('tab-warning-banner').classList.add('hidden');
    const banner = document.getElementById('review-mode-banner');
    banner.classList.toggle('hidden', !reviewMode);
    if (reviewMode) {
      banner.querySelector('span').textContent = reviewAutoRun
        ? '🔍 Teacher Review Mode — auto-run (nothing is saved)'
        : '🔍 Teacher Review Mode — tap Next to advance (nothing is saved)';
    }

    this.events = []; this.startedAt = new Date().toISOString(); this.finishedAt = '';
    tabSwitchCount = 0;
    if (!reviewMode) localStorage.removeItem(progressKey(this.studentName));
    this.currentSection  = section;
    this.score           = 0;
    this.currentIndex    = 0;
    this.timerSeconds    = 0;
    this.missedQuestions = [];
    this.responses       = {};
    this.questionLocked  = false;
    this.round           = reviewMode ? 1 : getRound(this.studentName);
    this.sessionBase     = newSessionBase();   // fresh per part, so no two students or parts share a row

    const rawBank = [...sectionBank(section)];
    const shuffleQ = q => {
      const indexed = q.choices.map((text, i) => ({ text, origIdx: i }));
      shuffle(indexed);
      return { id: q.id, q: q.q, page: q.page || null, choices: indexed.map(c => c.text),
               answer: indexed.findIndex(c => c.origIdx === q.answer) };
    };

    if (section === 'comp') {
      // Story details first (shuffled), then the Part A → Part B pairs (pairs shuffled, A always before B)
      const pairIds = window.COMP_PAIRS || [];
      const inPair  = new Set(pairIds.flat());
      const details = rawBank.filter(q => !inPair.has(q.id));
      const pairs   = pairIds.map(([a, b]) => [rawBank.find(q => q.id === a), rawBank.find(q => q.id === b)])
        .filter(p => p[0] && p[1]);
      shuffle(details); shuffle(pairs);
      const flatPairs = pairs.flatMap(([partA, partB]) => {
        const aQ = shuffleQ(partA), bQ = shuffleQ(partB);
        bQ.pairOf = partA.id;   // Part B shows the student's own Part A answer
        return [aQ, bQ];
      });
      this.currentBank = [...details.map(shuffleQ), ...flatPairs];
    } else {
      this.currentBank = rawBank.map(shuffleQ);
      shuffle(this.currentBank);
    }

    this._enterQuiz();
    logEvent('start');
    this.startTimer();
    this.renderQuestion();
  },

  // Quiz screen in the right layout: Comprehension = story left, question right
  _enterQuiz() {
    const isComp = this.currentSection === 'comp';
    if (isComp) this._setupStoryPanel('story-panel-imgs');
    this.show('quiz-screen');
    this._applyCompLayout(isComp);
  },

  /* ── RESUME / SAVE ── */
  checkResume() {
    const saved = this.studentName ? readJSON(progressKey(this.studentName), null) : null;
    const rc = document.getElementById('resume-container');
    const ss = document.getElementById('section-select');
    if (saved && this.studentName && saved.studentName === this.studentName && (saved.round || 1) === getRound(this.studentName)) {
      const qNum = Math.min(saved.currentIndex + 1, saved.currentBank.length);
      document.getElementById('resume-detail').textContent =
        `${SECTION_LABELS[saved.currentSection]} — Q${qNum} of ${saved.currentBank.length}`;
      rc.classList.remove('hidden');
      ss.classList.add('hidden');
    } else {
      rc.classList.add('hidden');
    }
  },

  resumeSession() {
    const saved = readJSON(progressKey(this.studentName), null);
    if (!saved) return;
    this.studentName     = saved.studentName;
    this.currentSection  = saved.currentSection;
    this.currentBank     = saved.currentBank;
    this.currentIndex    = saved.currentIndex;
    this.score           = saved.score;
    this.missedQuestions = saved.missedQuestions || [];
    this.responses       = saved.responses || {};
    this.timerSeconds    = saved.timerSeconds || 0;
    this.round           = saved.round || 1;
    this.sessionBase     = saved.sessionBase || newSessionBase();
    this.questionLocked  = false;
    tabSwitchCount       = saved.tabSwitches || 0;
    this.events = saved.events || [];
    this.startedAt = saved.startedAt || new Date().toISOString();
    this.finishedAt = '';
    document.getElementById('review-mode-banner').classList.add('hidden');
    logEvent('resume');
    this._enterQuiz();
    this.startTimer();
    // Saved right after answering the last question → nothing left to ask
    if (this.currentIndex >= this.currentBank.length) { this._finishSession(); return; }
    this.renderQuestion();
  },

  saveProgress() {
    if (reviewMode || !this.studentName) return;
    localStorage.setItem(progressKey(this.studentName), JSON.stringify({
      studentName:     this.studentName,
      currentSection:  this.currentSection,
      currentBank:     this.currentBank,
      currentIndex:    this.questionLocked ? this.currentIndex + 1 : this.currentIndex, // answered → resume at the next one
      score:           this.score,
      missedQuestions: this.missedQuestions,
      responses:       this.responses,
      timerSeconds:    this.timerSeconds,
      round:           this.round,
      sessionBase:     this.sessionBase,
      tabSwitches:     tabSwitchCount,
      events:          this.events,
      startedAt:       this.startedAt
    }));
  },

  discardProgress() {
    this.showPinModal(
      '🗑️ Discard Progress',
      'Enter Teacher PIN to clear the part in progress. The student will start that part fresh.',
      () => {
        localStorage.removeItem(progressKey(this.studentName));
        renderStudentHome(this.studentName);
      }
    );
  },

  /* ── TIMER ── */
  startTimer() {
    this.stopTimerEngine();
    this.timerOn = true;
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      this._tickTimer();
      if (this.timerSeconds % 30 === 0) this.saveProgress();
    }, 1000);
  },

  stopTimerEngine() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    this.timerOn = false;
  },

  _tickTimer() {
    const m = String(Math.floor(this.timerSeconds / 60)).padStart(2, '0');
    const s = String(this.timerSeconds % 60).padStart(2, '0');
    const el = document.getElementById('timer-display');
    if (el) el.textContent = `${m}:${s}`;
  },

  startInstructionsTimer() {
    if (this.instructInterval) { clearInterval(this.instructInterval); this.instructInterval = null; }
    const btn   = document.getElementById('ready-btn');
    const fill  = document.getElementById('instruct-fill');
    const count = document.getElementById('instruct-count');
    if (!btn) return;
    btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed';
    if (count) count.textContent = INSTRUCT_SECS;
    if (fill) {
      fill.style.transition = 'none'; fill.style.width = '100%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = `width ${INSTRUCT_SECS}s linear`; fill.style.width = '0%';
      }));
    }
    let remaining = INSTRUCT_SECS;
    this.instructInterval = setInterval(() => {
      remaining--;
      if (count) count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.instructInterval); this.instructInterval = null;
        btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
        btn.textContent = "✅ I'm Ready — Let's Begin!";
      }
    }, 1000);
  },

  /* ── READ LOCK (12s) ── */
  startReadTimer() {
    if (this.readInterval) { clearInterval(this.readInterval); this.readInterval = null; }
    const bar   = document.getElementById('reading-timer-bar');
    const fill  = document.getElementById('reading-fill');
    const count = document.getElementById('reading-count');

    if (reviewMode) {
      bar.classList.add('hidden');
      document.querySelectorAll('.answer-btn').forEach(b => { b.classList.remove('locked-choice'); b.disabled = false; });
      if (reviewAutoRun) setTimeout(() => { if (reviewMode) this._autoAnswer(); }, 300);
      else document.getElementById('confirm-btn').classList.remove('hidden');
      return;
    }

    bar.classList.remove('hidden');
    count.textContent = READ_SECS;
    fill.style.transition = 'none'; fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${READ_SECS}s linear`; fill.style.width = '0%';
    }));
    document.querySelectorAll('.answer-btn').forEach(b => { b.classList.add('locked-choice'); b.disabled = true; });

    let remaining = READ_SECS;
    this.readInterval = setInterval(() => {
      remaining--; count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(this.readInterval); this.readInterval = null;
        bar.classList.add('hidden');
        document.querySelectorAll('.answer-btn').forEach(b => { b.classList.remove('locked-choice'); b.disabled = false; });
        document.getElementById('confirm-btn').classList.remove('hidden');
      }
    }, 1000);
  },

  /* ── RENDER QUESTION ── */
  renderQuestion() {
    const q      = this.currentBank[this.currentIndex];
    const total  = this.currentBank.length;
    const isLast = this.currentIndex === total - 1;

    document.getElementById('progress-text').textContent = `Question ${this.currentIndex + 1} of ${total}`;
    document.getElementById('name-badge').textContent    = getFirstName(this.studentName);
    document.getElementById('progress-fill').style.width = `${(this.currentIndex / total) * 100}%`;

    const qtEl = document.getElementById('question-text');
    qtEl.innerHTML = wrapWords(q.q);
    this._renderPrevRecap(q);
    if (this.currentSection === 'comp') this._focusStoryPage(q.page);

    document.getElementById('confirm-btn').classList.add('hidden');
    const nextBtn = document.getElementById('next-btn');
    nextBtn.classList.add('hidden');
    nextBtn.textContent = isLast ? '✅ Turn In This Part' : 'Next ➡️';

    this.selectedIndices = new Set();
    this.questionLocked  = false;
    const wrap = document.getElementById('answers');
    wrap.innerHTML = '';

    q.choices.forEach((text, i) => {
      const row = document.createElement('div');
      row.className = 'answer-row';

      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.innerHTML = `<strong>${['A','B','C','D','E'][i]}.</strong>&nbsp;<span class="choice-text">${choiceHtml(text)}</span>`;
      btn.onclick = () => this._selectChoice(i, btn);

      const speakBtn = document.createElement('button');
      speakBtn.className = 'choice-speak-btn';
      speakBtn.textContent = '🔊';
      speakBtn.title = 'Read this choice aloud';
      speakBtn.onclick = e => {
        e.stopPropagation();
        speakElement(speakBtn, btn.querySelector('.choice-text'), 0.92);
      };

      row.appendChild(speakBtn);
      row.appendChild(btn);
      wrap.appendChild(row);
    });

    if (this.currentIndex > 0 && this.currentIndex % 5 === 0 && !reviewMode) submitScorePartial();
    this.saveProgress();
    document.getElementById('answers').classList.remove('hidden');
    this.startReadTimer();
    qtEl.focus({ preventScroll: true });   // keyboard users start on the new question
  },

  /* ── PART A ANSWER (on its Part B) ──
     The test keeps the test wording ("…supports the answer to Part A?") and
     shows the student's own Part A answer — no right/wrong on the test. */
  _renderPrevRecap(q) {
    const el = document.getElementById('prev-answer-recap');
    if (!el) return;
    const prev = q.pairOf ? this.responses[q.pairOf] : null;
    if (!prev) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    el.innerHTML =
      `<div class="recap-head">
         <button class="speak-btn recap-speak" onclick="speakElement(this, this.parentNode.querySelector('.recap-line'), 0.92)" title="Read your answer to Part A aloud">🔊</button>
         <div class="recap-lines">
           <div class="recap-line"><span class="recap-label">📌 Your answer to Part A:</span> <span class="recap-ans">“${choiceHtml(prev.pick || '')}”</span></div>
         </div>
       </div>`;
    el.classList.remove('hidden');
  },

  _selectChoice(i, btn) {
    if (this.questionLocked) return;
    document.querySelectorAll('.answer-btn').forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-checked', 'false'); });
    this.selectedIndices = new Set([i]);
    btn.classList.add('selected');
    btn.setAttribute('aria-checked', 'true');
  },

  /* ── CONFIRM ANSWER (no right/wrong on the test) ── */
  confirmAnswer() {
    if (this.selectedIndices.size === 0) return;
    this.questionLocked = true;

    const q = this.currentBank[this.currentIndex];
    const pickIdx = [...this.selectedIndices][0];
    const picked  = q.choices[pickIdx];
    const correct = pickIdx === q.answer;
    this.responses[q.id] = { pick: picked, correct };

    if (correct) this.score++;
    else this.missedQuestions.push({ id: q.id, q: plainText(q.q), skill: (window.SKILLS || {})[q.id], yourAnswer: picked });

    document.querySelectorAll('.answer-btn').forEach((btn, i) => {
      btn.disabled = true;
      if (reviewMode) {
        if (i === q.answer) btn.classList.add('correct');
        else if (i === pickIdx) btn.classList.add('incorrect');
      }
    });

    document.getElementById('confirm-btn').classList.add('hidden');
    this.saveProgress();

    if (reviewMode && reviewAutoRun) {
      setTimeout(() => { if (reviewMode) this.nextQuestion(); }, 800);
    } else {
      const nb = document.getElementById('next-btn');
      nb.classList.remove('hidden');
      nb.focus({ preventScroll: true });
    }
  },

  nextQuestion() {
    stopActiveSpeech();
    if (this.currentIndex + 1 >= this.currentBank.length) {
      this.currentIndex++;
      this._finishSession();
    } else {
      this.currentIndex++;
      this.renderQuestion();
    }
  },

  /* ── FINISH A PART ── */
  _finishSession() {
    this.finishedAt = new Date().toISOString(); logEvent('finish');
    this.stopTimerEngine();
    if (this.readInterval) { clearInterval(this.readInterval); this.readInterval = null; }
    if (!reviewMode) localStorage.removeItem(progressKey(this.studentName));

    const total = this.currentBank.length;
    const pct   = Math.round((this.score / total) * 100);
    const date  = new Date();

    if (!reviewMode) {
      const scores = readJSON(SCORES_KEY, []);
      scores.push({
        name: this.studentName, section: this.currentSection, round: this.round,
        score: this.score, total, pct, elapsed: this.timerSeconds,
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        done: true
      });
      localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
      submitScoreFinal();
    }

    let msg;
    if (pct === 100)    msg = '⭐ PERFECT SCORE!';
    else if (pct >= 90) msg = 'Outstanding Work! 🌟';
    else if (pct >= 80) msg = 'Great Job! 👏';
    else if (pct >= 70) msg = 'Good Effort! 💪';
    else if (pct >= 60) msg = 'Keep Working Hard! 📚';
    else                msg = 'Good try — keep going! 📚';

    this.show('end-screen');
    document.getElementById('review-next-btn').classList.toggle('hidden', !reviewMode);
    document.getElementById('final-score-sub').textContent =
      `${SECTION_LABELS[this.currentSection]}${this.round > 1 ? ' · Retake ' + (this.round - 1) : ''} · ${this.studentName}`;
    document.getElementById('final-msg').textContent = msg;

    const pctEl = document.getElementById('final-percent');
    pctEl.classList.remove('revealed');
    pctEl.innerHTML =
      `${this.score}/${total}<br><small style="font-size:0.5em;color:${pct >= 70 ? 'var(--correct)' : 'var(--danger)'};">${pct}% · ${letterGradeStudent(pct)}</small>`;
    setTimeout(() => pctEl.classList.add('revealed'), 50);

    const wrap = document.getElementById('continue-btn-wrap');
    const btn  = document.getElementById('continue-btn');
    if (reviewMode) {
      wrap.classList.add('hidden');
    } else {
      const next = getNextSection(this.studentName);
      const meta = STEP_META.find(s => s.key === next);
      btn.textContent = meta ? `Continue to ${meta.label} →` : '🎉 See My Test Scores';
      wrap.classList.remove('hidden');
      setTimeout(() => btn.focus({ preventScroll: true }), 60);
    }

    if (pct >= 90) startConfetti(pct);
  },

  /* ══ WRITTEN RESPONSE — R.A.D. ══
     Each question = three boxes (Restate, Answer, Detail). Above each box the
     sentence starters are SHOWN for the student to read, hear and retype —
     nothing is inserted for them and there are no blanks (Marcos 10/9). The
     three boxes are put together underneath as "Your R.A.D. answer". */
  _writtenPreview: false,

  _radIds(p) { return (window.RAD_STEPS || []).map(st => `${p.id}-${st.key}`); },

  showWrittenScreen() {
    this._writtenPreview = reviewMode;
    this.currentSection = 'written';
    this.round = reviewMode ? 1 : getRound(this.studentName);
    this.show('written-screen');
    document.body.classList.add('written-active');
    document.getElementById('written-body').classList.remove('hidden');
    document.getElementById('written-teacher-note').classList.toggle('hidden', !reviewMode);
    document.getElementById('written-directions').textContent = window.WRITTEN_DIRECTIONS || '';
    this._setupStoryPanel('written-story-imgs');

    const container = document.getElementById('written-prompts-container');
    container.innerHTML = '';
    container.classList.remove('hidden');
    (window.WRITTEN_PROMPTS || []).forEach(p => {
      const steps = (window.RAD_STEPS || []).map(st => {
        const fid = `${p.id}-${st.key}`;
        const lines = ((p.starters || {})[st.key] || []).map(t => `<div class="rad-starter-line">${t}</div>`).join('');
        return `
          <div class="rad-step rad-step-${st.key}">
            <div class="rad-step-head">
              <button class="speak-btn" onclick="speakElement(this, document.getElementById('rad-read-${fid}'), 0.92)" title="Read this part aloud">🔊</button>
              <div id="rad-read-${fid}">
                <div class="rad-step-title"><span class="rad-letter" data-noread>${st.key}</span> ${st.name}</div>
                <div class="rad-step-tip">${((p.tips || {})[st.key]) || st.tip}</div>
                <div class="rad-starter">
                  <div class="rad-starter-label">Start like this:</div>
                  ${lines}
                </div>
              </div>
            </div>
            <textarea class="written-textarea rad-box" id="textarea-${fid}" rows="3"
                      aria-label="${p.label} — ${st.name}" placeholder="Type your ${st.name} sentence here…"
                      oninput="app._updateWordCount('${p.id}'); app._autosaveDraft()"></textarea>
          </div>`;
      }).join('');
      const card = document.createElement('div');
      card.className = 'written-prompt-card';
      card.innerHTML = `
        <div class="written-prompt-head">
          <button class="speak-btn" onclick="speakWrittenPrompt(this,'${p.id}')" title="Read the question aloud">🔊</button>
          <div class="written-prompt-label">${p.label}</div>
        </div>
        <div class="written-prompt-text" id="prompt-text-${p.id}">${p.prompt}</div>
        ${steps}
        <div class="rad-built hidden" id="rad-built-${p.id}">
          <div class="rad-step-head">
            <button class="speak-btn" onclick="speakElement(this, document.getElementById('rad-built-text-${p.id}'), 0.92)" title="Read your answer aloud">🔊</button>
            <div>
              <div class="rad-built-label">📝 Your R.A.D. answer:</div>
              <div class="rad-built-text" id="rad-built-text-${p.id}"></div>
            </div>
          </div>
        </div>
        <div class="word-count-row">Words: <span class="word-count-val" id="wc-${p.id}">0</span><span style="color:#888;font-size:0.8rem;"> / ${WRITTEN_MIN_WORDS} minimum</span></div>`;
      container.appendChild(card);
    });

    const btn = document.getElementById('submit-written-btn');
    btn.classList.remove('hidden'); btn.disabled = false; btn.textContent = '✅ Turn In My Written Answers';
    document.getElementById('written-submit-error').textContent = '';
    document.getElementById('written-success-panel').classList.add('hidden');
    this._restoreDraft();
    (window.WRITTEN_PROMPTS || []).forEach(p => this._updateWordCount(p.id));
    this._startWrittenTimer();
  },

  _radParts(p) {
    return (window.RAD_STEPS || []).map(st => {
      const ta = document.getElementById(`textarea-${p.id}-${st.key}`);
      return { st, text: ta ? ta.value.trim() : '' };
    });
  },

  /* Word count for the whole question + the put-together paragraph (shown as plain text) */
  _updateWordCount(id) {
    const p = (window.WRITTEN_PROMPTS || []).find(x => x.id === id);
    if (!p) return;
    const parts = this._radParts(p);
    const words = parts.reduce((n, x) => n + countWords(x.text), 0);
    const el = document.getElementById(`wc-${id}`);
    if (el) { el.textContent = words; el.style.color = words >= WRITTEN_MIN_WORDS ? '#27ae60' : 'var(--danger)'; }
    const built = document.getElementById(`rad-built-${id}`);
    const txt = document.getElementById(`rad-built-text-${id}`);
    const para = parts.map(x => x.text).filter(Boolean).join(' ');
    if (txt) txt.textContent = para;
    if (built) built.classList.toggle('hidden', !para);
  },

  _autosaveDraftTimer: null,
  _autosaveDraft() {
    if (this._writtenPreview) return;
    const draft = {};
    (window.WRITTEN_PROMPTS || []).forEach(p => this._radIds(p).forEach(fid => {
      const ta = document.getElementById(`textarea-${fid}`); if (ta) draft[fid] = ta.value;
    }));
    const name = this.studentName, round = this.round;
    localStorage.setItem(draftKey(name), JSON.stringify({ name, round, draft }));
    clearTimeout(this._autosaveDraftTimer);
    this._autosaveDraftTimer = setTimeout(() => saveWrittenDraftToServer(name, round, this._writtenPayload()), 3000);
  },

  _restoreDraft() {
    if (this._writtenPreview) return;
    const saved = readJSON(draftKey(this.studentName), null);
    if (!saved || saved.name !== this.studentName || (saved.round || 1) !== this.round || !saved.draft) return;
    Object.entries(saved.draft).forEach(([fid, val]) => {
      const ta = document.getElementById(`textarea-${fid}`);
      if (ta && val) ta.value = val;
    });
  },

  /* What the teacher sees: one line per R.A.D. part, labeled */
  _writtenPayload() {
    const out = {};
    (window.WRITTEN_PROMPTS || []).forEach(p => {
      out[p.id] = this._radParts(p).filter(x => x.text)
        .map(x => `${x.st.key} — ${x.st.name}: ${x.text}`).join('\n');
    });
    return out;
  },

  _writtenTimerSeconds: 0,
  _writtenTimerInterval: null,
  _startWrittenTimer() {
    this._stopWrittenTimer();
    this._writtenTimerSeconds = 0; this._tickWrittenTimer();
    this._writtenTimerInterval = setInterval(() => {
      if (document.hidden) return;              // time ON TASK, like the main timer
      this._writtenTimerSeconds++; this._tickWrittenTimer();
    }, 1000);
  },
  _stopWrittenTimer() { if (this._writtenTimerInterval) { clearInterval(this._writtenTimerInterval); this._writtenTimerInterval = null; } },
  _writtenClock() {
    const m = String(Math.floor(this._writtenTimerSeconds / 60)).padStart(2, '0');
    const s = String(this._writtenTimerSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  },
  _tickWrittenTimer() {
    const el = document.getElementById('written-timer-display');
    if (el) el.textContent = this._writtenClock();
  },

  submitWrittenResponses() {
    const prompts = window.WRITTEN_PROMPTS || [];
    const errEl = document.getElementById('written-submit-error');
    if (!prompts.length) { errEl.textContent = '⚠️ The written questions did not load. Please refresh the page.'; return; }

    const errors = [];
    if (!this._writtenPreview) {
      prompts.forEach(p => {
        const parts = this._radParts(p);
        const empty = parts.filter(x => countWords(x.text) < 2).map(x => x.st.name);
        if (empty.length) errors.push(`${p.label}: write your ${empty.length > 2 ? empty.slice(0, -1).join(', ') + ', and ' + empty[empty.length - 1] : empty.join(' and ')} ${empty.length > 1 ? 'sentences' : 'sentence'}.`);
        const total = parts.reduce((n, x) => n + countWords(x.text), 0);
        if (!empty.length && total < WRITTEN_MIN_WORDS) errors.push(`${p.label} needs at least ${WRITTEN_MIN_WORDS} words (you have ${total}).`);
      });
    }
    if (errors.length) { errEl.textContent = '⚠️ ' + errors.join('  '); return; }
    errEl.textContent = '';
    stopActiveSpeech();
    this._stopWrittenTimer();
    clearTimeout(this._autosaveDraftTimer);

    if (!this._writtenPreview) {
      submitWrittenToSheet(this.studentName, this.round, this._writtenPayload(), this._writtenClock());
      const written = readJSON(WRITTEN_KEY, []);
      written.push({ name: this.studentName, round: this.round, timestamp: new Date().toISOString() });
      localStorage.setItem(WRITTEN_KEY, JSON.stringify(written));
      localStorage.removeItem(draftKey(this.studentName));
    }

    document.getElementById('written-body').classList.add('hidden');
    document.body.classList.remove('written-active');
    document.getElementById('submit-written-btn').classList.add('hidden');
    const cont = document.getElementById('written-continue-btn');
    cont.textContent = this._writtenPreview ? '🔍 Preview Another Part' : 'Continue to Cloze ✏️ →';
    document.getElementById('written-success-panel').classList.remove('hidden');
    window.scrollTo(0, 0);
    cont.focus({ preventScroll: true });
  },

  /* ── SPEAK QUESTION ── */
  speakQuestion() {
    const qBtn = document.getElementById('speak-q-btn');
    if (activeSpeakBtn === qBtn) { stopActiveSpeech(); return; }
    stopActiveSpeech();
    const qtEl    = document.getElementById('question-text');
    const qtSpans = Array.from(qtEl.querySelectorAll('.wrd'));
    if (!qtSpans.length) return;
    activeSpeakBtn = qBtn; qBtn.textContent = '⏹';
    const qtText  = qtSpans.map(s => s.textContent).join(' ').replace(/_+/g, 'blank');
    let hlIdx = 0;
    const u = new SpeechSynthesisUtterance(qtText);
    u.lang = 'en-US'; u.rate = 0.92;
    u.onboundary = e => {
      if (e.name !== 'word') return;
      qtSpans.forEach(el => el.classList.remove('hl'));
      if (qtSpans[hlIdx]) qtSpans[hlIdx].classList.add('hl');
      hlIdx++;
    };
    u.onend = () => {
      qtSpans.forEach(el => el.classList.remove('hl'));
      if (activeSpeakBtn === qBtn) { qBtn.textContent = '🔊'; activeSpeakBtn = null; }
    };
    addHighlightFallback(u, qtSpans);
    window.speechSynthesis.speak(u);
  },

  /* ── SCOREBOARD (this student only) ── */
  showScores(autoShow = false) {
    this.show('scoreboard-screen');
    const teacherBtns = document.getElementById('teacher-score-btns');
    if (teacherBtns) teacherBtns.style.display = this.studentName === 'Mr. O (Teacher)' ? 'flex' : 'none';
    if (!reviewMode) this._startScoreLock(autoShow ? 30 : 0);

    const mine   = readJSON(SCORES_KEY, []).filter(s => s.name === this.studentName && s.done);
    const listEl = document.getElementById('score-list');
    const noEl   = document.getElementById('no-scores-msg');
    if (!mine.length) { listEl.innerHTML = ''; noEl.style.display = 'block'; return; }
    noEl.style.display = 'none';

    const round = getRound(this.studentName);
    const writtenDone = getCompletedSections(this.studentName).has('written');
    const summaryCards = STEP_META.map(step => {
      const label = step.label.replace(/^[^\s]+\s/, '');
      if (step.key === 'written') {
        return `<div class="sb-summary-card">
          <div class="sb-summary-label">Written</div>
          <div class="sb-summary-grade" style="color:${writtenDone ? '#27ae60' : '#aaa'};font-size:1.6rem;">${writtenDone ? '✅' : '—'}</div>
          <div class="sb-summary-score" style="color:#555;">${writtenDone ? 'Turned in' : 'Not yet'}</div>
        </div>`;
      }
      const row = mine.filter(s => s.section === step.key && (s.round || 1) === round).pop();
      if (!row) return `<div class="sb-summary-card sb-incomplete">
        <div class="sb-summary-label">${label}</div>
        <div class="sb-summary-grade" style="color:#ccc;">—</div>
        <div class="sb-summary-score" style="color:#888;">Not yet</div></div>`;
      const gc = row.pct >= 90 ? '#27ae60' : row.pct >= 80 ? '#2980b9' : row.pct >= 70 ? '#f39c12' : row.pct >= 60 ? '#e67e22' : '#e74c3c';
      return `<div class="sb-summary-card">
        <div class="sb-summary-label">${label}</div>
        <div class="sb-summary-grade" style="color:${gc};">${letterGradeStudent(row.pct)}</div>
        <div class="sb-summary-score">${row.score}/${row.total} · ${row.pct}%</div>
      </div>`;
    }).join('');

    const details = ['vocab', 'comp', 'cloze'].map(sec => {
      const rows = mine.filter(s => s.section === sec);
      if (!rows.length) return '';
      const tableRows = rows.map(r => {
        const cls = r.pct >= 90 ? 'score-good' : r.pct >= 70 ? 'score-ok' : 'score-bad';
        return `<tr><td>${roundLabel(r.round || 1)}</td><td>${r.score}/${r.total}</td>
          <td class="${cls}">${r.pct}%</td>
          <td class="${cls}" style="font-weight:800;">${letterGradeStudent(r.pct)}</td>
          <td>${r.time || '—'}</td><td>${r.date}</td></tr>`;
      }).join('');
      return `<h3 style="color:var(--primary);margin:22px 0 8px;border-bottom:2px solid #e0e0e0;padding-bottom:6px;">${SECTION_LABELS[sec]}</h3>
        <table class="scoreboard-table"><thead><tr><th>Try</th><th>Score</th><th>%</th><th>Grade</th><th>Time</th><th>Date</th></tr></thead>
        <tbody>${tableRows}</tbody></table>`;
    }).join('');

    listEl.innerHTML = `
      <div style="margin-bottom:6px;font-size:0.8rem;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(this.studentName)}${round > 1 ? ' · Retake ' + (round - 1) : ''}</div>
      <div class="sb-summary-row">${summaryCards}</div>
      <div style="margin-top:24px;">${details}</div>`;
  },

  _startScoreLock(secs) {
    const bar     = document.getElementById('sb-lock-bar');
    const fill    = document.getElementById('sb-lock-fill');
    const count   = document.getElementById('sb-lock-count');
    const buttons = document.querySelectorAll('#scoreboard-screen button');
    if (!secs || secs <= 0) { if (bar) bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden'); count.textContent = secs;
    fill.style.transition = 'none'; fill.style.width = '100%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fill.style.transition = `width ${secs}s linear`; fill.style.width = '0%';
    }));
    buttons.forEach(b => { b.disabled = true; b.style.opacity = '0.4'; });
    let remaining = secs;
    const iv = setInterval(() => {
      remaining--; count.textContent = remaining;
      if (remaining <= 0) {
        clearInterval(iv); bar.classList.add('hidden');
        buttons.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
      }
    }, 1000);
  },

  clearScores() {
    document.getElementById('clear-confirm-panel').classList.remove('hidden');
    document.getElementById('clear-pin-input').value = '';
    document.getElementById('clear-pin-error').textContent = '';
    setTimeout(() => document.getElementById('clear-pin-input').focus(), 80);
  },

  confirmClearScores() {
    const pin = document.getElementById('clear-pin-input').value.trim();
    if (pin === '9377') {
      [SCORES_KEY, WRITTEN_KEY, ROUNDS_KEY].forEach(k => localStorage.removeItem(k));
      Object.keys(localStorage).filter(k => k.startsWith(STORAGE_KEY + ':') || k.startsWith(DRAFT_KEY + ':'))
        .forEach(k => localStorage.removeItem(k));
      document.getElementById('clear-confirm-panel').classList.add('hidden');
      this.showScores();
    } else {
      document.getElementById('clear-pin-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('clear-pin-input').value = '';
      document.getElementById('clear-pin-input').focus();
    }
  },

  cancelClearScores() {
    document.getElementById('clear-confirm-panel').classList.add('hidden');
  },

  /* ── RESTART ── */
  restart() {
    stopConfetti();
    this.stopTimerEngine();
    reviewMode = false; reviewAutoRun = false;
    document.getElementById('review-mode-banner').classList.add('hidden');
    this.timerSeconds = 0;
    this.studentName  = '';
    document.getElementById('name-select').value = '';
    document.getElementById('student-pin').value = '';
    document.getElementById('pin-section').classList.add('hidden');
    ['section-select', 'resume-container', 'review-gate', 'completed-container']
      .forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById('login-error').textContent = '';
    const lc = document.getElementById('login-step-card');
    if (lc) lc.classList.remove('hidden');
    this.show('start-screen');
    document.getElementById('welcome-panel').classList.remove('hidden');
    document.getElementById('student-login-panel').classList.add('hidden');
  },

  /* ── PIN MODAL ── */
  showPinModal(title, msg, onSuccess) {
    pinModalCallback = onSuccess;
    document.getElementById('pin-modal-title').textContent = title;
    document.getElementById('pin-modal-msg').textContent   = msg;
    document.getElementById('pin-modal-input').value       = '';
    document.getElementById('pin-modal-error').textContent = '';
    document.getElementById('pin-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('pin-modal-input').focus(), 80);
  },

  confirmPinModal() {
    const pin = document.getElementById('pin-modal-input').value.trim();
    if (pin === '9377') {
      document.getElementById('pin-modal').classList.add('hidden');
      const cb = pinModalCallback; pinModalCallback = null;
      if (cb) cb();
    } else {
      document.getElementById('pin-modal-error').textContent = '❌ Incorrect PIN. Try again.';
      document.getElementById('pin-modal-input').value = '';
      document.getElementById('pin-modal-input').focus();
    }
  },

  cancelPinModal() {
    document.getElementById('pin-modal').classList.add('hidden');
    pinModalCallback = null;
  }
};

/* ── VISIBILITY / UNLOAD ─────────────────────────────── */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!app.timerOn) return;
    tabSwitchCount++;
    logEvent('leave');
    app.stopTimerEngine();
    app.saveProgress();
    if (app.instructInterval) clearInterval(app.instructInterval);
    if (app.readInterval) { clearInterval(app.readInterval); app.readInterval = null; app._readLockPaused = true; }
    app._wasTimerRunning = true;
  } else {
    if (!app._wasTimerRunning) return;
    app._wasTimerRunning = false;
    logEvent('return');
    const wb = document.getElementById('tab-warning-banner');
    if (wb) wb.classList.remove('hidden');
    app.startTimer();
    // The read lock stopped while the page was hidden; start it over so the
    // answers unlock again (left alone they stayed locked until a refresh).
    if (app._readLockPaused) { app._readLockPaused = false; app.startReadTimer(); }
  }
});

window.addEventListener('beforeunload', () => {
  if (app.timerOn) { logEvent('close'); app.saveProgress(); }
});

/* ── CONFETTI ─────────────────────────────────────────── */
const canvas = document.getElementById('confetti-canvas');
const ctx    = canvas.getContext('2d');
let particles = [], animId = null;

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

function startConfetti(pct) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  particles = [];
  const count = pct === 100 ? 300 : 220;
  const cols  = pct === 100
    ? ['#FFD700','#c9a227','#FFFACD','#FFA500','#ffffff']
    : ['#1a3a6b','#c0392b','#2ecc71','#3498db','#9b59b6','#e74c3c','#FFD700'];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      c: cols[~~(Math.random() * cols.length)],
      s: Math.random() * 5 + 3, d: Math.random() * 5 + 2, r: Math.random() * Math.PI * 2
    });
  }
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r += 0.05);
    ctx.fillStyle = p.c; ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
    ctx.restore();
    p.y += p.d; p.x += Math.sin(p.r) * 1.5;
    if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
  });
  animId = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  if (animId) cancelAnimationFrame(animId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  animId = null;
}

/* ── BOOT ─────────────────────────────────────────────── */
app.init();

/* ── CLOSED-TO-STUDENTS LOCK ────────────────────────── */
(function applyTestLock() {
  if (TEST_OPEN) return;
  const btn = document.querySelector('.lgs-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.classList.add('locked');
  btn.textContent = '🔒 Not Open Yet';
  const note = document.createElement('p');
  note.className = 'locked-note';
  note.textContent = 'Mr. O will let you know when the test is ready!';
  btn.insertAdjacentElement('afterend', note);
})();
