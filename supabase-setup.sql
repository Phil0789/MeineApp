-- ============================================================
-- SUPABASE SETUP — run this once in the Supabase SQL Editor
-- Project: https://xdtushztkdhcoltejvjl.supabase.co
-- ============================================================

-- captures table
-- Maps to state.captures in the app (inbox items, tasks, notes)
CREATE TABLE IF NOT EXISTS captures (
  id          TEXT        PRIMARY KEY,
  text        TEXT        NOT NULL DEFAULT '',
  category    TEXT,
  type        TEXT,
  tags        JSONB       NOT NULL DEFAULT '[]',
  "projectId" TEXT,
  "dueAt"     TIMESTAMPTZ,
  "doneAt"    TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- projects table
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL DEFAULT '',
  color       TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- mindmaps table
-- nodes and linkedCaptureIds are stored as JSONB arrays
CREATE TABLE IF NOT EXISTS mindmaps (
  id                TEXT        PRIMARY KEY,
  title             TEXT        NOT NULL DEFAULT '',
  tags              JSONB       NOT NULL DEFAULT '[]',
  keywords          JSONB       NOT NULL DEFAULT '[]',
  nodes             JSONB       NOT NULL DEFAULT '[]',
  "linkedCaptureIds" JSONB      NOT NULL DEFAULT '[]',
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────
-- The app uses an anon/publishable key without user auth.
-- Enable RLS with a permissive policy so all clients can read/write.
-- IMPORTANT: anyone with the project URL + key can access this data.
-- Add auth later if multi-user support is needed.

ALTER TABLE captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_captures" ON captures
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_mindmaps" ON mindmaps
  FOR ALL USING (true) WITH CHECK (true);
