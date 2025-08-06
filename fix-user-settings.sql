-- Fix User Settings Table Structure
-- This SQL file contains manual fixes for user settings table issues

-- 1. Make password nullable for Google OAuth users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 2. Fix user_settings table structure
-- Check if user_id column exists and rename to userId
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'user_settings' AND column_name = 'user_id') THEN
        -- Drop foreign key constraint if it exists
        ALTER TABLE user_settings DROP CONSTRAINT IF EXISTS FK_user_settings_user_id;

        -- Rename column
        ALTER TABLE user_settings RENAME COLUMN user_id TO "userId";

        -- Change data type
        ALTER TABLE user_settings ALTER COLUMN "userId" TYPE character varying;
    END IF;
END $$;

-- 3. Add missing user_settings columns
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS theme character varying NOT NULL DEFAULT 'light';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "emailNotifications" boolean NOT NULL DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "pushNotifications" boolean NOT NULL DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "inAppNotifications" boolean NOT NULL DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS reminders boolean NOT NULL DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "defaultGroupId" character varying;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "defaultCategoryId" character varying;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "defaultPaymentMethodId" character varying;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "twoFactorAuth" boolean NOT NULL DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "loginAlerts" boolean NOT NULL DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "biometricLogin" boolean NOT NULL DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "offlineMode" boolean NOT NULL DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "cloudSync" boolean NOT NULL DEFAULT false;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS "exportData" boolean NOT NULL DEFAULT false;

-- 4. Update currency default to INR
ALTER TABLE user_settings ALTER COLUMN currency SET DEFAULT 'INR';

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_settings_userId ON user_settings("userId");
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_login_type ON users(login_type);

-- 6. Update existing records with default values
UPDATE user_settings SET
    theme = COALESCE(theme, 'light'),
    "emailNotifications" = COALESCE("emailNotifications", true),
    "pushNotifications" = COALESCE("pushNotifications", true),
    "inAppNotifications" = COALESCE("inAppNotifications", true),
    reminders = COALESCE(reminders, true),
    "twoFactorAuth" = COALESCE("twoFactorAuth", false),
    "loginAlerts" = COALESCE("loginAlerts", false),
    "biometricLogin" = COALESCE("biometricLogin", false),
    "offlineMode" = COALESCE("offlineMode", false),
    "cloudSync" = COALESCE("cloudSync", false),
    "exportData" = COALESCE("exportData", false),
    currency = COALESCE(currency, 'INR')
WHERE id IS NOT NULL;

-- Success message
SELECT 'User settings table fixes applied successfully!' as status;