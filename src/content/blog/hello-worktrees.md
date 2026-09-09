---
title: 'Hello Worktrees! 👋'
pubDate: 2026-09-09
description: 'git-flow-next 2.1 makes worktrees a first-class part of the workflow, so switching branches means changing directories instead of stashing. Windows binaries are now signed, too.'
author: 'Bruno Brito'
---

Here's the ritual. You're deep in a feature when a bug report lands. So you stash your work, switch branches, wait for your dependencies to reinstall and your build to warm up, fix the bug, switch back, unstash — and spend the next ten minutes remembering what you were doing.

That cost has always been the strongest argument *against* branching workflows like Git Flow. Every branch switch throws away your build cache, your running dev server, and your train of thought.

Git has had a fix for this since 2015: **worktrees**. One repository, many working directories, each with a different branch checked out. The reason almost nobody uses them is that managing them by hand is tedious — you have to invent a directory naming scheme, remember where everything lives, and clean up after yourself.

**git-flow-next 2.1 does that part for you.**

And the timing matters: switching branches has stopped being something only *you* do. If you have coding agents working on two or three features at once, they're all contending for the same single checkout. Worktrees turn that contention into parallelism — more on that below.

Let's dive in! 😎

## 1. Worktrees: A Directory per Branch

The heart of this release, in short:

- **`start --worktree`** — creates the new branch in a directory of its own instead of checking it out, so the checkout you're standing in never moves.
- **`gitflow.worktreePath`** — a template deciding where those directories land. Defaults to a sibling of your repository.
- **`shell-init`** — a shell wrapper that lets git-flow actually move you to the right directory.
- **`checkout`** — navigates to a branch's worktree rather than switching the branch you're on.
- **`list --worktrees`** — which branches have a worktree, where it is, and how much uncommitted work is sitting in it.
- **`finish` and `delete`** — free the worktree along with the branch: removing what git-flow created, leaving what you made by hand intact.
- **`worktree add|remove|list|prune|path`** — manage worktrees directly, addressed by branch name.

The rest of this section takes each of those in turn.

### Start a Branch in Its Own Directory

`start` can now create your branch in its own worktree instead of checking it out. Pass the new `--worktree` flag:

```bash
git flow feature start user-authentication --worktree
```

Your current directory doesn't move, and nothing gets stashed. The new branch is created in a directory of its own, and git-flow tells you where. The branch you were on is still checked out where it always was, still built, still running.

That last part is a deliberate change worth calling out: when `start` creates a worktree, it **no longer checks the new branch out** in your current directory. Git only allows a branch to be checked out in one worktree at a time, so the invocation directory stays exactly where it was. Without a worktree, `start` behaves precisely as it always has.

If you want this as the default for a branch type, set it once and drop the flag:

```bash
git config gitflow.branch.feature.worktree true
```

<figure>
  <video src="/blog/hello-worktrees/01-start-worktree.mp4" width="1120" height="320" autoplay loop muted playsinline preload="metadata" aria-label="Terminal recording: git flow feature start creating a branch in its own worktree with no flag, because the branch type defaults to one"></video>
  <figcaption>With the default set, <code>start</code> needs no flag: the branch gets its own directory, and the checkout you are standing in never moves.</figcaption>
</figure>

You can still opt out per command with `--no-worktree`, or send a single branch somewhere specific with `--worktree-path ../review-copy`.

### Where Worktrees Go

By default, worktrees land in a sibling directory of your repository:

```
../<repo>-worktrees/<branch>
```

So `feature/user-auth` in a repo called `my-project` ends up at `../my-project-worktrees/feature/user-auth`. Sibling rather than nested, so your worktrees never show up in your own repository's file watcher or search results.

If that doesn't suit you, `gitflow.worktreePath` is a template:

```bash
# One directory per topic type, under your home directory
git config gitflow.worktreePath '~/worktrees/{{ topicType }}/{{ branchName }}'

# A global default for every repository
git config --global gitflow.worktreePath '~/worktrees/{{ repo }}/{{ branch }}'
```

Want to know where a branch would go without creating anything?

