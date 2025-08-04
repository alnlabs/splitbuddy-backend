-- Fix User Settings Table Structure
-- This script fixes the user_settings table to match the entity structure

-- Drop the foreign key constraint if it exists
ALTER TABLE "user_settings" DROP CONSTRAINT IF EXISTS "FK_user_settings_user_id";

-- Rename user_id column to userId (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'user_id') THEN
        ALTER TABLE "user_settings" RENAME COLUMN "user_id" TO "userId";
    END IF;
END $$;

-- Change userId column type to character varying (if it's uuid)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'userId' AND data_type = 'uuid') THEN
        ALTER TABLE "user_settings" ALTER COLUMN "userId" TYPE character varying;
    END IF;
END $$;

-- Add missing columns that exist in the entity but not in the old migration
DO $$
BEGIN
    -- Add theme column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'theme') THEN
        ALTER TABLE "user_settings" ADD COLUMN "theme" character varying NOT NULL DEFAULT 'light';
    END IF;

    -- Add emailNotifications column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'emailNotifications') THEN
        ALTER TABLE "user_settings" ADD COLUMN "emailNotifications" boolean NOT NULL DEFAULT true;
    END IF;

    -- Add pushNotifications column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'pushNotifications') THEN
        ALTER TABLE "user_settings" ADD COLUMN "pushNotifications" boolean NOT NULL DEFAULT true;
    END IF;

    -- Add inAppNotifications column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'inAppNotifications') THEN
        ALTER TABLE "user_settings" ADD COLUMN "inAppNotifications" boolean NOT NULL DEFAULT true;
    END IF;

    -- Add reminders column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'reminders') THEN
        ALTER TABLE "user_settings" ADD COLUMN "reminders" boolean NOT NULL DEFAULT true;
    END IF;

    -- Add defaultGroupId column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'defaultGroupId') THEN
        ALTER TABLE "user_settings" ADD COLUMN "defaultGroupId" character varying;
    END IF;

    -- Add defaultCategoryId column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'defaultCategoryId') THEN
        ALTER TABLE "user_settings" ADD COLUMN "defaultCategoryId" character varying;
    END IF;

    -- Add defaultPaymentMethodId column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'defaultPaymentMethodId') THEN
        ALTER TABLE "user_settings" ADD COLUMN "defaultPaymentMethodId" character varying;
    END IF;

    -- Add twoFactorAuth column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'twoFactorAuth') THEN
        ALTER TABLE "user_settings" ADD COLUMN "twoFactorAuth" boolean NOT NULL DEFAULT false;
    END IF;

    -- Add loginAlerts column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'loginAlerts') THEN
        ALTER TABLE "user_settings" ADD COLUMN "loginAlerts" boolean NOT NULL DEFAULT false;
    END IF;

    -- Add biometricLogin column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'biometricLogin') THEN
        ALTER TABLE "user_settings" ADD COLUMN "biometricLogin" boolean NOT NULL DEFAULT false;
    END IF;

    -- Add offlineMode column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'offlineMode') THEN
        ALTER TABLE "user_settings" ADD COLUMN "offlineMode" boolean NOT NULL DEFAULT false;
    END IF;

    -- Add cloudSync column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'cloudSync') THEN
        ALTER TABLE "user_settings" ADD COLUMN "cloudSync" boolean NOT NULL DEFAULT false;
    END IF;

    -- Add exportData column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'exportData') THEN
        ALTER TABLE "user_settings" ADD COLUMN "exportData" boolean NOT NULL DEFAULT false;
    END IF;
END $$;

-- Update currency default to INR to match entity
ALTER TABLE "user_settings" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_settings'
ORDER BY ordinal_position;