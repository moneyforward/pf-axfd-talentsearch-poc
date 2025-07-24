import { Flex } from "@chakra-ui/react";
import MainHeader from "../components/misc/MainHeader";
import Sidebar from "../components/misc/Sidebar";
import { Outlet } from "react-router";


export interface TwoPaneMainHeaderProps extends React.PropsWithChildren {
    className?: string;
    breadcrumbs?: string[];
}

const TwoPaneMainHeader = (props: TwoPaneMainHeaderProps) => {
    console.log("TwoPaneMainHeader props:", props);
    return (
        <Flex
            direction="row"
            minHeight="100%"
            width="100%"
        >
            <Sidebar />
            <Flex
                direction="column"
                width="100%"
                height="100%"
            >
                <Outlet />
            </Flex>
        </Flex>
    );

}

export default TwoPaneMainHeader;

