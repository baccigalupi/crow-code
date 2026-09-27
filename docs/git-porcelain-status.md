# Git porcelain status codes

`git status --porcelain` emits a two-character `XY` code per path, consumed by
`GitDiffFiles` as `changeType`.

- `X` (first char): index status — staged vs `HEAD`
- `Y` (second char): worktree status — unstaged vs index
- A space means "no change" on that side

## Single-character values

| Code | Meaning                                   |
| ---- | ----------------------------------------- |
| `M`  | modified                                  |
| `T`  | type changed (file ↔ symlink ↔ submodule) |
| `A`  | added                                     |
| `D`  | deleted                                   |
| `R`  | renamed                                   |
| `C`  | copied                                    |
| `U`  | unmerged (conflict)                       |

## Ordinary combinations

- `' M'` unstaged modification
- `'M '` staged modification
- `'MM'` staged and further unstaged modifications
- `'A '` staged new file
- `'AM'` staged new file with further unstaged changes
- `'D '` staged deletion
- `' D'` unstaged deletion
- `'R '` staged rename (line shows `orig -> new`; parser keeps new path)
- `'T '` / `' T'` type change staged / unstaged

## Special codes

- `'??'` untracked (with `-uall`, every untracked file is listed individually)
- `'!!'` ignored (only emitted when `--ignored` is passed)

## Unmerged combinations

- `'DD'` both deleted
- `'AU'` added by us
- `'UD'` deleted by them
- `'UA'` added by them
- `'DU'` deleted by us
- `'AA'` both added
- `'UU'` both modified
