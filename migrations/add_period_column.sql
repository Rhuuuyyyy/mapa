-- ============================================================================
-- Migration: Add 'period' column to xml_uploads table
--
-- This migration adds the missing 'period' column that stores the quarterly
-- period for each XML upload (e.g., "Q1-2025", "Q2-2024")
-- ============================================================================

-- Check if column exists first (PostgreSQL way)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'xml_uploads'
        AND column_name = 'period'
    ) THEN
        -- Add the column
        ALTER TABLE xml_uploads
        ADD COLUMN period VARCHAR(20);

        RAISE NOTICE 'Column "period" added successfully to xml_uploads table';
    ELSE
        RAISE NOTICE 'Column "period" already exists in xml_uploads table';
    END IF;
END $$;

-- Verify the change
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'xml_uploads'
AND column_name = 'period';
