"use client";

import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { AnalysisHistoryItem } from "@/lib/types";
import { AnalysisDetailPDFExport } from "@/components/AnalysisDetailPDFExport";

interface AnalysisDetailModalProps {
  item: AnalysisHistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisDetailModal({
  item,
  isOpen,
  onClose,
}: AnalysisDetailModalProps) {
  if (!item) return null;

  const formatDate = (date: Date | string | number | undefined) => {
    if (!date && date !== 0) {
      return "Unknown date";
    }

    const validDate = new Date(date);

    if (isNaN(validDate.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(validDate);
  };

  const formatConfidence = (score: number): string => {
            if (score > 1) {
      return `${score.toFixed(1)}%`;
    }
    return `${(score * 100).toFixed(1)}%`;
  };

    const analysisType = item.analysisType?.toLowerCase() || "general";

    const shouldShowSection = (section: string): boolean => {
        if (analysisType === "general") {
      return true;
    }

        switch (analysisType) {
      case "sentiment":
        return ["summary", "sentiment", "insights", "confidenceScore", "timestamp"].includes(section);
      case "summary":
      case "summarization":
        return ["summary", "keywords", "topics", "insights", "confidenceScore", "timestamp"].includes(section);
      case "keywords":
        return ["summary", "keywords", "topics", "insights", "confidenceScore", "timestamp"].includes(section);
      case "readability":
        return ["summary", "readability", "improvements", "insights", "confidenceScore", "timestamp"].includes(section);
      case "grammar":
        return ["summary", "improvements", "insights", "confidenceScore", "timestamp"].includes(section);
      default:
        return true;
    }
  };

    const getAnalysisTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      general: "General Analysis",
      sentiment: "Sentiment Analysis",
      summary: "Summary",
      summarization: "Summary",
      keywords: "Keywords Analysis",
      readability: "Readability Analysis",
      grammar: "Grammar Analysis",
    };
    return labels[type] || "Analysis";
  };

  const { fullAnalysis } = item;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Analysis Details"
      rightAction={<AnalysisDetailPDFExport item={item} />}
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {}
        <div className="flex items-center gap-2 pb-2 border-b">
          <span className="text-sm text-muted-foreground">Analysis Type:</span>
          <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-full text-sm font-medium shadow-sm">
            {getAnalysisTypeLabel(analysisType)}
          </span>
        </div>

        {}
        <div>
          <h4 className="font-semibold mb-2 dark:text-white">Original Text:</h4>
          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded">{item.text}</p>
        </div>

        {}
        {shouldShowSection("summary") && fullAnalysis?.summary && (
          <div>
            <h4 className="font-semibold mb-2 dark:text-white">Summary:</h4>
            <div className="space-y-2">
              {fullAnalysis.summary.shortSummary && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Short Summary:</p>
                  <p className="text-gray-700 dark:text-gray-300">{fullAnalysis.summary.shortSummary}</p>
                </div>
              )}
              {fullAnalysis.summary.detailedSummary && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Detailed Summary:</p>
                  <p className="text-gray-700 dark:text-gray-300">{fullAnalysis.summary.detailedSummary}</p>
                </div>
              )}
              {fullAnalysis.summary.keyPoints && fullAnalysis.summary.keyPoints.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Key Points:</p>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                    {fullAnalysis.summary.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {shouldShowSection("sentiment") && fullAnalysis?.sentiment && (
          <div>
            <h4 className="font-semibold mb-2 dark:text-white">Sentiment Analysis:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Overall:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                  fullAnalysis.sentiment.overall === "positive"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    : fullAnalysis.sentiment.overall === "negative"
                      ? "bg-gradient-to-r from-red-500 to-rose-500 text-white"
                      : fullAnalysis.sentiment.overall === "mixed"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-gradient-to-r from-slate-500 to-zinc-500 text-white"
                }`}>
                  {fullAnalysis.sentiment.overall}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Score:</span>
                <span className="text-foreground font-medium">{formatConfidence(fullAnalysis.sentiment.score)}</span>
              </div>
              {fullAnalysis.sentiment.emotions && fullAnalysis.sentiment.emotions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Emotions:</p>
                  <div className="flex flex-wrap gap-2">
                    {fullAnalysis.sentiment.emotions.map((emotion, index) => (
                      <span key={index} className="px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-xs font-medium shadow-sm">
                        {emotion.emotion}: {emotion.percentage.toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {shouldShowSection("readability") && fullAnalysis?.readability && (
          <div>
            <h4 className="font-semibold mb-2 dark:text-white">Readability:</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-50 to-violet-50 dark:from-cyan-950/30 dark:to-violet-950/30">
                <p className="text-xs text-muted-foreground mb-1">Grade Level:</p>
                <p className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent">{fullAnalysis.readability.gradeLevel}</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
                <p className="text-xs text-muted-foreground mb-1">Clarity Score:</p>
                <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{fullAnalysis.readability.clarityScore}/100</p>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                <p className="text-xs text-muted-foreground mb-1">Complexity:</p>
                <p className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{fullAnalysis.readability.complexity}</p>
              </div>
            </div>
          </div>
        )}

        {}
        {shouldShowSection("keywords") && fullAnalysis?.keywords && fullAnalysis.keywords.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 dark:text-white">Keywords:</h4>
            <div className="flex flex-wrap gap-2">
              {fullAnalysis.keywords.map((keyword, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium shadow-sm">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {}
        {shouldShowSection("topics") && fullAnalysis?.topics && fullAnalysis.topics.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 dark:text-white">Topics:</h4>
            <div className="flex flex-wrap gap-2">
              {fullAnalysis.topics.map((topic, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full text-sm font-medium shadow-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {}
        {shouldShowSection("insights") && fullAnalysis?.insights && (
          <div>
            <h4 className="font-semibold mb-2 dark:text-white">Insights:</h4>
            <div className="space-y-2">
              {fullAnalysis.insights.intent && fullAnalysis.insights.intent !== "Unknown intent" && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Intent:</p>
                  <p className="text-gray-700 dark:text-gray-300">{fullAnalysis.insights.intent}</p>
                </div>
              )}
              {fullAnalysis.insights.toneAnalysis && fullAnalysis.insights.toneAnalysis !== "Unknown tone" && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tone Analysis:</p>
                  <p className="text-gray-700 dark:text-gray-300">{fullAnalysis.insights.toneAnalysis}</p>
                </div>
              )}
              {fullAnalysis.insights.audienceSuitability && fullAnalysis.insights.audienceSuitability !== "General audience" && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Audience Suitability:</p>
                  <p className="text-gray-700 dark:text-gray-300">{fullAnalysis.insights.audienceSuitability}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {shouldShowSection("improvements") && fullAnalysis?.improvements && fullAnalysis.improvements.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 dark:text-white">
              {analysisType === "grammar" ? "Grammar Suggestions" : analysisType === "readability" ? "Readability Suggestions" : "Suggested Improvements"}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              {fullAnalysis.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        )}

        {}
        {fullAnalysis?.confidenceScore !== undefined && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <h4 className="font-semibold mb-2 dark:text-white">Confidence Score:</h4>
              <p className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">
                {formatConfidence(fullAnalysis.confidenceScore)}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 dark:text-white">Date:</h4>
              <p className="text-muted-foreground">{formatDate(item.timestamp)}</p>
            </div>
          </div>
        )}

        {}
        {!fullAnalysis && (
          <>
            <div>
              <h4 className="font-semibold mb-2 dark:text-white">Analysis:</h4>
              <p className="text-muted-foreground">{item.analysis}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 dark:text-white">Confidence:</h4>
                <p className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">
                  {formatConfidence(item.confidence)}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 dark:text-white">Date:</h4>
                <p className="text-muted-foreground">{formatDate(item.timestamp)}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 dark:text-white">Categories:</h4>
              <div className="flex flex-wrap gap-2">
                {item.categories.map((category, index) => (
                  <span key={index} className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-full text-sm font-medium shadow-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
