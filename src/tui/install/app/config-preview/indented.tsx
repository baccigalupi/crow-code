import type { ReactNode } from 'react'

type IndentedProps = { children?: ReactNode }

// Json lines nested one level inside their parent.
export const Indented = ({ children }: IndentedProps) => (
  <box flexDirection="column" paddingLeft={2}>
    {children}
  </box>
)
