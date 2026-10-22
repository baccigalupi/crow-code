import type { FunctionComponent, ReactElement } from 'react'
import type { InstallStore, StepValues } from '../../tui/install/types.ts'

export type StepViews = Record<string, FunctionComponent<StepValues>>

export type StepView = (values: StepValues) => ReactElement | null

export type InstallAppProps = {
  readonly installStore?: InstallStore
  readonly views?: StepViews
}
