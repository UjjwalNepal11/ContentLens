import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalyzeResponse, AnalysisResult } from "./types";
import { getGeminiApiKey, validateServerEnv } from "./env";

function getGeminiClientForImage(): GoogleGenerativeAI {
  const apiKey = getGeminiApiKey();
  return new GoogleGenerativeAI(apiKey);
}

const IMAGE_ANALYSIS_PROMPT = `You are a professional image and text analysis assistant. Analyze the provided image and return a structured JSON response with the following format:

{
  "summary": {
    "shortSummary": "A brief one-sentence summary of what's in the image",
    "detailedSummary": "A 2-3 sentence comprehensive description of the image contents",
    "keyPoints": ["Key observation 1", "Key observation 2", "Key observation 3", "Key observation 4", "Key observation 5"]
  },
  "sentiment": {
    "overall": "positive/negative/neutral/mixed",
    "score": -1.0 to 1.0 (where -1 is very negative, 1 is very positive)",
    "emotions": [
      {"emotion": "emotion_name", "percentage": 0-100},
      {"emotion": "emotion_name", "percentage": 0-100}
    ]
  },
  "readability": {
    "gradeLevel": "Not applicable for images",
    "clarityScore": 0-100,
    "complexity": "low/medium/high"
  },
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "topics": ["topic1", "topic2", "topic3"],
  "insights": {
    "intent": "What the image conveys or intends",
    "toneAnalysis": "Description of the tone or mood of the image",
    "audienceSuitability": "Who would find this image relevant"
  },
  "improvements": [],
  "confidenceScore": 0-100
}

IMPORTANT:
- Analyze what you see in the image thoroughly
- If the image contains text, extract and analyze that text
- If the image is a chart, graph, or diagram, describe the data and trends
- If the image is a screenshot, describe the UI elements and content
- Provide realistic confidence scores based on how clearly you can analyze the image

Return ONLY valid JSON without any additional text or markdown.`;

function parseAIResponse(responseText: string): any {
  let cleaned = responseText.replace(/^\uFEFF/, '');
  cleaned = cleaned.trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonCandidate);
    } catch (nestedError) {
      try {
        return JSON.parse(jsonCandidate.trim());
      } catch {
        throw new Error(`Failed to parse AI response as JSON`);
      }
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (finalError) {
    throw new Error(`Failed to parse AI response as JSON`);
  }
}

export async function analyzeImage(
  base64Image: string,
  mimeType: string,
  analysisType?: string,
): Promise<AnalyzeResponse> {
  try {

    try {
      validateServerEnv();
    } catch (envError) {
      console.error("Environment validation failed:", envError);
      return {
        success: false,
        error: envError instanceof Error ? envError.message : "Environment configuration error",
      };
    }

    if (!base64Image || typeof base64Image !== "string") {
      return {
        success: false,
        error: "Invalid input: image data must be provided",
      };
    }

    const genAI = getGeminiClientForImage();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const userMessage = analysisType
      ? `Analyze this image with focus on ${analysisType}. If there is any text in the image, please extract and analyze it.`
      : "Analyze this image thoroughly. If there is any text in the image, please extract and analyze it. Describe what you see in detail.";

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([IMAGE_ANALYSIS_PROMPT, userMessage, imagePart]);

    const responseContent = result.response.text();

    if (!responseContent) {
      return {
        success: false,
        error: "No analysis generated from Gemini",
      };
    }

    let parsedAnalysis: AnalysisResult;
    try {
      const parsed = parseAIResponse(responseContent);

      parsedAnalysis = {
        summary: {
          shortSummary: parsed.summary?.shortSummary || "No summary available",
          detailedSummary: parsed.summary?.detailedSummary || "No detailed summary available",
          keyPoints: parsed.summary?.keyPoints || [],
        },
        sentiment: {
          overall: parsed.sentiment?.overall || "neutral",
          score: typeof parsed.sentiment?.score === "number" ? parsed.sentiment.score : 0,
          emotions: Array.isArray(parsed.sentiment?.emotions)
            ? parsed.sentiment.emotions.map((e: any) => ({
                emotion: e.emotion || "unknown",
                percentage: typeof e.percentage === "number" ? e.percentage : 0,
              }))
            : [],
        },
        readability: {
          gradeLevel: parsed.readability?.gradeLevel || "Not applicable",
          clarityScore: typeof parsed.readability?.clarityScore === "number"
            ? parsed.readability.clarityScore
            : 50,
          complexity: parsed.readability?.complexity || "medium",
        },
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        topics: Array.isArray(parsed.topics) ? parsed.topics : [],
        insights: {
          intent: parsed.insights?.intent || "Unknown intent",
          toneAnalysis: parsed.insights?.toneAnalysis || "Unknown tone",
          audienceSuitability: parsed.insights?.audienceSuitability || "General audience",
        },
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        confidenceScore: typeof parsed.confidenceScore === "number"
          ? Math.min(Math.max(parsed.confidenceScore, 0), 95)
          : 75,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return {
        success: false,
        error: "Failed to parse AI analysis response",
      };
    }

    return {
      success: true,
      data: parsedAnalysis,
    };
  } catch (error) {
    console.error("AI Image Analysis Error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: `Gemini API error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "Internal server error during image analysis",
    };
  }
}

