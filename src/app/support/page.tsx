"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  MessageCircle,
  Mail,
  FileText,
  Book,
  ChevronRight,
  ChevronDown,
  Send,
  CheckCircle2,
  ExternalLink,
  Zap,
  ImageIcon,
  History,
  BarChart3,
  Menu,
  X,
  Code,
  Github,
  Linkedin,
  Globe,
  Shield,
  Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const gettingStartedArticles = [
  {
    title: "Getting Started with AI Analysis",
    description: "Learn how to use the dashboard to analyze text and images",
    icon: Zap,
    content: `Welcome to the ContentLens Dashboard! This guide will help you get started with analyzing your content.

## How to Analyze Text

1. Navigate to the Dashboard page
2. Make sure you're on the "Text Analysis" tab
3. Enter your text in the text area
4. Optionally select an analysis type (General, Sentiment, Summary, etc.)
5. Click "Analyze Text" or press Ctrl+Enter
6. View your results below

## How to Analyze Images

1. Click on the "Image Analysis" tab
2. Upload an image by dragging and dropping or clicking to select
3. Choose an analysis type (optional)
4. Click "Analyze Image"
5. The system will extract text from your image and analyze it

## Keyboard Shortcuts

• Press N to focus on the text input
• Press T to switch to Text Analysis tab
• Press I to switch to Image Analysis tab
• Press Ctrl+Enter to submit analysis
• Press [ or ] to navigate between results`
  },
  {
    title: "Understanding Your Results",
    description: "Learn how to interpret analysis results and metrics",
    icon: BarChart3,
    content: `## Analysis Results Explained

After running an analysis, you'll receive detailed results including:

### Confidence Score
A percentage indicating how confident the AI is in its analysis. Higher scores mean more reliable results.

### Sentiment Analysis
Shows the overall emotional tone of your text:
• Positive: Content expresses positive emotions
• Negative: Content expresses negative emotions
• Mixed: Content has both positive and negative elements
• Neutral: Content is factual without strong emotions

### Summary
A detailed summary of your content's main points and key takeaways.

### Keywords & Topics
Extracted keywords and topics that represent the main themes in your content.

### Readability
• Grade Level: Reading difficulty (1-12+)
• Clarity Score: How easy the text is to understand
• Complexity: Simple, Moderate, or Complex

### Improvements
Suggestions for improving your content based on the analysis.`
  },
  {
    title: "Viewing Analysis History",
    description: "Track and revisit your past analyses",
    icon: History,
    content: `## Accessing Your History

Your analysis history is automatically saved and can be accessed from the History page in the sidebar.

### Features:
• View all past analyses with timestamps
• Filter by date, type, or search term
• Re-view detailed results from previous analyses
• Delete unwanted history entries

### Note:
Your analysis history is stored locally in your browser. Clearing browser data will remove your history.`
  },
  {
    title: "Image Analysis Tips",
    description: "Get the best results from image analysis",
    icon: ImageIcon,
    content: `## Tips for Image Analysis

### Best Practices:
1. Use clear, high-resolution images
2. Ensure text in images is readable
3. Avoid images with heavy filters or effects
4. Supported formats: JPEG, PNG, GIF, WebP, BMP, SVG
5. Maximum file size: 5MB

### How It Works:
The system uses OCR (Optical Character Recognition) to extract text from images, then analyzes the extracted text for sentiment, keywords, topics, and more.

### Limitations:
• Handwritten text may not be accurately recognized
• Low-quality images may produce less accurate results
• Images without text will still be analyzed visually`
  }
];

