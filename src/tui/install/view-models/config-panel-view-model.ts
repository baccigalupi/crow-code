import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'
import { highlightJson } from '../crow-config/highlight.ts'
import type { ConfigPanelValues, InstallStep } from '../types.ts'

// What the config preview shows: where the config goes and its json split
// around the line the current step edits. Hidden on the first step.
export class ConfigPanelViewModel {
  // Provider steps edit the draft, which is always the last provider entry.
  private readonly draftTargets: Partial<
    Record<InstallStep, { key: string; occurrence: 'last' }>
  > = {
    providerName: { key: 'name', occurrence: 'last' },
    providerUrl: { key: 'baseUrl', occurrence: 'last' },
  }

  props(values: ConfigPanelValues) {
    const config = crowConfigFromInputs(values)
    const target = this.highlightTarget(values.step)
    return {
      visible: values.step !== 'repo',
      crowConfigPath: config.crowConfigPath(),
      ...highlightJson({ json: config.crowConfigJson(), ...target }),
    }
  }

  // Every other step edits the config key of the same name.
  private highlightTarget(step: InstallStep) {
    return this.draftTargets[step] || { key: step }
  }
}
