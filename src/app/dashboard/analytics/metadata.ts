import type { Metadata } from "next";

const siteUrl = "https://contentlens.bhagwatnepal.com.np";

export const metadata: Metadata = {
  title: "Analytics - ContentLens",
  description: "View your ContentLens analytics dashboard. Track analysis activity, confidence scores, categories used, and detailed performance metrics over time.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/dashboard/analytics`,
  },
};

