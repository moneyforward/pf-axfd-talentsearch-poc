import { Box, Flex, Image } from "@chakra-ui/react";
import type { components } from "@mfskillsearch/typespec";

export interface PersonCardProps {
    person?: components["schemas"]["PFSkillSearch.Models.Person"];
}

const PersonCard = ({ persona: person }: PersonCardProps) => {


    return (
        <Flex
            layerStyle={"personCard"}
        >
            <Box>
                <Image src={`/api/person/${person?.employee_id}/face`} alt={person?.employee_name || "顔画像"} />
            </Box>
            <div>{person?.employee_name || "名前情報なし"}</div>
            <div>{person?.job_title || "職種情報なし"}</div>
            <div>{person?.dept_1 || "部署情報なし"}</div>
        </Flex>

    );

}

export default PersonCard;