import type { ReactNode } from 'react'
import { theme } from '../../theme.ts'

const Bar = ({ children }: { children?: ReactNode }) => (
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

// Three chrome-coloured rows; the middle one holds the title and quit hint.
// Keeps its rows when the panels below need more room.
export const Header = () => (
  <box flexDirection="column" width="100%" flexShrink={0}>
    <Bar />
    <Bar>
      <text fg={theme.chrome.textColor}>Installing Crow Code</text>
      <text fg={theme.chrome.textColor}>ctrl-c quit</text>
    </Bar>
    <Bar />
  </box>
)
