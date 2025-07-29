import {
    Box,
    Flex,
    IconButton
} from "@chakra-ui/react";
import { useState } from "react";
import {
    LuPanelLeftClose,
    LuPanelLeftOpen
} from "react-icons/lu";
import { Link } from "react-router";


const Sidebar = () => {

    const [isOpen, setIsOpen] = useState(true);


    return (
        <Flex
            direction="column"
            maxWidth={"250px"}
            minWidth={isOpen ? "200px" : ""}
            height={"100%"}
            layerStyle={"sidebar"}
            gap="1px"
            flexGrow={1}
            color={"primary.100"}
            fontWeight={"semibold"}
        >
            <Flex
                direction="row"
                justifyContent="right"
                alignItems="right"
                verticalAlign={"middle"}
            >
                <IconButton
                    variant={"ghost"}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle Sidebar"
                >
                    {isOpen ? <LuPanelLeftClose
                    /> : <LuPanelLeftOpen />}
                </IconButton>
            </Flex>
            <Box
                display={isOpen ? "block" : "none"}
                flexGrow={1}
                overflowY="auto"
                data-state="open"
                _open={{
                    animationName: "slide-from-right-full, fade-in",
                    animationDuration: "300ms",
                }}
                _closed={{
                    animationName: "slide-from-left-full, fade-out",
                    animationDuration: "120ms",
                }}
            >
                <Link to="/backfill">
                    <Box
                        layerStyle="sidebarItem"
                    >
                        補填検索
                    </Box>
                </Link>
                <Link to="/jd/template"
                >
                    <Box
                        layerStyle="sidebarItem"
                    >
                        JDテンプレート
                    </Box>
                </Link>
                <Link to="/jd/create">
                    <Box
                        layerStyle="sidebarItem"
                    >
                        JD作成
                    </Box>
                </Link>
            </Box>
        </Flex >
    );


};

export default Sidebar;
