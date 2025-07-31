import {
  Flex,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import {
  useEffect, useState, type JSX
} from "react";
import type { components } from "@mfskillsearch/typespec"
import PersonaCard from "./PersonaCard";
import SearchPerson from "./SearchPerson";
import {
  LuSendHorizontal,
} from "react-icons/lu";
import Chat from "./Chat";
// import Chat from "./Chat";

interface InstructionProps {
  search: (
    person: components["schemas"]["PFSkillSearch.Models.Person"],
    persona: components["schemas"]["PFSkillSearch.Models.Persona"]
  ) => void;
}


const Instruction = ({ search }: InstructionProps): JSX.Element => {
  const [persona, setPersona] = useState<components["schemas"]["PFSkillSearch.Models.Persona"]>();
  const [person, setPerson] = useState<components["schemas"]["PFSkillSearch.Models.Person"]>();

  if (person) {
    console.log(person);
  }


  useEffect(() => {
    console.log("Selected person:", person);

  }, [person]);

  return (
    <Flex
      align="start" minW="340px" maxW="340px" w="340px"
      height="100%"
      direction="column"
      borderRight="1px solid"
      borderColor="primary.300"
    >

      {/* Input */}
      <SearchPerson
        setPerson={setPerson}
      />

      <Flex
        width="100%"
        direction="column"
        padding={"6px"}
        bgColor={"primary.700"}
        borderRadius={"8px"}
      >
        <PersonaCard
          person={person}
          persona={persona}
          setPersona={setPersona}
        />
        {person ?
          <Flex
            direction="row"
            bgColor={"primary.700"}
            color={"primary.100"}
            alignItems={"center"}
          >
            <Heading>
              この社員に似た人を探す
            </Heading>
            <IconButton
              justifyItems={"flex-end"}
              marginTop={"6px"}
              marginLeft={"auto"}
              variant={"subtle"}
              bgColor={"primary.300"}
              onClick={() => {
                if (person) {
                  search(person, persona || {
                    name: "",
                    skills: [],
                    career: [],
                  });
                }

              }}
            >
              <LuSendHorizontal />
            </IconButton>
          </Flex>
          : ""}
      </Flex>
      <Chat />
    </Flex>
  );
};

export default Instruction;
