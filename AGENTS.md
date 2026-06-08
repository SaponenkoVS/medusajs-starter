# Agent Instructions

## Startup Workflow

1. Read `.harness/feature_list.json`, `.harness/progress.md`, and `.harness/session-handoff.md`.
2. Select one active feature, then confirm its `status`, `dependencies`, and done criteria.
3. Inspect the relevant Medusa app and only the files needed for the selected feature before editing.
4. Preserve user changes. Do not revert, move, or overwrite unrelated work.

## Repository Layout

- `medusa-store/` is the npm workspace root.
- `medusa-store/apps/backend/` contains the Medusa v2 backend, custom modules, workflows, API routes, links, jobs, subscribers, and admin dashboard extensions.
- `medusa-store/apps/storefront/` contains the Next.js storefront.
- `.harness/` contains the active agent state and verification entrypoint.

## Medusa Development Rules

- Use the Medusa development skills before implementation:
  - `medusa-dev:building-with-medusa` for backend modules, workflows, API routes, links, data models, and business logic.
  - `medusa-dev:building-admin-dashboard-customizations` for admin widgets, pages, forms, tables, and data loading.
  - `medusa-dev:building-storefronts` for storefront SDK integration, React Query, and custom API calls.
- Follow the Medusa architecture flow: Module data and CRUD operations -> Workflow business logic and mutations -> API route HTTP interface -> Admin or storefront SDK client.
- Use workflows for all mutations. Keep business validation, ownership checks, rollback behavior, and cross-module mutation logic out of API route handlers.
- Keep modules isolated. Use module links for relationships between modules instead of direct cross-module service coupling.
- Prefer `GET`, `POST`, and `DELETE` route handlers. Do not introduce `PUT` or `PATCH` handlers unless the feature explicitly requires a Medusa-compatible exception.
- Use static top-level imports for workflows, modules, schemas, and helpers. Do not use dynamic `await import()` inside route handlers.
- Export Zod schemas and inferred request types from middleware files. Type protected routes with `AuthenticatedMedusaRequest`; type validated bodies with `MedusaRequest<T>`.
- Do not add `.linkable()` to data models. Medusa adds linkable metadata automatically.
- Use camelCase module registration names. Do not use dashes in module names.

## Data Access And SDK Rules

- Use `query.graph()` for cross-module reads when filtering by linked module fields is not required.
- Use `query.index()` when filtering across separate linked modules.
- Use `listAndCount` for paginated single-module reads.
- Do not filter linked data in JavaScript when a database query can express the filter.
- Medusa prices are stored as-is. Do not multiply by 100 before saving and do not divide by 100 before displaying.
- In admin and storefront code, use the Medusa JS SDK for API calls. Do not use raw `fetch`.
- Use existing SDK methods for built-in endpoints and `sdk.client.fetch()` for custom routes.
- Pass plain JavaScript objects as SDK request bodies. Do not call `JSON.stringify()` for SDK bodies.
- In admin UI, use Medusa UI components and semantic utility classes. Prefer separate display queries and modal/form queries, and invalidate display queries after mutations.

## Workflow Composition Rules

- `createWorkflow` composition functions must be regular functions, not async functions or arrow functions.
- Do not use `await`, direct conditionals, ternaries, date creation, or arbitrary variable mutation inside workflow composition.
- Use `when()` for conditional branches and `transform()` for derived values.
- Give repeated step calls unique `.config({ name: "..." })` values.

## Harness Workflow

- Treat `.harness/feature_list.json` as the active feature ledger.
- Treat `.harness/progress.md` as the current status and verification evidence log.
- Treat `.harness/session-handoff.md` as the restart guide for the next agent session.
- Keep one feature active at a time unless the user explicitly asks for parallel work.
- Update `.harness/progress.md` with the current objective, files changed, verification command, output summary, blockers, and next step.
- Update `.harness/feature_list.json` whenever a feature moves between `planned`, `in_progress`, `blocked`, and `completed`.
- Before ending, update `.harness/session-handoff.md` with changed files, verification evidence, blockers, and the recommended next step.

## Verification Commands

- Canonical harness command: `make -C .harness harness`.
- Backend build: `cd medusa-store/apps/backend && npm run build`.
- Backend tests: `cd medusa-store/apps/backend && npm run test:unit`, `npm run test:integration:http`, or `npm run test:integration:modules` as relevant.
- Storefront build: `cd medusa-store/apps/storefront && npm run build`.
- Workspace build: `cd medusa-store && npm run build`.

## Test Specification

- Match tests to the layer changed:
  - Modules and services: use backend module integration tests for CRUD behavior, service contracts, migrations, and module isolation.
  - Workflow steps and pure helpers: use backend unit tests for branching, validation, transforms, rollback inputs, and error cases.
  - Full workflows: use integration tests that execute the workflow through Medusa's container and assert created/updated records plus rollback-relevant failures.
  - API routes and middleware: use backend HTTP integration tests for status codes, auth, validation, response shape, and side effects.
  - Admin extensions: verify with build plus focused tests or mocks when the repo has UI test infrastructure; always cover SDK calls, loading state, error state, and mutation invalidation in review.
  - Storefront changes: verify with build and, when test infrastructure exists, component or integration tests for user-visible states, SDK calls, loading/error states, and cart/checkout/product behavior.
- Minimum test cases by change type:
  - Pure helper or workflow step: at least 3 cases: success, invalid input, and edge/boundary behavior.
  - API route: at least 4 cases: success, validation failure, auth/permission failure when protected, and not-found or empty-result behavior.
  - Module or data model change: at least 4 cases: create, read/list, update/delete if supported, and constraint or invalid-data behavior.
  - Workflow mutation: at least 4 cases: success path, validation/business-rule failure, missing dependency or not-found failure, and rollback/compensation-sensitive behavior when applicable.
  - Admin or storefront UI feature: at least 4 user-facing states: loading, empty, success/populated, and error; include disabled/pending state for mutations.
  - Bug fix: add at least 1 regression test that fails before the fix and passes after; add surrounding cases only where the touched logic has meaningful branches.
- Test data rules:
  - Use factories, seed helpers, or Medusa test utilities where available. Avoid hardcoded IDs unless the test creates them.
  - Assert persisted database state for mutations, not only HTTP responses.
  - Assert response shapes that clients rely on, but avoid brittle snapshots for large Medusa objects.
  - Include price assertions whenever price fields are touched, and assert Medusa's as-is price format without cent conversion.
- Test execution rules:
  - Run the narrowest relevant test command first, then `npm run build` for the changed app.
  - Run `make -C .harness harness` before marking harness-level work complete.
  - If a required test cannot run because of an existing unrelated blocker, record the command, failure, and blocker in `.harness/progress.md` and keep the feature out of `completed`.

## Definition Of Done

A feature is done only when the scoped requirement is implemented, relevant verification passes or the failure is explicitly recorded, `.harness/progress.md` contains evidence, `.harness/feature_list.json` reflects the final status, and `.harness/session-handoff.md` is restartable.
