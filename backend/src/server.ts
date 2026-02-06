import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

type FileStatus = "CREATED" | "UPLOADED" | "PROCESSING" | "COMPLETED";

type FileRecord = {
  fileId: string;
  userId: string;
  filename: string;
  contentType: string;
  size: number;
  status: FileStatus;
  createdAt: string;
  updatedAt: string;
  originalKey?: string;
  processedKey?: string;
};

type CreateFileRequest = {
  filename: string;
  contentType: string;
  size: number;
};

type PresignParams = {
    fileId: string;
  };
// --------------------
// In-memory "DB"
// --------------------
const store = new Map<string, FileRecord>(); // key = `${userId}:${fileId}`

const db = {
  find: (userId: string) =>
    Array.from(store.values()).filter((f) => f.userId === userId),

  findById: (userId: string, fileId: string) =>
    store.get(`${userId}:${fileId}`),

  insert: (file: FileRecord) => store.set(`${file.userId}:${file.fileId}`, file),

  update: (file: FileRecord) => store.set(`${file.userId}:${file.fileId}`, file),
};

// --------------------
// Mock Auth Middleware
// Expect: Authorization: Bearer token-<userId>
// Example: Bearer token-123
// --------------------
function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.split(" ")[1];
  const parts = token.split("-");
  const userId = parts[1];

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  (req as any).userId = userId;
  next();
}

function getUserId(req: Request) {
  return (req as any).userId as string;
}

// --------------------
// Health check
// --------------------
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// --------------------
// 1) Create File Record
// POST /api/files
// body: { filename, contentType, size }
// --------------------
app.post("/api/files", auth, (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { filename, contentType, size } = req.body as CreateFileRequest;

  if (!filename || !contentType || typeof size !== "number") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const fileId = crypto.randomUUID();
  const now = new Date().toISOString();

  const file: FileRecord = {
    fileId,
    userId,
    filename,
    contentType,
    size,
    status: "CREATED",
    createdAt: now,
    updatedAt: now,
  };

  db.insert(file);
  res.status(201).json({ fileId, status: file.status });
});

// --------------------
// 2) Presign Upload URL (mock)
// POST /api/files/:fileId/presign-upload
// --------------------
app.post("/api/files/:fileId/presign-upload", auth, (req: Request<PresignParams>, res: Response) => {
  const userId = getUserId(req);
  const { fileId } = req.params;

  const file = db.findById(userId, fileId);
  if (!file) return res.status(404).json({ error: "File Not Found" });

  const s3Key = `uploads/${userId}/${fileId}/${file.filename}`;
  file.originalKey = s3Key;
  file.updatedAt = new Date().toISOString();
  db.update(file);

  res.json({
    uploadUrl: `https://mock-s3.amazonaws.com/${s3Key}?X-Amz-Signature=mock-put-sig`,
    s3Key,
    expiresInSeconds: 900,
  });
});

// --------------------
// 3) Mark Upload Complete
// POST /api/files/:fileId/complete
// --------------------
app.post("/api/files/:fileId/complete", auth, (req: Request<PresignParams>, res: Response) => {
  const userId = getUserId(req);
  const { fileId } = req.params;

  const file = db.findById(userId, fileId);
  if (!file) return res.status(404).json({ error: "File Not Found" });

  file.status = "UPLOADED";
  file.updatedAt = new Date().toISOString();
  db.update(file);

  // simulate background processing
  triggerWorker(userId, fileId);

  res.json({ status: file.status });
});

// --------------------
// 4) List Files
// GET /api/files
// --------------------
app.get("/api/files", auth, (req: Request, res: Response) => {
  const userId = getUserId(req);
  res.json(db.find(userId));
});

// --------------------
// 5) Download URL (mock)
// GET /api/files/:fileId/download?type=original|processed
// --------------------
app.get("/api/files/:fileId/download", auth, (req: Request<PresignParams>, res: Response) => {
  const userId = getUserId(req);
  const { fileId } = req.params;

  const file = db.findById(userId, fileId);
  if (!file) return res.status(404).json({ error: "File Not Found" });

  const type = (req.query.type as string) || "original";
  const key = type === "original" ? file.originalKey : file.processedKey;

  if (!key) return res.status(400).json({ error: "Resource Not Available" });

  res.json({
    downloadUrl: `https://mock-s3.amazonaws.com/${key}?X-Amz-Signature=mock-get-sig`,
    expiresInSeconds: 900,
  });
});

// --------------------
// Background worker simulation
// --------------------
async function triggerWorker(userId: string, fileId: string) {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  await delay(2000);
  let file = db.findById(userId, fileId);
  if (file) {
    file.status = "PROCESSING";
    file.updatedAt = new Date().toISOString();
    db.update(file);
  }

  await delay(4000);
  file = db.findById(userId, fileId);
  if (file) {
    file.status = "COMPLETED";
    file.processedKey = `processed/${userId}/${fileId}/output_${file.filename}`;
    file.updatedAt = new Date().toISOString();
    db.update(file);
  }
}

// --------------------
// Start
// --------------------
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
