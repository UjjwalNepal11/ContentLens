import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalyzeRequest, AnalyzeResponse, AIError, AnalysisResult } from "./types";
import { getGeminiApiKey, validateServerEnv } from "./env";

function getGeminiClient(): GoogleGenerativeAI {
    const apiKey = getGeminiApiKey();

  return new GoogleGenerativeAI(apiKey);
}

const ANALYSIS_PROMPTS = {
    general: `You are a professional text analysis assistant. Analyze the provided text and return a structured JSON response with the following format:

{
  "summary": {
    "shortSummary": "A brief one-sentence summary of the text",
    "detailedSummary": "A 2-3 sentence comprehensive summary",
    "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]
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
    "gradeLevel": "Grade X or College Level",
    "clarityScore": 0-100,
    "complexity": "low/medium/high"
  },
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "topics": ["topic1", "topic2", "topic3"],
  "insights": {
    "intent": "What the author intends to achieve",
    "toneAnalysis": "Description of the tone used",
    "audienceSuitability": "Target audience description"
  },
  "improvements": ["suggestion1", "suggestion2", "suggestion3"],
  "confidenceScore": 0-100
}

IMPORTANT: When providing confidenceScore, be realistic and honest.
- Do NOT default to 100% - that would indicate perfect certainty which is rarely appropriate
- A typical confidence score should range between 50-85%
- Higher scores (85-95%) should only be used when you have very clear, unambiguous text
- Lower scores (30-60%) are appropriate for ambiguous, complex, or nuanced content
- Consider factors like: text clarity, context availability, ambiguity of language, and your certainty about the analysis

Return ONLY valid JSON without any additional text or markdown.`,

    sentiment: `You are an expert sentiment and emotion analysis AI. Perform a DEEP sentiment and emotional analysis of the provided text.

Focus extensively on:
1. Overall sentiment (positive, negative, neutral, or mixed)
2. Detailed sentiment score from -1.0 (very negative) to 1.0 (very positive)
3. ALL emotions detected with accurate percentages - identify emotions like joy, sadness, anger, fear, surprise, disgust, trust, anticipation, excitement, frustration, satisfaction, disappointment, hope, anxiety, confidence, surprise, love, hate, envy, pride, shame, guilt, compassion, and any other emotions present
4. Emotional intensity and nuances
5. Changes in sentiment throughout the text if applicable

Return ONLY valid JSON with this exact structure:

{
  "summary": {
    "shortSummary": "One sentence capturing the overall sentiment",
    "detailedSummary": "2-3 sentences describing the emotional tone and key sentiment findings",
    "keyPoints": ["Key emotional finding 1", "Key emotional finding 2", "Key emotional finding 3", "Key emotional finding 4", "Key emotional finding 5"]
  },
  "sentiment": {
    "overall": "positive/negative/neutral/mixed",
    "score": -1.0 to 1.0,
    "emotions": [
      {"emotion": "emotion_name", "percentage": 0-100},
      {"emotion": "emotion_name", "percentage": 0-100},
      {"emotion": "emotion_name", "percentage": 0-100},
      {"emotion": "emotion_name", "percentage": 0-100},
      {"emotion": "emotion_name", "percentage": 0-100}
    ]
  },
  "readability": {
    "gradeLevel": "Not applicable for sentiment",
    "clarityScore": 0,
    "complexity": "N/A"
  },
  "keywords": [],
  "topics": [],
  "insights": {
    "intent": "Emotional intent behind the text",
    "toneAnalysis": "Detailed analysis of the emotional tone and voice",
    "audienceSuitability": "Who would respond to this emotionally"
  },
  "improvements": [],
  "confidenceScore": 0-100
}

IMPORTANT: Provide a thorough emotion analysis with at least 3-5 distinct emotions. Be realistic with confidence scores.

Return ONLY valid JSON without any additional text or markdown.`,

    summary: `You are an expert text summarization AI. Create a COMPREHENSIVE summary of the provided text.

Focus extensively on:
1. A concise one-sentence summary capturing the essence
2. A detailed multi-sentence summary covering main points
3. Detailed key points extracted from the text
4. Identifying the main themes and topics
5. Capturing the author's main argument or story

Return ONLY valid JSON with this exact structure:

{
  "summary": {
    "shortSummary": "A brief one-sentence summary of the text",
    "detailedSummary": "A comprehensive multi-sentence summary covering all main points and details",
    "keyPoints": ["Key point 1 from the text", "Key point 2 from the text", "Key point 3 from the text", "Key point 4 from the text", "Key point 5 from the text", "Key point 6 from the text", "Key point 7 from the text"]
  },
  "sentiment": {
    "overall": "neutral",
    "score": 0,
    "emotions": []
  },
  "readability": {
    "gradeLevel": "N/A",
    "clarityScore": 0,
    "complexity": "N/A"
  },
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "topics": ["topic1", "topic2", "topic3"],
  "insights": {
    "intent": "Main purpose of the text",
    "toneAnalysis": "How the information is presented",
    "audienceSuitability": "Target audience for this content"
  },
  "improvements": [],
  "confidenceScore": 0-100
}

IMPORTANT: The summary and keyPoints should be detailed and comprehensive, capturing the essence of the text thoroughly.

Return ONLY valid JSON without any additional text or markdown.`,

    keywords: `You are an expert keyword and key phrase extraction AI. Extract ALL important keywords, key phrases, and entities from the provided text.

Focus extensively on:
1. Identifying all important keywords (nouns, verbs, adjectives that carry meaning)
2. Extracting named entities (people, places, organizations, dates, numbers)
3. Identifying key phrases (multi-word expressions)
4. Categorizing keywords by type (topics, themes, entities)
5. Ranking keywords by importance

Return ONLY valid JSON with this exact structure:

{
  "summary": {
    "shortSummary": "One sentence about what this text is about based on keywords",
    "detailedSummary": "2-3 sentences describing the main themes and topics identified through keyword analysis",
    "keyPoints": ["Theme 1", "Theme 2", "Theme 3", "Theme 4", "Theme 5"]
  },
  "sentiment": {
    "overall": "neutral",
    "score": 0,
    "emotions": []
  },
  "readability": {
    "gradeLevel": "N/A",
    "clarityScore": 0,
    "complexity": "N/A"
  },
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10", "keyword11", "keyword12", "keyword13", "keyword14", "keyword15"],
  "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "insights": {
    "intent": "Main subject matter based on keywords",
    "toneAnalysis": "How the keywords indicate the writing style",
    "audienceSuitability": "Target audience based on vocabulary and terminology"
  },
  "improvements": [],
  "confidenceScore": 0-100
}

IMPORTANT: Extract as many relevant keywords as possible (at least 10-15). Include technical terms, proper nouns, and domain-specific vocabulary.

Return ONLY valid JSON without any additional text or markdown.`,

    readability: `You are an expert readability and text complexity analysis AI. Perform a DEEP analysis of the text's readability and complexity.

Focus extensively on:
1. Reading grade level (using various metrics like Flesch-Kincaid, Gunning Fog, etc.)
2. Clarity score (0-100)
3. Complexity level (simple, moderate, complex, very complex)
4. Sentence structure analysis
5. Vocabulary complexity
6. Paragraph structure
7. Suggestions for improving readability

Return ONLY valid JSON with this exact structure:

{
  "summary": {
    "shortSummary": "One sentence about the readability level",
    "detailedSummary": "2-3 sentences describing the readability analysis findings",
    "keyPoints": ["Finding 1 about complexity", "Finding 2 about sentence structure", "Finding 3 about vocabulary", "Finding 4 about clarity", "Finding 5 about grade level"]
  },
  "sentiment": {
    "overall": "neutral",
    "score": 0,
    "emotions": []
  },
  "readability": {
    "gradeLevel": "Grade X or College Level or specific metric result",
    "clarityScore": 0-100,
    "complexity": "simple/moderate/complex/very complex"
  },
  "keywords": [],
  "topics": [],
  "insights": {
    "intent": "Readability assessment purpose",
    "toneAnalysis": "How complexity affects the tone perception",
    "audienceSuitability": "What audience level can easily understand this"
  },
  "improvements": ["Suggestion 1 to improve readability", "Suggestion 2 to improve readability", "Suggestion 3 to improve readability", "Suggestion 4 to improve readability", "Suggestion 5 to improve readability"],
  "confidenceScore": 0-100
}

IMPORTANT: Provide detailed readability metrics and specific improvement suggestions. Be realistic with scores.

Return ONLY valid JSON without any additional text or markdown.`,

    grammar: `You are an expert grammar and language correction AI. Perform a THOROUGH grammar and language analysis of the provided text.

Focus extensively on:
1. Grammar errors (subject-verb agreement, tense consistency, article usage, etc.)
2. Punctuation errors
3. Spelling errors
4. Sentence structure issues
5. Word choice improvements
6. Style improvements
7. Providing specific correction suggestions

Return ONLY valid JSON with this exact structure:

{
  "summary": {
    "shortSummary": "One sentence about the overall grammar quality",
    "detailedSummary": "2-3 sentences describing the grammar analysis findings",
    "keyPoints": ["Grammar issue 1", "Grammar issue 2", "Grammar issue 3", "Grammar issue 4", "Grammar issue 5"]
  },
  "sentiment": {
    "overall": "neutral",
    "score": 0,
    "emotions": []
  },
  "readability": {
    "gradeLevel": "N/A",
    "clarityScore": 0,
    "complexity": "N/A"
  },
  "keywords": [],
  "topics": [],
  "insights": {
    "intent": "Language quality assessment",
    "toneAnalysis": "How grammar affects tone perception",
    "audienceSuitability": "Appropriate audience for this writing level"
  },
  "improvements": ["Specific grammar correction 1", "Specific grammar correction 2", "Specific grammar correction 3", "Specific grammar correction 4", "Specific grammar correction 5"],
  "confidenceScore": 0-100
}

IMPORTANT: Provide specific, actionable grammar correction suggestions.

Return ONLY valid JSON without any additional text or markdown.`,

    summarization: `You are an expert text summarization AI. Create a COMPREHENSIVE summary of the provided text.

Focus extensively on:
1. A concise one-sentence summary capturing the essence
2. A detailed multi-sentence summary covering main points
3. Detailed key points extracted from the text
4. Identifying the main themes and topics
5. Capturing the author's main argument or story

Return ONLY valid JSON with this exact structure:

{
  "summary": {
    "shortSummary": "A brief one-sentence summary of the text",
    "detailedSummary": "A comprehensive multi-sentence summary covering all main points and details",
    "keyPoints": ["Key point 1 from the text", "Key point 2 from the text", "Key point 3 from the text", "Key point 4 from the text", "Key point 5 from the text", "Key point 6 from the text", "Key point 7 from the text"]
  },
  "sentiment": {
    "overall": "neutral",
    "score": 0,
    "emotions": []
  },
  "readability": {
    "gradeLevel": "N/A",
    "clarityScore": 0,
    "complexity": "N/A"
  },
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "topics": ["topic1", "topic2", "topic3"],
  "insights": {
    "intent": "Main purpose of the text",
    "toneAnalysis": "How the information is presented",
    "audienceSuitability": "Target audience for this content"
  },
  "improvements": [],
  "confidenceScore": 0-100
}

IMPORTANT: The summary and keyPoints should be detailed and comprehensive, capturing the essence of the text thoroughly.

Return ONLY valid JSON without any additional text or markdown.`
};

