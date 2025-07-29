import { Flex } from "@chakra-ui/react";

interface CardMessageProps {
    message: string;

}

const CardMessage = ({ message }: CardMessageProps) => {
    return (
        <Flex
            layerStyle={"messageCard"}>
            <p>{message}</p>
            {/* Additional content can be added here */}

        </Flex>
    );
}

export default CardMessage;
