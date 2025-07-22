import {
  HStack,
  Text
} from "@chakra-ui/react";

interface MainHeaderProps {
  breadcrumbs?: string[];
}

const MainHeader = (props: MainHeaderProps) => {
  return (
    <HStack
      layerStyle={"mainHeader"}
    >
      {props.breadcrumbs &&
        props.breadcrumbs.map((crumb, index) => (
          <Text
            key={index}
            textStyle={"breadCrumb"}
          >
            {crumb}
          </Text>
        ))
      }
    </HStack>
  )
};

export default MainHeader;
