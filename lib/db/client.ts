import { PrismaClient } from '@prisma/client'

// 在开发环境确保 PrismaClient 单例，避免热更新造成的连接过多
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma


