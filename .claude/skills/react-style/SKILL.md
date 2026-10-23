---
name: react-style
description: >-
  Conventions for OpenTUI/React TSX views in src/tui. Use when writing or
  reviewing any .tsx file under src/tui/.
---

# React style

Conventions for OpenTUI TSX views under `src/tui/`, derived from
`src/tui/install/views/`. Follow these when writing or reviewing any `.tsx`
file.

The mechanically checkable rules are enforced by `agents/style-check`
(`agents/style-checks/tsx-plugin.ts`): arrow-function components, no
`useState`/`useReducer`, no `&&` conditionals in JSX, no `split('\n')`
line-mapping (multi-line text renders in a single `<text>`). The rules below are the ones a reviewer must still
apply by hand.

Keep this skill to enforceable conventions only. Terminal sizing, flexGrow
pinning, explicit wrap, inverse cursor, theme colors, and similar layout/text
styling details are context to look up in the actual view code when needed — not
rules to assert here.

## Components

- Arrow-function components only (scripted):
  `export const Prompt = (props) => ...`. No default exports.
- Exported components are capitalized (`InstallApp`, `Header`, `Prompt`).
- Unexported helper components are also capitalized consts (`Bar`) and live in
  the same file above the exported component they serve.
- Components take one props object, never positional args.

## Props

- Exported components take a named `*Props` or `*ViewModelArguments` type
  declared in the sibling `types.ts` (`InstallAppProps`, `ConfigPanelProps`) —
  not inline object types.
- Tiny helper components may declare inline props:
  `{ readonly label: string }`. Always `readonly`.
- Injectable state is a default parameter so tests can substitute signals
  without touching module state.
- Wrapper components use `PropsWithChildren` from `react`.

## Views are thin — view models do the thinking

- A view computes nothing. Every derived value (sizes, splits, lists,
  visibility) comes from a `*ViewModel` function: `configViewModel`,
  `inputTextViewModel`.
- The component body is: read signals → call view model(s) → return JSX. Inline
  conditionals for derived data are a smell; push them into the view model where
  they are unit-testable.
- View models take a single args object and return plain data.

## State

- State is `@preact/signals-core` signals read via `useSignalValue` — React
  state hooks are banned (scripted).
- Input handling lives in dedicated hooks under `hooks/` (`useKeypress`), not
  inline `useKeyboard` in a view.
- Signal updates go through the shared input-text functions (`insertText`,
  `deleteBackward`, `moveCursor`, …) — never mutate `InputText` fields in
  place.

## Conditional rendering

- Guard with early `return null` in a helper component (`Prompt`), not
  `cond && <Text>` inside JSX (scripted).
- Lists render via `.map` with an entity id as `key` — never array indexes
  or derived string content as keys.
