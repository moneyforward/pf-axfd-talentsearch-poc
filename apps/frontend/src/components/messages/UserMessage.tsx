import { Card, Flex } from "@chakra-ui/react";


interface UserMessageProps extends React.PropsWithChildren {
    className?: string;
    message: string;
}

const UserMessage = (props: UserMessageProps) => {
    console.log("Message props:", props);
    return (
        <Flex
        >
            <Card.Root
                layerStyle={"message"}
                p="0px"
                m="0px"
            >
                <Card.Body
                    p="4px"
                    m="0px"
                >
                    {props.message}
                </Card.Body>
            </Card.Root>
        </Flex>
    );

}

export default UserMessage;

