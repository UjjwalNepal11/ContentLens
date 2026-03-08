import { MetadataRoute } from "next";

const siteUrl = "https://contentlens.ai";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/api",
          "/settings",
          "/profile",
          "/user",
          "/private",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: [
          "/dashboard",
          "/api",
          "/settings",
          "/profile",
        ],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: [
          "/dashboard",
          "/api",
          "/settings",
          "/profile",
        ],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "BingBot",
        allow: "/",
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

