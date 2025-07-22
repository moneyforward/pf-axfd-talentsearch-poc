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
}
