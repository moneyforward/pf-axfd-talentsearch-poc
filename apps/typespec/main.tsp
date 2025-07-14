import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

/**
 * PF Talent Search API
 * 
 * This API provides endpoints for talent search and management functionality.
 */
@service({
  title: "PF Talent Search API",
  version: "1.0.0",
  description: "API for talent search and management in the PF system"
})
namespace PFTalentSearch;

/**
 * Base model for all API responses
 */
model BaseResponse {
  /**
   * Whether the request was successful
   */
  success: boolean;
  
  /**
   * Response message
   */
  message?: string;
  
  /**
   * Response timestamp
   */
  timestamp: utcDateTime;
}

/**
 * Error response model
 */
model ErrorResponse extends BaseResponse {
  /**
   * Error code
   */
  errorCode?: string;
  
  /**
   * Detailed error information
   */
  errors?: string[];
}

/**
 * Pagination metadata
 */
model PaginationMeta {
  /**
   * Current page number (1-based)
   */
  page: int32;
  
  /**
   * Number of items per page
   */
  pageSize: int32;
  
  /**
   * Total number of items
   */
  totalItems: int32;
  
  /**
   * Total number of pages
   */
  totalPages: int32;
  
  /**
   * Whether there is a next page
   */
  hasNext: boolean;
  
  /**
   * Whether there is a previous page
   */
  hasPrevious: boolean;
}

/**
 * Paginated response model
 */
model PaginatedResponse<T> extends BaseResponse {
  /**
   * Response data
   */
  data: T[];
  
  /**
   * Pagination metadata
   */
  pagination: PaginationMeta;
}

/**
 * Health check response
 */
model HealthResponse extends BaseResponse {
  /**
   * Service status
   */
  status: "healthy" | "unhealthy" | "degraded";
  
  /**
   * Service version
   */
  version: string;
  
  /**
   * Environment
   */
  environment: string;
}

/**
 * Health check endpoint
 */
@route("/health")
@get
op getHealth(): HealthResponse;

/**
 * API root endpoint
 */
@route("/")
@get
op getRoot(): {
  @statusCode statusCode: 200;
  @body body: {
    name: "PF Talent Search API";
    version: "1.0.0";
    description: "API for talent search and management";
  };
};
