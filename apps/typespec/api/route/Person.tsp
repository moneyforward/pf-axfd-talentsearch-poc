
using Http;
using Rest;



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
