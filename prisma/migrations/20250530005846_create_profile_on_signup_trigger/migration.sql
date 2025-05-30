-- Drop the trigger if it already exists to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Create a function to handle new user creation and insert into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
-- Set the search path to ensure 'public.profiles' is found
SET search_path = public
AS $$
BEGIN
  -- Insert a new profile row using data from the new auth.users record
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,  -- The id of the new user from auth.users
    NEW.email, -- The email of the new user from auth.users
    -- Attempt to get username from raw_user_meta_data (passed during signup).
    -- If not available, generate one from the email address (part before '@')
    -- and append a short random string to help with uniqueness.
    -- Note: This username generation is a basic strategy. For guaranteed uniqueness
    -- in all edge cases, a more robust mechanism might be needed.
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4))
  );
  RETURN NEW; -- The result is ignored for an AFTER trigger, but it's good practice
END;
$$;

-- Create a trigger that fires after a new user is inserted into the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW -- This ensures the trigger function runs for each inserted row
  EXECUTE PROCEDURE public.handle_new_user(); -- Call the function we defined above

-- Comments on permissions and context:
-- SECURITY DEFINER: The handle_new_user function will execute with the permissions
-- of the user who defined it (typically a superuser or the database owner).
-- This allows it to insert into public.profiles even if the user performing
-- the signup (e.g., an anonymous user) doesn't have direct insert permissions.

-- search_path: Setting the search_path inside the function ensures that table
-- names (like 'profiles') are resolved correctly without needing to be schema-qualified
-- everywhere, assuming they are in the 'public' schema.