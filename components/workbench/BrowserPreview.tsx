
import React, { useState } from 'react';
import { 
  Globe, AlertTriangle, RotateCw, Monitor, Tablet, Smartphone,
  Zap, Sparkles, Command, Terminal, ChevronDown, Network, TestTube,
  Play, Power, Plus, Trash2, Search, ArrowRight, Table,
  Activity, Radio, MousePointer2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/core';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

type ToolTab = 'console' | 'network' | 'mock';

interface NetworkRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT';
  name: string;
  status: number;
  type: string;
  time: string;
  size: string;
}

interface MockRule {
  id: string;
  enabled: boolean;
  method: string;
  path: string;
  responseStatus: number;
}

const mockRequests: NetworkRequest[] = [
    { id: '1', method: 'GET', name: 'user.json', status: 200, type: 'xhr', time: '45ms', size: '1.2kb' },
    { id: '2', method: 'GET', name: 'roles', status: 200, type: 'fetch', time: '120ms', size: '3.4kb' },
    { id: '3', method: 'POST', name: 'verify', status: 201, type: 'fetch', time: '300ms', size: '560b' },
];

const mockRules: MockRule[] = [
    { id: 'm1', enabled: true, method: 'GET', path: '/api/users/list', responseStatus: 200 },
    { id: 'm2', enabled: false, method: 'POST', path: '/api/auth/login', responseStatus: 401 },
];

