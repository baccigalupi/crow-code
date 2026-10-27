import {
  BoxRenderable,
  TextRenderable,
  type RenderContext,
} from '@opentui/core'
import { memoize } from '../../../../decorators.ts'
import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'
import { highlightJson } from '../../crow-config/highlight.ts'
import type { ConfigPanelProps, InstallStep } from '../../types.ts'
import { ConfigJsonView } from './config-json.ts'

// Previews the crow config being built, with the line the current step
// edits highlighted.
export class ConfigPanelView {
  private renderer: RenderContext
  private readonly configJson: ConfigJsonView
  // Shrinks to the rows the step prompt leaves, scrolling the json.
  private readonly rootOptions = {
    flexDirection: 'column',
    paddingX: 1,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
  } as const
  // Provider steps edit the draft, which is always the last provider entry.
  private readonly draftTargets: Partial<
    Record<InstallStep, { key: string; occurrence: 'last' }>
  > = {
    providerName: { key: 'name', occurrence: 'last' },
    providerUrl: { key: 'baseUrl', occurrence: 'last' },
  }

  constructor(renderer: RenderContext) {
    this.renderer = renderer
    this.configJson = new ConfigJsonView(renderer)
  }

  @memoize
  root() {
    const box = new BoxRenderable(this.renderer, this.rootOptions)
    box.add(this.path())
    box.add(this.configJson.root())
    return box
  }

  update(values: ConfigPanelProps) {
    const crowConfigPath = crowConfigFromInputs(values).crowConfigPath()
    this.root().visible = values.step !== 'repo'
    this.path().content = `Installing repo config in: ${crowConfigPath}`
    this.configJson.update(this.jsonSections(values))
  }

  private jsonSections(values: ConfigPanelProps) {
    const json = crowConfigFromInputs(values).crowConfigJson()
    const target = this.highlightTarget(values.step)
    return highlightJson({ json, ...target })
  }

  // Every other step edits the config key of the same name.
  private highlightTarget(step: InstallStep) {
    return this.draftTargets[step] || { key: step }
  }

  @memoize
  private path() {
    return new TextRenderable(this.renderer, { content: '', flexShrink: 0 })
  }
}
