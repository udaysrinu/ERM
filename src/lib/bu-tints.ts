// Per-BU pastel tints — mirrors CSS custom properties --bu-tint-* / --bu-dot-*.
// JSX consumers pull these to color the sidebar BU rail and scope tile headers
// without round-tripping through getComputedStyle.
export const BU_TINTS: Record<string, { tint: string; dot: string }> = {
  gen:  { tint: "#F5E4C8", dot: "#D49E3C" },
  tra:  { tint: "#D8E4EF", dot: "#6B8FAE" },
  dis:  { tint: "#D9E5D3", dot: "#7B9A6B" },
  corp: { tint: "#EEE6D7", dot: "#A89673" },
  sub:  { tint: "#EBDEE0", dot: "#B08894" },
  jv:   { tint: "#DDD8E9", dot: "#8E82A8" },
};
