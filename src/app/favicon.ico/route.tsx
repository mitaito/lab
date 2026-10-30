import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/logo";

const SIZES = [16, 32, 48];

async function renderPng(size: number): Promise<Uint8Array> {
  const image = new ImageResponse(<LogoMark size={size} />, {
    width: size,
    height: size,
  });
  return new Uint8Array(await image.arrayBuffer());
}

/** An .ico is a small directory followed by the images; PNG data is allowed. */
function packIco(images: { size: number; data: Uint8Array }[]): Uint8Array {
  const headerSize = 6 + images.length * 16;
  const total = headerSize + images.reduce((n, { data }) => n + data.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);

  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, images.length, true);

  let offset = headerSize;
  images.forEach(({ size, data }, index) => {
    const entry = 6 + index * 16;
    view.setUint8(entry, size); // width
    view.setUint8(entry + 1, size); // height
    view.setUint16(entry + 4, 1, true); // colour planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, data.length, true);
    view.setUint32(entry + 12, offset, true);
    out.set(data, offset);
    offset += data.length;
  });
  return out;
}

/** Legacy /favicon.ico, generated from the same logo as everything else. */
export async function GET() {
  const images = await Promise.all(
    SIZES.map(async (size) => ({ size, data: await renderPng(size) })),
  );
  return new Response(Buffer.from(packIco(images)), {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
