
import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeProps,
  Handle,
  Position,
  MarkerType,
  Panel,
  NodeMouseHandler,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance
} from 'reactflow';
import { 
  Settings, Play, Zap, Database, Code, Globe, FileText, 
  MoreHorizontal, X, Braces, 
  ArrowRight, Plus, Save, MousePointer2,
  Layout, Move, Trash2, Terminal, Sparkles,
  CheckCircle2, AlertCircle, Clock, ChevronRight, 
  FileCode, ListChecks, ScrollText, MonitorPlay,
  Loader2
} from 'lucide-react';
import { MarkdownRenderer } from './SharedUI';

// --- Types ---

type NodeType = 'start' | 'llm' | 'agent' | 'end' | 'tool';

interface NodeData {
  label: string;
  type: NodeType;
  iconType: string;
  description?: string;
  status?: 'idle' | 'running' | 'completed' | 'error';
  config?: {
    model?: string;
    temperature?: number;
    systemPrompt?: string;
    code?: string;
  };
}

interface ExecutionResult {
  nodeId: string;
  nodeLabel: string;
  status: 'success' | 'error';
  duration: string;
  timestamp: string;
  outputType: 'markdown' | 'diff' | 'test-report' | 'json';
  data: any;
}

// --- Mock Data for Results ---

const MOCK_PRD_MARKDOWN = `
# Feature Requirement: Magic Link Authentication

## 1. Overview
Implement a passwordless login flow using email-based magic links.

## 2. User Flow
1. User enters email on login page.
2. System sends an email with a signed JWT link.
3. User clicks link -> redirected to dashboard.

## 3. Technical Specs
- **Token Expiry**: 15 minutes
- **Rate Limit**: 3 requests / minute
- **Security**: One-time use tokens
`;

const MOCK_DEV_TASKS = [
  { id: 1, title: 'Create database schema for auth_tokens', status: 'completed' },
  { id: 2, title: 'Implement API POST /auth/magic-link', status: 'completed' },
  { id: 3, title: 'Implement API GET /auth/verify', status: 'completed' },
  { id: 4, title: 'Update frontend login form', status: 'pending' },
];

const MOCK_TEST_RESULTS = {
  passed: 12,
  failed: 1,
  duration: '4.2s',
  cases: [
    { name: 'should send email with valid token', status: 'pass', duration: '800ms' },
    { name: 'should reject expired tokens', status: 'pass', duration: '120ms' },
    { name: 'should create new user if not exists', status: 'pass', duration: '450ms' },
    { name: 'should handle rate limiting', status: 'fail', duration: '200ms', error: 'Expected 429, got 200' },
  ],
  logs: [
    '[INFO] Starting Playwright worker...',
    '[INFO] Browser launched (headless: true)',
    '[TEST] GET /auth/verify?token=invalid -> 401 OK',
    '[ERROR] Rate limit check failed.'
  ]
};

// --- Custom Node Component ---

const iconMap: Record<string, React.ElementType> = {
  zap: Zap,
  database: Database,
  code: Code,
  globe: Globe,
  fileText: FileText,
  braces: Braces,
  terminal: Terminal,
  sparkles: Sparkles,
  monitor: MonitorPlay,
  user: ScrollText
};

const nodeStyles: Record<NodeType, { border: string, header: string, iconBg: string, text: string }> = {
  start: { 
    border: 'hover:border-pink-500/50', 
    header: 'bg-gradient-to-r from-pink-500/20 to-transparent', 
    iconBg: 'bg-pink-500', 
    text: 'text-pink-400' 
  },
  llm: { 
    border: 'hover:border-indigo-500/50', 
    header: 'bg-gradient-to-r from-indigo-500/20 to-transparent', 
    iconBg: 'bg-indigo-500', 
    text: 'text-indigo-400' 
  },
  agent: { 
    border: 'hover:border-amber-500/50', 
    header: 'bg-gradient-to-r from-amber-500/20 to-transparent', 
    iconBg: 'bg-amber-500', 
    text: 'text-amber-400' 
  },
  tool: { 
    border: 'hover:border-cyan-500/50', 
    header: 'bg-gradient-to-r from-cyan-500/20 to-transparent', 
    iconBg: 'bg-cyan-500', 
    text: 'text-cyan-400' 
  },
  end: { 
    border: 'hover:border-emerald-500/50', 
    header: 'bg-gradient-to-r from-emerald-500/20 to-transparent', 
    iconBg: 'bg-emerald-500', 
    text: 'text-emerald-400' 
  },
};

