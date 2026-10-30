import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon: full-bleed, because iOS rounds the corners itself. */
export default function AppleIcon() {
  return new ImageResponse(<LogoMark size={180} bleed />, size);
}
