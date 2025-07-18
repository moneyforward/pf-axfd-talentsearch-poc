import { Card, Flex } from "@chakra-ui/react";


interface MessageProps extends React.PropsWithChildren {
    className?: string;
    message: string;
}

const Message = (props: MessageProps) => {
    console.log("Message props:", props);
    return (
        <Flex>
            <Card.Root
                layerStyle={"message"}
            >
                <Card.Body>
                    <p>This is a message body.</p>
                    {props.message}
                </Card.Body>
                <Card.Footer>
                    <button>Reply</button>
                </Card.Footer>
            </Card.Root>
        </Flex>
    );

}

export default Message;

