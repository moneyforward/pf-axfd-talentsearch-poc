import React from "react";
import PersonCard from "./PersonCard";
import { Flex } from "@chakra-ui/react";

const PersonFinder: React.FC = () => (
  <Flex
    direction={"row"}
    flexWrap={"wrap"}
    height={"100%"}
    width={"100%"}
    overflowY={"scroll"}
  >

    <div className="finder">
      <div className="finder-section">
        <div className="finder-section-title">スキルの一致度が高い</div>
        <div className="finder-section-body">
          {Array.from({ length: 4 }).map((_, i) => (
            <PersonCard
              key={i}
              meta="MFBC / XXXXX / YYYYYY"
              name="鈴木 太郎"
              desc="入社年度とか いろはにほへとちりぬるをわかよたれせつねならむうい"
              skills={Array(8).fill("SkillA: 12")}
              small
            />
          ))}
        </div>
      </div>
      <div className="finder-note">
        <p>過去の業界、業種があっても良いかも。</p>
        <p>職種も？ エンジニアならエンジニア、営業なら営業</p>
        <p>作っているプロダクトのカテゴリ的な</p>
        <p>売る製品の ターゲット、製品のカテゴリ、価格帯</p>
      </div>
      <div className="finder-note">
        <p>過去の業界、業種があっても良いかも。</p>
        <p>職種も？ エンジニアならエンジニア、営業なら営業</p>
        <p>作っているプロダクトのカテゴリ的な</p>
        <p>売る製品の ターゲット、製品のカテゴリ、価格帯</p>
      </div>
      <div className="finder-note">
        <p>過去の業界、業種があっても良いかも。</p>
        <p>職種も？ エンジニアならエンジニア、営業なら営業</p>
        <p>作っているプロダクトのカテゴリ的な</p>
        <p>売る製品の ターゲット、製品のカテゴリ、価格帯</p>
      </div>
      <div className="finder-note">
        <p>過去の業界、業種があっても良いかも。</p>
        <p>職種も？ エンジニアならエンジニア、営業なら営業</p>
        <p>作っているプロダクトのカテゴリ的な</p>
        <p>売る製品の ターゲット、製品のカテゴリ、価格帯</p>
      </div>
      <div className="finder-note">
        <p>過去の業界、業種があっても良いかも。</p>
        <p>職種も？ エンジニアならエンジニア、営業なら営業</p>
        <p>作っているプロダクトのカテゴリ的な</p>
        <p>売る製品の ターゲット、製品のカテゴリ、価格帯</p>
      </div>
    </div>
  </Flex>

);

export default PersonFinder;
