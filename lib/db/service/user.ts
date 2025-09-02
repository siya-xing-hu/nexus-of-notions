import type { User } from "@prisma/client";
import prisma from "@/stores/prisma";
import type { DbUser } from "../types";
import { sm3 } from "sm-crypto-v2";

function prismaToDb(record: User): DbUser {
  return {
    id: record.id,
    name: record.name ?? "",
    email: record.email!,
    avatar: record.avatar ?? "",
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
  };
}

export async function findOrCreateUserByOauthProfile(
  profile: any,
  provider: string,
): Promise<DbUser> {
  const providerAccountId = provider === "github" ? profile.id.toString() : profile.sub;
  const avatarUrl = provider === "github" ? profile.avatar_url : profile.picture;

  // 1. 尝试通过 provider 和 providerAccountId 查找用户
  let user = await prisma.user.findFirst({
    where: {
      provider: provider,
      providerAccountId: providerAccountId,
    },
  });

  if (user) {
    return prismaToDb(user);
  }

  // 2. 如果用户不存在，尝试通过 email 查找
  if (profile.email) {
    user = await prisma.user.findUnique({
      where: {
        email: profile.email,
      },
    });

    // 如果找到用户，更新 provider 信息
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: profile.name,
          provider: provider,
          providerAccountId: providerAccountId,
          avatar: avatarUrl,
        },
      });
      return prismaToDb(user);
    }
  }

  // 3. 如果用户仍然不存在，创建新用户
  const newUser = await prisma.user.create({
    data: {
      name: profile.name,
      email: profile.email,
      avatar: avatarUrl,
      provider: provider,
      providerAccountId: providerAccountId,
    },
  });

  return prismaToDb(newUser);
}

export async function createUserWithPassword(
  name: string,
  email: string,
  passwordHash: string,
): Promise<DbUser> {
  const newUser = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: passwordHash,
      provider: "credentials",
    },
  });

  return prismaToDb(newUser);
}

export async function verifyUserPassword(
  email: string,
  passwordToCheck: string,
): Promise<DbUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    return null;
  }

  const hashedPassword = sm3(passwordToCheck);

  if (user.password === hashedPassword) {
    return prismaToDb(user);
  }

  return null;
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
