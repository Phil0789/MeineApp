// ============================================================
// KONFIGURATION
// ============================================================

const PROJECT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#64748b', '#a16207',
];

const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];
const WEEKDAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

const STORAGE_KEY = 'aufgaben_data_v1';

function uid() {
  return crypto?.randomUUID?.() || (Date.now().toString(36) + Math.random().toString(36).slice(2));
}

function countNodes(nodes) {
  return nodes.reduce((sum, n) => sum + 1 + countNodes(n.children), 0);
}

const ICONS = {
  mic:         `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4zm0 2a2 2 0 0 1 2 2v7a2 2 0 0 1-4 0V5a2 2 0 0 1 2-2zM7 12a1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.08A7 7 0 0 0 19 12a1 1 0 0 0-2 0 5 5 0 0 1-10 0z"/></svg>`,
  trash:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  edit:        `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z"/></svg>`,
  tasks:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>`,
  folder:      `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`,
  add:         `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  inbox:       `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12h-4c0 1.66-1.34 3-3 3s-3-1.34-3-3H5V5h14v10z"/></svg>`,
  calendar:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14v11zm-7-7h5v5h-5z"/></svg>`,
  chevLeft:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>`,
  chevRight:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>`,
  dateClock:   `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5C3.89 3 3.01 3.9 3.01 5L3 19a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>`,
  mindmap:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"/></svg>`,
};

// ============================================================
// STATE
// ============================================================

let state = {
  view: 'inbox',        // 'inbox' | 'tasks' | 'calendar' | 'projects' | 'mindmaps'
  projects: [],
  tasks: [],
  captures: [],
  mindmaps: [],
  filter: null,         // null = all, or project id
  showCompleted: false,

  // Inbox capture
  inboxInput: '',
  inboxInterim: '',
  inboxVoiceActive: false,
  inboxShowPresets: false,
  inboxPresetDueAt: null,
  inboxPresetLabel: '',
  activeReminder: null,
  mindmapSuggestion: null,   // { captureId, mindmapId }
  jumpToCaptureId: null,

  // Mindmaps view
  mindmapDetailId: null,
  showAddMindmap: false,
  newMindmapTitle: '',
  newMindmapTags: '',
  newMindmapKeywords: '',
  addingNodeMindmapId: null,
  addingNodeParentId: null,
  newNodeText: '',

  // Recording
  recording: false,
  textMode: false,
  interimText: '',
  textInputValue: '',

  // Assign modal
  assigning: false,
  assignText: '',
  assignDueDate: '',
  editingAssign: false,

  // Project form (add)
  showAddProject: false,
  newProjectName: '',
  newProjectColor: PROJECT_COLORS[5],

  // Project editing
  editingProjectId: null,
  editProjectName: '',
  editProjectColor: PROJECT_COLORS[5],

  // Calendar
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  calendarSelectedDay: null,
};

// ============================================================
// STORAGE
// ============================================================

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.projects = data.projects || [];
    state.tasks    = data.tasks    || [];
    state.mindmaps = data.mindmaps || [];

    if (Array.isArray(data.captures) && data.captures.length > 0) {
      // Already migrated - just load
      state.captures = data.captures;
    } else if (state.tasks.length > 0) {
      // Migrate old tasks -> captures (runs once)
      state.captures = state.tasks.map((t) => ({
        id:        t.id,
        text:      t.title || t.text || '',
        type:      'task',
        category:  'Inbox',
        projectId: t.projectId || null,
        dueAt:     t.dueDate ? t.dueDate + 'T00:00:00' : null,
        createdAt: new Date(t.createdAt).toISOString(),
        doneAt:    t.done ? (t.completedAt ? new Date(t.completedAt).toISOString() : new Date().toISOString()) : null,
        priority:  null,
      }));
      saveData(); // persist migration immediately
      console.info('Migration: ' + state.captures.length + ' Tasks -> Captures');
    }
  } catch (e) {
    console.error('Ladefehler:', e);
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      projects: state.projects,
      tasks:    state.tasks,
      captures: state.captures,
      mindmaps: state.mindmaps,
    }));
  } catch {
    showToast('Speichern fehlgeschlagen');
  }
  if (_sb) scheduleSyncToSupabase();
}

// ============================================================
// SUPABASE SYNC
// ============================================================

let _sbSyncTimer = null;

function scheduleSyncToSupabase() {
  clearTimeout(_sbSyncTimer);
  _sbSyncTimer = setTimeout(() => {
    dbPushAll({
      captures: state.captures,
      projects: state.projects,
      mindmaps: state.mindmaps,
    });
  }, 2000);
}

async function syncWithSupabase() {
  if (!navigator.onLine) return;
  try {
    // Push any locally-made changes first
    if (isSyncPending()) {
      await dbPushAll({ captures: state.captures, projects: state.projects, mindmaps: state.mindmaps });
    }

    const remote = await dbFetchAll();
    if (!remote) return;

    const merged = mergeData(
      { captures: state.captures, projects: state.projects, mindmaps: state.mindmaps },
      remote
    );

    // Upload local-only items that Supabase doesn't have yet
    const hasLocalOnly =
      merged.captures.length > remote.captures.length ||
      merged.projects.length > remote.projects.length ||
      merged.mindmaps.length > remote.mindmaps.length;
    if (hasLocalOnly) await dbPushAll(merged);

    state.captures = merged.captures;
    state.projects = merged.projects;
    state.mindmaps = merged.mindmaps;

    // Persist merged result locally without triggering another sync round
    clearTimeout(_sbSyncTimer);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        projects: state.projects,
        tasks:    state.tasks,
        captures: state.captures,
        mindmaps: state.mindmaps,
      }));
    } catch {}

    render();
    showToast('Synchronisiert');
  } catch (e) {
    console.warn('syncWithSupabase error:', e);
  }
}

// ============================================================
// SPEECH RECOGNITION
// ============================================================

let recognition = null;

function initSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return false;

  recognition = new SR();
  recognition.lang = 'de-DE';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += t;
      else interim += t;
    }
    if (state.inboxVoiceActive) {
      if (final) {
        state.inboxInput = final.trim();
        state.inboxInterim = '';
        state.inboxVoiceActive = false;
      } else {
        state.inboxInterim = interim;
      }
    } else if (final) {
      state.recording = false;
      state.assigning = true;
      state.assignText = final.trim();
      state.editingAssign = false;
    } else {
      state.interimText = interim;
    }
    render();
  };

  recognition.onerror = (event) => {
    if (event.error === 'no-speech') showToast('Keine Sprache erkannt – bitte nochmal versuchen');
    else if (event.error === 'not-allowed') showToast('Mikrofonzugriff verweigert');
    else if (event.error !== 'aborted') showToast('Sprachfehler: ' + event.error);
    state.recording = false;
    state.inboxVoiceActive = false;
    state.inboxInterim = '';
    render();
  };

  recognition.onend = () => {
    if (state.inboxVoiceActive) { state.inboxVoiceActive = false; state.inboxInterim = ''; render(); }
    else if (state.recording) { state.recording = false; render(); }
  };

  return true;
}

function startListening() {
  if (!recognition) { openTextMode(); return; }
  state.recording = true;
  state.textMode = false;
  state.interimText = '';
  render();
  try { recognition.start(); } catch { state.recording = false; render(); }
}

function startInboxVoice() {
  if (!recognition) { showToast('Spracherkennung nicht verfügbar'); return; }
  state.inboxVoiceActive = true;
  state.inboxInterim = '';
  render();
  try { recognition.start(); } catch { state.inboxVoiceActive = false; render(); }
}

function stopListening() {
  if (recognition) recognition.abort();
  state.recording = false;
  state.textMode = false;
  state.interimText = '';
  render();
}

