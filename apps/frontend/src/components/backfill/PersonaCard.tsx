import {
  Box,
  Flex,
  HStack,
  Image,
  List,
  Tag,
  Text,
} from "@chakra-ui/react";
import type { components } from "@mfskillsearch/typespec";
import { useContext, useEffect, useState } from "react";
import ApiClientContext from "../../lib/ApiClient";

export type Skill = { name: string; value: number };
export type Person = {
  name: string;
  info: string;
  sub: string;
  skills: Skill[];
};

export type PersonaCardProps = {
  person?: components["schemas"]["PFSkillSearch.Models.Person"];
  persona?: components["schemas"]["PFSkillSearch.Models.Persona"];
  setPersona?: (persona: components["schemas"]["PFSkillSearch.Models.Persona"]) => void;
};

const PersonaCard = ({ person, persona, setPersona }: PersonaCardProps) => {
  const client = useContext(ApiClientContext);
  const [isExistsCV, setIsExistsCV] = useState<boolean>(false);
  const [isExistsResume, setIsExistsResume] = useState<boolean>(false);

  useEffect(() => {
    if (person) {
      client.person.cvExists(person.employee_id).then(setIsExistsCV);
      client.person.resumeExists(person.employee_id).then(setIsExistsResume);
      client.persona.generate(person).then(setPersona);
    }
  }, [person]);

  if (!person) {
    return (<></>);
  }
  console.log("PersonCard persona:", person);
  return (
    <Flex
      direction="column"
      layerStyle={"basePerson"}
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
        <Flex
          direction="row"
          gap="8px"
          alignItems="center"
          justifyContent="flex-start"
          width="100%"
        >
          <Box
            minWidth="80px"
          >
            <Image
              src={`${client.person.faceUrl(person.employee_id)}`}
              alt={person.employee_name || "顔画像"}
              height="96px"

            />
          </Box>
          <Box>
            <Text
              color={"primary.700"}
              fontWeight={"semibold"}
              fontSize={"sm"}
            >
              {[person.dept_1, person.dept_2, person.dept_3, person.dept_4, person.dept_5, person.dept_6]
                .filter((dept) => (dept && dept !== ""))
                .join(" / ") || "部署情報なし"
              }
              [{person.job_title || "職種情報なし"}]
            </Text>
            <Text
              fontWeight={"bold"}
            >
              {person.employee_name}({person.employee_id || "社員ID情報なし"})
            </Text>
          </Box>
        </Flex>
        <Flex
          direction="row"
          gap="8px"
          alignItems="center"
          justifyContent="flex-start"
          width="100%">
          <Tag.Root>
            <Tag.Label
            >履歴書：{isExistsResume ? "o" : "x"}</Tag.Label>
          </Tag.Root>
          <Tag.Root>
            <Tag.Label>職務経歴書：{isExistsCV ? "o" : "x"}</Tag.Label>
          </Tag.Root>
        </Flex>
        <List.Root>
          <List.Item>
            グレード：{person.grade_combined || "グレード情報なし"}
          </List.Item>
        </List.Root>

        {persona && (
          <>
            経歴などのまとめがここに入ります。
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
          </>
        )}


      </Flex>
    </Flex >
  )
};

export default PersonaCard;
