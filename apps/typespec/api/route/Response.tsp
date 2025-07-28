namespace PFSkillSearch {
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
}
