# product-db

Backend REST API for Product-DB. Manages products, sales, stores, and price history.

Part of the [Product-DB](../README.md) ecosystem.

## Tech Stack

- **NestJS** — Framework
- **TypeORM** — ORM
- **PostgreSQL** — Database (hosted on Supabase)
- **Supabase Auth** — JWT authentication (passport-jwt)

## Getting Started

```bash
# Start local PostgreSQL
docker compose up -d db

# Configure environment
cp .env-local .env

# Install and run
npm install
npm run start:dev
```

The server starts on port `3000`.

Set `NODE_ENV=development` to disable the authentication guard.

## API Endpoints

### Sales
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/sales` | Public | List sales (paginated, sorted by date DESC) |
| `GET` | `/sales/:id` | Public | Sale details with store and products |
| `POST` | `/sales` | Required | Create sale from invoice URL `{ url }` |

### Products
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/products` | Public | List products (paginated, filterable by `keyword`, sortable) |
| `GET` | `/products/:id` | Public | Product details with price history |
| `PATCH` | `/products/:id` | Required | Update product (name) |

### Stores
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/stores` | Public | List stores |
| `GET` | `/stores/:id` | Public | Store details |

### Auth
| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/login` | Sign in with email/password |
| `POST` | `/auth/refresh` | Refresh access token |

## Invoice Ingestion Flow

When `POST /sales` is called with an invoice URL:

1. Calls the scraper service (`INVOICE_URL` env var) via HTTP
2. Receives structured invoice data (store, sale, products)
3. Creates or finds the Store
4. Saves the Sale with invoice URL
5. For each product:
   - If the product code is EAN (8 or 13 digits) and already exists → adds a new PriceHistory entry
   - Otherwise → creates a new Product + initial PriceHistory entry

## Testing

```bash
npm run test          # Unit tests
npm run test:cov      # Coverage (80% threshold)
npm run test:e2e      # End-to-end tests
```

## Deployment

Deployed to a Raspberry Pi via GitHub Actions (build → test → SCP → PM2 reload).
