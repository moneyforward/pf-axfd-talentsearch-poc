"use client"

import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { PF_THEME } from "../../Theme/theme"

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={PF_THEME}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
