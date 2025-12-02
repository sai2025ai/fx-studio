
import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Play, Minimize2, Maximize2, Cpu, Eraser, Copy, 
  Folder, ChevronRight, ChevronDown, Search, Plus, MoreHorizontal, File, X,
  GitBranch, Download, Globe, ArrowRight, Sparkles, Microscope, Zap,
  CheckCircle2, CircleDashed, LayoutTemplate, MessageSquare, Command,
  Loader2, GitPullRequest, GitCommit, Files, FileCode, AlertTriangle, LogOut,
  Smartphone, Monitor, Tablet, RotateCw, Layout, Sidebar, Columns, Bug,
  Shield, BookOpen, Link, Webhook, Paperclip, Image as ImageIcon,
  Box, Layers, Pin, FileText, LayoutGrid, Component, Puzzle, FileJson,
  MousePointer2, Crosshair, ChevronUp, Trash2, PanelBottom, ListTodo,
  Wand2, PlayCircle
} from 'lucide-react';
import { ChatMessage, LogEntry, PlanStep, ContextScope } from '../types';
import { Modal, Toast, LoadingButton, MarkdownRenderer } from './SharedUI';
import { Button, Input, Badge } from './ui/core';
import { Card } from './ui/layout';
import { BrowserPreview, DeviceType } from './workbench/BrowserPreview';
import { cn } from '../lib/utils';

// --- Types ---

interface FileNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  isOpen?: boolean;
  active?: boolean;
  fileType?: 'ts' | 'py' | 'json' | 'md' | 'css' | 'vue' | 'unknown';
  children?: FileNode[];
}

interface FileChange {
  id: string;
  path: string;
  status: 'modified' | 'added' | 'deleted';
  linesAdded: number;
  linesRemoved: number;
}

interface WorkingFile {
    id: string;
    name: string;
    path: string;
    status: 'modified' | 'added' | 'reading';
    type: 'vue' | 'ts' | 'json';
}

interface ComponentItem {
    id: string;
    name: string;
    description: string;
    props: number;
    usage: string;
    tags: string[];
}

interface AdHocContext {
  id: string;
  name: string;
  type: 'file' | 'snippet' | 'dom-ref';
  icon?: React.ElementType;
}

type ViewMode = 'code' | 'split' | 'preview';
type RightPanelTab = 'chat' | 'plan';
type TerminalTab = 'terminal' | 'problems' | 'output' | 'debug';

// --- Mock Data (B-Side Admin) ---

const initialFileSystem: FileNode[] = [
  {
    id: 'root',
    name: 'enterprise-admin',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        isOpen: true,
        children: [
          { 
            id: 'views', 
            name: 'views', 
            type: 'folder', 
            isOpen: true,
            children: [
               { 
                  id: 'system',
                  name: 'system',
                  type: 'folder',
                  isOpen: true,
                  children: [
                     { id: 'user.vue', name: 'UserIndex.vue', type: 'file', fileType: 'vue', active: true },
                     { id: 'role.vue', name: 'RoleIndex.vue', type: 'file', fileType: 'vue' },
                     { id: 'dept.vue', name: 'DeptIndex.vue', type: 'file', fileType: 'vue' }
                  ]
               },
               { id: 'Dashboard.vue', name: 'Dashboard.vue', type: 'file', fileType: 'vue' }
            ]
          },
          {
             id: 'api',
             name: 'api',
             type: 'folder',
             isOpen: false,
             children: [
                { id: 'system.ts', name: 'system.ts', type: 'file', fileType: 'ts' }
             ]
          },
          { id: 'App.vue', name: 'App.vue', type: 'file', fileType: 'vue' },
          { id: 'main.ts', name: 'main.ts', type: 'file', fileType: 'ts' },
        ]
      },
      { id: 'package.json', name: 'package.json', type: 'file', fileType: 'json' },
    ]
  }
];

const workingSet: WorkingFile[] = [
    { id: 'w1', name: 'UserIndex.vue', path: 'src/views/system/UserIndex.vue', status: 'modified', type: 'vue' },
    { id: 'w2', name: 'system.ts', path: 'src/api/system.ts', status: 'modified', type: 'ts' },
    { id: 'w3', name: 'ProTable.vue', path: 'src/components/ProTable/index.vue', status: 'reading', type: 'vue' }
];

const componentLibrary: ComponentItem[] = [
    { id: 'c1', name: 'ProTable', description: '高级数据表格，集成搜索、分页、工具栏。', props: 12, usage: '<ProTable :columns="columns" :request="api.getUserList" />', tags: ['Business', 'Table'] },
    { id: 'c2', name: 'AuthDirective', description: '权限控制指令 v-auth。', props: 1, usage: '<button v-auth="[\'sys:user:add\']">Add</button>', tags: ['Directive'] },
    { id: 'c3', name: 'DeptTree', description: '部门树形选择器。', props: 3, usage: '<DeptTree v-model="deptId" />', tags: ['Business'] },
    { id: 'c4', name: 'DictTag', description: '字典数据标签展示。', props: 2, usage: '<DictTag :options="sys_user_sex" :value="row.sex" />', tags: ['UI'] },
];

