namespace PFSkillSearch.Models {
    model Persona {
        name: string;
        skills: Skill[];
        career: Career[];
    }

    model Person {
        load_date: string;
        employee_id: string;
        employee_name: string;
        mail: string;
        nickname?: string;
        employment_type: string;
        current_employee_flag: string;
        entered_at: string;
        last_day_at?: string;
        retired_at?: string;
        fulltime_employee_hired_at?: string;
        fulltime_employee_retired_at?: string;
        employment_category?: string;
        recruitment_category_new_graduate: string;
        gender: string;
        birthday: string;
        age: string;
        years_of_service: string;
        dept_1: string;
        dept_2: string;
        dept_3?: string;
        dept_4?: string;
        dept_5?: string;
        dept_6?: string;
        location: string;
        job_title: string;
        job_family: string;
        latest_job_grade?: string;
        latest_org_grade?: string;
        grade_combined?: string;
        salary_table: string;
        jp_non_jp_classification: string;
    }

    model Career {
        start_month: int16;
        end_month?: int16;
        company: string;
        position: string;
        role: "Business" | "Engineer" | "Manager" | "Other";
        description?: string;
    }

    model Skill {
        @doc("Skill name")
        name: string;

        @doc("Skill experience in years")
        experience: int16; // in years

        @doc("Optional description of the skill")
        description?: string;
    }

    namespace Payload {
        model FindPersonRequest {
            persona: Persona; // The persona to search for
            instructions: string; // Instructions for the search
            person?: Person; // The person object to search for
        }

        model FindPersonResponse {
            @doc("The status of the search operation")
            result: {
                @doc("The person object that was matched")
                person: Person;

                @doc("Optional description of the match")
                description?: string; // Optional description of the match

                @doc("Similarity score between 0.0 and 1.0")
                score: float32;
            }[];
        }

        model SearchPeopleResponse {
            @doc("Similarity score between 0.0 and 1.0")
            score: float32;

            @doc("The person object that was matched")
            person: Person; // The person object that matches the persona

            @doc("Optional description of the match")
            description?: string; // Optional description of the match
        }
    }
}
