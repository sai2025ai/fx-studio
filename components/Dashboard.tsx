
import React, { useState, useEffect } from 'react';
import { 
  Clock, Code, Zap, GitBranch, 
  ArrowUpRight, FolderOpen, 
  Terminal, Activity,
  CheckCircle2, Rocket,
  Bug, BrainCircuit, FileText, Package, Beaker,
  ArrowRight, PlayCircle
} from 'lucide-react';
import { OnboardingModule } from './dashboard/OnboardingModule';
import { cn } from '../lib/utils';
import { Tab } from '../types';

// --- Mission Control Data ---

const contextData = {
  scope: 'project-alpha',
  iteration: 'V2.0 User Auth',
  doc: 'PRD: User Authentication System V2',
  rules: 3
};

const gitStatus = {
  branch: 'feature/auth-v2',
  stats: { added: 145, removed: 23 },
  files: [
    { name: 'src/views/UserList.vue', status: 'M' },
    { name: 'src/api/auth.ts', status: 'A' },
    { name: 'src/types/user.d.ts', status: 'A' },
  ]
};

const agentActivity = [
  { id: 1, agent: 'Architect', action: 'Analyzing PRD requirements...', status: 'running', progress: 45 },
  { id: 2, agent: 'Coder', action: 'Generated migration_001_users.sql', status: 'completed', time: '2m ago' },
  { id: 3, agent: 'QA Bot', action: 'Identified 2 edge cases in Login flow', status: 'warning', time: '15m ago' },
];

const healthStats = {
  tests: { passed: 42, failed: 1, total: 43 },
  deploy: { env: 'Staging', version: 'v2.4.0-rc.1', status: 'healthy', uptime: '99.9%' },
  db: { size: '14.2 MB', tables: 12 }
};

