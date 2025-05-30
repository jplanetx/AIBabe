-- Supabase Trigger and Function to create a user profile on new user signup.

-- 1. Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Required for functions that modify data in other schemas or tables
AS $$
BEGIN
  -- Insert a new profile entry into public.profiles
  -- It uses the id and email from the newly inserted row in auth.users
  INSERT INTO public.profiles (id, email, "createdAt", "updatedAt")
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW; -- Returns the new row from auth.users
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (optional, requires a logging table or extension)
    -- RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Depending on requirements, you might want to let the user creation succeed
    -- or raise an exception to roll back the transaction.
    -- For now, let it succeed but a more robust error handling might be needed.
    RETURN NEW;
END;
$$;

-- 2. Create the trigger to call the function after a new user is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; -- Drop if it already exists to avoid errors during re-application
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant usage on schema public to postgres and anon, authenticated roles if not already granted
-- This might be necessary depending on your Supabase setup, but often default permissions are sufficient.
-- GRANT USAGE ON SCHEMA public TO postgres;
-- GRANT USAGE ON SCHEMA public TO anon;
-- GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant insert permissions on profiles table to the role that the trigger function runs as.
-- Since the function is SECURITY DEFINER, it runs with the permissions of the user who defined it (usually postgres or a superuser).
-- Ensure that this definer role has INSERT permissions on public.profiles.
-- This is typically handled by Supabase default roles or if you manage roles strictly.
-- Example: GRANT INSERT ON public.profiles TO postgres; -- Or the specific definer role.

COMMENT ON FUNCTION public.handle_new_user() IS 'Handles the creation of a user profile in public.profiles upon new user registration in auth.users.';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'When a new user is created in auth.users, automatically create a corresponding profile in public.profiles.';