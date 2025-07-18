import { Flex } from "@chakra-ui/react";

interface MainHeaderProps {
  breadcrumbs?: string[];
}

const MainHeader = (props: MainHeaderProps) => {
  return (
    <Flex
      direction="column"
      className="main-header"
      width="100%"
      backgroundColor="primary.100"
      boxShadow="md"
    >
      {props.breadcrumbs &&
        props.breadcrumbs.map((crumb, index) => (
          <span key={index} className="breadcrumb-item">
            {crumb}
          </span>
        ))
      }
    </Flex>
  )
};

export default MainHeader;
