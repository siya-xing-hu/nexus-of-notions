import type { WeightRecord } from "@prisma/client";
import prisma from "../../../server/utils/prisma";
import type { DbWeightRecord } from "../types";

function prismaToDb(record: WeightRecord): DbWeightRecord {
  return {
    id: record.id,
    user_id: record.userId,
    weight: Number(record.weight),
    date: record.date.toISOString().split("T")[0],
    created_at: record.createdAt.toISOString(),
  };
}

export async function addWeightRecord(
  user_id: string,
  weight: number,
  date: string,
): Promise<void> {
  const record = await prisma.weightRecord.findUnique({
    where: {
      userId_date: {
        userId: user_id,
        date: new Date(date),
      },
    },
  });
  if (record) {
    await prisma.weightRecord.update({
      where: { id: record.id },
      data: { weight: weight },
    });
  } else {
    await prisma.weightRecord.create({
      data: {
        userId: user_id,
        weight: weight,
        date: new Date(date),
      },
    });
  }
}

export async function queryAllWeightRecords(
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<DbWeightRecord[]> {
  const records = await prisma.weightRecord.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "desc" },
  });

  return records.map((record) => prismaToDb(record));
}
