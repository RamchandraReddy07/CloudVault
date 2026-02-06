
import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import type { User } from '../types/types';

interface FileUploadProps {
  user: User;
  onUploadSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ user, onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      setProgress(5);

      // PRD 6.1: POST /api/files
      const { fileId } = await api.post<{ fileId: string }>('/api/files',{
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size
      },user.token,);
      setProgress(20);

      // PRD 6.2: POST /api/files/:fileId/presign-upload
      const { uploadUrl} = await api.post<{uploadUrl:String}>(`/api/files/${fileId}/presign-upload`, user.token);
      setProgress(40);

      // Simulate Direct S3 PUT
      console.log(`[INFRA] PUT Binary to S3: ${uploadUrl}`);
      const step = 5;
      for (let p = 45; p <= 90; p += step) {
        await new Promise(r => setTimeout(r, 100));
        setProgress(p);
      }

      // PRD 6.3: POST /api/files/:fileId/complete
      await api.post(`/api/files/${fileId}/complete`, user.token);
      setProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onUploadSuccess();
      }, 500);

    } catch (err: any) {
      setError(err.message || 'System Ingestion Failure');
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
      <h2 className="text-[10px] font-black text-slate-300 mb-8 uppercase tracking-[0.4em]">Resource Ingestion</h2>
      
      <div 
        className={`relative border-2 border-dashed rounded-4xl p-10 transition-all duration-500 flex flex-col items-center justify-center gap-6 group
          ${isUploading ? 'bg-sky-50/30 border-sky-200' : 'hover:bg-slate-50/50 hover:border-sky-300 border-slate-100'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />

        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-700 shadow-xl
          ${isUploading ? 'bg-sky-600 text-white scale-110 shadow-sky-100 rotate-6' : 'bg-white text-slate-300 group-hover:text-sky-600 group-hover:scale-105 shadow-slate-50'}`}>
          {isUploading ? (
             <svg className="w-10 h-10 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
          ) : (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </div>

        <div className="text-center">
          <p className="text-lg font-black text-slate-900 tracking-tight">
            {isUploading ? 'Streaming to S3' : 'Drop Objects'}
          </p>
          <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">Max Load: 50MB</p>
        </div>

        {isUploading && (
          <div className="w-full max-w-50 mt-2">
            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
              <div 
                className="h-full bg-linear-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[9px] font-black text-sky-600 mt-3 text-center uppercase tracking-widest">{progress}% Synchronized</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-rose-100 flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">!</span>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
