import { Box, Flex, IconButton, Textarea } from "@chakra-ui/react";
import { type JSX } from "react";
import Message from "../messages/Message";
import PersonCard from "./PersonCard";
import { LuSend } from "react-icons/lu";

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
        skills={[]}
        desc=""

      />

      <Message
        message="Hello, this is a message!"
      />

      <Message
        message="Hello, this is a message!"
      />

      <Flex

      >
        <Textarea
          justifyContent={"flex-end"}
          alignContent={"flex-end"}
        >
        </Textarea>
        <Box>
          <IconButton
            variant={"ghost"}
          >
            <LuSend />
          </IconButton>
        </Box>
      </Flex>
    </Flex >
  );
};

export default BasePerson;
