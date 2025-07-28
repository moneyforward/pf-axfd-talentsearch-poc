

interface PersonaProps extends React.PropsWithChildren {
    className?: string;
}

const Persona = (props: PersonaProps) => {
    console.log("Persona props:", props);
    return (
        <div >
            <h1>Persona</h1>
        </div>
    );

}

export default Persona;

