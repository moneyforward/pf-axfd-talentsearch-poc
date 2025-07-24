import { VStack } from "@chakra-ui/react";
import MainHeader from "../../components/misc/MainHeader";

const JdTemplates = () => {
    return (
        <VStack>
            <MainHeader
                breadcrumbs={["JD Templates"]}
            />
            <div>
                <h1>Job Description Templates</h1>
                <p>Manage your job description templates here.</p>
                {/* Add components or functionality for managing JD templates */}
            </div>
        </VStack>
    );
}
export default JdTemplates;