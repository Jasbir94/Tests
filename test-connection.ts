import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './src/generated/prisma/index.js' // wait, output is "../src/generated/prisma" in schema, so let's use that

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const result = await prisma.$queryRawUnsafe('SELECT 1 as connected')
  console.log('Connected to Prisma Postgres:', result)
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect()
    pool.end()
  })