export const BrowserPreview = ({ 
  device, 
  setDevice, 
  url, 
  setUrl,
  isTransitioning,
  onInspectElement
}: { 
  device: DeviceType, 
  setDevice: (d: DeviceType) => void, 
  url: string, 
  setUrl: (u: string) => void,
  isTransitioning: boolean,
  onInspectElement?: (details: any) => void
}) => {
  const [isReloading, setIsReloading] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<ToolTab>('mock'); 
  const [isInspecting, setIsInspecting] = useState(false);
  
  // Mock State
  const [mockEnabled, setMockEnabled] = useState(true);

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => setIsReloading(false), 800);
  };

  const getContainerWidth = () => {
    if (device === 'mobile') return 'max-w-[375px]';
    if (device === 'tablet') return 'max-w-[768px]';
    return 'max-w-full';
  };

  const StatusColor = (status: number) => {
      if (status >= 200 && status < 300) return 'text-green-400';
      if (status >= 300 && status < 400) return 'text-yellow-400';
      return 'text-red-400';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] relative overflow-hidden">
      {/* Browser Toolbar */}
      <div className="h-10 bg-[#1a1d24] border-b border-border flex items-center px-3 gap-3 shrink-0 z-10">
         <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
         </div>
         
         <div className="flex-1 max-w-xl mx-auto flex items-center relative group">
            <div className="absolute left-2 text-slate-500">
               {url.startsWith('https') ? <Globe size={12} className="text-green-500" /> : <AlertTriangle size={12} className="text-amber-500" />}
            </div>
            <input 
              type="text" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#0d1117] border border-transparent group-hover:border-border rounded-md py-1 pl-8 pr-8 text-xs text-slate-300 focus:outline-none focus:bg-[#09090b] transition-colors font-mono text-center" 
            />
            <button onClick={handleReload} className="absolute right-2 text-slate-500 hover:text-white">
               <RotateCw size={12} className={isReloading ? 'animate-spin' : ''} />
            </button>
         </div>

         <div className="flex items-center gap-1 bg-[#0d1117] p-0.5 rounded-lg border border-white/5">
            {/* Inspect Button */}
            <button 
                onClick={() => setIsInspecting(!isInspecting)}
                className={cn(
                  "p-1.5 rounded transition-all mr-1",
                  isInspecting ? "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/50" : "text-slate-500 hover:text-slate-300"
                )}
                title="Inspect Element"
            >
                <MousePointer2 size={14} />
            </button>

            {['desktop', 'tablet', 'mobile'].map((d) => (
              <button 
                key={d}
                onClick={() => setDevice(d as DeviceType)}
                className={cn(
                  "p-1.5 rounded transition-all",
                  device === d ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                )}
                title={d}
              >
                 {d === 'desktop' && <Monitor size={14} />}
                 {d === 'tablet' && <Tablet size={14} />}
                 {d === 'mobile' && <Smartphone size={14} />}
              </button>
            ))}
         </div>
      </div>

      {/* Viewport Area */}
      <div className="flex-1 bg-[#0d1117] relative overflow-hidden flex justify-center bg-[radial-gradient(#1a1d24_1px,transparent_1px)] [background-size:16px_16px]">
         
         <div 
            style={{ willChange: 'transform' }}
            className={cn(
              "relative h-full w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bg-white shadow-2xl border-x border-black/50 overflow-hidden flex flex-col origin-top",
              getContainerWidth(),
              isTransitioning ? 'scale-[0.98] opacity-90' : 'scale-100 opacity-100'
            )}
          >
            {isTransitioning && (
               <div className="absolute inset-0 backdrop-blur-[2px] z-50 bg-black/10 pointer-events-none animate-in fade-in duration-200"></div>
            )}

            {/* Inspect Overlay Banner */}
            {isInspecting && (
                <div className="absolute top-0 left-0 right-0 z-50 bg-indigo-600 text-white text-[10px] font-bold py-1 text-center shadow-lg animate-in slide-in-from-top-2">
                    INSPECT MODE: Click an element to locate source
                </div>
            )}
            
            {/* MOCK RENDERED CONTENT (User List) */}
            <div className={cn("flex-1 overflow-y-auto bg-slate-50 text-slate-900 font-sans relative", isInspecting && "cursor-crosshair")}>
               <div className="p-6">
                  <h1 className="text-2xl font-bold mb-4 text-slate-800">User Management</h1>
                  
                  {/* Search Bar */}
                  <div className="flex gap-2 mb-6">
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        className={cn(
                            "flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm transition-all",
                            isInspecting && "hover:ring-2 hover:ring-indigo-500 hover:bg-indigo-50/50 cursor-crosshair"
                        )}
                        onClick={(e) => {
                            if (isInspecting && onInspectElement) {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsInspecting(false);
                                onInspectElement({
                                    file: 'src/views/UserList.vue',
                                    line: 24, // Matches the mock code line
                                    tagName: 'input',
                                    code: '<input v-model="searchQuery" ... />'
                                });
                            }
                        }}
                      />
                      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Search</button>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                      <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                  <th className="px-4 py-3 font-medium text-slate-500">Name</th>
                                  <th className="px-4 py-3 font-medium text-slate-500">Email</th>
                                  <th className="px-4 py-3 font-medium text-slate-500">Role</th>
                                  <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {[1,2,3,4].map(i => (
                                  <tr key={i} className="hover:bg-slate-50">
                                      <td className="px-4 py-3 font-medium text-slate-900">User {i}</td>
                                      <td className="px-4 py-3 text-slate-500">user{i}@example.com</td>
                                      <td className="px-4 py-3 text-slate-500">{i % 2 === 0 ? 'Admin' : 'Editor'}</td>
                                      <td className="px-4 py-3">
                                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">Active</span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
               </div>
            </div>

            {/* Hot Reload Overlay */}
            {isReloading && (
               <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                  <div className="bg-black/80 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
                     <RotateCw size={14} className="animate-spin" />
                     <span className="text-xs font-mono">Hot Reloading...</span>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* DevTools Drawer */}
      <div className={cn("bg-[#0d1117] border-t border-border flex flex-col transition-all duration-300", devToolsOpen ? "h-64" : "h-8")}>
         {/* Tabs Header */}
         <div className="h-8 flex items-center px-2 bg-[#1a1d24] border-b border-white/5 select-none shrink-0">
            <div 
               onClick={() => setDevToolsOpen(!devToolsOpen)}
               className="mr-2 cursor-pointer text-slate-500 hover:text-white"
            >
               <ChevronDown size={14} className={cn("transition-transform", !devToolsOpen && "rotate-180")} />
            </div>
            
            <div className="flex gap-1">
               <button 
                 onClick={() => { setActiveTool('console'); setDevToolsOpen(true); }}
                 className={cn("px-3 py-1 rounded-t text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors", 
                   activeTool === 'console' ? "bg-[#0d1117] text-white border-t border-indigo-500" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                 )}
               >
                  <Terminal size={10} /> Console
               </button>
               <button 
                 onClick={() => { setActiveTool('network'); setDevToolsOpen(true); }}
                 className={cn("px-3 py-1 rounded-t text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors", 
                   activeTool === 'network' ? "bg-[#0d1117] text-white border-t border-indigo-500" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                 )}
               >
                  <Network size={10} /> Network
               </button>
               <button 
                 onClick={() => { setActiveTool('mock'); setDevToolsOpen(true); }}
                 className={cn("px-3 py-1 rounded-t text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors", 
                   activeTool === 'mock' ? "bg-[#0d1117] text-white border-t border-indigo-500" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                 )}
               >
                  <TestTube size={10} /> Mock
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
               </button>
            </div>
         </div>
         
         {/* Tools Content */}
         <div className="flex-1 overflow-hidden bg-[#0d1117] relative">
            
            {/* CONSOLE */}
            {activeTool === 'console' && (
                <div className="h-full overflow-y-auto p-2 font-mono text-[10px] space-y-1">
                    <div className="flex gap-2 text-slate-400">
                    <span className="text-slate-600">[System]</span>
                    <span>[HMR] Waiting for update signal from WDS...</span>
                    </div>
                    <div className="flex gap-2 text-indigo-300">
                    <span className="text-indigo-500">[Info]</span>
                    <span>Vue app mounted.</span>
                    </div>
                </div>
            )}

            {/* NETWORK */}
            {activeTool === 'network' && (
                <div className="h-full flex flex-col font-mono text-xs">
                    <div className="flex border-b border-white/10 bg-[#15171c] text-slate-500 text-[10px] font-bold uppercase">
                        <div className="w-16 px-2 py-1">Status</div>
                        <div className="w-16 px-2 py-1">Method</div>
                        <div className="flex-1 px-2 py-1">Name</div>
                        <div className="w-16 px-2 py-1">Type</div>
                        <div className="w-16 px-2 py-1">Size</div>
                        <div className="w-16 px-2 py-1">Time</div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {mockRequests.map(req => (
                            <div key={req.id} className="flex border-b border-white/5 hover:bg-white/5 cursor-pointer text-slate-300">
                                <div className={cn("w-16 px-2 py-1", StatusColor(req.status))}>{req.status}</div>
                                <div className="w-16 px-2 py-1 text-slate-500">{req.method}</div>
                                <div className="flex-1 px-2 py-1 text-white">{req.name}</div>
                                <div className="w-16 px-2 py-1 text-slate-500">{req.type}</div>
                                <div className="w-16 px-2 py-1 text-slate-500">{req.size}</div>
                                <div className="w-16 px-2 py-1 text-slate-500">{req.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MOCK INTERCEPTOR */}
            {activeTool === 'mock' && (
                <div className="h-full flex">
                    {/* Mock Sidebar */}
                    <div className="w-64 border-r border-white/10 bg-[#12141a] flex flex-col">
                        <div className="p-2 border-b border-white/10 flex items-center justify-between">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                <Activity size={12} className={mockEnabled ? "text-green-400" : "text-slate-600"} />
                                Interceptor
                             </div>
                             <button 
                               onClick={() => setMockEnabled(!mockEnabled)}
                               className={cn("w-8 h-4 rounded-full relative transition-colors", mockEnabled ? "bg-green-500" : "bg-slate-700")}
                             >
                                <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", mockEnabled ? "left-4.5" : "left-0.5")}></div>
                             </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {mockRules.map(rule => (
                                <div key={rule.id} className={cn("p-2 border-b border-white/5 cursor-pointer hover:bg-white/5 flex items-center gap-2", rule.id === 'm1' && "bg-white/5")}>
                                    <div className={cn("w-2 h-2 rounded-full", rule.enabled ? "bg-green-500" : "bg-slate-600")}></div>
                                    <span className="text-[10px] font-bold text-slate-500 w-8">{rule.method}</span>
                                    <span className="text-xs text-slate-300 truncate">{rule.path}</span>
                                </div>
                            ))}
                            <button className="w-full py-2 text-xs text-slate-500 hover:text-white flex items-center justify-center gap-1">
                                <Plus size={12} /> Add Rule
                            </button>
                        </div>
                    </div>
                    
                    {/* Mock Detail Editor */}
                    <div className="flex-1 flex flex-col">
                        <div className="h-8 border-b border-white/10 bg-[#15171c] flex items-center px-4 justify-between">
                             <span className="text-xs font-mono text-white">GET /api/users/list</span>
                             <div className="flex gap-2">
                                <span className="text-[10px] text-slate-500 bg-black/20 px-2 py-0.5 rounded">Delay: 0ms</span>
                                <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">200 OK</span>
                             </div>
                        </div>
                        <div className="flex-1 bg-[#0d1117] p-2 overflow-auto">
                            <pre className="text-xs font-mono text-blue-300">
{`{
  "users": [
    { "id": 1, "name": "User 1", "role": "Admin" },
    { "id": 2, "name": "User 2", "role": "Editor" },
    { "id": 3, "name": "User 3", "role": "Editor" },
    { "id": 4, "name": "User 4", "role": "Viewer" }
  ],
  "total": 4,
  "page": 1
}`}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};
