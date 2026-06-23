# CodeVector Backend Task

A high-performance backend solution for browsing a 200,000+ product catalog using **cursor-based pagination**.

## Why Cursor Pagination?
Standard `OFFSET` / `LIMIT` pagination breaks when data is highly dynamic. If a user is on Page 1 and 50 new items are added, everything shifts down. When they load Page 2, they will see duplicate items from Page 1. 
This backend uses cursor-based pagination with a composite index on `(created_at, id)` to guarantee that no items are ever missed or duplicated, even under heavy write loads.

## Tech Stack
- **Backend**: Node.js & Fastify
- **Database**: PostgreSQL (or SQLite locally) via Prisma ORM
- **UI**: Vanilla JS & Tailwind CSS

## Getting Started Locally

1. Install dependencies:
```bash
npm install
```

2. Push the Prisma Schema (Creates local SQLite `dev.db`):
```bash
npx prisma db push
```

3. Seed the Database (Generates 200,000 rows in ~15 seconds):
```bash
npm run seed
```

4. Start the Server:
```bash
npm start
```
*The app will be available at http://localhost:3000*
