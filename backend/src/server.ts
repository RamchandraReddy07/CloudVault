import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // <-- your frontend URL
  credentials: true, // if you need to send cookies or auth headers
}));

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



// --------------------
// Auth Middleware
// --------------------
interface AuthRequest extends Request {
  userId?: number;
}

function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function getUserId(req: AuthRequest) {
  return req.userId as number;
}

// --------------------
// Auth Endpoints
// --------------------
app.get('/', (req, res) => {
  res.send('Server is running!');
});


app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "1h",
    });

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "default_secret", {
      expiresIn: "1h",
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

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
  const userId = getUserId(req as AuthRequest);
  // Implementation for file creation...
  // Since we switched to Prisma for Auth, we should ideally use Prisma for Files too, 
  // but preserving the mock in-memory store logic for files as requested to only implement JWT login.
  // For file operations, we will continue to use the mock store but keyed by the numeric userId from Prisma converted to string temporarily for compatibility or just cast it.

  // Re-using the mock store logic requires `userId` to be string.
  // The `auth` middleware now sets `req.userId` as number (from Prisma).
  // We'll cast it to string for the mock store interaction.
  const userIdStr = String(userId);

  const { filename, contentType, size } = req.body as CreateFileRequest;

  if (!filename || !contentType || typeof size !== "number") {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const fileId = crypto.randomUUID();
  const now = new Date().toISOString();

  const file: FileRecord = {
    fileId,
    userId: userIdStr,
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
  const userId = getUserId(req as AuthRequest);
  const { fileId } = req.params;

  // Re-using the mock store logic requires `userId` to be string.
  // The `auth` middleware now sets `req.userId` as number (from Prisma).
  // We'll cast it to string for the mock store interaction.
  const userIdStr = String(userId);

  const file = db.findById(userIdStr, fileId);
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
  const userId = getUserId(req as AuthRequest);
  const { fileId } = req.params;

  // Re-using the mock store logic requires `userId` to be string.
  // The `auth` middleware now sets `req.userId` as number (from Prisma).
  // We'll cast it to string for the mock store interaction.
  const userIdStr = String(userId);

  const file = db.findById(userIdStr, fileId);
  if (!file) return res.status(404).json({ error: "File Not Found" });

  file.status = "UPLOADED";
  file.updatedAt = new Date().toISOString();
  db.update(file);

  // simulate background processing
  triggerWorker(userIdStr, fileId);

  res.json({ status: file.status });
});

// --------------------
// 4) List Files
// GET /api/files
// --------------------
app.get("/api/files", auth, (req: Request, res: Response) => {
  const userId = getUserId(req as AuthRequest);
  res.json(db.find(String(userId)));
});

// --------------------
// 5) Download URL (mock)
// GET /api/files/:fileId/download?type=original|processed
// --------------------
app.get("/api/files/:fileId/download", auth, (req: Request<PresignParams>, res: Response) => {
  const userId = getUserId(req as AuthRequest);
  const { fileId } = req.params;

  // Re-using the mock store logic requires `userId` to be string.
  // The `auth` middleware now sets `req.userId` as number (from Prisma).
  // We'll cast it to string for the mock store interaction.
  const userIdStr = String(userId);

  const file = db.findById(userIdStr, fileId);
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
const PORT = Number(process.env.PORT) || 4000;
// app.listen(PORT, () => {
//   console.log(`API running on http://localhost:${PORT}`);
// });

app.listen(PORT, () => {
  console.log(`API is running on port ${PORT}`);
});
