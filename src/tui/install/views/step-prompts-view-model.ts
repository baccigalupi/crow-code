import { CurrentStep } from '../steps/current.ts'
import type { DataStore } from '../data-store.ts'

export const stepPromptsViewModel = (model: DataStore) => {
  return { View: new CurrentStep(model).current().View }
}
