import "@typespec/http";
import "@typespec/rest";
import "../models/index.tsp";

using PFSkillSearch.Models;
using Http;

namespace PFSkillSearch.Routes {
  @route("/people/{name}")
  @get
  op searchPeople(@path name: string): {
    @statusCode statusCode: 200;
    @body body: Person[];
  };

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
  op getPerson(
    @path
    id: string,
  ): {
    @statusCode statusCode: 200;
    @body body: Person;
  };

  @route("/persona/")
  @post
  @doc("Generate a persona based on the provided data")
  op generatePersona(@body body: Person): {
    @statusCode statusCode: 200;
    @body body: Persona;
  };

  @route("/person/find")
  @post
  op findPerson(@body body: Persona): {
    @statusCode statusCode: 200;

    @doc("Find people matching the provided persona")
    @body
    body: MatchingResult[];
  };

  @route("/person/{personId}/face")
  @get
  @doc("Get the face image(jpg) of a person by their ID")
  op getPersonFace(@path personId: string): {
    @statusCode statusCode: 200;
    @header
    contentType: "image/jpeg";

    @body data: bytes;
  };
}
