-- Roamwise AI - Supabase PostgreSQL Schema
-- Migration 001: Robust UUID Trips & RLS Security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trips Table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    country VARCHAR(100) DEFAULT '',
    start_date DATE,
    end_date DATE,
    tagline TEXT,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0 AND duration_days <= 30),
    traveler_count INTEGER NOT NULL DEFAULT 2 CHECK (traveler_count > 0 AND traveler_count <= 100),
    budget_tier VARCHAR(50) NOT NULL DEFAULT 'moderate',
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    estimated_total_cost NUMERIC(12, 2) DEFAULT 0.00,
    travel_styles JSONB DEFAULT '[]'::jsonb,
    group_type VARCHAR(50) DEFAULT 'couple',
    pace VARCHAR(50) DEFAULT 'balanced',
    accommodation_preference VARCHAR(100) DEFAULT 'boutique_hotel',
    additional_instructions TEXT,
    itinerary_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_destination ON public.trips(destination);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON public.trips(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if re-running
DROP POLICY IF EXISTS "Authenticated users manage own trips" ON public.trips;
DROP POLICY IF EXISTS "Public access to anonymous demo trips" ON public.trips;
DROP POLICY IF EXISTS "Anonymous demo trips full access" ON public.trips;
DROP POLICY IF EXISTS "Anonymous demo trips read access" ON public.trips;
DROP POLICY IF EXISTS "Anonymous demo trips insert access" ON public.trips;
DROP POLICY IF EXISTS "Users can view own trips or public anonymous trips" ON public.trips;
DROP POLICY IF EXISTS "Users can insert trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;

-- 1. Authenticated users: Strict ownership isolation
CREATE POLICY "Authenticated users manage own trips"
    ON public.trips
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Anonymous / Demo mode access (full CRUD for records where user_id IS NULL)
CREATE POLICY "Anonymous demo trips full access"
    ON public.trips
    FOR ALL
    TO anon
    USING (user_id IS NULL)
    WITH CHECK (user_id IS NULL);

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_trips_updated_at ON public.trips;
CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON public.trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
