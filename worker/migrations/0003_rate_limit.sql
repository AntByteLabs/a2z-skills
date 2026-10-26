-- Per-IP throttle for the public write endpoints.
--
-- Turnstile is the other half of this and is not switched on, because nobody
-- can verify from a script that a real browser still gets a token. This half is
-- verifiable, needs no JavaScript, and blocks the thing that actually matters:
-- one source posting hundreds of addresses.
--
-- The key is a hash of the IP, not the IP. We never need to know who it was,
-- only that it was the same somebody.
CREATE TABLE IF NOT EXISTS rate_limit (
  key TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS rate_limit_window ON rate_limit (window_start);
