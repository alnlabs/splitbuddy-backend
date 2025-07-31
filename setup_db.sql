-- Create the user for the application if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'splitbuddy_user_local') THEN
      CREATE ROLE splitbuddy_user_local LOGIN PASSWORD 'ngSystems@2019';
   END IF;
END
$do$;

-- Create the database owned by the new user (will fail if it already exists)
CREATE DATABASE splitbuddy_db_local OWNER splitbuddy_user_local;

-- To grant all privileges on the new database to the new user, run this manually if needed:
-- psql -h localhost -d splitbuddy_db_local -c "GRANT ALL PRIVILEGES ON DATABASE splitbuddy_db_local TO splitbuddy_user_local;"