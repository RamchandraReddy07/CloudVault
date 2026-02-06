
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const AuraIllustration = () => (
  <svg viewBox="0 0 800 600" className="w-full h-auto drop-shadow-3xl transform hover:scale-105 transition-transform duration-1000">
    <defs>
      <linearGradient id="auraMain" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
      <filter id="auraGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="15" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Base Floating Platform */}
    <ellipse cx="400" cy="450" rx="300" ry="60" fill="#f1f5f9" opacity="0.4" />
    
    {/* Data Streams */}
    <g className="animate-pulse" style={{ animationDuration: '3s' }}>
      <path d="M400,300 L600,150 M400,300 L200,150 M400,300 L400,100" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="10 5" fill="none" />
      <circle r="4" fill="url(#auraMain)">
        <animateMotion path="M400,300 L600,150" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle r="4" fill="url(#auraMain)">
        <animateMotion path="M400,300 L200,150" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </g>

    {/* Central Hub Core */}
    <g transform="translate(350, 250)">
      <rect width="100" height="100" rx="24" fill="white" stroke="#bae6fd" strokeWidth="1" filter="url(#auraGlow)" />
      <rect x="15" y="15" width="70" height="70" rx="18" fill="url(#auraMain)" opacity="0.1" />
      <path d="M35,50 L45,60 L65,40" stroke="url(#auraMain)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>

    {/* Isometric File Cubes */}
    <g className="animate-bounce" style={{ animationDuration: '6s' }}>
      <path d="M620,180 L660,160 L660,200 L620,220 Z" fill="#fff" stroke="#e2e8f0" />
      <path d="M660,160 L700,180 L700,220 L660,200 Z" fill="#f8fafc" stroke="#e2e8f0" />
      <path d="M620,180 L660,200 L700,180 L660,160 Z" fill="#f1f5f9" stroke="#e2e8f0" />
    </g>

    <g className="animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
      <path d="M120,200 L160,180 L160,220 L120,240 Z" fill="#fff" stroke="#e2e8f0" />
      <path d="M160,180 L200,200 L200,240 L160,220 Z" fill="#f8fafc" stroke="#e2e8f0" />
      <path d="M120,200 L160,220 L200,200 L160,180 Z" fill="#f1f5f9" stroke="#e2e8f0" />
    </g>
  </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="bg-white min-h-screen selection:bg-sky-100 selection:text-sky-900">
      {/* Navbar Minimal */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-100">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-extrabold tracking-tighter text-slate-900 uppercase">CloudVault</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-400 uppercase tracking-widest">
          <a href="#" className="hover:text-sky-600 transition-colors">Infrastructure</a>
          <a href="#" className="hover:text-sky-600 transition-colors">Security</a>
          <a href="#" className="hover:text-sky-600 transition-colors">Enterprise</a>
        </div>

        <button onClick={onStart} className="px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-sky-600 transition-all shadow-xl shadow-slate-200">
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-[0.2em] mb-10 border border-emerald-100 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                v2.0 Infrastructure Ready
              </div>
              
              <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tight mb-10 leading-[0.95]">
                Breathe light <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-emerald-500">
                  into your data.
                </span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-lg mb-14 leading-relaxed font-medium">
                CloudVault is a specialized file engine for the next generation of web applications. 
                Move assets directly to S3 with lightning-fast async processing.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <button
                  onClick={onStart}
                  className="px-10 py-6 bg-sky-600 text-white font-black rounded-2xl shadow-2xl shadow-sky-200 hover:bg-sky-700 hover:-translate-y-1 transition-all w-full sm:w-auto text-lg tracking-tight"
                >
                  Create Your Console
                </button>
                <div className="flex items-center gap-4 px-8 py-6 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:bg-white hover:shadow-xl transition-all">
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-sky-600 shadow-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                  </span>
                  <span className="text-slate-900 font-bold tracking-tight">System Walkthrough</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Decorative Blur */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-sky-100 rounded-full blur-[120px] opacity-60 -z-10"></div>
              <AuraIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-20 border-y border-slate-50 bg-slate-50/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center opacity-30 grayscale gap-10">
            {['Amazon S3', 'Node.js', 'DynamoDB', 'Lambda', 'React'].map(brand => (
              <span key={brand} className="text-xl font-black tracking-tighter uppercase italic">{brand}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
