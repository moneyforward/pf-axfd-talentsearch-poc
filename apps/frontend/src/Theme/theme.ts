import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const pfThemeConfig = defineConfig({
    theme: {
        layerStyles: {
            message: {
                value: {
                    border: "1px solid",
                }
            },
            sidebar: {
                value: {
                    bgColor: "primary.600",
                    borderWidth: "1px",
                    borderRadius: "md"
                }
            },
            sidebarItem: {
                value: {
                    color: "natural.100",
                    padding: "8px",
                    borderRadius: "md",
                    _hover: {
                        bgColor: "primary.400",
                        cursor: "pointer"
                    }
                }
            }
        },
        tokens: {
            colors: {
                primary: {
                    900: { value: "#001A63" },
                    800: { value: "#00348A" },
                    700: { value: "#0054AC" },
                    600: { value: "#3171CA" },
                    500: { value: "#6190E1" },
                    400: { value: "#91AFF2" },
                    300: { value: "#C2D1FC" },
                    100: { value: "#F2F5FF" }
                },
                secondary: {
                    900: { value: "#B35800" },
                    800: { value: "#D98700" },
                    700: { value: "#FFB300" },
                    600: { value: "#FFC631" },
                    500: { value: "#FFD561" },
                    400: { value: "#FFE391" },
                    300: { value: "#FFEFC2" },
                    100: { value: "#FFFCF2" }
                },
                natural: {
                    900: { value: "#2D344B" },
                    800: { value: "#484F65" },
                    700: { value: "#63697F" },
                    600: { value: "#7F8598" },
                    500: { value: "#9BA0B1" },
                    400: { value: "#B8BCC9" },
                    300: { value: "#D6D8E0" },
                    100: { value: "#F4F4F7" }
                }
            }
        }
    }
});

export const PF_THEME = createSystem(defaultConfig, pfThemeConfig)