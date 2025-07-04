import React from "react";

export type PersonCardProps = {
  meta: string;
  name: string;
  desc: string;
  skills?: string[];
  small?: boolean;
};

const PersonCard: React.FC<PersonCardProps> = ({ meta, name, desc, skills = [], small }) => (
  <div className={`person-card${small ? " small" : ""}`}>
    <div className="person-visual-name">
      <div className="person-photo" />
      <div className="person-name-block">
        <div className="person-meta">{meta}</div>
        <div className="person-name">{name}</div>
        <div className="person-desc">{desc}</div>
      </div>
    </div>
    <div className="person-skills">
      {skills.map((skill, i) => (
        <span className="person-skill" key={i}>{skill}</span>
      ))}
    </div>
  </div>
);

export default PersonCard;
