-- Create content management tables for super admin

-- Settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_avatar TEXT,
  cover_image TEXT,
  tags TEXT[],
  category TEXT,
  read_time INTEGER DEFAULT 5,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Press releases table
CREATE TABLE IF NOT EXISTS public.press_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  publication TEXT,
  publication_logo TEXT,
  published_date DATE NOT NULL,
  external_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.press_releases ENABLE ROW LEVEL SECURITY;

-- Settings policies (admin only can modify, everyone can read)
CREATE POLICY "Anyone can view settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert settings"
  ON public.settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
  ON public.settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings"
  ON public.settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Blog posts policies (published posts are public, admins can manage all)
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blog posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Brands policies (active brands are public, admins can manage all)
CREATE POLICY "Anyone can view active brands"
  ON public.brands FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert brands"
  ON public.brands FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brands"
  ON public.brands FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brands"
  ON public.brands FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Press releases policies (all are public, admins can manage)
CREATE POLICY "Anyone can view press releases"
  ON public.press_releases FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert press releases"
  ON public.press_releases FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update press releases"
  ON public.press_releases FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete press releases"
  ON public.press_releases FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('whatsapp_number', '"1234567890"'),
  ('contact_email', '"support@jewelryplatform.com"'),
  ('contact_phone', '"+1 (555) 123-4567"'),
  ('company_name', '"JewelCatalog Pro"'),
  ('company_address', '"123 Diamond Street, New York, NY 10001"')
ON CONFLICT (key) DO NOTHING;