function openTextMode() {
  state.recording = true;
  state.textMode = true;
  state.textInputValue = '';
  render();
}

// ============================================================
// CATEGORIZATION
// ============================================================

const CATEGORY_KEYWORDS = {
  Einkaufen: ['kaufen', 'einkaufen', 'edeka', 'rewe', 'lidl', 'aldi', 'amazon', 'bestellen', 'supermarkt'],
  Anrufe:    ['anrufen', 'telefon', 'call', 'mail', 'email', 'schreiben', 'nachricht', 'whatsapp'],
  Wichtig:   ['termin', 'arzt', 'rechnung', 'konto', 'steuer', 'kündigen', 'frist', 'wichtig', 'dringend'],
  Ideen:     ['idee', 'feature', 'content', 'post', 'video', 'konzept', 'brainstorm'],
  Arbeit:    ['kunde', 'meeting', 'projekt', 'angebot', 'deadline', 'jira', 'ticket'],
};

const HASHTAG_CATEGORY_MAP = {
  arbeit: 'Arbeit', privat: 'Privat', idee: 'Ideen', ideen: 'Ideen',
  einkaufen: 'Einkaufen', wichtig: 'Wichtig', anrufe: 'Anrufe', anruf: 'Anrufe',
};

const TASK_KW = ['kaufen', 'anrufen', 'schreiben', 'erledigen', 'buchen', 'bestellen',
  'kündigen', 'mailen', 'prüfen', 'organisieren', 'planen', 'machen', 'schicken',
  'senden', 'besorgen', 'abholen', 'anmelden', 'abmelden', 'bezahlen'];

const HEALTH_KW = ['sport', 'training', 'medizin', 'essen', 'diät'];

function categorizeCapture(text) {
  const lower = text.toLowerCase();
  const hashtags = (text.match(/#\w+/g) || []).map((t) => t.slice(1).toLowerCase());
  const extraTags = [];

  let category = 'Inbox';
  for (const tag of hashtags) {
    if (HASHTAG_CATEGORY_MAP[tag]) { category = HASHTAG_CATEGORY_MAP[tag]; break; }
  }
  if (category === 'Inbox') {
    for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
      if (kws.some((kw) => lower.includes(kw))) { category = cat; break; }
    }
  }
  if (HEALTH_KW.some((kw) => lower.includes(kw))) extraTags.push('gesundheit');

  const THOUGHT_KW = ['idee', 'brainstorm', 'konzept'];
  const isThought = hashtags.some((t) => t === 'idee' || t === 'ideen') ||
    THOUGHT_KW.some((kw) => lower.includes(kw));

  const startsWithTaskKw = TASK_KW.some((kw) => lower.startsWith(kw));
  const hasTaskTrigger = ['muss', 'soll', 'bitte'].some((kw) => lower.includes(kw));
  const isTask = startsWithTaskKw || hasTaskTrigger || TASK_KW.some((kw) => lower.includes(kw));

  let type = isThought ? 'thought' : isTask ? 'task' : 'note';

  return { category, type, tags: extraTags };
}

// ============================================================
// MINDMAP ACTIONS
// ============================================================

function suggestMindmapForCapture(text) {
  if (!state.mindmaps.length) return null;
  const lower = text.toLowerCase();
  const textTags = (text.match(/#\w+/g) || []).map((t) => t.slice(1).toLowerCase());
  let best = null, bestScore = 0;
  for (const mm of state.mindmaps) {
    let score = 0;
    for (const tag of mm.tags) {
      if (textTags.includes(tag.toLowerCase())) score += 5;
      else if (lower.includes(tag.toLowerCase())) score += 1;
    }
    for (const kw of mm.keywords) { if (kw && lower.includes(kw.toLowerCase())) score += 2; }
    for (const w of mm.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2)) {
      if (lower.includes(w)) score += 3;
    }
    if (score >= 5 && score > bestScore) { bestScore = score; best = mm; }
  }
  return best ? { mindmapId: best.id, score: bestScore } : null;
}

function createMindmap() {
  const title = state.newMindmapTitle.trim();
  if (!title) { showToast('Bitte Titel eingeben'); return; }
  const tags = (state.newMindmapTags.match(/#\w+/g) || []).map((t) => t.slice(1).toLowerCase());
  const keywords = state.newMindmapKeywords.split(',').map((k) => k.trim()).filter(Boolean);
  state.mindmaps.push({
    id: uid(),
    title, tags, keywords,
    nodes: [{ id: uid(), text: 'Inbox', children: [] }],
    linkedCaptureIds: [],
    updatedAt: new Date().toISOString(),
  });
  saveData();
  state.showAddMindmap = false;
  state.newMindmapTitle = '';
  state.newMindmapTags = '';
  state.newMindmapKeywords = '';
  showToast('Mindmap erstellt');
  render();
}

function jumpToCapture(captureId) {
  state.view = 'inbox';
  state.mindmapDetailId = null;
  state.jumpToCaptureId = captureId;
  render();

  setTimeout(() => {
    const elTarget = document.getElementById('cap-' + captureId);
    if (elTarget) {
      elTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => { state.jumpToCaptureId = null; render(); }, 1400);
    } else {
      state.jumpToCaptureId = null;
    }
  }, 60);
}

function linkCaptureToMindmap(captureId, mindmapId) {
  const mm = state.mindmaps.find((m) => m.id === mindmapId);
  if (!mm || mm.linkedCaptureIds.includes(captureId)) { state.mindmapSuggestion = null; render(); return; }
  mm.linkedCaptureIds.push(captureId);
  mm.updatedAt = new Date().toISOString();
  state.mindmapSuggestion = null;
  saveData();
  showToast('Zugeordnet');
  render();
}

function findOutlineNode(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    const f = findOutlineNode(n.children, id);
    if (f) return f;
  }
  return null;
}

function deleteOutlineNode(mm, id) {
  const del = (arr) => {
    const i = arr.findIndex((n) => n.id === id);
    if (i !== -1) { arr.splice(i, 1); return true; }
    return arr.some((n) => del(n.children));
  };
  del(mm.nodes);
}

function addOutlineNode(mm, parentId) {
  const text = state.newNodeText.trim();
  if (!text) return;
  const node = { id: uid(), text, children: [] };
  if (parentId === '__root__') mm.nodes.push(node);
  else { const p = findOutlineNode(mm.nodes, parentId); if (p) p.children.push(node); }
  mm.updatedAt = new Date().toISOString();
  state.addingNodeMindmapId = null;
  state.addingNodeParentId = null;
  state.newNodeText = '';
  saveData();
  render();
}

function deleteMindmap(id) {
  dbDelete('mindmaps', id);
  state.mindmaps = state.mindmaps.filter((m) => m.id !== id);
  state.mindmapDetailId = null;
  saveData();
  render();
}

// ============================================================
// REMINDER ENGINE
// ============================================================

function checkReminders() {
  const now = new Date();
  const due = state.captures
    .filter((c) => c.dueAt && !c.doneAt && new Date(c.dueAt) <= now)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
  const nextId = due.length > 0 ? due[0].id : null;
  if (state.activeReminder !== nextId) { state.activeReminder = nextId; render(); }

  // Push notification — max once per 15 min per capture
  if (nextId && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const c = due[0];
    if (!c.lastNotifiedAt || Date.now() - c.lastNotifiedAt > 15 * 60 * 1000) {
      c.lastNotifiedAt = Date.now();
      const opts = { body: c.text.slice(0, 100), icon: './icon.svg' };
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) reg.showNotification('Erinnerung', opts);
        else new Notification('Erinnerung', opts);
      }).catch(() => { try { new Notification('Erinnerung', opts); } catch (_) {} });
    }
  }
}

