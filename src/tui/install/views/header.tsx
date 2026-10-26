/** @jsxImportSource @opentui/react */
import type { PropsWithChildren } from 'react'
import { theme } from '../../theme.ts'

const Bar = ({ children }: PropsWithChildren) => (
  <box
    flexDirection="row"
    height={1}
    width="100%"
    paddingX={1}
    justifyContent="space-between"
    backgroundColor={theme.chrome.background}
  >
    {children}
  </box>
)

export const Header = () => (
  <box flexDirection="column" width="100%">
    <Bar />
    <Bar>
      <text fg={theme.chrome.textColor}>Installing Crow Code</text>
      <text fg={theme.chrome.textColor}>ctrl-c quit</text>
    </Bar>
    <Bar />
  </box>
)