const CustomNode = ({ data, selected }: NodeProps<NodeData>) => {
  const Icon = iconMap[data.iconType] || Database;
  const style = nodeStyles[data.type] || nodeStyles.llm;
  
  return (
    <div className={`w-72 bg-[#1e2128] rounded-xl border-2 transition-all duration-300 shadow-xl relative group ${
      selected ? 'border-indigo-500 shadow-indigo-500/20' : 
      data.status === 'running' ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]' :
      data.status === 'completed' ? 'border-green-500/50' :
      `border-[#2d313a] ${style.border}`
    }`}>
      
      {/* Running Active State Animation */}
      {data.status === 'running' && (
        <div className="absolute -inset-[3px] rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-40 blur-md animate-pulse -z-10"></div>
      )}

      <div className="relative z-10 bg-[#1e2128] rounded-xl overflow-hidden">
        {/* Handles */}
        {data.type !== 'start' && (
          <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[#2d313a] !border-2 !border-slate-500 hover:!bg-indigo-500 hover:!border-indigo-300 transition-colors" />
        )}
        {data.type !== 'end' && (
          <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#2d313a] !border-2 !border-slate-500 hover:!bg-indigo-500 hover:!border-indigo-300 transition-colors" />
        )}

        {/* Header */}
        <div className={`px-4 py-3 flex justify-between items-center border-b border-white/5 ${style.header}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center shadow-sm relative`}>
              {data.status === 'running' ? (
                <Loader2 size={16} className="text-white animate-spin" />
              ) : (
                <Icon size={16} className="text-white" />
              )}
              {data.status === 'completed' && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border border-[#1e2128]">
                  <CheckCircle2 size={10} className="text-white" />
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white leading-tight truncate max-w-[140px]">{data.label}</div>
              <div className={`text-[10px] font-medium opacity-80 uppercase tracking-wider ${style.text}`}>{data.type}</div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
             {data.status === 'running' && (
               <span className="text-[10px] text-indigo-300 font-mono animate-pulse">Running...</span>
             )}
             <MoreHorizontal size={16} className="text-slate-500 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="text-xs text-slate-400 leading-relaxed bg-black/20 p-2 rounded border border-white/5 min-h-[40px]">
            {data.description || "No configuration set."}
          </div>
          
          {data.type === 'llm' && (
            <div className="flex flex-col gap-1 text-[10px] font-mono">
               <div className="flex justify-between text-slate-500 border-b border-white/5 pb-1">
                  <span>MODEL</span>
                  <span className="text-indigo-300">{data.config?.model || 'claude-3-5-sonnet'}</span>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// --- Renderers for the Results Panel ---

const CodeDiffRenderer = ({ tasks }: { tasks: typeof MOCK_DEV_TASKS }) => (
  <div className="space-y-4">
    <div className="bg-[#0d1117] rounded-lg border border-border overflow-hidden">
       <div className="flex items-center gap-2 px-4 py-2 bg-[#15171c] border-b border-border">
          <ListChecks size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-slate-300 uppercase">Execution Plan</span>
       </div>
       <div className="p-2 space-y-1">
         {tasks.map(task => (
           <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded">
             {task.status === 'completed' ? (
               <CheckCircle2 size={14} className="text-green-500 shrink-0" />
             ) : (
               <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 shrink-0"></div>
             )}
             <span className={`text-xs ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
               {task.title}
             </span>
           </div>
         ))}
       </div>
    </div>

    <div className="bg-[#0d1117] rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-[#15171c] border-b border-border">
          <FileCode size={14} className="text-blue-400" />
          <span className="text-xs font-bold text-slate-300 uppercase">Code Diff: auth_service.py</span>
       </div>
       <div className="font-mono text-xs p-2">
          <div className="flex bg-green-900/20 text-green-100 px-2 py-0.5">+ class MagicLinkService:</div>
          <div className="flex bg-green-900/20 text-green-100 px-2 py-0.5">+     def generate_token(self, email: str):</div>
          <div className="flex bg-green-900/20 text-green-100 px-2 py-0.5">+         payload = {'{'} "sub": email, "exp": time.time() + 900 {'}'}</div>
          <div className="flex bg-green-900/20 text-green-100 px-2 py-0.5">+         return jwt.encode(payload, SECRET_KEY)</div>
          <div className="flex text-slate-500 px-2 py-0.5">  </div>
          <div className="flex text-slate-400 px-2 py-0.5">  def verify_user(self, token: str):</div>
       </div>
    </div>
  </div>
);

