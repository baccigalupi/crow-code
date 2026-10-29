# TUI abstractions

How `src/tui` is organized so that each kind of knowledge has exactly one
home, and an agent changing one thing touches one file. This document is the
contract for the install TUI today and for the agent app that follows it. It
is written for `@opentui/core` with `@preact/signals-core`, no view framework.

## Why the current code rots

Every file in `src/tui/install` is small and individually readable. The rot is
not inside files, it is between them: no concept has an owner, so every change
is a scavenger hunt and every agent, finding no home for its new fact, puts it
wherever it is standing.

Concrete symptoms in the current tree:

- **A step is defined in six places.** The `InstallStep` string union
  (`install/types.ts`), the controller-ish class in `install/steps/<name>.ts`,
  the `stepViews` map in `views/step-prompts.ts`, the `draftTargets` map in
  `views/steps/config-panel.ts`, the `fieldSteps` list in
  `data-stores/providers-store.ts`, and the same `fieldSteps` list again in
  `views/steps/provider-field.ts`. `Keypress` then special-cases `'done'` and
  `'confirm'` by string. Adding a step means editing all of them and missing
  one compiles fine.
- **One dispatcher knows every key for every screen.** `interactions/keypress.ts`
  handles quit, done, escape, the confirm select (including `y/n/j/k` and
  arrows), return, tab, and falls through to text editing. It duck-types the
  step (`'focus' in step`, `'advance' in step`). Each new interaction grows this
  class.
- **Step classes lie to fit the dispatcher.** `ConfirmStep.field()` and
  `DefaultStep.field()` return the env-file text field because the dispatcher
  requires a `field()`. Confirm has no text field.
- **Stores navigate.** `ProvidersStore` holds a `StepStore` and calls
  `goTo('confirm')`. `SetupStore` runs an `effect` on the step to start
  filesystem work. `RunAll`, an `Operation`, calls `step.goTo('done')` and
  pushes into a signal-backed progress store. Domain state, navigation, and
  side effects are one tangle, so none can be tested alone.
- **One value bag feeds every view.** `StepValues` is every typed answer plus
  `step`, `confirmation`, `crowConfigPath` and `setupTasks`. Each view `Pick`s
  what it wants. Any view can read anything, so derivation leaks into views:
  `ConfigPanelView.update` calls `crowConfigFromInputs` itself while
  `DataStore` computes the same path one layer up.
- **Defaults live in a store module and are imported by views.**
  `defaultCrowRepoDirectory` is exported from `directories-store.ts` and read
  by `repo-path-prompt.ts`. Views import from stores.
- **The only boundary rule is dead.** `views-only-call-view-models` applies to
  `.tsx` files. There are none now. Nothing stops a view importing a store.

The React version had the same disease with hooks as the medium. Swapping the
medium did not fix it, because the missing thing is not a framework. It is a
small fixed set of nouns, each with a rule about what it may know.

## The nouns

Three kinds of object, and three roles inside one of them.

- **Store**: holds state in signals, exposes mutations. Shared by every panel.
- **Panel**: one region of the terminal that the user looks at. A panel is a
  directory holding its **view**, its **view model** when it has anything to
  derive, and its **controller** when it is interactive. A panel that has a
  controller is in the flow: the user can be "on" it, keys go to it, and it
  says where the flow goes next. A panel without one (the header, the config
  preview) is just drawn.
- **Layout**: puts panels on the terminal. It owns the renderable tree, decides
  which panels are always visible and which slot shows the current interactive
  panel, and handles resize.

Plus two pieces that already exist and stay thin: the **Navigator** (owns the
current interactive panel and the transition table) and the **Runner**
(composition root that wires everything and disposes it).

| Role        | Job                                                   | May import                                                  | Never imports                            | Tested with                                          |
| ----------- | ----------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------- |
| Store       | Hold state in signals; expose mutations               | signals, pure helpers (`input-text.ts`)                     | opentui, any panel file                  | plain unit tests, no renderer                        |
| Controller  | Turn one keypress into store mutations and an outcome | its store slices, `Keypress` type                           | opentui, views, other panels             | unit tests: fake key in, store state and outcome out |
| View model  | Turn store values into the exact props its view draws | store types, domain builders (`crow-config/*`)              | opentui, controllers                     | unit tests: values in, props out                     |
| View        | Build renderables once, redraw from props             | opentui, theme, views in the same panel or `panels/shared/` | stores, view models, controllers, domain | opentui test renderer snapshot                       |
| Panel entry | Declare the panel: name, roles, flow exits            | its own directory's files                                   | other panels                             | registry test                                        |
| Layout      | Compose panel views into the terminal                 | panel entries, opentui                                      | stores, controllers, view models         | opentui test renderer snapshot                       |

