import "@typespec/http";
import "@typespec/rest";
import "../models/index.tsp";

using PFSkillSearch.Models;
using Http;
using Rest;

namespace PFSkillSearch.Routes {
  /**
   * API root endpoint
   */
  @route("/person")
  @get
  op getPersonById(id: string): {
    @statusCode statusCode: 200;
    @body body: {
      name: "PF Talent Search API";
      version: "1.0.0";
      description: "API for talent search and management";
    };
  };

  @route("/person/{id}")
  @get
  op getPerson(id: string): {
    @statusCode statusCode: 200;
    @body body: Person;
  };
}
