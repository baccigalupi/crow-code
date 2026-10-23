import { buildCrowConfig } from '../../crow-config/build.ts'
import { highlightJson } from '../../crow-config/highlight.ts'
import type { ConfigPanelProps } from '../../types.ts'

// Previews the crow config, highlighting the line the current step edits.
export class ConfigViewModel {
  private configPanelProps: ConfigPanelProps

  constructor(configPanelProps: ConfigPanelProps) {
    this.configPanelProps = configPanelProps
  }

  view() {
    const { crowConfigPath, crowConfigJson } = this.built()
    return { crowConfigPath, ...this.highlightedJson(crowConfigJson) }
  }

  private built() {
    return buildCrowConfig(this.configPanelProps).all()
  }

  private highlightedJson(json: string) {
    return highlightJson({ json, key: this.configPanelProps.step })
  }
}

export const configViewModel = (configPanelProps: ConfigPanelProps) => {
  return new ConfigViewModel(configPanelProps).view()
}
