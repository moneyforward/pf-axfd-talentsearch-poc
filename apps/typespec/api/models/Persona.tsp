namespace PFSkillSearch.Models {
    model Persona {
        name: string;
        skills: Skill[];
        career: Career[];
    }

    model Career {
        start_month: int32;
        end_month?: int32;
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
        

    }
}
