"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionAnalysisStore, SessionAnalysis } from "@/lib/session-store";

function generatePDFContent(sessions: SessionAnalysis[]): string {
  const generateSessionHTML = (session: SessionAnalysis, index: number) => {
    const result = session.fullAnalysis;
    const analysisType = session.analysisType?.toLowerCase() || "general";

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

    return `
      <div class="page">
      <div class="analysis-result">
        <div class="header">
          <h1>AI Analysis Report</h1>
          <div class="meta">
            Generated on ${new Date().toLocaleString()} |
            ${session.fileName ? `File: ${session.fileName} | ` : ''}
            Type: ${session.analysisType || 'General'}
          </div>
        </div>

        <div class="input-text">
          <strong>Input:</strong> ${session.text}
        </div>

        <div class="confidence">
          <div class="confidence-score">${result.confidenceScore}%</div>
          <div class="confidence-label">Confidence Score</div>
        </div>

        ${shouldShowSection("sentiment") && result.sentiment ? `
        <div class="section">
          <div class="section-title">Sentiment Analysis</div>
          <span class="badge badge-${result.sentiment.overall}">${result.sentiment.overall}</span>
          <span style="color: #6b7280; font-size: 14px;">Score: ${result.sentiment.score.toFixed(2)}</span>
          ${result.sentiment.emotions && result.sentiment.emotions.length > 0 ? `
            <div style="margin-top: 10px;">
              ${result.sentiment.emotions.map(e => `<span class="emotion">${e.emotion}: ${e.percentage}%</span>`).join('')}
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${shouldShowSection("summary") && result.summary ? `
        <div class="section">
          <div class="section-title">Summary</div>
          <p style="margin-bottom: 15px;">${result.summary.detailedSummary}</p>
          ${result.summary.keyPoints && result.summary.keyPoints.length > 0 ? `
            <p style="font-weight: 600; margin-bottom: 8px;">Key Points:</p>
            <ul class="key-points">
              ${result.summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
        ` : ''}

        ${shouldShowSection("keywords") && result.keywords && result.keywords.length > 0 ? `
        <div class="section">
          <div class="section-title">Keywords</div>
          <div class="keywords">
            ${result.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        ${shouldShowSection("topics") && result.topics && result.topics.length > 0 ? `
        <div class="section">
          <div class="section-title">Topics</div>
          <div class="keywords">
            ${result.topics.map(topic => `<span class="topic">${topic}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        ${shouldShowSection("readability") && result.readability ? `
        <div class="section">
          <div class="section-title">Readability</div>
          <div class="readability-grid">
            <div class="readability-item">
              <div class="readability-label">Grade Level</div>
              <div class="readability-value">${result.readability.gradeLevel}</div>
            </div>
            <div class="readability-item">
              <div class="readability-label">Clarity Score</div>
              <div class="readability-value">${result.readability.clarityScore}</div>
            </div>
            <div class="readability-item">
              <div class="readability-label">Complexity</div>
              <div class="readability-value" style="text-transform: capitalize;">${result.readability.complexity}</div>
            </div>
          </div>
        </div>
        ` : ''}

        ${shouldShowSection("insights") && result.insights ? `
        <div class="section">
          <div class="section-title">Insights</div>
          ${result.insights.intent ? `
            <div class="insight-row">
              <span class="insight-label">Intent:</span>
              <span class="insight-value">${result.insights.intent}</span>
            </div>
          ` : ''}
          ${result.insights.toneAnalysis ? `
            <div class="insight-row">
              <span class="insight-label">Tone:</span>
              <span class="insight-value">${result.insights.toneAnalysis}</span>
            </div>
          ` : ''}
          ${result.insights.audienceSuitability ? `
            <div class="insight-row">
              <span class="insight-label">Audience:</span>
              <span class="insight-value">${result.insights.audienceSuitability}</span>
            </div>
          ` : ''}
        </div>
        ` : ''}

        ${shouldShowSection("improvements") && result.improvements && result.improvements.length > 0 ? `
        <div class="section">
          <div class="section-title">Suggested Improvements</div>
          <ul class="improvements">
            ${result.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
      </div>
    `;
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Analysis Results</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background-color: #525659;
            padding: 40px 0;
            color: #1a1a1a;
            line-height: 1.6;
            display: flex;
            flex-direction: column;
            align-items: center;
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
            width: 120px;
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
            margin-bottom: 20px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            page-break-after: always;
          }
          .page:last-child {
            page-break-after: auto;
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
        ${sessions.map((session, index) => generateSessionHTML(session, index)).join('')}

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

export function DownloadPDFButton() {
  const { sessions } = useSessionAnalysisStore();
  const hasSessionResults = sessions.length > 0;

  const handleDownloadPDF = () => {
    if (!hasSessionResults) return;

    const pdfContent = generatePDFContent(sessions);
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

  if (!hasSessionResults) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Download PDF"
      onClick={handleDownloadPDF}
      title="Download PDF"
    >
      <Download size={20} />
    </Button>
  );
}
