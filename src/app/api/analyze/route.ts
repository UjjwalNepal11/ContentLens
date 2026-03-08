import { NextRequest, NextResponse } from "next/server";
import { analyzeText } from "@/lib/ai";
import { analyzeImage } from "@/lib/ai-image";
import { AnalyzeRequest } from "@/lib/types";
import { getPrisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { recordActivity, ActivityType } from "@/lib/activity";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

const ANALYSIS_RATE_LIMIT = 10;
const ANALYSIS_WINDOW_MS = 60000; // 1 minute

// Allowed MIME types for image uploads
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function extractBase64FromDataURL(dataURL: string): { base64: string; mimeType: string } | null {
  const match = dataURL.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      base64: match[2],
    };
  }
  return null;
}

async function handleImageAnalysis(
  request: NextRequest,
  userId: string,
  contentType: string
) {
  const startTime = Date.now();

    if (!ALLOWED_IMAGE_TYPES.some(type => contentType.includes(type))) {
    return NextResponse.json(
      { success: false, error: "Invalid file type. Allowed types: JPEG, PNG, GIF, WebP, BMP, SVG" },
      { status: 400 },
    );
  }

    let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("Invalid form data:", error);
    return NextResponse.json(
      { success: false, error: "Invalid form data" },
      { status: 400 },
    );
  }

    const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file provided" },
      { status: 400 },
    );
  }

    if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: "File too large. Maximum size is 5MB" },
      { status: 400 },
    );
  }

    const analysisType = formData.get("analysisType") as string | null;

    const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const mimeType = file.type;

  console.log(
    `[${new Date().toISOString()}] AI Image Analysis Request - File: ${file.name}, Size: ${file.size} bytes, Type: ${mimeType}`,
  );

    let result;
  try {
    result = await analyzeImage(base64, mimeType, analysisType || undefined);
  } catch (aiError) {
    console.error("AI image analysis function threw an error:", aiError);
    return NextResponse.json(
      { success: false, error: "AI image analysis failed: " + (aiError instanceof Error ? aiError.message : "Unknown error") },
      { status: 500 },
    );
  }

    let savedRecord = null;
  if (result.success && result.data) {
    try {
      const analysisData = {
        ...result.data,
        analysisType: analysisType || "image",
      };

      savedRecord = await getPrisma().analysis.create({
        data: {
          userId,
          text: `[Image: ${file.name}]`,
          analysis: analysisData as any,
          fileName: file.name,
        },
      });

      await recordActivity(userId, ActivityType.ANALYSIS, {
        confidenceScore: result.data?.confidenceScore ?? 0,
        topics: result.data?.topics ?? [],
        textLength: file.size,
        analysisType: analysisType || "image",
      });

      console.log(`[${new Date().toISOString()}] Image analysis saved to database for user ${userId}`);
    } catch (dbError) {
      console.error("Failed to save analysis to database:", dbError);
    }
  }

    const duration = Date.now() - startTime;
  console.log(
    `[${new Date().toISOString()}] AI Image Analysis Response - Success: ${result.success}, Duration: ${duration}ms`,
  );

    const response = {
    ...result,
    savedRecordId: savedRecord?.id || null,
    savedRecord: savedRecord ? {
      id: savedRecord.id,
      userId: savedRecord.userId,
      text: savedRecord.text,
      analysis: savedRecord.analysis,
      createdAt: savedRecord.createdAt,
    } : null,
  };

  if (result.success) {
    return NextResponse.json(response, { status: 200 });
  } else {
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
        const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

        const rateLimitResult = checkRateLimit(userId, ANALYSIS_RATE_LIMIT, ANALYSIS_WINDOW_MS);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult.remaining, rateLimitResult.resetTime),
        }
      );
    }

        const contentType = request.headers.get("content-type");

        if (contentType?.includes("multipart/form-data")) {
      return await handleImageAnalysis(request, userId, contentType);
    }

        let body: AnalyzeRequest;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Invalid JSON in request body:", error);
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

        if (!body || typeof body !== "object") {
      console.error("Request body is not an object");
      return NextResponse.json(
        { success: false, error: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    if (!body.text || typeof body.text !== "string") {
      console.error("Missing or invalid text field in request body");
      return NextResponse.json(
        {
          success: false,
          error: 'Request body must contain a "text" field with a string value',
        },
        { status: 400 },
      );
    }

        const textLength = body.text.trim().length;
    if (textLength === 0) {
      console.error("Text is empty or whitespace only");
      return NextResponse.json(
        {
          success: false,
          error: "Text field cannot be empty or whitespace only",
        },
        { status: 400 },
      );
    }

    if (textLength > 10000) {
      console.error(`Text too long: ${textLength} characters`);
      return NextResponse.json(
        {
          success: false,
          error: "Text field exceeds maximum length of 10000 characters",
        },
        { status: 400 },
      );
    }

        if (body.analysisType !== undefined) {
      if (typeof body.analysisType !== "string") {
        console.error("Invalid analysisType field in request body");
        return NextResponse.json(
          {
            success: false,
            error: 'analysisType must be a string if provided',
          },
          { status: 400 },
        );
      }

      const allowedTypes = ["general", "sentiment", "summary", "keywords", "readability", "grammar", "summarization"];
      if (body.analysisType && !allowedTypes.includes(body.analysisType.toLowerCase())) {
        console.warn(`Unknown analysisType: ${body.analysisType}`);
      }
    }

        console.log(
      `[${new Date().toISOString()}] AI Analysis Request - Text length: ${textLength} characters, analysisType: ${body.analysisType || 'general'}`,
    );

        let result;
    try {
      result = await analyzeText(body);
    } catch (aiError) {
      console.error("AI analysis function threw an error:", aiError);
      return NextResponse.json(
        { success: false, error: "AI analysis failed: " + (aiError instanceof Error ? aiError.message : "Unknown error") },
        { status: 500 },
      );
    }

        console.log(`[${new Date().toISOString()}] AI Analysis Result - Success: ${result.success}, Error: ${result.error || 'none'}`);

        let savedRecord = null;
    if (result.success && result.data) {
      try {
        const analysisData = {
          ...result.data,
          analysisType: body.analysisType || "general",
        };

        savedRecord = await getPrisma().analysis.create({
          data: {
            userId,
            text: body.text,
            analysis: analysisData as any,
          },
        });

        await recordActivity(userId, ActivityType.ANALYSIS, {
          confidenceScore: result.data?.confidenceScore ?? 0,
          topics: result.data?.topics ?? [],
          textLength: textLength,
          analysisType: body.analysisType || "general",
        });

        console.log(`[${new Date().toISOString()}] Analysis saved to database for user ${userId}`);
      } catch (dbError) {
        console.error("Failed to save analysis to database:", dbError);
      }
    }

        const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] AI Analysis Response - Success: ${result.success}, Duration: ${duration}ms`,
    );

        const response = {
      ...result,
      savedRecordId: savedRecord?.id || null,
      savedRecord: savedRecord ? {
        id: savedRecord.id,
        userId: savedRecord.userId,
        text: savedRecord.text,
        analysis: savedRecord.analysis,
        createdAt: savedRecord.createdAt,
      } : null,
    };

    if (result.success) {
      return NextResponse.json(response, { status: 200 });
    } else {
      return NextResponse.json(response, { status: 500 });
    }
  } catch (error) {
    console.error("Unexpected error in AI analysis route:", error);

    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] AI Analysis Error - Duration: ${duration}ms`,
    );

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}
