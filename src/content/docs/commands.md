---
title: "Commands"
description: "Comprehensive reference for all git-flow-next commands and options."
publishDate: 2025-09-11
order: 3
---

git-flow-next is a modern implementation of the git-flow branching model written in Go. It provides Git extensions for high-level repository operations following Vincent Driessen's branching model, with support for both preset workflows (Classic GitFlow, GitHub Flow, GitLab Flow) and fully customizable branch configurations.

## Global Options

**--verbose, -v**  
Enable verbose output showing detailed operation information

**--help, -h**  
Show help information for any command

## Core Commands

### init

Initialize git-flow configuration in the current Git repository. Sets up the branch structure and configuration needed for git-flow operations.

**Usage**
```bash
git-flow init [--preset=preset] [--custom] [--defaults] [options]
```

**Options**

- `--preset=preset` - Apply a predefined workflow preset (**classic**, **github**, **gitlab**)
- `--custom` - Enable custom configuration mode
- `--defaults, -d` - Use default branch naming conventions without prompting for customization
- `--no-create-branches` - Don't create branches even if they don't exist in the repository
- `--main=name` - Override main branch name (default: main)
- `--develop=name` - Override develop branch name (default: develop)
- `--production=name` - Override production branch name for GitLab flow (default: production)
- `--staging=name` - Override staging branch name for GitLab flow (default: staging)
- `--feature=prefix` - Override feature branch prefix (default: feature/)
- `--bugfix=prefix, -b prefix` - Override bugfix branch prefix (default: bugfix/)
- `--release=prefix, -r prefix` - Override release branch prefix (default: release/)
- `--hotfix=prefix, -x prefix` - Override hotfix branch prefix (default: hotfix/)
- `--support=prefix, -s prefix` - Override support branch prefix (default: support/)
- `--tag=prefix, -t prefix` - Override version tag prefix (default: v)

**Examples**
```bash
# Interactive initialization
git flow init

# Initialize with Classic GitFlow preset
git flow init --preset=classic

# Initialize with defaults without prompting
git flow init --defaults

# Initialize with preset and defaults
git flow init --preset=classic --defaults

# Custom configuration mode
git flow init --custom

# GitHub Flow with custom main branch
git flow init --preset=github --main=master

# Initialize with short flags
git flow init -p classic -d -m master -b bug/ -r rel/
```

---

### config

Manage git-flow configuration for base branches and topic branch types. Provides full CRUD operations for customizing your git-flow workflow.

**Usage**
```bash
git-flow config <command> [args] [options]
```

**Commands**

**list**  
Display current git-flow configuration showing branch hierarchy and settings

**add base** *name* [*parent*] [*options*]  
Add a base branch configuration. Creates the Git branch immediately if it doesn't exist.

**add topic** *name* *parent* [*options*]  
Add a topic branch type configuration. Saves configuration for use with start command.

**edit base** *name* [*options*]  
Edit an existing base branch configuration

**edit topic** *name* [*options*]  
Edit an existing topic branch type configuration

**rename base** *old-name* *new-name*  
Rename a base branch in both configuration and Git. Updates all dependent references.

**rename topic** *old-name* *new-name*  
Rename a topic branch type configuration. Does not affect existing branches.

**delete base** *name*  
Delete a base branch configuration. Keeps the Git branch but removes git-flow management.

**delete topic** *name*  
Delete a topic branch type configuration. Does not affect existing branches of this type.

**Base Branch Options**
- `--upstream-strategy=strategy` - Merge strategy when merging to parent (**merge**, **rebase**, **squash**)
- `--downstream-strategy=strategy` - Merge strategy when updating from parent (**merge**, **rebase**)
- `--auto-update[=bool]` - Auto-update from parent on finish (default: false)

**Topic Branch Options**
- `--prefix=prefix` - Branch name prefix (default: *name*/)
- `--starting-point=branch` - Branch to create from (defaults to parent)
- `--upstream-strategy=strategy` - Merge strategy when merging to parent (**merge**, **rebase**, **squash**)
- `--downstream-strategy=strategy` - Merge strategy when updating from parent (**merge**, **rebase**)
- `--tag[=bool]` - Create tags on finish (default: false)

**Examples**
```bash
# List current configuration
git flow config list

# Add production trunk branch
git flow config add base production

# Add staging branch that auto-updates from production
git flow config add base staging production --auto-update=true

# Add feature branch type with custom prefix
git flow config add topic feature develop --prefix=feat/

# Add release branch type with tagging
git flow config add topic release main --starting-point=develop --tag=true

# Edit feature branches to use rebase when finishing
git flow config edit topic feature --upstream-strategy=rebase
```

---

### overview

Display repository workflow overview showing current git-flow configuration and all active topic branches.

**Usage**
```bash
git-flow overview
```

---

### version

Show version information for git-flow-next.

**Usage**
```bash
git-flow version
```

---

### completion

Generate shell completion script for bash, zsh, fish, or PowerShell.

**Usage**
```bash
git-flow completion [shell]
```

**Available Shells**
- bash
- zsh  
- fish
- powershell

---

## Topic Branch Commands

Topic branch commands are dynamically generated based on your configuration. Default types include **feature**, **release**, **hotfix**, **support**, plus any custom types you define.

