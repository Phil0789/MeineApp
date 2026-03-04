// ============================================================
// SUPABASE SYNC LAYER
// ============================================================
// Tables: captures · projects · mindmaps
// Strategy: localStorage first (offline-capable), Supabase synced async.
//   On reconnect / startup: push pending local changes, then pull remote
//   and merge (remote wins on ID conflict, local-only items kept).

const SUPABASE_URL      = 'https://xdtushztkdhcoltejvjl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PlCy3kKusfRWNFJ__QVA3g_oDFsKUQn';
const SYNC_PENDING_KEY  = 'aufgaben_sync_pending';

let _sb = null;

// ── Init ─────────────────────────────────────────────────────

function initSupabaseClient() {
  try {
    // supabase-js UMD build exposes window.supabase = { createClient, ... }
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return true;
    }
  } catch (e) {
    console.warn('Supabase init failed:', e);
  }
  return false;
}

// ── Pending-sync flag ─────────────────────────────────────────

function markSyncPending() {
  localStorage.setItem(SYNC_PENDING_KEY, '1');
}

function clearSyncPending() {
  localStorage.removeItem(SYNC_PENDING_KEY);
}

function isSyncPending() {
  return localStorage.getItem(SYNC_PENDING_KEY) === '1';
}

// ── Converters: JS → Supabase ─────────────────────────────────

function toDbCapture(c) {
  return {
    id:        c.id,
    text:      c.text      || '',
    category:  c.category  || null,
    type:      c.type      || null,
    tags:      c.tags      || [],
    projectId: c.projectId || null,
    dueAt:     c.dueAt     || null,
    doneAt:    c.doneAt    || null,
    createdAt: c.createdAt || new Date().toISOString(),
  };
}

function toDbProject(p) {
  return {
    id:        p.id,
    name:      p.name,
    color:     p.color,
    createdAt: typeof p.createdAt === 'number'
      ? new Date(p.createdAt).toISOString()
      : (p.createdAt || new Date().toISOString()),
  };
}

function toDbMindmap(m) {
  return {
    id:               m.id,
    title:            m.title,
    tags:             m.tags             || [],
    keywords:         m.keywords         || [],
    nodes:            m.nodes            || [],
    linkedCaptureIds: m.linkedCaptureIds || [],
    updatedAt:        m.updatedAt        || new Date().toISOString(),
  };
}

// ── Converters: Supabase → JS ─────────────────────────────────

function fromDbCapture(row) {
  return {
    id:        row.id,
    text:      row.text      || '',
    category:  row.category  || 'Inbox',
    type:      row.type      || 'note',
    tags:      Array.isArray(row.tags) ? row.tags : [],
    projectId: row.projectId || null,
    dueAt:     row.dueAt     || null,
    doneAt:    row.doneAt    || null,
    createdAt: row.createdAt || new Date().toISOString(),
    priority:  null,
  };
}

function fromDbProject(row) {
  return {
    id:        row.id,
    name:      row.name,
    color:     row.color,
    createdAt: row.createdAt ? new Date(row.createdAt).getTime() : Date.now(),
  };
}

function fromDbMindmap(row) {
  return {
    id:               row.id,
    title:            row.title            || '',
    tags:             Array.isArray(row.tags)             ? row.tags             : [],
    keywords:         Array.isArray(row.keywords)         ? row.keywords         : [],
    nodes:            Array.isArray(row.nodes)            ? row.nodes            : [],
    linkedCaptureIds: Array.isArray(row.linkedCaptureIds) ? row.linkedCaptureIds : [],
    updatedAt:        row.updatedAt        || new Date().toISOString(),
  };
}

// ── Core DB operations ────────────────────────────────────────

async function dbUpsert(table, record) {
  if (!_sb || !navigator.onLine) { markSyncPending(); return; }
  try {
    let row;
    if      (table === 'captures') row = toDbCapture(record);
    else if (table === 'projects') row = toDbProject(record);
    else if (table === 'mindmaps') row = toDbMindmap(record);
    else row = record;
    const { error } = await _sb.from(table).upsert(row);
    if (error) { console.warn('dbUpsert error [' + table + ']:', error.message); markSyncPending(); }
  } catch (e) {
    console.warn('dbUpsert failed:', e);
    markSyncPending();
  }
}

async function dbDelete(table, id) {
  if (!_sb || !navigator.onLine) { markSyncPending(); return; }
  try {
    const { error } = await _sb.from(table).delete().eq('id', id);
    if (error) { console.warn('dbDelete error [' + table + ']:', error.message); markSyncPending(); }
  } catch (e) {
    console.warn('dbDelete failed:', e);
    markSyncPending();
  }
}

// Pull all data from Supabase
async function dbFetchAll() {
  if (!_sb) return null;
  try {
    const [captRes, projRes, mmRes] = await Promise.all([
      _sb.from('captures').select('*'),
      _sb.from('projects').select('*'),
      _sb.from('mindmaps').select('*'),
    ]);
    if (captRes.error || projRes.error || mmRes.error) {
      console.warn('dbFetchAll error:', captRes.error || projRes.error || mmRes.error);
      return null;
    }
    return {
      captures: (captRes.data || []).map(fromDbCapture),
      projects: (projRes.data || []).map(fromDbProject),
      mindmaps: (mmRes.data  || []).map(fromDbMindmap),
    };
  } catch (e) {
    console.warn('dbFetchAll failed:', e);
    return null;
  }
}

// Push all local data to Supabase (full upsert)
async function dbPushAll(data) {
  if (!_sb || !navigator.onLine) return false;
  try {
    const ops = [];
    if (data.captures && data.captures.length)
      ops.push(_sb.from('captures').upsert(data.captures.map(toDbCapture)));
    if (data.projects && data.projects.length)
      ops.push(_sb.from('projects').upsert(data.projects.map(toDbProject)));
    if (data.mindmaps && data.mindmaps.length)
      ops.push(_sb.from('mindmaps').upsert(data.mindmaps.map(toDbMindmap)));
    if (!ops.length) { clearSyncPending(); return true; }
    const results = await Promise.all(ops);
    const errors = results.map((r) => r.error).filter(Boolean);
    if (errors.length) { console.warn('dbPushAll errors:', errors); return false; }
    clearSyncPending();
    return true;
  } catch (e) {
    console.warn('dbPushAll failed:', e);
    return false;
  }
}

// Merge local + remote: remote wins on ID conflict; local-only items added
function mergeData(local, remote) {
  const merge = (localArr, remoteArr) => {
    const remoteMap = new Map(remoteArr.map((r) => [r.id, r]));
    const localOnly = (localArr || []).filter((l) => !remoteMap.has(l.id));
    return [...remoteArr, ...localOnly];
  };
  return {
    captures: merge(local.captures, remote.captures),
    projects: merge(local.projects, remote.projects),
    mindmaps: merge(local.mindmaps, remote.mindmaps),
  };
}
