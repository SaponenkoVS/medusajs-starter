# Data Model: Producer Management

## Producer

**Purpose**: Represents the manufacturer of products sold in the store.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | Identifier | Yes | Module-managed primary key |
| `name` | Text | Yes | Human-readable producer name; unique business identifier after normalization |
| `handle` | Text | Yes | URL-safe stable identifier for `/producers/[handle]`, generated on create and immutable in v1 |
| `country` | Text | Yes | Country of origin/manufacture for display and filtering |
| `website` | Text | Yes | Canonical producer website URL |
| `description` | Text | No | Optional long-form producer information |
| `is_active` | Boolean | Yes | Controls whether the producer is assignable for future catalog changes |
| `created_at` | Timestamp | Yes | Framework-managed |
| `updated_at` | Timestamp | Yes | Framework-managed |
| `deleted_at` | Timestamp | No | Framework-managed soft-delete marker |

### Validation Rules

- `name` must be present and unique among non-deleted producers after trim/case normalization.
- `handle` must be present, normalized, and unique among non-deleted producers.
- `handle` is auto-generated from `name`; collisions are resolved by appending a deterministic suffix.
- `country` must be present as a displayable value.
- `website` must be a valid absolute URL that can be rendered as a working storefront link.
- `description` is optional and may be empty/null.
- `is_active` defaults to true for newly created producers.

### State Transitions

- `active` -> `active`: normal edit/update flow.
- `active` -> `inactive`: producer can no longer be assigned to new products but existing product links remain visible in admin and storefront reads.
- `inactive` -> `active`: producer becomes assignable again.
- `active|inactive` -> `deleted`: allowed only when no linked products remain; otherwise the workflow rejects deletion and requires reassignment or link removal first.

## Product

**Purpose**: Existing Medusa commerce entity extended with producer attribution.

### Producer-Specific Constraints

- Each product may have zero or one linked producer during catalog backfill and migration.
- The target business rule for edited data is exactly one producer per managed product once assignment is completed.
- Product publication and commerce availability stay governed by the product module; producer assignment must not bypass those rules.

## ProductProducer Link

**Purpose**: Cross-module association between Product and Producer.

### Relationship Rules

- One producer can be linked to many products.
- A product can be linked to at most one producer at a time.
- Assignment workflow must dismiss any previous product-producer link before creating a new one.
- Inactive producers cannot be linked to additional products.
- Removing or deactivating a producer must account for existing linked products before completing the mutation.

## API Read Models

### Admin Producer Summary

Used by the admin table and selectors.

| Field | Source |
|-------|--------|
| `id` | Producer |
| `name` | Producer |
| `handle` | Producer |
| `country` | Producer |
| `website` | Producer |
| `is_active` | Producer |
| `product_count` | Derived from linked products |

Selector behavior:

- Active producers appear in the default assignment selector.
- An inactive producer may still be returned when it is the product's current assignment so the widget can render persisted state.

### Product Producer Display

Used by the admin product widget and storefront product page.

| Field | Source |
|-------|--------|
| `product_id` | Product |
| `producer.id` | Producer |
| `producer.name` | Producer |
| `producer.country` | Producer |
| `producer.website` | Producer |
| `producer.handle` | Producer |

### Store Producer Detail

Used by `/producers/[handle]`.

| Field | Source |
|-------|--------|
| `producer` | Producer base fields |
| `products[]` | Linked products filtered to published and region/sales-channel available records |
| `count` | Result count for filtered products |

### Shopper-Facing Scope

- Initial release surfaces producer data on the product detail page and dedicated `/producers` pages only.
- Producer data is not required on collection cards, search cards, cart, or checkout in the initial release.
