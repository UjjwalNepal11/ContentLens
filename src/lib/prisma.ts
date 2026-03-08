import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { validateServerEnv } from './env'

const { Pool } = pg

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export function getPrisma() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  const env = validateServerEnv()

  const pool = new Pool({ connectionString: env.DATABASE_URL })
  const adapter = new PrismaPg(pool)

  const prisma = new PrismaClient({
    adapter,
    log: ['query'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }

  return prisma
}