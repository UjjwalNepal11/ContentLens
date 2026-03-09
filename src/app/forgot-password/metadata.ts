import type { Metadata } from "next";

const siteUrl = "https://contentlens.bhagwatnepal.com.np";

export const metadata: Metadata = {
  title: "Forgot Password - ContentLens",
  description: "Reset your ContentLens password. Enter your email to receive a verification code and create a new password.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/forgot-password`,
  },
};

