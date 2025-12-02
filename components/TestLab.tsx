
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCw, CheckCircle2, XCircle, AlertCircle, 
  Terminal, Monitor, Clock, Filter, ChevronRight,
  MoreHorizontal, Video, Bug, Layout, FileText, Link,
  MousePointer2, Network, Braces, Eye, Check, X,
  ChevronDown, FastForward, Rewind, Layers, RefreshCw,
  ArrowRight, CreditCard, Shield, User, Image as ImageIcon,
  Code, List, Globe, Zap, Split, GitCommit, CornerDownRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from './ui/layout';
import { Badge } from './ui/core';

// --- Types & Enhanced Mock Data ---

type StepStatus = 'pending' | 'running' | 'passed' | 'failed';
type GherkinType = 'GIVEN' | 'WHEN' | 'THEN' | 'AND';

interface TestStep {
  id: string;
  action: string; // e.g. "locator.click"
  selector?: string; // e.g. "button#submit"
  value?: string; // e.g. "user@example.com"
  duration: string;
  status: StepStatus;
  timestamp: string;
  error?: string;
  network?: { method: string; url: string; status: number }[];
  console?: { type: 'log' | 'error' | 'warn'; msg: string }[];
  line?: number;
}

interface TestPhase {
  id: string;
  type: GherkinType;
  description: string;
  steps: TestStep[];
}

interface Scenario {
  id: string;
  title: string;
  description: string; // Natural language description
  tags: string[];
  prdRef: string;
  status: 'passed' | 'failed' | 'idle' | 'running';
  phases: TestPhase[];
}

interface Feature {
  id: string;
  title: string;
  scenarios: Scenario[];
}

const MOCK_FEATURES: Feature[] = [
  {
    id: 'feat_sys',
    title: 'User Management',
    scenarios: [
      {
        id: 'sc_1',
        title: 'Create New User Success',
        description: '管理员应能成功创建新用户，且列表自动刷新包含新数据。',
        tags: ['P0', 'System', 'Smoke'],
        prdRef: 'SYS-2.1',
        status: 'passed',
        phases: [
          {
            id: 'ph_1',
            type: 'GIVEN',
            description: '管理员进入用户管理页面',
            steps: [
              { id: 's1', action: 'page.goto', value: '/system/user', duration: '450ms', status: 'passed', timestamp: '00:00.00', network: [{ method: 'GET', url: '/system/user/list', status: 200 }], line: 12 },
              { id: 's2', action: 'expect.toBeVisible', selector: 'button.add-btn', duration: '50ms', status: 'passed', timestamp: '00:00.45', line: 13 }
            ]
          },
          {
            id: 'ph_2',
            type: 'WHEN',
            description: '填写用户信息并提交',
            steps: [
              { id: 's3', action: 'locator.click', selector: 'button.add-btn', duration: '120ms', status: 'passed', timestamp: '00:00.50', line: 15 },
              { id: 's4', action: 'locator.fill', selector: 'input[name="userName"]', value: 'test_user', duration: '80ms', status: 'passed', timestamp: '00:00.62', line: 16 },
              { id: 's5', action: 'locator.click', selector: 'button.submit-btn', duration: '150ms', status: 'passed', timestamp: '00:00.80', network: [{ method: 'POST', url: '/system/user', status: 200 }], line: 18 }
            ]
          },
          {
            id: 'ph_3',
            type: 'THEN',
            description: '提示成功并刷新表格',
            steps: [
              { id: 's6', action: 'expect.toBeVisible', selector: '.el-message--success', value: '操作成功', duration: '200ms', status: 'passed', timestamp: '00:01.00', line: 20 }
            ]
          }
        ]
      },
      {
        id: 'sc_2',
        title: 'Duplicate Username Check',
        description: '新增用户时，若用户名已存在，后端应返回错误，且前端展示提示。',
        tags: ['Validation', 'Negative'],
        prdRef: 'SYS-2.1.3',
        status: 'failed',
        phases: [
          {
            id: 'ph_2_1',
            type: 'GIVEN',
            description: '管理员打开新增弹窗',
            steps: [
               { id: 's_2_1', action: 'page.goto', value: '/system/user', duration: '420ms', status: 'passed', timestamp: '00:00.00', line: 45 }
            ]
          },
          {
            id: 'ph_2_2',
            type: 'WHEN',
            description: '输入已存在的用户名 "admin"',
            steps: [
              { id: 's_2_2', action: 'locator.fill', selector: 'input[name="userName"]', value: 'admin', duration: '100ms', status: 'passed', timestamp: '00:00.42', line: 46 },
              { id: 's_2_3', action: 'locator.blur', selector: 'input[name="userName"]', duration: '85ms', status: 'passed', timestamp: '00:00.52', console: [{ type: 'log', msg: 'Blur event triggered' }], line: 48 },
            ]
          },
          {
            id: 'ph_2_3',
            type: 'THEN',
            description: '应显示错误提示',
            steps: [
              { id: 's_2_6', action: 'expect.toHaveText', selector: '.input-error', value: '登录账号已存在', duration: '5000ms', status: 'failed', timestamp: '00:02.40', error: 'TimeoutError: Element not visible', line: 60 }
            ] 
          }
        ]
      }
    ]
  },
  {
    id: 'feat_role',
    title: 'Role Management',
    scenarios: []
  }
];

