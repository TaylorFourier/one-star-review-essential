import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const review =
  "Gravity, one star. Dropped pills are not lost. They are under the refrigerator, against the wall.";

function counts(text: string): { utf16: number; codepoints: number; bytes: number } {
  return {
    utf16: text.length,
    codepoints: [...text].length,
    bytes: Buffer.byteLength(text, "utf8"),
  };
}

function assertReview(text: string): void {
  const measured = counts(text);
  if (text.length === 0 || text.trim() !== text) {
    throw new Error("review must be one non-blank line with no surrounding spaces");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("review must be a single line");
  }
  for (const unit of text) {
    const code = unit.codePointAt(0);
    if (code === undefined || code < 0x20 || code > 0x7e) {
      throw new Error("review must be printable ASCII");
    }
  }
  if (measured.utf16 > 160 || measured.codepoints > 160 || measured.bytes > 160) {
    throw new Error(
      `review exceeds 160 (utf16=${measured.utf16} codepoints=${measured.codepoints} bytes=${measured.bytes})`,
    );
  }
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
assertReview(review);
mkdirSync(outputDir, { recursive: true });
const destination = join(outputDir, "entry.txt");
const payload = Buffer.from(review, "utf8");
writeFileSync(destination, payload, { flag: "w" });
if (!readFileSync(destination).equals(payload)) {
  throw new Error("entry.txt did not match the review bytes");
}
