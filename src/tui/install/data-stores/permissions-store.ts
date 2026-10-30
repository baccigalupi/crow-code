import { computed } from '@preact/signals-core'
import { defaultCrowConfig } from '../../../domain/config.ts'
import { TextFieldStore } from './text-field-store.ts'

// The path and script lists the agent may read, write, escalate or run.
// Read and write lists are grouped the same way the config builds them.
export class PermissionsStore {
  readonly defaultIgnore = JSON.stringify(
    defaultCrowConfig().permissions.ignore,
  )
  readonly defaultAdditionalRead = JSON.stringify(
    defaultCrowConfig().permissions.additionalRead,
  )
  readonly defaultAdditionalWrite = JSON.stringify(
    defaultCrowConfig().permissions.additionalWrite,
  )
  readonly defaultEscalateRead = JSON.stringify(
    defaultCrowConfig().permissions.escalateRead,
  )
  readonly defaultEscalateWrite =
    defaultCrowConfig().permissions.escalateWrite.join(', ')
  readonly defaultAllowedLocalScripts =
    defaultCrowConfig().permissions.allowedLocalScripts.join(', ')
  readonly ignore = new TextFieldStore()
  readonly additionalRead = new TextFieldStore()
  readonly escalateRead = new TextFieldStore()
  readonly additionalWrite = new TextFieldStore()
  readonly escalateWrite = new TextFieldStore()
  readonly allowedLocalScripts = new TextFieldStore()
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
