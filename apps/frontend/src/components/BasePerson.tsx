import React from "react";
import { Input, Card, Box, Typography } from "@moneyforward/mfui-components";
import "../Top.css";

const BasePerson: React.FC = () => (
  <Box className="base-person">
    <Box className="input-block">
      <Typography as="label" variant="body2" className="input-label">
        人を探す
      </Typography>
      <Input placeholder="名前を入力してください。" fullWidth />
    </Box>
    <Card className="person-card">
      <div className="person-visual-name">
        <div className="person-photo" />
        <div className="person-name-block">
          <div className="person-meta">MFBC / XXXXX / YYYYYY</div>
          <div className="person-name">鈴木 太郎</div>
          <div className="person-desc">
            入社年度とか いろはにほへとちりぬるをわかよたれせつねならむうい
          </div>
        </div>
      </div>
      <div className="person-skills">
        {Array(8)
          .fill("SkillA: 12")
          .map((skill, i) => (
            <span className="person-skill" key={i}>
              {skill}
            </span>
          ))}
      </div>
    </Card>
    <Typography className="person-point">重視しているポイント：</Typography>
    <Box className="person-nl" />
    <Box className="person-box" />
  </Box>
);

export default BasePerson;
