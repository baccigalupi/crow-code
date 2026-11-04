import type { ReactNode } from 'react'
import type { ListFieldViewModel } from './list-field-view-model.ts'
import type { StringFieldViewModel } from './string-field-view-model.ts'

type IndentedProps = { children?: ReactNode }

type StringFieldProps = { field: StringFieldViewModel }

type ListFieldProps = { field: ListFieldViewModel }

type ListItemsProps = { items: readonly StringFieldViewModel[] }

// Json lines nested one level inside their parent.
export const Indented = ({ children }: IndentedProps) => (
  <box flexDirection="column" paddingLeft={2}>
    {children}
  </box>
)

// "name": "value",
export const StringField = ({ field }: StringFieldProps) => (
  <text id={field.id()} key={field.key()}>
    <span fg={field.textColor()} bg={field.background()}>
      "{field.name}": {field.quoted()}
      {field.comma()}
    </span>
  </text>
)

// One "value", inside a list.
const ListItem = ({ field }: StringFieldProps) => (
  <text>
    <span fg={field.textColor()} bg={field.background()}>
      {field.quoted()}
      {field.comma()}
    </span>
  </text>
)

const ListItems = ({ items }: ListItemsProps) => (
  <>
    {items.map((item) => (
      <ListItem key={item.name} field={item} />
    ))}
  </>
)

// "name": [ ... ],
export const ListField = ({ field }: ListFieldProps) => (
  <box id={field.id()} key={field.key()} flexDirection="column">
    <text>
      <span fg={field.textColor()} bg={field.background()}>
        "{field.name}": [
      </span>
    </text>
    <Indented>
      <ListItems items={field.items()} />
    </Indented>
    <text>
      <span fg={field.textColor()} bg={field.background()}>
        ]{field.comma()}
      </span>
    </text>
  </box>
)
