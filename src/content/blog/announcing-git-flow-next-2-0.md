---
title: 'git-flow-next 2.0: Your Branch Model, Committed'
pubDate: 2026-08-25
description: 'git-flow-next 2.0 introduces shared, committable configuration via a .gitflow file, tab completion for both command forms, and a stricter, safer foundation across the board.'
author: 'Bruno Brito'
---

Here's a scenario you might recognize. A new developer joins your team, clones the repository, and reads the onboarding doc: 

>*"Run `git flow init` and answer the prompts exactly like this."* 

Six screenshots follow. They typo one prefix. Two weeks later, everyone is wondering why their branches are named `feature_/login`.

We've all been there — and it's not really anyone's fault. For fifteen years, your git-flow setup lived in each clone's local `.git/config`, which meant your team's branch model was never actually *part of your project*. 

**git-flow-next 2.0 fixes that.** Let's dive in! 😎

## 1. Shared Configuration: Commit Your Workflow

The headline feature of 2.0 is a committable configuration file. Run `init` with the new `--shared` flag:

```bash
git flow init --defaults --shared
git add .gitflow && git commit -m "Add shared git-flow configuration"
```

That's it. Your branch model now lives in a `.gitflow` file at the top level of your repository — versioned alongside your code, reviewable in a pull request, and identical for everyone who clones it.

When a teammate clones the repository and runs their first git-flow command, git-flow-next notices the `.gitflow` file and offers to activate it. 

If you'd rather skip the confirmation entirely, set `gitflow.shared.autoInit` to `true` and activation happens automatically with a one-line notice.

Even better: topic branch types declared only in the shared file get working commands *before* activation, so `git flow feature start` does the right thing from the very first command.

### Editing the Shared Configuration

Every `config` verb — `add`, `edit`, `rename`, and `delete` — now takes `--shared`, which edits the `.gitflow` file and re-syncs your local config in one step:

```bash
git flow config edit topic feature --upstream-strategy=rebase --shared
```

Without `--shared`, those commands write to local config only, exactly as before.

### Staying in Sync

Two new subcommands keep the shared file and your local config honest:

```bash
# Has my local config drifted from .gitflow?
git flow config status

# Re-apply .gitflow to my local config
git flow config sync
```

`config status` exits with code **6** when the two have diverged, which makes it a one-liner in CI if you want to enforce that everyone is on the same workflow.

A detail we're rather proud of: git-flow-next never reads `.gitflow` directly during branch operations. It *copies* the shared keys into your local `.git/config`, so every read site sees the same values and native Git precedence still applies. Your local overrides keep working the way you expect.

### A Note on Hooks

Committing configuration to a repository raises an obvious question: what stops a `.gitflow` file from pointing hook execution at a directory full of surprises?

We thought about this one carefully. The `gitflow.path.hooks` key is only copied from `.gitflow` when you explicitly opt in with `gitflow.shared.trustHooks`. Without it, the key is treated as absent (never copied in) and non-interactive auto-init refuses outright when an untrusted hook path is present.

## 2. Tab Completion — For Both Command Forms

git-flow-next 2.0 ships shell completion for **bash**, **zsh**, and **fish**, covering both the `git-flow` and the `git flow` invocation forms:

```bash
# bash — load in the current session
source <(git flow completion bash)

# zsh — install the completion function
git flow completion zsh > "${fpath[1]}/_git-flow"

# fish
git flow completion fish > ~/.config/fish/completions/git-flow.fish
```

Getting `git flow <TAB>` to work took a bit of doing, since Git runs subcommands as separate processes with their own completion context. Each shell needed its own approach, and the generated scripts handle the bridging for you. PowerShell is supported too, though only for the direct `git-flow` form.

## 3. Starting From Nothing

`git flow init` now works outside a repository. Pass `--init` and it creates the repository for you, or just run `init` and answer the prompt:

```bash
git flow init --init
```

One nice touch: the new repository's initial branch is your resolved git-flow trunk, not whatever `init.defaultBranch` happens to say. If your workflow is built around `main`, you get `main`.

## 4. One Tiny, Breaking Change Worth Knowing

`git flow version` now prints:

```
2.0.0 (git-flow-next)
```

...instead of the previous `git-flow-next version 2.0.0`.

The reason is compatibility: tooling written against git-flow-avh expects the first whitespace-separated token to be a bare version number, and our old format broke those scripts. The new format is the one the ecosystem already assumes.