// --- Helper Components ---

const StatusIcon = ({ status, size = 14 }: { status: string, size?: number }) => {
  if (status === 'passed') return <CheckCircle2 size={size} className="text-emerald-500" />;
  if (status === 'failed') return <XCircle size={size} className="text-red-500" />;
  if (status === 'running') return <RotateCw size={size} className="text-indigo-500 animate-spin" />;
  return <div className={`w-3 h-3 rounded-full border-2 border-slate-700 bg-transparent`} />;
};

const GherkinBadge = ({ type }: { type: GherkinType }) => {
  const styles = {
    GIVEN: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    WHEN: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    THEN: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    AND: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  };
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border tracking-wider", styles[type])}>
      {type}
    </span>
  );
};

const ActionBadge = ({ action }: { action: string }) => {
  let colorClass = "text-slate-500";
  let label = action.replace('locator.', '').replace('page.', '').replace('expect.', '');

  if (action.includes('click')) colorClass = "text-blue-400";
  else if (action.includes('fill')) colorClass = "text-purple-400";
  else if (action.includes('goto')) colorClass = "text-amber-400";
  else if (action.includes('expect')) {
    colorClass = "text-green-400";
    label = "ASSERT";
  }

  return (
    <span className={cn("text-[10px] font-mono uppercase font-bold", colorClass)}>
      {label}
    </span>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold border-b-2 transition-all",
      active 
        ? "border-indigo-500 text-white bg-indigo-500/5" 
        : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
    )}
  >
    <Icon size={14} />
    {label}
  </button>
);

