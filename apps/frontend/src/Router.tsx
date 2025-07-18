import { createBrowserRouter } from "react-router";
import TwoPaneMainHeader from "./layouts/TwoPaneMainHeader";
import Backfill from "./pages/Backfill";


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
                element: <div>JD Template Page</div>, // Placeholder for JD Template page
            },
            {
                path: "/jd/create",
                element: <div>JD Create Page</div>, // Placeholder for JD Create page
            },
        ]
    },
]);
export default PFTRouter;