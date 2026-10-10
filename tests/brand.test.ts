import { test } from "node:test";
import assert from "node:assert/strict";
import { BRAND_SLOTS, brand, brandCss, derivePalettes, parseBrand, senderLine } from "@/brand";
import tokens from "../brand/brand.json";
import fs from "node:fs";
import path from "node:path";
import { applicationName, companyName } from "@/app-config";

test("brand/brand.json has the four brand slots and no others", () => {
  assert.deepEqual(Object.keys(tokens).sort(), ["logo", "primary_color", "product_name", "tone"]);
  assert.deepEqual([...BRAND_SLOTS].sort(), Object.keys(tokens).sort());
  assert.equal(brand.productName.length > 0, true);
});

test("a fifth slot is refused, not ignored", () => {
  assert.throws(() => parseBrand({ ...tokens, secondary_color: "#000000" }), /exactly/);
  assert.throws(() => parseBrand({ ...tokens, primary_color: "indigo" }), /#rrggbb/);
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

test("the sender's name is the product's, in front of the deployment's address", () => {
  assert.equal(senderLine("hello@example.test"), `${brand.productName} <hello@example.test>`);
  assert.equal(senderLine(" mail@ledgerly.app ", "Ledgerly"), "Ledgerly <mail@ledgerly.app>");
  // A name with a comma or a quote is quoted, or it reads as two recipients.
  assert.equal(senderLine("a@b.test", "Acme, Inc"), '"Acme, Inc" <a@b.test>');
  assert.equal(senderLine("a@b.test", 'The "Best" app'), '"The \\"Best\\" app" <a@b.test>');
  // A whole from-line set at deployment is taken as written.
  assert.equal(senderLine("Support <s@b.test>", "Ledgerly"), "Support <s@b.test>");
});

test("the company is the product: one name, from the brand file", () => {
  assert.equal(companyName, brand.productName);
  assert.equal(applicationName, brand.productName);
});

// The starter's own names, domains and author, and the placeholder product
// name, reach no page, email or public file: each one a builder's product
// would have shipped (RapidBuild's GF-24 walk found two, F3 and F10, one
// scaffold at a time). The placeholder name lives only in brand/brand.json.
test("no starter name, domain or author is left where a product shows it", () => {
  const residue = /groupie|group finder|groupfinder|wdc ?starter|webdevcody|your product|pizza hut|starterkit"/i;
  const roots = ["src", "content", "public"];
  const hits: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(tsx?|mdx?|json|xml|txt|html)$/.test(entry.name)) {
        fs.readFileSync(file, "utf8").split("\n").forEach((line, i) => {
          if (residue.test(line)) hits.push(`${file}:${i + 1}: ${line.trim()}`);
        });
      }
    }
  };
  roots.forEach(walk);
  assert.deepEqual(hits, []);
});
