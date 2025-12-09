import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Separator } from "@/components/ui/separator";
import { BlogComments } from "@/components/BlogComments";
import { 
  Calendar, 
  Clock, 
  ArrowLeft,
  Share2,
  Tag,
  User
} from "lucide-react";

// Extended blog posts data with full content
const blogPostsData = {
  "1": {
    id: "1",
    title: "The Future of Diamond Certification: Lab-Grown vs Natural Diamonds",
    excerpt: "Explore how digital certification is transforming the diamond industry and what it means for jewelry vendors managing both lab-grown and natural diamonds.",
    content: `
      <p>The diamond industry is experiencing a revolutionary transformation with the rise of lab-grown diamonds and advanced digital certification methods. As a jewelry vendor, understanding these changes is crucial for your business success.</p>

      <h2>The Rise of Lab-Grown Diamonds</h2>
      <p>Lab-grown diamonds have become increasingly popular, offering the same physical, chemical, and optical properties as natural diamonds at a fraction of the cost. Major certification labs like GIA and IGI have adapted their services to accommodate this growing market segment.</p>

      <h2>Digital Certification Revolution</h2>
      <p>Traditional paper certificates are being replaced by blockchain-verified digital certificates, providing unprecedented security and traceability. This technology ensures authenticity and builds consumer trust.</p>

      <h2>Impact on Jewelry Vendors</h2>
      <p>Vendors now need to manage both natural and lab-grown inventory efficiently, clearly communicate differences to customers, and leverage digital certification in their marketing. Our platform helps you organize and present both categories professionally.</p>

      <h2>Best Practices</h2>
      <ul>
        <li>Clearly distinguish between natural and lab-grown diamonds in your catalog</li>
        <li>Include certification details prominently in product descriptions</li>
        <li>Educate customers on the benefits and characteristics of each type</li>
        <li>Use high-quality images and 3D viewers to showcase diamond quality</li>
      </ul>

      <p>The future is bright for vendors who embrace both natural and lab-grown diamonds while leveraging modern certification technologies.</p>
    `,
    category: "Industry Trends",
    author: "Dr. Sarah Mitchell",
    authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    date: "2024-01-15",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=600&fit=crop",
    tags: ["Diamonds", "Certification", "Technology"]
  },
  "2": {
    id: "2",
    title: "New Feature: 3D Product Viewer for Enhanced Customer Engagement",
    excerpt: "We've just launched our revolutionary 3D product viewer that allows your customers to interact with jewelry pieces like never before.",
    content: `
      <p>We're thrilled to announce the launch of our new 3D Product Viewer feature, a game-changing tool that transforms how customers experience your jewelry online.</p>

      <h2>Why 3D Viewing Matters</h2>
      <p>Traditional 2D images, while helpful, can't fully capture the intricate details and brilliance of fine jewelry. Our 3D viewer allows customers to rotate, zoom, and examine pieces from every angle, creating an experience closer to holding the piece in their hands.</p>

      <h2>Key Features</h2>
      <ul>
        <li><strong>360° Rotation:</strong> Customers can view jewelry from any angle</li>
        <li><strong>Zoom Functionality:</strong> Examine intricate details up close</li>
        <li><strong>Auto-Rotate Mode:</strong> Showcase pieces with elegant automated rotation</li>
        <li><strong>Mobile Optimized:</strong> Smooth performance on all devices</li>
      </ul>

      <h2>Impact on Sales</h2>
      <p>Early adopters have reported a 35% increase in customer engagement and a 20% boost in conversion rates. The ability to examine products thoroughly builds confidence and reduces purchase hesitation.</p>

      <h2>How to Get Started</h2>
      <p>The 3D viewer is automatically available for all products. Simply upload your product images, and our system will create an interactive 3D experience. For premium 3D models, contact our support team.</p>

      <p>Elevate your catalog and provide customers with an unmatched viewing experience today!</p>
    `,
    category: "Platform Updates",
    author: "Tech Team",
    authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
    date: "2024-01-12",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=1200&h=600&fit=crop",
    tags: ["Features", "3D", "Updates"]
  },
  "3": {
    id: "3",
    title: "Maximizing Sales with Custom Pricing Strategies",
    excerpt: "Learn how to leverage our platform's markup and markdown features to optimize pricing for different customer segments and boost your revenue.",
    content: `
      <p>Strategic pricing is one of the most powerful tools in your business arsenal. Our platform's custom pricing features enable you to implement sophisticated pricing strategies with ease.</p>

      <h2>Understanding Markup and Markdown</h2>
      <p>The ability to adjust prices for different customer segments or occasions is crucial. Whether offering wholesale discounts or premium pricing for exclusive clients, our tools make it simple.</p>

      <h2>Pricing Strategies That Work</h2>
      <h3>1. Tiered Customer Pricing</h3>
      <p>Create different pricing tiers for retail customers, wholesale buyers, and VIP clients. Use our share link feature with custom markups for each segment.</p>

      <h3>2. Seasonal Promotions</h3>
      <p>Set time-limited markdown percentages for holiday sales, clearance events, or special occasions. The expiry date feature ensures promotions end automatically.</p>

      <h3>3. Volume-Based Discounts</h3>
      <p>Encourage larger orders by creating special catalog links with progressive discounts for wholesale buyers.</p>

      <h2>Best Practices</h2>
      <ul>
        <li>Track which pricing strategies convert best using our analytics</li>
        <li>Test different markup percentages for different product categories</li>
        <li>Use clear expiry dates to create urgency</li>
        <li>Maintain separate catalogs for different customer segments</li>
      </ul>

      <h2>Real Results</h2>
      <p>Vendors using strategic pricing have seen average revenue increases of 40% within three months. The key is testing, measuring, and refining your approach.</p>

      <p>Start implementing smart pricing strategies today and watch your revenue grow!</p>
    `,
    category: "Best Practices",
    author: "Priya Sharma",
    authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    date: "2024-01-10",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&h=600&fit=crop",
    tags: ["Pricing", "Sales", "Strategy"]
  }
};

