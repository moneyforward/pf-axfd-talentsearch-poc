import { Box, Flex, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { LuPanelLeftClose, LuPanelLeftOpen } from "react-icons/lu";
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
            <Flex direction="row" justifyContent="right" alignItems="right" mb="0px">
                <IconButton
                    variant={"ghost"}
                    color={"primary.100"}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <LuPanelLeftClose /> : <LuPanelLeftOpen />}
                </IconButton>
            </Flex>
            <Box
                display={isOpen ? "block" : "none"}
                flexGrow={1}
                overflowY="auto"
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
