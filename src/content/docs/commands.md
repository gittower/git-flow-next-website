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
git-flow init [-f|--force] [--preset=preset] [--custom] [--defaults] [--local|--global|--system|--file=path] [options]
```

**Options**

- `-f, --force` - Force reconfiguration even if already initialized
- `--preset=preset` - Apply a predefined workflow preset (**classic**, **github**, **gitlab**)
- `--custom` - Enable custom configuration mode
- `--defaults, -d` - Use default branch naming conventions without prompting for customization
- `--no-create-branches` - Don't create branches even if they don't exist in the repository

**Configuration Scope Options**

Control where git-flow configuration is stored. Only one scope option may be specified at a time. When no scope option is given, git-flow reads from merged config (local > global > system precedence) and writes to local config.

- `--local` - Read and write configuration in the repository's **.git/config** (default for writes)
- `--global` - Read and write configuration in **~/.gitconfig** (user-wide defaults)
- `--system` - Read and write configuration in **/etc/gitconfig** (system-wide)
- `--file=path` - Read and write configuration in the specified file

**Branch Name Overrides**

- `--main=name` - Override main branch name (default: main)
- `--develop=name` - Override develop branch name (default: develop)
- `--production=name` - Override production branch name for GitLab flow (default: production)
- `--staging=name` - Override staging branch name for GitLab flow (default: staging)

**Prefix Overrides**

- `--feature=prefix` - Override feature branch prefix (default: feature/)
- `--bugfix=prefix, -b prefix` - Override bugfix branch prefix (default: bugfix/)
- `--release=prefix, -r prefix` - Override release branch prefix (default: release/)
- `--hotfix=prefix, -x prefix` - Override hotfix branch prefix (default: hotfix/)
- `--support=prefix, -s prefix` - Override support branch prefix (default: support/)
- `--tag=prefix, -t prefix` - Override version tag prefix (default: none)

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

# Force reconfiguration
git flow init --force --feature=feat/

# Initialize with global scope (user-wide defaults)
git flow init --defaults --global

# Initialize with configuration file
git flow init --defaults --file=/path/to/custom-gitflow.config
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

# Add bugfix branch type with squash merging
git flow config add topic bugfix develop --upstream-strategy=squash --prefix=bug/

# Edit feature branches to use rebase when finishing
git flow config edit topic feature --upstream-strategy=rebase

# Rename develop branch to integration
git flow config rename base develop integration
```

---

### overview

Display a comprehensive overview of the current repository's git-flow configuration, branch structure, and workflow status. Useful for understanding the current state and identifying configuration or workflow issues.

**Usage**
```bash
git-flow overview [--format=format] [--verbose] [--no-color]
```

**Options**

- `--format=format` - Output format: **text** (default), **json**, **yaml**
- `--verbose, -v` - Show detailed information including configuration values and branch metadata
- `--no-color` - Disable colored output

The overview shows configuration summary, branch structure (base and topic branches), active branches with ahead/behind counts, and workflow health status.

**JSON Output**

Outputs structured data suitable for tooling and CI/CD integration:

```bash
git flow overview --format=json
```

**Health Checks**

The overview performs configuration validation, branch sync status checks, and workflow compliance verification, reporting status as healthy, warning, or error.

---

### integrate

Merge a **base** branch upstream into its configured parent branch (for example, **develop** into **main**), honoring the branch type's upstream merge strategy, optionally creating a tag on the parent, and auto-updating the parent's `autoUpdate` children.

Unlike `finish`, which completes and then *deletes* a topic branch, integrate operates on permanent base branches: it **never deletes, creates, or renames** a branch. The integrated base branch remains after the operation. If *branch* is omitted, the current branch is integrated into its parent.

Integrate follows the same conflict-resumable state machine as finish, minus the delete step: **merge** the base branch into its parent, optionally **create a tag** on the parent (off by default), then **update children** with `autoUpdate=true`. On conflict the state is saved and can be resumed with `--continue` or rolled back with `--abort`. These flags act only on an in-progress integrate; an in-progress finish or update is never affected.

