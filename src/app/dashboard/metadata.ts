import type { Metadata } from "next";

const siteUrl = "https://contentlens.bhagwatnepal.com.np";

export const metadata: Metadata = {
  title: "Dashboard - ContentLens",
  description: "Access your ContentLens dashboard to analyze content with AI. View analytics, manage history, and get instant insights on sentiment, tone, keywords, and readability.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/dashboard`,
  },
};

