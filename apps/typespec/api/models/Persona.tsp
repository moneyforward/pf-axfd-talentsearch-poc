namespace PFSkillSearch.Models {
    
    model Persona {
        name: string;
        joinedDate: string;
        skills: Skill[];
    }
    model Skill {
        name: string;
        experience: int16; // in years
        description?: string;
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
}