const TestReportRenderer = ({ results }: { results: typeof MOCK_TEST_RESULTS }) => (
  <div className="space-y-4">
     {/* Summary Cards */}
     <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0d1117] border border-green-900/30 p-3 rounded-lg flex flex-col items-center justify-center">
           <span className="text-2xl font-bold text-green-500">{results.passed}</span>
           <span className="text-[10px] text-slate-500 uppercase">Passed</span>
        </div>
        <div className="bg-[#0d1117] border border-red-900/30 p-3 rounded-lg flex flex-col items-center justify-center">
           <span className="text-2xl font-bold text-red-500">{results.failed}</span>
           <span className="text-[10px] text-slate-500 uppercase">Failed</span>
        </div>
        <div className="bg-[#0d1117] border border-border p-3 rounded-lg flex flex-col items-center justify-center">
           <span className="text-2xl font-bold text-blue-500">{results.duration}</span>
           <span className="text-[10px] text-slate-500 uppercase">Duration</span>
        </div>
     </div>

     {/* Test Cases List */}
     <div className="bg-[#0d1117] border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#15171c] border-b border-border">
           <MonitorPlay size={14} className="text-cyan-400" />
           <span className="text-xs font-bold text-slate-300 uppercase">Playwright Report</span>
        </div>
        <div className="divide-y divide-white/5">
           {results.cases.map((test, idx) => (
             <div key={idx} className="px-3 py-2 flex items-center justify-between hover:bg-white/5">
                <div className="flex items-center gap-3">
                   {test.status === 'pass' ? (
                     <CheckCircle2 size={12} className="text-green-500" />
                   ) : (
                     <X size={12} className="text-red-500" />
                   )}
                   <span className="text-xs text-slate-300">{test.name}</span>
                </div>
                <span className={`text-[10px] font-mono ${test.status === 'pass' ? 'text-slate-500' : 'text-red-400'}`}>
                  {test.duration}
                </span>
             </div>
           ))}
        </div>
     </div>

     {/* Console Logs */}
     <div className="bg-[#0d1117] border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-[#15171c] border-b border-border">
           <Terminal size={14} className="text-slate-400" />
           <span className="text-xs font-bold text-slate-300 uppercase">Console Output</span>
        </div>
        <div className="p-3 font-mono text-[10px] text-slate-400 space-y-1 max-h-32 overflow-y-auto">
           {results.logs.map((log, i) => (
             <div key={i}>{log}</div>
           ))}
        </div>
     </div>
  </div>
);

// --- Right Panel: Unified Execution & Config ---

