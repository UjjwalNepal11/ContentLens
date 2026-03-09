import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "../components/ThemeProvider";
import { ScrollRestoreProvider } from "@/components/ScrollRestoreProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://contentlens.bhagwatnepal.com.np";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ContentLens - AI-Powered Content Intelligence",
    template: "%s | ContentLens",
  },
  description:
    "Analyze, summarize, and extract insights from any content with AI-powered content intelligence. Understand sentiment, tone, keywords, and readability in seconds.",
  keywords: [
    "AI content analysis",
    "content intelligence",
    "sentiment analysis",
    "tone detection",
    "keyword extraction",
    "readability scoring",
    "text summarization",
    "AI writing assistant",
    "content analytics",
    "natural language processing",
  ],
  authors: [{ name: "ContentLens Team" }],
  creator: "ContentLens",
  publisher: "ContentLens",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ContentLens",
    title: "ContentLens - AI-Powered Content Intelligence",
    description:
      "Analyze, summarize, and extract insights from any content with AI-powered content intelligence. Understand sentiment, tone, keywords, and readability in seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentLens - AI-Powered Content Intelligence",
    description:
      "Analyze, summarize, and extract insights from any content with AI-powered content intelligence.",
    creator: "@contentlens",
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      en: siteUrl,
    },
  },
  category: "technology",
  classification: "AI Content Analysis Tool",
  verification: {
    google: "VSmaDrkP1GB4Jag58mz_gawBWdIl4u3Zq4lPuLlL5m4",
    yandex: "yandex-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ContentLens",
    description:
      "AI-powered content intelligence platform that provides content analysis, text summarization, sentiment analysis, tone detection, keyword extraction, and readability scoring.",
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "ContentLens",
      url: siteUrl,
    },
    featureList: [
      "AI Content Analysis",
      "Text Summarization",
      "Sentiment Analysis",
      "Tone Detection",
      "Keyword Extraction",
      "Readability Scoring",
      "Multi-mode Analysis",
      "Saved Analysis History",
      "Analytics Dashboard",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ContentLens",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description:
      "AI-powered content intelligence platform for analyzing, summarizing, and extracting insights from content.",
    sameAs: [
      "https://twitter.com/contentlens",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is ContentLens?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ContentLens is an AI-powered content intelligence platform that analyzes, summarizes, and extracts insights from any content. It provides sentiment analysis, tone detection, keyword extraction, readability scoring, and more."
        }
      },
      {
        "@type": "Question",
        name: "How does AI content analysis work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our AI algorithms analyze your content at multiple levels, examining sentiment, tone, keywords, readability, and structure to provide comprehensive insights in seconds."
        }
      },
      {
        "@type": "Question",
        name: "What types of content can I analyze?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can analyze text content including articles, emails, social media posts, reviews, and more. We also support image analysis using OCR technology to extract and analyze text from images."
        }
      },
      {
        "@type": "Question",
        name: "Is my data secure?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we take data security seriously. Your content stays private and secure. We use enterprise-grade security with Clerk authentication and all data is encrypted."
        }
      },
      {
        "@type": "Question",
        name: "What analysis modes are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ContentLens offers multiple analysis modes including General Analysis, Sentiment Analysis, Text Summary, Keyword Extraction, Readability Analysis, and Grammar Check."
        }
      },
      {
        "@type": "Question",
        name: "Can I save my analysis history?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all your analyses are securely stored and accessible anytime through your analytics dashboard. You can view, search, and export your analysis history."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Features",
        item: `${siteUrl}#features`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "How It Works",
        item: `${siteUrl}#how-it-works`
      }
    ]
  };

  const jsonLd = [softwareSchema, organizationSchema, faqSchema, breadcrumbSchema];

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      afterSignOutUrl="/"
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            rel="dns-prefetch"
            href="https://fonts.googleapis.com"
          />
          <link
            rel="dns-prefetch"
            href="https://fonts.gstatic.com"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ScrollRestoreProvider>{children}</ScrollRestoreProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

