import { VStack } from "@chakra-ui/react";
import MainHeader from "../../components/MainHeader";

const JdCreate = () => {
    return (
        <VStack>
            <MainHeader
                breadcrumbs={["JD Create"]}
            />
            <div>
                <h1>Create Job Description Template</h1>
                <p>Use the form below to create a new job description template.</p>
                {/* Add components or functionality for managing JD templates */}
            </div>
        </VStack>
    );
}
export default JdCreate;