const gitChanges: FileChange[] = [
  { id: 'c1', path: 'src/views/system/UserIndex.vue', status: 'modified', linesAdded: 85, linesRemoved: 12 },
  { id: 'c2', path: 'src/api/system.ts', status: 'modified', linesAdded: 24, linesRemoved: 0 },
];

const defaultScope: ContextScope = {
  id: 'scope-admin-v1',
  name: 'V1.0 系统基础模块',
  project: 'enterprise-admin',
  items: [
    { type: 'doc', title: 'PRD: 系统管理模块 V1.0' },
    { type: 'design', title: 'System UI Prototype' },
    { type: 'api', title: 'System Management API' }
  ]
};

const initialAdHocContexts: AdHocContext[] = [
  { id: 'ah1', name: 'ProTable.vue', type: 'file' },
];

const initialPlan: PlanStep[] = [
  { id: 'p1', title: 'Define User API', description: 'Implement getUserList and saveUser in api/system.ts', status: 'completed' },
  { id: 'p2', title: 'Scaffold User View', description: 'Create layout with DeptTree and ProTable', status: 'completed' },
  { id: 'p3', title: 'Implement Search', description: 'Connect search form to ProTable request', status: 'running' },
  { id: 'p4', title: 'Add User Modal', description: 'Create dialog for adding/editing users with validation', status: 'pending' },
  { id: 'p5', title: 'Permission Check', description: 'Apply v-auth to operational buttons', status: 'pending' },
];

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'user',
    type: 'text',
    content: "请帮我完善 `UserIndex.vue` 的搜索功能，需要支持按用户名和部门筛选。",
    timestamp: '10:23'
  },
  {
    id: '2',
    sender: 'ai',
    type: 'text',
    content: "好的。我已检查 `ProTable` 组件的定义。我将在 `UserIndex.vue` 中配置 `searchColumns` 并关联 `DeptTree` 的选择事件。\n\n正在生成代码...",
    timestamp: '10:23'
  }
];

// --- Components ---

const FileIcon = ({ type, name, className }: { type: string, name: string, className?: string }) => {
  if (type === 'folder') return <Folder size={14} className={cn("text-blue-400 fill-blue-400/20", className)} />;
  if (name.endsWith('.vue')) return <LayoutTemplate size={14} className={cn("text-emerald-400", className)} />;
  if (name.endsWith('.ts')) return <FileCode size={14} className={cn("text-blue-400", className)} />;
  if (name.endsWith('.py')) return <File size={14} className={cn("text-yellow-400", className)} />;
  if (name.endsWith('.json')) return <FileJson size={14} className={cn("text-amber-400", className)} />;
  return <File size={14} className={cn("text-slate-500", className)} />;
};

