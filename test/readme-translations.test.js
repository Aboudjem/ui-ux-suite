"use strict";

// The translated READMEs must not drift from the English one.
// The check that matters most: each translation states the same test count.

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const LANGS = ["zh-CN", "ja", "es", "fr"];

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

// The Proof table row whose command is `npm test`. Its first number is the test count.
function testCount(md, label) {
  const row = md
    .split("\n")
    .find((l) => l.startsWith("|") && /\|\s*`npm test`\s*\|/.test(l));
  assert.ok(row, `${label}: no Proof row with \`npm test\``);
  const m = row.match(/\d+/);
  assert.ok(m, `${label}: the \`npm test\` row states no number`);
  return Number(m[0]);
}

const codeBlocks = (md) => md.match(/```[\s\S]*?```/g) || [];
const headingLevels = (md) =>
  md
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .filter((l) => /^#{1,6} /.test(l))
    .map((l) => l.match(/^#+/)[0].length);

describe("translated READMEs", () => {
  const en = read("README.md");
  const enCount = testCount(en, "README.md");

  for (const lang of LANGS) {
    const file = `READMEs/${lang}.md`;
    const md = read(file);

    it(`${file} states the same test count as the English README (${enCount})`, () => {
      assert.equal(testCount(md, file), enCount);
    });

    it(`${file} keeps every code block of the English README verbatim`, () => {
      assert.deepEqual(codeBlocks(md), codeBlocks(en));
    });

    it(`${file} has the same heading structure as the English README`, () => {
      assert.deepEqual(headingLevels(md), headingLevels(en));
    });

    it(`${file} has no stars badge and no em dash`, () => {
      assert.ok(
        !/stargazers|github\/stars/.test(md),
        "stars badge or stargazers link found",
      );
      assert.ok(!md.includes(String.fromCharCode(0x2014)) && !md.includes("&mdash;"), "em dash found");
    });

    it(`${file} ends with the machine-assisted translation note`, () => {
      const last = md.trimEnd().split("\n").pop();
      assert.match(last, /^<sub>.*<a href="\.\.\/README\.md">.*<\/sub>$/);
    });
  }
});
