import path from 'node:path'
import { definePrismaConfig } from '@prisma/cli-engine'
import 'dotenv/config'

export default definePrismaConfig({
  orm: {
    schema: path.join(import.meta.dirname, 'prisma', 'schema.prisma'),
    datasource: {
      url: process.env.DATABASE_URL!,
    },
  }
})
