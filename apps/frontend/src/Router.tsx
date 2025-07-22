import { createBrowserRouter } from "react-router";
import TwoPaneMainHeader from "./layouts/TwoPaneMainHeader";
import Backfill from "./pages/Backfill";
import JdCreate from "./pages/jd/Create";
import JdTemplates from "./pages/jd/Template";


const PFTRouter = createBrowserRouter([
    {
        path: "/",
        element: <TwoPaneMainHeader />,
        children: [
            {
                path: "/backfill",
                element: <Backfill />,

            },
            {
                path: "/jd/template",
                element: <JdTemplates />
            },
            {
                path: "/jd/create",
                element: <JdCreate />
            },
        ]
    },
]);
export default PFTRouter;