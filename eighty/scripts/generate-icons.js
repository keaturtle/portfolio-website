// Generates Eighty's app identity: the signature progress ring at ~80%, in the
// "Night Fir" palette, rendered with 4x supersampled anti-aliasing. Pure pngjs.
//
// Run from the eighty/ project root:  node scripts/generate-icons.js
// (optionally pass an output dir as the first arg).
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const OUT = process.argv[2] || path.join(__dirname, '..', 'assets', 'images');

const MINT = [127, 220, 178]; // #7fdcb2
const SIENNA = [224, 128, 90]; // #e0805a
const TRACK = [28, 51, 42]; // #1c332a — faint ring behind the arc
const BG_CENTER = [22, 33, 27]; // #16211b
const BG_EDGE = [11, 18, 15]; // #0b120f

const lerp = (a, b, t) => a + (b - a) * t;
const rad = (d) => (d * Math.PI) / 180;

/**
 * Draw the mark. `opaque` fills the square with the Night Fir radial (iOS icon
 * needs no alpha); otherwise the background is transparent (splash logo).
 * `scale` shrinks the ring within the canvas (adaptive-icon safe zone).
 */
function drawMark(size, { opaque, scale = 1 }) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.34 * scale;
  const strokeW = size * 0.092 * scale;
  const innerR = outerR - strokeW;
  const midR = (outerR + innerR) / 2;
  const capR = strokeW / 2;
  const sweepDeg = 288; // 80% of 360°
  const SS = 4;
  const inv = 1 / SS;

  const capPos = (deg) => [cx + midR * Math.sin(rad(deg)), cy - midR * Math.cos(rad(deg))];
  const [sx, sy] = capPos(0);
  const [ex, ey] = capPos(sweepDeg);
  const siennaR = capR * 0.6; // leading accent dot

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let cr = 0;
      let cg = 0;
      let cb = 0;
      let asum = 0;
      for (let sj = 0; sj < SS; sj++) {
        for (let si = 0; si < SS; si++) {
          const px = x + (si + 0.5) * inv;
          const py = y + (sj + 0.5) * inv;
          const dx = px - cx;
          const dy = py - cy;
          const dist = Math.hypot(dx, dy);

          let sr;
          let sg;
          let sb;
          let sa;
          if (opaque) {
            const t = Math.min(1, dist / (size * 0.62));
            sr = lerp(BG_CENTER[0], BG_EDGE[0], t);
            sg = lerp(BG_CENTER[1], BG_EDGE[1], t);
            sb = lerp(BG_CENTER[2], BG_EDGE[2], t);
            sa = 255;
          } else {
            sr = 0;
            sg = 0;
            sb = 0;
            sa = 0;
          }

          const inBand = dist >= innerR && dist <= outerR;
          let phi = (Math.atan2(dx, -dy) * 180) / Math.PI;
          if (phi < 0) phi += 360;

          if (inBand) [sr, sg, sb, sa] = [TRACK[0], TRACK[1], TRACK[2], 255];
          const inArc = inBand && phi <= sweepDeg;
          const inStartCap = Math.hypot(px - sx, py - sy) <= capR;
          const inEndCap = Math.hypot(px - ex, py - ey) <= capR;
          if (inArc || inStartCap || inEndCap) [sr, sg, sb, sa] = [MINT[0], MINT[1], MINT[2], 255];
          if (Math.hypot(px - ex, py - ey) <= siennaR)
            [sr, sg, sb, sa] = [SIENNA[0], SIENNA[1], SIENNA[2], 255];

          cr += sr * sa;
          cg += sg * sa;
          cb += sb * sa;
          asum += sa;
        }
      }
      const n = SS * SS;
      const idx = (y * size + x) << 2;
      png.data[idx] = asum > 0 ? Math.round(cr / asum) : 0;
      png.data[idx + 1] = asum > 0 ? Math.round(cg / asum) : 0;
      png.data[idx + 2] = asum > 0 ? Math.round(cb / asum) : 0;
      png.data[idx + 3] = Math.round(asum / n);
    }
  }
  return png;
}

function save(png, name) {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, PNG.sync.write(png));
  console.log('wrote', name, `${png.width}x${png.height}`);
}

save(drawMark(1024, { opaque: true }), 'icon.png');
save(drawMark(1024, { opaque: false }), 'splash-icon.png');
save(drawMark(1024, { opaque: false, scale: 0.66 }), 'adaptive-icon.png');
save(drawMark(96, { opaque: true }), 'favicon.png');
