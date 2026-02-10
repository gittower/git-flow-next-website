---
title: 'How git-flow-next Improves Upon git-flow-avh'
pubDate: 2025-08-29
description: 'Discover how git-flow-next modernizes Git Flow with flexible branch dependencies, customizable workflows, and active maintenance for todays development teams.'
author: 'Alexander Rinass'
---

In 2010, Vincent Driessen introduced the world to <a href="https://nvie.com/posts/a-successful-git-branching-model/" target="_blank" rel="noopener noreferrer">Git Flow</a>, a branching model that brought structure and consistency to Git workflows. For many years, the most actively maintained implementation was <a href="https://github.com/petervanderdoes/gitflow-avh" target="_blank" rel="noopener noreferrer">git-flow-avh</a>, a fork that added significant improvements over the original, including better version handling and more configuration options. However, since 2023, even this implementation has been abandoned.

Today, we're proud to announce **git-flow-next** – a modern revival and evolution of the Git Flow branching model that addresses its criticism while preserving its strengths.

## The Legacy of Git Flow

Git Flow's structured approach – with its feature, release, hotfix, and support branches – provided teams with a clear framework for managing their development workflows. Many organizations still rely on modified versions of Git Flow today because:

1. It offers clear guidance for handling features, releases, and hotfixes
2. It scales well for teams working on multiple releases simultaneously
3. It provides helpful CLI commands to simplify complex Git operations

However, criticism mounted over the years:

- **Too Complex**: The multiple branch types seemed excessive for many projects
- **CI/CD Friction**: The model was designed before CI/CD became standard practice
- **Inflexible**: The original implementation was difficult to customize
- **Abandoned**: No active maintenance meant no bug fixes or improvements

## Why We Built Git Flow Next

We believe using some kind of branching model is useful but it needs to be flexible. Different teams have different needs, and a one-size-fits-all approach doesn't work for modern development workflows.

git-flow provides an ideal foundation for extension. The original concepts are sound, but the implementation needed modernization and extensibility to support today's diverse development practices.

## Branch Dependency Model

At its core, git-flow-next is built upon branch dependencies, where we have two distinct types of branches:

1. **Base branches** (long-living): These branches exist throughout the project lifecycle, serving as integration points for various features and releases.
2. **Topic branches** (short-living): These temporary branches are created for specific purposes like feature development or bug fixes.

These two types of branches form parent-child relationships, creating a hierarchy of branches. A branch has a parent (unless it's a root or trunk branch) and can have many children.

Here's an example of git-flow in this model:

```
main
 ├── hotfix/critical-fix
 ├── release/v1.0
 └── develop
      ├── feature/payment-gateway
      │    └── feature/card-processing
      ├── feature/user-authentication
      │    └── feature/two-factor-auth
```

With this model, changes propagate intelligently through the branch hierarchy, ensuring that dependent features stay up-to-date with their parent branches. When a release branch is finished, changes flow back to both `main` and `develop`, maintaining the consistency of your codebase.

Notably, git-flow-avh already implemented this approach by making `develop` dependent on `main` when merging release branches or hotfix branches: instead of merging them separately into `main` and `develop`, they are merged into `main` first and then `main` is merged into `develop`.

## Unified Topic Branch Implementation

We realized that git-flow's `feature`, `hotfix`, and `release` branches could all be unified through a single mechanism based on three simple rules:

- Which branch should this branch be started from?
- Which branch should this branch be merged into?
- Should the branch create a tag when finished?

In git-flow-next, you can create any kind of topic branch that responds to the same start/finish commands, and its exact behaviour is defined by its configuration.

## Customize Your Workflow

This simple yet powerful paradigm offers extreme flexibility and allows teams to define their own branching strategies while maintaining the helpful automation that git-flow provides.

Let's see how git-flow-next enables different workflow configurations:

**Simple GitHub-Style Workflow with Hotfixes**

In this basic scenario, we implement a GitHub-based workflow that also incorporates hotfix branches:

```
main
├── feature
└── hotfix
```

**Typical Web Application Workflow**

For web applications, a common pattern includes a `production` branch with `main` as its child:

```
production
├── hotfix
└── main
    └── feature
```

In this scenario, if you start and finish a `hotfix` branch into `production`, git-flow-next will automatically update the `main` branch with these changes. This prevents the common problem of hotfix changes being deployed to production but missing from your development branch.

**Complex GitLab-Style Workflow**

In a more sophisticated setup, git-flow-next can implement the GitLab workflow with multiple environment branches before changes reach production:

```
production
└── pre-production
    └── staging
        ├── main
        │   └── feature
        └── hotfix
```

## Tower Integration

git-flow-next integrates seamlessly with <a href="https://www.git-tower.com" target="_blank" rel="noopener">Tower</a>, providing a graphical interface for all Git Flow operations. Tower uses the same configuration file as the CLI, ensuring consistency across both interfaces.

## What's Next

We're actively working on several exciting features for future releases:

- **Stacked Branches**: Better support for the increasingly popular stacked PR workflow
- **Sync Branches**: Improve synchronization between branches with intelligent conflict resolution
- **Undo capability**: Safely reverse previous git-flow operations with a simple command

## Get Involved

git-flow-next is an open source project, and we welcome contributions from the community. Visit our <a href="https://github.com/gittower/git-flow-next" target="_blank" rel="noopener noreferrer">GitHub repository</a> to:

- Report bugs or request features
- Contribute code or documentation
- Share your custom workflow configurations
- Join the discussion about future improvements

git-flow-next represents an evolution, not a revolution – preserving what worked well about Git Flow while addressing its shortcomings for modern development practices. Whether you're a long-time Git Flow user looking for active maintenance and new features, or a team seeking a flexible and powerful branch management tool, git-flow-next provides a comprehensive solution.
