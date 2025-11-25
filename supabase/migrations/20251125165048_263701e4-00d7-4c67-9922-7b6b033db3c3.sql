-- Create scratch rewards tracking table
CREATE TABLE IF NOT EXISTS public.scratch_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value TEXT NOT NULL,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scratch_rewards ENABLE ROW LEVEL SECURITY;

-- Anyone can insert scratch attempts
CREATE POLICY "Anyone can create scratch attempts"
  ON public.scratch_rewards
  FOR INSERT
  WITH CHECK (true);

-- Anyone can view their own scratch rewards by session
CREATE POLICY "Users can view their own scratch rewards"
  ON public.scratch_rewards
  FOR SELECT
  USING (true);

-- Anyone can update their own scratch rewards
CREATE POLICY "Users can update their own scratch rewards"
  ON public.scratch_rewards
  FOR UPDATE
  USING (true);

-- Create index for faster session lookups
CREATE INDEX idx_scratch_rewards_session ON public.scratch_rewards(session_id);
CREATE INDEX idx_scratch_rewards_created ON public.scratch_rewards(created_at);