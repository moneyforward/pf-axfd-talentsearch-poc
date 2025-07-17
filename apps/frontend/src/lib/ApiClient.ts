import { createContext } from "react";

export class ApiClient {


}

const apiClient = new ApiClient();
const ApiClientContext = createContext<ApiClient>(apiClient);
export default ApiClientContext;
