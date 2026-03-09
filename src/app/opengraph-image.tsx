import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "ContentLens - AI-Powered Content Intelligence";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          background: "linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #6366F1 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            borderRadius: 30,
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: 80,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              fontFamily: "system-ui",
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            ContentLens
          </span>
          <span
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: 28,
              fontWeight: 500,
              marginTop: 16,
              fontFamily: "system-ui",
            }}
          >
            AI-Powered Content Intelligence
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

