import { test } from "node:test";
import assert from "node:assert/strict";
import { BRAND_SLOTS, brand, brandCss, derivePalettes, parseBrand } from "@/brand";
import tokens from "@/brand/tokens.json";

test("the token file has the four brand slots and no others", () => {
  assert.deepEqual(Object.keys(tokens).sort(), [...BRAND_SLOTS].sort());
  assert.equal(brand.productName.length > 0, true);
});

test("a fifth slot is refused, not ignored", () => {
  assert.throws(() => parseBrand({ ...tokens, secondaryColor: "#000000" }), /exactly/);
  assert.throws(() => parseBrand({ ...tokens, primaryColor: "indigo" }), /#rrggbb/);
  assert.throws(() => parseBrand({ ...tokens, logo: "logo.svg" }), /public/);
});

test("light and dark palettes are derived from the one colour", () => {
  const { light, dark } = derivePalettes("#4f46e5");
  const lightness = (v: string) => Number(v.split(" ")[2].replace("%", ""));
  assert.ok(lightness(dark.primary) > lightness(light.primary), "dark theme lifts the colour");
  assert.equal(light.primaryForeground, "0 0% 100%", "white text on the light theme's fill");
  // A pale brand colour still yields a fill white text can sit on.
  assert.ok(lightness(derivePalettes("#fde68a").light.primary) <= 55);
  assert.match(brandCss(), /^:root\{--primary:[^}]+\}\.dark\{--primary:[^}]+\}$/);
});
