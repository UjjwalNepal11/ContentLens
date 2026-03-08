"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Brain,
  FileText,
  Heart,
  Tag,
  Target,
  History,
  BarChart3,
  Shield,
  Zap,
  Lock,
  Database,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Activity,
  CheckCircle,
  TrendingUp,
  X,
  Menu,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Deep Content Analysis",
    description:
      "Advanced AI algorithms analyze your content at multiple levels for comprehensive insights.",
  },
  {
    icon: FileText,
    title: "Advanced Summarization",
    description:
      "Get concise, accurate summaries that capture the essence of any text.",
  },
  {
    icon: Heart,
    title: "Sentiment & Tone Detection",
    description:
      "Understand emotional context and tone variations in your content instantly.",
  },
  {
    icon: Tag,
    title: "Keyword & Insight Extraction",
    description:
      "Identify key terms, phrases, and topics that drive content impact.",
  },
  {
    icon: Target,
    title: "Readability & Structure Scoring",
    description:
      "Measure readability scores and get suggestions for improvement.",
  },
  {
    icon: History,
    title: "Saved Analysis History",
    description:
      "All your analyses are securely stored and accessible anytime.",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics Dashboard",
    description:
      "Track trends and patterns with beautiful, interactive charts.",
  },
];

const steps = [
  {
    number: "01",
    title: "Input Content",
    description: "Paste your text or upload an image to analyze.",
  },
  {
    number: "02",
    title: "AI Analysis",
    description:
      "Our AI processes your content through multiple analysis layers.",
  },
  {
    number: "03",
    title: "View Insights",
    description:
      "Access detailed results and save to history and export results.",
  },
];

const securityFeatures = [
  {
    icon: Lock,
    title: "Secure Authentication",
    description: "Enterprise-grade security with Clerk",
  },
  {
    icon: Database,
    title: "Private Data",
    description: "Your content stays yours, always",
  },
  {
    icon: Zap,
    title: "Fast Performance",
    description: "Real-time analysis at scale",
  },
  {
    icon: Shield,
    title: "Reliable AI",
    description: "Consistent, accurate results",
  },
];

