"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading";
import { ToastProvider, useToast, ToastType } from "@/components/ui/toast";
import {
  useAnalysisHistoryStore,
  notifyAnalysisSuccess,
  notifyAnalysisError,
} from "@/lib/store";
import { useSessionAnalysisStore, SessionAnalysis } from "@/lib/session-store";
import { useSearchURL } from "@/lib/hooks";
import { useSearchStore } from "@/lib/search-store";
import { isInputElement } from "@/lib/keyboard-shortcuts";
import Tesseract from "tesseract.js";

const ImageIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="https://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="https://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="https://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface FullAnalysisResult {
  summary: {
    shortSummary: string;
    detailedSummary: string;
    keyPoints: string[];
  };
  sentiment: {
    overall: string;
    score: number;
    emotions: { emotion: string; percentage: number }[];
  };
  readability: {
    gradeLevel: string;
    clarityScore: number;
    complexity: string;
  };
  keywords: string[];
  topics: string[];
  insights: {
    intent: string;
    toneAnalysis: string;
    audienceSuitability: string;
  };
  improvements: string[];
  confidenceScore: number;
}

interface AnalyzeResponse {
  success: boolean;
  data: FullAnalysisResult;
  error?: string;
  savedRecordId?: string;
  savedRecord?: {
    id: string;
    createdAt: string;
  };
  fileName?: string;
  fileSize?: number;
}

const analyzeText = async (
  text: string,
  analysisType: string,
): Promise<AnalyzeResponse> => {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, analysisType: analysisType || undefined }),
    });

    const responseText = await response.text();

    let result: AnalyzeResponse;
    try {
      result = JSON.parse(responseText) as AnalyzeResponse;
    } catch (parseError) {
      console.error("Failed to parse response:", responseText);
      throw new Error(`Invalid server response: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(
        result.error || `Analysis failed with status ${response.status}`,
      );
    }

    if (!result.success) {
      throw new Error(result.error || "Analysis failed");
    }

    if (!result.data) {
      throw new Error("No analysis data returned");
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred during analysis");
  }
};

const analyzeFile = async (
  file: File,
  analysisType: string,
): Promise<AnalyzeResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (analysisType) {
      formData.append("analysisType", analysisType);
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();

    let result: AnalyzeResponse;
    try {
      result = JSON.parse(responseText) as AnalyzeResponse;
    } catch (parseError) {
      console.error("Failed to parse response:", responseText);
      throw new Error(`Invalid server response: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(
        result.error || `Analysis failed with status ${response.status}`,
      );
    }

    if (!result.success) {
      throw new Error(result.error || "Analysis failed");
    }

    if (!result.data) {
      throw new Error("No analysis data returned");
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred during file analysis");
  }
};

const analyzeImageWithOCR = async (
  file: File,
  analysisType: string,
  onOCRProgress?: (progress: number) => void,
): Promise<{ result: AnalyzeResponse; extractedText: string }> => {
 
  const ocrResult = await Tesseract.recognize(file, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onOCRProgress) {
        onOCRProgress(m.progress * 100);
      }
    },
  });

  const extractedText = ocrResult.data.text;

  if (!extractedText || extractedText.trim().length === 0) {
    const result = await analyzeFile(file, analysisType);
    return { result, extractedText: "[No text detected in image]" };
  }

  const textWithMetadata = `[File: ${file.name}] ${extractedText}`;
  const result = await analyzeText(textWithMetadata, analysisType);
  return { result, extractedText };
};

function getAnalysisTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    general: "General Analysis",
    sentiment: "Sentiment Analysis",
    summary: "Text Summary",
    summarization: "Text Summary",
    keywords: "Keyword Extraction",
    readability: "Readability Analysis",
    grammar: "Grammar Check",
    image: "Image Analysis",
  };
  return labels[type.toLowerCase()] || "Analysis";
}

