import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys'];
const ADJECTIVES = ['Amazing', 'Sleek', 'Durable', 'Portable', 'Wireless', 'Smart', 'Premium', 'Eco-friendly'];
const NOUNS = ['Widget', 'Device', 'Tool', 'Accessory', 'Gadget', 'System', 'Monitor', 'Station'];

function getRandomItem(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)] as string;
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.product.deleteMany({});
  
  const TOTAL_RECORDS = 200_000;
  const CHUNK_SIZE = 5_000;
  
  console.log(`Generating ${TOTAL_RECORDS} products in chunks of ${CHUNK_SIZE}...`);
  
  const startTime = Date.now();
  
  for (let i = 0; i < TOTAL_RECORDS; i += CHUNK_SIZE) {
    const products = [];
    
    for (let j = 0; j < CHUNK_SIZE; j++) {
      // To simulate products being added over time, we generate a random date in the past year
      const randomDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      
      products.push({
        name: `${getRandomItem(ADJECTIVES)} ${getRandomItem(NOUNS)} ${Math.floor(Math.random() * 10000)}`,
        category: getRandomItem(CATEGORIES),
        price: parseFloat((Math.random() * 1000).toFixed(2)),
        created_at: randomDate,
        updated_at: randomDate
      });
    }
    
    await prisma.product.createMany({
      data: products
    });
    
    console.log(`Inserted ${i + CHUNK_SIZE} / ${TOTAL_RECORDS}`);
  }
  
  const duration = (Date.now() - startTime) / 1000;
  console.log(`Seeding complete! Took ${duration} seconds.`);
}

main()
  .catch((e) => {
    // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
