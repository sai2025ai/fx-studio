
import React, { useState } from 'react';
import { Search, ArrowRight, Copy, Webhook } from 'lucide-react';
import { Resource, ApiParam } from '../types';
import { MethodBadge } from '../shared';

const ParamsTable = ({ params }: { params: ApiParam[] }) => (
  <div className="border border-border rounded-lg overflow-hidden bg-[#12141a]/50">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="bg-[#15171c]/50 border-b border-white/5">
          <th className="p-3 font-bold text-slate-500 text-xs uppercase w-48 tracking-wider">Name</th>
          <th className="p-3 font-bold text-slate-500 text-xs uppercase w-24 tracking-wider">Type</th>
          <th className="p-3 font-bold text-slate-500 text-xs uppercase w-20 tracking-wider">Required</th>
          <th className="p-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Description</th>
        </tr>
      </thead>
      <tbody>
        {params.map((param) => (
          <tr key={param.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
             <td className="p-3 font-mono text-indigo-300 font-medium align-top">
                {param.name}
                <div className="text-[10px] text-slate-500 mt-0.5 uppercase">{param.in}</div>
             </td>
             <td className="p-3 text-slate-400 align-top">
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-xs font-mono">{param.type}</span>
             </td>
             <td className="p-3 align-top">
                {param.required ? (
                   <span className="text-[10px] text-red-400 border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded font-medium">YES</span>
                ) : (
                   <span className="text-[10px] text-slate-500 opacity-50">NO</span>
                )}
             </td>
             <td className="p-3 text-slate-300 align-top leading-relaxed">
                {param.desc}
                {param.example && (
                   <div className="mt-1.5 flex items-start gap-2 text-xs">
                      <span className="text-slate-500 uppercase text-[10px] mt-0.5">Ex:</span>
                      <code className="bg-black/30 px-1.5 py-0.5 rounded text-slate-400 font-mono">{param.example}</code>
                   </div>
                )}
             </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ApiViewer = ({ resource }: { resource: Resource }) => {
  const [activeEndpointId, setActiveEndpointId] = useState<string | null>(resource.endpoints?.[0]?.id || null);
  const activeEndpoint = resource.endpoints?.find(e => e.id === activeEndpointId);

  return (
    <div className="flex h-full overflow-hidden bg-transparent">
       {/* Left List (Endpoints) */}
       <div className="w-72 border-r border-border bg-[#0f1117]/30 flex flex-col">
          <div className="p-4 border-b border-border bg-[#15171c]/50">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Endpoints</h3>
             <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                <input 
                  type="text" 
                  placeholder="Filter endpoints..."
                  className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-md pl-8 pr-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {resource.endpoints?.map(ep => (
               <button 
                 key={ep.id} 
                 onClick={() => setActiveEndpointId(ep.id)}
                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                    activeEndpointId === ep.id ? 'bg-[#1a1d24]/80 border border-white/10 shadow-sm' : 'hover:bg-white/5 border border-transparent'
                 }`}
               >
                  <MethodBadge method={ep.method} />
                  <div className="overflow-hidden">
                     <div className={`text-xs font-mono truncate ${activeEndpointId === ep.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                        {ep.path}
                     </div>
                     <div className="text-[10px] text-slate-600 truncate">{ep.summary}</div>
                  </div>
               </button>
             ))}
          </div>
       </div>

       {/* Right Detail (Documentation) */}
       <div className="flex-1 overflow-y-auto p-8">
          {activeEndpoint ? (
             <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Header Info */}
                <div>
                   <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method={activeEndpoint.method} size="lg" />
                      <h2 className="text-xl font-mono text-white">{activeEndpoint.path}</h2>
                   </div>
                   <h1 className="text-2xl font-bold text-white mb-2">{activeEndpoint.summary}</h1>
                   <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{activeEndpoint.description}</p>
                </div>

                {/* Request Params (Table Format) */}
                {activeEndpoint.requestParams.length > 0 && (
                   <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                        <ArrowRight size={12} /> Request Parameters
                      </h3>
                      <ParamsTable params={activeEndpoint.requestParams} />
                   </div>
                )}

                {/* Response Params (Table Format) */}
                 {activeEndpoint.responseParams.length > 0 && (
                   <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                        <ArrowRight size={12} /> Response Parameters
                      </h3>
                      <ParamsTable params={activeEndpoint.responseParams} />
                   </div>
                )}

                {/* Response Example JSON */}
                <div className="space-y-3">
                   <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-white/10 pb-2">Response Body (200 OK)</h3>
                   <div className="relative group">
                      <pre className="bg-[#12141a]/50 border border-border rounded-lg p-4 text-xs font-mono text-emerald-300 overflow-auto">
                         {activeEndpoint.responseJson}
                      </pre>
                      <button className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                         <Copy size={14} />
                      </button>
                   </div>
                </div>
             </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <Webhook size={48} className="opacity-20" />
                <p>Select an endpoint to view details</p>
             </div>
          )}
       </div>
    </div>
  );
};
