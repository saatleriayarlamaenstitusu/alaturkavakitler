CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  subscription TEXT NOT NULL,
  city TEXT NOT NULL,
  offsets TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  cursor_at INTEGER NOT NULL,
  wake_at INTEGER,
  revision TEXT NOT NULL,
  last_test_at INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX subscriptions_due ON subscriptions(wake_at);
CREATE INDEX subscriptions_expiry ON subscriptions(expires_at);
