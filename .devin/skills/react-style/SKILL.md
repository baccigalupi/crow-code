---
name: react-style
description: Conventions for Ink/React TSX views in src/tui
triggers:
  - model
---

Conventions for TSX views under `src/tui/`, derived from `src/tui/app/views/`.
Follow these when writing or reviewing any `.tsx` file.

The mechanically checkable rules are enforced by `agents/style-check`
(`agents/style-checks/tsx.ts`): arrow-function components, no
`useState`/`useReducer`, no inline `useInput` outside `hooks/`, no `&&`
conditionals in JSX, no `split('\n')` line-mapping (multi-line text renders in a
single `<Text wrap='wrap'>`). The rules below are the ones a reviewer must still
apply by hand.

## Components

- Arrow-function components only (scripted):
  `export const Input = (props) => ...`. No default exports.
- Exported components are capitalized (`App`, `Header`, `Chat`, `Input`).
- Unexported helper components are also capitalized consts (`Bar`,
  `Placeholder`, `Buffer`, `HistoryLine`) and live in the same file above the
  exported component they serve.
- Components take one props object, never positional args.

## Props

- Exported components take a named `*Props` or `*ViewModelArguments` type
  declared in the sibling `types.ts` (`AppProps`, `ChatViewModelArguments`,
  `InputViewModelArguments`) — not inline object types.
- Tiny helper components may declare inline props:
  `{ readonly entry: HistoryEntry }`. Always `readonly`.
- Injectable state is a default parameter (`session = chatSession`) so tests can
  substitute signals without touching module state.
- Wrapper components use `PropsWithChildren` from `react`.

## Views are thin — view models do the thinking

- A view computes nothing. Every derived value (sizes, splits, lists,
  visibility) comes from a `*ViewModel` function: `appViewModel`,
  `chatViewModel`, `inputViewModel`, `bufferViewModel`.
- The component body is: read signals → call view model(s) → return JSX. Inline
  conditionals for derived data are a smell; push them into the view model where
  they are unit-testable.
- View models take a single args object and return plain data.

## State

- State is `@preact/signals-core` signals read via `useSignalValue` — React
  state hooks are banned (scripted).
- Input handling lives in dedicated hooks (`useReplKeys`, `useResize`), not
  inline `useInput` in a view (scripted).
- Signal updates go through the shared buffer/session functions (`insertText`,
  `deleteBackward`, `moveCursor`, …) — never mutate `InputBuffer` fields in
  place.

## Conditional rendering

- Guard with early `return null` in a helper component (`Placeholder`), not
  `cond && <Text>` inside JSX (scripted).
- Lists render via `.map` with an entity `key={entry.id}` — never array indexes
  or derived string content as keys.
