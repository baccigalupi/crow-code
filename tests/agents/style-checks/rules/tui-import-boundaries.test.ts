import { describe, expect, it } from 'bun:test'
import { checkSource } from '../../../../agents/style-checks/engine/check-source.ts'
import { tuiBoundariesPlugin } from '../../../../agents/style-checks/tui-boundaries-plugin.ts'

describe('tuiImportBoundaries', () => {
  it('when a view imports a store, reports it', () => {
    const source =
      "import { TextFieldStore } from '../../data-stores/text-field-store.ts'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/panels/repo/view.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'views import only @opentui/core, theme, decorators, other views and types; found ../../data-stores/text-field-store.ts',
    )
  })

  it('when a view imports only allowed modules, reports nothing', () => {
    const source = [
      "import { BoxRenderable } from '@opentui/core'",
      "import { color } from '../../theme.ts'",
      "import { memoize } from '../../../decorators.ts'",
      "import type { Row } from './types.ts'",
      "import { RowView } from './row-view.ts'",
    ].join('\n')

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/panels/provider/field-view.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a store imports opentui, reports it', () => {
    const source = "import { BoxRenderable } from '@opentui/core'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/data-stores/text-field-store.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'stores never import @opentui/core or panel files; found @opentui/core',
    )
  })

  it('when a store imports a panel file, reports it', () => {
    const source =
      "import { ProviderFormController } from '../panels/provider/controller.ts'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/data-stores/text-field-store.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'stores never import @opentui/core or panel files; found ../panels/provider/controller.ts',
    )
  })

  it('when a store imports a view model, reports it', () => {
    const source = "import { x } from './view-model.ts'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/data-stores/text-field-store.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
  })

  it('when a store imports signals, reports nothing', () => {
    const source = "import { signal } from '@preact/signals-core'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/data-stores/text-field-store.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when run-all imports signals, reports it', () => {
    const source = "import { effect } from '@preact/signals-core'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/panels/complete-setup/run-all.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'operations never import @preact/signals-core',
    )
  })

  it('when a task imports signals, reports it', () => {
    const source = "import { effect } from '@preact/signals-core'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/panels/complete-setup/local-config-task.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
  })

  it('when run-all imports a node module, reports nothing', () => {
    const source = "import path from 'node:path'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/panels/complete-setup/run-all.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when layout imports a store, reports it', () => {
    const source =
      "import { TextFieldStore } from './data-stores/text-field-store.ts'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/layout.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
    expect(diagnostics[0].message).toBe(
      'layout never imports stores, controllers or view models; found ./data-stores/text-field-store.ts',
    )
  })

  it('when layout imports the data store, reports it', () => {
    const source = "import { DataStore } from './data-store.ts'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/layout.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
  })

  it('when layout imports a controller, reports it', () => {
    const source =
      "import { RepoController } from './panels/repo/controller.ts'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/layout.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
  })

  it('when layout imports a view model, reports it', () => {
    const source = "import { RepoViewModel } from './panels/repo/view-model.ts'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/layout.ts',
      source,
    )

    expect(diagnostics).toHaveLength(1)
  })

  it('when layout imports a view, reports nothing', () => {
    const source = "import { RepoView } from './panels/repo/view.ts'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/layout.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when layout imports opentui, reports nothing', () => {
    const source = "import { BoxRenderable } from '@opentui/core'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/layout.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a file has no role, reports nothing', () => {
    const source = "import { BoxRenderable } from '@opentui/core'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/types.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a controller imports opentui, reports nothing', () => {
    const source = "import { BoxRenderable } from '@opentui/core'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/panels/repo/controller.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a view outside src tui imports a store, reports nothing', () => {
    const source = "import { x } from './text-field-store.ts'"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tools/view.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })

  it('when a view uses a non-import statement, reports nothing', () => {
    const source = "const x = require('./text-field-store.ts')"

    const diagnostics = checkSource(
      tuiBoundariesPlugin,
      'src/tui/install/panels/repo/view.ts',
      source,
    )

    expect(diagnostics).toHaveLength(0)
  })
})
