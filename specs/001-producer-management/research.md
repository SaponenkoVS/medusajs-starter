# Research: Producer Management

## Decision 1: Model producers as a dedicated Medusa custom module

**Decision**: Create a new `producer` module under `apps/backend/src/modules/producer` with its own data model and service, then register it in `apps/backend/medusa-config.ts`.

**Rationale**: Producer is a new business concept with its own lifecycle, CRUD needs, and storefront/admin visibility. A custom module keeps it isolated, testable, and aligned with Medusa’s recommended architecture for new domain concepts.

**Alternatives considered**:
- Store producer fields directly in product metadata: rejected because it duplicates producer data across products and bypasses a first-class domain model.
- Add a direct foreign key column to product tables: rejected because the project explicitly wants proper Medusa module links rather than schema hacking across module boundaries.

## Decision 2: Use a product-to-producer module link with list semantics on the product side

**Decision**: Define one link in `apps/backend/src/links/product-producer.ts` so a product can link to exactly one producer and a producer can link to many products. The product side will be the list side in the link definition to represent many products per producer while workflow and route validation enforce a single producer per product.

**Rationale**: Module links preserve module isolation and enable cross-module querying through Query APIs. Medusa link direction also gives a clean way to attach and replace producer associations without mutating product schema internals.

**Alternatives considered**:
- One-to-one link in both directions: rejected because the business rule is many products per producer.
- Persist `producer_id` inside product metadata: rejected because it weakens referential integrity and complicates linked reads.

## Decision 3: Use workflows for all producer and assignment mutations

**Decision**: Implement dedicated workflows for create producer, update producer, retire/delete producer safeguards, and assign/replace/clear product producer links.

**Rationale**: The repository rules require workflows for all mutations. Assignment especially needs coordinated behavior: verify referenced records, remove any previous producer link for the product, create the new link, and preserve predictable rollback behavior.

**Alternatives considered**:
- Call module services or link utilities directly from route handlers: rejected because it violates the required Medusa layering and makes rollback/validation behavior harder to control.

## Decision 4: Expose producer CRUD and producer storefront discovery through custom API routes

**Decision**: Add custom admin routes for producer list/create/update/detail and custom store routes for producer list/detail plus a lightweight product-producer detail route for storefront product pages if the existing built-in product response cannot carry linked producer fields cleanly.

**Rationale**: Built-in Medusa product and producer endpoints do not exist for this custom module, and custom routes let the implementation validate request shapes, control response contracts, and use the right Query method for cross-module reads.

**Alternatives considered**:
- Reuse only built-in `/store/products` and `/admin/products` endpoints: rejected because they do not provide producer CRUD or guaranteed linked producer data for custom module surfaces.
- Use raw database access from storefront helpers: rejected because it bypasses Medusa’s HTTP and SDK architecture.

## Decision 5: Use `query.graph()` for linked reads and `query.index()` when filtering products by producer across modules

**Decision**: Use `query.graph()` to retrieve producers with linked product data and products with linked producer data when no cross-module filter is needed. Use `query.index()` for producer detail pages and list endpoints where products must be filtered by linked producer identity together with publishability, sales-channel, or regional availability constraints.

**Rationale**: Medusa’s query guidance is explicit: cross-module linked filters should not be done with `query.graph()` or JavaScript post-filtering. Producer detail pages need database-level filtering by linked producer and commerce visibility conditions.

**Alternatives considered**:
- Filter linked products in JavaScript after `query.graph()`: rejected because the repository explicitly disallows post-processing to compensate for a database query that should be expressed in Query APIs.
- Use raw SQL joins: rejected because the project explicitly values correct use of Medusa Query and module links.

## Decision 6: Keep product-page producer display separate from producer list/detail data retrieval

**Decision**: Add dedicated storefront data helpers in `apps/storefront/src/lib/data/producers.ts` and update product retrieval helpers only as needed for the product page producer block. Producer listing/detail pages will use dedicated store routes rather than overloading the generic product list helper.

**Rationale**: The existing storefront already centralizes server-side data access in `src/lib/data`. A separate producer data helper keeps producer pages focused, avoids coupling every product query to producer discovery use cases, and preserves clearer cache boundaries.

**Alternatives considered**:
- Stuff producer discovery behavior into `listProducts` only: rejected because producer list/detail pages represent a separate resource and need different route contracts.

## Decision 7: Use an admin product-detail widget plus a dedicated admin producers route

**Decision**: Add a widget in the product detail page for viewing and editing the assigned producer, and add a separate admin route for producer list/create/edit with a DataTable-backed list, a FocusModal for create, and a Drawer for edit.

**Rationale**: This matches the Medusa admin guidance for persistent product-surface data and large list management. The widget keeps producer assignment in the product workflow, while the route provides full producer management.

**Alternatives considered**:
- Manage producers only from the product page: rejected because it makes global producer CRUD awkward and does not satisfy the requirement for a dedicated list/create/edit surface.
- Manage producer assignment only from a global producer page: rejected because product assignment belongs close to the product editing context.

## Decision 8: Verification must cover module, workflow, HTTP, admin/storefront build, and harness evidence

**Decision**: Plan verification around backend module tests, workflow/unit coverage where steps are factored, HTTP integration tests for custom routes, backend build, storefront build, and final harness execution if no unrelated blocker remains.

**Rationale**: The user explicitly values proof over claims, and the repository rules define layer-specific minimum verification expectations.

**Alternatives considered**:
- Rely only on manual UI checks: rejected because it would not satisfy the repository’s testing rules or the user’s stated expectations.