function markReminderDone(id) {
  const c = state.captures.find((c) => c.id === id);
  if (!c) return;
  c.doneAt = new Date().toISOString();
  state.activeReminder = null;
  saveData();
  render();
}

function snoozeReminder(id, newDueAt) {
  const c = state.captures.find((c) => c.id === id);
  if (!c) return;
  c.dueAt = newDueAt;
  c.lastNotifiedAt = null;
  state.activeReminder = null;
  saveData();
  render();
}

function requestNotifPermission() {
  if (typeof Notification === 'undefined') return;
  Notification.requestPermission().then(() => render());
}

// ============================================================
// DUE DATE PARSING
// ============================================================

const WEEKDAY_DE = { montag:1, dienstag:2, mittwoch:3, donnerstag:4, freitag:5, samstag:6, sonntag:0 };

function parseDueDate(text, now = new Date()) {
  const lower = text.toLowerCase();
  let anchor = null;

  // ISO: YYYY-MM-DD
  const isoM = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoM) anchor = new Date(+isoM[1], +isoM[2] - 1, +isoM[3]);

  // German: DD.MM.YYYY or DD.MM.
  if (!anchor) {
    const deM = lower.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})?\b/);
    if (deM) anchor = new Date(deM[3] ? +deM[3] : now.getFullYear(), +deM[2] - 1, +deM[1]);
  }

  // Relative day words
  if (!anchor) {
    if (lower.includes('übermorgen'))      { anchor = new Date(now); anchor.setDate(anchor.getDate() + 2); }
    else if (lower.includes('morgen'))     { anchor = new Date(now); anchor.setDate(anchor.getDate() + 1); }
    else if (lower.includes('heute'))      { anchor = new Date(now); }
  }

  // Weekdays → next matching day (never today)
  if (!anchor) {
    for (const [name, dow] of Object.entries(WEEKDAY_DE)) {
      if (lower.includes(name)) {
        const diff = ((dow - now.getDay() + 7) % 7) || 7;
        anchor = new Date(now); anchor.setDate(anchor.getDate() + diff);
        break;
      }
    }
  }

  // Time extraction
  let h = null, m = 0;
  const tm = lower.match(/\bum\s+(\d{1,2})(?::(\d{2}))?/) ||
             lower.match(/\b(\d{1,2}):(\d{2})\s*(?:uhr)?\b/) ||
             lower.match(/\b(\d{1,2})\s*uhr\b/);
  if (tm) { h = +tm[1]; m = tm[2] ? +tm[2] : 0; }

  if (!anchor && h === null) return null;

  const result = anchor ? new Date(anchor) : new Date(now);
  if (h !== null) {
    result.setHours(h, m, 0, 0);
    // only-time given: push to tomorrow if already past
    if (!anchor && result <= now) result.setDate(result.getDate() + 1);
  } else {
    result.setHours(9, 0, 0, 0);
  }
  return result.toISOString();
}

function formatDueAt(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
  let prefix;
  if (sameDay(d, now))      prefix = 'heute';
  else if (sameDay(d, tomorrow)) prefix = 'morgen';
  else prefix = d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  return prefix + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// INBOX ACTIONS
// ============================================================

function createCaptureFromInput() {
  const text = state.inboxInput.trim();
  if (!text) { showToast('Bitte Text eingeben'); return; }
  let { category, type, tags } = categorizeCapture(text);

  const dueAt = state.inboxPresetDueAt || parseDueDate(text);
  if (dueAt) {
    const hashtags = (text.match(/#\w+/g) || []).map((t) => t.slice(1).toLowerCase());
    const hasHashtagCat = hashtags.some((t) => HASHTAG_CATEGORY_MAP[t]);
    if (!hasHashtagCat) {
      const dueDay = new Date(dueAt);
      const now = new Date();
      if (dueDay.toDateString() === now.toDateString()) category = 'Heute';
    }
  }

  let projectId = null;
  const atTokens = (text.match(/@\w+/g) || []);
  for (const token of atTokens) {
    const name = token.slice(1).toLowerCase();
    const match = state.projects.find((p) => p.name.toLowerCase() === name);
    if (match) { projectId = match.id; break; }
  }

  const captureId = uid();
  state.captures.unshift({
    id: captureId,
    text,
    type,
    category,
    tags,
    createdAt: new Date().toISOString(),
    projectId,
    dueAt,
    doneAt: null,
    priority: null,
  });
  saveData();
  state.inboxInput = '';
  state.inboxPresetDueAt = null;
  state.inboxPresetLabel = '';
  state.inboxShowPresets = false;
  const sugg = suggestMindmapForCapture(text);
  state.mindmapSuggestion = sugg ? { captureId, mindmapId: sugg.mindmapId } : null;
  showToast('Gespeichert');
  render();
  setTimeout(() => { const inp = document.getElementById('inbox-input'); if (inp) inp.focus(); }, 40);
}

function deleteCapture(id) {
  dbDelete('captures', id);
  state.captures = state.captures.filter((c) => c.id !== id);
  saveData();
  render();
}

// ============================================================
// TASK ACTIONS
// ============================================================

function submitTextInput() {
  const text = state.textInputValue.trim();
  if (!text) { showToast('Bitte Text eingeben'); return; }
  state.recording = false;
  state.textMode = false;
  state.assigning = true;
  state.assignText = text;
  state.editingAssign = false;
  render();
}

function assignTask(projectId) {
  const text = state.assignText.trim();
  if (!text) { showToast('Aufgabe ist leer'); return; }
  state.tasks.unshift({
    id: String(Date.now()),
    text,
    projectId: projectId || null,
    dueDate: state.assignDueDate || null,
    createdAt: Date.now(),
    done: false,
    completedAt: null,
  });
  saveData();
  state.assigning = false;
  state.assignText = '';
  state.assignDueDate = '';
  state.editingAssign = false;
  showToast('Aufgabe gespeichert');
  render();
}

function cancelAssign() {
  state.assigning = false;
  state.assignText = '';
  state.assignDueDate = '';
  state.editingAssign = false;
  render();
}

function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  task.completedAt = task.done ? Date.now() : null;
  saveData();
  render();
}

function deleteTask(id) {
  dbDelete('captures', id);
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveData();
  render();
}

// ============================================================
// PROJECT ACTIONS
// ============================================================

function saveNewProject() {
  const name = state.newProjectName.trim();
  if (!name) { showToast('Bitte einen Namen eingeben'); return; }
  if (state.projects.length >= 10) { showToast('Maximal 10 Projekte'); return; }
  state.projects.push({
    id: String(Date.now()),
    name,
    color: state.newProjectColor,
    createdAt: Date.now(),
  });
  saveData();
  state.showAddProject = false;
  state.newProjectName = '';
  state.newProjectColor = PROJECT_COLORS[5];
  showToast('Projekt erstellt');
  render();
}

function saveEditProject() {
  const name = state.editProjectName.trim();
  if (!name) { showToast('Bitte einen Namen eingeben'); return; }
  const project = state.projects.find((p) => p.id === state.editingProjectId);
  if (!project) return;
  project.name = name;
  project.color = state.editProjectColor;
  saveData();
  state.editingProjectId = null;
  showToast('Projekt aktualisiert');
  render();
}

function startEditProject(project) {
  state.editingProjectId = project.id;
  state.editProjectName = project.name;
  state.editProjectColor = project.color;
  state.showAddProject = false;
  render();
}

function cancelEditProject() {
  state.editingProjectId = null;
  render();
}

function deleteProject(id) {
  if (!confirm('Projekt löschen? Aufgaben bleiben ohne Projekt erhalten.')) return;
  state.tasks.forEach((t) => { if (t.projectId === id) t.projectId = null; });
  state.captures.forEach((c) => { if (c.projectId === id) c.projectId = null; });
  state.projects = state.projects.filter((p) => p.id !== id);
  dbDelete('projects', id);
  if (state.filter === id) state.filter = null;
  if (state.editingProjectId === id) state.editingProjectId = null;
  saveData();
  render();
}

// ============================================================
// UTILS
// ============================================================

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node[k] = v;
    else node.setAttribute(k, v);
  }
  children.flat().forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return node;
}

