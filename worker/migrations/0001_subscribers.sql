-- Newsletter list. One row per address, no duplicates.
CREATE TABLE IF NOT EXISTS subscribers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  source_path   TEXT,
  source        TEXT,
  lead_magnet   TEXT,
  country       TEXT,
  confirm_token TEXT,
  confirmed_at  DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscribers_status  ON subscribers (status);
CREATE INDEX IF NOT EXISTS idx_subscribers_created ON subscribers (created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers (confirm_token)
  WHERE confirm_token IS NOT NULL;
