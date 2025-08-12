import { DbUser } from "@/lib/db/types";
import { HttpMethod } from "../index";
import { request } from "../request";

export const userApi = {
  register: (name: string, email: string) =>
    request("/api/user/register", HttpMethod.POST, {
      body: { data: { name, email } },
    }) as Promise<DbUser>,
  login: (email: string) =>
    request("/api/user/login", HttpMethod.POST, {
      body: { data: { email } },
    }) as Promise<DbUser>,
  queryById: (id: string) =>
    request("/api/user", HttpMethod.GET, {
      query: { userId: id },
    }) as Promise<DbUser>,
  queryByEmail: (email: string) =>
    request("/api/user", HttpMethod.POST, {
      body: { type: "query_by_email", data: { email } },
    }) as Promise<DbUser>,
  queryAll: () =>
    request("/api/user", HttpMethod.POST, {
      body: { type: "query_all", data: {} },
    }) as Promise<DbUser[]>,
};

export type UserApi = typeof userApi;
