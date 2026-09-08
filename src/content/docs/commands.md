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
git-flow init [-f|--force] [--init] [--preset=preset] [--custom] [--defaults] [--shared|--local|--global|--system|--file=path] [options]
```

**Options**

- `-f, --force` - Force reconfiguration even if already initialized
- `--init` - Create a git repository in the current directory when there is none, then initialize git-flow in it. Without this option, running outside a repository fails (exit status 3) when stdin is not an interactive terminal, and prompts `No git repository here. Create one? [y/N]` when it is. Inside an existing repository it is a no-op. The created repository's initial branch is the resolved git-flow trunk, overriding any ambient `init.defaultBranch`
- `--preset=preset` - Apply a predefined workflow preset (**classic**, **github**, **gitlab**)
- `--custom` - Enable custom configuration mode
- `--defaults, -d` - Use default branch naming conventions without prompting for customization
- `--no-create-branches` - Don't create branches even if they don't exist in the repository

**Configuration Scope Options**

Control where git-flow configuration is stored. Only one scope option may be specified at a time. When no scope option is given, git-flow reads from merged config (local > global > system precedence) and writes to local config.

- `--shared` - Author the configuration into a committable **.gitflow** file at the repository top level, then copy the `gitflow.*` keys into local **.git/config**. Committing **.gitflow** lets teammates share one configuration — on a fresh clone, git-flow offers to activate it. Mutually exclusive with the other scope options. Without `--force`, a second run when **.gitflow** already exists fails and leaves the file untouched
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

A prefix is stored exactly as given; no separator is appended. The trailing slash in the defaults is a naming convention, not a requirement — `feature/`, `feature_`, and `feature-` are all valid and produce the branches `feature/login`, `feature_login`, and `feature-login` respectively. The same applies to prefixes entered at the interactive prompts.

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

# Initialize a shared, committable configuration
git flow init --defaults --shared
git add .gitflow && git commit -m "Add shared git-flow configuration"

# Create the repository too, when there isn't one yet
git flow init --defaults --init
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
Display current git-flow configuration showing branch hierarchy and settings. Only configured branch types are listed; branches you have started are runtime state and do not appear. Trunk branches, child base branches, and topic branch types are each listed alphabetically by branch type name within their own group, so identical runs on an unchanged repository produce the same output.

**add base** *name* [*parent*] [*options*]
Add a base branch configuration. Creates the Git branch immediately if it doesn't exist. If branch creation fails, the new configuration is removed.

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

**Shared Configuration Commands**

**sync**
Copy the shared-managed `gitflow.*` keys from the committable **.gitflow** file into the repository's local **.git/config**, overwriting differing values and removing local keys no longer present in **.gitflow**. Hook/filter path keys (`gitflow.path.hooks`) are copied only when `gitflow.shared.trustHooks` is enabled. When no **.gitflow** file is present, `sync` is a no-op that exits successfully.

**status**
Compare the shared-managed `gitflow.*` keys in local **.git/config** against the **.gitflow** file, listing any that differ. Exits **0** when in sync (or when no **.gitflow** is present) and **6** when they have drifted. Local-only keys (`gitflow.shared.*`, runtime `gitflow.branch.<branch>.base`) and an intentionally-skipped untrusted hook path are never reported as drift.

**The `--shared` Option**

Available on `add`, `edit`, `rename`, and `delete` (both `base` and `topic`). Edits the committable **.gitflow** file instead of local config, then re-syncs the shared-managed keys into local **.git/config**. Requires an existing **.gitflow** (created by `git flow init --shared`); without one the command fails and suggests `git flow init --shared`, creating no file. Without `--shared`, CRUD verbs write local config only, which `config status` will then report as drift from **.gitflow**.

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

**Boolean Options on `edit`**

The defaults listed above apply to `add` only. On `edit`, an omitted `--auto-update` or `--tag` preserves the value already stored; only a supplied flag changes it, in either direction — `--tag=false` clears it, `--tag` or `--tag=true` sets it.

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

# Check whether local config has drifted from .gitflow
git flow config status

# Re-apply the shared .gitflow to local config
git flow config sync

# Edit the shared .gitflow instead of local config
git flow config edit topic feature --upstream-strategy=rebase --shared
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

The overview shows configuration summary, branch structure (base and topic branches), active branches with ahead/behind counts, and workflow health status. Trunk branches, child base branches, and topic branch types are each listed alphabetically by branch type name within their own group, so identical runs on an unchanged repository produce the same output.

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

### worktree

Manage Git worktrees by branch name, independently of the branch lifecycle. A worktree lets a branch live in its own directory, so an in-progress branch does not have to be stashed away before another one can be started.

Subcommands address worktrees by **full branch name** (e.g. `feature/user-auth`), not by topic type plus short name. Paths are computed from the `gitflow.worktreePath` template unless `--path` overrides them, and the computed path is always absolute.

git-flow records the worktrees it creates by writing a provenance marker in Git config, so `list` can tell them apart from worktrees created with plain `git worktree add`. Provenance is never inferred from a worktree's path, only from the marker. The marker is keyed on the branch and follows it through `git flow rename`, so a renamed branch keeps its worktree's provenance even though the directory keeps its old-name path.

**Usage**
```bash
git-flow worktree add <branch> [--path path] [--no-cd] [--quiet]
git-flow worktree remove <branch> [--force] [--no-cd]
git-flow worktree list
git-flow worktree prune
git-flow worktree path <branch>
```

**Subcommands**

- `add <branch>` - Create a worktree for an existing branch at the computed path (or at `--path`). Intermediate directories of a nested path such as `feature/user-auth` are created. The branch must exist and must not be checked out in another worktree. Writes the provenance marker for the branch.
- `remove <branch>` - Remove the worktree that has *branch* checked out. The branch itself is kept. Refuses a worktree with uncommitted or untracked changes unless `--force` is given, and never removes the main worktree. Clears the provenance marker.
- `list` - List the linked worktrees with their branch and path, one row each. The main worktree is excluded. A worktree git-flow did not create is tagged `(unmanaged)`; a worktree whose HEAD is detached shows `(detached)` in place of a branch name. Prints `No linked worktrees found` when there are none.
- `prune` - Drop the administrative entries of worktrees whose directories no longer exist, then drop every provenance marker whose branch has no live worktree.
- `path <branch>` - Print the path the template computes for *branch* and nothing else. Creates nothing and changes nothing.

**Options**
- `--path path` - Create the worktree at *path* instead of the computed one (`add` only). A relative path resolves against the invocation directory — the directory the command was run from.
- `--force` - Remove a worktree even when it has uncommitted or untracked changes, discarding them (`remove` only).
- `--no-cd` - Don't write a navigation destination for the calling shell, even when `GIT_FLOW_CD_FILE` is set (`add` and `remove`).
- `--quiet, -q` - Don't print the tip naming `git flow shell-init` (`add` only).

**Examples**
```bash
# Create a worktree for an existing branch
git flow worktree add feature/user-auth

