
import {
  Box,
  Flex,
  Text,
  VStack,
  Input,
} from "@chakra-ui/react";


const Backfill = () => {
  return (
    <Flex direction="row" h="100vh" w="100vw" bg="#fffcf7">
      <Flex direction="column" flex={1} minW={0}>
        {/* Main Header */}
        <Box bg="#fffcf7" w="100%" borderBottom="3px solid #f6f6f6">
          <Box px={4} py={2.5}>
            <Text fontFamily="'Noto Sans', 'Noto Sans JP', sans-serif" fontSize="20px" color="#2d2d2d" fontWeight="400">
              補填検索
            </Text>
          </Box>
        </Box>
        {/* Main Body */}
        <Flex direction="row" flex={1} gap={3} p={4} align="flex-start" minH={0}>
          {/* Left: BasePerson */}
          <VStack align="start" minW="340px" maxW="340px" w="340px">
            {/* Input */}
            <Box w="343px">
              <Text fontSize="14px" fontWeight="bold" color="#333" fontFamily="'Noto Sans JP', sans-serif" mb={1}>
                人を探す
              </Text>
              <Input placeholder="名前を入力してください。" bg="#fff" borderColor="#ccc" borderRadius="3px" h="40px" fontSize="14px" color="#919191" fontFamily="'Noto Sans JP', sans-serif" />
            </Box>
            {/* PersonCard */}
            <Box h="145px" w="201px" fontSize="14px" color="#000" fontFamily="'Noto Sans JP', sans-serif" display="flex" alignItems="center">
              <Text>重視しているポイント：</Text>
            </Box>
            <Box w="100%" bg="#fff" borderTop="1px solid #000" minH="60px" borderRadius={0} />
            <Box w="319px" h="76px" borderRadius="xl" border="1px solid #919191" />
          </VStack>
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
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Backfill;
