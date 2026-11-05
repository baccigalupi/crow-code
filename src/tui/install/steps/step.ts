import type { DataStore } from '../data-store.ts'
import type { StepName } from '../types.ts'

// One step of the installer, known by its name. Arriving at most steps
// changes nothing; a step that does something on arrival overrides entered.
export abstract class Step {
  abstract readonly name: StepName

  entered(_store: DataStore) {}
}
