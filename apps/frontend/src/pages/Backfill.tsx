import BasePerson from "../components/BasePerson";
import Finder from "../components/Finder";
import { Flex } from "@chakra-ui/react";

const Backfill = () => {
  return (
    <Flex
      direction="row"
      height="100%"
      width="100%"
    >
      <BasePerson />
      <Finder />
    </Flex>
  );
};

export default Backfill;
