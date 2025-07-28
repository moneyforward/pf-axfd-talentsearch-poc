import { Card, Flex } from "@chakra-ui/react";


interface AssistantMessageProps extends React.PropsWithChildren {
    className?: string;
    message: string;
}

const AssistantMessage = (props: AssistantMessageProps) => {
    console.log("Message props:", props);
    return (
        <Flex
        >
            <Card.Root
                layerStyle={"message"}

                p="0px"
            >
                <Card.Body
                    m="0px"
                >
                    <p>This is a message body.</p>
                    {props.message}
                </Card.Body>
            </Card.Root>
        </Flex>
    );

}

export default AssistantMessage;

