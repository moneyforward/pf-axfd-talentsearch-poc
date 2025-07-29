import {
    IconButton, Spacer, Textarea,
    Flex,
    VStack,
    HStack
} from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";
import UserMessage from "../messages/UserMessage";

const Chat = () => {
    return (
        <Flex
            direction={"column"}
            width={"100%"}
            height={"100%"}
        >
            <VStack
                w="100%"
                h="100%"
                borderRadius={0}
                flexGrow={1}
                overflowY="scroll"
            >
                ここにmessage
                <UserMessage
                    message="こんにちは！"
                />
            </VStack>
            <Spacer

            />
            <HStack
                w="100%"
                alignItems={"flex-end"}
            >

                <Textarea
                    autoresize
                    placeholder="指示を入力してください"
                    borderRadius={"lg"}
                />
                <IconButton
                    variant={"ghost"}
                >
                    <LuSend />
                </IconButton>

            </HStack>
        </Flex>
    );
}
export default Chat;