# Create it somewhere else
git flow worktree add feature/user-auth --path ../review-copy

# See where a branch's worktree would go, without creating it
git flow worktree path feature/user-auth

# List the linked worktrees
git flow worktree list

# Remove a worktree, keeping the branch
git flow worktree remove feature/user-auth

# Remove one with uncommitted changes
git flow worktree remove feature/user-auth --force

# Clean up after deleting a worktree directory by hand
git flow worktree prune
```

**Path Template**

`gitflow.worktreePath` controls where worktrees are created. It supports `{{ repo }}` (the main worktree's directory name), `{{ branch }}` (the full branch name), `{{ branchName }}` (the branch without its topic prefix), and `{{ topicType }}` (the topic branch type, empty for a non-topic branch). A leading `~` expands to the home directory; a relative template resolves against the main worktree root. Defaults to `../{{ repo }}-worktrees/{{ branch }}`.

```bash
git config gitflow.worktreePath '../{{ repo }}-worktrees/{{ branch }}'
git config gitflow.worktreePath '~/worktrees/{{ topicType }}/{{ branchName }}'
```

> **Note:** Requires Git 2.17 or newer.

---

### shell-init

Print a shell script that lets git-flow change your shell's working directory when a command navigates to a worktree.

git-flow runs as a subprocess and cannot change the directory of the shell that started it, so a command that would move you — `checkout` to a branch that has a worktree, `worktree add`, `worktree remove`, `<type> start --worktree` — writes its absolute destination to a file instead of changing directories itself. The wrapper this command prints supplies that file for each invocation, changes directory when the command returns a destination, and removes the file afterward.

**Usage**
```bash
git-flow shell-init <shell>
```

**Supported Shells**
- bash (3.2+)
- zsh
- fish (3.0+)

PowerShell and cmd are not supported.

**Installation**
```bash
# Bash — current session
eval "$(git flow shell-init bash)"

