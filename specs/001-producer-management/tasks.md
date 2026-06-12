# Tasks: Producer Management

**Input**: Design documents from `/specs/001-producer-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Backend module, workflow, and HTTP tests plus backend/storefront build validation are required for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `apps/backend/...`
- Storefront: `apps/storefront/...`
- Feature docs: `specs/001-producer-management/...`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish feature scaffolding, register the feature in backend config, and create implementation-specific validation entry points.

- [X] T001 Create producer feature scaffolding in `apps/backend/src/modules/producer/`, `apps/backend/src/links/`, `apps/backend/src/workflows/`, `apps/backend/src/api/admin/producers/`, `apps/backend/src/api/store/producers/`, `apps/backend/src/api/store/products/`, `apps/backend/src/admin/routes/producers/`, `apps/backend/src/admin/widgets/product-producer/`, and `apps/storefront/src/modules/producers/`
- [X] T002 Register the producer module in `apps/backend/medusa-config.ts`
- [X] T003 [P] Create backend integration/unit test placeholders in `apps/backend/integration-tests/modules/producer/`, `apps/backend/integration-tests/http/admin/producers/`, `apps/backend/integration-tests/http/admin/product-producer/`, `apps/backend/integration-tests/http/store/producers/`, and `apps/backend/unit/workflows/producer/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the core producer domain, link, route middleware, and shared read/mutation infrastructure that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create the producer data model in `apps/backend/src/modules/producer/models/producer.ts`
- [X] T005 [P] Create the producer module service and export in `apps/backend/src/modules/producer/service.ts` and `apps/backend/src/modules/producer/index.ts`
- [X] T006 [P] Define the product-producer module link in `apps/backend/src/links/product-producer.ts`
- [X] T007 Create shared producer workflow steps for create, update, and product-link mutation support in `apps/backend/src/workflows/steps/create-producer.ts`, `apps/backend/src/workflows/steps/update-producer.ts`, `apps/backend/src/workflows/steps/set-product-producer-link.ts`, and `apps/backend/src/workflows/steps/remove-product-producer-link.ts`, including stable handle generation and delete-guard support
- [X] T008 Create shared producer workflows in `apps/backend/src/workflows/create-producer.ts`, `apps/backend/src/workflows/update-producer.ts`, `apps/backend/src/workflows/delete-producer.ts`, and `apps/backend/src/workflows/assign-product-producer.ts`, including inactive-assignment rejection and linked-product delete blocking
- [X] T009 [P] Create shared admin validation middleware for producer CRUD and product assignment in `apps/backend/src/api/admin/producers/middlewares.ts` and `apps/backend/src/api/admin/products/[id]/producer/middlewares.ts`
- [X] T010 [P] Create shared store validation middleware for producer discovery in `apps/backend/src/api/store/producers/middlewares.ts` and `apps/backend/src/api/store/products/[handle]/producer/middlewares.ts`
- [X] T011 Register producer admin/store middleware arrays in `apps/backend/src/api/middlewares.ts`
- [X] T012 Implement shared producer query helpers and response shaping in `apps/backend/src/api/admin/producers/helpers.ts` and `apps/backend/src/api/store/producers/helpers.ts`, including efficient `product_count` derivation and storefront visibility filtering inputs
- [X] T013 Generate the producer module migration from `apps/backend/` with output under `apps/backend/src/modules/producer/migrations/`
- [X] T014 Apply migrations for the producer module and product-producer link from `apps/backend/`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Maintain producer records (Priority: P1) 🎯 MVP

**Goal**: Give administrators a complete producer CRUD workflow with persistent admin list/create/edit surfaces.

**Independent Test**: An admin can open the Producers route, create a producer, edit it, refresh, and still see the updated record without touching product assignment or storefront flows.

### Tests for User Story 1

- [X] T015 [P] [US1] Add producer module integration coverage for create, list, normalized-name uniqueness, handle collision handling, and delete constraints in `apps/backend/integration-tests/modules/producer/producer-module.spec.ts`
- [X] T016 [P] [US1] Add HTTP integration coverage for `GET/POST /admin/producers`, `GET/POST/DELETE /admin/producers/:id`, auth failures, validation failures, stable-handle-on-rename behavior, and blocked delete responses in `apps/backend/integration-tests/http/admin/producers/producer-routes.spec.ts`

### Implementation for User Story 1

