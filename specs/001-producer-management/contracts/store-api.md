# Store API Contract: Producer Discovery

Base path: `/store`

Store routes are public and must be consumable through the Medusa JS SDK.

## `GET /store/products/:handle/producer`

Returns producer display data for one published product in the current storefront context.

### Query Parameters

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `country_code` or region-derived context | string | Contextual | Route implementation may derive region/sales-channel context from request headers/session conventions |

### Response

```json
{
  "product": {
    "id": "prod_123",
    "handle": "trail-shoe"
  },
  "producer": {
    "id": "prodcr_123",
    "name": "Acme Manufacturing",
    "country": "Germany",
    "website": "https://acme.example",
    "handle": "acme-manufacturing"
  }
}
```

If the product has no producer:

```json
{
  "product": {
    "id": "prod_123",
    "handle": "trail-shoe"
  },
  "producer": null
}
```

## `GET /store/producers`

Returns producers visible in the storefront, with pagination support.

Visibility rules:

- Producers may appear in the storefront list even when inactive if they still have published, available linked products.
- Producers without any shopper-visible products may be omitted from the list.

### Query Parameters

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `limit` | number | No | Defaults to storefront page size |
| `offset` | number | No | Pagination offset |
| `q` | string | No | Search by name/country |

### Response

```json
{
  "producers": [
    {
      "id": "prodcr_123",
      "name": "Acme Manufacturing",
      "handle": "acme-manufacturing",
      "country": "Germany",
      "website": "https://acme.example",
      "description": "Optional description"
    }
  ],
  "count": 1,
  "limit": 12,
  "offset": 0
}
```

## `GET /store/producers/:handle`

Returns one producer plus its products that are published and available in the active region and sales-channel context.

### Query Parameters

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `limit` | number | No | Product page size |
| `offset` | number | No | Product pagination offset |
| `country_code` or region-derived context | string | Contextual | Used to determine region-aware product availability |

### Response

```json
{
  "producer": {
    "id": "prodcr_123",
    "name": "Acme Manufacturing",
    "handle": "acme-manufacturing",
    "country": "Germany",
    "website": "https://acme.example",
    "description": "Optional description"
  },
  "products": [
    {
      "id": "prod_123",
      "title": "Trail Shoe",
      "handle": "trail-shoe",
      "thumbnail": "https://example.com/image.jpg"
    }
  ],
  "count": 1,
  "limit": 12,
  "offset": 0
}
```

### Failure Cases

- `404`: producer handle not found.
- `200` with empty `products`: producer exists but no published/available products match the active storefront context.

Scope note:

- The initial storefront scope is the product detail page plus `/producers` listing/detail pages.
- Collection, search, and other catalog-card surfaces are intentionally out of scope for this release.
