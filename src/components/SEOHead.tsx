import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
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
  };
  noindex?: boolean;
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = "https://cataleon.com/og-image.png",
  ogType = "website",
  article,
  product,
  noindex = false,
}: SEOHeadProps) => {
  const fullTitle = title.includes("Cataleon") ? title : `${title} | Cataleon`;
  const baseUrl = "https://cataleon.com";
  const canonical = canonicalUrl ? `${baseUrl}${canonicalUrl}` : undefined;

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
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Basic meta tags
    setMetaTag("description", description);
    if (keywords) {
      setMetaTag("keywords", keywords);
    }
    setMetaTag("author", "Cataleon");
    setMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    // Open Graph tags
    setMetaTag("og:title", fullTitle, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:image", ogImage, true);
    setMetaTag("og:image:alt", fullTitle, true);
    setMetaTag("og:site_name", "Cataleon", true);
    setMetaTag("og:locale", "en_US", true);
    if (canonical) {
      setMetaTag("og:url", canonical, true);
    }

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:site", "@cataleon");
    setMetaTag("twitter:creator", "@cataleon");
    setMetaTag("twitter:title", fullTitle);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", ogImage);

    // Canonical URL
    if (canonical) {
      setLinkTag("canonical", canonical);
    }

    // Article specific meta tags
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
    }

    // Product specific meta tags
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
    }

    // Cleanup function to reset to defaults
    return () => {
      // Optional: Reset to default title when component unmounts
    };
  }, [fullTitle, description, keywords, canonical, ogImage, ogType, article, product, noindex]);

  return null;
};
