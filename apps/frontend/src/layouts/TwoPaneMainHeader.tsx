import { makeStyles } from "@griffel/react";
import MainHeader from "../components/MainHeader";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
    },
    sidebar: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "300px",
        height: "100%",
        backgroundColor: "#f0f0f0",
    },
    mainArea: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
    },
});

export interface TwoPaneMainHeaderProps extends React.PropsWithChildren {
    className?: string;
}

const TwoPaneMainHeader = (props: TwoPaneMainHeaderProps) => {
    console.log("TwoPaneMainHeader props:", props);
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <Sidebar
                className={styles.sidebar}
            />
            <main className={styles.mainArea}>
                <MainHeader

                />
                <Outlet />
            </main>
        </div>
    );

}

export default TwoPaneMainHeader;

