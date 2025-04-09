---
title: "Commands"
description: "All the commands available in git-flow-next."
publishDate: 2025-04-09
order: 3
---

## init

This command will initialize git-flow in a Git repository. It will set up the necessary configuration for git-flow to work.

*If a git-flow-avh configuration exists, it will be imported.*

**Usage**

```bash
git-flow init [flags]
```

**Available Flags for `init`**

- `-c`, `--create-branches` Create branches if they don't exist
- `-d`, `--defaults` Use default branch naming conventions

---

## feature

This command allows you to manage feature branches according to the git-flow model.

**Usage**

```bash
git-flow feature [command]
```

**Available Commands**
- `start` Start a new feature branch

```bash
git-flow feature start [branch]
```

- `list`  List all feature branches in the repository

```bash
git-flow feature list
```

- `update` Update a feature branch with changes from its parent branch using the configured downstream strategy

```bash
git-flow feature update [branch]
```

- `finish` Finish a feature branch by merging it into the appropriate base branch

```bash
git-flow feature finish [branch] [flags]
```

**Available Flags for `feature finish`**
- `-a`, `--abort` Abort the finish operation and return to the original state
- `-c`, `--continue` Continue the finish operation after resolving conflicts

---

## hotfix

This command is used to manage hotfix branches according to the git-flow model.

**Usage**

```bash
git-flow hotfix [command]
```

**Available Commands**
- `start` Start a new hotfix branch

```bash
git-flow hotfix start [branch]
```

- `list` List all hotfix branches

```bash
git-flow hotfix list
```

- `update` Update a hotfix branch with changes from its parent branch

```bash
git-flow hotfix update [branch]
```

- `finish` Finish a hotfix branch

```bash
git-flow hotfix finish [branch] [flags]
```

**Available Flags for `hotfix finish`**
- `-a`, `--abort` Abort the finish operation and return to the original state
- `-c`, `--continue` Continue the finish operation after resolving conflicts

---

## update

This command will update the specified branch (or current branch if none specified) with changes from its parent branch using the configured downstream strategy (merge or rebase).

If merge conflicts occur, they will be handled according to the configured merge state handling.

**Usage**

```bash
git-flow update [branch]
```

---

## support

This command allows you to manage support branches according to the git-flow model.

**Usage**

```bash
git-flow support [command]
```

**Available Commands**
- `start` Start a new support branch from the appropriate base branch

```bash
git-flow support start [branch]
```

- `list` List all support branches in the repository

```bash
git-flow support list
```

- `update` Update a support branch with changes from its parent branch using the configured downstream strategy

```bash
git-flow support update [branch]
```

- `finish` Finish a support branch by merging it into the appropriate base branch

```bash
git-flow support finish [branch] [flags]
```

**Available Flags for `support finish`**
- `-a`, `--abort` Abort the finish operation and return to the original state
- `-c`, `--continue` Continue the finish operation after resolving conflicts

---

## release

This command allows you to manage release branches according to the git-flow model.

**Available Commands**
- `start` Start a new support branch from the appropriate base branch

```bash
git-flow release start [branch]
```

- `list` List all release branches in the repository

```bash
git-flow release list
```

- `update` Update a release branch with changes from its parent branch using the configured downstream strategy

```bash
git-flow release update [branch]
```

- `finish` Finish a release branch by merging it into the appropriate base branch

```bash
git-flow release finish [branch] [flags]
```

**Available Flags for `release finish`**
- `-a`, `--abort` Abort the finish operation and return to the original state
- `-c`, `--continue` Continue the finish operation after resolving conflicts

---

## overview

This command displays the current git-flow configuration and lists all active topic branches.

**Usage**

```bash
git-flow overview
```

---

## completion

This command will generate the autocompletion script for git-flow for the specified shell.

**Usage**

```bash
git-flow completion [shell]
```

**Available Shells**
- zsh
- fish
- bash
- powershell

---

## version

Display version information for git-flow-next.

**Usage**

```bash
git-flow version
```

---

## global flags

- For help with any command, use `-h` or `--help`.
- For verbose output, use `-v` or `--verbose`.
