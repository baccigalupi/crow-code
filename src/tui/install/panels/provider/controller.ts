import type { Keypress } from '../../../keypress.ts'
import type { Outcome } from '../../../types.ts'
import type { PanelName, ProviderFormControllerArguments } from '../../types.ts'
import { TextEditor } from '../shared/text-editor.ts'

// One field of the provider form: tab walks the fields, return moves on (the
// last field saves the provider and clears the form), escape clears the form.
export class ProviderFormController {
  private controllerArguments: ProviderFormControllerArguments

  constructor(controllerArguments: ProviderFormControllerArguments) {
    this.controllerArguments = controllerArguments
  }

  handle(keypress: Keypress): Outcome<PanelName> {
    if (keypress.key.return === true) return this.enter()
    else if (keypress.key.tab === true) return this.tab(keypress)
    else if (keypress.isEscape()) return this.cancel()
    const { field } = this.controllerArguments
    new TextEditor({ field, keypress }).edit()
    return 'stay'
  }

  private tab(keypress: Keypress): Outcome<PanelName> {
    if (keypress.key.shift === true) return this.go(this.backTarget())
    return this.go(this.controllerArguments.forward)
  }

  private backTarget() {
    return this.controllerArguments.back
  }

  private go(target: PanelName | undefined): Outcome<PanelName> {
    if (target === undefined) return 'stay'
    return { goTo: target }
  }

  private enter(): Outcome<PanelName> {
    const { form, providers, forward } = this.controllerArguments
    if (forward === undefined) {
      providers.save(form.provider(), form.credential())
      form.clear()
    }
    return 'next'
  }

  private cancel(): Outcome<PanelName> {
    this.controllerArguments.form.clear()
    return 'cancel'
  }
}
