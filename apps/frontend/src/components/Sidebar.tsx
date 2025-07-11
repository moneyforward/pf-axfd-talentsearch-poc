import { Box, Flex } from "@chakra-ui/react";


const Sidebar = () => {
    return (
        <Flex
            direction="column"
            maxWidth={"250px"}
            height="100%"
            layerStyle={"sidebar"}
            padding="12px"
            gap="12px"
        >
            <Box
                layerStyle="sidebarItem"
            >
                補填検索
            </Box>
            <Box
                layerStyle="sidebarItem"
            >
                JDテンプレート
            </Box>
            <Box
                layerStyle="sidebarItem"
            >
                JD作成
            </Box>
        </Flex>
    );


};

export default Sidebar;
