import { Flex } from "@chakra-ui/react";

interface PersonaAgentProps extends React.PropsWithChildren {
    className?: string;
}

const PersonaAgent = (props: PersonaAgentProps) => {
    console.log("PersonaAgent props:", props);
    return (
        <Flex>
            <h1>PersonaAgent</h1>
        </Flex>
    );

}

export default PersonaAgent;

