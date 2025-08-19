import { prisma } from "@/stores/prisma";

export async function getActiveTelegramSession() {
  return prisma.telegramSession.findFirst({ where: { isActive: true } });
}

export async function getTelegramSessionByPhoneNumber(phoneNumber: string) {
  return prisma.telegramSession.findUnique({ where: { phoneNumber } });
}

export async function readTelegramSessionData(
  phoneNumber: string,
): Promise<Record<string, any>> {
  const session = await getTelegramSessionByPhoneNumber(phoneNumber);
  return ((session?.sessionData as unknown) as Record<string, any>) || {};
}

export async function writeTelegramSessionData(
  phoneNumber: string,
  partialData: Record<string, any>,
) {
  const existing = await getTelegramSessionByPhoneNumber(phoneNumber);
  if (existing) {
    partialData = {
      ...(existing.sessionData as Record<string, any>),
      ...partialData,
    };
    return prisma.telegramSession.update({
      where: { phoneNumber },
      data: { sessionData: partialData, isActive: true },
    });
  }
  return prisma.telegramSession.create({
    data: { phoneNumber, sessionData: partialData },
  });
}

export async function deactivateTelegramSession(phoneNumber: string) {
  return prisma.telegramSession.update({
    where: { phoneNumber },
    data: { isActive: false },
  });
}


