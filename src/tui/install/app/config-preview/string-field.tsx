import type { DataStore } from '../../data-store.ts'
import { useSignalValue } from '../../../use-signal-value.ts'
import { StringFieldViewModel } from './string-field-view-model.ts'

type StringFieldProps = {
  model: DataStore
  name: string
  value: string
  last?: boolean
  editable?: boolean
}

// "name": "value",
export const StringField = ({
  model,
  last = false,
  editable = true,
  ...field
}: StringFieldProps) => {
  const highlightKey = useSignalValue(model.highlightKey)
  const view = new StringFieldViewModel({
    ...field,
    last,
    editable,
    highlightKey,
  })
  return (
    <text id={view.id()} key={view.key()}>
      <span fg={view.textColor()} bg={view.background()}>
        "{view.name}": {view.quoted()}
        {view.comma()}
      </span>
    </text>
  )
}
