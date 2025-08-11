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
  weightRecord: DbWeightRecord,
): Promise<DbWeightRecord> {
  const record = await prisma.weightRecord.upsert({
    where: {
      userId_date: {
        userId: weightRecord.user_id,
        date: new Date(weightRecord.date),
      },
    },
    update: { weight: weightRecord.weight },
    create: {
      userId: weightRecord.user_id,
      weight: weightRecord.weight,
      date: new Date(weightRecord.date),
    },
  });

  return prismaToDb(record);
}

export async function queryAllWeightRecords(
  userId: number,
  startDate?: Date,
  endDate?: Date,
): Promise<DbWeightRecord[]> {
  const records = await prisma.weightRecord.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    orderBy: { date: "desc" },
  });

  return records.map((record) => prismaToDb(record));
}
