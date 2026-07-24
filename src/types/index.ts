export interface DocumentWithChunkCount {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  status: "PROCESSING" | "READY" | "FAILED";
  uploadedBy: string;
  createdAt: Date;
  _count: { chunks: number };
}

export interface ChatChunk {
  content: string;
  chunkIndex: number;
  similarity: number;
}

export interface OrgUser {
  id: string;
  organizationId: string;
  role: "ADMIN" | "MEMBER";
  organization: {
    id: string;
    name: string;
  };
}
