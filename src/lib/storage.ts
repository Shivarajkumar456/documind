import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const UPLOAD_DIR = path.join(os.tmpdir(), "documind-uploads");

function filePathFor(documentId: string): string {
  return path.join(UPLOAD_DIR, documentId);
}

export async function saveUploadedFile(documentId: string, buffer: Buffer): Promise<void> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(filePathFor(documentId), buffer);
}

export async function readUploadedFile(documentId: string): Promise<Buffer> {
  return readFile(filePathFor(documentId));
}

export async function deleteUploadedFile(documentId: string): Promise<void> {
  try {
    await unlink(filePathFor(documentId));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}