const SidePanel = ({ 
  node, 
  executionResults, 
  onClose, 
  activeNodeId 
}: { 
  node: Node<NodeData> | null, 
  executionResults: Record<string, ExecutionResult>,
  onClose: () => void,
  activeNodeId: string | null
}) => {
  const result = node ? executionResults[node.id] : null;
  
  if (!node) return null;

  const style = nodeStyles[node.data.type] || nodeStyles.llm;

  return (
    <div className="absolute top-4 right-4 bottom-4 w-[450px] bg-[#1a1d24]/95 backdrop-blur-xl border border-border shadow-2xl shadow-black z-20 flex flex-col rounded-2xl animate-in slide-in-from-right duration-200 overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-[#15171c]">
         <div className="flex items-center gap-3">
            <div className={`w-1.5 h-8 rounded-full ${style.iconBg}`}></div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{result ? 'RUN RESULT' : 'CONFIGURATION'}</div>
              <div className="text-sm font-bold text-white">{node.data.label}</div>
            </div>
         </div>
         <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
           <X size={18} />
         </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* If currently running this node */}
        {activeNodeId === node.id && (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
             <div className="relative">
               <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <Zap size={16} className="text-indigo-400 animate-pulse" />
               </div>
             </div>
             <p className="text-sm text-slate-400 animate-pulse">Executing node logic...</p>
          </div>
        )}

        {/* If Execution Result Exists */}
        {!activeNodeId && result && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 text-xs text-slate-500 border-b border-white/5 pb-4">
               <div className="flex items-center gap-1">
                 <Clock size={12} /> {result.duration}
               </div>
               <div className="flex items-center gap-1 text-green-400">
                 <CheckCircle2 size={12} /> Success
               </div>
               <div className="ml-auto font-mono opacity-50">{result.timestamp}</div>
            </div>

            {result.outputType === 'markdown' && (
               <div className="bg-[#0d1117] rounded-lg border border-border p-4">
                 <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                    <FileText size={14} className="text-indigo-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase">PRD Output</span>
                 </div>
                 <MarkdownRenderer content={result.data} />
               </div>
            )}
            {result.outputType === 'diff' && <CodeDiffRenderer tasks={result.data.tasks} />}
            {result.outputType === 'test-report' && <TestReportRenderer results={result.data.results} />}
          </div>
        )}

        {/* If No Result & Not Running -> Show Config Mode */}
        {!activeNodeId && !result && (
           <div className="space-y-6">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-200">
                 Run the workflow to generate results for this node. Below is the static configuration.
              </div>
              
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">System Prompt</label>
                 <textarea 
                   className="w-full h-32 bg-[#12141a] border border-border rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 resize-none"
                   defaultValue={node.data.config?.systemPrompt || "You are a helpful assistant."}
                 />
              </div>

              {node.data.type === 'llm' && (
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase">Model</label>
                       <div className="mt-2 px-3 py-2 bg-[#12141a] border border-border rounded-lg text-xs text-white">
                          Claude 3.5 Sonnet
                       </div>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase">Temp</label>
                       <div className="mt-2 px-3 py-2 bg-[#12141a] border border-border rounded-lg text-xs text-white">
                          0.7
                       </div>
                    </div>
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

const initialNodes: Node<NodeData>[] = [
  {
    id: 'start-1',
    type: 'custom',
    position: { x: 50, y: 250 },
    data: { label: 'Trigger', type: 'start', iconType: 'zap', description: 'Manual Trigger' },
  },
  {
    id: 'prod-1',
    type: 'custom',
    position: { x: 350, y: 250 },
    data: { 
      label: 'Product Manager', 
      type: 'llm', 
      iconType: 'scroll', 
      description: 'Generates PRD based on user request.',
      config: { systemPrompt: 'You are an expert Product Manager...' }
    },
  },
  {
    id: 'dev-1',
    type: 'custom',
    position: { x: 750, y: 250 },
    data: { 
      label: 'Lead Developer', 
      type: 'agent', 
      iconType: 'code', 
      description: 'Plans tasks and writes code.',
      config: { systemPrompt: 'You are a senior software engineer...' }
    },
  },
  {
    id: 'qa-1',
    type: 'custom',
    position: { x: 1150, y: 250 },
    data: { 
      label: 'QA Engineer', 
      type: 'tool', 
      iconType: 'monitor', 
      description: 'Runs Playwright tests.',
      config: { code: 'npx playwright test' }
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'start-1', target: 'prod-1', animated: false, style: { stroke: '#64748b' } },
  { id: 'e2', source: 'prod-1', target: 'dev-1', animated: false, style: { stroke: '#64748b' } },
  { id: 'e3', source: 'dev-1', target: 'qa-1', animated: false, style: { stroke: '#64748b' } },
];

const WorkflowStudioContent: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [executionResults, setExecutionResults] = useState<Record<string, ExecutionResult>>({});

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#64748b', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const onNodeClick: NodeMouseHandler = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Drag & Drop Handlers
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string, iconType: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, label, iconType }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const dataStr = event.dataTransfer.getData('application/reactflow');
      if (!dataStr) return;
      
      const { nodeType, label, iconType } = JSON.parse(dataStr);

      // Use React Flow instance to convert screen coordinates to flow coordinates
      if (reactFlowInstance) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: Node<NodeData> = {
          id: `${nodeType}-${Date.now()}`,
          type: 'custom',
          position,
          data: { 
            label: `${label} ${nodes.filter(n => n.data.type === nodeType).length + 1}`, 
            type: nodeType as NodeType, 
            iconType, 
            description: 'New node configuration',
            status: 'idle'
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const handleRunWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setExecutionResults({});
    setSelectedNode(null);

    // 1. Reset all nodes to idle
    setNodes((nds) => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
    // 2. Reset all edges to default
    setEdges((eds) => eds.map(e => ({ ...e, animated: false, style: { stroke: '#64748b', strokeWidth: 2 } })));

    const sequence = ['start-1', 'prod-1', 'dev-1', 'qa-1'];
    let previousNodeId: string | null = null;

    for (const nodeId of sequence) {
      const currentNode = nodes.find(n => n.id === nodeId);
      if (!currentNode) continue;

      // Highlight Edge connecting previous -> current
      if (previousNodeId) {
        setEdges((eds) => eds.map(e => {
          if (e.source === previousNodeId && e.target === nodeId) {
             // Active Edge Style: Indigo + Animated
             return { ...e, animated: true, style: { stroke: '#6366f1', strokeWidth: 3 } };
          }
          return e;
        }));
        // Small delay for visual travel time
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      setActiveNodeId(nodeId);
      
      // Set Node Status to Running
      setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' } } : n));
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate Result (Mock)
      let resultData: any = {};
      let outputType: ExecutionResult['outputType'] = 'json';

      if (nodeId === 'prod-1') {
        outputType = 'markdown';
        resultData = MOCK_PRD_MARKDOWN;
      } else if (nodeId === 'dev-1') {
        outputType = 'diff';
        resultData = { tasks: MOCK_DEV_TASKS };
      } else if (nodeId === 'qa-1') {
        outputType = 'test-report';
        resultData = { results: MOCK_TEST_RESULTS };
      } else if (nodeId === 'start-1') {
         outputType = 'json';
         resultData = { triggeredBy: 'User Manual Action' };
      }

      const result: ExecutionResult = {
        nodeId,
        nodeLabel: currentNode?.data.label || 'Node',
        status: 'success',
        duration: (Math.random() * 2 + 0.5).toFixed(1) + 's',
        timestamp: new Date().toLocaleTimeString(),
        outputType,
        data: resultData
      };

      setExecutionResults(prev => ({ ...prev, [nodeId]: result }));

      // Set Node Status to Completed
      setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status: 'completed' } } : n));

      // Mark Edge as Completed (Green, Solid)
      if (previousNodeId) {
        const prev = previousNodeId; // capture for closure
        setEdges((eds) => eds.map(e => {
          if (e.source === prev && e.target === nodeId) {
             return { ...e, animated: false, style: { stroke: '#22c55e', strokeWidth: 2 } };
          }
          return e;
        }));
      }

      previousNodeId = nodeId;
    }

    setActiveNodeId(null);
    setIsRunning(false);
    
    // Auto-open the last node
    const lastNode = nodes.find(n => n.id === sequence[sequence.length - 1]);
    if (lastNode) setSelectedNode(lastNode);
  };

  return (
    <div className="h-full w-full flex bg-[#09090b]">
      {/* Left Toolbar (Component Library) */}
      <div className="w-16 border-r border-border bg-[#0f1117] flex flex-col items-center py-4 gap-4 z-10">
         <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg mb-2 cursor-grab active:cursor-grabbing" title="Drag components to add">
           <Plus size={20} />
         </div>
         
         <div className="flex flex-col gap-3 w-full px-2">
           <div className="w-full h-px bg-white/5 my-1"></div>
           {[
             { type: 'start', icon: Zap, color: 'text-pink-400', label: 'Trigger', iconType: 'zap' },
             { type: 'llm', icon: Sparkles, color: 'text-indigo-400', label: 'LLM', iconType: 'sparkles' },
             { type: 'agent', icon: Code, color: 'text-amber-400', label: 'Agent', iconType: 'code' },
             { type: 'tool', icon: Database, color: 'text-cyan-400', label: 'Tool', iconType: 'database' },
           ].map((item) => (
             <div 
               key={item.type}
               draggable
               onDragStart={(e) => onDragStart(e, item.type, item.label, item.iconType)}
               className="group relative w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1d24] border border-white/5 hover:border-indigo-500/50 hover:bg-white/5 transition-all cursor-grab active:cursor-grabbing"
               title={`Drag to add ${item.label}`}
             >
               <item.icon size={18} className={`${item.color}`} />
               <div className="absolute left-full ml-2 px-2 py-1 bg-black border border-white/10 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                 {item.label}
               </div>
             </div>
           ))}
         </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#09090b]"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#334155" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls className="!bg-[#1a1d24] !border-border !fill-slate-400" />
          <MiniMap 
            className="!bg-[#1a1d24] !border-border" 
            nodeColor={(n) => {
               if (n.data.status === 'running') return '#6366f1';
               if (n.data.status === 'completed') return '#22c55e';
               if (n.data.type === 'start') return '#ec4899';
               if (n.data.type === 'llm') return '#6366f1';
               if (n.data.type === 'agent') return '#f59e0b';
               if (n.data.type === 'tool') return '#22d3ee';
               return '#64748b';
            }}
          />
          
          {/* Floating Action Bar */}
          <Panel position="top-center" className="bg-[#1a1d24]/80 backdrop-blur-md border border-border p-1.5 rounded-full flex gap-1 shadow-xl translate-y-2">
             <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><MousePointer2 size={16} /></button>
             <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><Layout size={16} /></button>
             <div className="w-px h-4 bg-white/10 self-center mx-1"></div>
             <button 
               onClick={handleRunWorkflow}
               disabled={isRunning}
               className={`px-4 py-1.5 text-white text-xs font-bold rounded-full flex items-center gap-2 transition-all shadow-lg ${isRunning ? 'bg-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}`}
             >
                {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                {isRunning ? 'Running...' : 'Run Workflow'}
             </button>
          </Panel>
        </ReactFlow>

        {/* Unified Right Panel (Config & Results) */}
        {selectedNode && (
          <SidePanel 
            node={selectedNode} 
            executionResults={executionResults} 
            activeNodeId={activeNodeId}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

// Wrap with Provider to ensure instance access works correctly
export const WorkflowStudio = () => (
  <ReactFlowProvider>
    <WorkflowStudioContent />
  </ReactFlowProvider>
);
