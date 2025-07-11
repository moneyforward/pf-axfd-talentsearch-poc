import MainHeader from "../components/MainHeader";
import BasePerson from "../components/BasePerson";
import Finder from "../components/Finder";
import { Flex } from "@chakra-ui/react";

const Backfill = () => {
  return (
    <Flex
      direction="row"
      height="100%"
    >
      <MainHeader />
      <BasePerson />
      <Finder />
    </Flex>
  );
};

export default Backfill;
