
import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  NodeProps, 
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import { 
  GitBranch, Box, Layout, Monitor, Sidebar, Split, 
  MousePointer2, Server, Code2, CheckCircle2, Shield,
  MoreHorizontal, Database, ChevronRight, Info, PanelRight,
  ArrowRight, Layers, Component, Search, Plus, X, Trash2, Edit3, Filter,
  Move
} from 'lucide-react';
import { TechSpecContent, TechSpecView, TechSpecRoute } from '../types';
import { cn } from '../../../lib/utils';
import { PreviewTableTemplate } from './templates/PreviewTableTemplate';
import { PreviewModalTemplate } from './templates/PreviewModalTemplate';

// --- Custom React Flow Node ---

const BlueprintNode = ({ data, selected }: NodeProps) => {
  const { view } = data;
  const isPage = view.type === 'page';
  
  return (
    <div 
      className={cn(
        "w-full rounded-lg transition-all duration-300 flex flex-col overflow-hidden shadow-2xl bg-[#12141a]",
        isPage ? "h-auto" : "h-full",
        selected 
          ? "ring-2 ring-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.3)]" 
          : "border border-dashed border-slate-700 hover:border-slate-500 hover:shadow-xl"
      )}
    >
      {/* Drag Handle Header */}
      <div className={cn(
        "px-3 py-2 border-b flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing",
        selected ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/5 border-white/5"
      )}>
        <div className="flex items-center gap-2">
           {view.type === 'page' && <Layout size={12} className={selected ? "text-indigo-400" : "text-slate-500"} />}
           {view.type === 'modal' && <Box size={12} className={selected ? "text-indigo-400" : "text-slate-500"} />}
           {view.type === 'drawer' && <Sidebar size={12} className={selected ? "text-indigo-400" : "text-slate-500"} />}
           <span className={cn("text-xs font-bold tracking-tight", selected ? "text-white" : "text-slate-400")}>{view.name}</span>
        </div>
        
        {/* Window Controls */}
        <div className="flex gap-1.5">
           {view.type === 'modal' && <X size={12} className="text-slate-500" />}
           {view.type !== 'modal' && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              </>
           )}
        </div>
      </div>

      {/* Node Body */}
      <div className={cn("relative bg-[#12141a]/50", isPage ? "" : "flex-1 overflow-hidden")}>
         {view.type === 'page' && (
            <PreviewTableTemplate annotations={view.annotations} />
         )}

         {(view.type === 'modal' || view.type === 'drawer') && (
            <PreviewModalTemplate />
         )}
         
         {/* Selection Overlay */}
         {selected && (
            <div className="absolute inset-0 pointer-events-none bg-indigo-500/5"></div>
         )}
      </div>
    </div>
  );
};

const nodeTypes = { blueprint: BlueprintNode };

// --- Main Component ---

