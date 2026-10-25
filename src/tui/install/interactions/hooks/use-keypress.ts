import { decodePasteBytes, stripAnsiSequences } from '@opentui/core'
import { useKeyboard, usePaste, useRenderer } from '@opentui/react'
import { keypress } from '../keypress.ts'
import type { ExitApp } from '../../../types.ts'
import type { InstallStore } from '../../types.ts'
import { keypressFromEvent } from '../keypress-from-event.ts'

const useTyped = (installData: InstallStore, exit: ExitApp) => {
  useKeyboard((event) => {
    const { input, key } = keypressFromEvent(event)
    keypress({ installData, exit, input, key }).handle()
  })
}

// A paste is typed input that arrives all at once, with newlines dropped.
const usePasted = (installData: InstallStore, exit: ExitApp) => {
  usePaste((event) => {
    const text = stripAnsiSequences(decodePasteBytes(event.bytes))
    const input = text.replace(/[\r\n]/g, '')
    keypress({ installData, exit, input, key: {} }).handle()
  })
}

export const useKeypress = (installData: InstallStore) => {
  const renderer = useRenderer()
  const exit = () => renderer.destroy()
  useTyped(installData, exit)
  usePasted(installData, exit)
}
