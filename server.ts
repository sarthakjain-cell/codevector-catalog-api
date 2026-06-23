import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient, Prisma } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: '*' });

// Simple frontend route to serve the HTML file
fastify.get('/', async (request, reply) => {
  const htmlPath = path.join(__dirname, 'public', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  reply.type('text/html').send(htmlContent);
});

fastify.get('/api/products', async (request, reply) => {
  const { cursor, category, limit = 20 } = request.query as { cursor?: string; category?: string; limit?: number };
  const take = Number(limit) || 20;

  // Build the where clause
  const where: Prisma.ProductWhereInput = {};
  if (category && category !== 'All') {
    where.category = category;
  }

  // Parse the cursor if it exists
  let cursorObj = undefined;
  if (cursor) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const { id, updated_at } = JSON.parse(decoded);
      cursorObj = {
        updated_at_id: {
          id: id,
          updated_at: new Date(updated_at)
        }
      };
    } catch (e) {
      fastify.log.error('Invalid cursor format');
    }
  }

  const products = await prisma.product.findMany({
    where,
    take: take + 1, // Fetch one extra to know if there's a next page
    cursor: cursorObj,
    orderBy: [
      { updated_at: 'desc' },
      { id: 'desc' }
    ],
  });

  let nextCursor = null;
  if (products.length > take) {
    const nextItem = products.pop(); // Remove the extra item
    if (nextItem) {
      nextCursor = Buffer.from(JSON.stringify({
        id: nextItem.id,
        updated_at: nextItem.updated_at
      })).toString('base64');
    }
  }

  return {
    data: products,
    nextCursor
  };
});

fastify.get('/api/categories', async () => {
  // Hardcoded for speed, but could be fetched via Prisma aggregate/groupBy
  return ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys'];
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    // @ts-ignore
    process.exit(1);
  }
};

start();
