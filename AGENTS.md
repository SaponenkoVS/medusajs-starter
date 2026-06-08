# Agent Instructions

## Startup Workflow

1. Read `feature_list.json`, `progress.md`, and the relevant spec before coding.
2. Pick one active feature at a time and confirm its `status`, `dependencies`, and done criteria.
3. Inspect only the files needed for that feature before editing.

## Working Rules

- One feature at a time.
- Stay in scope: implement only requirements from the relevant spec and selected feature.
- Preserve user changes. Do not revert or overwrite unrelated work.
- Keep verification evidence in `progress.md`.
- Keep feature status and dependencies current in `feature_list.json`.

## Verification Commands

- Run `make harness` before claiming work is done.
- `make harness` runs `./init.sh`, which performs the project verification checks.

## Definition of Done

A task is done only when the scoped requirement is implemented, `make harness` passes, `progress.md` records the command and output summary, and `feature_list.json` reflects the final status. Never mark a task complete if verification fails.

## End of Session

Before ending, update `progress.md` and `session-handoff.md` with the current objective, files changed, verification evidence, blockers, and recommended next step so the next session is restartable.
