# Progress

Last Updated: 2026-06-08

## Current State

Current Objective: Align agent instructions and harness state with Medusa development best practices.

What changed:
- Rewrote `AGENTS.md` to document the Medusa monorepo layout, backend architecture, admin/storefront SDK rules, workflow constraints, data access rules, and verification commands.
- Updated `.harness/init.sh` to resolve the repository root from the harness directory.
- Updated `.harness/feature_list.json` to track the Medusa agent guidance feature.
- Ran `make -C .harness harness`; the harness now starts from `.harness` but stops during storefront lint.

Next: Fix the storefront lint failure or update the lint command, then rerun `make -C .harness harness`.

## Verification Evidence

- Failed: `make -C .harness harness`
- Summary: `npm run lint` runs `turbo lint`, then `@dtc/storefront` runs `next lint` and exits with `NOT SUPPORTED: option missingRefs` and `Cannot set properties of undefined (setting 'defaultMeta')`.

## Blockers

- `@dtc/storefront` lint fails before backend tests or workspace build can run.

## Files

- `AGENTS.md`
- `.harness/init.sh`
- `.harness/feature_list.json`
- `.harness/progress.md`
- `.harness/session-handoff.md`

## Notes

- Active harness state is in `.harness/`.
- Canonical verification command is `make -C .harness harness`.
- Next.js also warns that it inferred the root from `/home/vladislav/Desktop/medusajs-starter/package-lock.json` while `medusa-store/package-lock.json` also exists.
