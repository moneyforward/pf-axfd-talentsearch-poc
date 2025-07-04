import React from "react";
import Sidebar from "./components/Sidebar";
import MainHeader from "./components/MainHeader";
import BasePerson from "./components/BasePerson";
import Finder from "./components/Finder";
import "./Top.css";

const Top: React.FC = () => {
  return (
    <div className="top-root">
      <div className="top-layout">
        <Sidebar />
        <main className="main-area">
          <MainHeader />
          <section className="main-body">
            <BasePerson />
            <Finder />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Top;
