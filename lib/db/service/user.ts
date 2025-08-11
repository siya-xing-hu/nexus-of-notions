import { User } from "@prisma/client";
import prisma from "../client";
import type { DbUser } from "../types";

function prismaToDb(record: User): DbUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
  };
}

export async function queryUserById(id: number): Promise<DbUser | null> {
  const record = await prisma.user.findUnique({
    where: { id },
  });

  return record ? prismaToDb(record) : null;
}

export async function queryUserByEmail(email: string): Promise<DbUser | null> {
  const record = await prisma.user.findUnique({
    where: { email },
  });

  return record ? prismaToDb(record) : null;
}

export async function createOrGetUser(user: DbUser): Promise<DbUser> {
  const record = await prisma.user.upsert({
    where: { email: user.email },
    update: { name: user.name },
    create: { name: user.name, email: user.email },
  });

  return prismaToDb(record);
}
