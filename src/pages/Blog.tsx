import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/ScrollReveal";
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

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  featured: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of Diamond Certification: Lab-Grown vs Natural Diamonds",
    excerpt: "Explore how digital certification is transforming the diamond industry and what it means for jewelry vendors managing both lab-grown and natural diamonds.",
    content: "",
    category: "Industry Trends",
    author: "Dr. Sarah Mitchell",
    date: "2024-01-15",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=500&fit=crop",
    tags: ["Diamonds", "Certification", "Technology"],
    featured: true
  },
  {
    id: "2",
    title: "New Feature: 3D Product Viewer for Enhanced Customer Engagement",
    excerpt: "We've just launched our revolutionary 3D product viewer that allows your customers to interact with jewelry pieces like never before.",
    content: "",
    category: "Platform Updates",
    author: "Tech Team",
    date: "2024-01-12",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=800&h=500&fit=crop",
    tags: ["Features", "3D", "Updates"],
    featured: true
  },
  {
    id: "3",
    title: "Maximizing Sales with Custom Pricing Strategies",
    excerpt: "Learn how to leverage our platform's markup and markdown features to optimize pricing for different customer segments and boost your revenue.",
    content: "",
    category: "Best Practices",
    author: "Priya Sharma",
    date: "2024-01-10",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&h=500&fit=crop",
    tags: ["Pricing", "Sales", "Strategy"],
    featured: true
  },
  {
    id: "4",
    title: "2024 Jewelry Trends: What's Driving Consumer Demand",
    excerpt: "Discover the top jewelry trends shaping consumer preferences in 2024, from sustainable materials to personalized designs.",
    content: "",
    category: "Industry Trends",
    author: "Anita Desai",
    date: "2024-01-08",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=500&fit=crop",
    tags: ["Trends", "Consumer Behavior", "Market Analysis"],
    featured: false
  },
  {
    id: "5",
    title: "How to Use Video Requests to Close More Deals",
    excerpt: "Video requests are one of our most popular features. Here's how top vendors use them to build trust and convert leads faster.",
    content: "",
    category: "Best Practices",
    author: "Rajesh Patel",
    date: "2024-01-05",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=500&fit=crop",
    tags: ["Video", "Sales", "Customer Service"],
    featured: false
  },
  {
    id: "6",
    title: "Enhanced Security Features: Protecting Your Inventory Data",
    excerpt: "We've implemented new security measures including advanced encryption and role-based access controls to keep your data safe.",
    content: "",
    category: "Platform Updates",
    author: "Tech Team",
    date: "2024-01-03",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop",
    tags: ["Security", "Updates", "Data Protection"],
    featured: false
  }
];

const categories = ["All", "Industry Trends", "Platform Updates", "Best Practices"];

const Blog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  const filteredPosts = [...featuredPosts, ...regularPosts].filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-jewellery-from/10 via-gemstone-from/10 to-diamond-from/10 py-20">
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

      {/* Featured Posts */}
      {featuredPosts.length > 0 && selectedCategory === "All" && !searchQuery && (
        <section className="container mx-auto px-4 py-16">
          <ScrollReveal>
            <div className="mb-8 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Featured Articles</h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 lg:grid-cols-2">
            {featuredPosts.slice(0, 2).map((post, index) => (
              <ScrollReveal key={post.id} delay={0.1 * index}>
                <Card className="group cursor-pointer overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-xl">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <Badge className="absolute left-4 top-4 gap-1.5">
                      <TrendingUp className="h-3 w-3" />
                      {post.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                    </div>
                    <CardTitle className="text-2xl transition-colors group-hover:text-primary">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">By {post.author}</p>
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
        </section>
      )}

      {/* All Posts Grid */}
      <section className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <h2 className="mb-8 text-3xl font-bold">
            {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory === "All" ? "Latest Articles" : selectedCategory}
          </h2>
        </ScrollReveal>

        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xl text-muted-foreground">No articles found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <ScrollReveal key={post.id} delay={0.05 * index}>
                <Card className="group flex h-full cursor-pointer flex-col overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <Badge className="absolute left-3 top-3 text-xs">
                      {post.category}
                    </Badge>
                  </div>
                  <CardHeader className="flex-1">
                    <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg transition-colors group-hover:text-primary">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold">Want to Stay Updated?</h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Subscribe to our newsletter and never miss important updates about jewelry trends and platform features.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" onClick={() => navigate('/')}>
                  Subscribe to Newsletter
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/catalog')}>
                  Explore Catalog
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Blog;
