
import React, { useState, useEffect } from 'react';
import { type User } from './types/types';
import Login from './pages/LoginPage';
import Signup from './pages/SignUpPage';
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import LandingPage from './pages/LandingPage';
import { api } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('aura_cloud_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthLoading(false);
  }, []);

  // const handleLogin = (newUser: User) => {
  //   setUser(newUser);
  //   setAuthMode('none');
  //   localStorage.setItem('aura_cloud_user', JSON.stringify(newUser));
  // };
  const handleSignup = async (credentials: { email: string; password: string;name:string }) => {
    try {
      const res = await api.signup(credentials); // { user, token } from backend
      const newUser: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        token: res.token
      };
      setUser(newUser);
      setToken(res.token);
      setAuthMode('none'); // hide signup/login forms
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      const data = await api.login(credentials);
      const loggedInUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.token
      };
      setUser(loggedInUser);
      setToken(data.token);
      setAuthMode('none');
    } catch (err: any) {
      alert(err.message);
    }
  };
  // const handleLogout = () => {
  //   setUser(null);
  //   localStorage.removeItem('aura_cloud_user');
  // };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-14 h-14 border-4 border-sky-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-sky-100"></div>
      </div>
    );
  }

  // Marketing Landing State
  if (!user && authMode === 'none') {
    return <LandingPage
      onLoginStart={() => setAuthMode('login')}
      onSignUpStart={() => setAuthMode('signup')}
    />;
  }

  // Authentication State (with Header)
  if (!user && (authMode === 'login' || authMode === 'signup')) {
    return (
      <Layout user={null} onLogout={() => { }}>
        {authMode === 'login' ? (
          <Login
            onLogin={handleLogin}
            onSwitchToSignup={() => setAuthMode('signup')}
          />
        ) : (
          <Signup
            onSignup={handleSignup}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )}
      </Layout>
    );
  }

  // Dashboard / Command Console State
  return (
    <Layout user={user} onLogout={handleLogout}>
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-sky-100">
          Infra Status: Active
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Command Console</h1>
        <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] mt-3">Identity Signature: {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-12">
          {/* Real-time Metrics Card */}
          <div className="bg-white rounded-[3rem] p-10 shadow-[0_20px_60px_-15px_rgba(14,165,233,0.08)] border border-slate-50 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-sky-50 rounded-full group-hover:scale-125 transition-transform duration-1000 ease-out"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-slate-300 text-[11px] font-black uppercase tracking-[0.3em]">Storage Load</h3>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-6xl font-black text-slate-900 tracking-tighter">1.28</span>
                    <span className="text-2xl text-slate-400 font-black uppercase">GB</span>
                  </div>
                </div>
                <div className="bg-linear-to-br from-sky-500 to-emerald-400 p-5 rounded-3xl shadow-xl shadow-sky-200">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              </div>
              <div className="bg-slate-50 h-3.5 rounded-full overflow-hidden border border-slate-100 p-0.5">
                <div className="bg-linear-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(14,165,233,0.3)]" style={{ width: '24%' }} />
              </div>
              <div className="mt-6 flex justify-between text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2 font-bold"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 24% Used</span>
                <span>5.0 GB Soft Cap</span>
              </div>
            </div>
          </div>

          <FileUpload user={user!} onUploadSuccess={handleUploadSuccess} />

          {/* Quick Connection Info */}
          <div className="bg-white rounded-[3rem] border border-slate-50 p-10 shadow-sm">
            <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em] mb-10">System Relay</h3>
            <div className="space-y-8">
              {[
                { name: 'S3 Object Storage', status: 'Healthy', latency: '4ms', color: 'bg-emerald-500' },
                { name: 'Lambda Workers', status: 'Scale Ready', latency: '12ms', color: 'bg-sky-500' },
                { name: 'DynamoDB Index', status: 'Synchronized', latency: '2ms', color: 'bg-indigo-500' }
              ].map((node, idx) => (
                <div key={idx} className="flex gap-5 items-center">
                  <div className={`w-3 h-3 rounded-full ${node.color} shadow-lg shadow-inherit/40`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-black text-slate-900 tracking-tight">{node.name}</p>
                      <span className="text-[11px] text-slate-400 font-bold">{node.latency}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1.5">{node.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <FileList user={user!} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </Layout>
  );
};

export default App;
