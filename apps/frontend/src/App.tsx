import './App.css'
import { RouterProvider } from "react-router";
import PFTRouter from "./Router";
import { Provider } from './components/ui/provider';
import ApiClientContext, { ApiClient } from './lib/ApiClient';

function App() {
  return (
    <Provider>
      <ApiClientContext.Provider value={new ApiClient()}>
        <RouterProvider router={PFTRouter} />
      </ApiClientContext.Provider>
    </Provider>
  )
}

export default App
