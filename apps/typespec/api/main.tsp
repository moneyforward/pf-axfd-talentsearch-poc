import "@typespec/http";

import "./models/index.tsp";
import "./route/index.tsp";

using Http;

/**
 * PF Skill Search API
 *
 * This API provides endpoints for skill search and management functionality.
 */
@service(#{ title: "PF SkillSearch API" })
@server("http://localhost:8080", "SkillSearch API Development Server")
namespace PFSkillSearch.Routes {

}
namespace PFSkillSearch.Models {

}
