import {
  Box,
  Input,
  VStack,
  Heading
} from "@chakra-ui/react";
import { useState, type JSX } from "react";
import type { components } from "@mfskillsearch/typespec"
import PersonCard from "./PersonCard";
import SearchPerson from "./SearchPerson";

const BasePerson = (): JSX.Element => {
  const [persona, setPersona] = useState<components["schemas"]["PFSkillSearch.Models.Person"]>();
  const [person, setPerson] = useState<components["schemas"]["PFSkillSearch.Models.Person"]>();
  return (
    <VStack align="start" minW="340px" maxW="340px" w="340px" >
      <Box >
        <Heading
          as="h3"
          textStyle={"sectionTitle"}
        >
          現在設定されている人物像
          <PersonCard
            persona={persona}
          />
        </Heading>

      </Box>

      {/* Input */}
      <Box
        w="100%"
      >
        <SearchPerson
          person={person}
          setPerson={setPerson}
        />
      </Box >
      {/* PersonCard */}
      < Box h="145px" w="201px" fontSize="14px" color="#000" fontFamily="'Noto Sans JP', sans-serif" display="flex" alignItems="center" >
        <Heading
          textStyle={"sectionTitle"}
        >
          重視しているポイント
        </Heading>
      </Box >
      <Box w="100%" bg="#fff" borderTop="1px solid #000" minH="60px" borderRadius={0} />
      <Box w="319px" h="76px" borderRadius="xl" border="1px solid #919191" />
    </VStack >
  );
};

export default BasePerson;
