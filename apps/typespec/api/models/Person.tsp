import "./Persona.tsp";

namespace PFSkillSearch.Models {
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

    model HalfReview {
        fy_cycle: string;
        upload_year_month: string;
        cycle_start_date: string;
        employee_id: string;
        org1: string;
        org2: string;
        job_family: string;
        half_year_self_review_achievement_growth: string; // Self review of achievements and growth
        self_assessment_score: string; // Self assessment score
        short_term_1yr: string;
        med_term_2_3yr: string;
        row_num: string;
        employment_type: string;
    }

    model MonthlyReview {
        fy_cycle: string;
        cycle_start_date: string; // Format: YYYY-MM-DD
        year_month: string; // Format: YYYY-MM
        employee_id: string;
        org1: string;
        org2: string;
        org3?: string;
        job_family: string;
        employment_type: string;
        monthly_goal: string; // Monthly goal description
        monthly_review: string; // Monthly review description
    }
    namespace Payload {
        model FindPersonRequest {
            persona: Persona; // The persona to search for
            instructions: string; // Instructions for the search
            person?: Person; // The person object to search for
        }

        model FindPersonResult {
            @doc("The person object that was matched")
            person: Person;

            @doc("Optional description of the match")
            description?: string; // Optional description of the match

            @doc("Similarity score between 0.0 and 1.0")
            score: float32;
        }

        model FindPersonResponse {
            @doc("The status of the search operation")
            result: FindPersonResult[];

            @doc("The number of results found")
            count: int32; // The number of results found
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
