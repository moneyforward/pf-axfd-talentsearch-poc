import "./main.tsp";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace PFTalentSearch;

/**
 * Person/Talent model
 */
model Person {
  /**
   * Unique identifier for the person
   */
  @key
  id: string;
  
  /**
   * Full name
   */
  name: string;
  
  /**
   * Email address
   */
  @format("email")
  email: string;
  
  /**
   * Phone number
   */
  phone?: string;
  
  /**
   * Job title
   */
  title?: string;
  
  /**
   * Company name
   */
  company?: string;
  
  /**
   * Years of experience
   */
  yearsOfExperience?: int32;
  
  /**
   * List of skills
   */
  skills: Skill[];
  
  /**
   * Location
   */
  location?: Location;
  
  /**
   * Resume/CV content
   */
  resume?: string;
  
  /**
   * Profile summary
   */
  summary?: string;
  
  /**
   * Creation timestamp
   */
  createdAt: utcDateTime;
  
  /**
   * Last update timestamp
   */
  updatedAt: utcDateTime;
}

/**
 * Skill model
 */
model Skill {
  /**
   * Skill name
   */
  name: string;
  
  /**
   * Skill category
   */
  category: SkillCategory;
  
  /**
   * Proficiency level (1-5)
   */
  @minValue(1)
  @maxValue(5)
  level: int32;
  
  /**
   * Years of experience with this skill
   */
  yearsOfExperience?: int32;
}

/**
 * Skill categories
 */
union SkillCategory {
  "Programming",
  "Framework",
  "Database",
  "Cloud",
  "DevOps",
  "Language",
  "Tool",
  "Soft Skill",
  "Certification",
  "Other"
}

/**
 * Location model
 */
model Location {
  /**
   * Country
   */
  country: string;
  
  /**
   * State/Prefecture
   */
  state?: string;
  
  /**
   * City
   */
  city?: string;
  
  /**
   * Postal code
   */
  postalCode?: string;
  
  /**
   * Whether remote work is preferred
   */
  remotePreferred?: boolean;
}

/**
 * Person creation request
 */
model CreatePersonRequest {
  /**
   * Full name
   */
  name: string;
  
  /**
   * Email address
   */
  @format("email")
  email: string;
  
  /**
   * Phone number
   */
  phone?: string;
  
  /**
   * Job title
   */
  title?: string;
  
  /**
   * Company name
   */
  company?: string;
  
  /**
   * Years of experience
   */
  yearsOfExperience?: int32;
  
  /**
   * List of skills
   */
  skills?: Skill[];
  
  /**
   * Location
   */
  location?: Location;
  
  /**
   * Resume/CV content
   */
  resume?: string;
  
  /**
   * Profile summary
   */
  summary?: string;
}

/**
 * Person update request
 */
model UpdatePersonRequest {
  /**
   * Full name
   */
  name?: string;
  
  /**
   * Email address
   */
  @format("email")
  email?: string;
  
  /**
   * Phone number
   */
  phone?: string;
  
  /**
   * Job title
   */
  title?: string;
  
  /**
   * Company name
   */
  company?: string;
  
  /**
   * Years of experience
   */
  yearsOfExperience?: int32;
  
  /**
   * List of skills
   */
  skills?: Skill[];
  
  /**
   * Location
   */
  location?: Location;
  
  /**
   * Resume/CV content
   */
  resume?: string;
  
  /**
   * Profile summary
   */
  summary?: string;
}

/**
 * Person search query parameters
 */
model PersonSearchQuery {
  /**
   * Search term for name, title, or company
   */
  @query
  q?: string;
  
  /**
   * Filter by skills (comma-separated)
   */
  @query
  skills?: string;
  
  /**
   * Filter by location
   */
  @query
  location?: string;
  
  /**
   * Minimum years of experience
   */
  @query
  minExperience?: int32;
  
  /**
   * Maximum years of experience
   */
  @query
  maxExperience?: int32;
  
  /**
   * Page number (1-based)
   */
  @query
  page?: int32 = 1;
  
  /**
   * Page size
   */
  @query
  pageSize?: int32 = 20;
  
  /**
   * Sort field
   */
  @query
  sortBy?: "name" | "createdAt" | "updatedAt" | "yearsOfExperience" = "createdAt";
  
  /**
   * Sort direction
   */
  @query
  sortOrder?: "asc" | "desc" = "desc";
}

/**
 * Person response model
 */
model PersonResponse extends BaseResponse {
  /**
   * Person data
   */
  data: Person;
}

/**
 * Persons API endpoints
 */
@route("/persons")
interface PersonsAPI {
  /**
   * Get all persons with optional filtering and pagination
   */
  @get
  list(...PersonSearchQuery): PaginatedResponse<Person>;
  
  /**
   * Create a new person
   */
  @post
  create(@body person: CreatePersonRequest): PersonResponse;
  
  /**
   * Get a specific person by ID
   */
  @get
  @route("/{id}")
  get(@path id: string): PersonResponse;
  
  /**
   * Update a specific person by ID
   */
  @put
  @route("/{id}")
  update(@path id: string, @body person: UpdatePersonRequest): PersonResponse;
  
  /**
   * Delete a specific person by ID
   */
  @delete
  @route("/{id}")
  delete(@path id: string): BaseResponse;
}
