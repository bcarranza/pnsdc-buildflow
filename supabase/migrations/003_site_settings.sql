-- PNSDC-buildFlow Site Settings Schema
-- Migration: 003_site_settings.sql
-- Date: 2025-12-30
-- Description: Stores site-wide settings like progress visual selection

-- ============================================
-- TABLE: site_settings
-- Key-value store for site configuration
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: site_settings
-- ============================================
-- Public can read (for frontend to know which visual to display)
CREATE POLICY "Public can view site settings"
    ON site_settings FOR SELECT
    USING (true);

-- Only service role can modify (via API routes)
CREATE POLICY "Service role can insert site settings"
    ON site_settings FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update site settings"
    ON site_settings FOR UPDATE
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete site settings"
    ON site_settings FOR DELETE
    USING (auth.role() = 'service_role');

-- ============================================
-- SEED: Default progress visual
-- ============================================
INSERT INTO site_settings (key, value)
VALUES ('progress_visual', 'mountain')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE site_settings IS 'Key-value store for site-wide configuration';
COMMENT ON COLUMN site_settings.key IS 'Setting identifier (e.g., progress_visual)';
COMMENT ON COLUMN site_settings.value IS 'Setting value (JSON string or simple value)';