Data flows one way and never skips a role:

```
terminal key
  → KeyboardListener            (opentui event → Keypress value)
  → Navigator.current.controller (the current interactive panel's controller)
  → Store mutations + Outcome   (controller writes stores, returns outcome)
  → Navigator.apply(outcome)    (changes current panel, or exits)
  → ViewModel(store) → Props    (computed, one per mounted panel)
  → View.update(props)          (subscription, one per mounted panel)
```

Filesystem and network work starts when a panel is entered, not from a key,
see **Work that starts on arrival**.

### Store

A store is a class over private signals with `ReadonlySignal` getters and
named mutation methods. It is the only place a `signal` is created. It knows
nothing about panels, keys, or renderables, and it never calls another store's
mutations to make a workflow happen.

What exists today maps cleanly: `TextFieldStore`, `DirectoriesStore`,
`PermissionsStore`, `ConfirmStore`, `SavedProvidersStore`, `SetupProgressStore`
are already stores and keep their names and their `data-stores/` directory.

What changes:

- `ProvidersStore` loses its `StepStore` and its `commit`/`cancel`/`focus`
  methods. It becomes `ProviderDraftStore` (three text fields and a `clear()`)
  next to `SavedProvidersStore` (`save(draft, credentials)`). Deciding that
  commit means "save, clear, go back to the name field" is a controller
  decision.
- `SetupStore` is deleted. Its watch on the step becomes the complete-setup
  panel's `entered()`, its task list is a view model concern, its progress
  signal is already `SetupProgressStore`.
- `StepStore` becomes the Navigator's own signal, not a store.
- Defaults (`'.crow'`, `'~/.crow'`) are fields of the store that owns the
  value, read by the view model, never imported by a view.

The root `DataStore` stays as the bag of stores, nothing more: no `press`, no
`paste`, no computed `inputs` or `stepValues`. It is a struct of fields with
`dispose()`.

### Panel

A panel is an entry file plus a directory of the same name. The entry file is
the single home for the facts that are spread over six files today: the
panel's name, what it highlights in the config preview, and, when it is
interactive, where the flow goes on `next` and `cancel`. The directory holds
the roles that serve only this panel.

```
panels/
  provider.ts                   ProviderPanel: name, next, cancel, highlights
  provider/
    controller.ts               ProviderFormController
    view-model.ts               ProviderViewModel
    view.ts                     ProviderPromptView
    field-view.ts               ProviderFieldView
```

```ts
export class ProviderPanel {
  readonly name = 'provider'
  readonly next = 'confirm'
  readonly cancel = 'confirm'
  readonly highlights = 'name'

  controller(store: DataStore) {
    return new ProviderFormController(store.providerDraft, store.savedProviders)
  }

  viewModel() {
    return new ProviderViewModel()
  }

  view(renderer: RenderContext) {
    return new ProviderPromptView(renderer)
  }
}
```

A non-interactive panel has no `controller()`, no `next`, no `cancel`:

```
panels/
  config-preview.ts             ConfigPreviewPanel: name
  config-preview/
    view-model.ts               config json + highlighted line
    view.ts
    json-view.ts
  header.ts                     HeaderPanel: name
  header/
    view.ts
```

The three provider fields are one panel with a `field` signal in its own
controller, not three panels, so the two duplicated `fieldSteps` lists go
away.

Most install prompts are "one labelled text field with a default": repo,
global directory, env file, ignore, the four permission lists, allowed
scripts. Those are domain declarations, not UI code, so they share one
`text-prompt` implementation and each gets only an entry file:

```
panels/
  text-prompt.ts                TextPromptPanel: built from a field, label, default
  text-prompt/
    controller.ts               TextPromptController
    view-model.ts               TextPromptViewModel
    view.ts                     PromptView
  repo.ts                       new TextPromptPanel({ name: 'repo', next: ..., field: ... })
  global-directory.ts
  env-file.ts
  ignore.ts
  ...
```

