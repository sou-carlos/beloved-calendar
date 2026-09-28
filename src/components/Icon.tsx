import type { ReactNode } from "react";
export type IconName =
  | "calendar"
  | "people"
  | "gift"
  | "heart"
  | "plus"
  | "chevron"
  | "search"
  | "close"
  | "leaf"
  | "download";
const paths: Record<IconName, ReactNode> = {
  calendar: (
    <>
      <path d="M2 2h12v13H2zm2 3v8h8V5z" fillRule="evenodd" />
      <path d="M4 0h2v4H4zm6 0h2v4h-2zM5 7h2v2H5zm4 0h2v2H9zm-4 3h2v2H5z" />
    </>
  ),
  people: (
    <>
      <path
        d="M5 1h6v2h1v4h-2v2h3v2h2v4H1v-4h2V9h3V7H4V3h1zm1 2v3h4V3zm-2 8v2h8v-2z"
        fillRule="evenodd"
      />
    </>
  ),
  gift: (
    <>
      <path
        d="M2 1h5v2h2V1h5v5h1v4h-1v5H2v-5H1V6h1zm2 2v3h2V3zm6 0v3h2V3zM3 8v1h4V8zm6 0v1h4V8zm-5 3v2h3v-2zm5 0v2h3v-2z"
        fillRule="evenodd"
      />
    </>
  ),
  heart: <path d="M2 2h4v1h4V2h4v2h1v5h-2v2h-2v2H9v2H7v-2H5v-2H3V9H1V4h1z" />,
  plus: <path d="M7 2h2v5h5v2H9v5H7V9H2V7h5z" />,
  chevron: <path d="M5 2h2v2h2v2h2v4H9v2H7v2H5v-3h2V9h2V7H7V5H5z" />,
  search: (
    <path
      d="M3 1h6v1h2v2h1v5h-2v2H8v1H3v-2H1V8H0V4h1V2h2zm0 3v4h1v1h4V8h1V4H8V3H4v1zm7 6h2v2h2v2h2v2h-3v-2h-2v-2h-1z"
      fillRule="evenodd"
    />
  ),
  close: (
    <path d="M2 2h3v2h2v2h2V4h2V2h3v3h-2v2h-2v2h2v2h2v3h-3v-2H9v-2H7v2H5v2H2v-3h2V9h2V7H4V5H2z" />
  ),
  leaf: <path d="M11 1h4v5h-1v3h-2v2H9v1H6v2H2v-2h3V7h2V5h2V3h2z" />,
  download: <path d="M7 1h2v7h3v2h-2v2H6v-2H4V8h3zM1 11h2v3h10v-3h2v5H1z" />,
};
export default function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
