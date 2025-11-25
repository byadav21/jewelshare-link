-- Create wishlists table
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  name TEXT NOT NULL DEFAULT 'My Wishlist',
  share_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64'),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(share_token)
);

-- Create wishlist_items table
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  share_link_id UUID REFERENCES public.share_links(id) ON DELETE SET NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(wishlist_id, product_id)
);

-- Create indexes
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_session_id ON public.wishlists(session_id);
CREATE INDEX idx_wishlists_share_token ON public.wishlists(share_token);
CREATE INDEX idx_wishlist_items_wishlist_id ON public.wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_product_id ON public.wishlist_items(product_id);

-- Enable Row Level Security
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlists
CREATE POLICY "Users can view their own wishlists"
  ON public.wishlists FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Anyone can view public wishlists by share token"
  ON public.wishlists FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own wishlists"
  ON public.wishlists FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can update their own wishlists"
  ON public.wishlists FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can delete their own wishlists"
  ON public.wishlists FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

-- RLS Policies for wishlist_items
CREATE POLICY "Users can view items in their wishlists"
  ON public.wishlist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        (auth.uid() IS NOT NULL AND auth.uid() = wishlists.user_id) OR
        (auth.uid() IS NULL AND wishlists.session_id IS NOT NULL) OR
        (wishlists.is_public = true)
      )
    )
  );

CREATE POLICY "Users can add items to their wishlists"
  ON public.wishlist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        (auth.uid() IS NOT NULL AND auth.uid() = wishlists.user_id) OR
        (auth.uid() IS NULL AND wishlists.session_id IS NOT NULL)
      )
    )
  );

CREATE POLICY "Users can remove items from their wishlists"
  ON public.wishlist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.wishlists
      WHERE wishlists.id = wishlist_items.wishlist_id
      AND (
        (auth.uid() IS NOT NULL AND auth.uid() = wishlists.user_id) OR
        (auth.uid() IS NULL AND wishlists.session_id IS NOT NULL)
      )
    )
  );

-- Trigger to update updated_at on wishlists
CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();