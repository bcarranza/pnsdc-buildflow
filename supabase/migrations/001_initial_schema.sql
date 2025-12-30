-- PNSDC-buildFlow Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Date: 2025-12-29
-- Description: Creates all tables for the parish fundraising tracker

-- ============================================
-- HELPER FUNCTION: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TABLE: fundraising_goal
-- Tracks the overall fundraising target and progress
-- ============================================
CREATE TABLE IF NOT EXISTS fundraising_goal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_amount DECIMAL(12,2) NOT NULL DEFAULT 1000000.00,
    current_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_fundraising_goal_updated_at
    BEFORE UPDATE ON fundraising_goal
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: materials
-- Tracks construction materials needed and acquired
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity_needed INTEGER NOT NULL DEFAULT 0,
    quantity_current INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLE: admins
-- Parish administrators who can approve donations
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- ============================================
-- TABLE: donations
-- All donation claims (pending, approved, rejected)
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name VARCHAR(255),
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    amount DECIMAL(12,2) NOT NULL,
    material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
    proof_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);

-- Index for faster status queries (admin panel)
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE fundraising_goal ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: fundraising_goal
-- ============================================
-- Public can read (for dashboard)
CREATE POLICY "Public can view fundraising goal"
    ON fundraising_goal FOR SELECT
    USING (true);

-- Only service role can update (via API routes)
CREATE POLICY "Service role can update fundraising goal"
    ON fundraising_goal FOR UPDATE
    USING (auth.role() = 'service_role');

-- ============================================
-- RLS POLICIES: materials
-- ============================================
-- Public can read (for dashboard and donation form)
CREATE POLICY "Public can view materials"
    ON materials FOR SELECT
    USING (true);

-- Only service role can modify (via API routes)
CREATE POLICY "Service role can insert materials"
    ON materials FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update materials"
    ON materials FOR UPDATE
    USING (auth.role() = 'service_role');

-- ============================================
-- RLS POLICIES: donations
-- ============================================
-- Public can view approved donations only (for donor wall)
CREATE POLICY "Public can view approved donations"
    ON donations FOR SELECT
    USING (status = 'approved');

-- Anyone can insert (donation form submission)
CREATE POLICY "Anyone can submit donation"
    ON donations FOR INSERT
    WITH CHECK (true);

-- Service role can view all and update (admin panel)
CREATE POLICY "Service role can view all donations"
    ON donations FOR SELECT
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update donations"
    ON donations FOR UPDATE
    USING (auth.role() = 'service_role');

-- ============================================
-- RLS POLICIES: admins
-- ============================================
-- No public access to admins table
-- Service role only (for auth via API routes)
CREATE POLICY "Service role can view admins"
    ON admins FOR SELECT
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert admins"
    ON admins FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update admins"
    ON admins FOR UPDATE
    USING (auth.role() = 'service_role');

-- ============================================
-- STORAGE: proof-images bucket
-- Run this in SQL Editor after creating bucket in dashboard
-- ============================================
-- Note: Create bucket 'proof-images' in Storage dashboard first
-- Then run these policies:

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('proof-images', 'proof-images', true);

-- CREATE POLICY "Public can view proof images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'proof-images');

-- CREATE POLICY "Anyone can upload proof images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'proof-images');

-- ============================================
-- COMMENTS for documentation
-- ============================================
COMMENT ON TABLE fundraising_goal IS 'Single row tracking Q1,000,000 goal progress';
COMMENT ON TABLE materials IS 'Construction materials with needed/current quantities';
COMMENT ON TABLE donations IS 'All donation claims with approval workflow';
COMMENT ON TABLE admins IS 'Parish administrators with PIN-based auth';
COMMENT ON COLUMN donations.status IS 'pending = awaiting review, approved = counted in totals, rejected = not counted';
