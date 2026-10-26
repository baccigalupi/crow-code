import { decodePasteBytes, stripAnsiSequences } from '@opentui/core'
import { useKeyboard, usePaste, useRenderer } from '@opentui/react'
import { keypress } from '../keypress.ts'
import type { ExitApp } from '../../../types.ts'
import type { UserInputStore } from '../../types.ts'
import { keypressFromEvent } from '../keypress-from-event.ts'

const useTyped = (userInputStore: UserInputStore, exit: ExitApp) => {
  useKeyboard((event) => {
    const { input, key } = keypressFromEvent(event)
    keypress({ userInputStore, exit, input, key }).handle()
  })
}

// A paste is typed input that arrives all at once, with newlines dropped.
const usePasted = (userInputStore: UserInputStore, exit: ExitApp) => {
  usePaste((event) => {
    const text = stripAnsiSequences(decodePasteBytes(event.bytes))
    const input = text.replace(/[\r\n]/g, '')
    keypress({ userInputStore, exit, input, key: {} }).handle()
  })
}

export const useKeypress = (userInputStore: UserInputStore) => {
  const renderer = useRenderer()
  const exit = () => renderer.destroy()
  useTyped(userInputStore, exit)
  usePasted(userInputStore, exit)
}
