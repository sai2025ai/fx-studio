
import React, { useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant
} from 'reactflow';
import { LayoutGrid, ImageOff } from 'lucide-react';
import { Resource } from '../types';

// Custom Node
const DesignNode = ({ data }: NodeProps) => {
  return (
    <div className="group relative">
       <div className="absolute -inset-1 rounded-xl bg-indigo-500/0 group-hover:bg-indigo-500/20 transition-colors pointer-events-none"></div>
       <div className="relative bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl overflow-hidden transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/10">
          <div className="px-3 py-2 bg-[#252525] border-b border-[#333] flex items-center justify-between">
             <div className="flex items-center gap-2">
                <LayoutGrid size={12} className="text-purple-400" />
                <span className="text-[10px] font-bold text-slate-300 truncate max-w-[150px]">{data.name}</span>
             </div>
             <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                <span>{data.width}x{data.height}</span>
             </div>
          </div>
          <div className="relative group/img cursor-default bg-[#121212]">
            <div style={{ width: '100%', minWidth: '400px', height: '300px' }}>
              {data.url ? (
                 <img src={data.url} alt={data.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-600"><ImageOff size={32} /></div>
              )}
            </div>
          </div>
       </div>
       <Handle type="target" position={Position.Left} className="!bg-transparent !border-none" />
       <Handle type="source" position={Position.Right} className="!bg-transparent !border-none" />
    </div>
  );
};

const nodeTypes = { designScreen: DesignNode };

export const DesignViewer = ({ resource }: { resource: Resource }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (resource.screens) {
      const newNodes = resource.screens.map((screen, index) => ({
        id: screen.id,
        type: 'designScreen',
        position: { x: index * 500 + 40, y: 40 },
        data: { ...screen },
      }));
      setNodes(newNodes);
    }
  }, [resource]);

  return (
    <ReactFlow
       nodes={nodes}
       edges={edges}
       onNodesChange={onNodesChange}
       onEdgesChange={onEdgesChange}
       nodeTypes={nodeTypes}
       fitView
       className="bg-transparent"
    >
       <Background color="#334155" gap={20} size={1} variant={BackgroundVariant.Dots} />
       <Controls className="!bg-[#1a1d24] !border-border !fill-slate-400" />
       <MiniMap className="!bg-[#1a1d24] !border-border" />
    </ReactFlow>
  );
};
