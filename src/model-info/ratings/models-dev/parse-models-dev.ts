import type { ModelsDevCatalog, ReasoningOption } from '../../types.ts'

class ModelParser {
  private static reasoningOptionTypes: ReasoningOption[] = [
    'toggle',
    'effort',
    'budget_tokens',
  ]
  private raw: Record<string, unknown>

  constructor(raw: Record<string, unknown>) {
    this.raw = raw
  }

  parse() {
    return {
      reasoning: this.reasoning(),
      reasoningOptions: this.reasoningOptions(),
    }
  }

  private reasoning() {
    if (this.raw.reasoning === undefined) return null
    return this.raw.reasoning as boolean
  }

  private reasoningOptions() {
    if (this.raw.reasoning_options === undefined) return []
    const options = this.raw.reasoning_options as unknown[]
    return options.flatMap(ModelParser.reasoningOptionFrom)
  }

  private static reasoningOptionFrom(option: unknown): ReasoningOption[] {
    const record = option as Record<string, unknown>
    const type = record.type as ReasoningOption
    if (ModelParser.reasoningOptionTypes.includes(type)) return [type]
    return []
  }
}

class CatalogParser {
  private raw: unknown

  constructor(raw: unknown) {
    this.raw = raw
  }

  async parse() {
    const body = await this.responseBody()
    return this.parsedCatalog(body)
  }

  private responseBody() {
    if (this.raw instanceof Response) {
      if (!this.raw.ok) return {}
      return this.raw.json()
    }
    return this.raw
  }

  private parsedCatalog(body: unknown) {
    const catalog = { ...body as Record<string, Record<string, unknown>> }
    for (const provider of Object.keys(catalog)) {
      catalog[provider] = this.parseProviderModels(catalog[provider])
    }
    return catalog as ModelsDevCatalog
  }

  private parseProviderModels(value: Record<string, unknown>) {
    const models = value.models as Record<string, Record<string, unknown>>
    for (const id of Object.keys(models)) {
      models[id] = new ModelParser(models[id]).parse()
    }
    return models
  }
}

export const parseCatalog = (raw: unknown) => {
  return new CatalogParser(raw).parse()
}
