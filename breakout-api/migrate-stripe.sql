-- ============================================================================
-- Stripe integration migration
-- ----------------------------------------------------------------------------
-- Adds 2 new columns to orders table (the other Stripe columns
-- — stripe_session_id, stripe_payment_intent — are already in schema.sql).
--
-- Run with:
--   npx wrangler d1 execute breakout-db --remote --file=migrate-stripe.sql
--
-- D1 (SQLite) doesn't support IF NOT EXISTS on ALTER TABLE — if the column
-- already exists, the command will fail with "duplicate column". Safe to
-- re-run: just ignore that specific error.
-- ============================================================================

ALTER TABLE orders ADD COLUMN stripe_payment_url TEXT;
ALTER TABLE orders ADD COLUMN stripe_session_expires_at TEXT;

-- Verify
SELECT name FROM pragma_table_info('orders') WHERE name LIKE 'stripe_%';
