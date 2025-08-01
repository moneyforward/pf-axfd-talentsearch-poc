import {
  Box,
  Flex,
  HStack,
  Image,
  Skeleton,
  Spinner,
  Tag,
  Text,
  VStack,

} from "@chakra-ui/react";
import type { components } from "@mfskillsearch/typespec";
import { useContext, useEffect, useState } from "react";
import ApiClientContext from "../../lib/ApiClient";
import { Tooltip } from "../ui/tooltip";

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
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (person) {
      client.person.cvExists(person.employee_id).then(setIsExistsCV);
      client.person.resumeExists(person.employee_id).then(setIsExistsResume);
      setGenerating(true);
      client.persona.generate(person).then(setPersona).finally(() => {
        setGenerating(false);
      });
      if (persona) {
        console.log("Generated persona:", persona);
      }
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
          <Tag.Root
            bgColor={"primary.300"}
          >
            <Tag.Label
            >履歴書：{isExistsResume ? "o" : "x"}</Tag.Label>
          </Tag.Root>
          <Tag.Root
            bgColor={"primary.300"}
          >
            <Tag.Label>職務経歴書：{isExistsCV ? "o" : "x"}</Tag.Label>
          </Tag.Root>
        </Flex>
        {/* <List.Root>
          <List.Item>
            グレード：{person.grade_combined || "グレード情報なし"}
          </List.Item>
        </List.Root> */}
        {generating && (
          <>スキルと経歴を取得中...
            <Spinner size="sm" />
          </>
        )}
        {persona ? (
          <>
            <VStack
              overflowY={"scroll"}
            >
              {persona.career.map((career) => (
                <Box
                  key={career.company}
                  border="1px solid"
                  borderColor="primary.300"
                  borderRadius="8px"
                  padding="4px"
                  width="100%"
                >
                  <Text key={career.company}>
                    {career.company} | {career.position} | {career.role}
                  </Text>
                  <Text>
                    {career.description || "職務内容情報なし"}
                  </Text>
                </Box>
              ))}
            </VStack>

            <HStack
              flexWrap={"wrap"}
              overflowY="scroll"
              height={"50px"}
            >
              {persona.skills.map((skill, index) => (
                <Tooltip
                  content={skill.description}
                  key={index}
                >
                  <Tag.Root
                    key={index}
                    display={"flex"}
                    direction={"row"}
                    gap={"5px"}
                    flexWrap={"wrap"}
                  >
                    <Tag.Label>{skill.name}</Tag.Label>
                  </Tag.Root>
                </Tooltip>
              ))}
            </HStack>
          </>
        ) : (
          <>

            <HStack
              flexWrap={"wrap"}
              overflowY="scroll"
              height={"37px"}
            >
              スキル:
              <Tag.Root
                display={"flex"}
                direction={"row"}
                gap={"5px"}
                flexWrap={"wrap"}
              >
                <Tag.Label

                >
                  <Skeleton
                    height={"16px"}
                    width="40px"
                  />
                </Tag.Label>
              </Tag.Root>
              <Tag.Root
                display={"flex"}
                direction={"row"}
                gap={"5px"}
                flexWrap={"wrap"}
              >
                <Tag.Label

                >
                  <Skeleton
                    height={"16px"}
                    width="40px"
                  />
                </Tag.Label>
              </Tag.Root>        <Tag.Root
                display={"flex"}
                direction={"row"}
                gap={"5px"}
                flexWrap={"wrap"}
              >
                <Tag.Label

                >
                  <Skeleton
                    height={"16px"}
                    width="40px"
                  />
                </Tag.Label>
              </Tag.Root>        <Tag.Root
                display={"flex"}
                direction={"row"}
                gap={"5px"}
                flexWrap={"wrap"}
              >
                <Tag.Label
                >
                  <Skeleton
                    height={"16px"}
                    width="40px"
                  />
                </Tag.Label>
              </Tag.Root>
            </HStack>
          </>
        )}


      </Flex>
    </Flex >
  )
};

export default PersonaCard;
