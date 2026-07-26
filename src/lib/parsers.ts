export interface PageBlock {
  pageNumber: number | null;
  text: string;
}

export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<PageBlock[]> {
  if (mimeType === "application/pdf") {
    // pdf-parse v2 replaced the old default-exported function with a class-based API.
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      // result.pages gives per-page text natively — avoids result.text's
      // default page-joiner marker ("-- N of M --") leaking into chunks.
      return result.pages.map((p) => ({ pageNumber: p.num, text: p.text }));
    } finally {
      await parser.destroy();
    }
  }
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return [{ pageNumber: null, text: result.value }];
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}
