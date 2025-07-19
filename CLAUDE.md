# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

This is a static website project with no package.json or build commands. Development uses VS Code with specific extensions:

- **Minify extension**: Auto-minifies JavaScript on save (configured in .vscode/settings.json)
- **Easy LESS extension**: Compiles LESS to CSS automatically 
- **Live Server extension**: Provides local development server

The VS Code settings automatically compress LESS compilation and minify existing files on save.

## Architecture

**Static website structure:**
- `index.html` - Single page application with tabbed interface (Map/Countries/Films/About)
- `js/script.js` - Main application logic (unminified), `js/script.min.js` (minified version)
- `css/styles.less` - LESS source, compiles to `css/styles.css`
- `data/films.json` - Film data with country codes, titles, years, and external links

**Key JavaScript patterns:**
- jQuery-based initialization in `$(function() { ... })`
- Global state stored in module-level variables (`_films`, `_filmsSortedByCountry`, `_filmsSortedByTitle`)
- Event-driven UI with tab switching and modal dialogs
- jVectorMap for interactive world map visualization
- Bootstrap modal for film details

**Data structure:**
Films JSON contains objects with properties: `countryCode`, `country`, `title`, `year`, `originalTitle`, `image`, `letterboxd`, `imdb`, `justwatch`, `wikipedia`, `trailer`, `rottenTomatoes`, `reviewer`, `review`

**Styling:**
- LESS variables for colors, fonts, dimensions defined at top of styles.less
- Bootstrap 4.6.2 framework
- Custom styling for map, film lists, and modal dialogs

## Deployment

Hosted on Netlify with configuration in `netlify.toml` that handles CSS/JS bundling and minification during deployment.

## CSS Guidelines

- Never use !important in CSS