const faqItems = [
  {
    question: "How do I reset my password?",
    answer: "Go to Settings > Privacy > Security > Change Password. If you've forgotten your password, click 'Forgot Password' on the sign-in page."
  },
  {
    question: "What analysis types are available?",
    answer: "We offer General Analysis, Sentiment Analysis, Text Summary, Keyword Extraction, Readability Analysis, and Grammar Check. You can select the type before analyzing."
  },
  {
    question: "How do I view my analysis history?",
    answer: "Click on 'History' in the sidebar navigation. You can view all your past analyses, filter by date or type, and re-view detailed results."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption and security practices. Your analyses are stored securely and you can delete your data at any time."
  },
  {
    question: "What image formats are supported?",
    answer: "We support JPEG, PNG, GIF, WebP, BMP, and SVG formats. Maximum file size is 5MB."
  },
  {
    question: "How accurate is the sentiment analysis?",
    answer: "Our AI model provides high accuracy, typically 85-95% for clear sentiment. Results include a confidence score to help you gauge reliability."
  },
  {
    question: "Can I delete my analysis history?",
    answer: "Yes, you can clear your history from the History page or go to Settings > Data > Clear All Data to remove all stored information."
  }
];

export default function SupportPage() {
  const router = useRouter();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
const [showFaq, setShowFaq] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const errors = {
      name: "",
      email: "",
      subject: "",
      message: ""
    };
    let isValid = true;

    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    } else if (!nameRegex.test(formData.name.trim())) {
      errors.name = "Name should contain only letters";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
      isValid = false;
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const section = searchParams.get('section');
    const article = searchParams.get('article');

    if (section === 'faq') {
      setShowFaq(true);
    } else if (section === 'contact') {
      setShowContact(true);
    } else if (section === 'article' && article) {
      setSelectedArticle(parseInt(article, 10));
    } else if (section === 'about') {
      setShowAbout(true);
    } else if (section === 'privacy') {
      setShowPrivacy(true);
    } else if (section === 'terms') {
      setShowTerms(true);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const section = searchParams.get('section');
      const article = searchParams.get('article');

      setSelectedArticle(null);
      setShowFaq(false);
      setShowContact(false);
      setShowAbout(false);
      setShowPrivacy(false);
      setShowTerms(false);

      if (section === 'faq') {
        setShowFaq(true);
      } else if (section === 'contact') {
        setShowContact(true);
      } else if (section === 'article' && article) {
        setSelectedArticle(parseInt(article, 10));
      } else if (section === 'about') {
        setShowAbout(true);
      } else if (section === 'privacy') {
        setShowPrivacy(true);
      } else if (section === 'terms') {
        setShowTerms(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const updateUrl = (section: string | null, articleIndex?: number) => {
    const params = new URLSearchParams(window.location.search);
    if (section) {
      params.set('section', section);
    } else {
      params.delete('section');
    }
    if (articleIndex !== undefined) {
      params.set('article', articleIndex.toString());
    } else {
      params.delete('article');
    }
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.pushState({}, '', newUrl);
  };

  const handleArticleClick = (index: number) => {
    const newArticle = selectedArticle === index ? null : index;
    setSelectedArticle(newArticle);
    setShowFaq(false);
    setShowContact(false);
    updateUrl(newArticle !== null ? 'article' : null, newArticle ?? undefined);
  };

  const handleFaqClick = () => {
    const newShowFaq = !showFaq;
    setShowFaq(newShowFaq);
    setSelectedArticle(null);
    setShowContact(false);
    updateUrl(newShowFaq ? 'faq' : null);
  };

const handleContactClick = () => {
    const newShowContact = !showContact;
    setShowContact(newShowContact);
    setSelectedArticle(null);
    setShowFaq(false);
    setShowAbout(false);
    updateUrl(newShowContact ? 'contact' : null);
  };

const handleAboutClick = () => {
    const newShowAbout = !showAbout;
    setShowAbout(newShowAbout);
    setSelectedArticle(null);
    setShowFaq(false);
    setShowContact(false);
    setShowPrivacy(false);
    setShowTerms(false);
    updateUrl(newShowAbout ? 'about' : null);
  };

const handlePrivacyClick = () => {
    const newShowPrivacy = !showPrivacy;
    setShowPrivacy(newShowPrivacy);
    setSelectedArticle(null);
    setShowFaq(false);
    setShowContact(false);
    setShowAbout(false);
    setShowTerms(false);
    updateUrl(newShowPrivacy ? 'privacy' : null);
  };

  const handleTermsClick = () => {
    const newShowTerms = !showTerms;
    setShowTerms(newShowTerms);
    setSelectedArticle(null);
    setShowFaq(false);
    setShowContact(false);
    setShowAbout(false);
    setShowPrivacy(false);
    updateUrl(newShowTerms ? 'terms' : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormSubmitted(true);
      } else {
        console.error('Failed to submit support message:', data.error || 'Unknown error');
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting support message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      {}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            <Link href={isSignedIn ? "/dashboard" : "/"} className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-zinc-900 dark:text-zinc-100">Support</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Support Center
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl">
            Find answers to your questions or get in touch with our team
          </p>
        </div>
      </div>

      {}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 transition-all duration-200 hover:scale-[1.02]"
          >
            <span className="font-medium">Menu</span>
            {mobileMenuOpen ? <X className="h-5 w-5 transition-transform duration-200 rotate-90" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 lg:gap-8">
          {}
          <div className={`lg:col-span-1 space-y-4 lg:space-y-6 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            {}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <div className="p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-blue-600 to-blue-700">
                <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
                  <Book className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="truncate">Getting Started</span>
                </h2>
              </div>
              <div className="p-1.5 lg:p-2">
                {gettingStartedArticles.map((article, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleArticleClick(index);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-left transition-all duration-200 min-h-[44px] lg:min-h-0 hover:scale-[1.02] ${
                      selectedArticle === index
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <article.icon className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
                    <span className="text-sm font-medium truncate">{article.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <button
                onClick={() => {
                  handleFaqClick();
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-between ${
                  showFaq ? "bg-green-700" : ""
                }`}
              >
                <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="truncate">FAQs</span>
                </h2>
                <ChevronRight className={`h-4 w-4 text-white transition-transform ${showFaq ? "rotate-90" : ""}`} />
              </button>
              {showFaq && (
                <div className="p-3 lg:p-4">
                  <p className="text-xs lg:text-sm text-zinc-500 dark:text-zinc-400">
                    Click to view in main area
                  </p>
                </div>
              )}
            </div>

              {}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <button
                onClick={() => {
                  handleContactClick();
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-between ${
                  showContact ? "bg-purple-700" : ""
                }`}
              >
                <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="truncate">Contact Us</span>
                </h2>
                <ChevronRight className={`h-4 w-4 text-white transition-transform ${showContact ? "rotate-90" : ""}`} />
              </button>
              {showContact && (
                <div className="p-3 lg:p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <a href="mailto:ujjwalnepal32@gmail.com" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate">ujjwalnepal32@gmail.com</a>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    We usually respond within 24 hours
                  </p>
                </div>
              )}
            </div>

{}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <button
                onClick={() => {
                  handleAboutClick();
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-amber-600 to-orange-700 flex items-center justify-between ${
                  showAbout ? "bg-orange-700" : ""
                }`}
              >
                <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
                  <Code className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="truncate">About Developer</span>
                </h2>
                <ChevronRight className={`h-4 w-4 text-white transition-transform ${showAbout ? "rotate-90" : ""}`} />
              </button>
              {showAbout && (
                <div className="p-3 lg:p-4 space-y-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Click to view developer info
                  </p>
                </div>
              )}
            </div>

            {}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <button
                onClick={() => {
                  handlePrivacyClick();
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-cyan-600 to-blue-700 flex items-center justify-between ${
                  showPrivacy ? "bg-blue-700" : ""
                }`}
              >
                <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="truncate">Privacy Policy</span>
                </h2>
                <ChevronRight className={`h-4 w-4 text-white transition-transform ${showPrivacy ? "rotate-90" : ""}`} />
              </button>
              {showPrivacy && (
                <div className="p-3 lg:p-4 space-y-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Click to view privacy policy
                  </p>
                </div>
              )}
            </div>

            {}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <button
                onClick={() => {
                  handleTermsClick();
                  setMobileMenuOpen(false);
                }}
                className={`w-full p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-700 bg-gradient-to-r from-rose-600 to-pink-700 flex items-center justify-between ${
                  showTerms ? "bg-pink-700" : ""
                }`}
              >
                <h2 className="text-base lg:text-lg font-semibold text-white flex items-center gap-2">
                  <Scale className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="truncate">Terms of Service</span>
                </h2>
                <ChevronRight className={`h-4 w-4 text-white transition-transform ${showTerms ? "rotate-90" : ""}`} />
              </button>
              {showTerms && (
                <div className="p-3 lg:p-4 space-y-3">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Click to view terms of service
                  </p>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="lg:col-span-2">
            {}
            {selectedArticle !== null && gettingStartedArticles[selectedArticle] && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-6 md:mb-8">
                <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0">
                      {(() => {
                        const ArticleIcon = gettingStartedArticles[selectedArticle].icon;
                        return <ArticleIcon className="h-5 w-5" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {gettingStartedArticles[selectedArticle].title}
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {gettingStartedArticles[selectedArticle].description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6 prose prose-zinc dark:prose-invert max-w-none text-sm md:text-base">
                  {gettingStartedArticles[selectedArticle].content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h3 key={i} className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-6 mb-3">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('### ')) {
                      return <h4 key={i} className="text-md font-semibold text-zinc-900 dark:text-zinc-100 mt-4 mb-2">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('• ')) {
                      return <li key={i} className="text-zinc-600 dark:text-zinc-400 ml-4">{line.replace('• ', '')}</li>;
                    }
                    if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
                      return <p key={i} className="text-zinc-600 dark:text-zinc-400 ml-4 mb-2">{line}</p>;
                    }
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    return <p key={i} className="text-zinc-600 dark:text-zinc-400 mb-2">{line}</p>;
                  })}
                </div>
              </div>
            )}

            {}
            {showFaq && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-6 md:mb-8">
                <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-700">
                  <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Frequently Asked Questions
                  </h2>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {faqItems.map((faq, index) => (
                    <div key={index} className="border-b border-zinc-200 dark:border-zinc-700 last:border-b-0">
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <span className="text-sm md:text-base font-semibold text-zinc-900 dark:text-zinc-100 pr-4">
                          {faq.question}
                        </span>
                        <ChevronDown className={`h-4 w-4 md:h-5 md:w-5 text-zinc-500 dark:text-zinc-400 flex-shrink-0 transition-transform ${openFaqIndex === index ? "rotate-180" : ""}`} />
                      </button>
                      {openFaqIndex === index && (
                        <div className="px-4 md:px-6 pb-4 md:pb-6">
                          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

{}
            {showAbout && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-6 md:mb-8">
                <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-600 dark:text-amber-400 flex-shrink-0">
                      <Code className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        About the Developer
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Meet the creator of this application
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6">
{}
                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-amber-500">
                        <img
                          src="/developer-photo.png"
                          alt="Ujjwal Nepal"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                        Bhagwat Nepal
                      </h3>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-3">
                        Full Stack Developer & AI Enthusiast
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Passionate about building intelligent applications and creating seamless user experiences.
                        This AI Analysis Dashboard is a demonstration of combining modern web technologies with
                        artificial intelligence to provide powerful text and image analysis capabilities.
                      </p>
                    </div>
                  </div>

                  {}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                      Technologies & Skills Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["TypeScript", "React", "Next.js", "Node.js", "Prisma", "PostgreSQL", "Tailwind CSS","Clerk", "Google Generative AI"].map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {}
                  <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                      Connect with Me
                    </h4>
                  <div className="flex flex-wrap gap-3">
                      <a
                        href="mailto:ujjwalnepal32@gmail.com"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                    </a>
                      <a
                        href="https://github.com/UjjwalNepal11"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                    </a>
                      <a
                        href="https://linkedin.com/in/ujjwal-nepal-89a22139b"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </a>
                      <a
                        href="https://bhagwatnepal.com.np"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                    </a>
                  </div>
                </div>

                 {}
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Thank you for using this application! If you have any feedback or suggestions,
                      please don't hesitate to reach out. Your input helps make this tool better for everyone.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {showPrivacy && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-6 md:mb-8">
                <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Privacy Policy
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Your privacy is important to us
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <p><strong>Last Updated:</strong> March 2026</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">1. Information We Collect</h3>
                  <p>We collect information you provide directly to us, including: name, email address, and any messages you send through our contact form. We also collect usage data and analytics to improve our services.</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">2. How We Use Your Information</h3>
                  <p>We use the information we collect to: provide, maintain, and improve our services; respond to your comments and questions; send you technical notices, updates, and support messages.</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">3. Data Security</h3>
                  <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">4. Your Rights</h3>
                  <p>You have the right to access, update, or delete your personal information at any time. You can also opt out of certain communications from us.</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">5. Contact Us</h3>
                  <p>If you have any questions about this Privacy Policy, please contact us at ujjwalnepal32@gmail.com</p>
                </div>
              </div>
            )}

            {}
            {showTerms && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-6 md:mb-8">
                <div className="p-4 md:p-6 border-b border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-600 dark:text-rose-400 flex-shrink-0">
                      <Scale className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Terms of Service
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Please read our terms carefully
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <p><strong>Last Updated:</strong> March 2026</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">1. Acceptance of Terms</h3>
                  <p>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">2. Use License</h3>
                  <p>Permission is granted to temporarily use this application for personal, non-commercial use only. This is the grant of a license, not a transfer of title.</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">3. Disclaimer</h3>
                  <p>This application is provided "as is". The application makes no warranties, expressed or implied, and hereby disclaims all other warranties.</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">4. Limitations</h3>
                  <p>In no event shall the application or its suppliers be liable for any damages arising out of the use or inability to use the materials on this application.</p>

                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-4">5. Contact Information</h3>
                  <p>For questions about these Terms of Service, please contact us at ujjwalnepal32@gmail.com</p>
                </div>
              </div>
            )}

            {}
            {selectedArticle === null && !showFaq && !showContact && !showAbout && !showPrivacy && !showTerms && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden mb-8">
                <div className="p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-4">
                    <Book className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Welcome to the Support Center
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                    Select a topic from the sidebar to get started, or browse our FAQs.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => handleArticleClick(0)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Get Started Guide
                    </Button>
                    <Button
                      onClick={handleFaqClick}
                      variant="outline"
                    >
                      Browse FAQs
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {}
            {showContact && (
            <div id="contact-form" className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Contact Support
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Can't find what you're looking for? Send us a message.
                </p>
              </div>
              <div className="p-6">
                {!formSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                          }}
                          error={formErrors.name}
                          required
                          className="h-11"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Email
                        </label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                          }}
                          error={formErrors.email}
                          required
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Subject
                      </label>
                      <Input
                        type="text"
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => {
                          setFormData({ ...formData, subject: e.target.value });
                          if (formErrors.subject) setFormErrors({ ...formErrors, subject: "" });
                        }}
                        error={formErrors.subject}
                        required
                        className="h-11"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Message
                      </label>
                      <textarea
                        placeholder="Describe your issue..."
                        value={formData.message}
                        onChange={(e) => {
                          setFormData({ ...formData, message: e.target.value });
                          if (formErrors.message) setFormErrors({ ...formErrors, message: "" });
                        }}
                        required
                        rows={4}
                        className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.message
                            ? "border-red-500 dark:border-red-500"
                            : "border-zinc-200 dark:border-zinc-700"
                        }`}
                      />
                      {formErrors.message && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormSubmitted(false);
                        setFormData({ name: "", email: "", subject: "", message: "" });
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>

            {}
        <div className="mt-12 text-center">
          <Link
            href={isSignedIn ? "/dashboard" : "/"}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
             <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
           Back {isSignedIn ? "to Dashboard" : "Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
