import React, { useState } from 'react';


interface SignupProps {
  onSignup: (credentials: { email: string; password: string; name: string }) => Promise<void>;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Security keys do not match");
      return;
    }

    setLoading(true);
    try {
      await onSignup({ email, password, name });
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 relative overflow-hidden">
      <div className="w-full max-w-120 relative z-10">
        <div className="bg-white rounded-[3.5rem] shadow-[0_32px_120px_-20px_rgba(14,165,233,0.12)] border border-white overflow-hidden p-3">
          <div className="bg-[#f8fafc] rounded-[3rem] p-12 border border-slate-100">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-linear-to-br from-emerald-400 to-sky-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-100">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create Identity</h2>
              <p className="text-slate-400 text-sm mt-3 font-bold uppercase tracking-widest">Join the Infrastructure</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-rose-100 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Identity Matrix (Email)</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@cloudvault.io"
                  className="w-full px-7 py-4 bg-white border border-slate-100 rounded-3xl focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 outline-none transition-all text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Identity Matrix (Name)</label>
                <input
                  type="name" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="John"
                  className="w-full px-7 py-4 bg-white border border-slate-100 rounded-3xl focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 outline-none transition-all text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Security Key</label>
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-7 py-4 bg-white border border-slate-100 rounded-3xl focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 outline-none transition-all text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-2.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Confirm Key</label>
                <input
                  type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-7 py-4 bg-white border border-slate-100 rounded-3xl focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500 outline-none transition-all text-slate-900 font-bold"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit" disabled={loading || !email}
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black shadow-2xl shadow-slate-200 hover:bg-emerald-600 hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-4 text-xl tracking-tight"
                >
                  {loading ? <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Initialize'}
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                Existing Identity?{' '}
                <button onClick={onSwitchToLogin} className="text-sky-600 hover:text-sky-700 transition-colors ml-1 font-black underline decoration-2 underline-offset-4">
                  Connect Here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
