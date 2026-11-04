import { useEffect, useRef } from 'react'
import type { ScrollBoxRenderable } from '@opentui/core'
import { theme } from '../../theme.ts'

const marginTop = 1
const paddingY = 1

type ConfigJsonProps = {
  before: string
  highlighted: string
  after: string
}

// The config json in the rows it is given, scrolled so the highlighted line
// is in view. It scrolls once per new json, just before drawing, when layout
// already has the new height, then leaves the user's scrolling alone.
export const ConfigJson = ({ before, highlighted, after }: ConfigJsonProps) => {
  const scrollbox = useRef<ScrollBoxRenderable>(null)
  const scrollPending = useRef(true)
  const lines = `${before}${highlighted}${after}`.split('\n').length
  const highlightedRow = marginTop + paddingY + before.split('\n').length - 1
  useEffect(() => {
    scrollPending.current = true
  }, [before, highlighted, after])
  const scrollToHighlight = () => {
    const box = scrollbox.current as ScrollBoxRenderable
    if (!scrollPending.current) return
    box.scrollTop = highlightedRow
    scrollPending.current = false
  }
  return (
    <scrollbox
      id="config-json"
      ref={scrollbox}
      flexGrow={1}
      flexShrink={1}
      minHeight={0}
      renderBefore={scrollToHighlight}
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
