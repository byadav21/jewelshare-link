-- Newsletter subscription system
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Blog comments system
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Newsletter subscribers policies
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all subscribers"
  ON public.newsletter_subscribers FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscribers"
  ON public.newsletter_subscribers FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Blog comments policies
CREATE POLICY "Anyone can submit comments"
  ON public.blog_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved comments"
  ON public.blog_comments FOR SELECT
  USING (status = 'approved' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update comments"
  ON public.blog_comments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete comments"
  ON public.blog_comments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage buckets for media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('blog-images', 'blog-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('brand-logos', 'brand-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']),
  ('press-media', 'press-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-images
CREATE POLICY "Anyone can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'blog-images' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'blog-images' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'blog-images' AND
    public.has_role(auth.uid(), 'admin')
  );

-- Storage policies for brand-logos
CREATE POLICY "Anyone can view brand logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-logos');

CREATE POLICY "Admins can upload brand logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'brand-logos' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update brand logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'brand-logos' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete brand logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'brand-logos' AND
    public.has_role(auth.uid(), 'admin')
  );

-- Storage policies for press-media
CREATE POLICY "Anyone can view press media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'press-media');

CREATE POLICY "Admins can upload press media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'press-media' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update press media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'press-media' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete press media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'press-media' AND
    public.has_role(auth.uid(), 'admin')
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.blog_comments(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.blog_comments(created_at DESC);