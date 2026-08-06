import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { OPS } from "pdfjs-dist/legacy/build/pdf.mjs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { FontCheckInfo, LayoutInfo, ParsedPdfResult, TextItemDetail } from "./pdfParser.types";

/** ATS-friendly standard font families. */
const STANDARD_FONTS: string[] = [
  "arial",
  "calibri",
  "times",
  "helvetica",
  "georgia",
  "verdana",
  "tahoma",
  "garamond",
  "trebuchet",
  "lucida",
  "cambria",
  "consolas",
  "courier",
  "bookman",
  "century",
  "futura",
  "liberation",
  "noto sans",
  "open sans",
  "roboto",
  "lato",
  "source sans",
  "inter",
  "montserrat",
  "ubuntu",
];

/** Fonts commonly embedded in generated PDFs as standard fonts. */
const STANDARD_FONT_ALIASES: Record<string, string> = {
  "times-roman": "Times New Roman",
  timesbold: "Times New Roman",
  "times-italic": "Times New Roman",
  "times-bolditalic": "Times New Roman",
  timesnewromanpsmt: "Times New Roman",
  arialmt: "Arial",
  "arial-boldmt": "Arial",
  "arial-italicmt": "Arial",
  "arial-bolditalicmt": "Arial",
  liberationsans: "Liberation Sans",
  liberationserif: "Liberation Serif",
  helveticaneue: "Helvetica Neue",
  calibriregular: "Calibri",
  calibribold: "Calibri",
  verdana: "Verdana",
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// pdfjs-dist (in Node) loads standard font data with fs.readFile using the
// given URL as a plain path string, so pass a filesystem path (a file:// URL
// string would fail with ENOENT).
const STANDARD_FONT_DATA_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "node_modules",
  "pdfjs-dist",
  "standard_fonts",
);

const isPdf = (filePath: string): boolean =>
  path.extname(filePath).toLowerCase() === ".pdf";

export const parsePdfFile = async (
  filePath: string,
  _mimeType?: string,
): Promise<ParsedPdfResult> => {
  if (!isPdf(filePath)) {
    throw new Error("Unsupported file format. Only PDF is supported.");
  }

  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({
    data,
    standardFontDataUrl: `${STANDARD_FONT_DATA_PATH}/`,
  }).promise;

  {
    const allItems: TextItemDetail[] = [];
    const pageLines: string[] = [];
    const usedFontNames = new Set<string>();
    const usedFontSizes: number[] = [];
    let imageCount = 0;
    let pathShapeCount = 0;
    let totalFontName = "";
    let totalFontSize = 0;
    const columnStarts: number[] = [];

    for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
      const page = await doc.getPage(pageNo);
      const textContent = await page.getTextContent();
      const operatorList = await page.getOperatorList();

      // Resolve fonts now that operator list is built
      for (const fontName of new Set(
        textContent.items.map((i: any) => i.fontName),
      )) {
        try {
          const font = page.commonObjs.get(fontName);
          if (font) {
            const raw = String(font.name || "");
            const friendly = friendlyFontName(raw);
            usedFontNames.add(friendly);
            totalFontName = friendly;
          }
        } catch {
          // font not yet resolvable — ignore
        }
      }

      for (const op of operatorList.fnArray) {
        if (
          op === OPS.paintImageXObject ||
          op === OPS.paintInlineImageXObject
        ) {
          imageCount++;
        }
        if (op === OPS.fill || op === OPS.fillStroke || op === OPS.stroke) {
          pathShapeCount++;
        }
      }

      const textItems: any[] = textContent.items as any[];
      for (const item of textItems) {
        if (typeof item.str !== "string" || !item.str.trim()) continue;
        const [xScale, , , yScale, x, y] = item.transform as number[];
        const fontSize = Math.abs(xScale || yScale);
        const detail: TextItemDetail = {
          str: item.str,
          x,
          y,
          width: item.width ?? 0,
          height: fontSize,
          fontName: item.fontName,
          fontSize,
        };
        allItems.push(detail);
        totalFontSize += fontSize;
        usedFontSizes.push(fontSize);

        if (pageNo === 1) {
          columnStarts.push(Math.round(x));
        }
      }

      pageLines.push(...reconstructLines(textItems));
    }

    const fontCheck = buildFontCheck(
      usedFontNames,
      usedFontSizes,
      totalFontName,
      totalFontSize,
    );
    const layout = buildLayout(
      columnStarts,
      imageCount,
      pathShapeCount,
      allItems,
    );

    return {
      text: cleanText(pageLines.join("\n")),
      pageCount: doc.numPages,
      layout,
      fontCheck,
    };
  }
};

/**
 * Reconstruct reading-order lines from pdf.js text items by grouping items
 * that share a common baseline (y). Items on the same line are joined with a
 * single space, ordered left-to-right.
 */