function icon(name) {
  const span = document.createElement('span');
  span.innerHTML = ICONS[name];
  return span.firstChild;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatDueDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getCalendarDays(year, month) {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const lastDay = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDow; i++) days.push(null);
  for (let d = 1; d <= lastDay; d++) days.push(d);
  return days;
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ============================================================
// RENDER — main
// ============================================================

function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (state.view === 'inbox') {
    app.appendChild(renderHeader('Inbox'));
    app.appendChild(renderInbox());
  } else if (state.view === 'tasks') {
    app.appendChild(renderHeader('Aufgaben'));
    app.appendChild(renderFilterBar());
    app.appendChild(renderTaskList());
    app.appendChild(renderFAB());
  } else if (state.view === 'calendar') {
    app.appendChild(renderHeader('Kalender'));
    app.appendChild(renderCalendarView());
    app.appendChild(renderFAB());
  } else if (state.view === 'mindmaps') {
    if (state.mindmapDetailId) {
      app.appendChild(renderHeader('Mindmap'));
      app.appendChild(renderMindmapDetail(state.mindmapDetailId));
    } else {
      app.appendChild(renderHeader('Mindmaps'));
      app.appendChild(renderMindmapsList());
    }
  } else {
    app.appendChild(renderHeader('Projekte'));
    app.appendChild(renderProjectsView());
  }

  app.appendChild(renderBottomNav());

  if (state.recording) app.appendChild(renderRecordingOverlay());
  if (state.assigning) app.appendChild(renderAssignModal());
}

// ============================================================
// RENDER — header
// ============================================================

function renderHeader(title) {
  return el('header', { class: 'header' }, el('h1', {}, title));
}

// ============================================================
// RENDER — filter bar (tasks view only)
// ============================================================

function renderFilterBar() {
  const bar = el('div', { class: 'filter-bar' });

  const allChip = el('button', { class: 'chip' + (state.filter === null ? ' active' : '') }, 'Alle');
  allChip.onclick = () => { state.filter = null; render(); };
  bar.appendChild(allChip);

  state.projects.forEach((p) => {
    const dot = el('span', { style: `display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}` });
    const chip = el('button', { class: 'chip' + (state.filter === p.id ? ' active' : '') }, dot, p.name);
    chip.onclick = () => { state.filter = p.id; render(); };
    bar.appendChild(chip);
  });

  return bar;
}

// ============================================================
// RENDER — task list
// ============================================================

function renderTaskList() {
  const container = el('div', { class: 'task-list' });

  const isFiltered = state.filter !== null;
  const open = state.tasks.filter((t) => !t.done && (isFiltered ? t.projectId === state.filter : true));
  const done = state.tasks.filter((t) => t.done && (isFiltered ? t.projectId === state.filter : true));

  if (open.length === 0 && done.length === 0) {
    container.appendChild(renderEmptyState());
    return container;
  }

  if (isFiltered) {
    open.forEach((t) => container.appendChild(renderTaskCard(t)));
  } else {
    groupTasksByProject(open).forEach(({ project, tasks }) =>
      container.appendChild(renderProjectGroup(project, tasks))
    );
  }

  if (done.length > 0) {
    const toggle = el('div', { class: 'show-completed-btn' },
      state.showCompleted
        ? `Erledigt ausblenden (${done.length})`
        : `${done.length} erledigte Aufgabe${done.length !== 1 ? 'n' : ''} anzeigen`
    );
    toggle.onclick = () => { state.showCompleted = !state.showCompleted; render(); };
    container.appendChild(toggle);
    if (state.showCompleted) done.forEach((t) => container.appendChild(renderTaskCard(t)));
  }

  return container;
}

function groupTasksByProject(tasks) {
  const map = new Map();
  tasks.forEach((t) => {
    const key = t.projectId || '__none__';
    if (!map.has(key)) {
      map.set(key, {
        project: t.projectId ? state.projects.find((p) => p.id === t.projectId) || null : null,
        tasks: [],
      });
    }
    map.get(key).tasks.push(t);
  });
  return [...map.values()].sort((a, b) => {
    if (!a.project && !b.project) return 0;
    if (!a.project) return 1;
    if (!b.project) return -1;
    return state.projects.indexOf(a.project) - state.projects.indexOf(b.project);
  });
}

function renderProjectGroup(project, tasks) {
  const group = el('div', { class: 'project-group' });
  const dot = el('div', { class: 'project-dot', style: `background:${project ? project.color : '#dadce0'}` });
  const name = el('span', { class: 'project-group-name' }, project ? project.name : 'Ohne Projekt');
  group.appendChild(el('div', { class: 'project-group-header' }, dot, name));
  tasks.forEach((t) => group.appendChild(renderTaskCard(t)));
  return group;
}

function renderTaskCard(task) {
  const project = task.projectId ? state.projects.find((p) => p.id === task.projectId) : null;
  const today = getToday();
  const isOverdue = task.dueDate && task.dueDate < today && !task.done;
  const isDueToday = task.dueDate && task.dueDate === today && !task.done;

  const card = el('div', { class: 'task-card' });
  if (project) card.style.borderLeftColor = project.color;
  if (isOverdue) card.style.borderLeftColor = '#d93025';

  const checkbox = el('div', { class: 'task-checkbox' + (task.done ? ' done' : '') });
  checkbox.onclick = () => toggleTask(task.id);

  const content = el('div', { class: 'task-content' });
  content.appendChild(el('div', { class: 'task-text' + (task.done ? ' done' : '') }, task.text));

  if (task.dueDate) {
    let dueCls = 'task-due';
    if (isOverdue) dueCls += ' overdue';
    else if (isDueToday) dueCls += ' today';
    const dueEl = el('div', { class: dueCls });
    dueEl.appendChild(icon('dateClock'));
    dueEl.appendChild(document.createTextNode(' ' + formatDueDate(task.dueDate)));
    content.appendChild(dueEl);
  }

  const delBtn = el('button', { class: 'task-delete', title: 'Löschen', html: ICONS.trash });
  delBtn.onclick = (e) => { e.stopPropagation(); deleteTask(task.id); };

  card.appendChild(checkbox);
  card.appendChild(content);
  card.appendChild(delBtn);
  return card;
}

function renderEmptyState() {
  return el('div', { class: 'empty-state' },
    el('span', { html: ICONS.inbox }),
    el('h3', {}, 'Keine Aufgaben'),
    el('p', {}, 'Tippen Sie auf das Mikrofon, um eine Aufgabe per Sprache zu erfassen')
  );
}

// ============================================================
// RENDER — FAB
// ============================================================

function renderFAB() {
  const fab = el('button', { class: 'fab', title: 'Aufgabe erfassen', html: ICONS.mic });
  fab.onclick = startListening;
  return fab;
}

// ============================================================
// RENDER — recording overlay
// ============================================================