# Bash — all sessions
echo 'eval "$(git flow shell-init bash)"' >> ~/.bashrc

# Zsh — current session
eval "$(git flow shell-init zsh)"

# Zsh — all sessions
echo 'eval "$(git flow shell-init zsh)"' >> ~/.zshrc

# Fish — current session
git flow shell-init fish | source

# Fish — all sessions
echo 'git flow shell-init fish | source' >> ~/.config/fish/config.fish
```

The script defines both a `git` and a `git-flow` shell function, so both the `git flow ...` and `git-flow ...` invocation forms navigate. Every other `git` invocation is passed straight through to the real binary. The navigation variable (`GIT_FLOW_CD_FILE`) is set per invocation rather than exported, so it never leaks into other programs or subshells.

---

### version

Show version information for git-flow-next.

**Usage**
```bash
git-flow version
```

**Output**

Prints the version number first, followed by a parenthesized edition marker, so tooling that parses the first whitespace-separated token reads a bare version number:

```
2.1.0 (git-flow-next)
```

---

### completion

Generate shell completion script for bash, zsh, fish, or PowerShell.

**Usage**
```bash
git-flow completion <shell>
```

**Available Shells**
- bash
- zsh
- fish
- powershell

For bash, zsh, and fish the generated scripts complete both the `git-flow` (direct) and `git flow` (git subcommand) invocation forms. PowerShell completion supports `git-flow` only.

**Installation**
```bash
# Bash — current session
source <(git flow completion bash)

# Bash — all sessions (Linux)
git flow completion bash > /etc/bash_completion.d/git-flow

# Bash — all sessions (macOS with Homebrew)
git flow completion bash > $(brew --prefix)/etc/bash_completion.d/git-flow

# Zsh — install the completion function, then restart your shell
git flow completion zsh > "${fpath[1]}/_git-flow"

# Fish — current session
git flow completion fish | source

