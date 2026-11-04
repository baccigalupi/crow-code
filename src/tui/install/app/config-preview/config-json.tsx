import type { ScrollBoxRenderable } from '@opentui/core'
import { theme } from '../../../theme.ts'
import { HighlightReveal } from './highlight-reveal.ts'

const paddingY = 1

// React hands over the scrollbox once, when it mounts.
const watchHighlight = (scrollbox: ScrollBoxRenderable | null) => {
  if (scrollbox === null) return

  new HighlightReveal(scrollbox).watch()
}

type ConfigJsonProps = {
  before: string
  highlighted: string
  after: string
}

// The config json in the rows it is given, scrolled to the highlighted line
// each time the json changes. The marker, rebuilt with every new json, is
// what HighlightReveal scrolls into view.
export const ConfigJson = ({ before, highlighted, after }: ConfigJsonProps) => (
  <scrollbox
    id="config-json"
    ref={watchHighlight}
    flexGrow={1}
    flexShrink={1}
    minHeight={0}
  >
    <box
      flexDirection="column"
      alignSelf="flex-start"
      flexShrink={0}
      backgroundColor={theme.configPanel.background}
      paddingX={2}
      paddingY={paddingY}
      marginTop={1}
    >
      <box
        key={`${before}${highlighted}${after}`}
        id="config-highlight"
        position="absolute"
        top={paddingY + before.split('\n').length - 1}
        height={1}
        width={1}
      />
      <text
        flexShrink={0}
        height={`${before}${highlighted}${after}`.split('\n').length}
      >
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