function renderRecordingOverlay() {
  const overlay = el('div', { class: 'overlay' });
  const content = el('div', { class: 'recording-content' });

  if (state.textMode) {
    content.appendChild(el('p', { class: 'recording-status' }, 'Aufgabe eingeben'));
    const area = el('div', { class: 'text-input-area' });
    const ta = el('textarea', { placeholder: 'Aufgabenbeschreibung...', rows: '3' });
    ta.value = state.textInputValue;
    ta.oninput = (e) => { state.textInputValue = e.target.value; };
    ta.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitTextInput(); } };
    area.appendChild(ta);
    content.appendChild(area);

    const submitBtn = el('button', { class: 'text-mode-submit' }, 'Weiter');
    submitBtn.onclick = submitTextInput;
    content.appendChild(submitBtn);

    if (recognition) {
      const switchBtn = el('button', { class: 'switch-mode-link' }, 'Stattdessen Sprache verwenden');
      switchBtn.onclick = () => { state.textMode = false; state.recording = false; startListening(); };
      content.appendChild(switchBtn);
    }
  } else {
    const micContainer = el('div', { class: 'mic-container' });
    micContainer.appendChild(el('div', { class: 'pulse-ring' }));
    micContainer.appendChild(el('div', { class: 'pulse-ring delay' }));
    micContainer.appendChild(el('button', { class: 'mic-btn-large', html: ICONS.mic }));
    content.appendChild(micContainer);

    content.appendChild(el('p', { class: 'recording-status' }, 'Sprechen Sie jetzt...'));
    content.appendChild(el('p', { class: 'interim-text' }, state.interimText));

    const switchBtn = el('button', { class: 'switch-mode-link' }, 'Text eingeben');
    switchBtn.onclick = openTextMode;
    content.appendChild(switchBtn);
  }

  const cancelBtn = el('button', { class: 'btn-cancel' }, 'Abbrechen');
  cancelBtn.onclick = stopListening;
  content.appendChild(cancelBtn);

  overlay.appendChild(content);
  return overlay;
}

// ============================================================
// RENDER — assign modal
// ============================================================

function renderAssignModal() {
  const backdrop = el('div', { class: 'modal-backdrop' });
  backdrop.onclick = (e) => { if (e.target === backdrop) cancelAssign(); };

  const sheet = el('div', { class: 'modal-sheet' });
  sheet.appendChild(el('div', { class: 'modal-handle' }));
  sheet.appendChild(el('h2', { class: 'modal-title' }, 'Aufgabe erfasst'));

  if (state.editingAssign) {
    const ta = el('textarea', { class: 'task-display-edit', rows: '3' });
    ta.value = state.assignText;
    ta.oninput = (e) => { state.assignText = e.target.value; };
    sheet.appendChild(ta);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 40);
  } else {
    sheet.appendChild(el('div', { class: 'task-display' }, state.assignText));
  }

  const editLink = el('button', { class: 'edit-link' }, state.editingAssign ? 'Fertig' : 'Bearbeiten');
  editLink.onclick = () => { state.editingAssign = !state.editingAssign; render(); };
  sheet.appendChild(editLink);

  // Due date picker
  const dateSection = el('div', { class: 'assign-date-section' });
  dateSection.appendChild(el('p', { class: 'assign-section-label' }, 'Fälligkeitsdatum (optional)'));
  const dateInput = el('input', { type: 'date', class: 'form-input date-input' });
  dateInput.value = state.assignDueDate;
  dateInput.oninput = (e) => { state.assignDueDate = e.target.value; };
  dateSection.appendChild(dateInput);
  sheet.appendChild(dateSection);

  // Project selection
  const projSection = el('div', { class: 'assign-project-section' });
  projSection.appendChild(el('p', { class: 'assign-section-label' }, 'Projekt wählen'));

  const grid = el('div', { class: 'project-grid' });
  state.projects.forEach((p) => {
    const dot = el('span', { class: 'color-dot', style: `background:${p.color}` });
    const btn = el('button', { class: 'project-assign-btn' }, dot, p.name);
    btn.onclick = () => assignTask(p.id);
    grid.appendChild(btn);
  });
  projSection.appendChild(grid);

  const noProj = el('button', { class: 'no-project-btn' }, 'Ohne Projekt speichern');
  noProj.onclick = () => assignTask(null);
  projSection.appendChild(noProj);

  if (state.projects.length === 0) {
    projSection.appendChild(el('p', { class: 'assign-hint' },
      'Legen Sie unter "Projekte" Projekte an, um Aufgaben zuzuweisen.'
    ));
  }

  sheet.appendChild(projSection);
  backdrop.appendChild(sheet);
  return backdrop;
}

// ============================================================
// RENDER — inbox view
// ============================================================

