// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon"],
  components: {
    dirs: [
      "~/components/weight",
      "~/components/exception",
      "~/components/gomoku",
      "~/components/telegram",
    ],
  },
  alias: {
    "@api": "~/lib/api",
    "@db": "~/lib/db",
  },

  runtimeConfig: {
    // 私有配置（仅在服务器端可用）
    postgresUrl: process.env.POSTGRES_URL,
    telegramApiId: process.env.TELEGRAM_API_ID,
    telegramApiHash: process.env.TELEGRAM_API_HASH,
    telegramSessionDir: process.env.TELEGRAM_SESSION_DIR,
  },

  // Vercel部署配置
  nitro: {
    preset: "vercel",
  },

  app: {
    head: {
      title: "Nexus of Notions",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "奇思妙想的交汇点" },
      ],
      link: [
        // SVG图标（现代浏览器优先）
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        // 标准favicon（兼容性）
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        // 现代浏览器支持的PNG图标
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        // Apple设备图标
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        // Android设备图标
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/android-chrome-192x192.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "512x512",
          href: "/android-chrome-512x512.png",
        },
        // Web App Manifest
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
});