`panels/shared/` holds only what two or more panels use (`IdleController`
for panels in the flow that take no input). Anything used by one panel lives
under that panel.

#### Controller

A controller answers one question: given this keypress on this panel, what
changes? It receives a `Keypress` value (the existing `input` + `KeyFlags`
pair, made into one type) and returns an `Outcome`:

```ts
type Outcome = 'stay' | 'next' | 'cancel' | 'exit' | { goTo: PanelName }
```

There is no `if ('focus' in step)`. Every controller implements the same
single method, `handle(keypress): Outcome`, and gets the store slices it needs
through its constructor.

Controllers are few, because most interactive panels behave alike:

- `TextPromptController(field)`: edits one `TextFieldStore`; return gives
  `'next'`. Replaces the eleven near-identical `steps/*.ts` classes and
  `TextInput`.
- `ConfirmController(confirmation)`: arrows and `y/n/j/k` choose; return gives
  `'next'` when yes, `'exit'` when no. Lifted out of `Keypress.confirm()`.
- `ProviderFormController(draft, saved)`: tab and shift-tab move between the
  three fields, return on the last field saves and goes to the first, escape
  returns `'cancel'`. Lifted out of `ProvidersStore` and `Keypress.tab()`.
- `IdleController`: setup progress and done.

Global keys (ctrl-c) are handled once, by the Navigator before dispatching, so
no controller re-implements quit. `Keypress` and `CurrentStep` are deleted.

A controller never navigates directly and never touches a renderer. It returns
an outcome; the Navigator decides what `'next'` means for this panel.

#### View model

A view model is one class per view that needs derivation, with one method
`props(store values): Props`. It is where `crowConfigFromInputs`,
`highlightJson`, the active-task index, the `Provider N` title, and the
done/active/pending status of a provider field are computed. Those are all
sitting in views today (`ConfigPanelView`, `SetupProgressView`,
`ProviderPromptView`, `ProviderFieldView`); they move out.

Props are small, flat, and named for what the view draws, not for where the
data came from. The repo prompt gets `{ label, input, defaultValue }`, not
`Pick<StepValues, 'repoDirectory'>`. The mega bag `StepValues` and
`UserInputData` are deleted; the config builder gets its own narrow input type
assembled by the view model that feeds it.

A view with nothing to derive (the done message) has no view model. The panel
entry passes store values straight through.

#### View

Views stay as they are in shape, because that shape is already right: a class
over imperative renderables, `root()` memoized and built once, `update(props)`
redraws from plain values, no store or signal ever in sight. Two rules get
tightened:

- A view imports only `@opentui/core`, `theme.ts`, `decorators.ts`, other
  views in its panel or in `panels/shared/`, and its own `Props` type. No
  store, no view model, no controller, no `crow-config/`. A style check
  enforces this (see **Enforcing the boundaries**).
- A view does not branch on panel names. `ProviderFieldView` today computes
  its own status from the current step. The view model hands it
  `status: 'done' | 'active' | 'pending'`.

### Layout

The layout is what `InstallScreen` already is: the one renderable tree,
header on top, config preview in the middle, the current interactive panel
pinned to the bottom. It becomes `layout.ts` and gains the job
`StepPromptsView` does today: when the Navigator's current panel changes, it
destroys the old panel's view and mounts the new one in the prompt slot. It
knows panels by their entries only, never their stores or controllers, and
it is the only file that calls `panel.view(renderer)`.

A layout decides visibility that depends on where the user is (the config
preview hides on the first prompt). It gets that as a prop from its own view
model, not by reading the Navigator in the view.

### Navigator

Owns `current: ReadonlySignal<PanelName>`, the registry, and the only
`goTo`. It receives keypresses from `KeyboardListener`, handles ctrl-c itself,
dispatches to `panels.get(current).controller(store).handle(keypress)` inside
a `batch`, and applies the returned outcome: `'next'` reads the panel's
`next`, `'cancel'` reads the panel's `cancel` target, `'exit'` calls the
runner's exit, `{ goTo }` goes there. After moving, it calls the new panel's
`entered(store, navigator)` if the panel declares one. Every transition in
the app is readable from the panel entry files alone.

This is not new machinery. It is `StepStore.goTo`, the `nextStep` field on
fifteen step classes, `Keypress.advance`, and `ProvidersStore.cancel`/`focus`
moved into one file. It does not get `push`/`pop` or `'back'` until an app
needs them.

