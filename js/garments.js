/*
 * Garment outlines shared by the shop and the designer.
 * Paths are drawn on a 200 x 200 grid.
 */
const GARMENT_SHAPES = {
  tee: "M60 30 L82 22 Q100 36 118 22 L140 30 L176 56 L160 84 L140 73 L140 180 L60 180 L60 73 L40 84 L24 56 Z",
  tank: "M72 20 Q76 52 100 54 Q124 52 128 20 L142 24 Q138 62 150 80 L150 180 L50 180 L50 80 Q62 62 58 24 Z",
  longsleeve: "M60 30 L82 22 Q100 36 118 22 L140 30 L168 58 L188 152 L166 158 L148 92 L140 80 L140 180 L60 180 L60 80 L52 92 L34 158 L12 152 L32 58 Z",
  hoodie: "M60 32 L80 24 Q100 40 120 24 L140 32 L168 60 L188 152 L166 158 L148 94 L142 84 L142 180 L58 180 L58 84 L52 94 L34 158 L12 152 L32 60 Z",
};

// Back views only differ where the neckline sits higher.
const GARMENT_BACK_SHAPES = {
  tee: "M60 30 L82 22 Q100 28 118 22 L140 30 L176 56 L160 84 L140 73 L140 180 L60 180 L60 73 L40 84 L24 56 Z",
  tank: "M72 20 Q78 38 100 40 Q122 38 128 20 L142 24 Q138 62 150 80 L150 180 L50 180 L50 80 Q62 62 58 24 Z",
  longsleeve: "M60 30 L82 22 Q100 28 118 22 L140 30 L168 58 L188 152 L166 158 L148 92 L140 80 L140 180 L60 180 L60 80 L52 92 L34 158 L12 152 L32 58 Z",
  hoodie: GARMENT_SHAPES.hoodie,
};

function starPath(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push((cx + rad * Math.cos(a)).toFixed(1) + " " + (cy + rad * Math.sin(a)).toFixed(1));
  }
  return "M" + pts.join(" L") + "Z";
}

function isLightColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}
