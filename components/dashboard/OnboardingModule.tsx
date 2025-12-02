
import React, { useState, useEffect } from 'react';
import { 
  Zap, Sparkles, Cpu, Settings, Globe, Key, ArrowRight, 
  ArrowLeft, CheckCircle2, X, Github, LayoutTemplate, 
  GitBranch, Terminal, PlayCircle, Loader2, Box, Command,
  Eye, EyeOff, Server, RefreshCw, ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input, Button } from '../ui/core';

interface OnboardingData {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  projectType: 'git' | 'template';
  repoUrl?: string;
  templateId?: string;
  iterationName: string;
  intent: string;
}

interface OnboardingModuleProps {
  onDismiss: () => void;
  onLaunch: (data: OnboardingData) => void;
}

const PROVIDERS = [
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    icon: Sparkles, 
    color: 'text-orange-500', 
    defaultBaseUrl: 'https://api.anthropic.com',
    defaultModels: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229']
  },
  { 
    id: 'openai', 
    name: 'OpenAI', 
    icon: Zap, 
    color: 'text-green-500',
    defaultBaseUrl: 'https://api.openai.com/v1', 
    defaultModels: ['gpt-4o', 'gpt-4-turbo']
  },
  { 
    id: 'ollama', 
    name: 'Ollama', 
    icon: Cpu, 
    color: 'text-white',
    defaultBaseUrl: 'http://localhost:11434',
    defaultModels: ['llama3', 'mistral', 'qwen:7b'] 
  },
  { 
    id: 'custom', 
    name: 'Custom / Compatible', 
    icon: Settings, 
    color: 'text-purple-500',
    defaultBaseUrl: 'https://api.deepseek.com',
    defaultModels: ['deepseek-coder']
  },
];

const StepIndicator = ({ step, current, label }: { step: number, current: number, label: string }) => (
  <div className="flex items-center gap-2">
     <div className={cn(
       "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 border",
       step === current ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]" :
       step < current ? "bg-green-500 border-green-500 text-white" :
       "bg-[#1a1d24] border-white/10 text-slate-500"
     )}>
        {step < current ? <CheckCircle2 size={12} /> : step}
     </div>
     <span className={cn(
       "text-xs font-medium transition-colors duration-300",
       step === current ? "text-white" : step < current ? "text-slate-400" : "text-slate-600"
     )}>{label}</span>
  </div>
);

