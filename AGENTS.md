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
- Before backend implementation, load the Medusa reference file that matches the task:
  - creating or changing a module -> `building-with-medusa/reference/custom-modules.md`
  - creating or changing a workflow -> `building-with-medusa/reference/workflows.md`
  - creating or changing an API route or middleware -> `building-with-medusa/reference/api-routes.md`
  - creating or changing module links -> `building-with-medusa/reference/module-links.md`
  - creating or changing query logic -> `building-with-medusa/reference/querying-data.md`
  - creating or changing auth behavior -> `building-with-medusa/reference/authentication.md`
- Before admin dashboard implementation, load the Medusa admin reference file that matches the task:
  - creating or changing widgets -> `building-admin-dashboard-customizations/references/data-loading.md`
  - creating or changing forms or edit/create modals -> `building-admin-dashboard-customizations/references/forms.md`
  - creating or changing tables or list displays -> `building-admin-dashboard-customizations/references/display-patterns.md`
  - creating or changing large-item selectors -> `building-admin-dashboard-customizations/references/table-selection.md`
  - creating or changing admin navigation -> `building-admin-dashboard-customizations/references/navigation.md`
  - styling admin UI content -> `building-admin-dashboard-customizations/references/typography.md`
- Follow the Medusa architecture flow: Module data and CRUD operations -> Workflow business logic and mutations -> API route HTTP interface -> Admin or storefront SDK client.
- Use workflows for all mutations. Keep business validation, ownership checks, rollback behavior, and cross-module mutation logic out of API route handlers.
- API routes must not call module service mutation methods directly. Routes validate input, execute workflows, and shape HTTP responses.
- Keep modules isolated. Use module links for relationships between modules instead of direct cross-module service coupling.
- Prefer `GET`, `POST`, and `DELETE` route handlers. Do not introduce `PUT` or `PATCH` handlers unless the feature explicitly requires a Medusa-compatible exception.
- Use static top-level imports for workflows, modules, schemas, and helpers. Do not use dynamic `await import()` inside route handlers.
- Export Zod schemas and inferred request types from middleware files. Type protected routes with `AuthenticatedMedusaRequest`; type validated bodies with `MedusaRequest<T>`.
- Export middleware definitions as named `MiddlewareRoute[]` arrays and register them by importing and spreading them in `api/middlewares.ts`.
- When combining auth and validation middleware, use `authenticate(...)` before `validateAndTransformBody(...)`. Do not nest validators inside `authenticate`.
- Use `validateAndTransformQuery(...)` for query validation and read validated values from `req.validatedQuery`, not `req.query`.
- Admin custom routes belong under `/admin/...`; storefront custom routes belong under `/store/...`.
- Trust the `authenticate` middleware for protected routes. Do not manually inspect `req.auth_context` unless the feature requires custom auth behavior beyond the middleware contract.
- Do not use the `any` type in application code. Prefer inferred Zod types, Medusa framework types, SDK types, discriminated unions, generics, `unknown`, or narrow local interfaces.
- Do not silence type errors with `as any`, broad unsafe casts, or type assertions that bypass validation. If runtime input is uncertain, validate it and narrow the type explicitly.
- Do not add `.linkable()` to data models. Medusa adds linkable metadata automatically.
- Use camelCase module registration names. Do not use dashes in module names.

## Data Access And SDK Rules

- Use module services for single-module reads; use `listAndCount` for paginated single-module reads.
- Use `query.graph()` for cross-module reads and linked data retrieval when filtering by linked module fields is not required.
- Use `query.index()` when filtering across separate linked modules.
- Do not use `query.graph()` to filter by fields from linked models in separate modules.
- Do not use JavaScript `.filter()` or post-processing to compensate for a query that should be expressed as a database filter.
- Use `useQueryGraphStep` inside workflows instead of resolving `query` manually in workflow composition.
- For list endpoints, prefer Medusa request query config so clients can control fields, pagination, and ordering.
- Do not set explicit `fields` when using `req.queryConfig`.
- For cross-module list endpoints, select only the fields and relations the client or response shape actually needs.
- Do not filter linked data in JavaScript when a database query can express the filter.
- Medusa prices are stored as-is. Do not multiply by 100 before saving and do not divide by 100 before displaying.
- In admin and storefront code, use the Medusa JS SDK for API calls. Do not use raw `fetch`.
- Use existing SDK methods for built-in endpoints and `sdk.client.fetch()` for custom routes.
- Pass plain JavaScript objects as SDK request bodies. Do not call `JSON.stringify()` for SDK bodies.
- In admin UI, use Medusa UI components and semantic utility classes. Prefer separate display queries and modal/form queries, and invalidate display queries after mutations.
- In admin widgets and edit surfaces, saved values that must appear on reopen or page refresh must come from a display query that loads on mount, not from a modal-only query or temporary local state.
- Do not gate persisted display data behind `enabled: modalOpen`, drawer state, selection dialog state, or similar UI conditions.
- After admin mutations, invalidate both the edited entity query and any widget/display query that renders the persisted values.

