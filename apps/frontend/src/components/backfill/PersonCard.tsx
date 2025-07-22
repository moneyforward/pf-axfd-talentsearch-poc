import {
  Flex,
  HStack,
  Tag,
} from "@chakra-ui/react";
import type { components } from "@mfskillsearch/typespec";

export type Skill = { name: string; value: number };
export type Person = {
  name: string;
  info: string;
  sub: string;
  skills: Skill[];
};

export type PersonCardProps = {
  persona?: components["schemas"]["PFSkillSearch.Models.Person"];
};

const PersonCard = (props: PersonCardProps) => {
  if (!props.persona) {
    return <div>Loading...</div>;
  }
  return (
    <Flex
      direction="column"
      layerStyle={"personCard"}
    >
      <div className="person-meta">{props.persona.employee_id}</div>
      <div className="person-name">{props.persona.employee_name}</div>
      <div className="person-desc">{props.persona.mail}</div>

      <HStack >
        <Tag.Root
          display={"flex"}
          direction={"row"}
          gap={"5px"}
          flexWrap={"wrap"}
        >
          <Tag.Label
          >aaa</Tag.Label>
        </Tag.Root>
      </HStack>
    </Flex >
  )
};

export default PersonCard;
