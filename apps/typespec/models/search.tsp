import "./main.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace PFTalentSearch;

/**
 * Search request model
 */
model SearchRequest {
  /**
   * Search query text
   */
  query: string;
  
  /**
   * Search filters
   */
  filters?: SearchFilters;
  
  /**
   * Page number (1-based)
   */
  page?: int32 = 1;
  
  /**
   * Page size
   */
  pageSize?: int32 = 20;
  
  /**
   * Search options
   */
  options?: SearchOptions;
}

/**
 * Search filters
 */
model SearchFilters {
  /**
   * Filter by skills
   */
  skills?: string[];
  
  /**
   * Filter by location
   */
  location?: string;
  
  /**
   * Minimum years of experience
   */
  minExperience?: int32;
  
  /**
   * Maximum years of experience
   */
  maxExperience?: int32;
  
  /**
   * Filter by job titles
   */
  titles?: string[];
  
  /**
   * Filter by companies
   */
  companies?: string[];
}

/**
 * Search options
 */
model SearchOptions {
  /**
   * Enable fuzzy search
   */
  fuzzy?: boolean = true;
  
  /**
   * Include synonyms in search
   */
  includeSynonyms?: boolean = true;
  
  /**
   * Boost factor for exact matches
   */
  exactMatchBoost?: float32 = 2.0;
  
  /**
   * Minimum score threshold
   */
  minScore?: float32 = 0.1;
}

/**
 * Search result item
 */
model SearchResult {
  /**
   * Matched person
   */
  person: Person;
  
  /**
   * Search score (0-1)
   */
  score: float32;
  
  /**
   * Highlighted fields
   */
  highlights?: Record<string[]>;
  
  /**
   * Matched terms
   */
  matchedTerms?: string[];
}

/**
 * Search response
 */
model SearchResponse extends BaseResponse {
  /**
   * Search results
   */
  results: SearchResult[];
  
  /**
   * Total number of matches
   */
  totalMatches: int32;
  
  /**
   * Search execution time in milliseconds
   */
  executionTime: int32;
  
  /**
   * Pagination metadata
   */
  pagination: PaginationMeta;
  
  /**
   * Search statistics
   */
  stats?: SearchStats;
}

/**
 * Search statistics
 */
model SearchStats {
  /**
   * Number of documents searched
   */
  documentsSearched: int32;
  
  /**
   * Average score
   */
  averageScore: float32;
  
  /**
   * Maximum score
   */
  maxScore: float32;
  
  /**
   * Applied filters count
   */
  appliedFiltersCount: int32;
}

/**
 * Search suggestions request
 */
model SuggestionsRequest {
  /**
   * Partial query text
   */
  text: string;
  
  /**
   * Maximum number of suggestions
   */
  maxSuggestions?: int32 = 10;
  
  /**
   * Suggestion types to include
   */
  types?: SuggestionType[] = ["skill", "title", "company", "location"];
}

/**
 * Suggestion types
 */
union SuggestionType {
  "skill",
  "title", 
  "company",
  "location"
}

/**
 * Search suggestion
 */
model SearchSuggestion {
  /**
   * Suggested text
   */
  text: string;
  
  /**
   * Suggestion type
   */
  type: SuggestionType;
  
  /**
   * Frequency/popularity score
   */
  score: float32;
  
  /**
   * Number of matches for this suggestion
   */
  matchCount: int32;
}

/**
 * Suggestions response
 */
model SuggestionsResponse extends BaseResponse {
  /**
   * List of suggestions
   */
  suggestions: SearchSuggestion[];
}

/**
 * Search API endpoints
 */
@route("/search")
interface SearchAPI {
  /**
   * Perform a talent search
   */
  @post
  search(@body request: SearchRequest): SearchResponse;
  
  /**
   * Get search suggestions for autocomplete
   */
  @post
  @route("/suggestions")
  getSuggestions(@body request: SuggestionsRequest): SuggestionsResponse;
  
  /**
   * Quick search with query parameter
   */
  @get
  quickSearch(
    @query q: string,
    @query page?: int32 = 1,
    @query pageSize?: int32 = 20
  ): SearchResponse;
}