const reconstructLines = (items: any[]): string[] => {
  const lineGroups = new Map<number, any[]>();
  for (const item of items) {
    if (typeof item.str !== "string" || !item.str.trim()) continue;
    const baseline = Math.round((item.transform as number[])[5]);
    const arr = lineGroups.get(baseline);
    if (arr) arr.push(item);
    else lineGroups.set(baseline, [item]);
  }

  const lines: string[] = [];
  const baselines = Array.from(lineGroups.keys()).sort((a, b) => b - a);
  for (const baseline of baselines) {
    const itemsOnLine = lineGroups
      .get(baseline)!
      .slice()
      .sort(
        (a, b) => (a.transform as number[])[4] - (b.transform as number[])[4],
      );
    const lineText = itemsOnLine.map((i) => i.str).join(" ");
    if (lineText.trim()) lines.push(lineText.trim());
  }
  return lines;
};

const friendlyFontName = (raw: string): string => {
  const lower = raw.toLowerCase().replace(/[^\w]/g, "");
  const alias = STANDARD_FONT_ALIASES[lower];
  if (alias) return alias;
  if (lower.includes("times")) return "Times New Roman";
  if (lower.includes("arial")) return "Arial";
  if (lower.includes("calibri")) return "Calibri";
  if (lower.includes("helvetica")) return "Helvetica";
  if (lower.includes("georgia")) return "Georgia";
  if (lower.includes("verdana")) return "Verdana";
  if (lower.includes("tahoma")) return "Tahoma";
  if (lower.includes("consola")) return "Consolas";
  if (lower.includes("courier")) return "Courier";
  if (lower.includes("cambria")) return "Cambria";
  if (lower.includes("liberation")) return "Liberation Sans";
  if (lower.includes("garamond")) return "Garamond";
  return raw;
};

const isStandardFont = (name: string): boolean => {
  const lower = name.toLowerCase();
  return STANDARD_FONTS.some((f) => lower.includes(f));
};

const buildFontCheck = (
  usedFontNames: Set<string>,
  usedFontSizes: number[],
  totalFontName: string,
  totalFontSize: number,
): FontCheckInfo => {
  const names = Array.from(usedFontNames);
  const hasMixedFonts = new Set(names.map((n) => n.toLowerCase())).size > 1;

  const primaryName = totalFontName || names[0] || "";

  const avgSize =
    usedFontSizes.length > 0 ? totalFontSize / usedFontSizes.length : 0;
  // ATS-readable body size is ~10-12pt. Accept a slightly wider band.
  const isReadableSize =
    usedFontSizes.length === 0
      ? true
      : usedFontSizes.some((s) => s >= 9 && s <= 14);

  return {
    isStandardFont: primaryName === "" ? true : isStandardFont(primaryName),
    fontName: primaryName,
    isReadableSize,
    hasMixedFonts,
  };
};

const buildLayout = (
  columnStarts: number[],
  imageCount: number,
  pathShapeCount: number,
  items: TextItemDetail[],
): LayoutInfo => {
  const hasImages = imageCount > 0;
  const hasMultiColumn = detectMultiColumn(items);
  const hasTables = detectTables(items);

  // Icons are small vector graphics — many tiny filled shapes suggests icons/logos.
  const hasIcons =
    pathShapeCount >= 30 && imageCount === 0 && items.length > 50;

  return {
    isSingleColumn: !hasMultiColumn && !hasTables,
    hasTables,
    hasImages,
    hasIcons,
    hasMultiColumn,
  };
};

/** Detect multi-column layout by finding large horizontal gaps on the same line. */
const detectMultiColumn = (items: TextItemDetail[]): boolean => {
  const lines = new Map<number, TextItemDetail[]>();
  for (const item of items) {
    const key = Math.round(item.y);
    const arr = lines.get(key);
    if (arr) arr.push(item);
    else lines.set(key, [item]);
  }

  let columnLikeLines = 0;
  for (const lineItems of lines.values()) {
    if (lineItems.length < 2) continue;
    const sorted = lineItems.slice().sort((a, b) => a.x - b.x);

    // Find the largest gap between horizontally-adjacent items on this line.
    let maxGap = 0;
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].x - (sorted[i - 1].x + sorted[i - 1].width);
      if (gap > maxGap) maxGap = gap;
    }
    // A large intra-line gap suggests side-by-side columns.
    if (maxGap > 80) columnLikeLines++;
  }

  // Require a few confirmed lines to avoid false positives from header spacing.
  return columnLikeLines >= 3;
};

/** Detect tables by finding repeated x-coordinates that form a grid. */
const detectTables = (items: TextItemDetail[]): boolean => {
  if (items.length < 8) return false;
  const xPositions = new Map<number, number>();
  for (const item of items) {
    const x = Math.round(item.x);
    xPositions.set(x, (xPositions.get(x) || 0) + 1);
  }
  // If many text items share the same x across many rows, likely a table column.
  const repeating = Array.from(xPositions.values()).filter(
    (count) => count >= 3,
  );
  return repeating.length >= 3;
};

const cleanText = (raw: string): string =>
  raw
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
