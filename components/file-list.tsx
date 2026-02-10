"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import { type User, type FileRecord, FileStatus } from "@/lib/types"

interface FileListProps {
  user: User
  refreshTrigger: number
}

export default function FileList({ user, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = useCallback(async () => {
    try {
      const data = await api.get<FileRecord[]>("/api/files", user.token)
      setFiles(
        data.sort(
          (a: FileRecord, b: FileRecord) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      )
    } catch (err) {
      console.error("Registry Error:", err)
    } finally {
      setLoading(false)
    }
  }, [user.token])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles, refreshTrigger])

  useEffect(() => {
    const hasActiveFiles = files.some((f) =>
      (
        [
          FileStatus.CREATED,
          FileStatus.UPLOADED,
          FileStatus.PROCESSING,
        ] as FileStatus[]
      ).includes(f.status)
    )

    if (!hasActiveFiles) return

    const intervalId = setInterval(async () => {
      await fetchFiles()
    }, 3000)

    return () => clearInterval(intervalId)
  }, [files, fetchFiles])

  const handleDownload = async (
    fileId: string,
    type: "original" | "processed"
  ) => {
    try {
      const { downloadUrl } = await api.get<{ downloadUrl: string }>(
        `/api/files/${fileId}/download?type=${encodeURIComponent(type)}`,
        user.token
      )
      window.open(downloadUrl, "_blank")
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Asset Unavailable"
      )
    }
  }

  const getStatusConfig = (status: FileStatus) => {
    switch (status) {
      case FileStatus.COMPLETED:
        return {
          style: "bg-emerald-50 text-emerald-700 border-emerald-100",
          label: "Ready",
        }
      case FileStatus.PROCESSING:
        return {
          style: "bg-sky-50 text-sky-700 border-sky-100 animate-pulse",
          label: "Processing",
        }
      case FileStatus.UPLOADED:
        return {
          style: "bg-indigo-50 text-indigo-700 border-indigo-100",
          label: "Staged",
        }
      case FileStatus.FAILED:
        return {
          style: "bg-rose-50 text-rose-700 border-rose-100",
          label: "Halted",
        }
      default:
        return {
          style: "bg-slate-50 text-slate-400 border-slate-100",
          label: "Initializing",
        }
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (contentType: string) => {
    if (contentType.includes("pdf")) return (
      <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    )
    if (contentType.includes("image")) return (
      <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )
    if (contentType.includes("video")) return (
      <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    )
    return (
      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
    )
  }

  if (loading && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-slate-50">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-8 text-slate-300 text-[10px] font-black uppercase tracking-[0.4em]">
          Querying Index
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-3">
      <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 rounded-t-[2.5rem]">
        <div>
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">
            Persistent Registry
          </h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            File Storage Source
          </p>
        </div>
        <button
          onClick={fetchFiles}
          className="w-11 h-11 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-sky-600 hover:shadow-lg transition-all"
          aria-label="Refresh file list"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-50">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">
                Object Descriptor
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">
                Payload
              </th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">
                Lifecycle
              </th>
              <th className="px-10 py-5 text-right text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {files.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-10 py-32 text-center text-slate-300">
                  <svg className="w-12 h-12 mx-auto mb-6 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                  <div className="text-xl font-black text-slate-900 tracking-tight">
                    Vault Empty
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-slate-400">
                    Initialize ingestion to begin
                  </p>
                </td>
              </tr>
            ) : (
              files.map((file) => {
                const cfg = getStatusConfig(file.status)
                return (
                  <tr
                    key={file.fileId}
                    className="hover:bg-slate-50/40 transition-all duration-300 group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <span className="group-hover:scale-110 transition-transform duration-500">
                          {getFileIcon(file.contentType)}
                        </span>
                        <div className="flex flex-col">
                          <span
                            className="text-sm font-black text-slate-900 truncate max-w-[200px]"
                            title={file.filename}
                          >
                            {file.filename}
                          </span>
                          <span className="text-[9px] text-slate-300 font-mono mt-1">
                            {file.fileId.slice(0, 13).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                      {formatSize(file.size)}
                    </td>
                    <td className="px-10 py-6">
                      <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black border tracking-widest uppercase ${cfg.style}`}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <button
                          onClick={() =>
                            handleDownload(file.fileId, "original")
                          }
                          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-sky-600 hover:shadow-md transition-all"
                          title="Get S3 Object"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                        {file.status === FileStatus.COMPLETED && (
                          <button
                            onClick={() =>
                              handleDownload(file.fileId, "processed")
                            }
                            className="px-5 py-2.5 bg-slate-900 text-white text-[9px] font-black rounded-xl hover:bg-sky-600 transition-all uppercase tracking-widest"
                          >
                            Extract
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
