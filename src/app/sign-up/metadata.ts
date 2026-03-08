import type { Metadata } from "next";

const siteUrl = "https://contentlens.ai";

export const metadata: Metadata = {
  title: "Sign Up - ContentLens",
  description: "Create your free ContentLens account to start analyzing content with AI. Get instant insights on sentiment, tone, keywords, and readability.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/sign-up`,
  },
};

