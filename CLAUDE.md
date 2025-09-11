# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based static website for git-flow-next, a Git workflow tool. The site features a homepage, documentation section, and blog with content managed through Astro's content collections.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at localhost:4321 |
| `npm run build` | Build production site to ./dist/ |
| `npm run preview` | Preview production build locally |
| `npm run astro` | Run Astro CLI commands |

## Architecture

### Content Collections
- **Blog**: Located in `src/content/blog/` with schema requiring `title`, `pubDate`, `description`, `author`
- **Docs**: Located in `src/content/docs/` with schema requiring `title`, `publishDate`, `description`, `order` (for navigation ordering)

### Layouts
- `Layout.astro`: Base layout with SEO meta tags, analytics (Google Analytics, Fathom), and global styles
- `BlogLayout.astro`: Extended layout for blog posts with table of contents and post navigation
- `DocsLayout.astro`: Extended layout for documentation with table of contents and page navigation

### Dynamic Routes
- `/docs/[...slug].astro`: Generates documentation pages with automatic prev/next navigation based on `order` field
- `/blog/posts/[...slug].astro`: Generates blog post pages with chronological navigation

### Styling
- Uses CSS custom properties for theming (purple/green color scheme on dark background)
- Global styles defined in `Layout.astro` including reset CSS and component styles
- Responsive containers: `.container` (1176px), `.blog-container` and `.docs-container` (800px)

### Site Configuration
- Site URL: `https://git-flow.sh`
- Includes sitemap generation
- Dev toolbar disabled
- Uses Inria Sans font family