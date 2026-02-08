---
title: "Configuration"
description: "Complete guide to configuring git-flow-next for your workflow."
publishDate: 2025-09-11
order: 4
---

git-flow-next uses Git's built-in configuration system to store all settings under the **gitflow.*** namespace. This provides a three-layer hierarchy for maximum flexibility while maintaining compatibility with existing git-flow repositories.

## Configuration Hierarchy

Configuration follows a three-layer precedence system (highest to lowest):

1. **Command-line Flags** - Always take highest precedence
2. **Command Overrides** (gitflow.*type*.*command*.*) - Override defaults for specific operations
3. **Branch Type Defaults** (gitflow.branch.*) - Default behavior for branch types

## Configuration Scope

git-flow-next follows Git's native configuration scope precedence:

1. **Local** (**.git/config**) - Highest priority, repository-specific
2. **Global** (**~/.gitconfig**) - User-wide defaults
3. **System** (**/etc/gitconfig**) - System-wide defaults, lowest priority

The `git flow init` command supports scope options to control where configuration is stored:

- `--local` - Store in repository's **.git/config** (default)
- `--global` - Store in user's **~/.gitconfig**
- `--system` - Store in system-wide **/etc/gitconfig**
- `--file=path` - Store in specified file

All runtime commands (start, finish, update, etc.) always read from merged configuration using Git's standard precedence. The scope options only affect the **init** command.

**Multi-Scope Use Cases**

```bash
# Set team defaults globally
git flow init --defaults --global

# Override specific settings in a repository
git flow init --defaults --local

# Shared configuration file
git flow init --defaults --file=/shared/team-gitflow.config
```

## The config Command

Manage git-flow configuration for base branches and topic branch types with full CRUD operations.

**Usage**
```bash
git-flow config <command> [args] [options]
```

### Listing Configuration

Display current git-flow configuration showing branch hierarchy and settings:

```bash
git-flow config list
```

### Adding Configuration

**Add Base Branch**
```bash
git-flow config add base <name> [parent] [options]
```

Creates the Git branch immediately if it doesn't exist.

**Add Topic Branch Type**
```bash
git-flow config add topic <name> <parent> [options]
```

Saves configuration for use with start command.

### Editing Configuration

**Edit Base Branch**
```bash
git-flow config edit base <name> [options]
```

**Edit Topic Branch Type**
```bash
git-flow config edit topic <name> [options]
```

### Renaming

**Rename Base Branch**
```bash
git-flow config rename base <old-name> <new-name>
```

Renames both configuration and Git branch, updating all dependent references.

**Rename Topic Branch Type**
```bash
git-flow config rename topic <old-name> <new-name>
```

Renames topic branch type configuration (does not affect existing branches).

### Deleting Configuration

**Delete Base Branch**
```bash
git-flow config delete base <name>
```

Delete a base branch configuration. Keeps the Git branch but removes git-flow management.

**Delete Topic Branch Type**
```bash
git-flow config delete topic <name>
```

Delete a topic branch type configuration. Does not affect existing branches of this type.

## Base Branch Options

Base branches are long-living branches like main, develop, staging, production.

**--upstream-strategy=strategy**
Merge strategy when merging to parent (**merge**, **rebase**, **squash**)

**--downstream-strategy=strategy**
Merge strategy when updating from parent (**merge**, **rebase**)

**--auto-update[=bool]**
Auto-update from parent on finish (default: false)

## Topic Branch Type Options

Topic branches are short-living branches like feature, release, hotfix.

**--prefix=prefix**
Branch name prefix (default: *name*/)

**--starting-point=branch**
Branch to create from (defaults to parent)

**--upstream-strategy=strategy**
Merge strategy when merging to parent (**merge**, **rebase**, **squash**)

**--downstream-strategy=strategy**
Merge strategy when updating from parent (**merge**, **rebase**)

**--tag[=bool]**
Create tags on finish (default: false)

**--force-delete[=bool]**
Force delete branch even if not fully merged (default: false)

## Merge Strategies

**merge** - Standard Git merge creating a merge commit. Preserves branch history and shows clear integration points.

**rebase** - Rebase branch onto target creating linear history. Clean history with no merge commits.

**squash** - Combine all branch commits into a single commit. Clean target history but loses individual commits.

**none** - No automatic merging. Manual merge required. Only valid for trunk branches.

## Configuration Examples

### Classic GitFlow Setup

```bash
# Initialize with preset
git flow init --preset=classic

# Or configure manually
git flow config add base main
git flow config add base develop main --auto-update=true
git flow config add topic feature develop --prefix=feature/
git flow config add topic release main --starting-point=develop --tag=true
git flow config add topic hotfix main --prefix=hotfix/ --tag=true
git flow config add topic support main --prefix=support/
```

### GitHub Flow Setup

```bash
# Initialize with preset
git flow init --preset=github

# Or configure manually
git flow config add base main
git flow config add topic feature main --prefix=feature/
```