-- Insert sample brands
INSERT INTO public.brands (name, logo_url, display_order, active) VALUES
  ('Tiffany & Co.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Tiffany_%26_Co._logo.svg/200px-Tiffany_%26_Co._logo.svg.png', 1, true),
  ('Cartier', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Cartier_logo.svg/200px-Cartier_logo.svg.png', 2, true),
  ('Bulgari', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Bulgari_logo.svg/200px-Bulgari_logo.svg.png', 3, true),
  ('Van Cleef & Arpels', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Van_Cleef_%26_Arpels_logo.svg/200px-Van_Cleef_%26_Arpels_logo.svg.png', 4, true),
  ('Harry Winston', 'https://via.placeholder.com/200x60/1a1a1a/FFD700?text=Harry+Winston', 5, true),
  ('Chopard', 'https://via.placeholder.com/200x60/1a1a1a/FFD700?text=Chopard', 6, true)
ON CONFLICT DO NOTHING;

-- Insert sample blog posts
INSERT INTO public.blog_posts (slug, title, excerpt, content, author_name, author_role, author_avatar, cover_image, tags, category, read_time, published, published_at) VALUES
  (
    'luxury-jewelry-trends-2025',
    'Top 10 Luxury Jewelry Trends to Watch in 2025',
    'Discover the most captivating jewelry trends that are set to dominate the luxury market in 2025, from sustainable materials to bold statement pieces.',
    '<p>The luxury jewelry industry is experiencing a renaissance, with innovative designs and sustainable practices taking center stage. Here are the top trends shaping 2025:</p><h2>1. Sustainable Luxury</h2><p>Eco-conscious consumers are driving demand for ethically sourced diamonds and recycled precious metals. Brands are responding with transparent supply chains and lab-grown alternatives.</p><h2>2. Bold Statement Pieces</h2><p>Oversized earrings, chunky chains, and dramatic necklaces are making waves. These pieces are designed to be conversation starters and Instagram-worthy.</p><h2>3. Colored Gemstones</h2><p>Move over diamonds – sapphires, emeralds, and rubies are experiencing renewed interest, especially in unique cuts and settings.</p><h2>4. Personalization</h2><p>Custom engraving, birthstones, and bespoke designs allow customers to create truly unique pieces that tell their personal story.</p><h2>5. Vintage Revival</h2><p>Art Deco and Victorian-inspired designs are making a comeback, blending classic elegance with modern craftsmanship.</p>',
    'Sarah Martinez',
    'Senior Jewelry Analyst',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200',
    ARRAY['trends', 'luxury', '2025'],
    'Industry Insights',
    8,
    true,
    now() - interval '2 days'
  ),
  (
    'diamond-certification-guide',
    'Understanding Diamond Certification: A Complete Guide',
    'Learn everything you need to know about diamond grading, certification bodies, and how to read a diamond certificate.',
    '<p>Diamond certification is crucial for both buyers and sellers. This comprehensive guide will help you understand the intricacies of diamond grading.</p><h2>The 4 Cs Explained</h2><p><strong>Cut:</strong> The most important factor affecting a diamond''s brilliance. Excellent cuts reflect light beautifully.</p><p><strong>Color:</strong> Graded from D (colorless) to Z (light yellow). The less color, the higher the value.</p><p><strong>Clarity:</strong> Measures internal and external flaws (inclusions and blemishes). Ranges from Flawless to Included.</p><p><strong>Carat:</strong> The weight of the diamond. One carat equals 200 milligrams.</p><h2>Major Certification Bodies</h2><ul><li><strong>GIA (Gemological Institute of America):</strong> The gold standard in diamond grading</li><li><strong>AGS (American Gem Society):</strong> Known for strict cut grading</li><li><strong>IGI (International Gemological Institute):</strong> Popular for lab-grown diamonds</li></ul><h2>Reading Your Certificate</h2><p>Learn to identify the unique characteristics of your diamond, including its proportions, fluorescence, and distinguishing features.</p>',
    'Dr. James Chen',
    'Gemologist',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200',
    ARRAY['diamonds', 'education', 'certification'],
    'Education',
    10,
    true,
    now() - interval '5 days'
  ),
  (
    'digital-catalog-management-tips',
    '5 Essential Tips for Managing Your Digital Jewelry Catalog',
    'Maximize your sales with these proven strategies for organizing, presenting, and sharing your jewelry inventory online.',
    '<p>In today''s digital-first world, how you present your jewelry collection online can make or break your sales. Here are five essential tips:</p><h2>1. High-Quality Photography</h2><p>Invest in professional jewelry photography. Show multiple angles, close-ups of details, and lifestyle shots. Good lighting is crucial.</p><h2>2. Detailed Descriptions</h2><p>Include all specifications: materials, dimensions, weight, gemstone details, and care instructions. Be thorough and accurate.</p><h2>3. Smart Categorization</h2><p>Organize your catalog by type, material, price range, and occasion. Make it easy for customers to find what they''re looking for.</p><h2>4. Regular Updates</h2><p>Keep your inventory current. Remove sold items promptly and add new pieces regularly to keep customers engaged.</p><h2>5. Customer Insights</h2><p>Track which pieces get the most interest, what price points work best, and which sharing methods are most effective.</p>',
    'Emily Rodriguez',
    'Digital Marketing Specialist',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    'https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=1200',
    ARRAY['catalog', 'tips', 'digital'],
    'Platform Updates',
    6,
    true,
    now() - interval '7 days'
  ),
  (
    'custom-jewelry-orders-best-practices',
    'Best Practices for Managing Custom Jewelry Orders',
    'From initial consultation to final delivery, learn how to streamline your custom jewelry workflow and exceed customer expectations.',
    '<p>Custom jewelry orders require careful management and clear communication. Follow these best practices for success:</p><h2>Initial Consultation</h2><p>Take detailed notes about customer preferences, budget, timeline, and inspiration. Use mood boards and sketches to align expectations.</p><h2>Clear Documentation</h2><p>Create detailed specifications including materials, dimensions, gemstones, and design elements. Get written approval before production.</p><h2>Progress Updates</h2><p>Keep customers informed throughout the creation process. Share photos and videos of work in progress to build excitement.</p><h2>Quality Control</h2><p>Inspect finished pieces thoroughly before delivery. Ensure they match specifications and meet quality standards.</p><h2>After-Sales Service</h2><p>Provide care instructions, offer sizing adjustments if needed, and follow up to ensure satisfaction.</p>',
    'Michael Thompson',
    'Master Jeweler',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1200',
    ARRAY['custom orders', 'workflow', 'best practices'],
    'Business Tips',
    7,
    true,
    now() - interval '10 days'
  ),
  (
    'gemstone-market-analysis-q4-2024',
    'Gemstone Market Analysis: Q4 2024 Insights',
    'Comprehensive analysis of gemstone pricing trends, demand patterns, and market forecasts for the final quarter of 2024.',
    '<p>The gemstone market showed interesting dynamics in Q4 2024. Here''s what the data reveals:</p><h2>Price Trends</h2><p><strong>Sapphires:</strong> Prices increased 12% year-over-year, driven by Kashmir origin stones.</p><p><strong>Emeralds:</strong> Colombian emeralds saw a 15% price increase due to limited supply.</p><p><strong>Rubies:</strong> Burmese rubies remained stable, while African alternatives gained market share.</p><h2>Demand Patterns</h2><p>Colored gemstones are increasingly popular in engagement rings, with sapphires leading the alternative category.</p><h2>Sustainability Impact</h2><p>Ethically sourced and traceable gemstones command a 20-30% premium in select markets.</p><h2>Market Forecast</h2><p>Expect continued growth in colored gemstone demand throughout 2025, particularly for untreated, natural stones with certification.</p>',
    'Alexandra Park',
    'Market Analyst',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandra',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200',
    ARRAY['market analysis', 'gemstones', 'trends'],
    'Industry Insights',
    9,
    true,
    now() - interval '14 days'
  ),
  (
    'jewelry-photography-lighting-techniques',
    'Master Jewelry Photography: Essential Lighting Techniques',
    'Professional tips and techniques for capturing stunning jewelry photos that showcase brilliance, detail, and craftsmanship.',
    '<p>Great jewelry photography starts with understanding light. Here are essential techniques used by professionals:</p><h2>Equipment Essentials</h2><ul><li>Macro lens (100mm recommended)</li><li>Tripod for stability</li><li>Light tent or lightbox</li><li>Multiple light sources (LED panels work well)</li><li>White background or reflective surface</li></ul><h2>Lighting Setup</h2><p><strong>Three-Point Lighting:</strong> Use a key light, fill light, and backlight to eliminate shadows and create dimension.</p><p><strong>Diffusion:</strong> Soften harsh light with diffusers to avoid hot spots on metal surfaces.</p><h2>Camera Settings</h2><p>Use manual mode with ISO 100, f/11-f/16 for depth of field, and adjust shutter speed accordingly. Shoot in RAW for maximum editing flexibility.</p><h2>Post-Processing</h2><p>Adjust white balance, enhance details, and remove dust spots. Be careful not to over-process – the jewelry should look natural.</p>',
    'David Park',
    'Professional Photographer',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1200',
    ARRAY['photography', 'tutorial', 'visual content'],
    'Education',
    8,
    true,
    now() - interval '18 days'
  );

-- Insert sample press releases
INSERT INTO public.press_releases (title, subtitle, content, publication, published_date, external_url, featured) VALUES
  (
    'JewelCatalog Pro Raises $10M in Series A Funding',
    'Leading jewelry tech platform secures funding to expand AI-powered features',
    '<p>JewelCatalog Pro announced today that it has raised $10 million in Series A funding led by Sparkle Ventures, with participation from Diamond Capital and existing investors. The funding will be used to expand the platform''s AI-powered catalog management features and grow the team.</p><p>"This investment validates our vision of transforming how jewelry vendors manage and share their catalogs," said CEO Sarah Johnson. "We''re excited to accelerate our product development and help even more jewelry businesses thrive in the digital age."</p>',
    'TechCrunch',
    '2024-11-15',
    'https://techcrunch.com',
    true
  ),
  (
    'Platform Surpasses 10,000 Active Vendors Worldwide',
    'Milestone achievement demonstrates growing adoption of digital catalog solutions',
    '<p>JewelCatalog Pro today announced it has surpassed 10,000 active vendors on its platform, representing jewelry businesses across 45 countries. The platform has facilitated over $500 million in catalog shares since launch.</p><p>"Reaching 10,000 vendors is a testament to the value our platform provides," said CMO Michael Chen. "Jewelers of all sizes are embracing digital transformation, and we''re proud to be their partner in this journey."</p>',
    'Jewelry Business Magazine',
    '2024-10-20',
    'https://jewelrybusiness.com',
    true
  ),
  (
    'New AI Features Transform Jewelry Catalog Management',
    'Automated tagging and smart recommendations enhance vendor efficiency',
    '<p>JewelCatalog Pro unveiled new AI-powered features that automatically tag products, suggest optimal pricing, and provide personalized recommendations to customers. Early testing shows a 40% reduction in catalog management time.</p>',
    'Forbes',
    '2024-09-10',
    'https://forbes.com',
    false
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_press_releases_updated_at BEFORE UPDATE ON public.press_releases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();