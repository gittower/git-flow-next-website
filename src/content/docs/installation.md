---
title: "Quick Start"
description: "Step-by-step instructions on how to install and use git-flow-next on your machine."
publishDate: 2025-04-09
order: 2
---

## Installation

Installing git-flow-next is a straight-forward process. We currently provide you with the option to use Homebrew (Mac only) or via downloading the latest release from our releases page.

### 1. Homebrew (Mac only)

Assuming you already have <a href="https://brew.sh/" target="_blank" rel="noreferrer noopener">Homebrew</a> installed, you can install git-flow-next with the following commands:

```bash

brew tap gittower/git-flow-next
brew install git-flow-next
```

This is the recommended way if you are on a Mac.

### 2. Manual Installation

1. First, download the latest release from our project's <a href="https://github.com/gittower/git-flow-next/releases" target="_blank" rel="noopener noreferrer">Releases page</a>
2. Extract the binary to a location in your PATH, such as `/usr/local/bin/`
3. Make it executable by typing `chmod +x /path/to/git-flow`

## Quick Start

1. Initialize git-flow in your repository:

```bash
git flow init
```

2. Start a new feature:

```bash
git flow feature start my-feature
```

3. Finish the feature:

```bash
git flow feature finish my-feature
```

At any point, use the `--help` flag to access the entire list of commands available at your disposal.

```bash
git-flow-next --help
```

[Visit this page for the entire list of available commands.](/docs/commands)
