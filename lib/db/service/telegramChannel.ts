import type { TelegramChannel } from "@prisma/client";
import prisma from "@/stores/prisma";
import type { DbTelegramChannel } from "@/lib/db/types";

function prismaToChannel(record: TelegramChannel): DbTelegramChannel {
  return {
    id: record.id,
    user_id: record.userId,
    channel_id: record.channelId,
    access_hash: record.accessHash,
    title: record.title,
    username: record.username,
    type: record.type as "CHANNEL" | "BOT" | "USER",
    permissions: record.permissions as any,
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
  };
}

// 获取用户的所有频道
export async function queryUserChannels(
  userId: string,
): Promise<DbTelegramChannel[]> {
  const records = await prisma.telegramChannel.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  return records.map(prismaToChannel);
}

// 创建或更新用户的频道
export async function createOrUpdateUserChannel(
  userId: string,
  channelInfo: DbTelegramChannel,
): Promise<DbTelegramChannel> {
  const record = await prisma.telegramChannel.upsert({
    where: {
      userId_username: {
        userId,
        username: channelInfo.username,
      },
    },
    update: {
      channelId: channelInfo.channel_id,
      accessHash: channelInfo.access_hash,
      title: channelInfo.title,
      type: channelInfo.type,
      permissions: channelInfo.permissions,
      updatedAt: new Date(),
    },
    create: {
      userId,
      channelId: channelInfo.channel_id,
      accessHash: channelInfo.access_hash,
      title: channelInfo.title,
      username: channelInfo.username,
      type: channelInfo.type,
      permissions: channelInfo.permissions,
    },
  });

  return prismaToChannel(record);
}

// 删除用户的频道
export async function deleteChannel(id: string): Promise<void> {
  await prisma.telegramChannel.delete({
    where: {
      id,
    },
  });
}