function renderInbox() {
  const view = el('div', { class: 'inbox-view' });

  // Capture bar
  const bar = el('div', { class: 'capture-bar' });
  const ta = el('textarea', {
    id: 'inbox-input',
    class: 'capture-input' + (state.inboxVoiceActive ? ' recording' : ''),
    placeholder: 'Gedanke festhalten…',
    rows: '2',
  });
  ta.value = state.inboxVoiceActive && state.inboxInterim ? state.inboxInterim : state.inboxInput;
  ta.oninput = (e) => { if (!state.inboxVoiceActive) state.inboxInput = e.target.value; };
  ta.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); createCaptureFromInput(); } };

  const actions = el('div', { class: 'capture-actions' });
  const micBtn = el('button', {
    class: 'capture-mic-btn' + (state.inboxVoiceActive ? ' active' : ''),
    html: ICONS.mic,
    title: state.inboxVoiceActive ? 'Aufnahme stoppen' : 'Spracheingabe',
  });
  micBtn.onclick = () => {
    if (state.inboxVoiceActive) {
      if (recognition) recognition.abort();
      state.inboxVoiceActive = false;
      state.inboxInterim = '';
      render();
    } else {
      startInboxVoice();
    }
  };
  const remindBtn = el('button', {
    class: 'capture-remind-btn' + (state.inboxShowPresets ? ' active' : ''),
    title: 'Erinnern',
  }, '⏰');
  remindBtn.onclick = () => { state.inboxShowPresets = !state.inboxShowPresets; render(); };

  const saveBtn = el('button', { class: 'capture-save-btn' }, 'Speichern');
  saveBtn.onclick = createCaptureFromInput;

  actions.appendChild(micBtn);
  actions.appendChild(remindBtn);
  actions.appendChild(saveBtn);
  bar.appendChild(ta);
  bar.appendChild(actions);

  // Preset panel
  if (state.inboxShowPresets) {
    const now = new Date();
    const presets = [
      {
        label: 'später heute',
        iso: (() => {
          const d = new Date(now);
          if (d.getHours() >= 18) { d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); }
          else d.setHours(18, 0, 0, 0);
          return d.toISOString();
        })(),
      },
      {
        label: 'morgen früh',
        iso: (() => { const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d.toISOString(); })(),
      },
      {
        label: 'nächste Woche',
        iso: (() => { const d = new Date(now); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); return d.toISOString(); })(),
      },
    ];
    const panel = el('div', { class: 'preset-panel' });
    presets.forEach(({ label, iso }) => {
      const btn = el('button', {
        class: 'preset-btn' + (state.inboxPresetDueAt === iso ? ' active' : ''),
      }, label);
      btn.onclick = () => {
        state.inboxPresetDueAt = iso;
        state.inboxPresetLabel = label;
        state.inboxShowPresets = false;
        render();
      };
      panel.appendChild(btn);
    });
    bar.appendChild(panel);
  }

  // Active preset info
  if (state.inboxPresetDueAt) {
    const info = el('div', { class: 'preset-info' });
    info.appendChild(document.createTextNode('⏰ ' + state.inboxPresetLabel + ' · ' + formatDueAt(state.inboxPresetDueAt)));
    const clr = el('button', { class: 'preset-clear', title: 'Entfernen' }, '×');
    clr.onclick = () => { state.inboxPresetDueAt = null; state.inboxPresetLabel = ''; render(); };
    info.appendChild(clr);
    bar.appendChild(info);
  }

  view.appendChild(bar);

  // Mindmap suggestion
  if (state.mindmapSuggestion) {
    const mm = state.mindmaps.find((m) => m.id === state.mindmapSuggestion.mindmapId);
    if (mm) {
      const sb = el('div', { class: 'suggestion-banner' });
      sb.appendChild(el('span', { class: 'suggestion-text' }, `Passt zu: ${mm.title}`));
      const acts = el('div', { class: 'suggestion-acts' });
      const assignBtn = el('button', { class: 'suggestion-btn suggestion-btn--assign' }, 'Zuordnen');
      assignBtn.onclick = () => linkCaptureToMindmap(state.mindmapSuggestion.captureId, mm.id);
      const ignBtn = el('button', { class: 'suggestion-btn' }, 'Ignorieren');
      ignBtn.onclick = () => { state.mindmapSuggestion = null; render(); };
      acts.appendChild(assignBtn); acts.appendChild(ignBtn);
      sb.appendChild(acts);
      view.appendChild(sb);
    }
  }

  // Reminder banner
  if (state.activeReminder) {
    const c = state.captures.find((c) => c.id === state.activeReminder);
    if (c) {
      const now = new Date();
      const tom9 = new Date(now); tom9.setDate(tom9.getDate() + 1); tom9.setHours(9, 0, 0, 0);
      const banner = el('div', { class: 'reminder-banner' });
      banner.appendChild(el('div', { class: 'reminder-text' }, '⏰ ' + c.text));
      const acts = el('div', { class: 'reminder-actions' });
      const doneBtn = el('button', { class: 'reminder-btn reminder-btn--done' }, 'Erledigt');
      doneBtn.onclick = () => markReminderDone(c.id);
      const s10 = el('button', { class: 'reminder-btn' }, '10 min');
      s10.onclick = () => snoozeReminder(c.id, new Date(now.getTime() + 10 * 60000).toISOString());
      const s1h = el('button', { class: 'reminder-btn' }, '1 Std');
      s1h.onclick = () => snoozeReminder(c.id, new Date(now.getTime() + 60 * 60000).toISOString());
      const stom = el('button', { class: 'reminder-btn' }, 'Morgen');
      stom.onclick = () => snoozeReminder(c.id, tom9.toISOString());
      acts.appendChild(doneBtn); acts.appendChild(s10); acts.appendChild(s1h); acts.appendChild(stom);
      banner.appendChild(acts);
      view.appendChild(banner);
    }
  }

  // Notification opt-in (best effort)
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    const nb = el('div', { class: 'notif-request' },
      el('span', {}, 'Erinnerungen als Benachrichtigung erhalten?'),
      el('button', { class: 'notif-allow-btn' }, 'Erlauben')
    );
    nb.querySelector('button').onclick = requestNotifPermission;
    view.appendChild(nb);
  }

  // List
  const list = el('div', { class: 'inbox-list' });
  if (state.captures.length === 0) {
    list.appendChild(el('div', { class: 'empty-state' },
      el('span', { html: ICONS.inbox }),
      el('h3', {}, 'Noch nichts erfasst'),
      el('p', {}, 'Tippen Sie oben einen Gedanken ein oder nutzen Sie die Spracheingabe.')
    ));
  } else {
    state.captures.forEach((c) => list.appendChild(renderCaptureItem(c)));
  }
  view.appendChild(list);

  if (!state.inboxVoiceActive) setTimeout(() => { const inp = document.getElementById('inbox-input'); if (inp && document.activeElement !== inp) inp.focus(); }, 40);
  return view;
}

const CATEGORY_COLORS = {
  Wichtig: '#d93025', Anrufe: '#1a73e8', Einkaufen: '#22c55e',
  Arbeit: '#8b5cf6', Privat: '#f97316', Ideen: '#f59e0b',
  Heute: '#14b8a6', Inbox: '#64748b',
};

function renderCaptureItem(capture) {
  const item = el('div', {
    id: 'cap-' + capture.id,
    class: 'capture-item' + (state.jumpToCaptureId === capture.id ? ' highlight' : ''),
  });
  const content = el('div', { class: 'capture-content' });
  content.appendChild(el('div', { class: 'capture-text' }, capture.text));
  const d = new Date(capture.createdAt);
  const timeStr = d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) + ', ' +
    d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  const meta = el('div', { class: 'capture-meta' });
  const cat = capture.category || 'Inbox';
  const catColor = CATEGORY_COLORS[cat] || '#64748b';
  meta.appendChild(el('span', {
    class: 'capture-tag',
    style: `background:${catColor}22;color:${catColor}`,
  }, cat));
  if (capture.type && capture.type !== 'thought') {
    meta.appendChild(el('span', { class: 'capture-type' }, capture.type));
  }
  (capture.tags || []).forEach((t) =>
    meta.appendChild(el('span', { class: 'capture-tag capture-tag--extra' }, '#' + t))
  );
  meta.appendChild(document.createTextNode(timeStr));
  content.appendChild(meta);
  if (capture.dueAt) {
    content.appendChild(el('div', { class: 'capture-due' }, 'fällig: ' + formatDueAt(capture.dueAt)));
  }
  const delBtn = el('button', { class: 'task-delete', title: 'Löschen', html: ICONS.trash });
  delBtn.onclick = () => deleteCapture(capture.id);
  item.appendChild(content);
  item.appendChild(delBtn);
  return item;
}

// ============================================================
// RENDER — calendar view
// ============================================================

function renderCalendarView() {
  const view = el('div', { class: 'calendar-view' });
  const today = getToday();
  const { calendarYear: year, calendarMonth: month } = state;

  // Navigation header
  const nav = el('div', { class: 'calendar-nav' });
  const prevBtn = el('button', { class: 'cal-nav-btn', html: ICONS.chevLeft });
  prevBtn.onclick = () => {
    if (month === 0) { state.calendarMonth = 11; state.calendarYear--; }
    else state.calendarMonth--;
    state.calendarSelectedDay = null;
    render();
  };
  const nextBtn = el('button', { class: 'cal-nav-btn', html: ICONS.chevRight });
  nextBtn.onclick = () => {
    if (month === 11) { state.calendarMonth = 0; state.calendarYear++; }
    else state.calendarMonth++;
    state.calendarSelectedDay = null;
    render();
  };
  nav.appendChild(prevBtn);
  nav.appendChild(el('h2', { class: 'calendar-month-title' }, `${MONTHS_DE[month]} ${year}`));
  nav.appendChild(nextBtn);
  view.appendChild(nav);

  // Weekday header
  const wkRow = el('div', { class: 'calendar-weekdays' });
  WEEKDAYS_DE.forEach((d) => wkRow.appendChild(el('div', { class: 'cal-weekday' }, d)));
  view.appendChild(wkRow);

  // Day grid
  const grid = el('div', { class: 'calendar-grid' });
  getCalendarDays(year, month).forEach((dayNum) => {
    if (dayNum === null) {
      grid.appendChild(el('div', { class: 'calendar-day empty' }));
      return;
    }

    const dateStr = toDateStr(year, month, dayNum);
    const dayTasks = state.tasks.filter((t) => t.dueDate === dateStr && !t.done);
    const hasOverdue = dayTasks.length > 0 && dateStr < today;
    const isToday = dateStr === today;
    const isSelected = dateStr === state.calendarSelectedDay;

    let cls = 'calendar-day';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' selected';
    if (hasOverdue && !isSelected) cls += ' has-overdue';

    const cell = el('div', { class: cls });
    cell.appendChild(el('span', { class: 'cal-day-num' }, String(dayNum)));

    if (dayTasks.length > 0) {
      const dots = el('div', { class: 'cal-day-dots' });
      dayTasks.slice(0, 3).forEach((t) => {
        const proj = t.projectId ? state.projects.find((p) => p.id === t.projectId) : null;
        dots.appendChild(el('span', {
          class: 'cal-day-dot',
          style: `background:${proj ? proj.color : '#dadce0'}`,
        }));
      });
      if (dayTasks.length > 3) {
        dots.appendChild(el('span', { class: 'cal-day-more' }, `+${dayTasks.length - 3}`));
      }
      cell.appendChild(dots);
    }

    cell.onclick = () => {
      state.calendarSelectedDay = isSelected ? null : dateStr;
      render();
    };
    grid.appendChild(cell);
  });
  view.appendChild(grid);

  // Selected day detail
  if (state.calendarSelectedDay) {
    view.appendChild(renderCalendarDayDetail(state.calendarSelectedDay, today));
  }

  return view;
}

