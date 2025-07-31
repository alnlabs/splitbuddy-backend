-- SplitBuddy Database Setup Script
-- This script creates the necessary database users and databases

-- Create production user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'splitbuddy_user_prod') THEN
        CREATE ROLE splitbuddy_user_prod LOGIN PASSWORD 'SplitBuddy2024!Secure';
    END IF;
END
$$;

-- Create production database if it doesn't exist
SELECT 'CREATE DATABASE splitbuddy_prod OWNER splitbuddy_user_prod'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'splitbuddy_prod')\gexec

-- Grant privileges to production user
GRANT ALL PRIVILEGES ON DATABASE splitbuddy_prod TO splitbuddy_user_prod;

-- Create local user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'splitbuddy_user_local') THEN
        CREATE ROLE splitbuddy_user_local LOGIN PASSWORD 'ngSystems@2019';
    END IF;
END
$$;

-- Create local database if it doesn't exist
SELECT 'CREATE DATABASE splitbuddy_db_local OWNER splitbuddy_user_local'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'splitbuddy_db_local')\gexec

-- Grant privileges to local user
GRANT ALL PRIVILEGES ON DATABASE splitbuddy_db_local TO splitbuddy_user_local;