- [X] T017 [US1] Implement admin producer CRUD route handlers in `apps/backend/src/api/admin/producers/route.ts` and `apps/backend/src/api/admin/producers/[id]/route.ts`
- [X] T018 [P] [US1] Create the admin SDK client helper and shared producer query hooks in `apps/backend/src/admin/lib/sdk.ts` and `apps/backend/src/admin/hooks/use-producers.ts`
- [X] T019 [P] [US1] Build the producer DataTable columns and list-state helpers in `apps/backend/src/admin/routes/producers/components/producer-table-columns.tsx` and `apps/backend/src/admin/routes/producers/hooks/use-producer-table.ts`
- [X] T020 [P] [US1] Build the producer create FocusModal form in `apps/backend/src/admin/routes/producers/components/create-producer-modal.tsx`
- [X] T021 [P] [US1] Build the producer edit Drawer form in `apps/backend/src/admin/routes/producers/components/edit-producer-drawer.tsx`
- [X] T022 [US1] Build the Producers admin route page with loading, empty, success, and error states in `apps/backend/src/admin/routes/producers/page.tsx`
- [X] T023 [US1] Add admin navigation entry points for the Producers route in `apps/backend/src/admin/routes/producers/config.ts` and `apps/backend/src/admin/routes/producers/index.ts`

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Assign producers to products (Priority: P2)

**Goal**: Let administrators view, assign, replace, and clear a product’s producer from the product detail page with persistent saved state.

**Independent Test**: An admin can open a product detail page, assign a producer, refresh, reopen the product page, replace the producer, and clear it while always seeing the persisted current state.

### Tests for User Story 2

- [X] T024 [P] [US2] Add workflow unit coverage for assignment validation, inactive-producer rejection, replacement, and clear behavior in `apps/backend/unit/workflows/producer/assign-product-producer.spec.ts`
- [X] T025 [P] [US2] Add HTTP integration coverage for `GET/POST/DELETE /admin/products/:id/producer`, including missing producer, invalid payload, inactive assignment rejection, and persisted replacement behavior in `apps/backend/integration-tests/http/admin/product-producer/product-producer-routes.spec.ts`

### Implementation for User Story 2

- [X] T026 [US2] Extend the assignment workflow and shared query helpers to enforce one producer per product and return the display shape in `apps/backend/src/workflows/assign-product-producer.ts`, `apps/backend/src/workflows/steps/set-product-producer-link.ts`, and `apps/backend/src/api/admin/producers/helpers.ts`
- [X] T027 [US2] Implement admin product-producer route handlers in `apps/backend/src/api/admin/products/[id]/producer/route.ts`
- [X] T028 [P] [US2] Create product-producer widget query and mutation hooks in `apps/backend/src/admin/widgets/product-producer/hooks/use-product-producer.ts`
- [X] T029 [P] [US2] Build the product-producer assignment widget UI with display, loading, empty, error, and save states in `apps/backend/src/admin/widgets/product-producer/index.tsx`, showing inactive current assignments while excluding inactive producers from new selection options
- [X] T030 [US2] Register the product-producer widget for the product detail zone in `apps/backend/src/admin/widgets/product-producer/config.ts`

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Use producer information in shopping journeys (Priority: P3)

**Goal**: Expose producer information on product pages and provide producer listing/detail pages that only surface published, available products for the active region and sales-channel context.

**Independent Test**: A shopper can view a product page with producer details, browse `/producers`, and open `/producers/[handle]` to see the producer plus only region-available published products.

### Tests for User Story 3

- [X] T031 [P] [US3] Add store HTTP integration coverage for `GET /store/products/:handle/producer`, `GET /store/producers`, and `GET /store/producers/:handle` including not-found, empty-result, inactive-but-linked visibility, and availability filtering cases in `apps/backend/integration-tests/http/store/producers/store-producer-routes.spec.ts`

### Implementation for User Story 3

