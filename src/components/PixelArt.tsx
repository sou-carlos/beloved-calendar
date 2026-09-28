import type { ReactNode } from "react";
export type PixelKind =
  | "heart"
  | "gift"
  | "calendar"
  | "book"
  | "star"
  | "cake"
  | "cat"
  | "fox"
  | "mushroom"
  | "flower"
  | "leaf";
const sprites: Record<PixelKind, ReactNode> = {
  heart: (
    <>
      <path
        fill="#722d36"
        d="M2 3h4v1h4V3h4v1h1v6h-2v2h-2v2H9v1H7v-1H5v-2H3v-2H1V4h1z"
      />
      <path
        fill="#ec534c"
        d="M2 5h1V4h3v1h1v1h2V5h1V4h3v1h1v4h-2v2h-2v2H9v1H7v-1H6v-2H4V9H2z"
      />
      <path fill="#ffab81" d="M3 5h3v1H4v2H3z" />
    </>
  ),
  gift: (
    <>
      <path fill="#623d33" d="M3 1h4v2h2V1h4v4h2v4h-1v6H2V9H1V5h2z" />
      <path
        fill="#f6c349"
        d="M4 2h2v2H4zm6 0h2v2h-2zM2 6h12v2H2zM3 9h10v5H3z"
      />
      <path fill="#dd5446" d="M7 5h2v9H7zM3 10h4v3H3zm6-1h4v4H9z" />
      <path fill="#fff2a5" d="M3 6h4v1H3zm4-2h2v1H7z" />
    </>
  ),
  calendar: (
    <>
      <path fill="#693d28" d="M2 2h12v13H2zM4 0h2v4H4zm6 0h2v4h-2z" />
      <path fill="#f4d990" d="M3 6h10v8H3z" />
      <path fill="#e96043" d="M3 3h10v3H3z" />
      <path
        fill="#8a5836"
        d="M4 8h2v2H4zm3 0h2v2H7zm3 0h2v2h-2zm-6 3h2v2H4zm3 0h2v2H7z"
      />
      <path fill="#e96043" d="M10 11h2v2h-2z" />
    </>
  ),
  book: (
    <>
      <path fill="#633d2d" d="M2 1h11v2h1v12H2V1z" />
      <path fill="#aa593c" d="M3 2h9v10H3z" />
      <path fill="#efc77b" d="M4 13h9v1H4zM5 4h5v1H5zm0 2h5v1H5z" />
      <path fill="#e3a752" d="M3 2h1v10H3zM9 9h2v3H9z" />
    </>
  ),
  star: (
    <>
      <path
        fill="#976026"
        d="M7 0h2v4h2v1h5v3h-2v2h-2v5H9v-2H7v2H4v-5H2V8H0V5h5V4h2z"
      />
      <path fill="#ffd452" d="M7 3h2v3h5v1h-2v2h-2v4H9v-2H7v2H6V9H4V7H2V6h5z" />
      <path fill="#fff4b1" d="M7 5h2v2H7z" />
    </>
  ),
  cake: (
    <>
      <path fill="#784431" d="M1 8h14v7H1zM3 5h10v4H3zM7 1h2v4H7z" />
      <path fill="#fbce7d" d="M2 9h12v5H2z" />
      <path fill="#faede0" d="M4 5h8v3h2v3h-2v-1h-2v1H8v-1H6v1H4v-1H2V8h2z" />
      <path fill="#e96569" d="M2 12h12v1H2zM7 3h2v3H7z" />
      <path fill="#ffbb35" d="M7 0h2v2H7z" />
    </>
  ),
  cat: (
    <>
      <path fill="#644334" d="M2 2h3v2h6V2h3v10h-2v2H4v-2H2z" />
      <path fill="#df9c52" d="M3 3h1v3h8V3h1v8h-2v2H5v-2H3z" />
      <path fill="#fff0bb" d="M5 9h6v3H5z" />
      <path fill="#473123" d="M4 7h2v2H4zm6 0h2v2h-2zM7 10h2v1H7z" />
      <path fill="#d76b66" d="M3 4h1v2H3zm9 0h1v2h-1z" />
    </>
  ),
  fox: (
    <>
      <path fill="#683b2c" d="M1 1h3v2h8V1h3v9h-2v2h-2v2H5v-2H3v-2H1z" />
      <path fill="#e77d32" d="M2 2h1v3h10V2h1v7h-2v2h-2v2H6v-2H4V9H2z" />
      <path fill="#ffedc3" d="M3 8h3v2h4V8h3v2h-2v2H9v1H7v-1H5v-2H3z" />
      <path fill="#3f3227" d="M4 6h2v2H4zm6 0h2v2h-2zm-3 4h2v2H7z" />
    </>
  ),
  mushroom: (
    <>
      <path fill="#653b31" d="M5 1h6v2h2v2h2v5h-5v4h2v1H4v-1h2v-4H1V5h2V3h2z" />
      <path fill="#e75a43" d="M5 2h6v2h2v2h1v3H2V6h1V4h2z" />
      <path fill="#ffe2a5" d="M6 10h4v4H6zM5 3h2v2H5zm4 3h3v2H9zM3 6h2v2H3z" />
    </>
  ),
  flower: (
    <>
      <path
        fill="#48652f"
        d="M7 8h2v7H7zM3 10h3v1h1v2H5v-1H3zm6 0h1V9h3v2h-2v1H9z"
      />
      <path fill="#a73557" d="M5 1h6v2h2v5h-2v2H5V8H3V3h2z" />
      <path fill="#ed6b85" d="M6 2h4v2h2v3h-2v2H6V7H4V4h2z" />
      <path fill="#ffd560" d="M6 4h4v3H6z" />
    </>
  ),
  leaf: (
    <>
      <path
        fill="#366442"
        d="M10 1h5v5h-1v4h-2v2H8v1H5v2H2v-2h2V7h2V5h2V3h2z"
      />
      <path fill="#7baa42" d="M11 2h3v4h-1v3h-2v2H6V7h2V5h2V3h1z" />
      <path fill="#c6d966" d="M11 4h1v2h-2v2H8v2H6V8h2V6h2V4z" />
    </>
  ),
};
export default function PixelArt({
  kind,
  size = 32,
}: {
  kind: PixelKind;
  size?: number;
}) {
  return (
    <svg
      className="pixel-art"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {sprites[kind]}
    </svg>
  );
}
const symbols: Record<string, PixelKind> = {
  "🌷": "flower",
  "🌻": "star",
  "🍄": "mushroom",
  "🌿": "leaf",
  "🐱": "cat",
  "🦊": "fox",
  "🍓": "cake",
  "🦋": "gift",
};
export function PixelAvatar({
  emoji,
  size = 32,
}: {
  emoji?: string;
  size?: number;
}) {
  return <PixelArt kind={symbols[emoji || ""] || "cat"} size={size} />;
}
