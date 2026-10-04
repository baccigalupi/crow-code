import { createOsc52Clipboard } from '@ubernaut/exotui'
import type { App } from '../../types.ts'

const encoder = new TextEncoder()

export const writeClipboard = (app: App, text: string) => {
  if (text === '') return Promise.resolve()
  return createOsc52Clipboard((bytes) => {
    void app.tui.stdout.write(encoder.encode(bytes))
  }).write(text)
}
