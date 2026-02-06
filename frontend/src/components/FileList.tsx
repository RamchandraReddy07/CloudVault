
import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { type User, type FileRecord, FileStatus } from '../types/types';

interface FileListProps {
  user: User;
  refreshTrigger: number;
}

const FileList: React.FC<FileListProps> = ({ user, refreshTrigger }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    try {
      // PRD 6.4: GET /api/files
      const data = await api.get<FileRecord[]>('/api/files', user.token);
      setFiles(data.sort((a: FileRecord, b: FileRecord) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err) {
      console.error('Registry Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  // Phase 2: Polling for status updates
  useEffect(() => {
    const hasActiveFiles = files.some(f => 
      ([FileStatus.CREATED, FileStatus.UPLOADED, FileStatus.PROCESSING] as FileStatus[]).includes(f.status)
    );

    if (!hasActiveFiles) return;

    const intervalId = setInterval(async () => {
      await fetchFiles();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [files, fetchFiles]);

  const handleDownload = async (fileId: string, type: 'original' | 'processed') => {
    try {
      // PRD 6.6: GET /api/files/:fileId/download?type=...
      const { downloadUrl } = await api.get<{downloadUrl: string}>(`/api/files/${fileId}/download?type=${encodeURIComponent(type)}`, user.token);
      window.open(downloadUrl, '_blank');
    } catch (err: any) {
      alert(err.message || 'Asset Unavailable');
    }
  };

  const getStatusConfig = (status: FileStatus) => {
    switch (status) {
      case FileStatus.COMPLETED:
        return { style: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'Ready' };
      case FileStatus.PROCESSING:
        return { style: 'bg-sky-50 text-sky-700 border-sky-100 animate-pulse', label: 'Processing' };
      case FileStatus.UPLOADED:
        return { style: 'bg-indigo-50 text-indigo-700 border-indigo-100', label: 'Staged' };
      case FileStatus.FAILED:
        return { style: 'bg-rose-50 text-rose-700 border-rose-100', label: 'Halted' };
      default:
        return { style: 'bg-slate-50 text-slate-400 border-slate-100', label: 'Initializing' };
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('image')) return '🖼️';
    if (contentType.includes('video')) return '🎬';
    return '📁';
  };

  if (loading && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-slate-50">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-8 text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">Querying Index</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-3">
      <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 rounded-t-[2.5rem]">
        <div>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Persistent Registry</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">AWS DynamoDB Source</p>
        </div>
        <button 
          onClick={fetchFiles}
          className="w-11 h-11 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-sky-600 hover:shadow-lg transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-50">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">Object Descriptor</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">Payload</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">Lifecycle</th>
              <th className="px-10 py-5 text-right text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-10 py-32 text-center text-slate-300">
                  <div className="text-4xl mb-6 grayscale opacity-20">☁️</div>
                  <div className="text-xl font-black text-slate-900 tracking-tight">Vault Empty</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Initialize ingestion to begin</p>
                </td>
              </tr>
            ) : (
              files.map((file) => {
                const cfg = getStatusConfig(file.status);
                return (
                  <tr key={file.fileId} className="hover:bg-slate-50/40 transition-all duration-300 group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-500">{getFileIcon(file.contentType)}</span>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 truncate max-w-50" title={file.filename}>
                            {file.filename}
                          </span>
                          <span className="text-[9px] text-slate-300 font-mono mt-1">
                            {file.fileId.slice(0,13).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                      {formatSize(file.size)}
                    </td>
                    <td className="px-10 py-6">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black border tracking-widest uppercase ${cfg.style}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <button
                          onClick={() => handleDownload(file.fileId, 'original')}
                          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-sky-600 hover:shadow-md transition-all"
                          title="Get S3 Object"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        {file.status === FileStatus.COMPLETED && (
                          <button
                            onClick={() => handleDownload(file.fileId, 'processed')}
                            className="px-5 py-2.5 bg-slate-900 text-white text-[9px] font-black rounded-xl hover:bg-sky-600 transition-all uppercase tracking-widest"
                          >
                            Extract
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileList;