**Usage**
```bash
git-flow integrate [branch] [options]
```

**Arguments**
- `branch` - Name of the base branch to integrate into its parent. Must be a configured base branch (`gitflow.branch.<name>.type = base`). If omitted, the current branch is used.

**Operation Control**
- `--continue, -c` - Continue the integrate after resolving merge conflicts
- `--abort, -a` - Abort the integrate and return to the original state (no-op when nothing is in progress)

**Tag Creation**
- `--tag <name>` - Create an annotated tag on the parent branch after the merge. Unlike finish, this single flag both enables tagging and supplies the name — base branches have no version to derive a default from.
- `--notag, -n` - Do not create a tag (overrides a configured tag default)
- `--sign, -s` - Sign the tag cryptographically with GPG
- `--no-sign` - Don't sign the tag
- `--signingkey, -u <keyid>` - Use the given GPG key for the signature
- `--message, -m <msg>` - Use the given message for the tag
- `--messagefile <file>` - Read the tag message from a file (takes precedence over `--message`)

**Merge Strategy**
- `--rebase, -r` - Rebase the base branch onto its parent before merging. **Caution:** rewrites the base branch's history, disruptive for a shared permanent branch — use only when the base branch is not shared.
- `--no-rebase` - Do not rebase (use the configured strategy)
- `--squash, -S` - Squash all commits into a single commit on the parent
- `--no-squash` - Keep individual commits
- `--preserve-merges, -p` - Preserve merges during rebase
- `--no-preserve-merges` - Flatten merges during rebase
- `--no-ff` - Create a merge commit even when a fast-forward is possible
- `--ff` - Allow a fast-forward merge when possible
- `--merge-message, -M <msg>` - Custom commit message for the upstream merge
- `--update-message <msg>` - Custom commit message for child branch updates
- `--squash-message <msg>` - Custom commit message for a squash merge

**Remote Fetch**
- `--fetch` - Fetch from the remote and fast-forward the local parent before integrating (**off by default**, opt-in)
- `--no-fetch` - Do not fetch (overrides a configured fetch default)

**Configuration**

Operational defaults are read from the `gitflow.<branch>.integrate.*` namespace, keyed by the base-branch name. Unlike finish, integrate defaults **tagging off** (base branches have no version-derived tag name) and **fetching off** (opt-in). The upstream merge strategy resolves through the standard three layers: `gitflow.branch.<name>.upstreamStrategy` (Layer 1), `gitflow.<branch>.integrate.*` (Layer 2), and command-line flags (Layer 3).

**Examples**
```bash
# Integrate develop into main
git flow integrate develop

# Integrate the current branch into its parent
git flow integrate

# Integrate and tag the parent
git flow integrate develop --tag v2.0.0

# Resume after resolving a conflict
git flow integrate --continue

# Abort an in-progress integrate
git flow integrate --abort
```

> **Note:** Integrate applies only to base branches. For topic branches (feature, release, hotfix, and custom types), use `finish`.

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
- `name` - Name of the new topic branch (without prefix). Optional: when omitted, git-flow runs the `filter-flow-<type>-start-version` filter with an empty version argument and uses its trimmed output as the branch name. If no such filter is configured or it yields no output, the command fails with `branch name cannot be empty`.
- `base` - Optional base commit, tag, or branch to start from

**Options**
- `--fetch` - Fetch from remote before creating branch (**this is the default**). Refreshes remote-tracking refs; the branch is still created from the configured local start point. Skipped silently when no remote is configured, and a fetch failure is a non-fatal warning (start has no sync gate).
- `--no-fetch` - Don't fetch from remote before creating the branch (opt out of the default)

**Examples**
```bash
# Start a new feature
git flow feature start user-authentication

# Start a release
git flow release start 1.2.0

# Start a release with no name, letting the version filter supply it
git flow release start

# Start feature from specific commit
git flow feature start emergency-fix abc123def

# Start offline without fetching
git flow feature start new-api --no-fetch

# Start hotfix from specific tag
git flow hotfix start 1.1.1 v1.1.0
```

