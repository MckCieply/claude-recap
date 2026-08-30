/**
 * Self-contained sRGB hex -> OKLCH -> blend -> sRGB hex helper for the multi-source heatmap's
 * 2-source overlap gradient (DESIGN_DIRECTION.md "Heatmap cell rendering with multiple sources":
 * "the center stop is an unweighted OKLCH blend of the two corner colors (hue/chroma/lightness
 * averaged, circular mean for hue)"). No OKLCH utility existed elsewhere in the repo (checked via
 * grep before writing this), so this implements the well-known Bjorn Ottosson OKLab conversion
 * directly rather than pulling in a dependency for one helper.
 */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Oklch {
  l: number;
  c: number;
  h: number; // degrees, 0-360
}

function hexToRgb(hex: string): Rgb {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const toByte = (c: number) => Math.round(Math.min(1, Math.max(0, c)) * 255);
  const toHex = (c: number) => toByte(c).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  const clamped = Math.min(1, Math.max(0, c));
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

/** Linear sRGB -> OKLab, then OKLab -> OKLCH (polar form). */
function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.sqrt(a * a + bb * bb);
  const h = (Math.atan2(bb, a) * 180) / Math.PI;
  return { l: L, c, h: h < 0 ? h + 360 : h };
}

/** OKLCH -> OKLab -> linear sRGB -> sRGB. Inverse of {@link rgbToOklch}. */
function oklchToRgb({ l, c, h }: Oklch): Rgb {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const bb = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * bb;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * bb;
  const s_ = l - 0.0894841775 * a - 1.291485548 * bb;

  const lCubed = l_ * l_ * l_;
  const mCubed = m_ * m_ * m_;
  const sCubed = s_ * s_ * s_;

  const r = 4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
  const g = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
  const b = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

  return { r: linearToSrgb(r), g: linearToSrgb(g), b: linearToSrgb(b) };
}

/** Circular mean of two hue angles (degrees), for OKLCH's polar hue component. */
function meanHue(h1: number, h2: number): number {
  const rad1 = (h1 * Math.PI) / 180;
  const rad2 = (h2 * Math.PI) / 180;
  const x = (Math.cos(rad1) + Math.cos(rad2)) / 2;
  const y = (Math.sin(rad1) + Math.sin(rad2)) / 2;
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return deg < 0 ? deg + 360 : deg;
}

/**
 * Unweighted OKLCH blend of two sRGB hex colors: average lightness, average chroma, circular-mean
 * hue. Used for the center stop of a 2-source heatmap overlap cell — see module doc comment.
 */
export function blendHexOklch(hexA: string, hexB: string): string {
  const a = rgbToOklch(hexToRgb(hexA));
  const b = rgbToOklch(hexToRgb(hexB));
  const blended: Oklch = {
    l: (a.l + b.l) / 2,
    c: (a.c + b.c) / 2,
    h: meanHue(a.h, b.h),
  };
  return rgbToHex(oklchToRgb(blended));
}