# Fish — all sessions
git flow completion fish > ~/.config/fish/completions/git-flow.fish
```

---

## Topic Branch Commands

Topic branch commands are dynamically generated based on your configuration. Default types include **feature**, **release**, **hotfix**, **support**, plus any custom types you define.

Each topic branch type supports these subcommands:

### start

Create a new topic branch of the specified type and check it out, or create it in its own worktree.

**Usage**
```bash
git-flow <topic> start [name] [base] [--worktree|--no-worktree] [--worktree-path path] [--no-cd] [--quiet] [options]
```

**Arguments**
- `topic` - The topic branch type (feature, release, hotfix, support, or custom type)
- `name` - Name of the new topic branch (without prefix). Optional: when omitted, git-flow runs the `filter-flow-<type>-start-version` filter with an empty version argument and uses its trimmed output as the branch name. If no such filter is configured or it yields no output, the command fails with `branch name cannot be empty`.
- `base` - Optional base commit, tag, or branch to start from

**Options**
- `--fetch` - Fetch from remote before creating branch (**this is the default**). Refreshes remote-tracking refs; the branch is still created from the configured local start point. Skipped silently when no remote is configured, and a fetch failure is a non-fatal warning (start has no sync gate).
- `--no-fetch` - Don't fetch from remote before creating the branch (opt out of the default)
- `--worktree, -w` - Create a worktree for the new branch instead of checking the branch out here. The worktree is created at the path the `gitflow.worktreePath` template computes and is recorded as git-flow-created. Overrides `gitflow.branch.<type>.worktree`.
- `--no-worktree` - Don't create a worktree, even when the branch type defaults to one.
- `--worktree-path <path>` - Create the worktree at *path* instead of the computed one. Implies `--worktree`. A relative path resolves against the invocation directory.
- `--no-cd` - Don't write a navigation destination for the calling shell, even when `GIT_FLOW_CD_FILE` is set. The path is still printed for manual use.
- `--quiet, -q` - Don't print the tip about `git flow shell-init`.

**Worktrees**

With `--worktree` — or a branch type whose `gitflow.branch.<type>.worktree` default is true — the branch is created **without being checked out here**, and a worktree is created for it instead: the current worktree's HEAD is unchanged, because Git allows a branch to be checked out in only one worktree at a time. `--worktree` and `--no-worktree` can both be passed; the one that appears **last** on the command line wins, and `--worktree-path` joins that same ordering since naming a path is itself a request for a worktree. This last-one-wins rule is specific to `start`'s worktree flags — every other `--x`/`--no-x` pair in git-flow prefers the positive flag regardless of order.

To make every new branch of a type start in its own worktree without passing a flag:
```bash
git config gitflow.branch.feature.worktree true
```

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

# Start a feature in its own worktree, leaving the current one where it is
git flow feature start user-authentication --worktree

# Choose the worktree's location instead of using the computed one
git flow feature start review-copy --worktree-path ../review-copy
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
- `--ff-only` - Require that the merge into the parent branch be a fast-forward. This is a precondition, not a merge strategy: if the parent carries any commit the topic branch does not — whether truly diverged or merely ahead — finish aborts before touching any local branch, tag, or the working tree. Rejected in combination with `--ff`, `--no-ff`, or a squash strategy. Combined with a rebase strategy, it suppresses the rebase step rather than rewriting the topic branch. Constrains the upstream merge only, not automatic child updates. Overrides `gitflow.<type>.finish.ff-only`.

**Worktree Cleanup**

A branch checked out in a linked worktree cannot be deleted while it is checked out there, so finish frees the topic branch's worktree once the merge (and any child-branch updates) complete. A worktree git-flow created is removed; one created by hand (`git worktree add`) is kept, with its HEAD detached from the branch instead — the directory and every file in it, including uncommitted work, stay exactly as they were. Neither flag has a git config equivalent.

- `--keep-worktree` - Keep the branch's worktree instead of removing it, even when git-flow created it. The directory survives on a detached HEAD, and the branch is still deleted.
- `--force-worktree, -W` - Remove a git-flow-created worktree even if it has uncommitted or untracked changes, discarding them. If the worktree has a merge, rebase, bisect, cherry-pick, or revert in progress, finish is refused regardless of this flag.

A rebase-strategy finish is refused outright when the topic branch has its own separate worktree (merge and squash both work). A child base branch due for auto-update is checked out wherever finish's own merge landed; if it has its own separate worktree, finish refuses outright before the merge starts.

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

# Finish the branch but keep its worktree, detached
git flow feature finish my-feature --keep-worktree

# Finish a branch whose git-flow-created worktree has uncommitted changes
git flow feature finish my-feature --force-worktree

# Refuse to finish unless the parent can be fast-forwarded
git flow feature finish my-feature --ff-only

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

List existing topic branches of the specified type.

**Usage**
```bash
git-flow <topic> list [--worktrees]
```

The command takes no other arguments — there is no name-pattern filter.

**Options**
- `--worktrees` - Append a column reporting each branch's linked worktree. The cell is `-` when the branch has no linked worktree (including one checked out in the main worktree), the worktree's path when it is live and clean, `<path> [n]` when it has *n* changed entries, and `<path> (missing)` when the worktree is registered but no longer present at that path. A worktree git-flow did not create is additionally tagged `(unmanaged)`. Paths are shown relative to the main worktree root.

**Examples**
```bash
# List all features
git flow feature list

