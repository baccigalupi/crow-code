import { useEffect, useMemo, useRef } from 'react'
import type { ScrollBoxRenderable } from '@opentui/core'
import { theme } from '../../../theme.ts'
import { HighlightScroll } from './highlight-scroll.ts'

const marginTop = 1
const paddingY = 1

type ConfigJsonProps = {
  before: string
  highlighted: string
  after: string
}

// The config json in the rows it is given, scrolled so the highlighted line
// is in view.
export const ConfigJson = ({ before, highlighted, after }: ConfigJsonProps) => {
  const scrollbox = useRef<ScrollBoxRenderable>(null)
  const highlightScroll = useMemo(() => new HighlightScroll(scrollbox), [])
  const lines = `${before}${highlighted}${after}`.split('\n').length
  const highlightedRow = marginTop + paddingY + before.split('\n').length - 1
  useEffect(
    () => highlightScroll.aim(highlightedRow),
    [highlightScroll, highlightedRow, before, highlighted, after],
  )
  return (
    <scrollbox
      id="config-json"
      ref={scrollbox}
      flexGrow={1}
      flexShrink={1}
      minHeight={0}
      renderBefore={highlightScroll.scroll.bind(highlightScroll)}
    >
      <box
        flexDirection="column"
        alignSelf="flex-start"
        flexShrink={0}
        backgroundColor={theme.configPanel.background}
        paddingX={2}
        paddingY={paddingY}
        marginTop={marginTop}
      >
        <text flexShrink={0} height={lines}>
          {before}
          <span
            fg={theme.configPanel.highlightTextColor}
            bg={theme.configPanel.highlightBackground}
          >
            {highlighted}
          </span>
          {after}
        </text>
      </box>
    </scrollbox>
  )
}
