---
title: 'How We Shipped git-flow-next 1.0 Almost Entirely with AI'
pubDate: 2026-05-28
description: 'The honest 13-month journey of building git-flow-next with AI — what worked, what failed, and why the guidelines turned out to be the real product.'
author: 'Alexander Rinass'
---

In [our 1.0 announcement](/blog/posts/announcing-git-flow-next-1-0), we mentioned that git-flow-next has also been an experiment "to see how far we could push today's AI capabilities on an open-source project of this scope."

We promised more on that journey in a future post. This is it.

First, here are some numbers:  
- 13 months  
- 10 releases  
- 14 Claude Code skills  
- 8 guideline documents
- Approximately 392 commits
- Approximately 29,000 lines of Go code
 
Most of the code was written by AI. While I am an experienced developer with a background in Test-Driven Development (TDD), I am not yet proficient in Go. Therefore, I provided the architecture, specifications, and guidance; the AI was the hands on the keyboard.

If you're in a hurry and are just looking for the tl;dr, here is the one lesson I'd carry to the next project: **AI development isn't "telling AI what to build." It's "building the system that tells AI what to build."**

The code is the output. The guidelines, skills, review criteria, and architectural docs are the actual product.

This is how we got there.

## Phase 1: Vibe Coding with Cursor (March 2025)

The first phase was all about getting my feet wet: minimal instructions, all in one file, just to explore what AI could accomplish.

The pace was remarkable. In about two weeks, Cursor produced all of git-flow-next's core commands — `start`, `finish`, `list`, `overview`, `update`, `delete`, `rename`, `checkout` — at roughly one new command every day or two.

The pace was also misleading.

Up close, the project wasn't really a project. It was a collection of individually-generated files that happened to share a directory. There was no clear separation between the CLI layer, business logic, and Git operations — every command did things its own way. Patterns were duplicated across files in slightly different shapes, often subtly enough that asking AI to find duplicates would surface one and quietly miss the others. Git configuration was loaded on every operation instead of once at startup — performance regressions by design, not by accident.

I tried to refactor my way out of it. With Cursor, with Claude, with detailed instructions. It didn't work. Functions were duplicated, code didn't compile, proposed refactorings were over-engineered with the wrong abstractions. 

I even tried full rewrites from scratch. Those failed, too.

What eventually worked was the opposite of speed: tiny incremental steps. Create empty command files first. Add one piece of logic. Run the tests. Move on. And more importantly, I realized I had to define a development philosophy myself — explicitly, in writing — before AI could help me clean anything up. 

You can't evaluate an AI's proposal if you don't already know what you want. That was the first time I understood the shape of the real problem.

## Phase 2: Building the System (May–August 2025)

On day one with Claude Code, I let it analyze the project and write a `CLAUDE.md` file. It got some things wrong — inconsistent config keys, for one — but accuracy wasn't really the point. 

The point was to give AI a place to start understanding the project before writing code.

That set off a pattern. Every time AI failed in a recognizable way, the answer was a new guideline. Over a few months, eight of them accumulated:

1. **`CLAUDE.md`** — The entry point for any AI agent working on this codebase. Project overview, build and test commands, where things live. Without it, every session starts from zero.
2. **`CODING_GUIDELINES.md`** — A pragmatic, anti-over-engineering philosophy, plus a hard rule that the manpages in `docs/` must be updated whenever a command or its behavior changes. Documentation stays current because the guideline says it must.
3. **`TESTING_GUIDELINES.md`** — Test naming conventions and a mandatory comment pattern — description, numbered steps, expected outcomes — so every test is self-explanatory at a glance.
4. **`GIT_TEST_SCENARIOS.md`** — Patterns for spinning up temporary Git repos, producing merge and rebase conflicts on demand, wiring up local remotes, and verifying Git state. The doc that finally made test scaffolding boring.
5. **`COMMIT_GUIDELINES.md`** — Conventional commit format with scopes, 50-character subject lines, imperative mood, and bodies hard-wrapped at 72 — explaining the "what" and the "why," never the "how."
6. **`ARCHITECTURE.md`** — The map of the project: what `cmd/` owns versus `internal/`, the three-layer command pattern, and where each piece of business logic lives.
7. **`CONFIGURATION.md`** — The complete config reference, including the three-level precedence rule (branch type definitions → command-specific config → CLI flags) and which keys belong at which layer.
8. **`DEV_WORKFLOW.md`** — The structured issue-to-PR workflow that ties everything together: issue → planning artifacts in `.ai/` → implementation → review → PR. The doc the skill system ultimately encodes.