---

### finish

Complete a topic branch by merging it to its parent branch according to the configured merge strategy. The finish operation follows a state machine that handles merging, optional tag creation, child branch updates, and branch deletion, with conflict recovery support.

**Usage**
```bash
git-flow <topic> finish [name] [options]
git-flow finish [options]  # shorthand for current branch
```

**Operation Control**
- `--continue, -c` - Continue after resolving merge conflicts
- `--abort, -a` - Abort operation and return to original state
- `--force, -f` - Force finish: skip remote branch sync check and allow finishing non-standard branches

**Tag Creation**
- `--tag` - Create a tag for the finished branch
- `--notag` - Don't create a tag
- `--sign` - Sign the tag cryptographically with GPG
- `--no-sign` - Don't sign the tag
- `--signingkey <keyid>` - Use specific GPG key
- `--message, -m <message>` - Use given message for tag
- `--messagefile <file>` - Use contents of file as tag message
- `--tagname <name>` - Use specific tag name

**Branch Retention**
- `--keep` - Keep topic branch after finishing
- `--no-keep` - Delete topic branch after finishing (default)
- `--keepremote` - Keep remote tracking branch
- `--no-keepremote` - Delete remote tracking branch
- `--keeplocal` - Keep local branch
- `--no-keeplocal` - Delete local branch
- `--force-delete` - Force delete even if not fully merged
- `--no-force-delete` - Don't force delete (default)

**Merge Strategy Control**
- `--rebase` - Rebase topic branch before merging
- `--no-rebase` - Don't rebase (use configured strategy)
- `--squash` - Squash all commits into single commit
- `--no-squash` - Keep individual commits
- `--squash-message <message>` - Custom commit message for squash merge (CLI-only, no config equivalent)
- `--merge-message, -M <message>` - Custom commit message for the upstream merge (topic to parent). Supports placeholders.
- `--update-message <message>` - Custom commit message for child branch updates (parent to child). Supports placeholders.
- `--preserve-merges` - Preserve merges during rebase
- `--no-preserve-merges` - Flatten merges during rebase (default)
- `--no-ff` - Create merge commit even for fast-forward
- `--ff` - Allow fast-forward merge when possible (default)

**Remote Fetch Options**
- `--fetch` - Fetch from remote before finishing (default). Fetches both the base and topic branches. A failure fetching the topic branch against a reachable-but-failing remote is fatal (finish aborts and names the cause, suggesting `--no-fetch` or `--force`); a remote with no ref for the topic (never pushed, or deleted after a remote merge) is benign.
- `--no-fetch` - Don't fetch from remote before finishing. Skips only the fetch; the remote sync check still runs against existing tracking data.

**Remote Push Options**

By default, finishing performs only local work; nothing is pushed. These options opt in to pushing the results to the configured remote (`gitflow.origin`, default `origin`) as a final stage, after all merges, tags, child updates, and deletion. The finished topic branch itself is never pushed. Branches are pushed target (parent) first, then each auto-updated child base branch (for example `main` then `develop`).

- `--push` - Push the target branch and each auto-updated child base branch (and, by default, the created tag) after finishing
- `--no-push` - Don't push branches after finishing (also suppresses the inherited tag push unless `--pushtag` is given)
- `--pushtag` - Push the created tag after finishing. A bare `--push` already pushes the tag; use `--pushtag` to push the tag without pushing branches, or to re-enable a tag push when branch pushing is disabled. No effect when no tag was created.
- `--no-pushtag` - Don't push the created tag, even when branches are pushed

If no remote is configured, the push stage is skipped with a note and finish still succeeds. A rejected (non-fast-forward) push causes finish to exit with an error; the local finish is already complete and nothing is rolled back — re-run the push after reconciling. CLI push flags are not persisted across `--continue`; set `gitflow.<type>.finish.push` to enable a push that must survive a conflict-and-continue.

**Hook Control**
- `--no-verify` - Bypass pre-commit and commit-msg hooks during merge operations

