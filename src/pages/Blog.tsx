import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  Search,
  TrendingUp,
  Sparkles,
  BookOpen,
  Tag
} from "lucide-react";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  author_name: string;
  author_avatar: string | null;
  cover_image: string | null;
  tags: string[] | null;
  category: string | null;
  read_time: number;
  published_at: string | null;
}

const Blog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error);
    } else if (data) {
      setBlogPosts(data);
      const uniqueCategories = ["All", ...new Set(data.map(post => post.category).filter(Boolean) as string[])];
      setCategories(uniqueCategories);
    }
    setLoading(false);
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (post.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    type: "BreadcrumbList" as const,
    items: [
      { name: "Home", url: "https://cataleon.com/" },
      { name: "Blog", url: "https://cataleon.com/blog" }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEOHead
        title="Jewelry Industry Blog - Tips, Trends & Updates | Cataleon"
        description="Stay informed with the latest jewelry industry trends, diamond certification updates, pricing strategies, and best practices for managing your jewelry business. Expert insights for jewelry vendors."
        keywords="jewelry blog, diamond industry news, jewelry business tips, gemstone trends, jewelry vendor guides, catalog management tips, diamond pricing strategies"
        canonicalUrl="/blog"
      />
      
      {/* Structured Data */}
      <StructuredData data={breadcrumbSchema} />
      
      <Header />
      
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 pt-4">
        <BreadcrumbNav />
      </div>
      
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-category-jewellery/10 via-category-gemstone/10 to-category-diamond/10 py-20">
        <div className="container mx-auto px-4">
          
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4 gap-1.5 px-4 py-1.5" variant="secondary">
                <BookOpen className="h-3.5 w-3.5" />
                Blog & Resources
              </Badge>
              <h1 className="mb-4 text-5xl font-bold">Insights & Updates</h1>
              <p className="mb-8 text-xl text-muted-foreground">
                Stay informed with the latest jewelry industry trends, platform updates, and best practices for managing your business.
              </p>

              {/* Search Bar */}
              <div className="relative mx-auto max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles, trends, updates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 pl-12 pr-4 text-base"
                  maxLength={100}
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b py-6">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="gap-2"
                >
                  <Tag className="h-4 w-4" />
                  {category}
                </Button>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* All Posts Grid */}
      <section className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No articles found matching your criteria.</p>
          </div>
        ) : (
          <>
            <ScrollReveal>
              <h2 className="mb-8 flex items-center gap-2 text-3xl font-bold">
                <Sparkles className="h-6 w-6 text-category-jewellery" />
                {selectedCategory === "All" ? "All Articles" : selectedCategory}
              </h2>
            </ScrollReveal>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, index) => (
                <ScrollReveal key={post.id} delay={0.1 * index}>
                  <Card 
                    className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-category-jewellery/50 hover:shadow-xl"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={post.cover_image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {post.category && (
                        <Badge className="absolute left-4 top-4 gap-1.5">
                          <TrendingUp className="h-3 w-3" />
                          {post.category}
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.published_at)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {post.read_time} min read
                        </div>
                      </div>
                      <CardTitle className="text-2xl transition-colors group-hover:text-category-jewellery line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="mt-2 text-base line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">By {post.author_name}</p>
                        <Button variant="ghost" className="group gap-2">
                          Read More
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="border-t bg-gradient-to-br from-category-jewellery/5 via-category-gemstone/5 to-category-diamond/5 py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl">
              <NewsletterSubscribe />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;