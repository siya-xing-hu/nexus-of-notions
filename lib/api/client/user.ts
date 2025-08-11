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
};

export type UserApi = typeof userApi;
