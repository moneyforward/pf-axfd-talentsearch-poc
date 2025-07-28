import {
  Separator,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, type JSX } from "react";
import type { components } from "@mfskillsearch/typespec"
import PersonCard from "./PersonCard";
import SearchPerson from "./SearchPerson";
import Chat from "./Chat";

const Instruction = (): JSX.Element => {
  const [persona,] = useState<components["schemas"]["PFSkillSearch.Models.Person"]>();
  const [person, setPerson] = useState<components["schemas"]["PFSkillSearch.Models.Person"]>();

  if (person) {
    console.log(person);
  }

  useEffect(() => {

  }, [person]);

  return (
    <VStack
      align="start" minW="340px" maxW="340px" w="340px"
      height="100%"
    >
      <PersonCard
        persona={persona}
      />

      {/* Input */}
      <SearchPerson
        setPerson={setPerson}
      />
      <Separator
        variant={"solid"}
      />
      <Chat
      />
    </VStack >
  );
};

export default Instruction;