#### Remote Sync Check

Before merging, finish checks that both the local topic branch **and** the parent (merge-target) branch are in sync with their remote tracking branches. This prevents discarding remote commits and prevents writing a merge onto a stale base:

- **Equal**: Finish proceeds normally
- **Ahead**: Finish proceeds. The topic prints a note (its unpushed commits are merged into the parent, then the branch is deleted); an ahead parent — the normal state after a previous unpushed finish — proceeds silently
- **Behind/Diverged**: Finish aborts to prevent data loss, with a diverged-specific message (use `--force` to bypass). When the parent is behind or diverged, the error names the parent branch — update it (e.g. `git checkout develop && git pull`) or pass `--force`

The parent check is skipped when no remote is configured, when the parent has no remote tracking branch, or when the parent's remote ref is gone. With `--no-fetch` the parent is not fetched but the check still runs against existing tracking data. `--force` bypasses both the topic and parent checks.

#### Message Placeholders

Custom merge and update messages support these placeholders:

| Placeholder | Description | Example |
|---|---|---|
| `%b` | Branch name | `feature/my-feature` |
| `%B` | Full refname | `refs/heads/feature/my-feature` |
| `%p` | Parent branch | `develop` |
| `%P` | Full parent refname | `refs/heads/develop` |
| `%%` | Literal percent | `%` |

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

# Squash all commits with custom message
git flow feature finish my-feature --squash --squash-message "feat: add user authentication"

# Custom merge message with placeholders
git flow feature finish my-feature --merge-message "feat: merge %b into %p"

# Custom messages for both merge and child updates
git flow release finish 1.2.0 \
  --merge-message "release: version 1.2.0" \
  --update-message "chore: sync %b from %p"

# Skip hooks during finish
git flow feature finish my-feature --no-verify

# Keep branch after finishing
git flow hotfix finish 1.1.1 --keep

# Push updated branches and the tag after finishing a release
git flow release finish 1.2.0 --push

# Push the updated branches but not the tag
git flow release finish 1.2.0 --push --no-pushtag

# Always push a branch type on finish via config
git config gitflow.feature.finish.push true
git flow feature finish my-feature
```

---

### publish

Push a topic branch to the remote repository, making it available for other team members to track.

**Usage**
```bash
git-flow <topic> publish [name] [-o option]... [--no-push-option]
git-flow publish [name]  # shorthand for current branch
```

**Options**
- `-o option, --push-option=option` - Transmit the given string to the server during push. Can be repeated for multiple options. Used by platforms like GitLab, Gitea, and Gerrit for server-side behavior. Config defaults and CLI options are combined additively.
- `--no-push-option` - Suppress all push options, including configured defaults

**Examples**
```bash
# Publish current feature branch
git flow feature publish

# Publish specific feature
git flow feature publish user-authentication

# Publish using shorthand
git flow publish

# Publish a release branch
git flow release publish 1.0.0

# Publish with push option to skip CI
git flow feature publish my-feature -o ci.skip

# Publish and create a GitLab merge request
git flow feature publish my-feature -o merge_request.create -o merge_request.target=main

# Publish without any push options (override config defaults)
git flow feature publish my-feature --no-push-option
```

---

### list

List existing topic branches of the specified type, with optional pattern filtering.

**Usage**
```bash
git-flow <topic> list [pattern]
```

Patterns support shell-style globbing (`*`, `?`, `[abc]`, `[a-z]`).

**Examples**
```bash
# List all features
git flow feature list

# List all releases
git flow release list

# List features matching a pattern
git flow feature list "user-*"

