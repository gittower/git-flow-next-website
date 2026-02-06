---
title: 'Announcing git-flow-next 1.0: Compatibility, Flexibility, and What''s Coming Next'
pubDate: 2026-02-03
description: 'git-flow-next 1.0 is here with full git-flow and git-flow-avh compatibility, customizable branch configuration, seamless migration, and an exciting roadmap ahead.'
author: 'Alexander Rinass'
---

We're thrilled to announce the official 1.0 release of git-flow-next! This milestone marks a stable, production-ready foundation for modern Git workflow management. Whether you're migrating from an existing git-flow setup or starting fresh, git-flow-next is designed to meet you where you are.

## Full Compatibility with git-flow and git-flow-avh

git-flow-next is fully compatible with both the original <a href="https://github.com/nvie/gitflow" target="_blank" rel="noopener noreferrer">git-flow</a> and <a href="https://github.com/petervanderdoes/gitflow-avh" target="_blank" rel="noopener noreferrer">git-flow-avh</a> implementations. If you've been using either of these tools, you can switch to git-flow-next without disrupting your existing workflow.

However, it's worth noting an important improvement that git-flow-avh introduced to the release flow. The original git-flow implementation merged release branches into `main` and `develop` *separately*, which led to some well-documented issues:

1. **Fragmented history**: You end up with two completely separate histories that can be difficult to reconcile
2. **Potential sync issues**: Separate merges increase the risk of inconsistencies between branches

git-flow-avh solved this by changing the merge order: release branches are first merged into `main`, and then `main` is merged into `develop`. This approach aligns perfectly with our philosophy of branch dependencies, where dependent branches should always be merged in order. In this case, that means `release → main → develop`.

For a deeper dive into these differences, check out our post on [How git-flow-avh Improves Upon git-flow](/blog/posts/how-git-flow-avh-improves-upon-git-flow).

## Fully Customizable Branch Configuration

One of the most powerful features of git-flow-next is its complete flexibility when it comes to branch configuration. You're not locked into the traditional git-flow structure—you can configure git-flow-next to match whatever workflow suits your team best.

Want to use just `main` and feature branches? You absolutely can:

```
main
└── feature
```

This simple setup is perfect for teams practicing a GitHub Flow-style workflow, where you don't need the overhead of separate `develop`, `release`, or `hotfix` branches.

To learn more about customizing your workflow, read [How git-flow-next Improves Upon git-flow-avh](/blog/posts/how-git-flow-next-improves-upon-git-flow-avh), or see our documentation for the [GitHub Flow workflow](/workflows/github-flow).

## Seamless Migration from Legacy Configurations

If you're already using git-flow or git-flow-avh, git-flow-next will work seamlessly with your existing configuration. No changes required—just install and go.

When you're ready to take advantage of git-flow-next's customization features, migration happens automatically. Simply run `git flow init` or make changes using the `git flow config` command, and your configuration will be updated to the new format.

Best of all, your old configuration remains in place, so you can switch back at any time if needed.

## What's Next After 1.0

With 1.0 out the door, we're already looking ahead. Here are some exciting features on our roadmap.

### 1. Automatic Worktree Support for Topic Branches

We're planning to add automatic worktree support to topic branches. This will make it incredibly easy to use your repository in agentic workflows where you need to work on multiple features simultaneously.

The workflow will look something like this:

1. Create a feature branch along with its dedicated worktree
2. Work on your feature in isolation
3. When you finish the branch, both the branch and the worktree are cleaned up automatically

This is especially useful for AI-assisted development workflows where you might spawn multiple agents working on different features in parallel.

Want to follow along or contribute to the discussion? Check out <a href="https://github.com/gittower/git-flow-next/discussions/45" target="_blank" rel="noopener noreferrer">the GitHub discussion</a>.

### 2. Pull Request Integration

We're also working on tighter integration with your favorite Git hosting services through pull requests. Instead of finishing a branch locally with `git flow finish`, you'll be able to:

- **Submit a PR first**: Create a pull request and monitor its status before finishing
- **Finish when ready**: Complete the branch once the PR has been reviewed and approved
- **Automatic cleanup**: If a branch was merged remotely (e.g., through GitHub's merge button), git-flow-next will detect this and allow you to clean up the local branch automatically

This bridges the gap between git-flow's local workflow and the PR-centric workflows that most teams use today.

Follow the progress on <a href="https://github.com/gittower/git-flow-next/discussions/43" target="_blank" rel="noopener noreferrer">GitHub</a>.

## A Note on How We Built This

git-flow-next has also been an experiment for us: we wanted to see how far we could push today's AI capabilities to develop and maintain an open source project of this scope. It wasn't always smooth sailing, but we've reached a point where we can maintain the project and even add substantial new features with minimal effort.

We'll have more to share about this journey in a future post—stay tuned!

## Get Involved

git-flow-next 1.0 is ready for production use, and we'd love for you to try it out. Visit our <a href="https://github.com/gittower/git-flow-next" target="_blank" rel="noopener noreferrer">GitHub repository</a> to get started, report bugs, request features, or join the conversation about the future of git-flow-next.
