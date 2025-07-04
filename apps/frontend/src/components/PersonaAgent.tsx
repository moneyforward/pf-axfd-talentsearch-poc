import { makeStyles } from "@griffel/react";

const useStyles = makeStyles({
    
});
interface PersonaAgentProps extends React.PropsWithChildren {
    className?: string;
}

const PersonaAgent = (props: PersonaAgentProps) => {
    console.log("PersonaAgent props:", props);
    return (
        <div >
            <h1>PersonaAgent</h1>
        </div>
    );

}

export default PersonaAgent;

