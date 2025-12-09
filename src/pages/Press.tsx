import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ExternalLink, Newspaper } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Header } from "@/components/Header";

interface PressRelease {
  id: string;
  title: string;
  subtitle: string | null;
  content: string;
  publication: string | null;
  published_date: string;
  external_url: string | null;
  featured: boolean;
}

const Press = () => {
  const navigate = useNavigate();
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPressReleases();
  }, []);

  const fetchPressReleases = async () => {
    const { data, error } = await supabase
      .from("press_releases")
      .select("*")
      .order("published_date", { ascending: false });

    if (error) {
      console.error("Error fetching press releases:", error);
    } else {
      setPressReleases(data || []);
    }
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-16">
          
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
              <Newspaper className="h-4 w-4 text-category-jewellery" />
              <span className="text-muted-foreground">Press & News</span>
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight">
              Latest Press Releases
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Stay updated with our latest announcements, partnerships, and company milestones
            </p>
          </div>
        </div>
      </section>

      {/* Featured Press Releases */}
      {loading ? (
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </section>
      ) : (
        <>
          {pressReleases.filter((pr) => pr.featured).length > 0 && (
            <section className="container mx-auto px-4 py-16">
              <ScrollReveal>
                <h2 className="mb-8 text-3xl font-bold">Featured News</h2>
              </ScrollReveal>
              <div className="grid gap-8 md:grid-cols-2">
                {pressReleases
                  .filter((pr) => pr.featured)
                  .map((release, index) => (
                    <ScrollReveal key={release.id} delay={index * 0.1}>
                      <Card className="group overflow-hidden border-2 transition-all hover:border-category-jewellery hover:shadow-xl">
                        <CardContent className="p-8">
                          {release.publication && (
                            <Badge variant="outline" className="mb-4">
                              {release.publication}
                            </Badge>
                          )}
                          <h3 className="mb-3 text-2xl font-bold group-hover:text-category-jewellery">
                            {release.title}
                          </h3>
                          {release.subtitle && (
                            <p className="mb-4 text-lg text-muted-foreground">
                              {release.subtitle}
                            </p>
                          )}
                          <div
                            className="prose prose-invert mb-6 max-w-none text-sm"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(release.content) }}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(release.published_date)}
                            </div>
                            {release.external_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(release.external_url!, "_blank")}
                              >
                                Read More
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </ScrollReveal>
                  ))}
              </div>
            </section>
          )}

          {/* All Press Releases */}
          <section className="container mx-auto px-4 py-16">
            <ScrollReveal>
              <h2 className="mb-8 text-3xl font-bold">All Press Releases</h2>
            </ScrollReveal>
            <div className="space-y-6">
              {pressReleases
                .filter((pr) => !pr.featured)
                .map((release, index) => (
                  <ScrollReveal key={release.id} delay={index * 0.05}>
                    <Card className="group transition-all hover:border-category-jewellery hover:shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            {release.publication && (
                              <Badge variant="outline" className="mb-2">
                                {release.publication}
                              </Badge>
                            )}
                            <h3 className="mb-2 text-xl font-bold group-hover:text-category-jewellery">
                              {release.title}
                            </h3>
                            {release.subtitle && (
                              <p className="mb-3 text-muted-foreground">
                                {release.subtitle}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {formatDate(release.published_date)}
                            </div>
                          </div>
                          {release.external_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(release.external_url!, "_blank")}
                            >
                              Read More
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                ))}
            </div>
          </section>
        </>
      )}

      {/* Media Contact */}
      <section className="border-t py-16">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="mb-4 text-3xl font-bold">Media Contact</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              For press inquiries and media partnerships
            </p>
            <Button size="lg" onClick={() => navigate("/contact")}>
              Contact Press Team
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Press;