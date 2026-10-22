/** @jsxImportSource @opentui/react */
import type { PropsWithChildren } from 'react'
import { chrome } from '../../../tui/themes/chrome.ts'

const Bar = ({ children }: PropsWithChildren) => (
  <box
    flexDirection="row"
    height={1}
    width="100%"
    paddingX={1}
    justifyContent="space-between"
    backgroundColor={chrome.background}
  >
    {children}
  </box>
)

export const Header = () => (
  <box flexDirection="column" width="100%">
    <Bar />
    <Bar>
      <text fg={chrome.textColor}>Installing Crow Code</text>
      <text fg={chrome.textColor}>ctrl-c quit</text>
    </Bar>
    <Bar />
  </box>
)