### GitLab Flow Setup

```bash
# Initialize with preset
git flow init --preset=gitlab

# Or configure manually
git flow config add base production
git flow config add base staging production --auto-update=true
git flow config add base main staging --auto-update=true
git flow config add topic feature main --prefix=feature/
git flow config add topic hotfix production --prefix=hotfix/ --tag=true
```

### Custom Configuration

```bash
# Custom workflow with multiple environments
git flow config add base production
git flow config add base staging production --auto-update=true
git flow config add base develop staging --auto-update=true

# Custom topic branch types
git flow config add topic feature develop --prefix=feat/
git flow config add topic bugfix develop --prefix=bug/
git flow config add topic epic develop --prefix=epic/
git flow config add topic release staging --prefix=release/ --tag=true
git flow config add topic hotfix production --prefix=hotfix/ --tag=true
```

## Command-Specific Overrides

Override branch type defaults for specific commands:

```bash
# Always fetch before starting features
git config gitflow.feature.start.fetch true

# Always use rebase strategy for feature finish
git config gitflow.feature.finish.rebase true

# Squash commits when finishing hotfixes
git config gitflow.hotfix.finish.squash true

# Sign release tags
git config gitflow.release.finish.sign true
git config gitflow.release.finish.signingkey ABC123DEF

# Keep support branches after finishing
git config gitflow.support.finish.keep true

# Custom merge message (supports placeholders)
git config gitflow.feature.finish.mergemessage "feat: merge %b into %p"

# Custom update message for child branches
git config gitflow.release.finish.updatemessage "chore: sync %b from %p"

# Bypass hooks during finish
git config gitflow.feature.finish.noverify true

# Fetch before finishing (enabled by default)
git config gitflow.feature.finish.fetch true
```

## Branch Type Configuration Keys

### Default Behavior
```bash
git config gitflow.branch.<type>.prefix <prefix>
git config gitflow.branch.<type>.parent <parent-branch>
git config gitflow.branch.<type>.startpoint <start-branch>
git config gitflow.branch.<type>.upstreamstrategy <merge|rebase|squash>
git config gitflow.branch.<type>.downstreamstrategy <merge|rebase>
git config gitflow.branch.<type>.tag <true|false>
git config gitflow.branch.<type>.tagprefix <prefix>
git config gitflow.branch.<type>.autoupdate <true|false>
git config gitflow.branch.<type>.forcedelete <true|false>
```

### Command Overrides
```bash
# Start command overrides
git config gitflow.<type>.start.fetch <true|false>

# Finish command overrides
git config gitflow.<type>.finish.rebase <true|false>
git config gitflow.<type>.finish.squash <true|false>
git config gitflow.<type>.finish.preserve-merges <true|false>
git config gitflow.<type>.finish.no-ff <true|false>
git config gitflow.<type>.finish.tag <true|false>
git config gitflow.<type>.finish.notag <true|false>
git config gitflow.<type>.finish.sign <true|false>
git config gitflow.<type>.finish.signingkey <keyid>
git config gitflow.<type>.finish.keep <true|false>
git config gitflow.<type>.finish.force-delete <true|false>
git config gitflow.<type>.finish.fetch <true|false>
git config gitflow.<type>.finish.noverify <true|false>
git config gitflow.<type>.finish.mergemessage <message>
git config gitflow.<type>.finish.updatemessage <message>
```

## Hooks and Filters

git-flow-next supports custom hooks and filters that execute at various points during git-flow operations. Scripts are located in `.git/hooks/` and follow specific naming patterns.

### Hooks

Hooks are shell scripts that run before or after git-flow operations. Pre-hooks can prevent operations from proceeding by exiting with a non-zero status.

**Naming Pattern**: `{pre,post}-flow-{type}-{action}`

**Available Actions**:
- `start` - Creating a new topic branch
- `finish` - Completing a topic branch
- `publish` - Pushing a branch to remote
- `track` - Tracking a remote branch
- `delete` - Deleting a topic branch
- `update` - Updating from parent branch

**Positional Arguments** (git-flow-avh compatible):

| Action | Arguments |
|---|---|
| start | `$1=name` `$2=origin` `$3=branch` `$4=base` |
| finish | `$1=name` `$2=origin` `$3=branch` |
| publish | `$1=name` `$2=origin` `$3=branch` |
| track | `$1=name` `$2=origin` `$3=branch` |
| delete | `$1=name` `$2=origin` `$3=branch` |
| update | `$1=name` `$2=origin` `$3=branch` `$4=base` |

**Environment Variables**:

| Variable | Description |
|---|---|
| `BRANCH` | Full branch name (e.g., `feature/my-feature`) |
| `BRANCH_NAME` | Short name (e.g., `my-feature`) |
| `BRANCH_TYPE` | Type (e.g., `feature`) |
| `BASE_BRANCH` | Parent branch (e.g., `develop`) |
| `ORIGIN` | Remote name |
| `VERSION` | Version (for release/hotfix) |
| `EXIT_CODE` | Post-hooks only: exit code of the operation |

