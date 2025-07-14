import './App.css'
import { RouterProvider } from "react-router";
import PFTRouter from "./Router";
import { Provider } from './components/ui/provider';

function App() {
  return (
    <Provider>
      <RouterProvider router={PFTRouter} />
    </Provider>
  )
}

export default App
