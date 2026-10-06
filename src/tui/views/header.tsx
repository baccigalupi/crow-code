import type { PropsWithChildren } from 'react'
import { Box, Text } from 'ink'
import { chrome } from '../themes/chrome.ts'

const Bar = ({ children }: PropsWithChildren) => (
  <Box
    height={1}
    width='100%'
    paddingX={1}
    justifyContent='space-between'
    backgroundColor={chrome.background}
  >
    {children}
  </Box>
)

export const Header = () => (
  <Box flexDirection='column' width='100%'>
    <Bar />
    <Bar>
      <Text color={chrome.textColor}>Crow Code - context is King</Text>
      <Text color={chrome.textColor}>ctrl-c quit</Text>
    </Bar>
    <Bar />
  </Box>
)
