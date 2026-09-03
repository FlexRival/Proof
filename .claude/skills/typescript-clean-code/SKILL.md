---
name: typescript-clean-code
description: >-
  Use when writing, fixing, editing, reviewing, or refactoring any TypeScript or
  TSX code. Enforces Robert C. Martin's Clean Code catalog adapted for
  TypeScript — naming, functions, comments, DRY, boundary conditions, and
  TypeScript-specific rules.
---

# Clean TypeScript

Adapted from Robert C. Martin's *Clean Code* and the community
`clean-code-skills` catalog. When reviewing, cite violations by rule number
(e.g. "G5 violation: duplicated logic"). When fixing, report what changed
(e.g. "Fixed: extracted magic number to `SECONDS_PER_DAY` (G25)").

## Names (N1–N7)

- **N1** Choose descriptive names — if a name needs a comment, it fails.
- **N2** Name at the right abstraction level (`getUserDirectory()`, not
  `getMapOfUserIdsToNames()`).
- **N3** Use standard nomenclature — domain terms, pattern names (`UserFactory`).
- **N4** Unambiguous names (`renameFile(oldPath, newPath)`, not `rename(a, b)`).
- **N5** Name length matches scope — short in tiny scopes, long for module-level.
- **N6** No encodings — no Hungarian notation (`strName`, `arrUsers`), no
  `I`-prefixed interfaces (`UserRepository`, not `IUserRepository`).
- **N7** Names describe side effects (`getOrCreateConfig()`, not `getConfig()`
  when it also writes).

## Functions (F1–F4)

- **F1** Max 3 arguments; use a parameter object / interface beyond that.
- **F2** No output arguments — return values instead of mutating params.
- **F3** No flag arguments — split `process(data, true)` into
  `processVerbose(data)`.
- **F4** Delete dead functions.

## Comments (C1–C5)

- **C1** No metadata in comments — authorship and dates belong in Git.
- **C2** Delete obsolete comments immediately.
- **C3** No redundant comments that restate the code.
- **C4** If a comment is necessary, write it well (explain *why*).
- **C5** Never commit commented-out code.

## General (G1–G36 — key ones)

- **G5** DRY — no duplicated logic.
- **G6 / G34** One consistent abstraction level per function.
- **G8** Minimize the public interface; export only what's needed.
- **G9** Delete dead code.
- **G10** Declare variables near first use.
- **G11** Be consistent — follow existing patterns in the file.
- **G12** Remove clutter.
- **G16** No obscured intent — no clever one-liners that hide meaning.
- **G19** Use explanatory variables.
- **G20** Function names say exactly what they do.
- **G23** Prefer polymorphism / lookup maps to long `if`/`else` or `switch`.
- **G24** Follow conventions — TypeScript style guide, ESLint, Prettier.
- **G25** Named constants, not magic numbers (`const SECONDS_PER_DAY = 86400`).
- **G28** Encapsulate conditionals (`if (shouldRetry(state))`).
- **G29** Avoid negative conditionals.
- **G30** Functions do one thing.
- **G31** Make temporal coupling explicit (pass results between steps).
- **G36** Law of Demeter — no train wrecks (`obj.getValue()`, not
  `obj.a.b.c.value`).

## TypeScript-specific (TS1–TS3)

- **TS1** Keep imports explicit and stable. Prefer named imports; avoid
  `import * as utils` sprinkled everywhere and implicit/circular dependencies.
- **TS2** Use `enum`s or literal union types instead of magic string/number
  constants.
- **TS3** Type public interfaces explicitly. Never `any` at a boundary — use a
  specific type, or `unknown` plus narrowing.

## Tests (T1–T9)

- **T1** Test everything that could plausibly break.
- **T5** Test boundary conditions explicitly.
- **T6** After finding a bug, test exhaustively around it.
- **T9** Tests must be fast (< 100ms each).

## Anti-patterns (Don't → Do)

| ❌ Don't | ✅ Do |
|---------|------|
| Comment every line | Delete obvious comments |
| Helper for a one-liner | Inline it |
| `import * as utils` everywhere | Named imports |
| `any` in a public API | Specific type, or `unknown` + narrowing |
| Magic number `86400` | `const SECONDS_PER_DAY = 86400` |
| `process(data, true)` | `processVerbose(data)` |
| Deep nesting | Guard clauses, early returns |
| `obj.a.b.c.value` | `obj.getValue()` |
| 100-line function | Split by responsibility |
