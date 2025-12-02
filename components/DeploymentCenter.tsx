
import React, { useState, useEffect, useRef } from 'react';
import { 
  Rocket, GitCommit, Clock, CheckCircle2, AlertCircle, 
  Terminal, ArrowRight, RefreshCw, ExternalLink, Shield, Activity,
  Lock, StopCircle, History
} from 'lucide-react';
import { Modal, LoadingButton, Toast } from './SharedUI';

// --- Types ---

interface Deployment {
  id: string;
  status: 'success' | 'building' | 'failed' | 'queued';
  environment: 'Production' | 'Staging';
  commit: string;
  message: string;
  author: string;
  time: string;
  duration?: string;
  url?: string;
}

// --- Mock Data ---

const initialDeployments: Deployment[] = [
  {
    id: 'd_1234',
    status: 'success',
    environment: 'Production',
    commit: '8f92a1',
    message: 'feat(system): release user management',
    author: 'admin',
    time: '2h ago',
    duration: '45s',
    url: 'https://admin.enterprise.com'
  },
  {
    id: 'd_1235',
    status: 'success',
    environment: 'Staging',
    commit: '9b23c4',
    message: 'fix: permission dialog style',
    author: 'dev_01',
    time: '10m ago',
    duration: '32s',
    url: 'https://staging.enterprise.com'
  }
];

const LOG_STREAM = [
  "> enterprise-admin@1.0.0 build",
  "> vite build",
  "",
  "   ▲ Vite 5.2.0",
  "   - Environments: .env.production",
  "",
  "   Building for production...",
  "   ✓ Transformed 145 modules",
  "   ✓ Rendered chunks (12/12)",
  "   ✓ Compressed assets (gzip/brotli)",
  "",
  "   dist/assets/index.js    425.2 kB │ gzip: 120.4 kB",
  "   dist/assets/index.css    42.1 kB │ gzip:  10.2 kB",
  "",
  "   ✓ Build Finished (42.3s)",
  "   > Uploading to CDN...",
  "   ✓ Deployment Complete: https://admin.enterprise.com"
];

// --- Components ---

const StatusBadge = ({ status }: { status: Deployment['status'] }) => {
  if (status === 'success') return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] border border-green-500/20"><CheckCircle2 size={10} /> Active</span>;
  if (status === 'building') return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] border border-indigo-500/20"><RefreshCw size={10} className="animate-spin" /> Building</span>;
  if (status === 'queued') return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[10px] border border-slate-500/20"><Clock size={10} /> Queued</span>;
  return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] border border-red-500/20"><AlertCircle size={10} /> Failed</span>;
};

