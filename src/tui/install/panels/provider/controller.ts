import type { Keypress } from '../../../keypress.ts'
import type { Outcome } from '../../../types.ts'
import type {
  InstallStep,
  ProviderFormControllerArguments,
} from '../../types.ts'
import { TextEditor } from '../shared/text-editor.ts'

// One field of the provider form: tab walks the fields, return moves on (the
// last field saves the provider), escape drops the draft.
export class ProviderFormController {
  private form: ProviderFormControllerArguments

  constructor(form: ProviderFormControllerArguments) {
    this.form = form
  }

  handle(keypress: Keypress): Outcome<InstallStep> {
    if (keypress.key.return === true) return this.enter()
    else if (keypress.key.tab === true) return this.tab(keypress)
    else if (keypress.isEscape()) return this.cancel()
    new TextEditor({ field: this.form.field, keypress }).edit()
    return 'stay'
  }

  private tab(keypress: Keypress): Outcome<InstallStep> {
    if (keypress.key.shift === true) return this.go(this.form.back)
    return this.go(this.form.forward)
  }

  private go(target: InstallStep | undefined): Outcome<InstallStep> {
    if (target === undefined) return 'stay'
    return { goTo: target }
  }

  private enter(): Outcome<InstallStep> {
    if (this.form.forward === undefined) this.form.providers.commit()
    return 'next'
  }

  private cancel(): Outcome<InstallStep> {
    this.form.providers.cancel()
    return 'cancel'
  }
}
