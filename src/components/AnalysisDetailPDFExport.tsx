"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnalysisHistoryItem } from "@/lib/types";

function getAnalysisTypeLabel(type: string): string {
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
}

function generatePDFContentFromItem(item: AnalysisHistoryItem): string {
  const { fullAnalysis } = item;
  const analysisType = item.analysisType?.toLowerCase() || "general";

  const shouldShowSection = (section: string): boolean => {
    if (analysisType === "general") return true;
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

  const formatDate = (date: Date | string | number | undefined) => {
    if (!date && date !== 0) return "Unknown date";
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) return "Unknown date";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(validDate);
  };

  const formatConfidence = (score: number): string => {
    if (score > 1) return `${score.toFixed(1)}%`;
    return `${(score * 100).toFixed(1)}%`;
  };

  const confidenceScore = fullAnalysis?.confidenceScore
    ? formatConfidence(fullAnalysis.confidenceScore)
    : formatConfidence(item.confidence);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Analysis Result - ${item.fileName || 'Analysis'}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #525659;
            padding: 40px 0;
            color: #1a1a1a;
            line-height: 1.6;
            display: flex;
            justify-content: center;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e5e5;
          }
          .header h1 {
            font-size: 28px;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .meta {
            color: #6b7280;
            font-size: 14px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e5e5;
          }
          .confidence {
            text-align: center;
            padding: 20px;
            background: #f3f4f6;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .confidence-score {
            font-size: 36px;
            font-weight: 700;
            color: #2563eb;
          }
          .confidence-label {
            color: #6b7280;
            font-size: 14px;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
            margin-right: 8px;
            margin-bottom: 8px;
          }
          .badge-positive { background: #d1fae5; color: #065f46; }
          .badge-negative { background: #fee2e2; color: #991b1b; }
          .badge-neutral { background: #f3f4f6; color: #374151; }
          .badge-mixed { background: #fef3c7; color: #92400e; }
          .emotion {
            display: inline-block;
            padding: 2px 8px;
            background: #ede9fe;
            color: #5b21b6;
            border-radius: 4px;
            font-size: 11px;
            margin-right: 6px;
            margin-bottom: 6px;
          }
          .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .keyword {
            padding: 4px 10px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 4px;
            font-size: 12px;
          }
          .topic {
            padding: 4px 10px;
            background: #d1fae5;
            color: #065f46;
            border-radius: 4px;
            font-size: 12px;
          }
          .insight-row {
            display: flex;
            margin-bottom: 8px;
          }
          .insight-label {
            font-weight: 600;
            color: #4b5563;
            width: 140px;
            flex-shrink: 0;
          }
          .insight-value {
            color: #1f2937;
          }
          .key-points {
            list-style: disc;
            padding-left: 20px;
          }
          .key-points li {
            margin-bottom: 6px;
          }
          .improvements {
            list-style: decimal;
            padding-left: 20px;
          }
          .improvements li {
            margin-bottom: 6px;
            color: #dc2626;
          }
          .readability-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .readability-item {
            text-align: center;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
          }
          .readability-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .readability-value {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
          }
          .input-text {
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            font-style: italic;
            color: #4b5563;
            margin-bottom: 20px;
          }
          .page {
            background-color: white;
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
          }
          @media print {
            body {
                background-color: white;
                padding: 0;
                display: block;
            }
            .page {
                width: 100%;
                min-height: auto;
                box-shadow: none;
                padding: 0;
                margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
        <div class="header">
          <h1>AI Analysis Report</h1>
          <div class="meta">
            Generated on ${new Date().toLocaleString()} |
            ${item.fileName ? `File: ${item.fileName} | ` : ''}
            Type: ${getAnalysisTypeLabel(analysisType)} |
            Date: ${formatDate(item.timestamp)}
          </div>
        </div>

        <div class="input-text">
          <strong>Input:</strong> ${item.text}
        </div>

        <div class="confidence">
          <div class="confidence-score">${confidenceScore}</div>
          <div class="confidence-label">Confidence Score</div>
        </div>

        ${shouldShowSection("sentiment") && fullAnalysis?.sentiment ? `
        <div class="section">
          <div class="section-title">Sentiment Analysis</div>
          <span class="badge badge-${fullAnalysis.sentiment.overall}">${fullAnalysis.sentiment.overall}</span>
          <span style="color: #6b7280; font-size: 14px;">Score: ${fullAnalysis.sentiment.score.toFixed(2)}</span>
          ${fullAnalysis.sentiment.emotions && fullAnalysis.sentiment.emotions.length > 0 ? `
            <div style="margin-top: 10px;">
              ${fullAnalysis.sentiment.emotions.map(e => `<span class="emotion">${e.emotion}: ${e.percentage}%</span>`).join('')}
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${shouldShowSection("summary") && fullAnalysis?.summary ? `
        <div class="section">
          <div class="section-title">Summary</div>
          ${fullAnalysis.summary.shortSummary ? `<p style="margin-bottom: 10px;"><strong>Short Summary:</strong> ${fullAnalysis.summary.shortSummary}</p>` : ''}
          ${fullAnalysis.summary.detailedSummary ? `<p style="margin-bottom: 15px;">${fullAnalysis.summary.detailedSummary}</p>` : ''}
          ${fullAnalysis.summary.keyPoints && fullAnalysis.summary.keyPoints.length > 0 ? `
            <p style="font-weight: 600; margin-bottom: 8px;">Key Points:</p>
            <ul class="key-points">
              ${fullAnalysis.summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
        ` : ''}

        ${shouldShowSection("keywords") && fullAnalysis?.keywords && fullAnalysis.keywords.length > 0 ? `
        <div class="section">
          <div class="section-title">Keywords</div>
          <div class="keywords">
            ${fullAnalysis.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        ${shouldShowSection("topics") && fullAnalysis?.topics && fullAnalysis.topics.length > 0 ? `
        <div class="section">
          <div class="section-title">Topics</div>
          <div class="keywords">
            ${fullAnalysis.topics.map(topic => `<span class="topic">${topic}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        ${shouldShowSection("readability") && fullAnalysis?.readability ? `
        <div class="section">
          <div class="section-title">Readability</div>
          <div class="readability-grid">
            <div class="readability-item">
              <div class="readability-label">Grade Level</div>
              <div class="readability-value">${fullAnalysis.readability.gradeLevel}</div>
            </div>
            <div class="readability-item">
              <div class="readability-label">Clarity Score</div>
              <div class="readability-value">${fullAnalysis.readability.clarityScore}</div>
            </div>
            <div class="readability-item">
              <div class="readability-label">Complexity</div>
              <div class="readability-value" style="text-transform: capitalize;">${fullAnalysis.readability.complexity}</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${shouldShowSection("insights") && fullAnalysis?.insights ? `
        <div class="section">
          <div class="section-title">Insights</div>
          ${fullAnalysis.insights.intent ? `
            <div class="insight-row">
              <span class="insight-label">Intent:</span>
              <span class="insight-value">${fullAnalysis.insights.intent}</span>
            </div>
          ` : ''}
          ${fullAnalysis.insights.toneAnalysis ? `
            <div class="insight-row">
              <span class="insight-label">Tone:</span>
              <span class="insight-value">${fullAnalysis.insights.toneAnalysis}</span>
            </div>
          ` : ''}
          ${fullAnalysis.insights.audienceSuitability ? `
            <div class="insight-row">
              <span class="insight-label">Audience:</span>
              <span class="insight-value">${fullAnalysis.insights.audienceSuitability}</span>
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${shouldShowSection("improvements") && fullAnalysis?.improvements && fullAnalysis.improvements.length > 0 ? `
        <div class="section">
          <div class="section-title">Suggested Improvements</div>
          <ul class="improvements">
            ${fullAnalysis.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${!fullAnalysis ? `
        <div class="section">
          <div class="section-title">Analysis</div>
          <p>${item.analysis}</p>
        </div>
        <div class="section">
          <div class="section-title">Categories</div>
          <div class="keywords">
            ${item.categories.map(cat => `<span class="keyword">${cat}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        </div>
        <script>
          window.onload = function() {
            window.print();
          };
          window.onafterprint = function() {
            window.close();
          };
        </script>
      </body>
    </html>
  `;

  return html;
}

interface AnalysisDetailPDFExportProps {
  item: AnalysisHistoryItem | null;
}

export function AnalysisDetailPDFExport({ item }: AnalysisDetailPDFExportProps) {
  if (!item) return null;

  const handleDownloadPDF = () => {
    const pdfContent = generatePDFContentFromItem(item);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      alert('Please allow popups to download the PDF');
      return;
    }

    iframeDoc.open();
    iframeDoc.write(pdfContent);
    iframeDoc.close();

    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Export PDF"
      onClick={handleDownloadPDF}
      title="Export PDF"
    >
      <Download size={20} />
    </Button>
  );
}