function renderCalendarDayDetail(dateStr, today) {
  const detail = el('div', { class: 'calendar-detail' });

  const d = new Date(dateStr + 'T00:00:00');
  const label = d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  detail.appendChild(el('h3', { class: 'calendar-detail-title' }, label));

  const tasks = state.tasks.filter((t) => t.dueDate === dateStr);

  if (tasks.length === 0) {
    detail.appendChild(el('p', { class: 'calendar-no-tasks' }, 'Keine Aufgaben für diesen Tag'));
    return detail;
  }

  tasks.forEach((task) => detail.appendChild(renderTaskCard(task)));
  return detail;
}

// ============================================================
// RENDER — projects view
// ============================================================

function renderProjectsView() {
  const view = el('div', { class: 'projects-view' });

  if (!recognition) {
    view.appendChild(el('div', { class: 'no-speech-banner' },
      '⚠️ Spracherkennung ist nur in Chrome verfügbar. Aufgaben können per Text eingegeben werden.'
    ));
  }

  state.projects.forEach((p) => {
    if (state.editingProjectId === p.id) {
      view.appendChild(renderProjectEditForm(p));
    } else {
      view.appendChild(renderProjectItem(p));
    }
  });

  if (state.projects.length < 10) {
    if (state.showAddProject) {
      view.appendChild(renderProjectAddForm());
    } else if (!state.editingProjectId) {
      const addBtn = el('button', { class: 'add-project-btn' });
      addBtn.appendChild(icon('add'));
      addBtn.appendChild(document.createTextNode(' Neues Projekt'));
      addBtn.onclick = () => { state.showAddProject = true; render(); };
      view.appendChild(addBtn);
    }
  } else {
    view.appendChild(el('p', { class: 'max-projects-note' }, 'Maximal 10 Projekte erreicht.'));
  }

  return view;
}

function renderProjectItem(p) {
  const openCount = state.tasks.filter((t) => t.projectId === p.id && !t.done).length;

  const item = el('div', { class: 'project-item' });
  item.appendChild(el('div', { class: 'project-color-swatch', style: `background:${p.color}` }));

  const info = el('div', { class: 'project-item-info' });
  info.appendChild(el('div', { class: 'project-item-name' }, p.name));
  info.appendChild(el('div', { class: 'project-item-count' },
    `${openCount} offene Aufgabe${openCount !== 1 ? 'n' : ''}`
  ));
  item.appendChild(info);

  const editBtn = el('button', { class: 'btn-icon btn-edit', title: 'Bearbeiten', html: ICONS.edit });
  editBtn.onclick = () => startEditProject(p);

  const delBtn = el('button', { class: 'btn-icon btn-danger', title: 'Löschen', html: ICONS.trash });
  delBtn.onclick = () => deleteProject(p.id);

  item.appendChild(editBtn);
  item.appendChild(delBtn);
  return item;
}

function renderProjectAddForm() {
  return renderProjectForm({
    title: null,
    name: state.newProjectName,
    color: state.newProjectColor,
    onNameChange: (v) => { state.newProjectName = v; },
    onColorChange: (c) => { state.newProjectColor = c; },
    onSave: saveNewProject,
    onCancel: () => { state.showAddProject = false; state.newProjectName = ''; render(); },
  });
}

function renderProjectEditForm(project) {
  return renderProjectForm({
    title: 'Projekt bearbeiten',
    name: state.editProjectName,
    color: state.editProjectColor,
    onNameChange: (v) => { state.editProjectName = v; },
    onColorChange: (c) => { state.editProjectColor = c; },
    onSave: saveEditProject,
    onCancel: cancelEditProject,
  });
}

function renderProjectForm({ title, name, color, onNameChange, onColorChange, onSave, onCancel }) {
  const form = el('div', { class: 'add-project-form' });

  if (title) form.appendChild(el('p', { class: 'form-title' }, title));

  const input = el('input', {
    class: 'form-input',
    type: 'text',
    placeholder: 'Projektname (z. B. Arbeit, Privat)',
    maxlength: '30',
  });
  input.value = name;
  input.oninput = (e) => onNameChange(e.target.value);
  input.onkeydown = (e) => { if (e.key === 'Enter') onSave(); };
  form.appendChild(input);
  setTimeout(() => input.focus(), 40);

  const picker = el('div', { class: 'color-picker' });
  PROJECT_COLORS.forEach((c) => {
    const opt = el('div', {
      class: 'color-option' + (c === color ? ' selected' : ''),
      style: `background:${c}`,
    });
    opt.onclick = () => { onColorChange(c); render(); };
    picker.appendChild(opt);
  });
  form.appendChild(picker);

  const actions = el('div', { class: 'form-actions' });
  const cancelBtn = el('button', { class: 'btn-secondary' }, 'Abbrechen');
  cancelBtn.onclick = onCancel;
  const saveBtn = el('button', { class: 'btn-primary' }, 'Speichern');
  saveBtn.onclick = onSave;
  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);
  form.appendChild(actions);

  return form;
}

// ============================================================
// RENDER — mindmaps
// ============================================================

function renderMindmapsList() {
  const view = el('div', { class: 'mindmaps-view' });
  state.mindmaps.forEach((mm) => {
    const item = el('div', { class: 'mindmap-item' });
    const info = el('div', { class: 'mindmap-item-info' });
    info.appendChild(el('div', { class: 'mindmap-item-title' }, mm.title));
    const n = mm.linkedCaptureIds.length;
    info.appendChild(el('div', { class: 'mindmap-item-meta' },
      `${countNodes(mm.nodes)} Knoten · ${n} Capture${n !== 1 ? 's' : ''}`));
    item.appendChild(info);
    const delBtn = el('button', { class: 'btn-icon btn-danger', html: ICONS.trash });
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm('Mindmap löschen?')) deleteMindmap(mm.id);
    };
    item.appendChild(delBtn);
    item.onclick = () => { state.mindmapDetailId = mm.id; render(); };
    view.appendChild(item);
  });
  if (state.showAddMindmap) {
    view.appendChild(renderMindmapForm());
  } else {
    const addBtn = el('button', { class: 'add-project-btn' });
    addBtn.appendChild(icon('add'));
    addBtn.appendChild(document.createTextNode(' Neue Mindmap'));
    addBtn.onclick = () => { state.showAddMindmap = true; render(); };
    view.appendChild(addBtn);
  }
  return view;
}

