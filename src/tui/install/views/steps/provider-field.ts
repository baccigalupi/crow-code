import {
  BoxRenderable,
  TextRenderable,
  dim,
  t,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { PromptView } from '../prompt.ts'
import type { InputText } from '../../../types.ts'
import type {
  InstallStep,
  ProviderFieldDefinition,
  ProviderPromptProps,
} from '../../types.ts'

type ProviderField = {
  readonly label: string
  readonly input: InputText
  readonly masked: boolean
}

type ProviderFieldStatus = 'done' | 'active' | 'pending'

// One row of the provider block. Earlier fields show their values, the
// current one is live, later ones wait.
export class ProviderFieldView {
  private renderer: RenderContext
  private definition: ProviderFieldDefinition
  private prompt: PromptView
  private readonly fieldSteps: readonly InstallStep[] = [
    'providerName',
    'providerUrl',
    'providerCredentials',
  ]

  constructor(renderer: RenderContext, definition: ProviderFieldDefinition) {
    this.renderer = renderer
    this.definition = definition
    this.prompt = new PromptView(renderer)
  }

  @memoize
  root() {
    const box = new BoxRenderable(this.renderer, { paddingX: 1 })
    box.add(this.text())
    return box
  }

  update(values: ProviderPromptProps) {
    const status = this.status(values.step)
    this.text().content = this.content(this.field(values), status)
  }

  private content(field: ProviderField, status: ProviderFieldStatus) {
    if (status === 'done') {
      return t`${field.label}: ${field.input.text}`
    } else if (status === 'active') {
      return this.prompt.content({ ...field, defaultValue: '', bare: true })
    } else {
      return t`${dim(`${field.label}:`)}`
    }
  }

  private status(step: InstallStep) {
    const { fieldSteps } = this
    const offset =
      fieldSteps.indexOf(this.definition.input) - fieldSteps.indexOf(step)
    return (['done', 'active', 'pending'] as const)[Math.sign(offset) + 1]
  }

  private field(values: ProviderPromptProps) {
    const { label, input, masked } = this.definition
    return { label, input: values[input], masked }
  }

  @memoize
  private text() {
    return new TextRenderable(this.renderer, { content: '' })
  }
}