**If you have scripts that match on the old string, they need updating.** This is the only breaking change in 2.0.

While we were at it, release archives now contain a plain `git-flow` (or `git-flow.exe`) binary instead of a version- and platform-suffixed filename. It works as the `git flow` subcommand straight out of the archive, with no renaming after extraction.

## 5. What Was Introduced in Version 1.2

Version 1.2 landed just eight days before 2.0, so it's easy to have missed. A few highlights worth knowing about:

- **`git flow integrate`** merges a base branch upstream into its parent — `develop` into `main`, for example — honoring the branch type's merge strategy and auto-updating children. Unlike `finish`, it never deletes, creates, or renames a branch, which makes it the right tool for permanent base branches. It's conflict-resumable with `--continue` and `--abort`, just like `finish`.
- **`finish` now pushes** the finished branches and release tag to the remote after merging, honoring your push options.
- **`update --continue` and `--abort`** let you resume or cancel an update interrupted by conflicts.
- **Stricter sync checks.** `finish` aborts when the merge target or the topic branch is behind or has diverged from its remote, with a message specific to divergence. Being *ahead* is tolerated, and `--force` skips the check entirely.
- **`start` now fetches by default** before creating a branch, so you branch from current work rather than yesterday's. It's skipped silently when no remote is configured; disable it with `--no-fetch`.
- **Foreign merge state is refused.** Commands no longer act on merge state owned by a different operation, returning exit code 3 instead of proceeding destructively.

## Other Improvements and Fixes

We also took some time to tighten things across the board:

- **Init:** Interactive `init` now stores branch prefixes verbatim. Answering `feature_` gives you `feature_login`, not `feature_/login`. (Told you we'd been there.)
- **Worktrees:** Hooks and filters run from a linked worktree now resolve a relative `gitflow.path.hooks` or `core.hooksPath` against *that worktree*, and execute with it as their working directory, instead of pointing at the main checkout.
- **Errors:** Running a command outside a Git repository now reports a Git error suggesting `git init` (exit code 3), rather than a git-flow-not-initialized error steering you toward `git flow init`.
- **Config:** Adding a base branch now rolls back its saved configuration when creating the Git branch fails, leaving no orphaned config and keeping the command safe to retry.
- **Config:** The `config` command group is no longer preempted by first-run shared-config activation, including its nested `add`, `edit`, `rename`, and `delete` subcommands.
- **Shared config:** `--shared` edits now warn when an untrusted `gitflow.path.hooks` is withheld from local config, matching what `config sync` already reported.
- **Prompts:** Declining the "create a repository?" prompt now reports a decline instead of an internal probe failure.
- **Platforms:** git-flow-next now builds on every Go target OS — terminal detection previously had no implementation for aix, solaris, illumos, and plan9.

## Updating to git-flow-next 2.0

On a Mac, Homebrew is the quickest route:

```bash
brew update && brew upgrade git-flow-next
```

Everywhere else, grab the latest binary from the <a href="https://github.com/gittower/git-flow-next/releases" target="_blank" rel="noopener noreferrer">Releases page</a> and drop it somewhere in your `PATH`.

Then make your workflow official:

```bash
git flow init --defaults --shared
git add .gitflow && git commit -m "Add shared git-flow configuration"
```

Your future teammates will thank you 😊

For the complete list of changes, see the [changelog](/changelog). And if you run into anything, <a href="https://github.com/gittower/git-flow-next/issues" target="_blank" rel="noopener noreferrer">open an issue</a> — we'd love to hear from you.

## What's Next: Worktrees

When we shipped 1.0, we promised automatic worktree support for topic branches. That work is now in `main` and headed for the next release, and it's shaping up to be our favorite feature yet.

The short version: `git flow feature start` will be able to create your branch in its own worktree instead of checking it out, so switching between features becomes a matter of changing directories rather than stashing, switching, and rebuilding. `checkout` becomes worktree-aware, there's a full `worktree` command group for managing them by branch name, and a new `shell-init` command installs a small shell wrapper so that git-flow can actually move your shell to the right directory.

If you're running multiple AI agents across parallel features, we think you'll like where this is going. You can follow along or weigh in on <a href="https://github.com/gittower/git-flow-next/discussions/45" target="_blank" rel="noopener noreferrer">the GitHub discussion</a>.

We hope you enjoy this release! Happy committing!