function getSystemPrompt(analysisType?: string): string {
  if (!analysisType) {
    return ANALYSIS_PROMPTS.general;
  }

  const normalizedType = analysisType.toLowerCase();

    if (normalizedType in ANALYSIS_PROMPTS) {
    return ANALYSIS_PROMPTS[normalizedType as keyof typeof ANALYSIS_PROMPTS];
  }

    return ANALYSIS_PROMPTS.general;
}

/**
 * Helper function to parse and clean JSON response from AI
 * Handles markdown code blocks, whitespace, and other formatting issues
 */
function parseAIResponse(responseText: string): any {
  // Step 1: Remove BOM (Byte Order Mark) if present
    let cleaned = responseText.replace(/^\uFEFF/, '');

    cleaned = cleaned.trim();

      const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonCandidate);
    } catch (nestedError) {
            const trimmedCandidate = jsonCandidate.trim();
      try {
        return JSON.parse(trimmedCandidate);
      } catch (secondError) {
        console.error("Failed to parse extracted JSON:", secondError);
        throw new Error(`Failed to parse AI response as JSON`);
      }
    }
  }

    try {
    return JSON.parse(cleaned);
  } catch (finalError) {
    console.error("Failed to parse AI response:", finalError);
    throw new Error(`Failed to parse AI response as JSON`);
  }
}

