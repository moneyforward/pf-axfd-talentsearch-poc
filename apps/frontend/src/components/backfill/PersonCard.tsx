import { Flex, HStack, Tag } from "@chakra-ui/react";

export type PersonCardProps = {
  meta?: string;
  name: string;
  desc: string;
  skills: string[];
  small?: boolean;
};

const PersonCard = (props: PersonCardProps) => (
  <Flex
    direction="column"
    width={props.small ? "100px" : "200px"}
    height={props.small ? "150px" : "250px"}
    layerStyle={"personCard"}
  >
    <div className="person-meta">{props.meta}</div>
    <div className="person-name">{props.name}</div>
    <div className="person-desc">{props.desc}</div>

    <HStack >
      {props.skills.map((skill, i) => (
        <Tag.Root
          display={"flex"}
          direction={"row"}
          gap={"5px"}
          flexWrap={"wrap"}
          key={`${skill}-${i}`}
        >
          <Tag.Label
          >{skill}</Tag.Label>
        </Tag.Root>
      ))}
    </HStack>
  </Flex >

);

export default PersonCard;
