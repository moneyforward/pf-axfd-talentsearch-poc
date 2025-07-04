import '@moneyforward/mfui-components/styles.css';
import './App.css'
import { RouterProvider } from "react-router";
import PFTRouter from "./Router";
import useStaticStyles from './staticStyles';


function App() {
  useStaticStyles();
  return (
    <RouterProvider router={PFTRouter} />
  )
}

export default App
