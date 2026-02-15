Phase 0: Setup (repo + hosted DB + Prisma)

Create repo structure

backend/

frontend/

Create hosted PostgreSQL

Neon or Supabase

Copy the connection string

Backend init

Express + CORS + dotenv

Add a /health endpoint

Prisma setup (backend only)

npx prisma init

Set .env in backend:

DATABASE_URL=...hosted...

JWT_SECRET=...

Create Prisma schema + migrations

Add User model (email unique, passwordHash)

Run:

npx prisma migrate dev --name init (for dev)

or npx prisma migrate deploy (if you want prod-style from day one)

✅ Stop check: you can connect to hosted DB and Prisma created the users table.

Phase 1: JWT Auth (backend first, then frontend)

Auth endpoints

POST /api/auth/register (recommended)

POST /api/auth/login (required)

Use bcrypt + jwt

JWT middleware

Validate token

req.userId = decoded.sub

Protect all /api/files/* routes

Frontend auth UI

Login page

Store token (memory preferred; localStorage acceptable for portfolio)

Add token to every API call

Protected routes

✅ Stop check: login works and protected routes block without JWT.

Phase 1: AWS Storage MVP (S3 + DynamoDB + presigned URLs)

Create AWS resources

Private S3 bucket

DynamoDB table files

IAM user/policy for backend (least privilege)

Set backend env vars:

AWS_REGION

AWS_ACCESS_KEY_ID

AWS_SECRET_ACCESS_KEY

S3_BUCKET

DYNAMO_TABLE=files

Backend: DynamoDB file repository
Implement functions:

create file record

update file status + keys

list by userId

get by fileId + userId

Backend: implement file APIs in this order

POST /api/files → create file record, return fileId

POST /api/files/:fileId/presign-upload → presigned PUT + s3Key

POST /api/files/:fileId/complete → status UPLOADED

GET /api/files → list user files

GET /api/files/:fileId → file details

GET /api/files/:fileId/download?type=original → presigned GET

✅ Stop check (important): test upload + download using Postman before UI.

Frontend: implement file UI

Upload page:

create → presign → upload to S3 (progress) → complete

My Files page:

list

download button

✅ Phase 1 DONE: you have a full working app.

Phase 2: Async pipeline (S3 → SQS → Lambda → SNS)

Create SQS + DLQ

main queue

dead-letter queue

redrive policy

Configure S3 event → SQS

trigger on ObjectCreated

filter prefix uploads/

Lambda worker (SQS trigger)
Implement in this order:

Parse SQS message → bucket + key

Extract userId + fileId from key path

Fetch file record from DynamoDB

Idempotency: skip if status is PROCESSING or COMPLETED

Update status → PROCESSING

Processing step (start simple):

compute checksum + metadata

(Optional) write output to processed/{userId}/{fileId}/metadata.json

Update DynamoDB → COMPLETED (+ processedKey)

On error:

update DynamoDB → FAILED + errorMessage

throw so SQS retries and then DLQ

SNS topic + email subscription

Create SNS topic

Subscribe your email

Publish SNS from Lambda

Publish on success/failure with fileId + status

Frontend: status polling

Poll GET /api/files/:fileId every 3–5 seconds for non-terminal files

Update status badges

Enable processed download only when ready

✅ Phase 2 DONE: async processing + notifications + UI updates.

Phase 3: Deployment (public working URL)

Deploy backend

Render or Railway (simple)

Set env vars:

DATABASE_URL (hosted)

JWT_SECRET

AWS creds

S3_BUCKET, DYNAMO_TABLE, AWS_REGION

Deploy frontend

Vercel/Netlify

Set VITE_API_BASE_URL to backend URL

Final verification

Register/login on production

Upload file → see status

Download original

Confirm processing updates + SNS email