function AnalysisResultCard({ session }: { session: SessionAnalysis }) {
  const result = session.fullAnalysis;
  const analysisType = session.analysisType || "general";

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <div className="bg-muted/50 p-4 border-b border-border">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs font-medium shadow-sm">
                {getAnalysisTypeLabel(analysisType)}
              </span>
              {session.fileName && (
                <span className="px-2.5 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                  <ImageIcon className="w-3 h-3" />
                  {session.fileName}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(session.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-foreground line-clamp-3">
              <span className="font-medium">Input:</span> {session.text}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="text-center pb-3 border-b border-border">
          <div className="inline-flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              {result.confidenceScore}%
            </span>
            <span className="text-sm text-muted-foreground">Confidence Score</span>
          </div>
        </div>

        {result.sentiment && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Sentiment Analysis
            </h4>
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
                  result.sentiment.overall === "positive"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    : result.sentiment.overall === "negative"
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                      : result.sentiment.overall === "mixed"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-gradient-to-r from-slate-500 to-zinc-500 text-white"
                }`}
              >
                {result.sentiment.overall}
              </span>
              <span className="text-xs text-muted-foreground">
                Score: {result.sentiment.score.toFixed(2)}
              </span>
            </div>
            {result.sentiment.emotions &&
              result.sentiment.emotions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {result.sentiment.emotions.map((emotion, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-xs shadow-sm"
                    >
                      {emotion.emotion}: {emotion.percentage}%
                    </span>
                  ))}
                </div>
              )}
          </div>
        )}

        {result.summary && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Summary
            </h4>
            <p className="text-sm text-muted-foreground">
              {result.summary.detailedSummary}
            </p>
            {result.summary.keyPoints &&
              result.summary.keyPoints.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Key Points:
                  </p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                    {result.summary.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {result.keywords && result.keywords.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Keywords
            </h4>
            <div className="flex flex-wrap gap-1">
              {result.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs font-medium shadow-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.topics && result.topics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Topics
            </h4>
            <div className="flex flex-wrap gap-1">
              {result.topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-xs font-medium shadow-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.readability && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Readability
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-muted-foreground">Grade Level</p>
                <p className="font-medium text-foreground">
                  {result.readability.gradeLevel}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-muted-foreground">
                  Clarity Score
                </p>
                <p className="font-medium text-foreground">
                  {result.readability.clarityScore}
                </p>
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <p className="text-muted-foreground">Complexity</p>
                <p className="font-medium text-foreground capitalize">
                  {result.readability.complexity}
                </p>
              </div>
            </div>
          </div>
        )}

        {result.insights && analysisType === "general" && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Insights
            </h4>
            <div className="space-y-2 text-xs">
              {result.insights.intent && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Intent:
                  </span>{" "}
                  <span className="text-foreground">
                    {result.insights.intent}
                  </span>
                </div>
              )}
              {result.insights.toneAnalysis && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Tone:
                  </span>{" "}
                  <span className="text-foreground">
                    {result.insights.toneAnalysis}
                  </span>
                </div>
              )}
              {result.insights.audienceSuitability && (
                <div>
                  <span className="font-medium text-muted-foreground">
                    Audience:
                  </span>{" "}
                  <span className="text-foreground">
                    {result.insights.audienceSuitability}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {result.improvements && result.improvements.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              Suggested Improvements
            </h4>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
              {result.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function FileUploadSection({
  selectedFile,
  setSelectedFile,
  isLoading,
  onAnalyze,
  analysisType,
  setAnalysisType,
}: {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isLoading: boolean;
  onAnalyze: () => void;
  analysisType: string;
  setAnalysisType: (type: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          setSelectedFile(file);
        }
      }
    },
    [setSelectedFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          setSelectedFile(file);
        }
      }
    },
    [setSelectedFile],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setSelectedFile]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Upload Image or Screenshot
        </label>

        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
            />
            <div className="flex flex-col items-center">
              <UploadIcon className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-xs text-muted-foreground/70">
                Supports JPEG, PNG, GIF, WebP, BMP, SVG (max 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ImageIcon className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                disabled={isLoading}
                className="p-1 hover:bg-muted rounded-full"
              >
                <XIcon className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="mt-3 flex justify-center">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="max-h-48 rounded-lg object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Analysis Type (Optional)
            </label>
            <Select
              value={analysisType}
              onValueChange={setAnalysisType}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select analysis type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Analysis</SelectItem>
                <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                <SelectItem value="summary">Text Summary</SelectItem>
                <SelectItem value="keywords">Keyword Extraction</SelectItem>
                <SelectItem value="readability">
                  Readability Analysis
                </SelectItem>
                <SelectItem value="grammar">Grammar Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onAnalyze} disabled={isLoading} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Analyzing...
              </span>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                Analyze Image
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
function DashboardContent() {
  const [text, setText] = useState("");
  const [analysisType, setAnalysisType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSessionCount, setLastSessionCount] = useState(0);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(-1);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");

  const resultsEndRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const latestResultRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const latestSessionIdRef = useRef<string | null>(null);


  const prevIsLoading = useRef(isLoading);
  const { sessions, addSession } = useSessionAnalysisStore();
  const { addAnalysis } = useAnalysisHistoryStore();
  const { searchQuery } = useSearchURL();
  const { setSearchQuery: setGlobalSearchQuery } = useSearchStore();
  const { addToast } = useToast();

  const restoredSessions = sessions.map((session) => ({
    ...session,
    timestamp: new Date(session.timestamp),
  }));

  useEffect(() => {
    if (searchQuery) {
      setGlobalSearchQuery(searchQuery);
    }
  }, [searchQuery, setGlobalSearchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = isInputElement(target);
     
      const allowInInput = (e.key === "Enter" && (e.metaKey || e.ctrlKey));
      
      if (inInput && !allowInInput) {
        return;
      }

      if ((e.key === "n" || e.key === "N") && !e.metaKey && !e.ctrlKey && !inInput) {
        e.preventDefault();
        textInputRef.current?.focus();
        return;
      }

      if ((e.key === "t" || e.key === "T") && !e.metaKey && !e.ctrlKey && !inInput) {
        e.preventDefault();
        setActiveTab("text");
     
        setTimeout(() => textInputRef.current?.focus(), 50);
        return;
      }

      if ((e.key === "i" || e.key === "I") && !e.metaKey && !e.ctrlKey && !inInput) {
        e.preventDefault();
        setActiveTab("image");
        return;
      }

      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (activeTab === "text" && text.trim() && !isLoading) {
         
          const form = document.querySelector('form');
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true }));
          }
        } else if (activeTab === "image" && selectedFile && !isLoading) {
         
        }
        return;
      }

      if (e.key === "[" && !inInput) {
        e.preventDefault();
        if (restoredSessions.length > 0) {
          setSelectedResultIndex(prev => {
            const newIndex = prev <= 0 ? restoredSessions.length - 1 : prev - 1;
            return newIndex;
          });
        }
        return;
      }

      if (e.key === "]" && !inInput) {
        e.preventDefault();
        if (restoredSessions.length > 0) {
          setSelectedResultIndex(prev => {
            const newIndex = prev >= restoredSessions.length - 1 ? 0 : prev + 1;
            return newIndex;
          });
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [text, activeTab, isLoading, selectedFile, restoredSessions.length]);

  useEffect(() => {
    if (selectedResultIndex >= 0 && latestResultRef.current) {
      latestResultRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedResultIndex]);
  useEffect(() => {
  
    if (sessions.length < lastSessionCount) {
      setLastSessionCount(sessions.length);
      prevIsLoading.current = isLoading;
      return;
    }

    const newSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    const isNewSession = newSession && newSession.id !== latestSessionIdRef.current;
    const wasLoading = prevIsLoading.current;
    
    prevIsLoading.current = isLoading;
    
    if (
      sessions.length > lastSessionCount &&
      !isLoading && 
      wasLoading &&
      sessions.length > 0 &&
      isNewSession
    ) {
      latestSessionIdRef.current = newSession.id;
      setLastSessionCount(sessions.length);
      
      const scrollToResults = () => {
        if (latestResultRef.current) {
          latestResultRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else if (resultsEndRef.current) {
          resultsEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      };
      
      setTimeout(scrollToResults, 100);
    
      setTimeout(scrollToResults, 300);
      setTimeout(scrollToResults, 600);
    }
    
    else if (sessions.length > lastSessionCount && !isLoading && !wasLoading) {
      if (newSession) {
        latestSessionIdRef.current = newSession.id;
      }
      setLastSessionCount(sessions.length);
    }
  }, [sessions.length, isLoading, lastSessionCount, sessions]);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeText(text, analysisType);
      await handleAnalysisResponse(response, text, analysisType, null);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileAnalysis = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const { result } = await analyzeImageWithOCR(
        selectedFile, 
        analysisType
      );

      const displayText = selectedFile.name;

      await handleAnalysisResponse(result, displayText, analysisType || "image", selectedFile.name);
      
      setSelectedFile(null);
      
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisResponse = async (
    response: AnalyzeResponse,
    inputText: string,
    type: string,
    fileName: string | null,
  ) => {
    const savedRecordId =
      response.savedRecordId || response.data.confidenceScore?.toString();
    const savedRecordCreatedAt = response.savedRecord?.createdAt;

    addSession(
      {
        text: inputText,
        analysisType: type,
        fullAnalysis: response.data,
        analysisId: savedRecordId,
        fileName: fileName || undefined,
      },
      savedRecordCreatedAt ? new Date(savedRecordCreatedAt) : undefined,
    );

    addAnalysis(
      {
        text: inputText,
        analysis:
          response.data.summary?.detailedSummary ||
          response.data.summary?.shortSummary ||
          "No analysis available",
        confidence: (response.data.confidenceScore || 75) / 100,
        categories: [
          type,
          ...(response.data.topics || response.data.keywords || []),
        ],
        analysisType: type,
        fullAnalysis: response.data,
        fileName: fileName || undefined,
      },
      savedRecordId,
      savedRecordCreatedAt ? new Date(savedRecordCreatedAt) : undefined,
    );

    const typeLabel = type ? getAnalysisTypeLabel(type) : "text analysis";
    addToast({
      title: "Analysis Complete",
      message: `Your ${typeLabel} has been completed successfully.`,
      type: "success",
    });

    notifyAnalysisSuccess(type);

    setText("");
  };

  const handleError = (err: unknown) => {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "An unexpected error occurred. Please try again.";
    setError(errorMessage);

    addToast({
      title: "Analysis Failed",
      message: errorMessage,
      type: "error",
    });

    notifyAnalysisError(errorMessage);
  };

  const isTextFormDisabled = isLoading || !text.trim();

  return (
    <div className="space-y-4 sm:space-y-6 pb-10">

      <div className="pt-2 animate-fadeInDown">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent inline-block">
           Analysis Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Analyze your text or images with advanced AI models
        </p>
      </div>
      {restoredSessions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-fadeInUp">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-3 sm:p-4 text-white shadow-lg lift relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-xs sm:text-sm">Total Analyses</p>
                <p className="text-xl sm:text-2xl font-bold">{restoredSessions.length}</p>
              </div>
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-3 sm:p-4 text-white shadow-lg lift relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs sm:text-sm">Avg Confidence</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {Math.round(restoredSessions.reduce((acc, s) => acc + (s.fullAnalysis?.confidenceScore || 0), 0) / restoredSessions.length)}%
                </p>
              </div>
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-3 sm:p-4 text-white shadow-lg lift relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-xs sm:text-sm">Topics Found</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {new Set(restoredSessions.flatMap(s => s.fullAnalysis?.topics || [])).size}
                </p>
              </div>
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-3 sm:p-4 text-white shadow-lg lift relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs sm:text-sm">Keywords</p>
                <p className="text-xl sm:text-2xl font-bold">
                  {new Set(restoredSessions.flatMap(s => s.fullAnalysis?.keywords || [])).size}
                </p>
              </div>
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {restoredSessions.length > 0 && (
        <div className="space-y-4" aria-live="polite" ref={resultsContainerRef}>
          <h2 className="text-lg font-semibold text-foreground animate-fadeIn">
            Analysis Results ({restoredSessions.length})
          </h2>

          {restoredSessions.map((session, index) => (
            <div 
              key={session.id} 
              ref={index === restoredSessions.length - 1 ? latestResultRef : null}
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <AnalysisResultCard session={session} />
            </div>
          ))}

          <div ref={resultsEndRef} />
        </div>
      )}

      {error && (
        <div
          id="analysis-error"
          className="bg-red-50 border border-red-200 p-6 rounded-lg shadow"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center space-x-2">
            <span className="text-red-600" aria-hidden="true">
              ⚠️
            </span>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}
          <div
        ref={formRef}
        className="bg-card border border-border p-4 sm:p-6 rounded-xl shadow-lg animate-fadeInUp"
        style={{ animationDelay: '0.2s' }}
      >
      
        <div className="flex border-b border-border mb-4 sm:mb-6 -mx-4 sm:mx-0 px-2 sm:px-0">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all duration-300 relative ${
              activeTab === "text"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <svg className="w-3 sm:w-4 h-3 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden xs:inline">Text Analysis</span>
              <span className="xs:hidden">Text</span>
            </span>
            {activeTab === "text" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 animate-gradient"></span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all duration-300 relative ${
              activeTab === "image"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-1 sm:gap-2">
              <ImageIcon className="w-3 sm:w-4 h-3 sm:h-4" />
              <span className="hidden xs:inline">Image Analysis</span>
              <span className="xs:hidden">Image</span>
            </span>
            {activeTab === "image" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 animate-gradient"></span>
            )}
          </button>
        </div>

        {activeTab === "text" && (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Text to Analyze
              </label>
            <textarea
                id="text"
                ref={textInputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full h-32 p-3 border border-input rounded-md resize-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="analysis-type"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Analysis Type (Optional)
              </label>
              <Select
                value={analysisType}
                onValueChange={setAnalysisType}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Analysis</SelectItem>
                  <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                  <SelectItem value="summary">Text Summary</SelectItem>
                  <SelectItem value="keywords">Keyword Extraction</SelectItem>
                  <SelectItem value="readability">
                    Readability Analysis
                  </SelectItem>
                  <SelectItem value="grammar">Grammar Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={isTextFormDisabled}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Analyzing...
                </span>
              ) : (
                "Analyze Text"
              )}
            </Button>
          </form>
        )}

        {activeTab === "image" && (
          <FileUploadSection
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isLoading={isLoading}
            onAnalyze={handleFileAnalysis}
            analysisType={analysisType}
            setAnalysisType={setAnalysisType}
          />
        )}
      </div>

      {isLoading && (
        <div className="bg-card border border-border p-8 rounded-xl shadow-lg animate-fadeIn">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                {activeTab === "image"
                  ? "Extracting text and analyzing your image..."
                  : "Processing your text..."}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This may take a few moments
              </p>
            </div>
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-purple-600 animate-shimmer" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
