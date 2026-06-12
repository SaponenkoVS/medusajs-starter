# Quickstart: Producer Management Validation

This guide defines the end-to-end validation flow for the Producer feature once implementation is complete.

## Prerequisites

- Install dependencies at the repository root.
- Configure backend and storefront environment variables so the storefront can call the local Medusa backend.
- Ensure the database is available for Medusa migrations.

## 1. Generate and apply schema changes

Run from [apps/backend](/home/vladislav/Desktop/medusajs-starter/apps/backend):

```bash
npx medusa db:generate producer
npx medusa db:migrate
```

Expected outcome:

- A migration is created for the producer module.
- Database tables for the producer module and product-producer link exist after migrate.

## 2. Run narrow backend verification first

Run from [apps/backend](/home/vladislav/Desktop/medusajs-starter/apps/backend):

```bash
npm run test:integration:modules
npm run test:integration:http
npm run test:unit
```

Expected outcome:

- Module tests prove producer CRUD, uniqueness, and module isolation.
- HTTP tests prove admin/store route validation, auth behavior, response shape, and assignment side effects.
- Unit tests prove workflow-step validation and replacement/rollback-sensitive logic where applicable.

## 3. Run application builds

Run:

```bash
cd apps/backend && npm run build
cd apps/storefront && npm run build
```

Expected outcome:

- Backend compiles with module, workflows, routes, links, and admin UI additions.
- Storefront compiles with producer list/detail pages and product-page producer display.

## 4. Validate admin producer management

Start the backend and open the Medusa admin.

Validation scenarios:

1. Open the custom Producers admin route and confirm loading, empty, success, and error states render correctly.
2. Create a producer with `name`, `country`, `website`, and optional `description`.
3. Edit the producer and confirm changes persist after page refresh.
4. Rename the producer and confirm the saved `handle` remains unchanged in admin and storefront responses.
5. Open a product detail page, assign a producer from the producer widget, save, refresh, and confirm the assigned producer still displays.
6. Mark a producer inactive and confirm it still renders on already-linked products but is unavailable for new assignment choices.
7. Replace the assigned producer, then clear it, confirming query invalidation keeps the widget accurate after each mutation.
8. Attempt to delete a producer that still has linked products and confirm the admin receives a blocked response that requires reassignment or unlinking first.

Expected outcome:

- Producer CRUD works from the admin route.
- Product assignment survives refresh and reopen.
- No console errors appear in admin flows.

## 5. Validate storefront product and producer discovery

Start the storefront and backend together.

Validation scenarios:

1. Visit `/{countryCode}/products/[handle]` for a product with a producer and verify the producer name, country, and website link render correctly.
2. Visit the same page for a product without a producer and verify the page remains usable without broken layout.
3. Visit `/{countryCode}/producers` and confirm the producer list handles loading, empty, success, and error states.
4. Visit `/{countryCode}/producers/[handle]` and confirm the producer details render together with only published and region/sales-channel available products.
5. Confirm the producer website opens as a valid external link.
6. Confirm producer information is limited to the PDP and dedicated producer pages in this release, with no unintended producer rendering on unrelated listing cards.

Expected outcome:

- Producer data is visible on product detail pages.
- Producer list/detail pages work for valid and empty-result cases.
- Producer detail pages do not leak unavailable products.

## 6. Run harness verification

Run:

```bash
make -C .harness harness
```

Expected outcome:

- Harness passes, or any unrelated blocker is recorded in `.harness/progress.md` before the feature can be marked complete.

## References

- Admin route contracts: [contracts/admin-api.md](./contracts/admin-api.md)
- Store route contracts: [contracts/store-api.md](./contracts/store-api.md)
- Data model: [data-model.md](./data-model.md)
