import { Flex } from "@chakra-ui/react";

interface MainHeaderProps {
  breadcrumbs?: string[];
}

const MainHeader = (props: MainHeaderProps) => {
  return (
    <Flex>

      <header
      >
        {props.breadcrumbs &&
          props.breadcrumbs.map((crumb, index) => (
            <span key={index} className="breadcrumb-item">
              {crumb}
            </span>
          ))
        }
      </header>
    </Flex>
  )
};

export default MainHeader;
