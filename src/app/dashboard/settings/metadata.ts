import type { Metadata } from "next";

const siteUrl = "https://contentlens.bhagwatnepal.com.np";

export const metadata: Metadata = {
  title: "Settings - ContentLens",
  description: "Manage your ContentLens account settings. Update your profile, configure notifications, change password, and manage your data preferences.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/dashboard/settings`,
  },
};

