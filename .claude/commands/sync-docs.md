Update the website documentation and version from the git-flow-next CLI repository.

## Source

Read documentation from the local CLI repo at `../git-flow-next/docs/`. If that directory does not exist, fall back to fetching files from GitHub using the MCP github tools from the `gittower/git-flow-next` repository (path: `docs/`).

The source docs directory contains manpage-style documentation files:
- `git-flow.1.md` - Main command overview
- `git-flow-init.1.md` - Init command
- `git-flow-config.1.md` - Config command
- `git-flow-overview.1.md` - Overview command
- `git-flow-start.1.md` - Start command
- `git-flow-finish.1.md` - Finish command
- `git-flow-delete.1.md` - Delete command
- `git-flow-rename.1.md` - Rename command
- `git-flow-update.1.md` - Update command
- `git-flow-list.1.md` - List command
- `git-flow-checkout.1.md` - Checkout command
- `git-flow-track.1.md` - Track command
- `git-flow-publish.1.md` - Publish command
- `gitflow-config.5.md` - Configuration reference
- `gitflow-hooks.7.md` - Hooks and filters reference

## Targets

Update the following website files based on the source docs:

### `src/content/docs/commands.md`
Comprehensive command reference page. Update with any new commands, options, flags, and examples from the source manpages. Preserve the existing frontmatter and overall structure (Global Options, Core Commands, Topic Branch Commands, Shorthand Commands, Workflow Presets, Configuration summary, avh Compatibility). Add new sections for new commands or features.

### `src/content/docs/configuration.md`
Configuration guide. Update with any new configuration keys, options, scope features, hooks/filters changes, and examples from `gitflow-config.5.md` and `gitflow-hooks.7.md`. Preserve the existing frontmatter and structure.

### `src/components/Hero.astro`
Update the version number in the `<span class="version-number">` element to match the new version.

### `src/pages/changelog.astro`
Sync the changelog from `../git-flow-next/CHANGELOG.md` (or fetch it from GitHub via MCP if the local repo doesn't exist). Convert the markdown entries to HTML matching the existing format in `changelog.astro`. Update both the `headings` array and the HTML body to reflect all entries from the source. Do NOT include the preamble text ("All notable changes to this project will be documented in this file. The format is based on Keep a Changelog...") — only include the version entries themselves.

## Version

Determine the version automatically:

1. If a `$ARGUMENTS` value is provided, use it as the version (e.g. `/sync-docs 1.1.0`).
2. Otherwise, if the local repo exists at `../git-flow-next`, read the version from its `version.go` file (look for a `Version` constant or variable).
3. Otherwise, fetch `version.go` from the `gittower/git-flow-next` GitHub repo via MCP and extract the version.
4. If none of the above work, ask the user.

## Instructions

1. First, check if `../git-flow-next/docs/` exists locally. If not, use MCP GitHub tools to fetch file contents from `gittower/git-flow-next` repo.
2. Read ALL source documentation files listed above.
3. Read the current website docs (`commands.md`, `configuration.md`).
4. Compare and identify all differences: new commands, new options/flags, changed behavior, new configuration keys, updated hooks/filters.
5. Update `commands.md` with all new content, preserving the web-friendly format.
6. Update `configuration.md` with all new content.
7. Update the version in `Hero.astro`.
8. Sync the changelog in `changelog.astro` from the source `CHANGELOG.md`, converting markdown to HTML. Omit the preamble text.
9. Run `npm run build` to verify no errors.
10. Report a summary of all changes made.

Do NOT commit the changes — leave them staged for the user to review.
