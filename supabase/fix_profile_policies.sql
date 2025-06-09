-- Fix for infinite recursion in profile policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;

-- Create a bypass policy to enable admins to view their own profile first
-- This solves the chicken-and-egg problem
CREATE POLICY "Bypass to check admin role" 
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Create new policies using a different approach
CREATE POLICY "Admin users can view all profiles"
ON profiles FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin users can update all profiles"
ON profiles FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
); 