function renderMindmapForm() {
  const form = el('div', { class: 'add-project-form' });
  form.appendChild(el('p', { class: 'form-title' }, 'Neue Mindmap'));
  const t = el('input', { class: 'form-input', type: 'text', placeholder: 'Titel (z.B. Arbeit, Urlaub)' });
  t.value = state.newMindmapTitle;
  t.oninput = (e) => { state.newMindmapTitle = e.target.value; };
  form.appendChild(t);
  setTimeout(() => t.focus(), 40);
  const tg = el('input', { class: 'form-input', type: 'text', placeholder: 'Tags: #arbeit #privat' });
  tg.value = state.newMindmapTags;
  tg.oninput = (e) => { state.newMindmapTags = e.target.value; };
  form.appendChild(tg);
  const kw = el('input', { class: 'form-input', type: 'text', placeholder: 'Keywords: meeting, kunde' });
  kw.value = state.newMindmapKeywords;
  kw.oninput = (e) => { state.newMindmapKeywords = e.target.value; };
  form.appendChild(kw);
  const acts = el('div', { class: 'form-actions' });
  const cancel = el('button', { class: 'btn-secondary' }, 'Abbrechen');
  cancel.onclick = () => { state.showAddMindmap = false; state.newMindmapTitle = ''; state.newMindmapTags = ''; state.newMindmapKeywords = ''; render(); };
  const save = el('button', { class: 'btn-primary' }, 'Erstellen');
  save.onclick = createMindmap;
  acts.appendChild(cancel); acts.appendChild(save);
  form.appendChild(acts);
  return form;
}

function renderMindmapDetail(id) {
  const mm = state.mindmaps.find((m) => m.id === id);
  if (!mm) { state.mindmapDetailId = null; render(); return el('div'); }
  const view = el('div', { class: 'mindmap-detail' });
  const back = el('button', { class: 'mm-back-btn' }, '← Zurück');
  back.onclick = () => { state.mindmapDetailId = null; state.addingNodeMindmapId = null; render(); };
  view.appendChild(back);
  view.appendChild(el('h2', { class: 'mm-title' }, mm.title));
  if (mm.tags.length || mm.keywords.length) {
    const meta = el('div', { class: 'mm-meta' });
    mm.tags.forEach((t) => meta.appendChild(el('span', { class: 'capture-tag capture-tag--extra' }, '#' + t)));
    if (mm.keywords.length) meta.appendChild(el('span', { class: 'capture-type' }, mm.keywords.join(', ')));
    view.appendChild(meta);
  }
  view.appendChild(el('h3', { class: 'mm-section-title' }, 'Outline'));
  const outline = el('div', { class: 'mm-outline' });
  mm.nodes.forEach((n) => outline.appendChild(renderOutlineNode(n, 0, mm)));
  if (state.addingNodeMindmapId === id && state.addingNodeParentId === '__root__') {
    outline.appendChild(renderNodeInput(mm, '__root__'));
  } else {
    const addRoot = el('button', { class: 'mm-add-node-btn' }, '+ Knoten');
    addRoot.onclick = () => { state.addingNodeMindmapId = id; state.addingNodeParentId = '__root__'; state.newNodeText = ''; render(); };
    outline.appendChild(addRoot);
  }
  view.appendChild(outline);
  const linked = mm.linkedCaptureIds.map((cid) => state.captures.find((c) => c.id === cid)).filter(Boolean);
  if (linked.length) {
    view.appendChild(el('h3', { class: 'mm-section-title' }, 'Verknüpfte Captures'));
    const capList = el('div', { class: 'mm-captures' });
    linked.forEach((c) => {
      const it = el('button', { class: 'mm-capture-item', type: 'button' }, c.text);
      it.onclick = () => jumpToCapture(c.id);
      capList.appendChild(it);
    });
    view.appendChild(capList);
  }
  return view;
}

function renderOutlineNode(node, depth, mm) {
  const wrap = el('div', { class: 'outline-node', style: `padding-left:${depth * 18}px` });
  const row = el('div', { class: 'outline-row' });
  row.appendChild(el('span', { class: 'outline-bullet' }, depth === 0 ? '◆' : '◇'));
  row.appendChild(el('span', { class: 'outline-text' }, node.text));
  const addBtn = el('button', { class: 'outline-btn' }, '+');
  addBtn.onclick = () => { state.addingNodeMindmapId = mm.id; state.addingNodeParentId = node.id; state.newNodeText = ''; render(); };
  row.appendChild(addBtn);
  if (depth > 0) {
    const delBtn = el('button', { class: 'outline-btn outline-btn--del' }, '×');
    delBtn.onclick = () => { deleteOutlineNode(mm, node.id); saveData(); render(); };
    row.appendChild(delBtn);
  }
  wrap.appendChild(row);
  if (state.addingNodeMindmapId === mm.id && state.addingNodeParentId === node.id) {
    wrap.appendChild(renderNodeInput(mm, node.id));
  }
  node.children.forEach((child) => wrap.appendChild(renderOutlineNode(child, depth + 1, mm)));
  return wrap;
}

function renderNodeInput(mm, parentId) {
  const row = el('div', { class: 'outline-add-row' });
  const inp = el('input', { class: 'outline-add-input', type: 'text', placeholder: 'Neuer Knoten…' });
  inp.value = state.newNodeText;
  inp.oninput = (e) => { state.newNodeText = e.target.value; };
  inp.onkeydown = (e) => {
    if (e.key === 'Enter') addOutlineNode(mm, parentId);
    if (e.key === 'Escape') { state.addingNodeMindmapId = null; render(); }
  };
  setTimeout(() => inp.focus(), 40);
  const ok = el('button', { class: 'outline-btn outline-btn--ok' }, '✓');
  ok.onclick = () => addOutlineNode(mm, parentId);
  const cx = el('button', { class: 'outline-btn outline-btn--del' }, '×');
  cx.onclick = () => { state.addingNodeMindmapId = null; render(); };
  row.appendChild(inp); row.appendChild(ok); row.appendChild(cx);
  return row;
}

// ============================================================
// RENDER — bottom nav
// ============================================================

function renderBottomNav() {
  const nav = el('nav', { class: 'bottom-nav' });

  [
    { id: 'inbox',    label: 'Inbox',    iconName: 'inbox' },
    { id: 'tasks',    label: 'Aufgaben', iconName: 'tasks' },
    { id: 'calendar', label: 'Kalender', iconName: 'calendar' },
    { id: 'projects', label: 'Projekte', iconName: 'folder' },
    { id: 'mindmaps', label: 'Mindmaps', iconName: 'mindmap' },
  ].forEach(({ id, label, iconName }) => {
    const btn = el('button', { class: 'nav-item' + (state.view === id ? ' active' : '') });
    btn.appendChild(icon(iconName));
    btn.appendChild(document.createTextNode(label));
    btn.onclick = () => {
      if (state.inboxVoiceActive && recognition) recognition.abort();
      state.inboxVoiceActive = false;
      state.inboxInterim = '';
      state.view = id;
      state.showAddProject = false;
      state.editingProjectId = null;
      state.mindmapDetailId = null;
      state.showAddMindmap = false;
      render();
    };
    nav.appendChild(btn);
  });

  return nav;
}

// ============================================================
// UTILS
// ============================================================

function showToast(message) {
  document.querySelectorAll('.snackbar').forEach((s) => s.remove());
  const toast = el('div', { class: 'snackbar' }, message);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ============================================================
// SERVICE WORKER
// ============================================================

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ============================================================
// INIT
// ============================================================

function init() {
  loadData();
  initSpeechRecognition();
  render();
  registerServiceWorker();
  checkReminders();
  setInterval(checkReminders, 30000);

  if (initSupabaseClient()) {
    syncWithSupabase();
    window.addEventListener('online', () => syncWithSupabase());
  }
}

init();
