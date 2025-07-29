import {
  Flex,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState, type JSX } from "react";
import type { components } from "@mfskillsearch/typespec"
import PersonaCard from "./PersonaCard";
import SearchPerson from "./SearchPerson";
import {
  LuUserSearch
} from "react-icons/lu";
// import Chat from "./Chat";

const Instruction = (): JSX.Element => {
  const [persona, setPersona] = useState<components["schemas"]["PFSkillSearch.Models.Person"]>();
  const [person, setPerson] = useState<components["schemas"]["PFSkillSearch.Models.Person"]>();

  if (person) {
    console.log(person);
  }

  useEffect(() => {
    console.log("Selected person:", person);
    setPersona(person);
  }, [person]);

  return (
    <Flex
      align="start" minW="340px" maxW="340px" w="340px"
      height="100%"
      direction="column"
    >

      {/* Input */}
      <SearchPerson
        setPerson={setPerson}

      />
      <Flex
        width="100%"
        direction="column"
        padding={"8px"}
        bgColor={"primary.700"}
      >
        <Flex
          direction="row"
          margin="0px"
          bgColor={"primary.700"}
          color={"primary.100"}
          alignItems={"center"}
        >
          <Heading>
            この社員に似た人を探す
          </Heading>
          <IconButton
            justifyItems={"flex-end"}
            marginLeft={"auto"}
            variant={"subtle"}
            bgColor={"primary.300"}
            marginBottom={"4px"}
          >
            <LuUserSearch />
          </IconButton>
        </Flex>
        <PersonaCard
          persona={persona}
          isBase={true}
        />
      </Flex>
      {/* <Chat /> */}
    </Flex>
  );
};

export default Instruction;
