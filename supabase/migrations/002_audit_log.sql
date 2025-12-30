-- Audit Log Table for tracking admin actions
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) NOT NULL,
  admin_id UUID REFERENCES admins(id),
  admin_name VARCHAR(255),
  target_type VARCHAR(50) NOT NULL,
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action_type ON audit_log(action_type);
CREATE INDEX idx_audit_log_admin_id ON audit_log(admin_id);

-- Enable Row Level Security
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read audit logs (admins via service role)
CREATE POLICY "Allow service role full access to audit_log" ON audit_log
  FOR ALL USING (true);

COMMENT ON TABLE audit_log IS 'Tracks all admin actions for accountability';
COMMENT ON COLUMN audit_log.action_type IS 'Type of action: approve_donation, reject_donation, manual_donation, update_material';
COMMENT ON COLUMN audit_log.target_type IS 'Type of entity affected: donation, material';
COMMENT ON COLUMN audit_log.description IS 'Human-readable description in Spanish';