Both positional arguments and environment variables provide the same core information. Existing git-flow-avh hook scripts work without modification.

**Examples**:
```bash
#!/bin/sh
# .git/hooks/pre-flow-release-start
# Verify CI is passing before release
if command -v gh &> /dev/null; then
    STATUS=$(gh run list --branch "${BASE_BRANCH:-develop}" --limit 1 --json conclusion -q '.[0].conclusion')
    if [ "$STATUS" != "success" ]; then
        echo "Error: CI is not passing on ${BASE_BRANCH:-develop}"
        exit 1
    fi
fi
exit 0
```

```bash
#!/bin/sh
# .git/hooks/post-flow-release-finish
# Notify on release completion
if [ "$EXIT_CODE" -eq 0 ]; then
    echo "Release $VERSION completed successfully!"
fi
```

### Filters

Filters transform values during git-flow operations. They receive input as arguments and output the transformed value to stdout.

**Naming Pattern**: `filter-flow-{type}-{action}-{target}`

**Available Filters**:

| Filter Name | Command | Purpose |
|---|---|---|
| `filter-flow-release-start-version` | `git flow release start` | Modify version number |
| `filter-flow-hotfix-start-version` | `git flow hotfix start` | Modify version number |
| `filter-flow-release-finish-tag-message` | `git flow release finish` | Customize tag message |
| `filter-flow-hotfix-finish-tag-message` | `git flow hotfix finish` | Customize tag message |

**Version Filters** receive the version as `$1`. **Tag Message Filters** receive the version as `$1` and the original message as `$2`, plus environment variables (`BRANCH_TYPE`, `BRANCH_NAME`, `BASE_BRANCH`, `VERSION`).

**Filter Behavior**:
- If a filter does not exist, the original value is used
- If a filter is not executable, it is skipped silently
- If a filter exits with non-zero status, the operation fails
- If a filter outputs nothing, the original value is used

**Examples**:
```bash
#!/bin/sh
# .git/hooks/filter-flow-release-start-version
# Enforce semantic versioning
VERSION="$1"
if ! echo "$VERSION" | grep -qE '^v?[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$'; then
    echo "Error: Version must follow semantic versioning (e.g., 1.0.0)" >&2
    exit 1
fi
echo "$VERSION"
```

```bash
#!/bin/sh
# .git/hooks/filter-flow-release-finish-tag-message
# Append changelog to tag message
VERSION="$1"
MESSAGE="$2"
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
if [ -n "$LAST_TAG" ]; then
    CHANGELOG=$(git log --oneline "${LAST_TAG}..HEAD" 2>/dev/null)
else
    CHANGELOG=$(git log --oneline -10 2>/dev/null)
fi
echo "${MESSAGE}

Changes in this release:
${CHANGELOG}"
```

### Sharing Hooks

Since `.git/hooks/` is not tracked by Git, consider these approaches:

```bash
# Store hooks in a tracked directory
mkdir .githooks

# Configure Git to use this directory
git config core.hooksPath .githooks
```

## git-flow-avh Compatibility

git-flow-next automatically detects and translates git-flow-avh configuration at runtime:

| AVH Configuration | git-flow-next Equivalent |
|---|---|
| gitflow.branch.master | gitflow.branch.main.* |
| gitflow.branch.develop | gitflow.branch.develop.* |
| gitflow.prefix.feature | gitflow.branch.feature.prefix |
| gitflow.prefix.release | gitflow.branch.release.prefix |
| gitflow.prefix.hotfix | gitflow.branch.hotfix.prefix |
| gitflow.prefix.support | gitflow.branch.support.prefix |
| gitflow.prefix.versiontag | gitflow.branch.*.tagprefix |

Legacy configuration remains unchanged - translation happens transparently.

## Configuration Validation

git-flow-next validates configuration to prevent common issues:

- **Circular dependencies** - Prevents parent/child loops
- **Missing parents** - Ensures all branches have valid parents
- **Invalid prefixes** - Validates Git reference naming rules
- **Conflicting settings** - Warns about contradictory options

## Configuration Storage

All configuration is stored in **.git/config** under the **gitflow.*** namespace:

```ini
[gitflow]
    version = 1.0
    initialized = true

[gitflow "branch.main"]
    type = base
    upstreamstrategy = none
    downstreamstrategy = none

[gitflow "branch.develop"]
    type = base
    parent = main
    autoupdate = true
    upstreamstrategy = merge
    downstreamstrategy = merge

[gitflow "branch.feature"]
    type = topic
    parent = develop
    prefix = feature/
    upstreamstrategy = merge
    downstreamstrategy = rebase

[gitflow "branch.release"]
    type = topic
    parent = main
    startpoint = develop
    prefix = release/
    upstreamstrategy = merge
    downstreamstrategy = merge
    tag = true
    tagprefix = v
```