export async function analyzeText(
  request: AnalyzeRequest,
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

    const { text, analysisType } = request;

        if (!text || typeof text !== "string" || text.trim().length === 0) {
      throw new CustomAIError(
        "Invalid input: text must be a non-empty string",
        "INVALID_INPUT",
        400,
      );
    }

    if (text.length > 10000) {
      throw new CustomAIError(
        "Text too long: maximum 10000 characters allowed",
        "TEXT_TOO_LONG",
        400,
      );
    }

        const genAI = getGeminiClient();

        const userMessage = analysisType
      ? `Analyze the following text with focus on ${analysisType}:\n\n${text}`
      : `Analyze the following text:\n\n${text}`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = getSystemPrompt(analysisType);

    const result = await model.generateContent([
      systemPrompt,
      userMessage
    ]);

    const responseContent = result.response.text();

    if (!responseContent) {
      throw new CustomAIError(
        "No analysis generated from Gemini",
        "NO_ANALYSIS",
        500,
      );
    }

        let parsedAnalysis: AnalysisResult;
    try {
      const parsed = parseAIResponse(responseContent);

            console.debug("[AI Analysis] Raw confidence score from AI:", {
        rawConfidenceScore: parsed.confidenceScore,
        textLength: text.length,
        analysisType: analysisType || "general",
        timestamp: new Date().toISOString(),
      });

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
          gradeLevel: parsed.readability?.gradeLevel || "Unknown",
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
          ? Math.min(Math.max(parsed.confidenceScore, 0), 95) // Cap at 95%, floor at 0%
          : 75,
      };

            console.debug("[AI Analysis] Final confidence score after processing:", {
        finalConfidenceScore: parsedAnalysis.confidenceScore,
        rawConfidenceScore: parsed.confidenceScore,
        wasCapped: typeof parsed.confidenceScore === "number" && (parsed.confidenceScore > 95 || parsed.confidenceScore < 0),
        usedDefault: typeof parsed.confidenceScore !== "number",
        timestamp: new Date().toISOString(),
      });
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      throw new CustomAIError(
        "Failed to parse AI analysis response",
        "PARSE_ERROR",
        500,
      );
    }

    return {
      success: true,
      data: parsedAnalysis,
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);

    if (error instanceof CustomAIError) {
      return {
        success: false,
        error: error.message,
      };
    }

        if (error instanceof Error) {
      return {
        success: false,
        error: `Gemini API error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: "Internal server error during analysis",
    };
  }
}

export function validateTextInput(text: string, maxLength: number = 10000): boolean {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new CustomAIError(
      "Invalid input: text must be a non-empty string",
      "INVALID_INPUT",
      400,
    );
  }

  if (text.length > maxLength) {
    throw new CustomAIError(
      `Text too long: maximum ${maxLength} characters allowed`,
      "TEXT_TOO_LONG",
      400,
    );
  }

  return true;
}

class CustomAIError extends Error implements AIError {
  code: string;
  statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
