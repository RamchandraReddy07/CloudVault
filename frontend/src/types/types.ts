
export const FileStatus = {
    CREATED: 'CREATED',
    UPLOADING: 'UPLOADING',
    UPLOADED: 'UPLOADED',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
  } as const;
  
  export type FileStatus = typeof FileStatus[keyof typeof FileStatus];
  
  export interface FileRecord {
    fileId: string;
    userId: string;
    filename: string;
    status: FileStatus;
    size: number;
    contentType: string;
    createdAt: string;
    updatedAt: string;
    originalKey: string;
    processedKey?: string;
    errorMessage?: string | null;
  }
  
  export interface User {
    id: number;
    name: string;
    email: string;
    token:string;
  }
  
  export interface CreateFileRequest {
    filename: string;
    contentType: string;
    size: number;
  }
  