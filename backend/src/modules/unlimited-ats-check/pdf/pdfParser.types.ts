export interface LayoutInfo {
  isSingleColumn: boolean;
  hasTables: boolean;
  hasImages: boolean;
  hasIcons: boolean;
  hasMultiColumn: boolean;
}

export interface FontCheckInfo {
  isStandardFont: boolean;
  fontName: string;
  isReadableSize: boolean;
  hasMixedFonts: boolean;
}

export interface ParsedPdfResult {
  text: string;
  pageCount: number;
  layout: LayoutInfo;
  fontCheck: FontCheckInfo;
}

export interface TextItemDetail {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
}