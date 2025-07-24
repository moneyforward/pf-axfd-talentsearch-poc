
import {
  Box,
  Flex,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import MainHeader from "../components/misc/MainHeader";
import BasePerson from "../components/backfill/BasePerson";


const Backfill = () => {
  return (
    <VStack
      direction="column"
    >
      {/* Main Header */}
      <MainHeader
        breadcrumbs={["補填検索"]}
      />
      {/* Main Body */}
      <HStack
        flex={1}
        gap={3}
        p={4}
        align="flex-start"
        minH={0}
        w="100%"
      >
        {/* Left: BasePerson */}
        <BasePerson />
        {/* Right: Finder */}
        <VStack align="start" flex={1} minW={0}>
          <Box w="100%" maxW="817px" bg="#fff" borderRadius="sm" p={4}>
            <Text fontSize="14px" fontWeight="bold" color="#000" fontFamily="'Noto Sans JP', sans-serif" mb={1}>
              スキルの一致度が高い
            </Text>
            <Flex wrap="wrap" gap={2.5}>
            </Flex>
          </Box>
          <Box w="589px" fontSize="14px" color="#000" fontFamily="'Noto Sans JP', sans-serif" lineHeight="24px">
            <Text mb={0}>過去の業界、業種があっても良いかも。</Text>
            <Text mb={0}>職種も？ エンジニアならエンジニア、営業なら営業</Text>
            <Text mb={0}>作っているプロダクトのカテゴリ的な</Text>
            <Text>売る製品の ターゲット、製品のカテゴリ、価格帯</Text>
          </Box>
        </VStack>
      </HStack>
    </VStack>
  );
};

export default Backfill;
