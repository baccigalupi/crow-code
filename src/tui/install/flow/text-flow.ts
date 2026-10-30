import type { PanelFlow } from '../../types.ts'
import type { InstallStep, TextFlowArguments } from '../types.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import { TextPromptController } from '../panels/text-prompt/controller.ts'

// The text prompts in the order they are asked; the last one hands over to the
// provider form.
export class TextFlow {
  private stores: TextFlowArguments
  private readonly steps: readonly InstallStep[] = [
    'repo',
    'crowGlobalDirectory',
    'envFile',
    'ignore',
    'additionalRead',
    'additionalWrite',
    'escalateRead',
    'escalateWrite',
    'allowedLocalScripts',
    'providerName',
  ]

  constructor(stores: TextFlowArguments) {
    this.stores = stores
  }

  panels() {
    return Object.fromEntries(
      this.fields().map((field, index) => [
        this.steps[index],
        this.flow(field, index),
      ]),
    )
  }

  private flow(field: TextFieldStore, index: number): PanelFlow<InstallStep> {
    const controller = new TextPromptController(field)
    return { controller, next: this.steps[index + 1] }
  }

  private fields() {
    return [
      ...this.directoryFields(),
      ...this.grantFields(),
      ...this.escalationFields(),
    ]
  }

  private directoryFields() {
    const { directories } = this.stores
    return [
      directories.repoDirectory,
      directories.globalDirectory,
      directories.envFile,
    ]
  }

  private grantFields() {
    const { permissions } = this.stores
    return [
      permissions.ignore,
      permissions.additionalRead,
      permissions.additionalWrite,
    ]
  }

  private escalationFields() {
    const { permissions } = this.stores
    return [
      permissions.escalateRead,
      permissions.escalateWrite,
      permissions.allowedLocalScripts,
    ]
  }
}
