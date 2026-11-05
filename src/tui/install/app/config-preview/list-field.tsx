import type { DataStore } from '../../data-store.ts'
import type { JsonListItem } from '../../types.ts'
import { useSignalValue } from '../../../use-signal-value.ts'
import { Indented } from './indented.tsx'
import { ListFieldViewModel } from './list-field-view-model.ts'
import { StringFieldViewModel } from './string-field-view-model.ts'

type ListFieldProps = {
  model: DataStore
  name: string
  value: readonly string[]
  last?: boolean
}

type ListItemsProps = {
  model: DataStore
  name: string
  items: readonly JsonListItem[]
}

type ListItemProps = { model: DataStore; name: string; item: JsonListItem }

// One "value" inside a list, highlighted along with the list.
const ListItem = ({ model, name, item }: ListItemProps) => {
  const highlightKey = useSignalValue(model.highlightKey)
  const { value, last } = item
  const field = { name, value, last, editable: true, highlightKey }
  const view = new StringFieldViewModel(field)
  return (
    <text>
      <span fg={view.textColor()} bg={view.background()}>
        {view.quoted()}
        {view.comma()}
      </span>
    </text>
  )
}

const ListItems = ({ model, name, items }: ListItemsProps) => (
  <>
    {items.map((item) => (
      <ListItem key={item.index} model={model} name={name} item={item} />
    ))}
  </>
)

// "name": [ ... ],
export const ListField = ({
  model,
  last = false,
  ...field
}: ListFieldProps) => {
  const highlightKey = useSignalValue(model.highlightKey)
  const editable = true
  const view = new ListFieldViewModel({
    ...field,
    last,
    editable,
    highlightKey,
  })
  return (
    <box id={view.id()} key={view.key()} flexDirection="column">
      <text>
        <span fg={view.textColor()} bg={view.background()}>
          "{view.name}": [
        </span>
      </text>
      <Indented>
        <ListItems model={model} name={view.name} items={view.items()} />
      </Indented>
      <text>
        <span fg={view.textColor()} bg={view.background()}>
          ]{view.comma()}
        </span>
      </text>
    </box>
  )
}