# List releases for version 1.x
git flow release list "1.*"
```

---

### update

Update topic branch from its parent branch using the configured downstream strategy.

**Usage**
```bash
git-flow <topic> update [name] [options]
git-flow update [name]  # shorthand
```

The top-level `git flow update` (and its `git flow rebase` alias) also updates the current base branch from its parent (for example, **develop** from **main**) when the current branch is not a topic branch.

If a conflict occurs, the update saves a persistent state file and can be resumed with `--continue` or rolled back with `--abort` — the same resume/abort model as `finish` and `integrate`. These flags act only on an in-progress update; an in-progress finish or integrate is never affected.

**Options**
- `--rebase` - Force rebase strategy instead of configured downstream strategy
- `--continue, -c` - Continue the update after resolving merge conflicts
- `--abort, -a` - Abort the update and return to the original state (no-op when nothing is in progress)

**Examples**
```bash
# Update current branch
git flow update

# Update specific feature
git flow feature update user-auth

# Update with rebase regardless of configuration
git flow feature update my-feature --rebase

# Update release with latest hotfixes
git flow release update 1.2.0

# Resume an update after resolving conflicts
git flow feature update --continue my-feature

# Abort an in-progress update
git flow feature update --abort my-feature

# Resume or abort a base-branch update (top-level surface)
git flow update --continue
git flow update --abort
```

> **Note:** Resuming a **squash**-strategy update is not supported (there is no merge commit to complete and `--abort` cannot roll it back). Complete or discard a squash-strategy conflict with raw Git, then re-run the update.

---

### delete

Delete a topic branch (local and/or remote).

**Usage**
```bash
git-flow <topic> delete <name> [options]
git-flow delete [name]  # shorthand for current branch
```

**Options**
- `--force, -f` - Force delete even if branch has unmerged changes
- `--no-force` - Don't force delete (overrides config)
- `--remote, -r` - Delete remote tracking branch in addition to local
- `--no-remote` - Don't delete remote tracking branch (default)
- `--fetch` - Fetch from remote before deleting. Updates local refs so Git can correctly detect whether the branch was merged remotely (e.g., via a GitHub PR merge), avoiding the need for `--force`. The parent is fast-forwarded only when it is the branch currently checked out (delete auto-checks-out the parent when you delete the branch you are on). A fetch failure against an unreachable remote is a non-fatal note; the topic sync check still runs against existing tracking data and can abort (behind/diverged) unless `--force` is given.
- `--no-fetch` - Don't fetch from remote before deleting (overrides config). Skips only the fetch; the sync check still runs.

**Examples**
```bash
# Delete specific feature
git flow feature delete old-feature

# Delete current branch
git flow delete

# Delete with remote cleanup
git flow feature delete my-feature --remote

# Fetch first so a remotely-merged branch deletes without --force
git flow feature delete my-feature --fetch

# Force delete branch with unmerged changes
git flow feature delete experimental-feature --force
```

---

### rename

Rename a topic branch while preserving Git history.

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

# Rename a release
git flow release rename 1.2.0 1.3.0
```

---

### checkout

Switch to a topic branch with support for partial name matching.

**Usage**
```bash
git-flow <topic> checkout <name|prefix>
```

The checkout command supports partial name matching: if no exact match is found, it looks for branches starting with the given prefix. If multiple branches match, it shows options and fails.

**Examples**
```bash
# Checkout specific feature
git flow feature checkout user-auth

# Partial match checkout
git flow feature checkout user

# Checkout a release
git flow release checkout 1.2.0
```

---

### track

Create a local branch that tracks a remote topic branch, useful for collaborating on branches started by team members.

**Usage**
```bash
git-flow <topic> track <name>
```

**Examples**
```bash
# Track a remote feature branch
git flow feature track user-authentication

# Track a remote release
git flow release track 1.0.0

# Team workflow
# Developer A publishes:
git flow feature publish shared-feature
# Developer B tracks:
git flow feature track shared-feature
```

---

## Shorthand Commands

These commands work on the current branch or accept an optional branch name:

- `git-flow delete [name]` - Delete current or specified topic branch
- `git-flow update [name]` - Update current or specified topic branch from parent
- `git-flow rebase [name]` - Rebase current or specified topic branch (alias for update --rebase)
- `git-flow rename [new-name]` - Rename current topic branch
- `git-flow finish [name]` - Finish current or specified topic branch
- `git-flow publish [name]` - Push current or specified topic branch to remote

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
