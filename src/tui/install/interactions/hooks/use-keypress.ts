import { decodePasteBytes, stripAnsiSequences } from '@opentui/core'
import { useKeyboard, usePaste, useRenderer } from '@opentui/react'
import type { ExitApp } from '../../../types.ts'
import type { DataStore } from '../../data-store.ts'
import { keypressFromEvent } from '../keypress-from-event.ts'

const useTyped = (model: DataStore, exit: ExitApp) => {
  useKeyboard((event) => {
    const { input, key } = keypressFromEvent(event)
    model.press(input, key, exit)
  })
}

const usePasted = (model: DataStore, exit: ExitApp) => {
  usePaste((event) => {
    model.paste(stripAnsiSequences(decodePasteBytes(event.bytes)), exit)
  })
}

export const useKeypress = (model: DataStore) => {
  const renderer = useRenderer()
  const exit = () => renderer.destroy()
  useTyped(model, exit)
  usePasted(model, exit)
}
