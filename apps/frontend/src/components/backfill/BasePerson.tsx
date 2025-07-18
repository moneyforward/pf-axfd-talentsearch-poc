import { Flex } from "@chakra-ui/react";
import { type JSX } from "react";
import Message from "../messages/Message";
import PersonCard from "../PersonCard";

const BasePerson = (): JSX.Element => {
  return (
    <Flex
      direction="column"
      height={"100%"}
      maxWidth="30%"
      width="20%"
      shadow={"md"}
    >
      <PersonCard
        name="John Doe"
        desc="Software Engineer"
        skills={["JavaScript", "React", "Node.js"]}
        small={false}
      />


      <Message
        message="Hello, this is a message!"
      />

      <Message
        message="Hello, this is a message!"
      />

    </Flex >
  );
};

export default BasePerson;
