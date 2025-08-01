import "@typespec/http";
import "@typespec/rest";
import "../models/index.tsp";

using PFSkillSearch.Models;
using PFSkillSearch.Models.Payload;
using Http;

namespace PFSkillSearch.Routes {
  @route("/people/{name}")
  @get
  op searchPeople(@path name: string): {
    @statusCode statusCode: 200;
    @body body: SearchPeopleResponse[];
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

  

  @route("/person/find")
  @post
  op findPerson(@body body: FindPersonRequest): {
    @statusCode statusCode: 200;

    @doc("Find people matching the provided persona")
    @body
    body: FindPersonResponse[];
  };

  @route("/person/{employeeId}/face")
  @get
  @doc("Get the face image(jpg) of a person by their ID")
  op getPersonFace(@path employeeId: string): {
    @statusCode statusCode: 200;

    @header
    contentType: "image/jpeg";

    @body data: bytes;
  };

  @route("/person/{employeeId}/halfreview")
  @get
  @doc("Get the half-year review document of a person by their ID")
  op getPersonHalfReview(@path employeeId: string): {
    @statusCode statusCode: 200;
    @body body: HalfReview;
  };

  @route("/person/{employeeId}/monthlyreview")
  @get
  @doc("Get the monthly review document of a person by their ID")
  op getPersonMonthlyReview(@path employeeId: string): {
    @statusCode statusCode: 200;
    @body body: MonthlyReview;
  };

  @route("/person/{employeeId}/cv/exists")
  @get
  @doc("Check if the CV document of a person exists by their ID")
  op getPersonCVExists(@path employeeId: string): {
    @statusCode statusCode: 200;
    @body body: boolean;
  };
  @route("/person/{employeeId}/resume/exists")
  @get
  @doc("Check if the resume document of a person exists by their ID")
  op getPersonResumeExists(@path employeeId: string): {
    @statusCode statusCode: 200;
    @body body: boolean;
  };
}
