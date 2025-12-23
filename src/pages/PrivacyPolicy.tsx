import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "dompurify";
import { DEFAULT_PRIVACY_POLICY } from "@/constants/legalDefaults";

const PrivacyPolicy = () => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "privacy_policy")
        .single();
      
      if (data?.value && typeof data.value === "string" && data.value.trim()) {
        setContent(data.value);
      } else {
        setContent(DEFAULT_PRIVACY_POLICY);
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
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          ) : (
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