All of these documents can be analyzed in full by visiting <a href="https://github.com/gittower/git-flow-next/" target="_blank">our open-source repository</a>, of course!

The single most important one turned out to be `GIT_TEST_SCENARIOS.md`. Setting up Git test scenarios — merge conflicts, remotes, multi-step operations — is exactly the kind of thing AI consistently gets subtly wrong. Without explicit guidance, every test-writing session devolved into debugging broken setups. 

With the guideline in place, test scaffolding became boring, which is what test scaffolding should be.

The architectural rules that mattered most were the ones AI kept violating:

- A three-layer command pattern: Cobra handler → command wrapper → execute function
- All Git operations go through `internal/git/repo.go` — never direct `exec.Command`
- Configuration precedence: branch type defaults → git config → CLI flags
- Custom error types with specific exit codes and contextual messages

A few anecdotes from this period stick with me:

- I asked AI to create a config resolver. Despite the guideline saying load config once and pass it through, it called a Git command for every individual option. After I corrected that, it created a duplicate `TagOptions` struct, then left a helper function in the wrong file. Each session introduced a new variant of the same problem.
- I once asked both Opus and Sonnet to detect the same bug. Only Opus found it.
- A recurring failure mode: commands not executed in the right directory. I'd fix it once, and it would crop up again later in different code.
- Sonnet 3.7, when it came out, worked *worse* than its predecessor on this codebase. Model upgrades aren't strictly monotonic.

None of those are individually surprising. **The pattern they form is: AI doesn't learn within a session, and it certainly doesn't learn across sessions. "Learning" is documentation engineering.**

## Phase 3: The Turning Point (September 2025)

40+ commits in a single week. Looking at the log from that month, it's a mix of new features (comprehensive merge strategy control for `finish`), new tests (around 8,000 lines for the `finish` command alone), and new guidelines (testing, Git operations, even one specifically telling AI not to add AI attribution in commit messages). Documentation and code were evolving together. Each new guideline prevented a class of future mistakes. We shipped `v0.1.0` at the end of it.

Here's the part that's easy to miss: guidelines compound. **Every guideline you write pays off in every future session for the lifetime of the project.** The vibe-coding phase had no compounding — every command Cursor wrote was a fresh start. By September, every session began with three months of accumulated context already loaded.

## Phase 4: The Models Catch Up (October–November 2025)

The November model updates were the second turning point, and not quite for the reason you'd expect. The models didn't necessarily get much better at *producing* code. They got dramatically better at *understanding existing code* and at agentic behavior — exploring a codebase, finding relevant context, connecting pieces across files.

For a project with accumulated guidelines, this mattered enormously. The agent could now actually read and internalize the conventions before writing code, rather than generating in the dark. Thinking models like Opus were much better at breaking down complex tasks. The work I'd done building the system started paying out at a different scale.

A lot of the friction from early 2025 — refactors that needed multiple attempts, tests that wouldn't run — would probably work first try today. Some of the difficulty back then was real complexity. Some of it was just that the models weren't quite there yet.

## Phase 5: Filling Out the Workflow (December 2025–January 2026)

With the system stable, feature work got easier. We added the hooks system, the `publish` and `track` commands, squash messages, and shipped `v0.2.0` and `v0.3.0`. 

New features landed more consistently — the guidelines were doing their job.

## Phase 6: v1.0.0 and the Skill System (February 2026)

We shipped 1.0 in February. Alongside it, we built 14 Claude Code skills covering the full development lifecycle:

| Skill | What it does |
|-------|--------------|
| `/gh-issue` | Creates a GitHub issue following project guidelines |
| `/analyze-issue` | Reads a GitHub issue, explores codebase, writes analysis to `.ai/` |
| `/create-plan` | Generates an implementation plan from the analysis |
| `/validate-tests` | Validates the test approach before implementing |
| `/implement` | Executes the plan, makes changes, commits per guidelines |
| `/commit` | Creates well-formatted commits per guidelines |
| `/pr-summary` | Generates a PR summary and writes it to `.ai/` |
| `/code-review` | Reviews changes against all project guidelines |
| `/pr-review` | Creates a GitHub PR review, with preview before posting |
| `/post-review` | Posts review to GitHub as a PR review with inline comments |
| `/plan-from-review` | Converts review feedback into an implementation plan |
| `/address-review` | Triages PR review comments and fixes valid ones |
| `/resolve-issue` | End-to-end: analyze → plan → branch → implement → PR |
| `/release` | Updates changelog, bumps version, tags release |