export const DeploymentCenter: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>(initialDeployments);
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeEnv, setActiveEnv] = useState<'Production' | 'Staging'>('Production');
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleDeploy = () => {
    setIsDeploying(true);
    setLogs([]);
    
    // 1. Add pending deployment
    const newDeploy: Deployment = {
      id: `d_${Math.floor(Math.random() * 10000)}`,
      status: 'building',
      environment: activeEnv,
      commit: 'HEAD',
      message: 'Manual deployment triggered',
      author: 'user',
      time: 'Just now',
    };
    setDeployments(prev => [newDeploy, ...prev]);

    // 2. Simulate logs
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex >= LOG_STREAM.length) {
        clearInterval(interval);
        setIsDeploying(false);
        setDeployments(prev => prev.map(d => d.id === newDeploy.id ? { ...d, status: 'success', duration: '42.3s' } : d));
      } else {
        setLogs(prev => [...prev, LOG_STREAM[logIndex]]);
        logIndex++;
      }
    }, 150); // Fast log stream
  };

  return (
    <div className="h-full flex flex-col bg-[#09090b] font-sans overflow-hidden">
      
      {/* Header */}
      <div className="h-16 border-b border-border bg-[#0f1117] flex items-center justify-between px-8 shrink-0">
         <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
               <Rocket size={20} />
            </div>
            <div>
               <h1 className="text-lg font-bold text-white">Mission Control</h1>
               <p className="text-xs text-slate-400">Manage environments and shipping pipelines.</p>
            </div>
         </div>
         
         <div className="flex gap-3">
            <button 
              onClick={() => setActiveEnv('Staging')}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                 activeEnv === 'Staging' 
                 ? 'bg-green-500/10 border-green-500/50 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.1)]' 
                 : 'border-border text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
               <div className={`w-2 h-2 rounded-full ${activeEnv === 'Staging' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
               STAGING
            </button>
            <button 
              onClick={() => setActiveEnv('Production')}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                 activeEnv === 'Production' 
                 ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                 : 'border-border text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
               <div className={`w-2 h-2 rounded-full ${activeEnv === 'Production' ? 'bg-purple-500 animate-pulse' : 'bg-slate-600'}`}></div>
               PRODUCTION
            </button>
            <div className="w-px h-8 bg-white/10 mx-1"></div>
            <button 
              onClick={handleDeploy}
              disabled={isDeploying}
              className="px-6 py-2 bg-white text-black hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold flex items-center gap-2 shadow-xl transition-all"
            >
              {isDeploying ? <RefreshCw size={14} className="animate-spin" /> : <Rocket size={14} />}
              {isDeploying ? 'Deploying...' : `Ship to ${activeEnv}`}
            </button>
         </div>
      </div>

      {/* Main Dashboard */}
      <div className="flex-1 overflow-hidden flex">
         
         {/* Left: Environment Overview */}
         <div className="flex-1 overflow-y-auto p-8 space-y-8">
            
            {/* Environment Card */}
            <div className="bg-[#12141a] border border-border rounded-2xl p-6 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-1 ${activeEnv === 'Production' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
               
               <div className="flex justify-between items-start mb-8">
                  <div>
                     <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-white">{activeEnv} Environment</h2>
                        <div className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-slate-400 font-mono">v1.0.2</div>
                     </div>
                     <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1">
                        https://{activeEnv === 'Staging' ? 'staging.' : ''}admin.enterprise.com <ExternalLink size={12} />
                     </a>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Health Status</div>
                     <div className="flex items-center gap-2 text-green-400 font-bold">
                        <Activity size={16} /> 99.99% Uptime
                     </div>
                  </div>
               </div>

               {/* Config Section - Merged nicely into the card since metrics are gone */}
               <div>
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                     <Shield size={16} className="text-slate-500" /> Configuration
                  </h3>
                  <div className="bg-[#0f1117] border border-border rounded-xl overflow-hidden">
                     <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                        <span className="text-xs font-mono text-slate-300">DATABASE_URL</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] text-slate-500">Encrypted</span>
                           <Lock size={12} className="text-slate-600" />
                        </div>
                     </div>
                     <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
                        <span className="text-xs font-mono text-slate-300">NEXT_PUBLIC_API_KEY</span>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-mono text-slate-500">pk_live_...4x92</span>
                        </div>
                     </div>
                     <div className="px-4 py-2 bg-white/5 text-center">
                        <button className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Reveal All Secrets</button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Deployment History */}
            <div>
               <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <History size={16} className="text-slate-500" /> Recent Deployments
               </h3>
               <div className="space-y-2">
                  {deployments.filter(d => d.environment === activeEnv).map(deploy => (
                     <div key={deploy.id} className="bg-[#12141a] border border-border rounded-xl p-4 flex items-center justify-between hover:border-white/20 transition-colors group">
                        <div className="flex items-center gap-4">
                           <StatusBadge status={deploy.status} />
                           <div>
                              <div className="text-xs font-bold text-white mb-0.5">{deploy.message}</div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                 <GitCommit size={10} /> <span className="font-mono">{deploy.commit}</span>
                                 <span>•</span>
                                 <span>{deploy.time}</span>
                                 <span>•</span>
                                 <span>by {deploy.author}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           {deploy.duration && <span className="text-xs text-slate-500 font-mono">{deploy.duration}</span>}
                           <button className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                              <ArrowRight size={14} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Right: Build Terminal */}
         <div className="w-[480px] bg-[#000] border-l border-white/10 flex flex-col font-mono text-xs">
            <div className="h-10 bg-[#1a1d24] flex items-center justify-between px-4 border-b border-white/10 shrink-0">
               <div className="flex items-center gap-2 text-slate-400">
                  <Terminal size={14} />
                  <span className="font-bold">Build Logs</span>
               </div>
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
               </div>
            </div>
            
            <div ref={logContainerRef} className="flex-1 overflow-y-auto p-4 space-y-1 text-slate-300 scroll-smooth">
               {isDeploying ? (
                  logs.map((line, i) => (
                     <div key={i} className="whitespace-pre-wrap animate-in fade-in slide-in-from-left-1 duration-100">
                        {line.startsWith('>') ? <span className="text-yellow-400">{line}</span> : 
                         line.includes('✓') ? <span className="text-green-400">{line}</span> :
                         line.includes('Error') ? <span className="text-red-400">{line}</span> : 
                         line}
                     </div>
                  ))
               ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                     <StopCircle size={32} className="opacity-20" />
                     <p>Waiting for deployment trigger...</p>
                  </div>
               )}
               {isDeploying && (
                  <div className="animate-pulse text-indigo-500">_</div>
               )}
            </div>

            {/* Terminal Footer status */}
            <div className="h-8 bg-[#0f1117] border-t border-white/10 flex items-center px-4 justify-between text-[10px] text-slate-500 shrink-0">
               <span>Worker: i-08f2a91 (US-East)</span>
               <span>Mem: 256MB / 1024MB</span>
            </div>
         </div>

      </div>
    </div>
  );
};
