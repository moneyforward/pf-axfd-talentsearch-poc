import {
    Box,
    HStack,
    IconButton, Spacer, Textarea,
    VStack,
} from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";
import UserMessage from "../messages/UserMessage";

const Chat = () => {
    return (
        <VStack
            width={"100%"}
            height={"100%"}
            alignItems={"left"}
            justifyContent={"left"}
            justify={"left"}
            alignContent={"left"}
            justifyItems={"left"}
        >
            <VStack
                w="100%"
                h="100%"
                borderRadius={0}
                flexGrow={1}
                overflowY="scroll"
                justifyContent={"left"}
                justify={"left"}
                alignContent={"left"}
                justifyItems={"left"}
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
        </VStack>
    );
}
export default Chat;