- [X] T032 [US3] Implement store producer discovery route handlers and Query-based availability filtering in `apps/backend/src/api/store/products/[handle]/producer/route.ts`, `apps/backend/src/api/store/producers/route.ts`, and `apps/backend/src/api/store/producers/[handle]/route.ts`
- [X] T033 [P] [US3] Add storefront producer data helpers using the Medusa SDK in `apps/storefront/src/lib/data/producers.ts`
- [X] T034 [P] [US3] Update product retrieval/display integration for producer details in `apps/storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx`, `apps/storefront/src/modules/products/templates/index.tsx`, and `apps/storefront/src/modules/products/templates/product-info/index.tsx`, without expanding producer display into collection/search/card surfaces in v1
- [X] T035 [P] [US3] Build reusable producer list/detail UI components in `apps/storefront/src/modules/producers/components/producer-card.tsx`, `apps/storefront/src/modules/producers/components/producer-product-grid.tsx`, and `apps/storefront/src/modules/producers/components/producer-hero.tsx`
- [X] T036 [US3] Build the storefront producer list and detail templates in `apps/storefront/src/modules/producers/templates/producers-list-template.tsx` and `apps/storefront/src/modules/producers/templates/producer-detail-template.tsx`
- [X] T037 [US3] Add the storefront `/producers` and `/producers/[handle]` routes in `apps/storefront/src/app/[countryCode]/(main)/producers/page.tsx` and `apps/storefront/src/app/[countryCode]/(main)/producers/[handle]/page.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and documentation updates that affect multiple user stories.

- [X] T038 [P] Update feature-specific implementation notes and verification evidence in `.harness/progress.md` and `.harness/session-handoff.md`
- [X] T039 Run required backend verification commands from `apps/backend/` and record results for `apps/backend/integration-tests/modules/producer/`, `apps/backend/integration-tests/http/`, and `apps/backend/unit/workflows/producer/`
- [ ] T040 Run required build and harness verification from `apps/backend/`, `apps/storefront/`, and `.harness/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion
- **User Story 2 (Phase 4)**: Depends on Foundational completion and uses producer CRUD infrastructure from US1 for practical validation
- **User Story 3 (Phase 5)**: Depends on Foundational completion and the producer/product assignment data path from US2
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: First deliverable and MVP; no user-story dependency
- **US2 (P2)**: Requires producer entities and admin CRUD surfaces to exist for assignment selection
- **US3 (P3)**: Requires producer data and product assignments to exist so storefront pages have meaningful data

### Within Each User Story

- Tests should be created before or alongside implementation and must fail before the full implementation is complete
- Backend handlers depend on middleware/workflows from the Foundational phase
- Admin/storefront UI depends on the relevant HTTP contract being implemented
- Verification tasks run after implementation for each story and again in the Polish phase

### Parallel Opportunities

- T003 can run in parallel with T002 after scaffolding exists
- T005 and T006 can run in parallel after T004
- T009 and T010 can run in parallel after workflows are outlined
- T018, T019, T020, and T021 can run in parallel after admin CRUD routes exist
- T028 and T029 can run in parallel after product-producer routes exist
- T033, T035, and parts of T034 can run in parallel after store routes are in place

---

## Parallel Example: User Story 1

```bash
# Launch User Story 1 verification tasks together:
Task: "Add producer module integration coverage in apps/backend/integration-tests/modules/producer/producer-module.spec.ts"
Task: "Add HTTP integration coverage in apps/backend/integration-tests/http/admin/producers/producer-routes.spec.ts"

# Launch User Story 1 admin UI building blocks together:
Task: "Create admin SDK client helper and producer query hooks in apps/backend/src/admin/lib/sdk.ts and apps/backend/src/admin/hooks/use-producers.ts"
Task: "Build producer DataTable columns and list-state helpers in apps/backend/src/admin/routes/producers/components/producer-table-columns.tsx and apps/backend/src/admin/routes/producers/hooks/use-producer-table.ts"
Task: "Build producer create FocusModal form in apps/backend/src/admin/routes/producers/components/create-producer-modal.tsx"
Task: "Build producer edit Drawer form in apps/backend/src/admin/routes/producers/components/edit-producer-drawer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate producer CRUD independently in admin
5. Stop for review if an MVP checkpoint is needed

### Incremental Delivery

1. Deliver producer module, link, workflows, and migrations
2. Deliver admin producer CRUD (US1)
3. Deliver product assignment on product detail (US2)
4. Deliver storefront producer display and producer discovery pages (US3)
5. Finish with builds, harness verification, and recorded evidence

### Parallel Team Strategy

1. One developer completes Setup + Foundational
2. After Foundational:
   - Developer A: admin CRUD route/page work for US1
   - Developer B: product assignment workflow/widget work for US2
   - Developer C: storefront route/page work for US3 once assignment contracts stabilize

---

## Notes

- All tasks follow the checklist format with task ID and file path
- `[P]` is used only where work can proceed on separate files without waiting on incomplete same-file edits
- Tests are included because verification is explicitly required by the feature request and repository rules
- The recommended MVP scope is **User Story 1**