## Workflow Composition Rules

- `createWorkflow` composition functions must be regular functions, not async functions or arrow functions.
- Do not use `await`, direct conditionals, ternaries, loops, date creation, object spreading, nullish/logical fallback operators, optional chaining, or arbitrary variable mutation inside workflow composition.
- Use `when()` for conditional branches and `transform()` for derived values.
- Give repeated step calls unique `.config({ name: "..." })` values.
- Prefer one mutation per workflow step so rollback stays isolated and predictable.
- Provide explicit compensation inputs for mutation steps and keep steps idempotent so workflow retries are safe.
- Workflow reads belong in workflow query steps such as `useQueryGraphStep`; do not mix ad hoc imperative query resolution into workflow composition.

## File And Layer Conventions

- Put workflow composition files in `src/workflows/[workflow-name].ts`.
- Put reusable workflow steps in `src/workflows/steps/[step-name].ts`.
- Put module links in `src/links/[link-name].ts`.
- Keep route-local validation schemas and inferred request types in route middleware files, then export and reuse them in route handlers.
- Keep route handlers thin: parse request context, call workflow/query layer, and return HTTP responses.
- In admin UI code, separate display-state queries from selection/edit queries so persisted data remains prefilled after save, reopen, and refresh.

## TypeScript Rules

- Treat TypeScript type safety as part of the feature contract, not optional cleanup.
- Never introduce `any` in app code, test code, workflow code, route handlers, admin code, or storefront code unless a third-party typing defect makes it unavoidable and the reason is documented inline.
- Prefer `unknown` over `any` for untrusted external values, then narrow with Zod validation, type guards, or explicit structural checks.
- Prefer exported shared types over duplicated inline object types when data crosses module, workflow, route, admin, or storefront boundaries.
- If a type is difficult to express, stop and model it explicitly with unions, generics, helper types, or small interfaces instead of weakening the code with `any`.

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
  - Admin widgets and edit forms that persist relationships or selections: add a regression check that saved values are prefilled after reload or reopening the edit surface.
  - Bug fix: add at least 1 regression test that fails before the fix and passes after; add surrounding cases only where the touched logic has meaningful branches.
- Test data rules:
  - Use factories, seed helpers, or Medusa test utilities where available. Avoid hardcoded IDs unless the test creates them.
  - Assert persisted database state for mutations, not only HTTP responses.
  - Assert response shapes that clients rely on, but avoid brittle snapshots for large Medusa objects.
  - Include price assertions whenever price fields are touched, and assert Medusa's as-is price format without cent conversion.
- Test execution rules:
  - Run the narrowest relevant test command first, then `npm run build` for the changed app.
  - Backend modules, workflows, routes, links, and middleware are not done until `cd medusa-store/apps/backend && npm run build` passes, or the build failure is explicitly recorded as an external blocker.
  - Admin UI changes are not done until the relevant admin verification passes and the backend app still builds.
  - Storefront changes are not done until the relevant storefront verification passes and `cd medusa-store/apps/storefront && npm run build` passes, or the failure is explicitly recorded as an external blocker.
  - Run `make -C .harness harness` before marking harness-level work complete.
  - If a required test cannot run because of an existing unrelated blocker, record the command, failure, and blocker in `.harness/progress.md` and keep the feature out of `completed`.

## Definition Of Done

A feature is done only when the scoped requirement is implemented, relevant verification passes or the failure is explicitly recorded, `.harness/progress.md` contains evidence, `.harness/feature_list.json` reflects the final status, and `.harness/session-handoff.md` is restartable.
