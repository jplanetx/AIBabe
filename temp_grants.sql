-- Grant permissions to the database user for the auth schema
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO postgres;
