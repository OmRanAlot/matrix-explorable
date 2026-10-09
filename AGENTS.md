# Repository Guidelines

## Project Structure & Module Organization

This repository is a SvelteKit visual explorable about matrices and linear transformations. Application routes live in `src/routes/`; reusable Svelte components are in `src/components/`, with the matrix visualization grouped under `src/components/matrix/`. Shared stores, actions, utilities, data, shaders, and styles are in their corresponding `src/` subdirectories. Place source assets in `static/`. `docs/` is the generated GitHub Pages output; edit the source in `src/` rather than generated files there.

## Build, Test, and Development Commands

Use Node.js 18.12 or newer. Install dependencies with `npm install` (or use the checked-in lockfile with `npm ci`).

- `npm run dev` starts the local Vite development server.
- `npm run build` creates a production build.
- `npm run preview` serves the built app locally for review.
- `npm run lint` checks formatting with Prettier, including Svelte files.
- `npm run format` applies Prettier formatting.

There is no dedicated automated test script in `package.json`; verify changes with the formatter and a production build, and manually inspect affected interactions in the browser. The `make github` target replaces `docs/`, commits generated output, and pushes to GitHub; use it only when intentionally publishing.

## Coding Style & Naming Conventions

Follow the repository Prettier configuration: tabs, an 80-character print width, no trailing commas, and Tailwind class sorting. Use `.svelte` for components, descriptive PascalCase component filenames (for example, `MatrixInput.svelte`), and camelCase for JavaScript utilities and stores. Keep route files aligned with SvelteKit conventions (`+page.svelte`, `+layout.js`).

## Testing Guidelines

No test framework or coverage threshold is configured. For UI or visualization changes, run `npm run lint` and `npm run build`, then exercise the relevant page and interactions locally with `npm run dev` or `npm run preview`.

## Commit & Pull Request Guidelines

Recent history uses short, sentence-case summaries such as `minor text edit` and `update github pages`; keep commits focused and concise. Pull requests should describe the user-visible change, list validation performed, link related issues when applicable, and include screenshots or a short recording for visual changes.

## Security & Configuration

Do not commit credentials or local environment files. Keep dependency changes reflected in the package lockfile, and avoid editing generated `docs/` bundles by hand.
