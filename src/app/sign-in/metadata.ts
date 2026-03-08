import type { Metadata } from "next";

const siteUrl = "https://contentlens.ai";

export const metadata: Metadata = {
  title: "Sign In - ContentLens",
  description: "Sign in to your ContentLens account to access AI-powered content intelligence, analytics dashboard, and saved analysis history.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/sign-in`,
  },
};