The registry is one ordered list, and `PanelName` is derived from it, not
hand-maintained:

```ts
export class Panels {
  readonly all = [new HeaderPanel(), new ConfigPreviewPanel(), new RepoPanel(), ...] as const
}
type PanelName = Panels['all'][number]['name']
```

One registry test asserts every panel has a name and a view, every interactive
panel has a controller, and every `next`, `cancel` and `{ goTo }` target names
an interactive panel. Adding a panel is: one entry file, its directory if it
needs its own roles, and one line in the registry.

### Work that starts on arrival

Writing the config starts when the progress panel is reached and advances to
done when it finishes. Today this is split across `SetupStore.listen`,
`RunAll.run` (which calls `goTo('done')`), and `SetupProgressStore`.

It is one panel's business, so it lives on that panel:
`CompleteSetupPanel.entered(store, navigator)` snapshots the stores into the
config inputs, runs `RunAll` with a progress callback that writes into
`SetupProgressStore`, and on completion calls `navigator.goTo('done')`. The
rule for the operation side: an `Operation` is handed plain data and returns
results. It never receives a signal, never calls `.peek()`, never calls
`goTo`. The operation stays testable as an operation; `entered` is a handful
of lines that tests exercise by moving the navigator.

### Runner

`InstallTuiRunner` is already the composition root and keeps that job:
construct `DataStore`, `Navigator`, the layout, `Subscriptions`,
`KeyboardListener`; start listening in that order; dispose in reverse on
renderer destroy. It is the one file allowed to import every noun.
`Subscriptions` keeps its job (one signal subscription per mounted panel) and
gains the view models: `effect(() => view.update(viewModel.props(store values)))`.

## Rules an agent can check before committing

These are the yes/no questions. If any answer is no, the change is in the
wrong place.

1. Does this change add a `signal(...)` anywhere outside `data-stores/`? Move it.
2. Does a `view.ts` import a store, a view model, a controller, or
   `crow-config/`? Move the derivation to the panel's `view-model.ts`.
3. Does a store or operation call `goTo`, or hold a `Navigator`/`StepStore`?
   Return an outcome from a controller instead, or start the work from the
   panel's `entered()`.
4. Does a controller check the panel name, or does any code check `'x' in
object` to find a capability? Give the panel its own controller class.
5. Did adding a panel touch anything outside `panels/<name>.ts`,
   `panels/<name>/`, and the registry line? Something still has a side map;
   delete the side map.
6. Does a view branch on a panel or step name? Have the view model pass the
   decision as a prop.
7. Does a props type `Pick` from a shared bag? Name the fields the view draws.
8. Does an `Operation` receive a `ReadonlySignal`? Pass a snapshot value.
9. Does a file under `panels/<name>/` get imported by another panel? Move it
   to `panels/shared/`, or question why two panels need it.
10. Does anything other than the layout call `panel.view(renderer)` or add to
    `renderer.root`? Move it to the layout.

## Enforcing the boundaries

Rules nobody runs are suggestions. Two mechanical checks replace the dead
`views-only-call-view-models` rule:

- **Import boundaries by file role.** Since controller, view model and view
  sit in the same directory, the role comes from the file name, not the path.
  A style-check rule classifies a file under `src/tui/**` by its basename
  (`view.ts` or `*-view.ts`, `view-model.ts`, `controller.ts`, `*-store.ts`,
  `*-task.ts`/`run-all.ts`, `layout.ts`) and checks its imports against a
  small table: views import only `@opentui/core`, `theme`, `decorators`, other
  `*view.ts` files and `types.ts`; stores never import `@opentui/core` or any
  panel file; operations never import `@preact/signals-core`; the layout never
  imports a store, controller or view model. The rule is blocking for
  `src/tui/**`.
- **Registry completeness.** A unit test over `Panels` that every `next`,
  `cancel`, and `goTo` literal resolves to an interactive panel, and that every
  panel declares a view. This is the test that fails when a map was forgotten.

## Directory layout

