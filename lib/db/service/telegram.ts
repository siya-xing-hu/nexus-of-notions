import { prisma } from "@/stores/prisma";

export async function getActiveTelegramSessionByUserId(userId: string) {
  return prisma.telegramSession.findFirst({
    where: {
      userId: userId,
      isActive: true,
    },
  });
}

export async function getTelegramSessionByUserIdAndPhone(
  userId: string,
  phoneNumber: string,
) {
  return prisma.telegramSession.findFirst({
    where: {
      userId: userId,
      phoneNumber: phoneNumber,
    },
  });
}

export async function readTelegramSessionData(
  userId: string,
  phoneNumber: string,
): Promise<Record<string, any>> {
  const session = await getTelegramSessionByUserIdAndPhone(userId, phoneNumber);
  return ((session?.sessionData as unknown) as Record<string, any>) || {};
}

export async function writeTelegramSessionData(
  userId: string,
  phoneNumber: string,
  partialData: Record<string, any>,
) {
  const existing = await getTelegramSessionByUserIdAndPhone(
    userId,
    phoneNumber,
  );
  if (existing) {
    partialData = {
      ...(existing.sessionData as Record<string, any>),
      ...partialData,
    };
    return prisma.telegramSession.update({
      where: {
        id: existing.id,
      },
      data: { sessionData: partialData, isActive: true },
    });
  }
  return prisma.telegramSession.create({
    data: {
      userId: userId,
      phoneNumber: phoneNumber,
      sessionData: partialData,
    },
  });
}

export async function deactivateTelegramSession(
  userId: string,
  phoneNumber: string,
) {
  const session = await getTelegramSessionByUserIdAndPhone(userId, phoneNumber);
  if (!session) {
    return null;
  }

  return prisma.telegramSession.update({
    where: {
      id: session.id,
    },
    data: { isActive: false },
  });
}

// 兼容性函数，保持向后兼容
export async function getActiveTelegramSession() {
  return prisma.telegramSession.findFirst({ where: { isActive: true } });
}

export async function getTelegramSessionByPhoneNumber(phoneNumber: string) {
  return prisma.telegramSession.findFirst({
    where: { phoneNumber: phoneNumber },
  });
}
