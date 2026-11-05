import type { KeyEvent, PasteEvent } from '@opentui/core'
import { Keypress } from '../../keypress.ts'
import type { PromptArguments, PanelName } from '../types.ts'
import type { ProviderPanel } from './provider.tsx'
import { keypressFromEvent } from '../interactions/listeners/keypress-from-event.ts'
import { keypressFromPaste } from '../interactions/listeners/keypress-from-paste.ts'
import { TextEditor } from '../text-prompt/text-editor.ts'

// What a provider field does. The input fields type into their own field and
// return moves on; tab walks the fields and escape clears the form and
// finishes. The masked key has no input, so its typing and paste come
// through here and its return saves the provider and clears the form.
export class ProviderActions {
  private actionArguments: PromptArguments<ProviderPanel>

  constructor(actionArguments: PromptArguments<ProviderPanel>) {
    this.actionArguments = actionArguments
  }

  input() {
    const { panel, store } = this.actionArguments
    return (value: string) => panel.field(store).replace(value)
  }

  submit() {
    const { panel, navigation } = this.actionArguments
    return () => navigation.goTo(panel.next)
  }

  // A key used here skips the field's own handling.
  keyDown() {
    return (event: KeyEvent) => {
      const { input, key } = keypressFromEvent(event)
      if (this.press(new Keypress(input, key))) event.preventDefault()
    }
  }

  paste() {
    return (event: PasteEvent) => {
      this.press(keypressFromPaste(event))
    }
  }

  // True when the key was used here.
  press(keypress: Keypress) {
    const { key } = keypress
    if (key.tab === true) this.tab(key.shift === true)
    else if (keypress.isEscape()) this.cancel()
    else return this.typeMasked(keypress)
    return true
  }

  private typeMasked(keypress: Keypress) {
    if (!this.actionArguments.panel.masked) return false

    if (keypress.key.return === true) this.save()
    else this.edit(keypress)
    return true
  }

  private tab(backward: boolean) {
    const { back, forward } = this.actionArguments.panel
    if (backward) this.go(back)
    else this.go(forward)
  }

  private go(target: PanelName | undefined) {
    if (target === undefined) return

    this.actionArguments.navigation.goTo(target)
  }

  private save() {
    const { panel, store, navigation } = this.actionArguments
    const { providers, providerEditForm: form } = store
    providers.save(form.provider(), form.credential())
    form.clear()
    navigation.goTo(panel.next)
  }

  private cancel() {
    const { panel, store, navigation } = this.actionArguments
    store.providerEditForm.clear()
    navigation.goTo(panel.cancel)
  }

  private edit(keypress: Keypress) {
    const { panel, store } = this.actionArguments
    new TextEditor({ field: panel.field(store), keypress }).edit()
  }
}
