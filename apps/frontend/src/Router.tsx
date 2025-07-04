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
            }]
    },
]);
export default PFTRouter;