const TechSpecFlow = ({ spec }: { spec: TechSpecContent }) => {
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowInstance = useReactFlow();

  // Initialize Route Selection
  useEffect(() => {
    if (spec.routes && spec.routes.length > 0 && !activeRouteId) {
      setActiveRouteId(spec.routes[0].id);
    }
  }, [spec, activeRouteId]);

  const activeRoute = spec.routes?.find(r => r.id === activeRouteId);
  const activeView = activeRoute?.views.find(v => v.id === activeViewId);

  // 1. Initialize Nodes when activeRoute changes
  useEffect(() => {
    if (activeRoute) {
      const canvasBaseX = 100;
      const canvasBaseY = 50;
      const scaleX = 16; // Map 0-100 to pixels (Increased width)
      const scaleY = 9;  // Adjusted vertical scale

      const newNodes = activeRoute.views.map(view => {
        const isPage = view.type === 'page';
        
        return {
          id: view.id,
          type: 'blueprint',
          position: { 
              x: canvasBaseX + (view.layout.x * scaleX), 
              y: canvasBaseY + (view.layout.y * scaleY) 
          },
          style: { 
              width: view.layout.w * scaleX, 
              height: isPage ? undefined : view.layout.h * scaleY, // Auto height for page types to fit content
              zIndex: view.layout.z 
          },
          data: { view },
          // Automatically select the first view if none selected
          selected: activeRoute.views[0].id === view.id
        };
      });

      setNodes(newNodes);
      // Set initial active view
      if (activeRoute.views.length > 0) {
          setActiveViewId(activeRoute.views[0].id);
      } else {
          setActiveViewId(null);
      }
      
      // Fit view after short delay to allow rendering
      setTimeout(() => reactFlowInstance.fitView({ padding: 0.2, duration: 800 }), 100);
    }
  }, [activeRoute, setNodes, reactFlowInstance]);

  // 2. Handle Node Click (Selection Sync)
  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
      setActiveViewId(node.id);
  }, []);

  // 3. Handle Route Click
  const handleRouteClick = (route: TechSpecRoute) => {
    setActiveRouteId(route.id);
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#09090b]">
      
      {/* --- Left Column: Route Navigator --- */}
      <div className="w-64 border-r border-border bg-[#0f1117] flex flex-col shrink-0 z-10">
         <div className="p-4 border-b border-border bg-[#15171c]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
               <Split size={14} /> Affected Routes
            </h3>
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {spec.routes?.map(route => (
               <button
                 key={route.id}
                 onClick={() => handleRouteClick(route)}
                 className={cn(
                   "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all group border",
                   activeRouteId === route.id 
                     ? "bg-[#1a1d24] border-indigo-500/30 shadow-sm" 
                     : "border-transparent hover:bg-white/5"
                 )}
               >
                  <div className="mt-0.5">
                     {route.status === 'new' && <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">NEW</div>}
                     {route.status === 'modified' && <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">MOD</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className={cn("text-xs font-mono font-medium truncate", activeRouteId === route.id ? "text-white" : "text-slate-400")}>
                        {route.path}
                     </div>
                     <div className="text-[10px] text-slate-500 truncate mt-0.5">{route.name}</div>
                  </div>
                  {activeRouteId === route.id && <ChevronRight size={14} className="text-indigo-500 mt-1" />}
               </button>
            ))}
         </div>
      </div>

      {/* --- Center Column: Blueprint Canvas (React Flow) --- */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-[#0d1117]">
         {/* Canvas Header */}
         <div className="h-10 border-b border-border bg-[#1a1d24] flex items-center px-4 justify-between shrink-0 z-10">
            <div className="flex items-center gap-2 text-xs text-slate-400">
               <Monitor size={14} />
               <span>Blueprint View</span>
               <span className="text-slate-600">/</span>
               <span className="text-white font-mono">{activeRoute?.path || 'No Route Selected'}</span>
            </div>
            <div className="flex gap-2">
               <div className="text-[10px] px-2 py-0.5 bg-indigo-500/10 rounded text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                  <Move size={10} /> Draggable
               </div>
               <div className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-slate-500 border border-white/5 flex items-center gap-1">
                  <MousePointer2 size={10} /> Selectable
               </div>
            </div>
         </div>

         {/* The Canvas */}
         <div className="flex-1 h-full w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.2}
                maxZoom={2}
                className="bg-[#09090b]"
                proOptions={{ hideAttribution: true }}
                onPaneClick={() => setActiveViewId(null)}
            >
                <Background color="#272a34" gap={24} size={1} variant={BackgroundVariant.Dots} />
                <Controls className="!bg-[#1a1d24] !border-border !fill-slate-400" showInteractive={false} />
                <MiniMap 
                    className="!bg-[#1a1d24] !border-border !bottom-4 !right-4" 
                    nodeColor="#4f46e5" 
                    maskColor="rgba(9, 9, 11, 0.8)"
                />
            </ReactFlow>
         </div>
      </div>

      {/* --- Right Column: Inspector Panel --- */}
      <div className={cn(
         "w-80 border-l border-border bg-[#0f1117] flex flex-col shrink-0 transition-all duration-300 z-20",
         activeViewId ? "translate-x-0 opacity-100" : "translate-x-full w-0 border-none opacity-0"
      )}>
         {activeView && (
            <>
               <div className="p-4 border-b border-border bg-[#15171c]">
                  <div className="flex items-center gap-2 mb-1">
                     <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                        {activeView.type === 'page' && <Layout size={14} />}
                        {activeView.type === 'modal' && <Box size={14} />}
                        {activeView.type === 'drawer' && <Sidebar size={14} />}
                     </div>
                     <span className="text-sm font-bold text-white">{activeView.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">{activeView.description}</p>
               </div>

               <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  
                  {/* Annotations Summary List in Panel */}
                  {activeView.annotations && activeView.annotations.length > 0 && (
                     <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <Edit3 size={12} /> Requirements (Redlines)
                        </h4>
                        <div className="space-y-2">
                           {activeView.annotations.map(ann => (
                              <div key={ann.id} className={cn(
                                 "p-2 rounded-lg border text-xs flex items-start gap-2",
                                 ann.type === 'new' ? "bg-emerald-950/30 border-emerald-500/20" :
                                 ann.type === 'modify' ? "bg-amber-950/30 border-amber-500/20" :
                                 "bg-rose-950/30 border-rose-500/20"
                              )}>
                                 <div className={cn("mt-0.5", ann.type === 'new' ? "text-emerald-400" : ann.type === 'modify' ? "text-amber-400" : "text-rose-400")}>
                                    {ann.type === 'new' && <Plus size={12} />}
                                    {ann.type === 'modify' && <Edit3 size={12} />}
                                    {ann.type === 'delete' && <Trash2 size={12} />}
                                 </div>
                                 <div>
                                    <div className="font-bold text-slate-200">{ann.label}</div>
                                    <div className="text-slate-500 text-[10px] mt-0.5">{ann.description}</div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {activeView.details.map(category => (
                     <div key={category.id}>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                           {category.title === 'UI Structure' && <Layers size={12} />}
                           {category.title === 'Data Interactions' && <Database size={12} />}
                           {category.title === 'Logic' && <Code2 size={12} />}
                           {category.title === 'Form Fields' && <Component size={12} />}
                           {category.title === 'Components' && <Box size={12} />}
                           {category.title}
                        </h4>
                        
                        <div className="space-y-2">
                           {category.items.map(item => (
                              <div key={item.id} className="p-3 bg-[#1a1d24] border border-white/5 rounded-lg hover:border-indigo-500/30 transition-colors group cursor-default">
                                 <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-bold text-slate-200">{item.label}</span>
                                    {item.type && (
                                       <span className={cn(
                                          "text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border",
                                          item.type === 'api' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                          item.type === 'component' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                          item.type === 'validation' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                          "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                       )}>
                                          {item.type}
                                       </span>
                                    )}
                                 </div>
                                 <div className="text-[11px] font-mono text-indigo-300 break-all bg-[#0f1117] px-2 py-1 rounded border border-white/5 mb-1">
                                    {item.value}
                                 </div>
                                 {item.desc && (
                                    <div className="text-[10px] text-slate-500 flex items-start gap-1">
                                       <Info size={10} className="mt-0.5 shrink-0" />
                                       {item.desc}
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </>
         )}
      </div>

    </div>
  );
};

// Export Wrapper with Provider
export const TechSpecViewer = (props: { spec: TechSpecContent }) => (
    <ReactFlowProvider>
        <TechSpecFlow {...props} />
    </ReactFlowProvider>
);
