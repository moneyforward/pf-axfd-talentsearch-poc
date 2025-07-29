import {
  Flex,
  HStack,
  List,
  Tag,
  Text,
} from "@chakra-ui/react";
import type { components } from "@mfskillsearch/typespec";

export type Skill = { name: string; value: number };
export type Person = {
  name: string;
  info: string;
  sub: string;
  skills: Skill[];
};

export type PersonaCardProps = {
  persona?: components["schemas"]["PFSkillSearch.Models.Person"];
  isBase?: boolean;
};

const PersonaCard = ({ persona, isBase }: PersonaCardProps) => {
  if (!persona) {
    return (<></>);
  }
  console.log("PersonCard persona:", persona);
  return (
    <Flex
      direction="column"
      layerStyle={isBase ? "basePerson" : "personCard"}
      p="0px"
    >

      <Flex
        direction="column"
        p="4px"
        gap="4px"
        flexGrow={1}
        overflowY="scroll"
        height="100%"
      >
        <Text
          color={"primary.700"}
          fontWeight={"semibold"}
        >
          {[persona.dept_1, persona.dept_2, persona.dept_3, persona.dept_4, persona.dept_5, persona.dept_6]
            .filter((dept) => (dept && dept !== ""))
            .join(" / ") || "部署情報なし"
          }
          [{persona.job_title || "職種情報なし"}]
        </Text>
        <Text
          fontWeight={"bold"}
        >
          {persona.employee_name}
        </Text>
        <Text>
          <List.Root>
            <List.Item>
              {persona.grade_combined || "グレード情報なし"}
            </List.Item>
            <List.Item>
              {persona.employee_id || "社員ID情報なし"}
            </List.Item>
            <List.Item>
            </List.Item>

          </List.Root>

          過去の業界、業種
          売る製品のターゲット、製品のカテゴリ、価格帯など
        </Text>

        <HStack
          flexWrap={"wrap"}
          overflowY="scroll"
          height={"37px"}
        >
          <Tag.Root
            display={"flex"}
            direction={"row"}
            gap={"5px"}
            flexWrap={"wrap"}
          >
            <Tag.Label
            >aaa</Tag.Label>
          </Tag.Root>
          <Tag.Root
            display={"flex"}
            direction={"row"}
            gap={"5px"}
            flexWrap={"wrap"}
          >
            <Tag.Label
            >BBBB</Tag.Label>
          </Tag.Root>        <Tag.Root
            display={"flex"}
            direction={"row"}
            gap={"5px"}
            flexWrap={"wrap"}
          >
            <Tag.Label
            >CCCCCC</Tag.Label>
          </Tag.Root>        <Tag.Root
            display={"flex"}
            direction={"row"}
            gap={"5px"}
            flexWrap={"wrap"}
          >
            <Tag.Label
            >DD</Tag.Label>
          </Tag.Root>
        </HStack>
      </Flex>
    </Flex >
  )
};

export default PersonaCard;
