import type { KeyEvent } from '@opentui/core'
import { Keypress } from '../../keypress.ts'
import type {
  PromptArguments,
  ProviderStepName,
  StepName,
} from '../../types.ts'
import { keypressFromEvent } from '../listeners/keypress-from-event.ts'
import { providerSteps } from '../../provider/steps.ts'

// What a provider field does. Each input types into its own field; return
// moves on, and on the key it saves the provider and clears the form. Tab
// walks the fields and escape clears the form and finishes at confirm.
export class ProviderActions {
  private actionArguments: PromptArguments<ProviderStepName>

  constructor(actionArguments: PromptArguments<ProviderStepName>) {
    this.actionArguments = actionArguments
  }

  input() {
    return (value: string) => this.field().replace(value)
  }

  submit() {
    return () => this.finishField()
  }

  // A key used here skips the field's own handling.
  keyDown() {
    return (event: KeyEvent) => {
      const { input, key } = keypressFromEvent(event)
      if (this.press(new Keypress(input, key))) event.preventDefault()
    }
  }

  // True when the key was used here.
  press(keypress: Keypress) {
    const { key } = keypress
    if (key.tab === true) this.tab(key.shift === true)
    else if (keypress.isEscape()) this.cancel()
    else return false
    return true
  }

  private finishField() {
    if (this.flow().masked) {
      this.save()
    } else {
      this.go(this.flow().next)
    }
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