interface DashboardProps {
  onNavigate: (tab: Tab, intent?: string) => void;
  onLaunch?: (data: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLaunch }) => {
  // State for the Onboarding Modal
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  // Animation states for smooth transitions
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (showOnboardingModal) {
      setIsMounted(true);
      // Double RAF to ensure DOM is painted before adding active class for transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsMounted(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [showOnboardingModal]);

  const handleOnboardingLaunch = (data: any) => {
      setShowOnboardingModal(false);
      if (onLaunch) onLaunch(data);
  };

  return (
    <div className="h-full p-6 overflow-y-auto bg-slate-950 font-sans custom-scrollbar relative">
       
       {/* Header - Mission Control Style */}
       <div className="flex justify-between items-end mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
               Mission Control <div className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 font-mono tracking-wide">ONLINE</div>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Project Integrated Hub • Active Session</p>
          </div>
          <div className="flex gap-2">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12141a] border border-border text-xs text-slate-400">
               <Clock size={12} /> Uptime: 4d 12h
             </div>
          </div>
       </div>

       {/* Quick Start Card (New) */}
       <div className="mb-8 p-0.5 rounded-2xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 animate-in slide-in-from-top-4 duration-700">
          <div className="bg-[#12141a]/90 backdrop-blur-sm rounded-[14px] p-6 flex items-center justify-between relative overflow-hidden">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full pointer-events-none"></div>
             
             <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-xl shadow-indigo-500/30 shrink-0 border border-white/10">
                   <Zap size={32} className="text-white drop-shadow-md" fill="currentColor" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white mb-1">快速开始 (Quick Start)</h2>
                   <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                      初始化新的工作上下文。挂载 Git 仓库，选择 AI 模型，并定义本次迭代的核心目标。
                      <span className="block text-xs text-slate-500 mt-1">Neural Engine Ready • Templates Available</span>
                   </p>
                </div>
             </div>

             <button 
               onClick={() => setShowOnboardingModal(true)}
               className="group relative px-8 py-3 bg-white hover:bg-indigo-50 text-black rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all flex items-center gap-3 z-10"
             >
                <PlayCircle size={18} className="text-indigo-600" />
                开始新任务
                <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform duration-300 group-hover:text-black" />
             </button>
          </div>
       </div>

       {/* Onboarding Modal Overlay with Transition */}
       {isMounted && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            {/* Backdrop */}
            <div 
              className={cn(
                "absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300", 
                isAnimating ? "opacity-100" : "opacity-0"
              )}
              onClick={() => setShowOnboardingModal(false)}
            ></div>
            
            {/* Modal Content */}
            <div className={cn(
                "relative w-full max-w-6xl h-[85vh] shadow-2xl shadow-black rounded-2xl overflow-hidden border border-white/10 bg-[#09090b] transition-all duration-300 cubic-bezier(0.32, 0.72, 0, 1)",
                isAnimating ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
            )}>
                <OnboardingModule 
                  onDismiss={() => setShowOnboardingModal(false)} 
                  onLaunch={handleOnboardingLaunch} 
                />
            </div>
         </div>
       )}

       {/* Bento Grid Layout */}
       <div className="grid grid-cols-12 gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
          
          {/* Row 1 */}

          {/* 1. Context Hub (Col 3) */}
          <div className="col-span-12 md:col-span-3 bg-[#12141a] border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-indigo-500/30 transition-colors group">
             {/* Header */}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                   <BrainCircuit size={16} />
                   <span className="text-xs font-bold uppercase tracking-wider">Context</span>
                </div>
                <button onClick={() => onNavigate(Tab.CONTEXT)} className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline">Manage</button>
             </div>
             {/* Content */}
             <div className="flex-1 flex flex-col justify-center gap-2">
                <div className="text-2xl font-bold text-white truncate">{contextData.iteration}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                   <FolderOpen size={12} /> {contextData.scope}
                </div>
                <div className="mt-2 p-2 bg-[#1a1d24] rounded-lg border border-white/5 flex items-center gap-2 cursor-pointer hover:bg-[#22252b]" onClick={() => onNavigate(Tab.CONTEXT)}>
                   <FileText size={14} className="text-indigo-400" />
                   <span className="text-xs text-slate-300 truncate flex-1">{contextData.doc}</span>
                   <ArrowUpRight size={12} className="text-slate-600" />
                </div>
                <div className="flex gap-2 mt-1">
                   <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">3 Rules Active</span>
                   <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">Swagger Linked</span>
                </div>
             </div>
          </div>

          {/* 2. Workbench State (Col 6) */}
          <div className="col-span-12 md:col-span-6 bg-[#12141a] border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-indigo-500/30 transition-colors relative overflow-hidden min-h-[180px]">
             <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 text-slate-400">
                   <Code size={16} />
                   <span className="text-xs font-bold uppercase tracking-wider">Workbench</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                   <GitBranch size={12} /> {gitStatus.branch}
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4 z-10 flex-1">
                <div className="space-y-2">
                   <div className="text-xs text-slate-500 uppercase font-bold">Changed Files</div>
                   {gitStatus.files.map(f => (
                      <div key={f.name} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                         <span className={cn("text-[10px] w-3 font-bold", f.status === 'M' ? "text-amber-400" : "text-green-400")}>{f.status}</span>
                         <span className="truncate">{f.name.split('/').pop()}</span>
                      </div>
                   ))}
                </div>
                <div className="flex flex-col justify-between items-end h-full">
                   <div className="text-right">
                      <div className="text-2xl font-bold text-white mb-1">+{gitStatus.stats.added} <span className="text-base text-slate-500 font-normal">/ -{gitStatus.stats.removed}</span></div>
                      <div className="text-xs text-slate-500">Lines changed</div>
                   </div>
                   <button 
                     onClick={() => onNavigate(Tab.WORKBENCH)}
                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all mt-auto"
                   >
                     <Terminal size={14} /> Resume Coding
                   </button>
                </div>
             </div>
             {/* Background decoration */}
             <div className="absolute top-0 right-0 p-16 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-2xl rounded-full z-0 pointer-events-none"></div>
          </div>

          {/* 3. Quick Actions (Col 3) */}
          <div className="col-span-12 md:col-span-3 grid grid-rows-3 gap-2">
             <button onClick={() => onNavigate(Tab.WORKFLOW)} className="bg-[#12141a] border border-border hover:bg-[#1a1d24] hover:border-indigo-500/50 rounded-lg p-3 flex items-center gap-3 transition-all group">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded group-hover:bg-indigo-500 group-hover:text-white transition-colors"><GitBranch size={14} /></div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">New Workflow</span>
             </button>
             <button onClick={() => onNavigate(Tab.ASSETS)} className="bg-[#12141a] border border-border hover:bg-[#1a1d24] hover:border-pink-500/50 rounded-lg p-3 flex items-center gap-3 transition-all group">
                <div className="p-1.5 bg-pink-500/10 text-pink-400 rounded group-hover:bg-pink-500 group-hover:text-white transition-colors"><Package size={14} /></div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Add Asset</span>
             </button>
             <button onClick={() => onNavigate(Tab.TEST)} className="bg-[#12141a] border border-border hover:bg-[#1a1d24] hover:border-amber-500/50 rounded-lg p-3 flex items-center gap-3 transition-all group">
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded group-hover:bg-amber-500 group-hover:text-white transition-colors"><Beaker size={14} /></div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-white">Run Tests</span>
             </button>
          </div>

          {/* Row 2 */}

          {/* 4. Agent Monitor (Col 8) */}
          <div className="col-span-12 md:col-span-8 bg-[#12141a] border border-border rounded-xl p-4 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                   <Zap size={16} className="text-amber-400" />
                   <span className="text-xs font-bold uppercase tracking-wider">Agent Activity</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 2 Idle</span>
                   <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div> 1 Working</span>
                </div>
             </div>

             <div className="space-y-3">
                {agentActivity.map(item => (
                   <div key={item.id} className="bg-[#0f1117] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", 
                         item.agent === 'Architect' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                         item.agent === 'Coder' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                      )}>
                         {item.agent === 'Architect' ? <BrainCircuit size={14} /> : item.agent === 'Coder' ? <Terminal size={14} /> : <Bug size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-white">{item.agent}</span>
                            <span className="text-[10px] text-slate-500">{item.time || 'Now'}</span>
                         </div>
                         <div className="text-xs text-slate-400 truncate">{item.action}</div>
                         {item.status === 'running' && (
                            <div className="mt-2 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 animate-pulse" style={{ width: `${item.progress}%` }}></div>
                            </div>
                         )}
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* 5. Health & Deploy (Col 4) */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
             {/* Test Health */}
             <div className="flex-1 bg-[#12141a] border border-border rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                   <Activity size={16} />
                   <span className="text-xs font-bold uppercase tracking-wider">Quality Gate</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 64 64">
                         <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-800" />
                         <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={176} strokeDashoffset={176 - (176 * 0.98)} className="text-green-500" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-xs font-bold text-white">98%</span>
                   </div>
                   <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs">
                         <span className="text-slate-400">Passed</span>
                         <span className="text-green-400 font-bold">{healthStats.tests.passed}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                         <span className="text-slate-400">Failed</span>
                         <span className="text-red-400 font-bold">{healthStats.tests.failed}</span>
                      </div>
                      <div className="w-full h-px bg-white/5 my-1"></div>
                      <button onClick={() => onNavigate(Tab.TEST)} className="text-[10px] text-indigo-400 hover:underline">View Report</button>
                   </div>
                </div>
             </div>

             {/* Deploy Status */}
             <div className="flex-1 bg-[#12141a] border border-border rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                   <Rocket size={16} />
                   <span className="text-xs font-bold uppercase tracking-wider">Deployment</span>
                </div>
                <div>
                   <div className="text-xl font-bold text-white mb-0.5">{healthStats.deploy.env}</div>
                   <div className="text-xs text-slate-500 font-mono mb-2">{healthStats.deploy.version}</div>
                   <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold">
                         <CheckCircle2 size={10} /> {healthStats.deploy.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-500">Up {healthStats.deploy.uptime}</span>
                   </div>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
};
