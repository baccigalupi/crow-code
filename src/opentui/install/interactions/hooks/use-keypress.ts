import { useKeyboard, useRenderer } from '@opentui/react'
import { keypress } from '../../../../tui/install/interactions/keypress.ts'
import type { InstallStore } from '../../../../tui/install/types.ts'
import { keypressFromEvent } from '../keypress-from-event.ts'

export const useKeypress = (installData: InstallStore) => {
  const renderer = useRenderer()
  useKeyboard((event) => {
    const { input, key } = keypressFromEvent(event)
    const exit = () => renderer.destroy()
    keypress({ installData, exit, input, key }).handle()
  })
}
