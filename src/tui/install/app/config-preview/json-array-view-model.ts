// An array of strings written as json, one item per line.
export class JsonArrayViewModel {
  private items: readonly string[]

  constructor(items: readonly string[]) {
    this.items = items
  }

  json() {
    return JSON.stringify(this.items, null, 2)
  }
}