const relatedPosts = [
  { id: "2", title: "New Feature: 3D Product Viewer", category: "Platform Updates" },
  { id: "3", title: "Maximizing Sales with Custom Pricing", category: "Best Practices" },
];

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const post = id ? blogPostsData[id as keyof typeof blogPostsData] : null;

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="mb-4 text-4xl font-bold">Post Not Found</h1>
        <Button onClick={() => navigate('/blog')}>Back to Blog</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden border-b">
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <Button
          variant="secondary"
          className="absolute left-4 top-4 gap-2 md:left-8 md:top-8"
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Button>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal>
            {/* Header */}
            <div className="mb-8">
              <Badge className="mb-4">{post.category}</Badge>
              <h1 className="mb-6 text-4xl font-bold md:text-5xl">{post.title}</h1>
              
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <img
                    src={post.authorImage}
                    alt={post.author}
                    className="h-10 w-10 rounded-full border-2"
                  />
                  <div>
                    <p className="font-medium text-foreground">{post.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            {/* Tags */}
            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Share */}
            <div className="mt-8 flex items-center gap-4">
              <p className="font-semibold">Share this article:</p>
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </ScrollReveal>

          <Separator className="my-12" />

          {/* Related Posts */}
          <ScrollReveal>
            <h2 className="mb-6 text-3xl font-bold">Related Articles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedPosts.filter(p => p.id !== post.id).slice(0, 2).map(related => (
                <Card 
                  key={related.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => navigate(`/blog/${related.id}`)}
                >
                  <CardContent className="p-6">
                    <Badge className="mb-3">{related.category}</Badge>
                    <h3 className="text-xl font-semibold transition-colors hover:text-primary">
                      {related.title}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal>
            <Card className="mt-12 border-2 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-8 text-center">
                <h3 className="mb-4 text-2xl font-bold">Ready to Transform Your Jewelry Business?</h3>
                <p className="mb-6 text-muted-foreground">
                  Join hundreds of jewelry vendors using our platform to manage catalogs, share with clients, and grow their business.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Button size="lg" onClick={() => navigate('/auth')}>
                    Get Started Free
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                    Contact Sales
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
