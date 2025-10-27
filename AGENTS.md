# Repository Guidelines

## Project Structure & Module Organization
CitrusVer is a zero-dependency Node.js CLI. Entry points live in `bin/` (`citrusver.js` plus the semver helpers) and proxy to `lib/version-bump.js`, which orchestrates changelog generation, registry checks, branch protection, and plugin loading. Supporting modules reside in `lib/commands`, `lib/utils`, and `lib/plugins`. Release templates and conventional commit prompts sit in `templates/conventional.json`. Keep sample configs or scripted demos in `examples/`, and place new documentation alongside `README.md` or focused guides (e.g., `CLAUDE.md`).

## Build, Test, and Development Commands
Run `npm install` once to pull dev-only tooling; the CLI itself ships without dependencies. Use `node bin/citrusver.js --help` to verify banner updates or interactive flows without altering versions. The shortcuts `npm run version:patch|minor|major` call the corresponding `bin/citrusver-*.js` wrappers for non-interactive smoke checks. `npm test` currently echoes “No tests yet”; keep it green by extending the script only after adding real specs. Use `npm run prepublishOnly` before publishing to confirm messaging and ensure git status is clean.

## Coding Style & Naming Conventions
Follow the existing CommonJS, Node ≥14 style: two-space indentation, single quotes, trailing semicolons, and destructured imports up top. Prefer `const`/`let`, guard all filesystem reads, and keep ASCII art/text accents centralized in `lib/ascii-art.js`. Classes follow `NounManager` or `Generator` patterns (see `MonorepoManager`, `ChangelogGenerator`). CLI filenames mirror their semantic scope (`citrusver-major.js`, etc.). Avoid new runtime dependencies unless absolutely necessary; reach for standard library modules first.

## Testing Guidelines
Until an automated harness lands, pair every change with reproducible manual steps and, when possible, a scripted scenario inside `examples/` (e.g., mock repo plus `.citrusver.json`). If you introduce tests, place them under a new `tests/` directory, name files `*.spec.js`, and wire the runner through `npm test` so CI stays a single command. Aim for coverage of version strategy branches, plugin hooks, and rollback flows.

## Commit & Pull Request Guidelines
The history follows Conventional Commits (`feat:`, `fix:`, etc.). Keep subject lines ≤72 characters and summarize scope plainly (e.g., `feat: display version number in help header`). In pull requests, include purpose, notable CLI flags touched, manual verification notes, and screenshots for ASCII/UX tweaks. Link related issues and call out breaking changes or required config migrations near the top.

## Configuration & Release Safety
Document any `.citrusver.json` additions in your PR and provide sane defaults so the CLI remains zero-config. Double-check branch protection or rollback modules when touching git logic—use dry runs (`node bin/citrusver.js --dry-run`) before tagging. Never commit secrets; mocked registry tokens belong in `.env.example` if needed.
Keep git tags, `package.json` version, and the published npm dist in lockstep—publish immediately after tagging so npm and GitHub always reflect the same release number.
