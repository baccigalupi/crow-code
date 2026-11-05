import { computed } from '@preact/signals-core'
import { defaultCrowConfig } from '../../../domain/config.ts'
import { TextFieldStore } from './text-field-store.ts'

// The path and script lists the agent may read, write, escalate or run.
// Read and write lists are grouped the same way the config builds them.
export class PermissionsStore {
  private readonly config = defaultCrowConfig().permissions
  // What each list stands for until something is typed.
  readonly defaults = {
    ignore: JSON.stringify(this.config.ignore),
    additionalRead: JSON.stringify(this.config.additionalRead),
    additionalWrite: JSON.stringify(this.config.additionalWrite),
    escalateRead: JSON.stringify(this.config.escalateRead),
    escalateWrite: this.config.escalateWrite.join(', '),
    allowedLocalScripts: this.config.allowedLocalScripts.join(', '),
  }
  readonly ignore = new TextFieldStore()
  readonly additionalRead = new TextFieldStore()
  readonly escalateRead = new TextFieldStore()
  readonly additionalWrite = new TextFieldStore()
  readonly escalateWrite = new TextFieldStore()
  readonly allowedLocalScripts = new TextFieldStore()
  // The field each question types into, by step.
  readonly fields = {
    ignore: this.ignore,
    additionalRead: this.additionalRead,
    additionalWrite: this.additionalWrite,
    escalateRead: this.escalateRead,
    escalateWrite: this.escalateWrite,
    allowedLocalScripts: this.allowedLocalScripts,
  }
  readonly values = computed(() => ({
    ...this.readTexts(),
    ...this.writeTexts(),
  }))

  private readTexts() {
    return {
      ignore: this.ignore.text.value,
      additionalRead: this.additionalRead.text.value,
      escalateRead: this.escalateRead.text.value,
    }
  }

  private writeTexts() {
    return {
      additionalWrite: this.additionalWrite.text.value,
      escalateWrite: this.escalateWrite.text.value,
      allowedLocalScripts: this.allowedLocalScripts.text.value,
    }
  }
}
