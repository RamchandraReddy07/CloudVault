"use client"

import { useState } from "react"
import type { User } from "@/lib/types"

interface LoginFormProps {
  onLogin: (user: User) => void
  onSwitchToSignup: () => void
}

export default function LoginForm({ onLogin, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const userId = "user-" + btoa(email).slice(0, 8)
      const mockUser: User = {
        id: userId,
        email: email,
        token: "mock-jwt-token-" + userId,
      }
      onLogin(mockUser)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 relative overflow-hidden">
      <div className="w-full max-w-[480px] relative z-10">
        <div className="bg-white rounded-[3.5rem] shadow-[0_32px_120px_-20px_rgba(14,165,233,0.12)] border border-white overflow-hidden p-3">
          <div className="bg-[#f8fafc] rounded-[3rem] p-12 border border-slate-100">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-sky-200">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                Access CloudVault
              </h2>
              <p className="text-slate-400 text-sm mt-3 font-bold uppercase tracking-widest">
                Enter Credentials
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">
                  Identity Matrix
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@cloudvault.io"
                  className="w-full px-7 py-5 bg-white border border-slate-100 rounded-3xl focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 outline-none transition-all text-slate-900 font-bold"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">
                  Security Key
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full px-7 py-5 bg-white border border-slate-100 rounded-3xl focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 outline-none transition-all text-slate-900 font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black shadow-2xl shadow-slate-200 hover:bg-sky-600 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xl tracking-tight"
              >
                {loading ? (
                  <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Connect"
                )}
              </button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                New Operator?{" "}
                <button
                  onClick={onSwitchToSignup}
                  className="text-emerald-600 hover:text-emerald-700 transition-colors ml-1 font-black underline decoration-2 underline-offset-4"
                >
                  Initialize Identity
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
