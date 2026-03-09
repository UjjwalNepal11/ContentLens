import type { Metadata } from "next";

const siteUrl = "https://contentlens.bhagwatnepal.com.np";

export const metadata: Metadata = {
  title: "Account Settings - ContentLens",
  description: "Manage your ContentLens account settings. Update your profile, configure appearance, manage notifications, and control your data.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/settings`,
  },
};

