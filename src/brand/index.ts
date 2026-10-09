// The product's brand: four slots in tokens.json, and nothing else a builder
// sets.
//
// RapidBuild asks the builder four plain questions (the brand sheet) and its
// scaffold writes the answers into tokens.json; every screen reads them from
// here. The slots are:
//
//   productName   the product's name, shown in the header, titles and mail
//   logo          a file under public/ (e.g. "/brand/logo.svg"), or null for
//                 a wordmark rendered from the name
//   primaryColor  one colour as #rrggbb; the light and dark palettes are
//                 derived from it below, never asked for
//   tone          one line describing how copy should sound, read by whoever
//                 writes the product's words
//
// Why exactly four and why only here: a brand that can be set in a second
// place drifts from the first, and a fifth slot (a second colour, a typeface)
// is a question a non-designer cannot answer well. Adding a slot is a change
// to this template and to the preset, not to one product.

import tokens from "./tokens.json";

export const BRAND_SLOTS = ["productName", "logo", "primaryColor", "tone"] as const;

export type Brand = {
  productName: string;
  logo: string | null;
  primaryColor: string;
  tone: string;
};

export function parseBrand(raw: unknown): Brand {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("brand tokens must be an object");
  }
  const keys = Object.keys(raw).sort();
  const expected = [...BRAND_SLOTS].sort();
  if (keys.join(",") !== expected.join(",")) {
    throw new Error(
      `brand tokens must have exactly ${expected.join(", ")}; found ${keys.join(", ")}`
    );
  }
  const b = raw as Record<string, unknown>;
  if (typeof b.productName !== "string" || !b.productName.trim()) {
    throw new Error("productName must be a non-empty string");
  }
  if (b.logo !== null && (typeof b.logo !== "string" || !b.logo.startsWith("/"))) {
    throw new Error("logo must be null or a path under public/ starting with /");
  }
  if (typeof b.primaryColor !== "string" || !/^#[0-9a-fA-F]{6}$/.test(b.primaryColor)) {
    throw new Error("primaryColor must be #rrggbb");
  }
  if (typeof b.tone !== "string") {
    throw new Error("tone must be a string");
  }
  return {
    productName: b.productName.trim(),
    logo: b.logo as string | null,
    primaryColor: b.primaryColor.toLowerCase(),
    tone: b.tone.trim(),
  };
}

export const brand: Brand = parseBrand(tokens);

// ---- palette derivation ---------------------------------------------------

type Hsl = { h: number; s: number; l: number };

export function hexToHsl(hex: string): Hsl {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const css = ({ h, s, l }: Hsl) => `${h} ${s}% ${l}%`;

// Text on a filled primary: white on a dark fill, near-black on a light one.
function foregroundOn({ l }: Hsl): Hsl {
  return l > 60 ? { h: 222, s: 47, l: 11 } : { h: 0, s: 0, l: 100 };
}

export type Palette = { primary: string; primaryForeground: string; ring: string };

// Light: the colour itself, kept dark enough to carry white text. Dark: the
// same hue lifted so it reads on a near-black page.
export function derivePalettes(primaryColor: string): { light: Palette; dark: Palette } {
  const base = hexToHsl(primaryColor);
  const light = { ...base, l: clamp(base.l, 30, 55) };
  const dark = { ...base, l: clamp(base.l + 15, 55, 72) };
  return {
    light: { primary: css(light), primaryForeground: css(foregroundOn(light)), ring: css(light) },
    dark: { primary: css(dark), primaryForeground: css(foregroundOn(dark)), ring: css(dark) },
  };
}

// The CSS variables the theme (globals.css, tailwind.config.ts) reads. The
// root layout injects this after globals.css, so the brand wins over the
// starter's defaults in both themes.
export function brandCss(b: Brand = brand): string {
  const { light, dark } = derivePalettes(b.primaryColor);
  const block = (p: Palette) =>
    `--primary:${p.primary};--primary-foreground:${p.primaryForeground};--ring:${p.ring};` +
    `--brand-primary:${p.primary};--brand-primary-foreground:${p.primaryForeground};`;
  return `:root{${block(light)}}.dark{${block(dark)}}`;
}
