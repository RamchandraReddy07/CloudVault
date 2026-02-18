
import React from 'react';
import type { User } from '../types/types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfe]">
      {/*  Header */}
      <header className="bg-white/70 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-50 px-6">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-linear-to-br from-sky-500 to-emerald-400 rounded-2xl flex items-center justify-center shadow-xl shadow-sky-100">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tighter uppercase leading-none">CloudVault</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-1">Cloud Console</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-8">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-black text-slate-900 tracking-tight">{user.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded-md">Live Session</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-slate-100 group"
                title="Disconnect"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">
        {children}
      </main>

      {/* Refined Footer */}
      <footer className="bg-white border-t border-slate-50 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-sky-50 rounded flex items-center justify-center text-sky-600 text-[10px] font-black italic">A</div>
              <span className="text-sm font-black text-slate-900 tracking-tighter uppercase">CloudVault Systems</span>
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              High Performance Asset Ingestion & Lifecycle Management.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <p className="text-[11px] text-slate-300 font-bold uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} -C3 Global Infra.
            </p>
            <div className="flex gap-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">
              <a href="#" className="hover:text-sky-600">Privacy</a>
              <a href="#" className="hover:text-sky-600">Terms</a>
              <a href="#" className="hover:text-sky-600">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