# List all releases
git flow release list

# See which features have a worktree, and which have uncommitted work
git flow feature list --worktrees
```

```bash
$ git flow feature list --worktrees
Feature branches:
  api-v2     ../review-copy [3] (unmanaged)
  docs       -
  user-auth  ../my-project-worktrees/feature/user-auth
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

**Worktree Cleanup**

A branch checked out in a linked worktree cannot be deleted while it is checked out there, so delete frees the worktree first. A worktree git-flow created is removed; one created by hand (`git worktree add`) is kept, with its HEAD detached from the branch instead — the directory and every file in it, including uncommitted work, stay exactly as they were. Neither flag has a git config equivalent.

- `--keep-worktree` - Keep the branch's worktree instead of removing it, even when git-flow created it. The directory survives on a detached HEAD, and the branch is still deleted.
- `--force-worktree, -W` - Remove a git-flow-created worktree even if it has uncommitted or untracked changes, discarding them. If the worktree has a merge, rebase, bisect, cherry-pick, or revert in progress, deletion is refused regardless of this flag.

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

# Delete the branch but keep its worktree, detached
git flow feature delete my-feature --keep-worktree

# Delete a branch whose git-flow-created worktree has uncommitted changes
git flow feature delete my-feature --force-worktree
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

A branch's worktree provenance (whether git-flow created it) and its recorded start point are carried to the new name, so a renamed branch keeps everything git-flow knows about it. The worktree **directory** itself keeps its old-name path; use `git flow worktree` if you want the directory to match the new name.

---

### checkout

Switch to a topic branch with support for partial name matching. When the branch has a worktree, checkout **navigates to it** instead of switching the current worktree's branch.

**Usage**
```bash
git-flow <topic> checkout <name|prefix> [--worktree] [--no-cd] [--force] [--quiet] [--showcommands]
```

The checkout command supports partial name matching: if no exact match is found, it looks for branches starting with the given prefix. If multiple branches match, it shows options and fails.

**Options**
- `--worktree, -w` - Create the branch's worktree if it does not exist yet, then navigate to it. The worktree is created at the path the `gitflow.worktreePath` template computes and is recorded as git-flow-created. Without this flag, a branch with no worktree is simply checked out.
- `--no-cd` - Don't write a navigation destination for the calling shell, even when `GIT_FLOW_CD_FILE` is set. The path is still printed for manual use.
- `--force` - Remove a plain directory standing in the way of a new worktree. Only meaningful together with `--worktree`. Refused when the target is a file, a registered worktree, or a directory containing a `.git` entry.
- `--quiet, -q` - Don't print the tip naming `git flow shell-init`.
- `--showcommands` - Show the underlying git commands as they are executed. Navigating to a worktree runs no git command.

**Worktrees**

A branch that has a worktree lives somewhere else on disk, and Git allows a branch in only one worktree at a time. Rather than failing the way a plain `git checkout` would, checkout **navigates**: it prints the worktree's path and offers it to the calling shell through `GIT_FLOW_CD_FILE` (see `git flow shell-init`), leaving the current worktree's branch untouched. If the branch's worktree **is** the worktree you are already in, checkout does an ordinary `git checkout` instead. Navigating to a worktree never changes its provenance — a hand-made worktree stays `(unmanaged)` no matter how often you check the branch out.

**Examples**
```bash
# Checkout specific feature
git flow feature checkout user-auth

# Partial match checkout
git flow feature checkout user

# Checkout a release
git flow release checkout 1.2.0

# Create the branch's worktree if missing, then navigate to it
git flow feature checkout user-auth --worktree
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
