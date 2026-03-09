import type { Metadata } from "next";

const siteUrl = "https://contentlens.bhagwatnepal.com.np";

export const metadata: Metadata = {
  title: "History - ContentLens",
  description: "View your ContentLens analysis history. Browse and manage all your past content analyses, including summaries, sentiment results, and extracted insights.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/dashboard/history`,
  },
};

