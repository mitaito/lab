import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/logo";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}: interactive research in game theory, simulation and emergent systems`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TOPICS = ["Game theory", "Web audio", "WebGL", "WebGPU", "Local-first"];

/** 1200x630 share card, drawn at build time with the default Geist font. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#e3e1ec",
          backgroundColor: "#12131a",
          backgroundImage:
            "radial-gradient(circle at 88% 8%, rgba(74,225,118,0.32), rgba(18,19,26,0) 46%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <LogoMark size={88} />
          <div style={{ display: "flex", fontSize: 52, color: "#ffffff" }}>
            Mitaito
            <span style={{ color: "#4ae176", marginLeft: 14 }}>Lab</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 70,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              color: "#ffffff",
            }}
          >
            Curiosity without boundaries.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 70,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              color: "#4ae176",
            }}
          >
            Rigor without orthodoxy.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {TOPICS.map((topic) => (
            <div
              key={topic}
              style={{
                display: "flex",
                fontSize: 26,
                padding: "10px 22px",
                borderRadius: 999,
                color: "#c4c7c9",
                border: "2px solid rgba(74,225,118,0.4)",
                backgroundColor: "rgba(74,225,118,0.08)",
              }}
            >
              {topic}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
