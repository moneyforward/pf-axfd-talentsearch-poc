import { Flex } from "@chakra-ui/react";
import MainHeader from "../components/MainHeader";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router";


export interface TwoPaneMainHeaderProps extends React.PropsWithChildren {
    className?: string;
}

const TwoPaneMainHeader = (props: TwoPaneMainHeaderProps) => {
    console.log("TwoPaneMainHeader props:", props);
    return (
        <Flex
            direction="column"
        >
            <Sidebar />
            <main>
                <MainHeader
                />
                <Outlet />
            </main>
        </Flex>
    );

}

export default TwoPaneMainHeader;

