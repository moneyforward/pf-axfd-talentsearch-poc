import React from "react";
import {
    SidePaneas MFSidebar
    , SidebarItem
} from "@moneyforward/mfui-components";
import "../Top.css";

const Sidebar: React.FC = () => (
    <MfSidebar selectedKey="補填検索">
        <SidebarItem itemKey="補填検索">補填検索</SidebarItem>
        <SidebarItem itemKey="JD検索">JD検索</SidebarItem>
        <SidebarItem itemKey="JD作成">JD作成</SidebarItem>
    </MfSidebar>
);

export default Sidebar;
