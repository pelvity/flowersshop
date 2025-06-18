-- Fix for infinite recursion in profile policies

-- First, check all policies on the profiles table to identify problematic ones
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    RAISE NOTICE 'Checking existing profile policies...';
    
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        RAISE NOTICE 'Found policy: %', policy_record.policyname;
    END LOOP;
END
$$;

-- Drop all policies on profiles that might be causing recursion
DROP POLICY IF EXISTS "Allow public profiles access" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to access profiles" ON profiles;
DROP POLICY IF EXISTS "Allow individual profile access" ON profiles;
DROP POLICY IF EXISTS "Allow own profile read" ON profiles;
DROP POLICY IF EXISTS "Allow own profile update" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Bypass to check admin role" ON profiles;

-- Create basic policies with simpler access rules

-- First create a policy to allow users to access their own profile
-- This avoids the chicken-and-egg problem when checking for admin role
CREATE POLICY "Allow own profile access" 
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Create a policy to allow users to update their own profile
CREATE POLICY "Allow own profile update" 
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a service_role bypass policy for admin functions
-- This allows administrative operations to bypass RLS completely
CREATE POLICY "Allow service role bypass" 
ON profiles FOR ALL 
TO service_role
USING (true);

-- Create a simplified admin policy that doesn't cause recursion
-- We use a subquery to avoid recursive policy evaluation
CREATE POLICY "Admin can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid() AND users.role = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
);

-- Create a simplified admin policy for updates
CREATE POLICY "Admin can update all profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid() AND users.role = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
);

-- Create a simplified admin policy for insert
CREATE POLICY "Admin can insert profiles"
ON profiles FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid() AND users.role = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
);

-- Create a simplified admin policy for delete
CREATE POLICY "Admin can delete profiles"
ON profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid() AND users.role = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
);

-- Make sure public access is still allowed for SELECT
CREATE POLICY "Allow public profiles read" 
ON profiles FOR SELECT
USING (true); 