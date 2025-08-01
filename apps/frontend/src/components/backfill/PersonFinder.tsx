import React from "react";
import { Flex } from "@chakra-ui/react";
const PersonFinder: React.FC = () => (
  <Flex
    direction={"row"}
    flexWrap={"wrap"}
    height={"100%"}
    width={"100%"}
    overflowY={"scroll"}
  >
    <div className="finder-section-title">スキルの一致度が高い</div>

    <div className="finder-section-body">
    </div>

    <div className="finder-note">
      <p>過去の業界、業種があっても良いかも。</p>
      <p>職種も？ エンジニアならエンジニア、営業なら営業</p>
      <p>作っているプロダクトのカテゴリ的な</p>
      <p>売る製品の ターゲット、製品のカテゴリ、価格帯</p>
    </div>
  </Flex >

);

export default PersonFinder;
