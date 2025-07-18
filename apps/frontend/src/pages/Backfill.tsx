import BasePerson from "../components/backfill/BasePerson";
import PersonFinder from "../components/backfill/PersonFinder";
import { Flex } from "@chakra-ui/react";

const Backfill = () => {
  return (
    <Flex
      direction="row"
      height="100%"
      width="100%"
      gap="16px"
    >
      <BasePerson />
      <PersonFinder />
    </Flex>
  );
};

export default Backfill;