export const OnboardingModule: React.FC<OnboardingModuleProps> = ({ onDismiss, onLaunch }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    provider: 'anthropic',
    apiKey: '',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-3-5-sonnet-20240620',
    projectType: 'git',
    repoUrl: 'https://github.com/claude-templates/vue-admin-starter.git',
    iterationName: 'MVP v1.0',
    intent: ''
  });
  
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Switch Provider Logic
  const handleProviderChange = (providerId: string) => {
    const provider = PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setData(prev => ({
        ...prev,
        provider: providerId,
        baseUrl: provider.defaultBaseUrl,
        model: provider.defaultModels[0],
        apiKey: '' // Reset key on provider switch for security
      }));
      setTestStatus('idle');
    }
  };

  const handleTestConnection = () => {
    if (!data.apiKey && data.provider !== 'ollama') return;
    setIsTesting(true);
    // Simulate API Check
    setTimeout(() => {
      setIsTesting(false);
      setTestStatus('success');
    }, 1000);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const activeProviderDef = PROVIDERS.find(p => p.id === data.provider) || PROVIDERS[0];

  return (
    <div className="relative w-full flex flex-col h-full bg-[#12141a] overflow-hidden rounded-2xl">
       <div className="flex flex-col md:flex-row h-full">
          
          {/* Close Button */}
          <button 
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-50"
          >
            <X size={18} />
          </button>

          {/* Left: Progress Sidebar */}
          <div className="w-full md:w-64 bg-[#0f1117]/50 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between shrink-0">
             <div>
                <div className="flex items-center gap-2 mb-8 text-indigo-400">
                   <Zap size={20} fill="currentColor" />
                   <span className="font-bold tracking-tight">Quick Start</span>
                </div>
                <div className="space-y-6 flex flex-col">
                   <StepIndicator step={1} current={step} label="模型配置 (Model)" />
                   <div className="w-px h-4 bg-white/5 ml-3 -my-2 hidden md:block"></div>
                   <StepIndicator step={2} current={step} label="项目挂载 (Context)" />
                   <div className="w-px h-4 bg-white/5 ml-3 -my-2 hidden md:block"></div>
                   <StepIndicator step={3} current={step} label="意图指令 (Intent)" />
                </div>
             </div>
             <div className="hidden md:block">
               <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-[10px] text-indigo-300 leading-relaxed">
                  <span className="font-bold block mb-1">💡 提示</span>
                  正确配置 Base URL 和 Model ID 是确保 Agent 能正常工作的关键。
               </div>
             </div>
          </div>

          {/* Right: Content Area */}
          <div className="flex-1 p-0 relative flex flex-col overflow-hidden bg-[#12141a]">
             
             {/* Step 1: Neural Engine (Redesigned) */}
             {step === 1 && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="p-8 pb-4 border-b border-white/5 bg-[#12141a]">
                      <h2 className="text-xl font-bold text-white mb-1">配置神经引擎 (Neural Engine)</h2>
                      <p className="text-sm text-slate-400">选择并配置您的 AI 模型供应商，这决定了 Agent 的智力水平。</p>
                   </div>
                   
                   <div className="flex-1 flex overflow-hidden">
                      {/* Sub-Sidebar: Provider List */}
                      <div className="w-48 border-r border-white/5 bg-[#0f1117]/30 p-2 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-2 mb-1">Provider</div>
                        {PROVIDERS.map(p => (
                          <button
                            key={p.id}
                            onClick={() => handleProviderChange(p.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all mb-1 group relative",
                              data.provider === p.id 
                                ? "bg-indigo-600/10 text-white border border-indigo-500/30" 
                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
                            )}
                          >
                             <div className={cn("p-1.5 rounded transition-colors", data.provider === p.id ? p.color : "text-slate-500 group-hover:text-slate-300")}>
                                <p.icon size={16} />
                             </div>
                             <span className="text-xs font-medium">{p.name}</span>
                             {data.provider === p.id && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
                          </button>
                        ))}
                      </div>

                      {/* Main Form Area */}
                      <div className="flex-1 p-6 overflow-y-auto bg-[#12141a]">
                         
                         {/* Provider Header */}
                         <div className="flex items-center gap-3 mb-6">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg", activeProviderDef.color.replace('text-', 'bg-') + '/20', activeProviderDef.color)}>
                               <activeProviderDef.icon size={20} />
                            </div>
                            <div>
                               <h3 className="text-lg font-bold text-white">{activeProviderDef.name} Config</h3>
                               <a href="#" className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1">获取 API Key <ArrowRight size={8} /></a>
                            </div>
                         </div>

                         <div className="space-y-5 max-w-lg">
                            {/* Base URL */}
                            <div>
                               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Base URL (Endpoint)</label>
                               <div className="relative">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                     <Globe size={14} />
                                  </div>
                                  <input 
                                    type="text" 
                                    value={data.baseUrl}
                                    onChange={(e) => setData(prev => ({ ...prev, baseUrl: e.target.value }))}
                                    className="w-full bg-[#0d1117] border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono transition-all"
                                  />
                               </div>
                            </div>

                            {/* API Key */}
                            {data.provider !== 'ollama' && (
                              <div>
                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">API Key</label>
                                 <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                       <Key size={14} />
                                    </div>
                                    <input 
                                      type={showApiKey ? 'text' : 'password'}
                                      value={data.apiKey}
                                      onChange={(e) => setData(prev => ({ ...prev, apiKey: e.target.value }))}
                                      placeholder="sk-..."
                                      className="w-full bg-[#0d1117] border border-border rounded-lg pl-9 pr-10 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono transition-all"
                                    />
                                    <button 
                                      onClick={() => setShowApiKey(!showApiKey)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                       {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                 </div>
                              </div>
                            )}

                            {/* Model Selection */}
                            <div>
                               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Model ID</label>
                               <div className="relative mb-2">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                     <Box size={14} />
                                  </div>
                                  <input 
                                    type="text" 
                                    value={data.model}
                                    onChange={(e) => setData(prev => ({ ...prev, model: e.target.value }))}
                                    className="w-full bg-[#0d1117] border border-border rounded-lg pl-9 pr-10 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono transition-all"
                                  />
                               </div>
                               <div className="flex flex-wrap gap-2">
                                  {activeProviderDef.defaultModels.map(m => (
                                     <button 
                                       key={m}
                                       onClick={() => setData(prev => ({ ...prev, model: m }))}
                                       className={cn(
                                         "px-2 py-1 rounded text-[10px] font-mono transition-colors border",
                                         data.model === m 
                                           ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" 
                                           : "bg-white/5 text-slate-500 border-transparent hover:border-white/10 hover:text-slate-300"
                                       )}
                                     >
                                        {m}
                                     </button>
                                  ))}
                               </div>
                            </div>

                            {/* Connection Test */}
                            <div className="pt-4 mt-2 border-t border-white/5">
                               <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                     {testStatus === 'success' && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 size={12} /> Connection Verified</span>}
                                     {testStatus === 'error' && <span className="text-xs text-red-400 flex items-center gap-1"><X size={12} /> Connection Failed</span>}
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant={testStatus === 'success' ? 'outline' : 'default'}
                                    onClick={handleTestConnection}
                                    isLoading={isTesting}
                                    className={cn("min-w-[100px]", testStatus === 'success' && "border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/10")}
                                  >
                                     {testStatus === 'success' ? 'Verified' : 'Test Connection'}
                                  </Button>
                               </div>
                            </div>

                         </div>
                      </div>
                   </div>

                   <div className="p-6 border-t border-white/5 bg-[#0f1117]/30 flex justify-end">
                      <Button onClick={nextStep} className="gap-2 pl-6 pr-6">
                         Next: Project Scope <ArrowRight size={16} />
                      </Button>
                   </div>
                </div>
             )}

             {/* Step 2: Target & Scope (Combined) */}
             {step === 2 && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="p-8 pb-4">
                      <h2 className="text-xl font-bold text-white mb-2">项目与上下文 (Project & Context)</h2>
                      <p className="text-sm text-slate-400">挂载您的代码仓库或选择一个官方模板，定义当前的工作迭代。</p>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto px-8">
                     {/* Project Type Switch */}
                     <div className="flex p-1 bg-[#0f1117] rounded-lg border border-white/5 mb-8 w-fit">
                        <button 
                          onClick={() => setData(prev => ({...prev, projectType: 'git'}))}
                          className={cn(
                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                            data.projectType === 'git' ? "bg-[#1a1d24] text-white shadow-sm border border-white/5" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                           <Github size={14} /> Git Repository
                        </button>
                        <button 
                          onClick={() => setData(prev => ({...prev, projectType: 'template'}))}
                          className={cn(
                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2",
                            data.projectType === 'template' ? "bg-[#1a1d24] text-white shadow-sm border border-white/5" : "text-slate-500 hover:text-slate-300"
                          )}
                        >
                           <LayoutTemplate size={14} /> Official Template
                        </button>
                     </div>

                     <div className="space-y-6 max-w-2xl">
                        {data.projectType === 'git' ? (
                          <div className="bg-[#0f1117] p-5 rounded-xl border border-white/5">
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Repository URL</label>
                             <div className="relative">
                               <Input 
                                  value={data.repoUrl}
                                  onChange={(e) => setData(prev => ({...prev, repoUrl: e.target.value}))}
                                  placeholder="https://github.com/username/repo.git"
                                  className="font-mono text-xs pl-9"
                               />
                               <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Github size={14} /></div>
                             </div>
                             {data.repoUrl && (
                               <div className="mt-2 flex items-center gap-2 text-[10px] text-green-400 animate-in fade-in bg-green-500/5 w-fit px-2 py-1 rounded border border-green-500/10">
                                  <CheckCircle2 size={10} /> Valid Git repository detected
                               </div>
                             )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                             {['Vue Admin Starter', 'React SaaS Boilerplate', 'Python FastAPI Service', 'Next.js Blog'].map(tpl => (
                               <div 
                                 key={tpl} 
                                 onClick={() => setData(prev => ({...prev, templateId: tpl}))}
                                 className={cn(
                                   "p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-2",
                                   data.templateId === tpl 
                                     ? "bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]" 
                                     : "bg-[#0f1117] border-white/5 text-slate-400 hover:border-white/10 hover:bg-[#16181f]"
                                 )}
                               >
                                  <LayoutTemplate size={16} />
                                  <div className="text-xs font-bold">{tpl}</div>
                               </div>
                             ))}
                          </div>
                        )}

                        <div className="bg-[#0f1117] p-5 rounded-xl border border-white/5">
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Iteration / Scope Name</label>
                           <div className="relative">
                              <GitBranch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                              <Input 
                                 value={data.iterationName}
                                 onChange={(e) => setData(prev => ({...prev, iterationName: e.target.value}))}
                                 placeholder="e.g. Feature: Auth V2"
                                 className="pl-9"
                              />
                           </div>
                           <p className="text-[10px] text-slate-500 mt-2">这将作为 AI 的工作上下文范围名称 (Scope Name)。</p>
                        </div>
                     </div>
                   </div>

                   <div className="p-6 mt-auto border-t border-white/5 bg-[#0f1117]/30 flex justify-between">
                      <button onClick={prevStep} className="text-slate-500 hover:text-white text-sm font-medium flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                      <Button onClick={nextStep} className="gap-2 pl-6 pr-6">
                         Next: Define Intent <ArrowRight size={16} />
                      </Button>
                   </div>
                </div>
             )}

             {/* Step 3: Directive (Intent) */}
             {step === 3 && (
                <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="p-8 pb-4">
                      <h2 className="text-xl font-bold text-white mb-2">主要指令 (Primary Directive)</h2>
                      <p className="text-sm text-slate-400">告诉 AI 你在这个迭代中想要完成的核心任务。</p>
                   </div>

                   <div className="flex-1 px-8 pb-8 relative flex flex-col">
                      <div className="flex-1 relative mb-6">
                         <div className="absolute top-4 left-4 z-10 text-slate-500">
                            <Command size={16} />
                         </div>
                         <textarea 
                           value={data.intent}
                           onChange={(e) => setData(prev => ({...prev, intent: e.target.value}))}
                           placeholder="例如：我需要重构登录组件以使用新的 useAuth 钩子，并为验证逻辑添加单元测试。"
                           className="w-full h-full bg-[#0f1117] border border-white/10 rounded-xl p-4 pl-10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none leading-relaxed transition-all shadow-inner"
                           autoFocus
                         />
                         
                         {/* Suggestion Chips */}
                         <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                            {['Refactor Component', 'Generate Tests', 'Explain Architecture', 'Add Feature'].map(chip => (
                              <button 
                                key={chip}
                                onClick={() => setData(prev => ({...prev, intent: prev.intent + (prev.intent ? '\n' : '') + chip + ': '}))}
                                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[10px] text-slate-400 hover:text-white transition-colors"
                              >
                                 {chip}
                              </button>
                            ))}
                         </div>
                      </div>

                      <div className="flex justify-between items-center mt-auto">
                         <button onClick={prevStep} className="text-slate-500 hover:text-white text-sm font-medium flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                         <button 
                           onClick={() => onLaunch(data)}
                           className="group relative px-8 py-3 bg-white text-black rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 transition-all flex items-center gap-2 overflow-hidden"
                         >
                            <span className="relative z-10 flex items-center gap-2">
                              Initialize & Execute <PlayCircle size={16} fill="currentColor" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                         </button>
                      </div>
                   </div>
                </div>
             )}

          </div>
       </div>
    </div>
  );
};