Each topic branch type supports these subcommands:

### start

Create and checkout a new topic branch of the specified type.

**Usage**
```bash
git-flow <topic> start <name> [base] [options]
```

**Arguments**
- `topic` - The topic branch type (feature, release, hotfix, support, or custom type)
- `name` - Name of the new topic branch (without prefix)
- `base` - Optional base commit, tag, or branch to start from

**Options**
- `--fetch` - Fetch from remote before creating branch
- `--no-fetch` - Don't fetch from remote (default)

**Examples**
```bash
# Start a new feature
git flow feature start user-authentication

# Start a release
git flow release start 1.2.0

# Start feature from specific commit
git flow feature start emergency-fix abc123def

# Fetch latest changes before starting
git flow feature start new-api --fetch
```

---

### finish

Complete a topic branch by merging it to its parent branch according to the configured merge strategy.

**Usage**
```bash
git-flow <topic> finish [name] [options]
git-flow finish [options]  # shorthand for current branch
```

**Operation Control**
- `--continue, -c` - Continue after resolving merge conflicts
- `--abort, -a` - Abort operation and return to original state
- `--force, -f` - Force finish non-standard branch

**Tag Creation**
- `--tag` - Create a tag for the finished branch
- `--notag` - Don't create a tag
- `--sign` - Sign the tag cryptographically with GPG
- `--signingkey <keyid>` - Use specific GPG key
- `--message, -m <message>` - Use given message for tag
- `--tagname <name>` - Use specific tag name

**Branch Retention**
- `--keep` - Keep topic branch after finishing
- `--keepremote` - Keep remote tracking branch
- `--keeplocal` - Keep local branch
- `--force-delete` - Force delete even if not fully merged

**Merge Strategy Control**
- `--rebase` - Rebase topic branch before merging
- `--squash` - Squash all commits into single commit
- `--no-rebase` - Don't rebase (use configured strategy)
- `--no-squash` - Keep individual commits
- `--preserve-merges` - Preserve merges during rebase
- `--no-ff` - Create merge commit even for fast-forward
- `--ff` - Allow fast-forward merge when possible

**Examples**
```bash
# Finish current branch (shorthand)
git flow finish

# Finish specific feature
git flow feature finish user-authentication

# Finish release with signed tag
git flow release finish 1.2.0 --tag --sign

# Handle conflicts
git flow feature finish my-feature
# ... resolve conflicts ...
git flow feature finish my-feature --continue

# Force rebase strategy
git flow feature finish my-feature --rebase

# Squash all commits
git flow feature finish my-feature --squash
```

---

### list

List existing topic branches of the specified type.

**Usage**
```bash
git-flow <topic> list [pattern]
```

**Examples**
```bash
# List all features
git flow feature list

# List all releases
git flow release list
```

---

### update

Update topic branch from its parent branch using the configured downstream strategy.

**Usage**
```bash
git-flow <topic> update [name]
git-flow update [name]  # shorthand
```

**Examples**
```bash
# Update current branch
git flow update

# Update specific feature
git flow feature update user-auth

# Update hotfix branch
git flow hotfix update critical-fix
```

---

### delete

Delete a topic branch (local and/or remote).

**Usage**
```bash
git-flow <topic> delete <name>
git-flow delete [name]  # shorthand for current branch
```

**Examples**
```bash
# Delete specific feature
git flow feature delete old-feature

# Delete current branch
git flow delete
```

---

### rename

Rename a topic branch.

**Usage**
```bash
git-flow <topic> rename <old-name> <new-name>
git-flow rename [new-name]  # shorthand for current branch
```

**Examples**
```bash
# Rename specific feature
git flow feature rename old-name new-name

# Rename current branch
git flow rename better-name
```

---

### checkout

Switch to a topic branch.

**Usage**
```bash
git-flow <topic> checkout <name|prefix>
```

**Examples**
```bash
# Checkout specific feature
git flow feature checkout user-auth

# Partial match checkout
git flow feature checkout user
```

---

## Shorthand Commands

These commands work on the current branch or accept an optional branch name:

- `git-flow delete [name]` - Delete current or specified topic branch
- `git-flow update [name]` - Update current or specified topic branch from parent
- `git-flow rebase [name]` - Rebase current or specified topic branch (alias for update --rebase)
- `git-flow rename [new-name]` - Rename current topic branch
- `git-flow finish [name]` - Finish current or specified topic branch

---

## Workflow Presets

### Classic GitFlow
Traditional git-flow with main, develop, feature/, release/, and hotfix/ branches.

### GitHub Flow
Simplified workflow with main and feature/ branches only.

### GitLab Flow
Multi-environment workflow with production, staging, main, feature/, and hotfix/ branches.

---

## Configuration

git-flow-next uses Git's configuration system, storing settings under the **gitflow.*** namespace. Configuration follows a three-layer hierarchy:

1. **Branch Type Defaults** (gitflow.branch.*) - Default behavior for branch types
2. **Command Overrides** (gitflow.*type*.*command*.*) - Override defaults for specific operations
3. **Command-line Flags** - Always take highest precedence

---

## Git-flow-avh Compatibility

git-flow-next automatically detects and translates git-flow-avh configuration at runtime without modifying existing settings. Legacy configuration is mapped to the new format transparently.
