import type { ReactNode } from 'react'
import type { DataStore } from '../data-store.ts'
import type { StepName } from '../types.ts'

// One step of the installer, known by its name, drawing its own prompt.
// Arriving at most steps changes nothing; a step that does something on
// arrival overrides entered.
export abstract class Step {
  abstract readonly name: StepName

  abstract prompt(store: DataStore): ReactNode

  entered(_store: DataStore) {}
}
