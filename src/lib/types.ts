export interface AnalyzeRequest {
  text: string;
  analysisType?: string;
}

export interface AnalyzeFileRequest {
  file: string; // base64 encoded
  fileName: string;
  fileType: string;
  analysisType?: string;
}

export interface FileAnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  extractedText?: string;
  ocrPerformed?: boolean;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export interface AIError extends Error {
  code: string;
  statusCode: number;
}

export interface AnalysisResult {
  summary: Summary;
  sentiment: Sentiment;
  readability: Readability;
  keywords: string[];
  topics: string[];
  insights: Insights;
  improvements: string[];
  confidenceScore: number;
}

export interface Summary {
  shortSummary: string;
  detailedSummary: string;
  keyPoints: string[];
}

export interface Sentiment {
  overall: string;
  score: number;
  emotions: Emotion[];
}

export interface Emotion {
  emotion: string;
  percentage: number;
}

export interface Readability {
  gradeLevel: string;
  clarityScore: number;
  complexity: string;
}

export interface Insights {
  intent: string;
  toneAnalysis: string;
  audienceSuitability: string;
}

export interface AnalysisHistoryItem {
  id: string;
  text: string;
  analysis: string;
  confidence: number;
  categories: string[];
  timestamp: Date | string;
  createdAt?: Date | string;
  analysisType?: string;
  fullAnalysis?: AnalysisResult;
  fileName?: string;
}

export interface AnalysisHistoryFilters {
  search: string;
  category: string;
  sortBy: "timestamp" | "confidence";
  sortOrder: "asc" | "desc";
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  phone?: string;
  bio?: string;
  createdAt: Date;
}

export interface Settings {
  theme: "light" | "dark";
  notifications: boolean;
  language: string;
  emailNotifications?: boolean;
  autoSave?: boolean;
  privacyMode?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface FilterState {
  search: string;
  category: string;
  sortBy: "timestamp" | "confidence";
  sortOrder: "asc" | "desc";
}
