import {
  Flex,
  Heading,
  IconButton,
} from "@chakra-ui/react";
import { useContext, useEffect, useState, type JSX } from "react";
import type { components } from "@mfskillsearch/typespec"
import PersonaCard from "./PersonaCard";
import SearchPerson from "./SearchPerson";
import {
  LuSendHorizontal,
} from "react-icons/lu";
import ApiClientContext from "../../lib/ApiClient";
import { toaster } from "../ui/toaster";
// import Chat from "./Chat";

const Instruction = (): JSX.Element => {
  const apiClient = useContext(ApiClientContext);
  const [persona, setPersona] = useState<components["schemas"]["PFSkillSearch.Models.Persona"]>();
  const [person, setPerson] = useState<components["schemas"]["PFSkillSearch.Models.Person"]>();

  if (person) {
    console.log(person);
  }

  const findPerson = () => {
    if (person) {
      apiClient.person.find({
        instructions: "Please find the person with the given employee ID.",
        persona: persona,
        person: person
      }).then((response) => {
        if (response === "IGNORE") {
          console.log("No person found, returning IGNORE.");
          return;
        }
        if (response === "REFRESHED") {
          console.log("Person search was refreshed, returning REFRESHED.");
          return;
        }
        if (response && response.data) {
          console.log("Found person:", response.data);
          return response.data;
        } else {
          return undefined;
        }
      }).catch((error) => {
        toaster.create({
          title: "Error",
          description: `${error.message}`,
          type: "error",
        });
        console.error("Error finding person:", error);
        return undefined;
      });
    }
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
        padding={"6px"}
        bgColor={"primary.700"}
        borderRadius={"8px"}
      >
        <PersonaCard
          persona={persona}
        />
        {persona ?
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
            >
              <LuSendHorizontal />
            </IconButton>
          </Flex>
          : ""}
      </Flex>
      {/* <Chat /> */}
    </Flex>
  );
};

export default Instruction;
