import type { paths, components } from "@mfskillsearch/typespec";
import createClient from "openapi-fetch";
import { createContext } from "react";

export class ApiClient {

    private client;

    constructor() {
        console.log("Environment mode :", import.meta.env.MODE);
        console.log("ApiClient constructor called. baseUrl:", import.meta.env.VITE_APP_API_URL);
        this.client = createClient<paths>({
            baseUrl: `${import.meta.env.VITE_APP_API_URL}`,
            headers: {

                "Content-Type": "application/json",
                // ここで必要な認証トークンなどを設定できます。
                "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
            }
        });

    }

    public networkErrorHandler = (error: Error) => {
        throw error;
    }

    person = {
        search: async (name: string):
            Promise<components["schemas"]["PFSkillSearch.Models.Person"][] | WAIT_STATUS> => {
            if (await this.delay("person/search", 400)) {
                return await this.client.GET("/people/{name}", {
                    params: {
                        path: {
                            name: name,
                        },
                    }
                }).then((response) => {
                    if (!response.error) {
                        return response.data as components["schemas"]["PFSkillSearch.Models.Person"][];
                    } else {
                        throw new Error(`Error fetching person: ${response}`);
                    }
                }).catch(this.networkErrorHandler);
            } else {
                return REFRESHED;
            }
        }
    }



    private timer: { [key: string]: number } = {};
    /**
     * 指定されたミリ秒数だけ実行を一時停止します。
     *
     * @param ms - 一時停止するミリ秒数。
     * @returns 指定された期間後に解決されるPromise。
     */
    private sleep = async (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 指定された時間だけ実行を遅延させ、タイマーが更新されていないかを確認します。
     * 
     * @param namespace - タイマーの一意の識別子。
     * @param delay - 遅延させる時間（ミリ秒）。デフォルトは300ミリ秒。
     * @returns 遅延期間中にタイマーが更新されていないことを示すブール値を解決するPromise。
     * 
     * この関数は指定された遅延期間のタイムアウトを設定します。指定されたnamespaceのタイマーが既に存在する場合、
     * 既存のタイマーをクリアしてから新しいタイマーを設定します。その後、遅延期間が完了するのを待ちます。
     * 遅延後、タイマーIDが同じままであるかを確認し、タイマーが更新されていないことを示します。
     * タイマーIDが同じであればtrueを返し、そうでなければfalseを返します。
     */
    private delay = async (
        namespace: string,
        delay: number = 300,
    ): Promise<boolean> => {
        let timerId = 0;
        if (this.timer[namespace]) {
            // すでにタイマーがセットされている場合は、一回けして、再度セットする。
            clearTimeout(this.timer[namespace]);
        }
        this.timer[namespace] = timerId = window.setTimeout(() => { }, delay);
        console.log("BEFORE DELAY timerId", timerId, "this.timer[namespace]", this.timer[namespace]);
        // delayミリ秒待機
        await this.sleep(delay);
        console.log("AFTER DELAY timerId", timerId, "this.timer[namespace]", this.timer[namespace]);
        // timerIdが同じであれば、更新されていない。
        if (this.timer[namespace] === timerId) {
            return true;
        }
        return false;
    }


}

const apiClient = new ApiClient();
const ApiClientContext = createContext<ApiClient>(apiClient);
export default ApiClientContext;

type WAIT_STATUS = string;
export const WAITING: WAIT_STATUS = "WAITING";
export const REFRESHED: WAIT_STATUS = "REFRESHED";
export const FINISHED: WAIT_STATUS = "FINISHED";