export default function LandingPage() {
  const [showDashboardPreview, setShowDashboardPreview] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      ".scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale"
    );
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header>
        <nav
          className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  aria-label="ContentLens Home"
                >
                  <Image
                    src="/favicon.ico"
                    alt="ContentLens"
                    className="h-9 w-9 rounded-t-lg rounded-b-lg"
                    width={36}
                    height={36}
                  />
                  <span className="text-xl font-bold tracking-tight">
                    ContentLens
                  </span>
                </Link>
              </div>

              <div className="hidden md:flex items-center gap-8">
                <a
                  href="#features"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="#security"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Security
                </a>
              </div>

              <div className="hidden md:flex items-center gap-3">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>

              <button
                className="md:hidden p-2 rounded-md hover:bg-muted"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {mobileMenuOpen && (
              <div
                className="md:hidden border-t border-border py-4"
                role="menu"
                aria-label="Mobile navigation"
              >
                <div className="flex flex-col space-y-4">
                  <a
                    href="#features"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    How It Works
                  </a>
                  <a
                    href="#dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    Dashboard
                  </a>
                  <a
                    href="#security"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                    onClick={() => setMobileMenuOpen(false)}
                    role="menuitem"
                  >
                    Security
                  </a>
                  <div className="flex flex-col gap-2 pt-2 border-t border-border">
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/sign-up"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        size="sm"
                        className="w-full justify-start"
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section
          className="relative pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-40 lg:pb-32 overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDuration: "3s" }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-700 dark:text-violet-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-violet-200 dark:border-violet-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                AI-Powered Content Intelligence
              </div>

              <h1
                id="hero-heading"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6"
              >
                Analyze Your Content with{" "}
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Intelligence
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-xl lg:max-w-2xl mx-auto px-2 sm:px-0">
                Analyze, summarize, and extract insights from any content.
                Understand sentiment, tone, keywords, and readability in
                seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="gap-2 text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 hover:scale-105"
                  onClick={() => setShowDashboardPreview(true)}
                  aria-label="View the ContentLens dashboard preview"
                >
                  View Dashboard
                </Button>
              </div>
            </div>

            <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
              {[
                {
                  value: "Text & Image",
                  label: "Analysis Types",
                  gradient: "from-violet-600 to-purple-600",
                },
                {
                  value: "6+",
                  label: "Analysis Modes",
                  gradient: "from-cyan-500 to-blue-500",
                },
                {
                  value: "Real-time",
                  label: "Results",
                  gradient: "from-emerald-500 to-teal-500",
                },
                {
                  value: "Secure",
                  label: "Storage",
                  gradient: "from-amber-500 to-orange-500",
                },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div
                    className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="features"
          className="py-16 sm:py-20 lg:py-32 bg-muted/30"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 scroll-animate">
              <h2
                id="features-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
              >
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Analyze Content
                </span>
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto px-2 sm:px-0">
                Powerful AI-driven features to understand your content inside
                and out
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature, i) => {
                const colorSchemes = [
                  {
                    from: "from-violet-500/20",
                    to: "to-purple-500/20",
                    icon: "text-violet-600",
                    hoverIcon: "group-hover:text-violet-600",
                  },
                  {
                    from: "from-cyan-500/20",
                    to: "to-blue-500/20",
                    icon: "text-cyan-600",
                    hoverIcon: "group-hover:text-cyan-600",
                  },
                  {
                    from: "from-emerald-500/20",
                    to: "to-teal-500/20",
                    icon: "text-emerald-600",
                    hoverIcon: "group-hover:text-emerald-600",
                  },
                  {
                    from: "from-amber-500/20",
                    to: "to-orange-500/20",
                    icon: "text-amber-600",
                    hoverIcon: "group-hover:text-amber-600",
                  },
                  {
                    from: "from-rose-500/20",
                    to: "to-pink-500/20",
                    icon: "text-rose-600",
                    hoverIcon: "group-hover:text-rose-600",
                  },
                  {
                    from: "from-indigo-500/20",
                    to: "to-violet-500/20",
                    icon: "text-indigo-600",
                    hoverIcon: "group-hover:text-indigo-600",
                  },
                  {
                    from: "from-blue-500/20",
                    to: "to-cyan-500/20",
                    icon: "text-blue-600",
                    hoverIcon: "group-hover:text-blue-600",
                  },
                ];
                const scheme = colorSchemes[i % colorSchemes.length];
                const delays = [
                  "scroll-delay-1",
                  "scroll-delay-2",
                  "scroll-delay-3",
                  "scroll-delay-4",
                  "scroll-delay-5",
                  "scroll-delay-6",
                  "scroll-delay-7",
                ];
                return (
                  <article
                    key={i}
                    className={`group p-4 sm:p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer scroll-animate ${delays[i % delays.length]}`}
                  >
                    <div
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br ${scheme.from} ${scheme.to} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-all duration-300`}
                    >
                      <feature.icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${scheme.icon} ${scheme.hoverIcon} transition-colors`}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="py-16 sm:py-20 lg:py-32"
          aria-labelledby="how-it-works-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 scroll-animate">
              <h2
                id="how-it-works-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
              >
                How It{" "}
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Works
                </span>
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto px-2 sm:px-0">
                Get insights in three simple steps
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
              {steps.map((step, i) => {
                const colorSchemes = [
                  {
                    from: "from-violet-500/20",
                    to: "to-purple-500/20",
                    text: "text-violet-600",
                    shadow: "shadow-violet-500/10",
                  },
                  {
                    from: "from-cyan-500/20",
                    to: "to-blue-500/20",
                    text: "text-cyan-600",
                    shadow: "shadow-cyan-500/10",
                  },
                  {
                    from: "from-emerald-500/20",
                    to: "to-teal-500/20",
                    text: "text-emerald-600",
                    shadow: "shadow-emerald-500/10",
                  },
                ];
                const scheme = colorSchemes[i % colorSchemes.length];
                const delays = [
                  "scroll-delay-1",
                  "scroll-delay-2",
                  "scroll-delay-3",
                ];
                return (
                  <article
                    key={i}
                    className={`relative text-center group scroll-animate ${delays[i % delays.length]}`}
                  >
                    {i < steps.length - 1 && (
                      <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-px bg-border group-hover:bg-primary/30 transition-colors" />
                    )}

                    <div className="relative inline-flex flex-col items-center">
                      <div
                        className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br ${scheme.from} ${scheme.to} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg ${scheme.shadow}`}
                      >
                        <span
                          className={`text-xl sm:text-2xl font-bold ${scheme.text}`}
                        >
                          {step.number}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs px-2 sm:px-0 group-hover:text-foreground transition-colors">
                        {step.description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="dashboard"
          className="py-16 sm:py-20 lg:py-32 bg-muted/30"
          aria-labelledby="dashboard-heading"
        >
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 scroll-animate">
              <h2
                id="dashboard-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
              >
                Powerful{" "}
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </span>
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto px-2 sm:px-0">
                Track your content performance with beautiful visualizations
              </p>
            </div>

            <div className="mx-auto max-w-6xl">
              <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
                <div className="border-b border-border p-3 sm:p-4 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Menu
                      className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      ContentLens Analytics
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-card p-3 sm:p-6 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                            <Activity
                              className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-cyan-600 dark:text-cyan-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="flex items-center text-xs font-medium text-emerald-500">
                            <TrendingUp className="mr-1 h-3 w-3" />
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-4">
                          <p className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">
                            1,247
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            Total Analyses
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-card p-3 sm:p-6 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <Target
                              className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-amber-600 dark:text-amber-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="flex items-center text-xs font-medium text-emerald-500">
                            <TrendingUp className="mr-1 h-3 w-3" />
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-4">
                          <p className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            87.5%
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            Avg. Confidence
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-card p-3 sm:p-6 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                            <CheckCircle
                              className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-emerald-600 dark:text-emerald-400"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="flex items-center text-xs font-medium text-emerald-500">
                            <TrendingUp className="mr-1 h-3 w-3" />
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-4">
                          <p className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            24
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            Categories Used
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-card p-3 sm:p-6 shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20">
                            <Zap
                              className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-rose-600 dark:text-rose-400"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-4">
                          <p className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                            15
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            Today&apos;s Activity
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 px-3 sm:px-6">
                  <div className="rounded-xl bg-card p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-border">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                        Activity Trend
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Daily activity over the past week
                      </p>
                    </div>
                    <div className="h-32 sm:h-40 lg:h-48 flex items-end gap-1 sm:gap-2">
                      {[35, 45, 30, 55, 70, 60, 80].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-cyan-500/60 hover:bg-cyan-500 transition-colors relative group"
                          style={{ height: `${h}%` }}
                          aria-label={`${h} analyses on day ${i + 1}`}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {h} analyses
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-card p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-border">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold tracking-tight">
                        Weekly Performance
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Analyses and average confidence by week
                      </p>
                    </div>
                    <div className="h-32 sm:h-40 lg:h-48 flex items-end gap-1 sm:gap-2">
                      {[40, 55, 45, 70, 85].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-violet-500/60 hover:bg-violet-500 transition-colors relative group"
                          style={{ height: `${h}%` }}
                          aria-label={`${h} analyses in week ${i + 1}`}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {h} analyses
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>4 wks</span>
                      <span>3 wks</span>
                      <span>2 wks</span>
                      <span>Last</span>
                      <span>This</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-card p-6 shadow-sm border border-border m-3 sm:m-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Activity Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">
                        Most Recent Analysis
                      </span>
                      <span className="font-medium">General</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">
                        Latest Confidence
                      </span>
                      <span className="font-medium">92.5%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">
                        Total Categories Found
                      </span>
                      <span className="font-medium">156</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">
                        Analysis Types Used
                      </span>
                      <span className="font-medium">8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="security"
          className="py-16 sm:py-20 lg:py-32"
          aria-labelledby="security-heading"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 scroll-animate">
              <h2
                id="security-heading"
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
              >
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Security
                </span>{" "}
                & Reliability
              </h2>
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto px-2 sm:px-0">
                Enterprise-grade security for your content and data
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {securityFeatures.map((feature, i) => {
                const colorSchemes = [
                  {
                    from: "from-emerald-500/20",
                    to: "to-green-500/20",
                    icon: "text-emerald-600",
                    shadow: "shadow-emerald-500/10",
                  },
                  {
                    from: "from-blue-500/20",
                    to: "to-indigo-500/20",
                    icon: "text-blue-600",
                    shadow: "shadow-blue-500/10",
                  },
                  {
                    from: "from-violet-500/20",
                    to: "to-purple-500/20",
                    icon: "text-violet-600",
                    shadow: "shadow-violet-500/10",
                  },
                  {
                    from: "from-amber-500/20",
                    to: "to-orange-500/20",
                    icon: "text-amber-600",
                    shadow: "shadow-amber-500/10",
                  },
                ];
                const scheme = colorSchemes[i % colorSchemes.length];
                return (
                  <article
                    key={i}
                    className="p-4 sm:p-6 rounded-xl border border-border bg-card text-center group hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div
                      className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br ${scheme.from} ${scheme.to} flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg ${scheme.shadow}`}
                    >
                      <feature.icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${scheme.icon}`}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-60 px-2 sm:px-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle2
                  className="h-3 w-3 sm:h-4 sm:w-4 text-primary"
                  aria-hidden="true"
                />
                SOC 2 Compliant
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle2
                  className="h-3 w-3 sm:h-4 sm:w-4 text-primary"
                  aria-hidden="true"
                />
                GDPR Ready
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle2
                  className="h-3 w-3 sm:h-4 sm:w-4 text-primary"
                  aria-hidden="true"
                />
                256-bit Encryption
              </div>
            </div>
          </div>
        </section>

        <section
          className="py-16 sm:py-20 lg:py-32 bg-primary/5 relative overflow-hidden"
          aria-labelledby="cta-heading"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-primary/5" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
          </div>

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative scroll-animate">
            <h2
              id="cta-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4"
            >
              Ready to{" "}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Analyze Your Content?
              </span>
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto px-2 sm:px-0">
              Join the growing community of creators who trust ContentLens for
              their AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="gap-2 text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
                >
                  Start Analyzing Now{" "}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t border-border" role="contentinfo">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2"
                aria-label="ContentLens Home"
              >
                <Image
                  src="/favicon.ico"
                  alt="ContentLens"
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-t-lg rounded-b-lg"
                  width={28}
                  height={28}
                />
                <span className="font-semibold text-sm sm:text-base">
                  ContentLens
                </span>
              </Link>
            </div>

            <nav
              className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground"
              aria-label="Footer navigation"
            >
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                Support
              </Link>
            </nav>

            <div className="text-xs sm:text-sm text-muted-foreground">
              © {new Date().getFullYear()} ContentLens. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {showDashboardPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashboard-preview-title"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDashboardPreview(false)}
            aria-hidden="true"
          />

          <div className="relative bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border bg-muted/20 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <Menu
                  className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="text-xs sm:text-sm text-muted-foreground">
                  ContentLens Dashboard
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDashboardPreview(false)}
                aria-label="Close dashboard preview"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <div className="p-3 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4">
              <div className="pt-1 sm:pt-2">
                <h1
                  id="dashboard-preview-title"
                  className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block"
                >
                   Analysis Dashboard
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs sm:text-sm">
                  <span
                    className="inline-block w-2 h-2 bg-green-500 rounded-full"
                    aria-hidden="true"
                  ></span>
                  Analyze your text or images with advanced AI models
                </p>
              </div>

              <div className="flex border-b border-border -mx-3 sm:-mx-4 px-2 overflow-x-auto">
                <button
                  type="button"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 border-primary text-primary whitespace-nowrap"
                  aria-current="page"
                >
                  <span className="flex items-center gap-1 sm:gap-2">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Text Analysis
                  </span>
                </button>
                <button
                  type="button"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  <span className="flex items-center gap-1 sm:gap-2">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    Image Analysis
                  </span>
                </button>
              </div>

              <div className="bg-card border border-border p-3 sm:p-4 rounded-xl">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label
                      htmlFor="text-to-analyze"
                      className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2"
                    >
                      Text to Analyze
                    </label>
                    <textarea
                      id="text-to-analyze"
                      placeholder="Enter your text here..."
                      className="w-full h-20 sm:h-28 p-2 sm:p-3 border border-input rounded-md resize-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground text-xs sm:text-sm"
                      defaultValue="ContentLens has transformed how I analyze my content. The AI-powered insights help me understand my audience better and create more engaging content. I highly recommend this tool for content creators!"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="analysis-type"
                      className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-2"
                    >
                      Analysis Type (Optional)
                    </label>
                    <select
                      id="analysis-type"
                      className="w-full p-2 border border-input rounded-md bg-background text-foreground text-xs sm:text-sm"
                      defaultValue="general"
                    >
                      <option value="general">General Analysis</option>
                      <option value="sentiment">Sentiment Analysis</option>
                      <option value="summary">Text Summary</option>
                      <option value="keywords">Keyword Extraction</option>
                      <option value="readability">Readability Analysis</option>
                    </select>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm">
                    Analyze Text
                  </Button>
                </div>
              </div>

              {/* Analysis Result */}
              <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <div className="bg-muted/50 p-4 border-b border-border">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs font-medium shadow-sm">
                          General Analysis
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Just now
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        <span className="font-medium">Input:</span> ContentLens has transformed how I analyze my content. The AI-powered insights help me understand my audience better and create more engaging content. I highly recommend this tool for content creators!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* Confidence Score */}
                  <div className="text-center pb-3 border-b border-border">
                    <div className="inline-flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary">87%</span>
                      <span className="text-sm text-muted-foreground">Confidence Score</span>
                    </div>
                  </div>

                  {/* Sentiment Analysis */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Sentiment Analysis</h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium shadow-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                        positive
                      </span>
                      <span className="text-xs text-muted-foreground">Score: 0.85</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2.5 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-xs shadow-sm">Enthusiasm: 78%</span>
                      <span className="px-2.5 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-xs shadow-sm">Interest: 65%</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      This positive content discusses the benefits of ContentLens for content creators. The text highlights how AI-powered insights help understand audiences better and create more engaging content.
                    </p>
                    <div className="mt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Key Points:</p>
                      <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                        <li>ContentLens transforms content analysis workflow</li>
                        <li>AI-powered insights improve audience understanding</li>
                        <li>Tool is highly recommended for content creators</li>
                      </ul>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {["ContentLens", "AI-powered", "content creators", "audience", "insights"].map((keyword, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs font-medium shadow-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Topics */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Topics</h4>
                    <div className="flex flex-wrap gap-1">
                      {["Technology", "Content Marketing", "AI Tools"].map((topic, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-xs font-medium shadow-sm">
                          {topic}
                        </span>
                      ))}
                  </div>
                </div>

                  {/* Readability */}
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Readability</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-muted-foreground">Grade Level</p>
                        <p className="font-medium text-foreground">Grade 8</p>
                </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-muted-foreground">Clarity Score</p>
                        <p className="font-medium text-foreground">85</p>
                    </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <p className="text-muted-foreground">Complexity</p>
                        <p className="font-medium text-foreground capitalize">Easy</p>
                    </div>
                    </div>
                  </div>
                </div>

                {/* Insights Section */}
                <div className="border-t border-border p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Insights
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Intent</p>
                      <p className="text-sm bg-muted/50 rounded-md p-2">Inform and Persuade</p>
    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tone Analysis</p>
                      <p className="text-sm bg-muted/50 rounded-md p-2">Professional, Enthusiastic, and Friendly</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Audience Suitability</p>
                      <p className="text-sm bg-muted/50 rounded-md p-2">General Audience, Content Creators, Marketing Professionals</p>
                    </div>
                  </div>
                </div>

                {/* Suggested Improvements Section */}
                <div className="border-t border-border p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Suggested Improvements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">1</span>
                      <p className="text-sm text-foreground">Add more specific examples to strengthen your recommendations</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">2</span>
                      <p className="text-sm text-foreground">Include case studies to build more credibility</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">3</span>
                      <p className="text-sm text-foreground">Consider adding visual elements to break up text</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border/30">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">4</span>
                      <p className="text-sm text-foreground">Add a clear call-to-action at the end</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
