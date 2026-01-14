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
git config gitflow.<type>.finish.sign <true|false>
git config gitflow.<type>.finish.signingkey <keyid>
git config gitflow.<type>.finish.keep <true|false>
git config gitflow.<type>.finish.force-delete <true|false>
```

## Hooks and Filters

git-flow-next supports custom hooks and filters that execute at various points during git-flow operations. Scripts are located in `.git/hooks/` and follow specific naming patterns.

### Hooks

Hooks are shell scripts that run before or after git-flow operations. They receive context via environment variables.

**Naming Pattern**: `{pre,post}-flow-{type}-{action}`

**Available Actions**:
- `start` - Creating a new topic branch
- `finish` - Completing a topic branch
- `publish` - Pushing a branch to remote
- `track` - Tracking a remote branch
- `delete` - Deleting a topic branch
- `update` - Updating from parent branch

**Environment Variables**:
- `GITFLOW_BRANCH_TYPE` - The type of branch (feature, release, etc.)
- `GITFLOW_BRANCH_NAME` - The short name of the branch
- `GITFLOW_FULL_BRANCH` - The full branch name with prefix
- `GITFLOW_BASE_BRANCH` - The parent branch
- `GITFLOW_ORIGIN` - The remote name
- `GITFLOW_VERSION` - The version (for release/hotfix branches)

**Examples**:
```bash
# .git/hooks/pre-flow-feature-start - Runs before starting a feature
#!/bin/bash
echo "Starting feature: $GITFLOW_BRANCH_NAME"

# .git/hooks/post-flow-release-finish - Runs after finishing a release
#!/bin/bash
echo "Released version: $GITFLOW_VERSION"
# Trigger CI/CD deployment, notify team, etc.
```

### Filters

Filters transform values during git-flow operations. They receive input via stdin and output the transformed value to stdout.

**Naming Pattern**: `filter-flow-{type}-{action}-{target}`

**Available Targets**:
- `version` - Filter the version/name on start operations
- `tag-message` - Filter the tag message on finish operations

**Examples**:
```bash
# .git/hooks/filter-flow-release-start-version - Transform release version
#!/bin/bash
# Prepend 'v' to version numbers
read VERSION
echo "v$VERSION"

# .git/hooks/filter-flow-release-finish-tag-message - Transform tag message
#!/bin/bash
# Add standard prefix to tag messages
read MESSAGE
echo "Release: $MESSAGE"
```

## git-flow-avh Compatibility

git-flow-next automatically detects and translates git-flow-avh configuration at runtime:

- **gitflow.branch.master** → **gitflow.branch.main**
- **gitflow.prefix.feature** → **gitflow.branch.feature.prefix**
- **gitflow.prefix.release** → **gitflow.branch.release.prefix**

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