import { Flex } from "@chakra-ui/react";
import type { components } from "@mfskillsearch/typespec";

export interface PersonCardProps {
    persona?: components["schemas"]["PFSkillSearch.Models.Person"];
}

const PersonCard = ({ persona }: PersonCardProps) => {


    return (
        <Flex
            layerStyle={"personCard"}
        >
            <div>{persona?.employee_name || "名前情報なし"}</div>
            <div>{persona?.job_title || "職種情報なし"}</div>
            <div>{persona?.dept_1 || "部署情報なし"}</div>
        </Flex>

    );

}

export default PersonCard;