// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  components: {
    dirs: ["~/components/weight", "~/components/exception"],
  },
  alias: {
    "@api": "~/lib/api",
    "@db": "~/lib/db",
  },

  runtimeConfig: {
    // 私有配置（仅在服务器端可用）
    postgresUrl: process.env.POSTGRES_URL,
  },
  app: {
    head: {
      title: "Nexus of Notions",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "奇思妙想的交汇点" },
      ],
    },
  },
});
