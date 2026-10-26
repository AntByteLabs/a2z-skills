-- Did the guide actually fix it? One row per vote, no identifiers kept.
CREATE TABLE IF NOT EXISTS feedback (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL,
  helpful    INTEGER NOT NULL CHECK (helpful IN (0, 1)),
  country    TEXT,
  note       TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_slug ON feedback (slug);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at);
