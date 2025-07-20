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