```bash
git flow worktree path feature/user-auth
```

### Getting Your Shell to Follow

Here's a problem we had to solve, and the solution is my favorite part of this release.

git-flow runs as a subprocess. A subprocess **cannot** change the working directory of the shell that started it — that's an OS-level guarantee, not an oversight. So a tool that creates a directory for you can tell you where it is, but it can't take you there.

The fix is a small shell wrapper, which git-flow now prints for you:

```bash
# Bash
echo 'eval "$(git flow shell-init bash)"' >> ~/.bashrc

# Zsh
echo 'eval "$(git flow shell-init zsh)"' >> ~/.zshrc

# Fish
echo 'git flow shell-init fish | source' >> ~/.config/fish/config.fish
```


<figure>
  <video src="/blog/hello-worktrees/02-shell-init-checkout.mp4" width="1120" height="360" autoplay loop muted playsinline preload="metadata" aria-label="Terminal recording: shell-init makes git flow checkout change the shell's directory"></video>
  <figcaption>With the wrapper installed, <code>checkout</code> moves the shell itself — watch the prompt change from <code>myapp</code> to <code>payment-webhooks</code>.</figcaption>
</figure>

With that in place, commands that navigate somewhere actually take you there. The wrapper covers **both** the `git-flow` and `git flow` spellings, so the documented form works too.

Prefer to stay put? `--no-cd` suppresses the navigation for one command, and `--quiet` silences the tip that points at `shell-init`.

### Checkout Navigates Instead of Switching

Once a branch has a worktree, switching to it isn't a checkout anymore — it's a change of directory. So that's what `checkout` does:

```bash
git flow feature checkout user-auth
```

When the branch has a worktree, this reports its path and hands it to your shell rather than switching your current directory's branch. When it doesn't, it behaves exactly as before. Add `--worktree` to create one on the spot if it's missing.

### Seeing What You Have

Worktrees are easy to lose track of, so `list` grew a column:

```bash
$ git flow feature list --worktrees
Feature branches:
  api-v2     ../review-copy [3] (unmanaged)
  docs       -
  user-auth  ../my-project-worktrees/feature/user-auth
```

Reading that, row by row:

- **`api-v2`** — lives in a worktree git-flow didn't create, marked `(unmanaged)`, because you made it yourself with plain `git worktree add`. The `[3]` says it has **3 uncommitted changes** sitting in it.
- **`docs`** — the `-` means no linked worktree at all.
- **`user-auth`** — a clean worktree at the path the template computed.


<figure>
  <video src="/blog/hello-worktrees/03-list-worktrees.mp4" width="1120" height="280" autoplay loop muted playsinline preload="metadata" aria-label="Terminal recording: git flow feature list --worktrees showing four branches"></video>
  <figcaption>Four features in flight, each in its own directory. The <code>[1]</code> marks the one with uncommitted work.</figcaption>
</figure>

There's also a full `worktree` command group for managing them directly by branch name — `add`, `remove`, `list`, `prune`, and `path`.

### Cleanup That Doesn't Eat Your Work

This is where a worktree feature either earns your trust or loses it, so we were deliberate.

Git refuses to delete a branch that's still checked out somewhere. Previously that meant `finish` and `delete` would either fail outright or leave a stale directory behind. Now they free the branch's worktree as part of deleting the branch — and **how** they free it depends on who created it:

- A worktree **git-flow created** is removed.
- A worktree **you created by hand** with `git worktree add` is kept. Its HEAD is detached from the branch instead, so the directory and every file in it — including uncommitted work — survive completely untouched.

git-flow knows which is which because it records the worktrees it creates, rather than guessing from where they sit on disk.

On top of that, both commands **refuse up front, before any destructive step**, if the worktree has a merge, rebase, bisect, cherry-pick, or revert in progress. Two flags cover the rest: `--keep-worktree` routes even a git-flow-created worktree through the detach path, and `--force-worktree` (`-W`) allows removing one with uncommitted changes.

And if you run `finish` from *inside* the worktree being freed — which you will, eventually — git-flow redirects the operation to the parent branch's worktree first, so the directory you're standing in is left alone until the free step, and then tells your shell where you've ended up.


