import { DbUser } from "@/lib/db/types";
import { HttpMethod } from "../index";
import { request } from "../request";

export const userApi = {
  register: (name: string, email: string, password: string) =>
    request("/api/user/register", HttpMethod.POST, {
      body: { data: { name, email, password } },
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
