import { DbWeightRecord } from "@/lib/db/types";
import { HttpMethod } from "../index";
import { request } from "../request";

export const weightApi = {
  query: (userId: number) =>
    request("/api/weight", HttpMethod.GET, { query: { userId } }) as Promise<
      DbWeightRecord[]
    >,
  create: (weight: number, date: string, userId: number) =>
    request("/api/weight", HttpMethod.POST, {
      body: { data: { weight, date, userId } },
    }),
};

export type WeightApi = typeof weightApi;
