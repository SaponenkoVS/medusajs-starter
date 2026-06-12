# Implementation Plan: Producer Management

**Branch**: `001-producer-management` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-producer-management/spec.md`

## Summary

Introduce a first-class `producer` domain in the Medusa backend, connect it to products through a proper module link, expose producer management through admin routes and admin UI extensions, and surface producer data in the storefront through custom store endpoints and new producer pages. The implementation will follow the Medusa flow of module -> workflow -> API route -> admin/storefront client, use Query APIs instead of foreign-key shortcuts or raw SQL, and verify the feature with module, workflow, HTTP, build, and end-to-end validation steps. The design assumes a greenfield implementation in this repository's currently minimal Medusa extension areas, not an incremental change to an existing producer feature.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+ for backend and Next.js/React storefront

**Primary Dependencies**: Medusa v2.15.5 framework modules, `@medusajs/js-sdk`, `@medusajs/admin-sdk`, `@medusajs/ui`, `@tanstack/react-query`, `zod`, Next.js 15

**Storage**: PostgreSQL via Medusa modules and module-link tables

**Testing**: Backend Jest suites (`test:unit`, `test:integration:http`, `test:integration:modules`), backend build, storefront build, harness verification

**Target Platform**: Medusa backend admin dashboard plus Next.js storefront running on Linux/server-side Node environments

**Project Type**: Monorepo web application with Medusa backend and Next.js storefront

**Performance Goals**: Preserve current product-detail and catalog interactions while adding bounded producer lookups, with producer list/detail pages remaining paginated and region-aware and without introducing per-row linked-count N+1 queries in admin producer lists

**Constraints**: Must use custom module + module link + Query APIs; all mutations go through workflows; admin/storefront clients use Medusa SDK; no `any`; producer-product association is exactly one producer per product in v1

**Scale/Scope**: One new backend module, one product-to-producer link, admin product-detail widget, one admin producer management route, producer CRUD and assignment workflows/routes, storefront producer listing/detail pages, and verification across backend plus storefront. Producer data is required on the storefront product detail page and dedicated `/producers` pages only in v1.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file at `.specify/memory/constitution.md` is still a template and does not define enforceable project-specific gates.
- Repository-enforced gates come from `AGENTS.md` and Medusa skills, and this plan complies with them:
- Pass: uses a dedicated custom module for the new domain concept.
- Pass: uses a module link instead of adding a foreign key directly to product data.
- Pass: routes remain thin and mutation logic is delegated to workflows.
- Pass: store/admin HTTP interfaces will use validated custom routes where built-in endpoints are insufficient.
- Pass: admin and storefront surfaces use the Medusa JS SDK and established query/data-loading patterns.
- Pass: verification includes targeted backend tests plus app builds before completion.

**Post-design check**: No design decisions introduced constitution or repository-rule violations. Complexity remains justified by the requirement for cross-module producer/product data, admin CRUD, and storefront producer discovery.

## Project Structure

### Documentation (this feature)

```text
specs/001-producer-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── admin-api.md
│   └── store-api.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/backend/
├── medusa-config.ts
├── src/
│   ├── admin/
│   │   ├── routes/
│   │   │   └── producers/
│   │   └── widgets/
│   │       └── product-producer/
│   ├── api/
│   │   ├── admin/
│   │   │   └── producers/
│   │   ├── middlewares.ts
│   │   └── store/
│   │       ├── producers/
│   │       └── products/
│   ├── links/
│   │   └── product-producer.ts
│   ├── modules/
│   │   └── producer/
│   │       ├── index.ts
│   │       ├── models/
│   │       └── service.ts
│   └── workflows/
│       ├── assign-product-producer.ts
│       ├── create-producer.ts
│       ├── update-producer.ts
│       └── steps/
├── integration-tests/
│   ├── http/
│   └── modules/
└── unit/

apps/storefront/
├── src/
│   ├── app/[countryCode]/(main)/
│   │   ├── producers/
│   │   │   ├── page.tsx
│   │   │   └── [handle]/page.tsx
│   │   └── products/[handle]/page.tsx
│   ├── lib/
│   │   ├── config.ts
│   │   └── data/
│   │       ├── producers.ts
│   │       └── products.ts
│   └── modules/
│       └── producers/
│           ├── components/
│           └── templates/
```

**Structure Decision**: Use the existing `apps/backend` and `apps/storefront` applications. Backend work is split into module, link, workflow, route, and admin-extension layers. Storefront work extends the current App Router and server-data helpers with a dedicated producer data file and producer UI module. Because the repository currently contains only baseline Medusa extension scaffolding, the first implementation pass must also establish the project's route middleware registry, admin route/widget wiring, and initial test structure.

## Complexity Tracking

- Repository bootstrap risk: `apps/backend/src/modules`, `src/workflows`, `src/links`, and `src/admin` are effectively empty today, so the first implementation pass must create the conventions that later tasks depend on.
- Storefront filtering risk: producer detail pages require region-aware and sales-channel-aware product filtering, which must align with the current storefront SDK/header flow instead of introducing ad hoc request context handling.
- URL stability decision: producer handles are stable after creation in v1, avoiding storefront link churn during producer renames.
