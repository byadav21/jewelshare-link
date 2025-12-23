import { useEffect } from "react";

interface OrganizationSchema {
  type: "Organization";
  name: string;
  description: string;
  url: string;
  logo: string;
  email?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  sameAs?: string[];
}

interface WebsiteSchema {
  type: "WebSite";
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    queryInput: string;
    target: string;
  };
}

interface FAQSchema {
  type: "FAQPage";
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

interface ArticleSchema {
  type: "Article";
  headline: string;
  description: string;
  image: string;
  author: string;
  publisher: string;
  datePublished: string;
  dateModified?: string;
}

interface ProductSchema {
  type: "Product";
  name: string;
  description: string;
  image: string;
  brand: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability: string;
  };
}

interface SoftwareApplicationSchema {
  type: "SoftwareApplication";
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    ratingValue: string;
    ratingCount: string;
  };
}

interface BreadcrumbSchema {
  type: "BreadcrumbList";
  items: Array<{
    name: string;
    url: string;
  }>;
}

type SchemaData =
  | OrganizationSchema
  | WebsiteSchema
  | FAQSchema
  | ArticleSchema
  | ProductSchema
  | SoftwareApplicationSchema
  | BreadcrumbSchema;

interface StructuredDataProps {
  data: SchemaData | SchemaData[];
}

const generateSchema = (data: SchemaData): object => {
  switch (data.type) {
    case "Organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: data.name,
        description: data.description,
        url: data.url,
        logo: {
          "@type": "ImageObject",
          url: data.logo,
        },
        email: data.email,
        telephone: data.telephone,
        address: data.address
          ? {
              "@type": "PostalAddress",
              streetAddress: data.address.streetAddress,
              addressLocality: data.address.addressLocality,
              addressRegion: data.address.addressRegion,
              addressCountry: data.address.addressCountry,
            }
          : undefined,
        sameAs: data.sameAs,
      };

    case "WebSite":
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: data.name,
        url: data.url,
        description: data.description,
        potentialAction: data.potentialAction
          ? {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: data.potentialAction.target,
              },
              "query-input": data.potentialAction.queryInput,
            }
          : undefined,
      };

    case "FAQPage":
      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: data.questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      };

    case "Article":
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: data.headline,
        description: data.description,
        image: data.image,
        author: {
          "@type": "Person",
          name: data.author,
        },
        publisher: {
          "@type": "Organization",
          name: data.publisher,
          logo: {
            "@type": "ImageObject",
            url: "https://cataleon.com/logo.png",
          },
        },
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
      };

    case "Product":
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: data.name,
        description: data.description,
        image: data.image,
        brand: {
          "@type": "Brand",
          name: data.brand,
        },
        offers: data.offers
          ? {
              "@type": "Offer",
              price: data.offers.price,
              priceCurrency: data.offers.priceCurrency,
              availability: `https://schema.org/${data.offers.availability}`,
            }
          : undefined,
      };

    case "SoftwareApplication":
      return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: data.name,
        description: data.description,
        applicationCategory: data.applicationCategory,
        operatingSystem: data.operatingSystem,
        offers: data.offers
          ? {
              "@type": "Offer",
              price: data.offers.price,
              priceCurrency: data.offers.priceCurrency,
            }
          : undefined,
        aggregateRating: data.aggregateRating
          ? {
              "@type": "AggregateRating",
              ratingValue: data.aggregateRating.ratingValue,
              ratingCount: data.aggregateRating.ratingCount,
            }
          : undefined,
      };

    case "BreadcrumbList":
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: data.items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };

    default:
      return {};
  }
};

export const StructuredData = ({ data }: StructuredDataProps) => {
  useEffect(() => {
    const schemas = Array.isArray(data) ? data : [data];
    const scriptIds: string[] = [];

    schemas.forEach((schema, index) => {
      const scriptId = `structured-data-${schema.type}-${index}`;
      scriptIds.push(scriptId);

      // Remove existing script with same ID
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      // Create new script element
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(generateSchema(schema));
      document.head.appendChild(script);
    });

    // Cleanup on unmount
    return () => {
      scriptIds.forEach((id) => {
        const script = document.getElementById(id);
        if (script) {
          script.remove();
        }
      });
    };
  }, [data]);

  return null;
};

// Pre-configured schema for the organization
export const CataleonOrganizationSchema: OrganizationSchema = {
  type: "Organization",
  name: "Hamlet E Commerce Pvt. Ltd.",
  description:
    "Professional jewelry catalog management platform. Manage inventory, share catalogs with custom pricing, and grow your jewelry business with advanced tools including diamond calculators and manufacturing cost estimators.",
  url: "https://cataleon.com",
  logo: "https://cataleon.com/logo.png",
  email: "support@cataleon.com",
  telephone: "+91-95991-95566",
  address: {
    streetAddress: "2nd floor, Unit no 201, Green Wood Plaza, Block B, Greenwood City, Sector 45",
    addressLocality: "Gurugram",
    addressRegion: "Haryana",
    addressCountry: "India",
  },
  sameAs: [
    "https://twitter.com/cataleon",
    "https://www.linkedin.com/company/cataleon",
    "https://www.facebook.com/cataleon",
  ],
};

// Pre-configured schema for the website
export const CataleonWebsiteSchema: WebsiteSchema = {
  type: "WebSite",
  name: "Cataleon",
  url: "https://cataleon.com",
  description:
    "Professional jewelry catalog management platform with diamond calculators, manufacturing cost estimators, and shareable catalogs.",
  potentialAction: {
    target: "https://cataleon.com/global-search?q={search_term_string}",
    queryInput: "required name=search_term_string",
  },
};

// Pre-configured schema for the software application
export const CataleonSoftwareSchema: SoftwareApplicationSchema = {
  type: "SoftwareApplication",
  name: "Cataleon",
  description:
    "Professional jewelry catalog management software. Features include inventory management, shareable catalogs, diamond price calculator, manufacturing cost estimator, and customer inquiry tracking.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web Browser",
  offers: {
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    ratingValue: "4.9",
    ratingCount: "500",
  },
};
