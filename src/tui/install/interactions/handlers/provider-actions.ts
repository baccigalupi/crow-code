import type { KeyEvent, PasteEvent } from '@opentui/core'
import { Keypress } from '../../../keypress.ts'
import type {
  PromptArguments,
  ProviderStepName,
  StepName,
} from '../../types.ts'
import { keypressFromEvent } from '../listeners/keypress-from-event.ts'
import { keypressFromPaste } from '../listeners/keypress-from-paste.ts'
import { TextEditor } from '../../text-prompt/text-editor.ts'
import { providerSteps } from '../../provider/steps.ts'

// What a provider field does. The input fields type into their own field and
// return moves on; tab walks the fields and escape clears the form and
// finishes at confirm. The masked key has no input, so its typing and paste
// come through here and its return saves the provider and clears the form.
export class ProviderActions {
  private actionArguments: PromptArguments<ProviderStepName>

  constructor(actionArguments: PromptArguments<ProviderStepName>) {
    this.actionArguments = actionArguments
  }

  input() {
    return (value: string) => this.field().replace(value)
  }

  submit() {
    return () => this.go(this.flow().next)
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
    if (!this.flow().masked) return false

    if (keypress.key.return === true) this.save()
    else new TextEditor({ field: this.field(), keypress }).edit()
    return true
  }

  private tab(backward: boolean) {
    const { back, forward } = this.flow()
    if (backward) this.go(back)
    else this.go(forward)
  }

  private go(target: StepName | undefined) {
    if (target === undefined) return

    this.actionArguments.navigation.goTo(target)
  }

  private save() {
    const { providers, providerEditForm: form } = this.actionArguments.store
    providers.save(form.provider(), form.credential())
    form.clear()
    this.go(this.flow().next)
  }

  private cancel() {
    this.actionArguments.store.providerEditForm.clear()
    this.go('confirm')
  }

  private flow() {
    return providerSteps[this.actionArguments.step]
  }

  private field() {
    const { store, step } = this.actionArguments
    return store.providerEditForm[step]
  }
}
