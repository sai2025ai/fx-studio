


import React, { useState } from 'react';
import { Layout, GitBranch, Package, Command, Settings as SettingsIcon, User, Bell, LayoutDashboard, BrainCircuit, Rocket, Beaker } from 'lucide-react';
import { Tab, ContextScope } from './types';
import { Workbench } from './components/Workbench';
import { WorkflowStudio } from './components/WorkflowStudio';
import { AssetManager } from './components/AssetManager';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { ContextManager } from './components/Context';
import { DeploymentCenter } from './components/DeploymentCenter';
import { TestLab } from './components/TestLab';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [workbenchScope, setWorkbenchScope] = useState<ContextScope | null>(null);
  const [workbenchIntent, setWorkbenchIntent] = useState<string | null>(null);
  const [workbenchData, setWorkbenchData] = useState<any>(null); // For rich onboarding data

  const handleNavigate = (tab: Tab, intent?: string) => {
    setActiveTab(tab);
    if (intent) {
      setWorkbenchIntent(intent);
    }
  };

  const handleLaunch = (data: any) => {
    setWorkbenchData(data);
    setActiveTab(Tab.WORKBENCH);
  };

  const NavButton = ({ tab, icon: Icon, label }: { tab: Tab, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(tab)}
      className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-2 group overflow-hidden ${
        activeTab === tab 
          ? 'bg-slate-700 text-white shadow-lg shadow-black/20' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      {activeTab === tab && (
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-50 pointer-events-none" />
      )}
      <Icon size={14} className={`relative z-10 transition-colors duration-300 ${activeTab === tab ? 'text-indigo-300' : 'group-hover:text-slate-200'}`} />
      <span className="relative z-10">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Main Layout Container */}
      <div className="flex flex-col w-full h-full">
        
        {/* Top Navigation Bar (HUD) */}
        <header className="h-14 border-b border-border bg-[#0f1117] flex items-center justify-between px-4 shrink-0 z-50">
          <div className="flex items-center gap-6">
            {/* Branding */}
            <div className="flex items-center gap-2 select-none mr-2">
              <div className="w-6 h-6 bg-gradient-to-br from-claude-500 to-claude-600 rounded md-sm flex items-center justify-center shadow-lg shadow-claude-500/20">
                <Command size={12} className="text-white" />
              </div>
              <span className="font-bold tracking-tight text-white text-sm">Claude <span className="font-light text-slate-400">Code</span></span>
            </div>

            {/* Navigation Groups - Flow State Design */}
            <div className="flex items-center gap-3">
              
              {/* Group 1: Plan & Equip (Preparation) */}
              <div className="flex items-center p-1 bg-[#1a1d24] rounded-lg border border-white/5 shadow-inner">
                <NavButton tab={Tab.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
                <NavButton tab={Tab.CONTEXT} icon={BrainCircuit} label="Context" />
                <NavButton tab={Tab.ASSETS} icon={Package} label="Assets" />
              </div>

              {/* Group 2: The Core Build Loop (Creation) */}
              <div className="flex items-center p-1 bg-[#1a1d24] rounded-lg border border-white/5 shadow-inner">
                <NavButton tab={Tab.WORKBENCH} icon={Layout} label="Workbench" />
              </div>

              {/* Group 3: Quality Assurance & Release (Verification) */}
              <div className="flex items-center p-1 bg-[#1a1d24] rounded-lg border border-white/5 shadow-inner">
                <NavButton tab={Tab.TEST} icon={Beaker} label="Test" />
                <NavButton tab={Tab.DEPLOY} icon={Rocket} label="Deploy" />
              </div>

            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></div>
               <span className="text-[10px] font-mono text-indigo-200">System Online</span>
             </div>
             <div className="h-4 w-px bg-border"></div>
             <button className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-md">
                <Bell size={14} />
             </button>
             <button 
               className={`transition-colors p-1.5 rounded-md hover:bg-white/5 ${activeTab === Tab.SETTINGS ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
               onClick={() => setActiveTab(Tab.SETTINGS)}
             >
                <SettingsIcon size={14} />
             </button>
             <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-500 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500/50 transition-all">
                <User size={12} className="text-slate-300" />
             </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative bg-[#09090b]">
          {activeTab === Tab.DASHBOARD && <Dashboard onNavigate={handleNavigate} onLaunch={handleLaunch} />}
          {activeTab === Tab.WORKBENCH && <Workbench initialScope={workbenchScope} startupIntent={workbenchIntent} startupData={workbenchData} />}
          {activeTab === Tab.WORKFLOW && <WorkflowStudio />}
          {activeTab === Tab.ASSETS && <AssetManager onNavigate={handleNavigate} />}
          {activeTab === Tab.CONTEXT && <ContextManager onApplyContext={(scope) => {
             setWorkbenchScope(scope);
             handleNavigate(Tab.WORKBENCH);
          }} />}
          {activeTab === Tab.TEST && <TestLab />}
          {activeTab === Tab.DEPLOY && <DeploymentCenter />}
          {activeTab === Tab.SETTINGS && <Settings />}
        </main>
        
        {/* Global Status Footer */}
        <footer className="h-6 bg-[#0d1117] border-t border-border flex items-center px-4 text-[10px] text-slate-500 justify-between select-none shrink-0">
          <div className="flex gap-4">
            <span className="flex items-center gap-1 hover:text-slate-300 cursor-pointer transition-colors"><GitBranch size={10} /> feature/auth-v2*</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">0 errors, 2 warnings</span>
          </div>
          <div className="flex gap-4">
             <span>UTF-8</span>
             <span>Python 3.11.4</span>
             <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Claude 3.5 Sonnet</span>
          </div>
        </footer>
      </div>
    </div>
  );
}