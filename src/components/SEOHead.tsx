import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogType?: "website" | "article" | "product" | "profile";
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  product?: {
    price?: string;
    currency?: string;
    availability?: string;
    brand?: string;
  };
  profile?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
  noindex?: boolean;
  language?: string;
  alternateLanguages?: { lang: string; url: string }[];
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = "https://cataleon.io/og-image.png",
  ogImageWidth = 1200,
  ogImageHeight = 630,
  ogType = "website",
  twitterCard = "summary_large_image",
  article,
  product,
  profile,
  noindex = false,
  language = "en",
  alternateLanguages,
}: SEOHeadProps) => {
  const fullTitle = title.includes("Cataleon") ? title : `${title} | Cataleon`;
  const baseUrl = "https://cataleon.io";
  const canonical = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;
  
  // Truncate description for social media (max ~155 chars for Google, 200 for social)
  const truncatedDescription = description.length > 200 
    ? description.substring(0, 197) + "..." 
    : description;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Helper to update or create link tag
    const setLinkTag = (rel: string, href: string, attributes?: Record<string, string>) => {
      // For hreflang, we need to check both rel and hreflang
      const hreflang = attributes?.hreflang;
      const selector = hreflang 
        ? `link[rel="${rel}"][hreflang="${hreflang}"]` 
        : `link[rel="${rel}"]`;
      
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          element!.setAttribute(key, value);
        });
      }
    };

    // ===== Basic Meta Tags =====
    setMetaTag("description", truncatedDescription);
    if (keywords) {
      setMetaTag("keywords", keywords);
    }
    setMetaTag("author", "Cataleon");
    setMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMetaTag("googlebot", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMetaTag("bingbot", noindex ? "noindex, nofollow" : "index, follow");
    
    // Language
    document.documentElement.lang = language;
    setMetaTag("language", language);
    setMetaTag("content-language", language);

    // ===== Open Graph Tags =====
    setMetaTag("og:title", fullTitle, true);
    setMetaTag("og:description", truncatedDescription, true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:site_name", "Cataleon", true);
    setMetaTag("og:locale", language === "en" ? "en_US" : language, true);
    
    // Image tags
    setMetaTag("og:image", ogImage, true);
    setMetaTag("og:image:secure_url", ogImage, true);
    setMetaTag("og:image:type", "image/png", true);
    setMetaTag("og:image:width", String(ogImageWidth), true);
    setMetaTag("og:image:height", String(ogImageHeight), true);
    setMetaTag("og:image:alt", fullTitle, true);
    
    if (canonical) {
      setMetaTag("og:url", canonical, true);
    }

    // ===== Twitter Card Tags =====
    setMetaTag("twitter:card", twitterCard);
    setMetaTag("twitter:site", "@cataleon");
    setMetaTag("twitter:creator", "@cataleon");
    setMetaTag("twitter:title", fullTitle);
    setMetaTag("twitter:description", truncatedDescription);
    setMetaTag("twitter:image", ogImage);
    setMetaTag("twitter:image:alt", fullTitle);
    
    // Twitter app cards (optional - for mobile app promotion)
    // setMetaTag("twitter:app:name:iphone", "Cataleon");
    // setMetaTag("twitter:app:id:iphone", "APP_ID");

    // ===== Facebook-specific =====
    // setMetaTag("fb:app_id", "YOUR_FB_APP_ID", true); // Uncomment if you have FB app

    // ===== Canonical URL =====
    if (canonical) {
      setLinkTag("canonical", canonical);
    }

    // ===== Alternate Languages =====
    if (alternateLanguages) {
      alternateLanguages.forEach(({ lang, url }) => {
        setLinkTag("alternate", url, { hreflang: lang });
      });
      // x-default for language selector
      if (canonical) {
        setLinkTag("alternate", canonical, { hreflang: "x-default" });
      }
    }

    // ===== Article-specific Meta Tags =====
    if (ogType === "article" && article) {
      if (article.publishedTime) {
        setMetaTag("article:published_time", article.publishedTime, true);
      }
      if (article.modifiedTime) {
        setMetaTag("article:modified_time", article.modifiedTime, true);
      }
      if (article.author) {
        setMetaTag("article:author", article.author, true);
      }
      if (article.section) {
        setMetaTag("article:section", article.section, true);
      }
      if (article.tags) {
        article.tags.forEach((tag, index) => {
          setMetaTag(`article:tag`, tag, true);
        });
      }
    }

    // ===== Product-specific Meta Tags =====
    if (ogType === "product" && product) {
      if (product.price) {
        setMetaTag("product:price:amount", product.price, true);
      }
      if (product.currency) {
        setMetaTag("product:price:currency", product.currency, true);
      }
      if (product.availability) {
        setMetaTag("product:availability", product.availability, true);
      }
      if (product.brand) {
        setMetaTag("product:brand", product.brand, true);
      }
    }

    // ===== Profile-specific Meta Tags =====
    if (ogType === "profile" && profile) {
      if (profile.firstName) {
        setMetaTag("profile:first_name", profile.firstName, true);
      }
      if (profile.lastName) {
        setMetaTag("profile:last_name", profile.lastName, true);
      }
      if (profile.username) {
        setMetaTag("profile:username", profile.username, true);
      }
    }

    // ===== Additional SEO Tags =====
    setMetaTag("theme-color", "#8B5CF6"); // Primary brand color
    setMetaTag("msapplication-TileColor", "#8B5CF6");
    setMetaTag("apple-mobile-web-app-capable", "yes");
    setMetaTag("apple-mobile-web-app-status-bar-style", "default");
    setMetaTag("apple-mobile-web-app-title", "Cataleon");
    setMetaTag("format-detection", "telephone=no");
    setMetaTag("mobile-web-app-capable", "yes");

    // Cleanup function
    return () => {
      // Optional: Reset to default title when component unmounts
    };
  }, [
    fullTitle, 
    truncatedDescription, 
    keywords, 
    canonical, 
    ogImage, 
    ogImageWidth, 
    ogImageHeight, 
    ogType, 
    twitterCard, 
    article, 
    product, 
    profile, 
    noindex, 
    language, 
    alternateLanguages
  ]);

  return null;
};
