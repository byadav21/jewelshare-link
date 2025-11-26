/**
 * Smart product categorization utility
 * Uses pattern matching on product names and SKUs to suggest categories
 */

interface CategoryPattern {
  category: string;
  patterns: RegExp[];
  priority: number; // Higher priority patterns checked first
}

// Define category patterns with common keywords and SKU prefixes
const CATEGORY_PATTERNS: CategoryPattern[] = [
  {
    category: "Ladies Rings",
    patterns: [
      /\bCLR\d+/i,
      /ladies?\s*rings?/i,
      /women'?s?\s*rings?/i,
      /female\s*rings?/i,
    ],
    priority: 10,
  },
  {
    category: "Gents Rings",
    patterns: [
      /\bCGR\d+/i,
      /gents?\s*rings?/i,
      /men'?s?\s*rings?/i,
      /male\s*rings?/i,
    ],
    priority: 10,
  },
  {
    category: "Rings",
    patterns: [/\brings?\b/i, /\bband\b/i, /\bwedding\s*band/i],
    priority: 5,
  },
  {
    category: "Ladies Bangles",
    patterns: [
      /\bCLB\d+/i,
      /ladies?\s*bangles?/i,
      /women'?s?\s*bangles?/i,
      /kadas?/i,
    ],
    priority: 10,
  },
  {
    category: "Gents Bangles",
    patterns: [/\bCGB\d+/i, /gents?\s*bangles?/i, /men'?s?\s*bangles?/i],
    priority: 10,
  },
  {
    category: "Bangles",
    patterns: [/\bbangles?\b/i, /\bbracelets?\b/i],
    priority: 5,
  },
  {
    category: "Bracelets",
    patterns: [
      /\bCBR\d+/i,
      /\bbracelets?\b/i,
      /\bwrist\s*band/i,
      /\bchain\s*bracelet/i,
    ],
    priority: 8,
  },
  {
    category: "Necklaces",
    patterns: [
      /\bCLN\d+/i,
      /\bnecklaces?\b/i,
      /\bhaar\b/i,
      /\bmangalsutra/i,
      /\bchoker/i,
      /\bcollar\b/i,
    ],
    priority: 9,
  },
  {
    category: "Earrings",
    patterns: [
      /\bCLE\d+/i,
      /\bearrings?\b/i,
      /\bstuds?\b/i,
      /\bhoops?\b/i,
      /\bdrops?\b/i,
      /\bjhumka/i,
      /\bjhumki/i,
    ],
    priority: 9,
  },
  {
    category: "Pendants",
    patterns: [
      /\bCLP\d+/i,
      /\bpendants?\b/i,
      /\blockets?\b/i,
      /\bcharm\b/i,
    ],
    priority: 9,
  },
  {
    category: "Chains",
    patterns: [
      /\bCLC\d+/i,
      /\bchains?\b/i,
      /\bgold\s*chain/i,
      /\bsilver\s*chain/i,
    ],
    priority: 9,
  },
  {
    category: "Toe Rings",
    patterns: [/\btoe\s*rings?/i, /\bmetti/i, /\bfoot\s*rings?/i],
    priority: 9,
  },
  {
    category: "Nose Pins",
    patterns: [/\bnose\s*pins?/i, /\bnath\b/i, /\bbullak/i],
    priority: 9,
  },
  {
    category: "Mangalsutra",
    patterns: [/\bmangalsutra/i, /\bthali/i],
    priority: 9,
  },
  {
    category: "Anklets",
    patterns: [/\banklets?/i, /\bpayal/i, /\bpajeb/i],
    priority: 9,
  },
  {
    category: "Sets",
    patterns: [
      /\bsets?\b/i,
      /\bcomplete\s*set/i,
      /\bbridal\s*set/i,
      /\bjewel(?:le)?ry\s*set/i,
    ],
    priority: 8,
  },
];

export interface CategorySuggestion {
  productId: string;
  productName: string;
  currentCategory: string | null;
  suggestedCategory: string;
  confidence: "high" | "medium" | "low";
  matchedPattern: string;
}

/**
 * Analyze a product and suggest a category based on name and SKU
 */
export function suggestCategory(
  productName: string,
  sku: string | null
): { category: string; confidence: "high" | "medium" | "low"; pattern: string } | null {
  const searchText = `${productName} ${sku || ""}`;
  
  // Sort patterns by priority (highest first)
  const sortedPatterns = [...CATEGORY_PATTERNS].sort((a, b) => b.priority - a.priority);
  
  for (const { category, patterns, priority } of sortedPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(searchText)) {
        // Determine confidence based on priority and match quality
        let confidence: "high" | "medium" | "low";
        if (priority >= 10) {
          confidence = "high";
        } else if (priority >= 7) {
          confidence = "medium";
        } else {
          confidence = "low";
        }
        
        return {
          category,
          confidence,
          pattern: pattern.source,
        };
      }
    }
  }
  
  return null;
}

/**
 * Analyze multiple products and generate category suggestions
 */
export function analyzeCatalog(
  products: Array<{
    id: string;
    name: string;
    sku: string | null;
    category: string | null;
  }>
): CategorySuggestion[] {
  const suggestions: CategorySuggestion[] = [];
  
  for (const product of products) {
    // Skip if already has a category (unless we want to suggest changes)
    // For now, only suggest for products without categories
    if (product.category) continue;
    
    const suggestion = suggestCategory(product.name, product.sku);
    
    if (suggestion) {
      suggestions.push({
        productId: product.id,
        productName: product.name,
        currentCategory: product.category,
        suggestedCategory: suggestion.category,
        confidence: suggestion.confidence,
        matchedPattern: suggestion.pattern,
      });
    }
  }
  
  return suggestions;
}

/**
 * Get statistics about suggestions
 */
export function getSuggestionStats(suggestions: CategorySuggestion[]) {
  const byCategory = suggestions.reduce((acc, s) => {
    acc[s.suggestedCategory] = (acc[s.suggestedCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const byConfidence = suggestions.reduce((acc, s) => {
    acc[s.confidence] = (acc[s.confidence] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: suggestions.length,
    byCategory,
    byConfidence,
  };
}
