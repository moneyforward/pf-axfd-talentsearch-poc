import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { useCookie } from "react-use";

const Vertex = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const authToken = useCookie("__Host-GCP_IAP_AUTH_TOKEN_");
    useEffect(() => {
        if (!containerRef.current) return;

        const existing = containerRef.current.querySelector("gen-search-widget");
        if (existing) return; // 2重描画防止

        const widget = document.createElement("gen-search-widget");
        widget.setAttribute("configId", "cdd31fdc-858c-4b0a-9fd0-863755b71035"); // 実際のIDに置き換え
        widget.setAttribute("location", "us");
        widget.setAttribute("triggerId", "searchWidgetTrigger");

        containerRef.current.appendChild(widget);
    }, []);

    return (
        <Box
            width={"100%"}
            height={"100%"}
        >
            <script src="https://cloud.google.com/ai/gen-app-builder/client?hl=ja"></script>

            {/* Widget本体 */}
            <div ref={containerRef} />


            {/* トリガー用のinput要素 */}
            <input
                placeholder="ここで検索"
                id="searchWidgetTrigger"
                style={{ marginBottom: "1rem", padding: "0.5rem" }}
            />
            <script>
                const searchWidget = document.querySelector('gen-search-widget');
                searchWidget.authToken = "{authToken[0] || ""}"; // Cookieからトークンを取得
            </script>
        </Box>
    );
}

export default Vertex;