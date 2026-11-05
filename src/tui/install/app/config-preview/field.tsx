import type { ReactNode } from 'react'
import type { DataStore } from '../../data-store.ts'
import { useSignalValue } from '../../../use-signal-value.ts'
import { FieldViewModel } from './field-view-model.ts'

type FieldProps = {
  model: DataStore
  name: string
  editable?: boolean
  children?: ReactNode
}

// One config key's json, highlighted when it is the key the current panel
// edits.
export const Field = ({
  model,
  name,
  editable = true,
  children,
}: FieldProps) => {
  const highlightKey = useSignalValue(model.highlightKey)
  const view = new FieldViewModel({ name, editable, highlightKey })
  return (
    <text id={view.id()}>
      <span fg={view.textColor()} bg={view.background()}>
        {children}
      </span>
    </text>
  )
}
