import { makeStyles } from "@griffel/react";
import {
    SubNavigation
} from "@moneyforward/mfui-components";

makeStyles({

    subNavigation: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "300px",
        height: "100%",
        backgroundColor: "#f0f0f0",
    },

});

interface SidebarProps {
    className?: string;
}

const Sidebar = (props: SidebarProps) => {
    return (
        <div className={props.className}>
            <SubNavigation
                orientation="vertical"
                navigationItems={[
                    { href: "/backfill", label: "補填検索" },
                    { href: "/jd/search", label: "JD検索" , locked: true},
                    { href: "/jd/create", label: "JD作成" , locked: true},
                ]}
            >
            </SubNavigation>
        </div>
    );


};

export default Sidebar;
