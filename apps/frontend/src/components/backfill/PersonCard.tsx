import {
  Flex,
  HStack,
  Tag,
  Text
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

const PersonCard = ({ persona }: PersonCardProps) => {
  if (!persona) {
    return (<></>);
  }
  return (
    <Flex
      direction="column"
      layerStyle={"personCard"}
    >
      <Text>
        名前(ID)
      </Text>
      <Text>
        現在の部署1/現在の部署2/現在の部署3
      </Text>

      <Text>
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
    </Flex >
  )
};

export default PersonCard;
