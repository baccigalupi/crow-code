import { JsonArrayViewModel } from './json-array-view-model.ts'

type JsonArrayProps = { items: readonly string[] }

// ["a", "b"] as json, one item per line.
export const JsonArray = ({ items }: JsonArrayProps) => {
  const view = new JsonArrayViewModel(items)
  return <>{view.json()}</>
}
