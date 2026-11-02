import ts from 'typescript'
import { isTuiSourceFile } from '../engine/gates.ts'
import type { Rule } from '../engine/types.ts'

const baseName = (path: string) => path.slice(path.lastIndexOf('/') + 1)

const moduleName = (specifier: string) =>
  baseName(specifier).replace(/\.ts$/, '')

const viewRole = {
  isRole: (fileName: string) => /(^|-)view\.ts$/.test(baseName(fileName)),
  violates: (specifier: string) =>
    specifier !== '@opentui/core' &&
    !/^(theme|decorators|types|view|.*-view)$/.test(moduleName(specifier)),
  message: (specifier: string) =>
    `views import only @opentui/core, theme, decorators, other views and types; found ${specifier}`,
}

const roles = [
  viewRole,
  {
    isRole: (fileName: string) => baseName(fileName).endsWith('-store.ts'),
    violates: (specifier: string) =>
      specifier === '@opentui/core' ||
      specifier.split('/').includes('panels') ||
      /^(view|.*-view|view-model|controller)$/.test(moduleName(specifier)),
    message: (specifier: string) =>
      `stores never import @opentui/core or panel files; found ${specifier}`,
  },
  {
    isRole: (fileName: string) =>
      /(-task|^run-all)\.ts$/.test(baseName(fileName)),
    violates: (specifier: string) => specifier === '@preact/signals-core',
    message: () => 'operations never import @preact/signals-core',
  },
  {
    isRole: (fileName: string) => baseName(fileName) === 'layout.ts',
    violates: (specifier: string) =>
      /^(.*-store|data-store|controller|view-model)$/.test(
        moduleName(specifier),
      ),
    message: (specifier: string) =>
      `layout never imports stores, controllers or view models; found ${specifier}`,
  },
]

export const tuiImportBoundaries: Rule = {
  name: 'tui-import-boundaries',
  applies: isTuiSourceFile,
  enter(node, ctx) {
    if (!ts.isImportDeclaration(node)) return
    if (!ts.isStringLiteral(node.moduleSpecifier)) return
    const specifier = node.moduleSpecifier.text
    const fileName = node.getSourceFile().fileName
    const role = roles.find((candidate) => candidate.isRole(fileName))
    if (role !== undefined && role.violates(specifier)) {
      ctx.report(node, role.message(specifier))
    }
  },
}