Of these, `/resolve-issue` is the crown jewel. It spawns sequential subagents for each phase of the workflow: a GitHub issue goes in, and a ready-to-review PR comes out. This is where the guideline system stops being a set of documents and becomes an executable pipeline.

It's also the moment the thesis finally cashed out. A year of accumulated guidelines, encoded as skills, became a single command.

## Phase 7: What AI Code Review Actually Looks Like (February–April 2026)

Getting Claude to review pull requests well was surprisingly hard. A lot of teams just let AI spam the PR. We wanted something thorough and well-targeted, with a clean, stable summary format.

A few problems showed up immediately:

- **Inconsistency.** Re-running the exact same review on the exact same diff gave three very different reviews. Different findings, different severity, different conclusions.
- **Format drift.** The model wouldn't stick to the specified output format. Extra sections appeared, heading styles changed.
- **Noise.** Early versions flagged everything — style nits alongside actual bugs.

What eventually worked:

- A review criteria doc referencing specific guideline files
- An explicit output format spec
- Severity levels to separate critical issues from nice-to-haves
- Six clearly defined review areas: test coverage, coding guidelines, code quality, security, documentation, commit messages
- Treating the review as a useful signal, not an authoritative verdict

We also added `.github/instructions/` — Copilot review instructions scoped to file patterns (commands, tests, internal packages). The point is to give AI reviewers specific context per file type, rather than a single generic prompt.

We shipped `v1.1.0` in April with those refinements.

## The Workflow Today

For a typical feature or fix, the workflow is:

1. An issue gets created on GitHub (sometimes by AI, from my notes).
2. `/resolve-issue 42` kicks off the pipeline.
3. A subagent analyzes the issue, explores the codebase, writes notes to `.ai/`.
4. Another creates a feature branch — using git-flow-next itself.
5. Another generates an implementation plan with specific file paths.
6. Another implements, runs tests, and commits per guidelines.
7. A PR is opened with a structured summary.
8. Automated review checks the changes against the project guidelines.
9. I review the result and leave comments if needed.
10. `/address-review` triages and fixes valid comments.

Most of my time goes into maintaining the guidelines and reviewing the output — not writing code.

## What the Role Actually Became

As mentioned in the intro, I came at this from a TDD background, where the code is already a kind of black box: you define the spec, you define the tests that verify the behavior, you make the tests pass. 

I found that **AI-driven development is the same loop with a different actor making the tests pass.**

The practical shift, then, isn't really about not writing code. It's about where you spend your attention:

- Defining the spec
- Reviewing the plan before any implementation begins
- Iterating on the plan until I get the feeling that the model "gets" it
- Reviewing the result
- Updating the guidelines when something goes wrong in a way that will repeat

For complex areas — the `finish` command's state machine, the merge state system — I stay close to the planning, review every proposal carefully, and make judgment calls the model can't. The more complex the area, the tighter the involvement. That hasn't gone away, and probably won't.

## What's Still Hard

I want to be honest about the parts that aren't solved:

- **Complex areas still need humans.** The 1,000-line state machine in `finish` is a good example. AI couldn't hold the full mental model — each session would nail one aspect while subtly breaking another.
- **Cross-session amnesia.** AI doesn't remember across sessions, and it often forgets within a single conversation. Everything load-bearing has to live in a file.
- **Architecture decisions need humans.** AI implements patterns. It doesn't decide which patterns to use. It once flagged an intentional design decision as a bug during a review.
- **Sometimes it's just faster to do it yourself.** AI occasionally fails at trivially simple things that would take you 30 seconds.
- **AI review is not a verdict.** Three runs, three different results. It's a useful signal, but you can't outsource judgment to it.

**None of these are reasons to stop. They're reasons to know what you're signing up for.**

## The Real Product

Thirteen months in one paragraph: the code is the output. The guidelines, the skills, the review criteria, the architectural docs — those are the actual product. Building software with AI is building the system that builds the software. That's where the time goes, and that's where the leverage comes from.

git-flow-next is in production. The pipeline that produced it is too. We'll keep refining both — and there are a few interesting things planned that the workflow itself made possible. More on those soon.
