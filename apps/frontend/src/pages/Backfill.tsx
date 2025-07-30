
import {
  Flex,
  HStack,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import MainHeader from "../components/misc/MainHeader";
import Instruction from "../components/backfill/Instruction";
import type { components } from "@mfskillsearch/typespec";
import ApiClientContext from "../lib/ApiClient";
import { useContext, useState } from "react";
import PersonCard from "../components/backfill/PersonCard";


const Backfill = () => {
  const client = useContext(ApiClientContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [matchedPeople, setMatchedPeople] = useState<components["schemas"]["PFSkillSearch.Models.Payload.FindPersonResult"][]>([]);


  const search = (
    person: components["schemas"]["PFSkillSearch.Models.Person"],
    persona: components["schemas"]["PFSkillSearch.Models.Persona"]
  ) => {
    setLoading(true);
    client.person.find(
      person,
      persona
    ).then((result) => {
      if (result === null) {
        setMatchedPeople([]);
      } else {
        setMatchedPeople(result.result);
      }
    }).finally(() => {
      setLoading(false);
    });
  }

  return (
    <VStack
      direction="column"
      height={"100%"}
    >
      {/* Main Header */}
      <MainHeader
        breadcrumbs={["補填検索"]}
      />
      {/* Main Body */}
      <HStack
        flex={1}
        gap={3}
        p={4}
        align="flex-start"
        minH={0}
        w="100%"
      >
        {/* Left: BasePerson */}
        <Instruction
          search={search}
        />
        {/* Right: Finder */}
        <Flex
          direction="row"
          flex={1} minW={0}
          width="100%"
          height="100%"
          overflowY="auto"
        >
          {loading && <Spinner />}
          {!loading && matchedPeople.length === 0 && (
            <>見つかりませんでした。</>
          )}
          {!loading && matchedPeople.length > 0 && (
            matchedPeople.map((person, index) => (
              <PersonCard
                key={person.person.employee_id || index}
                person={person.person}
              />
            ))
          )}
        </Flex>
      </HStack>
    </VStack>
  );
};

export default Backfill;
