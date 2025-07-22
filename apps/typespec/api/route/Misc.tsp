import "./Response.tsp";

using Http;
using Rest;

namespace PFSkillSearch.Routes {
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
}
