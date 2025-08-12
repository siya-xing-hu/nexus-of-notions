import type { User } from "@prisma/client";
import prisma from "../../../server/utils/prisma";
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

export async function queryUserById(id: string): Promise<DbUser | null> {
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

export async function queryAllUsers(): Promise<DbUser[]> {
  const records = await prisma.user.findMany();
  return records.map(prismaToDb);
}

export async function createOrGetUser(
  name: string,
  email: string,
): Promise<DbUser> {
  const record = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { name, email },
  });

  return prismaToDb(record);
}