// Terminal Component
const TerminalPanel = ({ 
    activeTab, 
    setActiveTab, 
    onClose,
    logs = [] // Allow injecting logs
}: { 
    activeTab: TerminalTab, 
    setActiveTab: (t: TerminalTab) => void,
    onClose: () => void,
    logs?: string[]
}) => {
    const [lines, setLines] = useState<string[]>(logs.length > 0 ? logs : [
        "> npm run dev",
        "",
        "  VITE v5.2.0  ready in 345 ms",
        "",
        "  ➜  Local:   http://localhost:5173/",
        "  ➜  Network: use --host to expose",
        "  ➜  press h + enter to show help",
        ""
    ]);
    const [inputValue, setInputValue] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
       if (logs.length > 0 && logs[0] !== lines[0]) {
           setLines(logs);
       }
    }, [logs]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [lines, activeTab]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            const cmd = inputValue.trim();
            setLines(prev => [...prev, `$ ${cmd}`]);
            setInputValue('');
            
            // Mock Responses
            setTimeout(() => {
                if (cmd === 'clear') {
                    setLines([]);
                } else if (cmd === 'npm run test') {
                    setLines(prev => [...prev, 
                        "> vitest", 
                        "",
                        " ✓ src/tests/system/user.test.ts (3 tests)",
                        " ✓ src/utils/validate.test.ts (5 tests)",
                        "",
                        " Test Files  2 passed (2)",
                        "      Tests  8 passed (8)",
                        "   Start at  10:45:22",
                        "   Duration  1.42s",
                        ""
                    ]);
                } else if (cmd) {
                     setLines(prev => [...prev, `zsh: command not found: ${cmd}`]);
                }
            }, 300);
        }
    };

    return (
        <Card className="h-64 flex flex-col border border-border bg-[#0d1117] animate-in slide-in-from-bottom-2 duration-300 shadow-2xl relative z-10">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between px-2 bg-[#15171c] border-b border-border h-9 shrink-0">
                <div className="flex items-center">
                    {[
                        { id: 'terminal', label: 'TERMINAL', icon: Terminal },
                        { id: 'problems', label: 'PROBLEMS', icon: AlertTriangle, count: 0 },
                        { id: 'output', label: 'OUTPUT', icon: Layout },
                        { id: 'debug', label: 'DEBUG CONSOLE', icon: Bug }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TerminalTab)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold border-b-2 transition-all hover:bg-white/5",
                                activeTab === tab.id 
                                    ? "text-white border-indigo-500 bg-white/5" 
                                    : "text-slate-500 border-transparent hover:text-slate-300"
                            )}
                        >
                            {/* @ts-ignore */}
                            <tab.icon size={12} />
                            {tab.label}
                            {/* @ts-ignore */}
                            {tab.count !== undefined && (
                                <span className={cn(
                                    "ml-1 px-1 rounded-full text-[9px]",
                                    // @ts-ignore
                                    tab.count > 0 ? "bg-amber-500 text-black" : "bg-slate-700 text-slate-400"
                                )}>
                                    {/* @ts-ignore */}
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1 pr-1">
                   <button className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded">
                      <Plus size={14} />
                   </button>
                   <button className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded">
                      <Trash2 size={14} />
                   </button>
                   <button className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded">
                      <ChevronUp size={14} />
                   </button>
                   <button onClick={onClose} className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded ml-1">
                      <X size={14} />
                   </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'terminal' && (
                    <div className="h-full p-3 font-mono text-xs overflow-y-auto" onClick={() => document.getElementById('term-input')?.focus()}>
                        {lines.map((line, i) => (
                            <div key={i} className={cn(
                                "whitespace-pre-wrap leading-relaxed",
                                line.startsWith('>') ? "text-slate-400" :
                                line.includes('➜') ? "text-cyan-400" :
                                line.includes('✓') ? "text-green-400" :
                                line.includes('zsh:') ? "text-red-400" :
                                line.includes('$') ? "text-white font-bold" :
                                "text-slate-300"
                            )}>
                                {line}
                            </div>
                        ))}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-green-400 font-bold">➜</span>
                            <span className="text-cyan-400 font-bold">enterprise-admin</span>
                            <span className="text-slate-500">git:(</span>
                            <span className="text-red-400 font-bold">main</span>
                            <span className="text-slate-500">)</span>
                            <div className="flex-1 relative">
                                <input 
                                    id="term-input"
                                    type="text" 
                                    className="w-full bg-transparent border-none outline-none text-white p-0 m-0 h-5"
                                    autoFocus
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </div>
                        </div>
                        <div ref={endRef} />
                    </div>
                )}
            </div>
        </Card>
    );
};

interface WorkbenchProps {
    initialScope?: ContextScope | null;
    startupIntent?: string | null;
    startupData?: {
        provider: string;
        projectType: 'git' | 'template';
        repoUrl?: string;
        templateId?: string;
        iterationName: string;
        intent: string;
    } | null;
}

