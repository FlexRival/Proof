---
name: git-manual-commits
description: >-
  Use whenever a task involves git or reaches a point where committing or
  pushing would be natural — finishing a feature, fixing a bug, ending a work
  session, or when the user says "save this". Enforces that Claude never commits
  or pushes without an explicit request.
---

# Git: Manual Commits Only

The user commits and pushes on their own schedule. Claude does not do it for
them unless explicitly told to in the current session.

## Rules

1. **Never run `git commit`** unless the user explicitly asks for a commit now.
2. **Never run `git push`** (or `git push --force`, tag pushes, `gh pr create`
   that publishes a branch, etc.) unless the user explicitly asks.
3. **Never amend, rebase, reset, or otherwise rewrite history** without an
   explicit request.
4. A one-time "go ahead and commit" covers **only that commit**. It does not
   authorize future commits or any push.

## What is fine without asking

- Editing files, creating files, running the app, running tests.
- `git status`, `git diff`, `git log`, `git branch`, `git show` and other
  read-only inspection.
- `git add` / staging, only when it directly serves a change the user asked for
  and you are not about to commit.
- Creating a new branch when starting work off the default branch.

## At a natural commit point

Stop and summarize what changed. Then either wait, or offer:
"Want me to commit this?" — and do nothing until the user confirms.

## If the user asks you to commit

- Make exactly the commit requested.
- Use the project's attribution trailers for commit messages.
- Do not push afterward unless that was also requested.
