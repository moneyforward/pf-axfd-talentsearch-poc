import {
  Box,
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
    <VStack
      align="start" minW="340px" maxW="340px" w="340px"
    >
      <VStack
        width="100%"
        shadow={"md"}
        borderRadius={"md"}
      >
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
            setPerson={setPerson}
          />
        </Box >
        {/* PersonCard */}
        < Box
          h="145px" w="201px"
          fontSize="14px"
          color="#000"
          fontFamily="'Noto Sans JP', sans-serif"
          display="flex"
          alignItems="center" >
          <Heading
            textStyle={"sectionTitle"}
          >
            重視しているポイント
          </Heading>
        </Box >
      </VStack >
      <VStack
        height={"100%"}
        flexGrow={2}
      >
        <Box w="100%" bg="#fff" borderTop="1px solid #000" minH="60px" borderRadius={0}
          flexGrow={1}
        />
        <Box

          w="319px" h="76px" borderRadius="xl" border="1px solid #919191" />
      </VStack >
    </VStack>
  );
};

export default BasePerson;