export const TestLab: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>(MOCK_FEATURES);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('sc_1');
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'snapshot' | 'source' | 'network' | 'console'>('snapshot');

  // Derived state
  const activeScenario = features.flatMap(f => f.scenarios).find(s => s.id === activeScenarioId);
  const allSteps = activeScenario?.phases.flatMap(p => p.steps) || [];
  const activeStep = allSteps.find(s => s.id === activeStepId) || allSteps[0];

  const handleScenarioSelect = (id: string) => {
    setActiveScenarioId(id);
    const scenario = features.flatMap(f => f.scenarios).find(s => s.id === id);
    if (scenario && scenario.phases.length > 0 && scenario.phases[0].steps.length > 0) {
       setActiveStepId(scenario.phases[0].steps[0].id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#09090b] font-sans overflow-hidden">
      
      {/* Header */}
      <div className="h-14 bg-[#0f1117] border-b border-border flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bug size={16} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Acceptance Lab</h1>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[10px] text-slate-500 flex items-center gap-1">
                   <Layers size={10} /> Suite: <span className="text-slate-300">E2E Regression</span>
                 </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d24] border border-white/5 text-xs text-slate-400">
              <Clock size={12} /> Total Time: <span className="text-white font-mono">14.2s</span>
           </div>
           <button className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all">
              <Play size={12} fill="currentColor" /> Run All
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* --- LEFT SIDEBAR: SCENARIOS --- */}
        <div className="w-72 border-r border-border bg-[#0f1117] flex flex-col shrink-0">
           <div className="p-3 border-b border-border bg-[#15171c]/50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scenarios</span>
              <button className="text-slate-500 hover:text-white"><Filter size={14} /></button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 space-y-6">
              {features.map(feature => (
                 <div key={feature.id}>
                    <div className="flex items-center gap-2 px-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                       {feature.title}
                    </div>
                    <div className="space-y-0.5">
                       {feature.scenarios.map(scenario => (
                          <button
                            key={scenario.id}
                            onClick={() => handleScenarioSelect(scenario.id)}
                            className={cn(
                               "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all border group relative",
                               activeScenarioId === scenario.id 
                                  ? "bg-[#1a1d24] border-white/10 shadow-sm" 
                                  : "border-transparent hover:bg-white/5"
                            )}
                          >
                             <div className="mt-0.5"><StatusIcon status={scenario.status} size={14} /></div>
                             <div className="flex-1 min-w-0">
                                <div className={cn("text-xs font-bold truncate mb-1", activeScenarioId === scenario.id ? "text-white" : "text-slate-400 group-hover:text-slate-300")}>
                                   {scenario.title}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                   {scenario.tags.map(tag => (
                                     <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-500 border border-white/5">
                                       {tag}
                                     </span>
                                   ))}
                                </div>
                             </div>
                             {activeScenarioId === scenario.id && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-lg"></div>
                             )}
                          </button>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* --- CENTER: SCENARIO DEFINITION & TRACE --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#09090b] border-r border-border relative">
           
           {activeScenario ? (
             <div className="flex-1 overflow-y-auto">
                {/* 1. TEST DEFINITION CARD (The "Script") */}
                <div className="p-8 pb-4">
                   <div className="max-w-3xl mx-auto">
                      <div className="bg-gradient-to-br from-[#1a1d24] to-[#15171c] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
                         
                         <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">{activeScenario.prdRef}</Badge>
                                  <StatusIcon status={activeScenario.status} size={18} />
                               </div>
                               <div className="flex gap-2">
                                  <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><GitCommit size={16} /></button>
                                  <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><Link size={16} /></button>
                               </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">{activeScenario.title}</h2>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-2xl">
                               {activeScenario.description}
                            </p>

                            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium border-t border-white/5 pt-4">
                               <div className="flex items-center gap-2">
                                  <User size={14} /> Created by QA-Bot
                               </div>
                               <div className="flex items-center gap-2">
                                  <Clock size={14} /> Last run: 2m ago
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 2. EXECUTION FLOW (Grouped by Phases) */}
                <div className="p-8 pt-0">
                   <div className="max-w-3xl mx-auto space-y-6">
                      
                      {/* Section Header */}
                      <div className="flex items-center gap-4 py-4">
                         <div className="h-px bg-white/10 flex-1"></div>
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-[#09090b] px-2">Execution Trace</span>
                         <div className="h-px bg-white/10 flex-1"></div>
                      </div>

                      {activeScenario.phases.map((phase, pIdx) => (
                         <div key={phase.id} className="relative pl-4">
                            {/* Vertical Connector Line */}
                            {pIdx !== activeScenario.phases.length - 1 && (
                               <div className="absolute left-[27px] top-8 bottom-[-24px] w-px bg-slate-800 border-l border-dashed border-slate-700"></div>
                            )}

                            {/* Phase Header (The Gherkin Logic) */}
                            <div className="flex items-start gap-4 mb-3 group">
                               <div className="mt-0.5 relative z-10 bg-[#09090b]">
                                  <GherkinBadge type={phase.type} />
                               </div>
                               <div className="flex-1 pt-1">
                                  <h3 className="text-sm font-medium text-slate-200">{phase.description}</h3>
                               </div>
                            </div>

                            {/* Steps Container */}
                            <div className="space-y-1 ml-2">
                               {phase.steps.map((step) => (
                                  <div 
                                    key={step.id}
                                    onClick={() => setActiveStepId(step.id)}
                                    className={cn(
                                       "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ml-12 relative group/step",
                                       activeStepId === step.id 
                                          ? "bg-[#1a1d24] border-indigo-500/50 shadow-lg shadow-indigo-900/10" 
                                          : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
                                    )}
                                  >
                                     {/* Connector Elbow */}
                                     <div className="absolute -left-6 top-1/2 w-4 h-px bg-slate-800 group-hover/step:bg-slate-600 transition-colors"></div>
                                     <div className="absolute -left-6 top-0 bottom-1/2 w-px bg-slate-800 group-hover/step:bg-slate-600 transition-colors rounded-bl-full"></div>

                                     {/* Step Status */}
                                     <div className="shrink-0">
                                        <StatusIcon status={step.status} size={14} />
                                     </div>

                                     {/* Action Badge */}
                                     <div className="shrink-0 w-16 text-right">
                                        <ActionBadge action={step.action} />
                                     </div>

                                     {/* Step Details */}
                                     <div className="flex-1 min-w-0 font-mono text-xs truncate text-slate-400 group-hover/step:text-slate-300">
                                        {step.selector && <span className="text-indigo-300 mr-2">{step.selector}</span>}
                                        {step.value && <span className="text-amber-200">"{step.value}"</span>}
                                     </div>

                                     {/* Duration */}
                                     <div className="text-[10px] font-mono text-slate-600 w-12 text-right">
                                        {step.duration}
                                     </div>

                                     {/* Error Message if Failed */}
                                     {step.status === 'failed' && (
                                        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-red-950/30 border border-red-500/20 rounded text-red-300 text-xs font-mono shadow-xl z-10">
                                            <div className="flex items-center gap-2 mb-1 font-bold">
                                               <AlertCircle size={12} /> Runtime Error
                                            </div>
                                            {step.error}
                                        </div>
                                     )}
                                  </div>
                               ))}
                            </div>
                         </div>
                      ))}
                      
                      <div className="h-12"></div> {/* Bottom Spacer */}
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                <List size={48} className="opacity-20" />
                <p>Select a scenario to view its definition and trace.</p>
             </div>
           )}
        </div>

        {/* --- RIGHT SIDEBAR: INSPECTOR --- */}
        <div className="w-[420px] bg-[#0f1117] flex flex-col shrink-0 border-l border-border">
           
           {/* Inspector Tabs */}
           <div className="flex items-center border-b border-border bg-[#15171c]">
              <TabButton active={inspectorTab === 'snapshot'} onClick={() => setInspectorTab('snapshot')} icon={ImageIcon} label="Snapshot" />
              <TabButton active={inspectorTab === 'source'} onClick={() => setInspectorTab('source')} icon={Code} label="Code" />
              <TabButton active={inspectorTab === 'network'} onClick={() => setInspectorTab('network')} icon={Network} label="Network" />
              <TabButton active={inspectorTab === 'console'} onClick={() => setInspectorTab('console')} icon={Terminal} label="Console" />
           </div>

           {/* Inspector Content */}
           <div className="flex-1 overflow-y-auto bg-[#0f1117] relative">
              {activeStep ? (
                 <>
                    {/* SNAPSHOT TAB */}
                    {inspectorTab === 'snapshot' && (
                       <div className="h-full flex flex-col">
                          <div className="p-3 border-b border-white/5 bg-[#1a1d24] flex items-center justify-between">
                             <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Globe size={12} />
                                <span className="font-mono">localhost:3000{activeScenario?.phases[0].steps[0].value || '/system/user'}</span>
                             </div>
                             <div className="text-[10px] text-slate-500">1920 x 1080</div>
                          </div>
                          
                          <div className="flex-1 bg-[#09090b] relative flex items-center justify-center overflow-hidden p-6">
                             {/* Mock Screenshot Representation */}
                             <div className="relative w-full aspect-video bg-white rounded-lg shadow-2xl overflow-hidden group border border-slate-700">
                                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                                   <div className="text-center p-4">
                                      <Monitor size={48} className="mx-auto mb-3 text-slate-300" />
                                      <p className="text-xs text-slate-400 font-mono mb-2">DOM Snapshot @ {activeStep.timestamp}</p>
                                      {activeStep.selector && (
                                         <div className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded text-[10px] font-mono shadow-sm">
                                            <MousePointer2 size={10} /> Target: {activeStep.selector}
                                         </div>
                                      )}
                                   </div>
                                </div>
                                
                                {/* Error Overlay on Snapshot */}
                                {activeStep.status === 'failed' && (
                                   <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[1px]">
                                      <div className="bg-red-900/90 text-red-100 px-3 py-2 rounded text-xs font-mono border border-red-500/50 shadow-xl">
                                         TimeoutError: Element not found
                                      </div>
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    )}

                    {/* SOURCE TAB */}
                    {inspectorTab === 'source' && (
                       <div className="h-full p-4 font-mono text-xs">
                          <div className="text-slate-500 mb-2 border-b border-white/5 pb-2 flex justify-between">
                             <span>tests/system/user.spec.ts</span>
                             <span className="text-slate-600">Read-only</span>
                          </div>
                          <div className="space-y-0.5">
                             <div className="text-slate-600">10</div>
                             <div className="text-slate-600">11   test('create user success', async ({'{'} page {'}'}) => {'{'}</div>
                             {/* Mock lines relative to active step */}
                             {[12, 13, 14, 15, 16, 17, 18, 19, 20].map(lineNum => {
                                const isCurrent = activeStep.line === lineNum;
                                return (
                                   <div key={lineNum} className={cn("flex gap-4 px-1 rounded", isCurrent ? "bg-indigo-500/20 text-white" : "text-slate-400")}>
                                      <span className="text-slate-700 w-4 text-right select-none">{lineNum}</span>
                                      <span className="flex-1">
                                        {lineNum === 12 && "await page.goto('/system/user');"}
                                        {lineNum === 13 && "await expect(page.locator('.add-btn')).toBeVisible();"}
                                        {lineNum === 14 && ""}
                                        {lineNum === 15 && "await page.locator('.add-btn').click();"}
                                        {lineNum === 16 && "await page.locator('input[name=userName]').fill('test_user');"}
                                        {lineNum === 18 && "await page.locator('.submit-btn').click();"}
                                        {lineNum === 20 && "await expect(page.getByText('操作成功')).toBeVisible();"}
                                        {!([12,13,15,16,18,20].includes(lineNum)) && "// ..."}
                                      </span>
                                   </div>
                                );
                             })}
                             <div className="text-slate-600">21   {'}'});</div>
                          </div>
                       </div>
                    )}

                    {/* NETWORK TAB */}
                    {inspectorTab === 'network' && (
                       <div className="h-full flex flex-col">
                          <div className="flex border-b border-white/5 text-[10px] font-bold text-slate-500 bg-[#15171c]">
                             <div className="w-12 px-3 py-2">Stat</div>
                             <div className="w-12 px-3 py-2">Meth</div>
                             <div className="flex-1 px-3 py-2">Name</div>
                          </div>
                          <div className="flex-1 overflow-y-auto">
                             {activeStep.network ? (
                                activeStep.network.map((req, i) => (
                                   <div key={i} className="flex border-b border-white/5 text-xs font-mono hover:bg-white/5 cursor-pointer">
                                      <div className={cn("w-12 px-3 py-2 font-bold", req.status >= 400 ? "text-red-400" : "text-green-400")}>{req.status}</div>
                                      <div className={cn("w-12 px-3 py-2", req.method === 'GET' ? "text-blue-400" : "text-purple-400")}>{req.method}</div>
                                      <div className="flex-1 px-3 py-2 text-slate-300 truncate">{req.url}</div>
                                   </div>
                                ))
                             ) : (
                                <div className="p-8 text-center text-slate-600 text-xs italic">
                                   No network activity recorded for this step.
                                </div>
                             )}
                          </div>
                       </div>
                    )}

                    {/* CONSOLE TAB */}
                    {inspectorTab === 'console' && (
                       <div className="h-full p-2 font-mono text-xs space-y-1">
                          {activeStep.console ? (
                             activeStep.console.map((log, i) => (
                                <div key={i} className="flex gap-2 p-2 rounded bg-white/5 border border-white/5">
                                   <span className={cn("uppercase text-[10px]", log.type === 'error' ? "text-red-400" : "text-blue-400")}>[{log.type}]</span>
                                   <span className="text-slate-300">{log.msg}</span>
                                </div>
                             ))
                          ) : (
                             <div className="p-8 text-center text-slate-600 italic">
                                console.log is empty.
                             </div>
                          )}
                       </div>
                    )}
                 </>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                    <MousePointer2 size={32} className="opacity-20" />
                    <p className="text-xs">Select a step to inspect details.</p>
                 </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};