<figure>
  <video src="/blog/hello-worktrees/05-finish-cleanup.mp4" width="1120" height="540" autoplay loop muted playsinline preload="metadata" aria-label="Terminal recording: git flow feature finish merging a branch and removing its worktree"></video>
  <figcaption><code>finish</code> merges the branch, removes the worktree it created, and the listing comes back one shorter.</figcaption>
</figure>

### The Whole Flow, End to End

Putting the pieces together. Say your repository is cloned at `~/dev/myapp`:

```bash
# One-time setup: feature branches always get their own worktree
git config gitflow.branch.feature.worktree true

# Start a feature. Your current checkout does not move.
git flow feature start login
# → feature/login created in ~/dev/myapp-worktrees/feature/login

# Go work on it — your main checkout is still sitting on main, untouched
cd ../myapp-worktrees/feature/login
# ...edit, commit...

# Finish from anywhere. git-flow merges it and cleans up
# the worktree it created.
git flow feature finish login
```

With `shell-init` installed, that `cd` is unnecessary — `start` takes you there.

And if you'd rather not set the config, every step works per-invocation instead: `git flow feature start login --worktree`. Meanwhile `git flow worktree list` and `git flow worktree path feature/login` answer "what do I have" and "where would this go" at any point.

## 2. Why This Matters for Parallel (and Agentic) Work

When we shipped 1.0, we wrote that worktree support would make it "incredibly easy to use your repository in agentic workflows where you need to work on multiple features simultaneously." This is that release, so it's worth being concrete about why worktrees are the right primitive here.

A single checkout is a **shared mutable resource**. Two things working in one repository have to take turns: one switches the branch, the other's build is invalidated, and anything that runs a test suite is racing against whatever else touched the tree. That's a mild annoyance for one developer juggling two tasks. It's a hard blocker for three coding agents working in parallel, which is exactly the situation more and more of us are now in.

Worktrees remove the contention rather than coordinating it. Each branch gets its own directory, its own build artifacts, its own dependency install, its own running test process. Nothing has to take turns, because nothing is shared.


<figure>
  <video src="/blog/hello-worktrees/04-parallel-worktrees.mp4" width="1120" height="260" autoplay loop muted playsinline preload="metadata" aria-label="Terminal recording: four feature worktrees as separate directories on disk"></video>
  <figcaption>Four branches, four real directories on disk — each with its own build, its own dependencies, its own test run.</figcaption>
</figure>

What 2.1 adds is that you no longer have to manage any of it by hand:

- **Isolation is the default.** With `gitflow.branch.feature.worktree true`, anything that runs `git flow feature start <name>` — you, a script, or an agent — gets an isolated directory without knowing worktrees exist. There's no path convention to teach and no cleanup step to remember.
- **Paths are computed, not invented.** `gitflow.worktreePath` means every branch's directory is derivable from its name. A process that needs to find its own working directory can ask (`git flow worktree path feature/login`) rather than being told.
- **You can see the whole fleet at once.** `git flow feature list --worktrees` shows every branch, where it lives, and how many uncommitted changes are sitting in it — a status board for parallel work, and a quick way to spot the one that's been left dirty.
- **Concurrent finishes don't collide.** Because merge state is kept per-worktree, two branches can be mid-finish in two directories at the same time without stepping on each other.
- **Cleanup is bounded.** `finish` removes the worktree git-flow created, and leaves anything you made by hand alone — detached, with its files intact. An automated flow can clean up after itself without any risk of deleting a directory a human was using.

It isn't free, though: worktrees cost disk space, and every one of them needs its own dependency install. Three parallel features means three `node_modules`. That's usually a very good trade against three interrupted builds, but it is a trade.

## 3. Windows Binaries Are Now Signed

If you're on Windows, this is likely the most immediately visible change in the release — even though it has nothing to do with worktrees.

Until now, `git-flow.exe` was published unsigned, which meant SmartScreen warned about it on every single download. As of 2.1, the release workflow signs all three Windows executables — **amd64, 386, and arm64** — with Azure Artifact Signing, authenticated through GitHub Actions OIDC rather than long-lived secrets.

