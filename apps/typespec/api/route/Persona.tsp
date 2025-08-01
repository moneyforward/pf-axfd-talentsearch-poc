import "../models/index.tsp";

using Http;
using PFSkillSearch.Models;

namespace PFSkillSearch.Routes {
    @route("/persona")
    @post
    @doc("Generate a persona based on the provided data")
    op generatePersona(@body body: Person): {
        @statusCode statusCode: 200;
        @body body: Persona;
    };
}
