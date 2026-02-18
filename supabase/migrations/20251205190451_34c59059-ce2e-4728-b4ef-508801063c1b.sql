-- Add status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status boolean DEFAULT true;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);