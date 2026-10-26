import { crowConfigFromInputs } from '../../crow-config/from-inputs.ts'
import { highlightJson } from '../../crow-config/highlight.ts'
import type { ConfigPanelProps, InstallStep } from '../../types.ts'

// Provider steps edit the draft, which is always the last provider entry.
const draftTargets: Partial<
  Record<InstallStep, { key: string; occurrence: 'last' }>
> = {
  providerName: { key: 'name', occurrence: 'last' },
  providerUrl: { key: 'baseUrl', occurrence: 'last' },
}

// Previews the crow config, highlighting the line the current step edits.
export class ConfigViewModel {
  private configPanelProps: ConfigPanelProps

  constructor(configPanelProps: ConfigPanelProps) {
    this.configPanelProps = configPanelProps
  }

  view() {
    const builder = crowConfigFromInputs(this.configPanelProps)
    return {
      crowConfigPath: builder.crowConfigPath(),
      ...this.highlightedJson(builder.crowConfigJson()),
    }
  }

  private highlightedJson(json: string) {
    return highlightJson({ json, ...this.highlightTarget() })
  }

  private highlightTarget() {
    const { step } = this.configPanelProps
    return draftTargets[step] || { key: step }
  }
}

export const configViewModel = (configPanelProps: ConfigPanelProps) => {
  return new ConfigViewModel(configPanelProps).view()
}