export const Workbench: React.FC<WorkbenchProps> = ({ initialScope, startupIntent, startupData }) => {
  const [workspaceLoaded, setWorkspaceLoaded] = useState(true);
  const [repoUrl, setRepoUrl] = useState('https://github.com/claude-templates/vue-admin-starter.git');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  
  // Workbench UI State
  const [activeActivity, setActiveActivity] = useState<'explorer' | 'git'>('explorer');
  const [editorMode, setEditorMode] = useState<'edit' | 'diff'>('edit');
  const [viewMode, setViewMode] = useState<ViewMode>('code'); 
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('plan'); // Default to plan based on requirement
  const [isLayoutTransitioning, setIsLayoutTransitioning] = useState(false);
  
  // Terminal State
  const [showTerminal, setShowTerminal] = useState(false);
  const [activeTerminalTab, setActiveTerminalTab] = useState<TerminalTab>('terminal');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop');
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3000/system/user');
  
  // Context Scope State
  const [activeScope, setActiveScope] = useState<ContextScope>(initialScope || defaultScope);
  const [showScopeDetails, setShowScopeDetails] = useState(false);
  const [adHocContexts, setAdHocContexts] = useState<AdHocContext[]>(initialAdHocContexts);
  const [highlightedLine, setHighlightedLine] = useState<number | null>(null);

  // Plan State (New Task Orchestrator)
  const [plan, setPlan] = useState<PlanStep[]>(initialPlan);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Git State
  const [commitMessage, setCommitMessage] = useState('');
  const [isGeneratingCommit, setIsGeneratingCommit] = useState(false);

  // Modals & Toasts
  const [toast, setToast] = useState({ visible: false, message: '' });

  const scrollRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Intent Handling for Onboarding Demo
  const hasRunDemo = useRef(false);

  // --- STARTUP LOGIC ---
  useEffect(() => {
    // Legacy support for string only intent
    if (startupIntent === 'ONBOARDING_DEMO' && !hasRunDemo.current && !startupData) {
        hasRunDemo.current = true;
        setMessages([]);
        setTimeout(() => {
            const userMsg: ChatMessage = { id: `demo-user-${Date.now()}`, sender: 'user', type: 'text', content: "你好", timestamp: new Date().toLocaleTimeString() };
            setMessages(prev => [...prev, userMsg]);
        }, 600);
        setTimeout(() => {
            const aiMsg: ChatMessage = { id: `demo-ai-${Date.now()}`, sender: 'ai', type: 'text', content: "你好！我是你的 AI 编程助手。工作区已准备就绪。", timestamp: new Date().toLocaleTimeString() };
            setMessages(prev => [...prev, aiMsg]);
        }, 1600);
    }
  }, [startupIntent, startupData]);

  // RICH STARTUP DATA HANDLING
  useEffect(() => {
    if (startupData && !hasRunDemo.current) {
        hasRunDemo.current = true;
        
        // 1. Clear State
        setMessages([]);
        setPlan([]);
        setRepoUrl(startupData.repoUrl || '');
        
        // 2. Open Terminal & Show Cloning Animation
        setShowTerminal(true);
        const repoName = startupData.repoUrl ? startupData.repoUrl.split('/').pop()?.replace('.git', '') : startupData.templateId?.toLowerCase().replace(' ', '-');
        
        const cloneLogs = [
            `> git clone ${startupData.repoUrl || `git@github.com:templates/${repoName}.git`} .`,
            "Cloning into '.'...",
            "remote: Enumerating objects: 124, done.",
            "remote: Counting objects: 100% (124/124), done.",
            "remote: Compressing objects: 100% (98/98), done.",
            "Receiving objects: 100% (124/124), 2.45 MiB | 5.23 MiB/s, done.",
            "Resolving deltas: 100% (45/45), done.",
            `> cd ${repoName}`,
            `> git checkout -b "${startupData.iterationName.replace(/ /g, '-').toLowerCase()}"`,
            `Switched to a new branch '${startupData.iterationName.replace(/ /g, '-').toLowerCase()}'`
        ];

        let logIndex = 0;
        const interval = setInterval(() => {
            if (logIndex >= cloneLogs.length) {
                clearInterval(interval);
                
                // 3. Mount Context
                setActiveScope({
                    id: `scope-${Date.now()}`,
                    name: startupData.iterationName,
                    project: repoName || 'enterprise-admin',
                    items: [{ type: 'tech', title: 'Repository Context' }]
                });
                setToast({ visible: true, message: `Context switched to ${startupData.iterationName}` });

                // 4. Send User Intent
                if (startupData.intent) {
                    setTimeout(() => {
                        const userMsg: ChatMessage = { 
                            id: `user-${Date.now()}`, 
                            sender: 'user', 
                            type: 'text', 
                            content: startupData.intent, 
                            timestamp: new Date().toLocaleTimeString() 
                        };
                        setMessages(prev => [...prev, userMsg]);
                        setRightPanelTab('chat');
                    }, 500);

                    // 5. AI Reply
                    setTimeout(() => {
                         const aiMsg: ChatMessage = { 
                            id: `ai-${Date.now()}`, 
                            sender: 'ai', 
                            type: 'text', 
                            content: `I've analyzed the repository **${repoName}**. Based on your request to _"${startupData.intent}"_, I'm creating a plan to execute this task.\n\nCreating execution plan...`, 
                            timestamp: new Date().toLocaleTimeString() 
                        };
                        setMessages(prev => [...prev, aiMsg]);
                        
                        // 6. Generate Plan
                        generatePlanFromContext();
                    }, 1500);
                }
            } else {
                setTerminalLogs(prev => [...prev, cloneLogs[logIndex]]);
                logIndex++;
            }
        }, 300);
    }
  }, [startupData]);


  useEffect(() => {
    if (initialScope) {
      setActiveScope(initialScope);
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        sender: 'ai',
        type: 'text',
        content: `Context switched to **${initialScope.project} / ${initialScope.name}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [initialScope]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
      // Auto-scroll to highlighted line in the mock editor
      if (highlightedLine && editorRef.current) {
         const lineEl = editorRef.current.querySelector(`#code-line-${highlightedLine}`);
         if (lineEl) {
             lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }
      }
  }, [highlightedLine]);

  const handleViewModeChange = (mode: ViewMode) => {
    setIsLayoutTransitioning(true);
    setViewMode(mode);
    setTimeout(() => {
      setIsLayoutTransitioning(false);
    }, 500);
  };

  const handleLoadWorkspace = () => {
    if (!repoUrl) return;
    setWorkspaceLoaded(true);
  };

  const handleInspect = (details: any) => {
      if (viewMode === 'preview') handleViewModeChange('split');
      const newCtx: AdHocContext = {
          id: `dom-${Date.now()}`,
          name: `${details.file.split('/').pop()} #${details.line}`,
          type: 'dom-ref'
      };
      setAdHocContexts(prev => [...prev, newCtx]);
      setHighlightedLine(details.line);
      setToast({ visible: true, message: `Inspecting ${details.tagName} in ${details.file}` });
  };

  const removeAdHocContext = (id: string) => {
      setAdHocContexts(prev => prev.filter(c => c.id !== id));
      if (id.startsWith('dom-')) setHighlightedLine(null);
  };

  const generatePlanFromContext = () => {
    setIsGeneratingPlan(true);
    setTimeout(() => {
        setIsGeneratingPlan(false);
        setRightPanelTab('plan');
        setPlan([
             { id: 'p_new_1', title: 'Analyze Requirements', description: 'Parsing intent and scanning existing codebase structure.', status: 'completed' },
             { id: 'p_new_2', title: 'Scaffold Components', description: 'Create necessary Vue components based on template pattern.', status: 'running' },
             { id: 'p_new_3', title: 'Implement Logic', description: 'Add business logic and state management.', status: 'pending' },
             { id: 'p_new_4', title: 'Verify Changes', description: 'Run unit tests to ensure stability.', status: 'pending' },
        ]);
        setToast({ visible: true, message: 'Plan generated from active context.' });
    }, 1500);
  };

  // --- Render: Main Workbench ---
  return (
    <div className="flex h-full p-4 bg-[#09090b] overflow-hidden">
      
      {/* Sidebar */}
      <Card className={cn(
        "flex overflow-hidden shrink-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-2xl shadow-black/50 bg-transparent glass-panel",
        viewMode === 'preview' ? 'w-0 opacity-0 mr-0 border-0' : 'w-64 opacity-100 mr-4'
      )}>
         <div className="flex w-64 h-full">
            {/* Activity Bar */}
            <div className="w-12 bg-[#0f1117] border-r border-border flex flex-col items-center py-4 gap-4 shrink-0">
                <button 
                  onClick={() => setActiveActivity('explorer')}
                  className={cn("p-2 rounded-lg transition-all", activeActivity === 'explorer' ? 'text-white bg-white/10' : 'text-slate-500 hover:text-slate-300')}
                  title="Explorer"
                >
                  <Files size={20} />
                </button>
                <button 
                  onClick={() => setActiveActivity('git')}
                  className={cn("p-2 rounded-lg transition-all relative", activeActivity === 'git' ? 'text-white bg-white/10' : 'text-slate-500 hover:text-slate-300')}
                  title="Source Control"
                >
                  <GitBranch size={20} />
                  <div className="absolute top-2 right-1 w-2 h-2 bg-indigo-500 rounded-full border border-[#0f1117]"></div>
                </button>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 flex flex-col bg-[#12141a] min-w-0">
                {/* File Explorer */}
                {activeActivity === 'explorer' && (
                  <>
                    <div className="h-12 border-b border-border flex items-center px-4 bg-panel/50 shrink-0 justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                        {activeScope.project || 'enterprise-admin'}
                      </span>
                      <MoreHorizontal size={14} className="text-slate-500" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto py-2 font-mono text-xs">
                      {/* WORKING SET */}
                      <div className="px-4 py-2">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Working Set</span>
                            <span className="bg-indigo-500/20 text-indigo-300 px-1.5 rounded text-[9px] font-bold">{workingSet.length}</span>
                         </div>
                         <div className="space-y-1">
                            {workingSet.map(file => (
                               <div key={file.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 cursor-pointer group">
                                  <FileIcon type="file" name={file.name} />
                                  <span className={cn("truncate flex-1", file.status === 'modified' ? "text-amber-200" : "text-green-200")}>{file.name}</span>
                                  <span className={cn("text-[9px] px-1 rounded uppercase font-bold", 
                                      file.status === 'modified' ? "text-amber-400 bg-amber-400/10" : "text-green-400 bg-green-400/10"
                                  )}>
                                     {file.status === 'modified' ? 'M' : 'A'}
                                  </span>
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="h-px bg-white/5 mx-4 my-2"></div>

                      <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">File System</div>
                      {initialFileSystem[0].children?.map(file => (
                        <div key={file.id} className="pl-4">
                            <div className="flex items-center gap-2 py-1 text-slate-400">
                                <FileIcon type={file.type} name={file.name} />
                                <span>{file.name}</span>
                            </div>
                            {file.children?.map(child => (
                                <div key={child.id} className="pl-4">
                                    <div className="flex items-center gap-2 py-1 text-slate-400">
                                        <FileIcon type={child.type} name={child.name} />
                                        <span>{child.name}</span>
                                    </div>
                                    {child.children?.map(grandChild => (
                                        <div key={grandChild.id} className="pl-4">
                                            <div className="flex items-center gap-2 py-1 text-slate-400">
                                                <FileIcon type={grandChild.type} name={grandChild.name} />
                                                <span>{grandChild.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Git Activity */}
                {activeActivity === 'git' && (
                  <div className="flex flex-col h-full">
                     <div className="h-12 border-b border-border flex items-center px-4 bg-panel/50 shrink-0 justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-2">Source Control</span>
                    </div>
                    <div className="flex-1 overflow-y-auto py-2">
                      <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                          <span>Changes</span>
                          <span>{gitChanges.length}</span>
                      </div>
                      <div className="space-y-0.5">
                          {gitChanges.map(change => (
                            <div key={change.id} className="group px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-colors">
                              <div className="text-slate-500">
                                {change.status === 'modified' && <span className="text-amber-400 font-mono text-[10px] w-3 inline-block">M</span>}
                                {change.status === 'added' && <span className="text-green-400 font-mono text-[10px] w-3 inline-block">A</span>}
                              </div>
                              <span className="text-xs text-slate-300 truncate flex-1">{change.path}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
         </div>
      </Card>

      {/* Middle: Editor / Preview + Terminal */}
      <div className="flex-1 flex flex-col min-w-0 mr-4 h-full gap-4">
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <Card className={cn(
             "flex-1 overflow-hidden flex flex-col shadow-2xl relative transition-all duration-500 ease-in-out border-border bg-transparent glass-panel",
          )}>
            
            {/* Header */}
            <div className="h-12 bg-panel border-b border-border flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="gap-2 font-mono bg-indigo-500/10 text-indigo-200 border-indigo-500/20">
                      <LayoutTemplate size={12} /> UserIndex.vue
                  </Badge>
                  <span className="text-[10px] text-slate-500 ml-2 flex items-center gap-1">
                      <CircleDashed size={10} className="text-slate-600" />
                      Read-only
                  </span>
                </div>
                
                <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/5">
                  <button 
                    onClick={() => handleViewModeChange('code')}
                    className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", viewMode === 'code' ? 'bg-[#2b2f38] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300')}
                  >
                    <FileCode size={12} /> Code
                  </button>
                  <button 
                    onClick={() => handleViewModeChange('split')}
                    className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", viewMode === 'split' ? 'bg-[#2b2f38] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300')}
                  >
                    <Columns size={12} /> Split
                  </button>
                  <button 
                    onClick={() => handleViewModeChange('preview')}
                    className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5", viewMode === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300')}
                  >
                    <Play size={12} /> Live
                  </button>
                  
                  <div className="w-px h-4 bg-white/10 mx-2"></div>
                  
                  <button
                    onClick={() => setShowTerminal(!showTerminal)}
                    className={cn(
                        "px-2 py-1.5 rounded-md transition-all text-slate-500 hover:text-white relative",
                        showTerminal && "bg-white/10 text-white"
                    )}
                    title="Toggle Terminal"
                  >
                     <PanelBottom size={14} />
                     {!showTerminal && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full border border-black"></div>}
                  </button>
                </div>
            </div>

            {/* Workspace Area */}
            <div className="flex-1 flex relative overflow-hidden">
                {/* Code Editor */}
                <div className={cn(
                    "bg-[#0d1117] flex flex-col relative border-r border-border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    viewMode === 'split' ? 'w-1/2 opacity-100' : viewMode === 'code' ? 'w-full opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
                  )}
                >
                    <div ref={editorRef} className="flex-1 p-6 font-mono text-sm text-slate-300 overflow-y-auto min-w-[500px]">
                        <div className="space-y-1">
                          <div className="text-slate-500 mb-4"># src/views/system/UserIndex.vue</div>
                          <div><span className="text-blue-400">{'<script setup lang="ts">'}</span></div>
                          <div><span className="text-purple-400">import</span> {'{'} ref, onMounted {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'vue'</span>;</div>
                          <div><span className="text-purple-400">import</span> {'{'} ProTable, ProTableInstance {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'@/components/ProTable'</span>;</div>
                          <div><span className="text-purple-400">import</span> {'{'} getUserList {'}'} <span className="text-purple-400">from</span> <span className="text-green-400">'@/api/system'</span>;</div>
                          <br/>
                          <div><span className="text-blue-400">const</span> tableRef = ref{'<'}<span className="text-yellow-300">ProTableInstance</span>{'>'}();</div>
                          <div><span className="text-blue-400">const</span> columns = [</div>
                          <div>&nbsp;&nbsp;{'{'} prop: <span className="text-green-400">'userName'</span>, label: <span className="text-green-400">'用户名'</span>, search: <span className="text-yellow-400">true</span> {'}'},</div>
                          <div>&nbsp;&nbsp;{'{'} prop: <span className="text-green-400">'nickName'</span>, label: <span className="text-green-400">'昵称'</span> {'}'},</div>
                          <div>&nbsp;&nbsp;{'{'} prop: <span className="text-green-400">'status'</span>, label: <span className="text-green-400">'状态'</span>, enum: sys_user_status {'}'},</div>
                          <div>];</div>
                          <br/>
                          <div><span className="text-blue-400">{'</script>'}</span></div>
                          <br/>
                          <div><span className="text-blue-400">{'<template>'}</span></div>
                          <div>&nbsp;&nbsp;{'<'}<span className="text-green-400">div</span> <span className="text-indigo-300">class</span>=<span className="text-amber-300">"main-box"</span>{'>'}</div>
                          <div>&nbsp;&nbsp;&nbsp;&nbsp;{'<'}<span className="text-green-400">DeptTree</span> <span className="text-indigo-300">class</span>=<span className="text-amber-300">"w-[220px]"</span> <span className="text-indigo-300">@select</span>=<span className="text-amber-300">"onDeptSelect"</span> /{' >'}</div>
                          <div id="code-line-24" className={highlightedLine === 24 ? "bg-indigo-500/20 -mx-6 px-6 border-l-2 border-indigo-500 transition-colors duration-300" : ""}>
                              &nbsp;&nbsp;&nbsp;&nbsp;{'<'}<span className="text-green-400">ProTable</span> <span className="text-indigo-300">ref</span>=<span className="text-amber-300">"tableRef"</span> :request=<span className="text-amber-300">"getUserList"</span> ... /{' >'}
                          </div>
                          <div>&nbsp;&nbsp;{'</'}<span className="text-green-400">div</span>{'>'}</div>
                          <div><span className="text-blue-400">{'</template>'}</span></div>
                        </div>
                    </div>
                </div>

                {/* Preview Pane */}
                <div className={cn(
                  "flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  viewMode === 'code' ? 'w-0 opacity-0 overflow-hidden flex-none' : 'w-full opacity-100'
                )}>
                  <BrowserPreview 
                    device={previewDevice} 
                    setDevice={setPreviewDevice}
                    url={previewUrl}
                    setUrl={setPreviewUrl}
                    isTransitioning={isLayoutTransitioning}
                    onInspectElement={handleInspect}
                  />
                </div>
            </div>
          </Card>
        </div>

        {/* TERMINAL PANEL */}
        {showTerminal && (
          <div className="shrink-0 animate-in slide-in-from-bottom-5 fade-in duration-300">
             <TerminalPanel 
                activeTab={activeTerminalTab} 
                setActiveTab={setActiveTerminalTab} 
                onClose={() => setShowTerminal(false)} 
                logs={terminalLogs}
             />
          </div>
        )}
        
      </div>

      {/* Right Panel: Task Orchestrator / Chat / Components */}
      <Card className="w-[380px] flex flex-col shadow-2xl border-l border-white/5 shrink-0 overflow-hidden bg-[#1a1d24]">
         
         {/* Navigation Tabs - Redesigned to support Plan */}
         <div className="h-12 border-b border-white/5 flex items-center justify-between px-2 bg-[#15171c] shrink-0 z-10">
           <div className="flex bg-[#0d1117] p-1 rounded-lg border border-white/5 w-full">
              <button 
                onClick={() => setRightPanelTab('plan')}
                className={cn("flex-1 flex items-center justify-center gap-2 py-1 rounded text-xs font-bold transition-all", rightPanelTab === 'plan' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300')}
              >
                 <ListTodo size={12} /> Plan
              </button>
              <button 
                onClick={() => setRightPanelTab('chat')}
                className={cn("flex-1 flex items-center justify-center gap-2 py-1 rounded text-xs font-bold transition-all", rightPanelTab === 'chat' ? 'bg-[#22252b] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300')}
              >
                 <Command size={12} /> Chat
              </button>
           </div>
         </div>

         {/* Context Scope Bar (Persistent) */}
         <div className="relative z-20 bg-[#12141a] border-b border-white/5 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2">
                <button
                    onClick={() => setShowScopeDetails(!showScopeDetails)}
                    className={cn(
                        "flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border transition-all duration-300 group shrink-0",
                        showScopeDetails
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/40"
                    )}
                >
                    <Box size={12} className={showScopeDetails ? "text-indigo-200" : "text-indigo-400"} />
                    <span className="text-[10px] font-bold tracking-wide flex flex-col items-start leading-none">
                        <span className="text-[8px] opacity-70 font-normal mb-0.5 uppercase tracking-wider">{activeScope.project}</span>
                        {activeScope.name}
                    </span>
                    <ChevronDown size={10} className={cn("ml-1 opacity-50 transition-transform duration-300", showScopeDetails ? "rotate-180" : "")} />
                </button>
                <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />
                <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide mask-gradient-right">
                   {adHocContexts.map(ctx => (
                      <div key={ctx.id} className={cn("flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] whitespace-nowrap cursor-default transition-colors", ctx.type === 'dom-ref' ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-200" : "bg-[#1a1d24] border-white/5 text-slate-300 hover:border-white/20")}>
                         {ctx.type === 'dom-ref' ? <Crosshair size={8} className="text-indigo-400" /> : <Pin size={8} className="text-slate-500" />}
                         <span className="font-mono">{ctx.name}</span>
                         {ctx.type === 'dom-ref' && <button onClick={() => removeAdHocContext(ctx.id)} className="ml-1 hover:text-white"><X size={8} /></button>}
                      </div>
                   ))}
                </div>
            </div>
         </div>

         {/* --- PLAN PANEL (TASK ORCHESTRATOR) --- */}
         {rightPanelTab === 'plan' && (
           <div className="flex-1 flex flex-col overflow-hidden bg-[#12141a] animate-in slide-in-from-right-2">
              <div className="p-4 border-b border-white/5 bg-[#15171c]/50 flex justify-between items-center">
                 <div>
                    <h3 className="text-sm font-bold text-white">Execution Plan</h3>
                    <p className="text-[10px] text-slate-400">Generated from {activeScope.name}</p>
                 </div>
                 <button 
                   onClick={generatePlanFromContext}
                   className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20"
                   title="Regenerate Plan"
                 >
                    {isGeneratingPlan ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {plan.length > 0 ? plan.map((step, index) => (
                    <div 
                      key={step.id} 
                      className={cn(
                        "relative p-3 rounded-xl border transition-all duration-300 group",
                        step.status === 'completed' ? "bg-[#1a1d24] border-white/5 opacity-60" :
                        step.status === 'running' ? "bg-indigo-900/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" :
                        "bg-[#1a1d24] border-white/5 hover:border-white/10"
                      )}
                    >
                       {/* Connection Line */}
                       {index < plan.length - 1 && (
                          <div className={cn(
                             "absolute left-[19px] top-[40px] bottom-[-14px] w-0.5",
                             step.status === 'completed' ? "bg-indigo-500/20" : "bg-white/5"
                          )}></div>
                       )}

                       <div className="flex items-start gap-3">
                          <div className={cn(
                             "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border",
                             step.status === 'completed' ? "bg-green-500 border-green-500 text-white" :
                             step.status === 'running' ? "bg-indigo-500 border-indigo-500 text-white animate-pulse" :
                             "bg-[#0d1117] border-slate-600 text-slate-500"
                          )}>
                             {step.status === 'completed' ? <CheckCircle2 size={12} /> :
                              step.status === 'running' ? <Loader2 size={12} className="animate-spin" /> :
                              <span className="text-[9px] font-bold">{index + 1}</span>}
                          </div>
                          <div className="flex-1">
                             <div className="flex justify-between items-start">
                                <h4 className={cn("text-xs font-bold mb-1", step.status === 'completed' ? "text-slate-400 line-through" : "text-slate-200")}>{step.title}</h4>
                                {step.status !== 'running' && step.status !== 'completed' && (
                                   <button className="text-[10px] flex items-center gap-1 text-indigo-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                                      <PlayCircle size={12} /> Execute
                                   </button>
                                )}
                             </div>
                             <p className="text-[10px] text-slate-500 leading-relaxed mb-2">{step.description}</p>
                             
                             {/* Context references if any */}
                             <div className="flex flex-wrap gap-1.5">
                                <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-slate-500 border border-white/5">PRD Sec 2.1</span>
                                <span className="text-[9px] px-1.5 py-0.5 bg-white/5 rounded text-slate-500 border border-white/5">User API</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 )) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <ListTodo size={48} className="opacity-20 mb-4" />
                        <p>No active plan.</p>
                        <button onClick={generatePlanFromContext} className="mt-4 text-indigo-400 hover:text-indigo-300 text-xs">Generate from Context</button>
                    </div>
                 )}

                 {/* Add Task Button */}
                 {plan.length > 0 && (
                     <button className="w-full py-3 border border-dashed border-white/10 rounded-xl text-xs text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                        <Plus size={14} /> Add Manual Step
                     </button>
                 )}
              </div>
           </div>
         )}

         {/* --- CHAT PANEL --- */}
         {rightPanelTab === 'chat' && (
           <>
             <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth relative z-0">
                {messages.length > 0 ? messages.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-300", msg.sender === 'user' ? 'items-end' : 'items-start')}>
                    <div className={cn("px-4 py-2.5 rounded-2xl text-xs leading-relaxed max-w-[90%] shadow-sm", 
                      msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-[#22252b] border border-border text-slate-200 rounded-tl-sm'
                    )}>
                      <MarkdownRenderer content={msg.content} />
                    </div>
                    <span className="text-[9px] text-slate-600 px-1">{msg.timestamp}</span>
                  </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <MessageSquare size={48} className="opacity-20 mb-4" />
                        <p className="text-xs">Waiting for messages...</p>
                    </div>
                )}
             </div>
             <div className="p-4 bg-[#15171c] border-t border-white/5 shrink-0 relative z-10">
                {adHocContexts.filter(c => c.type === 'dom-ref').length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2 px-1 animate-in slide-in-from-bottom-2 fade-in">
                        {adHocContexts.filter(c => c.type === 'dom-ref').map(ctx => (
                            <div key={ctx.id} className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full border border-indigo-500/30">
                                <Crosshair size={10} /> <span className="font-mono">{ctx.name}</span>
                                <button onClick={() => removeAdHocContext(ctx.id)} className="ml-1 text-indigo-400 hover:text-white"><X size={10}/></button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="relative bg-[#0d1117] rounded-lg flex items-center">
                  <textarea 
                    className="w-full bg-transparent border-none rounded-lg pl-4 pr-12 py-3 text-xs text-white focus:outline-none resize-none h-12 max-h-32 min-h-[3rem]"
                    placeholder="Give instructions..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <Button size="icon" className="absolute right-2 h-8 w-8"><ArrowRight size={14} /></Button>
                </div>
             </div>
           </>
         )}
      </Card>
      
      {/* Toast */}
      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
    </div>
  );
};
