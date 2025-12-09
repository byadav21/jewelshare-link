import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";

const CookiePolicyPage = () => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "cookie_policy")
        .single();
      
      if (data?.value) {
        setContent(typeof data.value === "string" ? data.value : JSON.stringify(data.value));
      }
      setLoading(false);
    };
    
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          ) : content ? (
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          ) : (
            <p className="text-muted-foreground">
              Cookie policy content has not been configured yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default CookiePolicyPage;