```
src/tui/
  runner.ts, runner/            unchanged: OpenTUI lifecycle, signals, exit
  keypress.ts                   Keypress value type + fromEvent (shared)
  navigator.ts                  current panel, outcome application
  theme.ts, input-text.ts, types.ts
  install/
    runner.ts                   composition root
    data-store.ts               DataStore: struct of stores + dispose
    data-stores/                TextFieldStore, DirectoriesStore, PermissionsStore,
                                ConfirmStore, ProviderDraftStore, SavedProvidersStore,
                                SetupProgressStore
    layout.ts                   header, config preview, prompt slot; swaps on navigation
    panels.ts                   registry: the ordered list of panels
    panels/
      shared/                   IdleController; nothing else until two panels need it
      header.ts                 HeaderPanel (not interactive)
      header/                   view.ts
      config-preview.ts         ConfigPreviewPanel (not interactive)
      config-preview/           view-model.ts, view.ts, json-view.ts
      text-prompt.ts            TextPromptPanel (built from field, label, default)
      text-prompt/              controller.ts, view-model.ts, view.ts
      repo.ts                   one-line TextPromptPanel declarations
      global-directory.ts
      env-file.ts
      ignore.ts
      additional-read.ts        (and the other permission prompts)
      ...
      provider.ts               ProviderPanel
      provider/                 controller.ts, view-model.ts, view.ts, field-view.ts
      confirm.ts                ConfirmPanel
      confirm/                  controller.ts, view.ts
      complete-setup.ts         CompleteSetupPanel, with entered()
      complete-setup/           view-model.ts, view.ts, row-view.ts,
                                run-all.ts, local-config-task.ts, global-directory-task.ts
      done.ts                   DonePanel
      done/                     view.ts
    crow-config/                unchanged: builder from plain inputs
    subscriptions.ts            subscription per mounted panel, through view models
    types.ts                    shrinks to domain types only
```

Reading rule: open `layout.ts` to see what is on the terminal, `panels.ts`
to see the flow, `panels/<name>.ts` to see what one panel is, and
`panels/<name>/` to see how it works. The setup operations live under the
panel that starts them, because nothing else does.

## Carrying this to the agent app

The agent app has the same nouns with different instances. Its layout has a
transcript panel, a status line and an input slot. The transcript is a
non-interactive panel over a `TranscriptStore` with an `append` mutation,
written by the operation that owns the request, read by a view model that
decides what fits on screen. The chat input is an interactive panel with a
`TextPromptController` over a `TextFieldStore`. A tool approval prompt is an
interactive panel with a `ConfirmController` that the Navigator moves to and
back from, which is the point at which the Navigator earns `push`/`pop` and
nothing else changes. Nothing in the agent app needs a noun the installer
does not already have, and that is the test of whether the set is right.

## Conversion order

Each step lands on its own and leaves the app working.

1. Add the import-boundary style check as advisory for `src/tui/**`, so the
   remaining steps see their own violations.
2. Move derivation out of views into view models; `Subscriptions` calls
   view models. Views stop importing `crow-config` and stores. Flip the style
   check to blocking for view files.
3. Introduce `Navigator` with `Outcome`; `Keypress` dispatches to it. Replace
   the `steps/*.ts` classes with the four controllers, written directly into
   `panels/text-prompt/controller.ts`, `panels/confirm/controller.ts`,
   `panels/provider/controller.ts` and `panels/shared/idle-controller.ts`.
   Delete `CurrentStep`, `TextInput`, and the step-name branches in
   `Keypress`, then delete `Keypress`.
4. Introduce `panels.ts`, `layout.ts` and the panel entry files, moving each
   panel's view model and view in from `views/` next to its controller;
   delete `stepViews`, `draftTargets`, both `fieldSteps` lists, and the
   hand-written `InstallStep` union. `InstallScreen` and `StepPromptsView`
   become `layout.ts`. `views/` is empty when this lands.
5. Split `ProvidersStore` into `ProviderDraftStore` and `SavedProvidersStore`;
   move commit/cancel/focus into `panels/provider/controller.ts`.
6. Replace `SetupStore` with `CompleteSetupPanel.entered()`; operations move
   under `panels/complete-setup/`, take snapshots and a progress callback;
   `RunAll` stops calling `goTo`.
7. Delete `StepValues`/`UserInputData`; each view has its own props type.
   Flip all boundary checks to blocking.

Steps 2 through 7 each get their own issue and worktree. None requires the
others to be finished first, but this order keeps every intermediate state
honest: no step introduces a new side map or a new place that knows about
panels.