The part that matters for trust: **signature verification gates the release job**. Every expected signature is checked before packaging, so a signing misconfiguration fails the build instead of quietly publishing unsigned binaries. The checksums we publish describe those final, signed artifacts.

## 4. Other Improvements and Fixes

- **`finish --ff-only` refuses to finish unless the merge can fast-forward.** `--ff` asks *how* to merge — try a fast-forward, fall back to a merge commit — and merges either way. `--ff-only` (also `gitflow.<type>.finish.ff-only`) asks *whether* to merge at all: if the parent has gained any commit your branch doesn't have, finish stops before touching a single branch, tag or file, and tells you. Nothing is left half-done, and what lands on the parent is exactly the tip you tested.
- **`finish` now leaves you on the integration branch.** Finishing a `release` or `hotfix` used to drop you on `main` instead of `develop`, unlike git-flow-avh — even under `--keep`, where nothing is deleted and the checkout served no purpose. The branch is derived from your configured topology rather than a hardcoded name, so it works with custom branch names, and finish now reports where it left you.
- **Deterministic output.** `finish`, `overview`, and `config list` all built their lists by ranging over a Go map, so the order of child-branch updates, the reported branch lists, and even the conflict-resume order varied between identical runs. Everything is sorted now.
- **`config list` no longer invents branch types.** Every started topic branch records a runtime config key, which the parser turned into a type with no parent, start point, or prefix. It lists the configured topic branch types only.
- **Shorthand `git flow finish` honors its messages.** It accepted `--merge-message` and `--update-message` and then built its merge strategy without them, silently ignoring both.
- **Zsh completion for `git flow <type> ...`** tried to invoke a nonexistent `flow` command; the dispatcher now gets the same fixup already applied to the bash and fish bridges.
- **Windows path comparison** ignores case, where two spellings of one location differing only in case were treated as different paths — which meant the guards against removing the main worktree could fail to fire.
- **Faster `worktree list`,** reading provenance in one bulked lookup instead of one `git config` call per row.
- **Honest manpages.** The `checkout` and `list` manpages documented arguments, markers and exit codes the commands have never had. They now describe what the commands actually do.

## What's Next: Making git-flow Agent-Ready

Worktrees solve the *isolation* half of the parallel-work problem: several branches can be worked on side by side without colliding. The other half is **discovery** — an agent driving git-flow still has no reliable way to find out how *your* repository is actually set up. That's what the next release goes after.

The insight driving this is that **your branch model is per-repo configuration**, not a fixed diagram. Any instructions that hardcode "features branch off develop, releases merge to main" are wrong the moment a team customizes their setup — which git-flow-next explicitly encourages. An agent shouldn't be taught the model; it should be able to *ask*.

Three pieces are specced out: structured `--json` output for `overview`, `list` and `config list`; a paste-in agent guide; and a `finish --dry-run` that previews the whole operation before it changes anything.

One deliberate non-goal: **we're not building an MCP server.** A well-behaved CLI with structured output and stable exit codes already *is* a good agent interface, and git-flow-next has had stable custom exit codes for a while now. Wrapping that in a server would be maintenance overhead for very little gain.

You can follow the whole epic on <a href="https://github.com/gittower/git-flow-next/issues/166" target="_blank" rel="noopener noreferrer">GitHub</a> — and if you're already pointing agents at git-flow, we'd genuinely like to hear what's missing!

## Try git-flow-next 2.1

**Version 2.1.0 is out now.** On a Mac, Homebrew is the quickest route:

```bash
brew install git-flow-next
# already installed?
brew upgrade git-flow-next
```

Everywhere else, grab the latest binary from the <a href="https://github.com/gittower/git-flow-next/releases" target="_blank" rel="noopener noreferrer">Releases page</a>.

For the complete list of changes, see the [changelog](/changelog). If you run into anything, <a href="https://github.com/gittower/git-flow-next/issues" target="_blank" rel="noopener noreferrer">open an issue</a> — we'd love to hear how this fits into your workflow.

We hope you enjoy this release! Happy committing!
