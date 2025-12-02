
import React, { useState } from 'react';
import { Globe, Copy, Activity, PlayCircle, Check, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { TestCaseContent } from '../types';

export const TestCasesViewer = ({ plan }: { plan: TestCaseContent }) => {
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail'>('all');

  return (
     <div className="h-full flex flex-col overflow-hidden bg-[#09090b]/50">
        
        {/* Environment Header */}
        <div className="p-6 border-b border-white/5 bg-[#12141a]/50 shrink-0 grid grid-cols-3 gap-6">
           <div className="col-span-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Globe size={14} className="text-blue-400" /> Test Environment
              </h3>
              <div className="flex gap-4">
                 <div className="flex-1 bg-[#1a1d24] border border-white/5 rounded-lg p-3 flex items-center justify-between group">
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase mb-1">Base URL</div>
                       <div className="text-sm text-blue-400 underline decoration-blue-400/30 underline-offset-4">{plan.environment.url}</div>
                    </div>
                    <button className="p-1.5 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors"><Copy size={12} /></button>
                 </div>
                 <div className="flex-1 bg-[#1a1d24] border border-white/5 rounded-lg p-3 flex items-center justify-between">
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase mb-1">Test User</div>
                       <div className="text-sm text-slate-300 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          {plan.environment.user}
                       </div>
                    </div>
                    <button className="p-1.5 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors"><Copy size={12} /></button>
                 </div>
              </div>
           </div>
           
           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Activity size={14} className="text-purple-400" /> Coverage
              </h3>
              <div className="flex gap-2 items-center">
                 <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[88%]"></div>
                 </div>
                 <span className="text-xs font-bold text-green-400">{plan.stats.coverage}</span>
              </div>
              <div className="flex gap-4 mt-3">
                 <div className="text-xs text-slate-400">
                    <span className="text-white font-bold">{plan.stats.passed}</span> Passed
                 </div>
                 <div className="text-xs text-slate-400">
                    <span className="text-white font-bold">{plan.stats.total}</span> Total
                 </div>
              </div>
           </div>
        </div>

        {/* Test Cases List */}
        <div className="flex-1 flex flex-col overflow-hidden">
           <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-[#15171c]/30">
              <div className="flex gap-2">
                 <button 
                   onClick={() => setFilter('all')}
                   className={cn("px-3 py-1 rounded-full text-[10px] font-bold border transition-colors", filter === 'all' ? "bg-white/10 text-white border-white/20" : "text-slate-500 border-transparent hover:bg-white/5")}
                 >
                    All Scenarios
                 </button>
                 <button 
                   onClick={() => setFilter('pass')}
                   className={cn("px-3 py-1 rounded-full text-[10px] font-bold border transition-colors", filter === 'pass' ? "bg-green-500/10 text-green-400 border-green-500/20" : "text-slate-500 border-transparent hover:bg-white/5")}
                 >
                    Passed
                 </button>
                 <button 
                   onClick={() => setFilter('fail')}
                   className={cn("px-3 py-1 rounded-full text-[10px] font-bold border transition-colors", filter === 'fail' ? "bg-red-500/10 text-red-400 border-red-500/20" : "text-slate-500 border-transparent hover:bg-white/5")}
                 >
                    Failed
                 </button>
              </div>
              <button className="flex items-center gap-2 text-xs text-indigo-400 hover:text-white transition-colors">
                 <PlayCircle size={14} /> Run All Tests
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {plan.scenarios.map(scenario => (
                 <div key={scenario.id} className="group bg-[#1a1d24] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
                    <div className="p-4 flex items-center gap-4">
                       {/* Status Toggle */}
                       <button className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                          scenario.status === 'pass' ? "bg-green-500/10 border-green-500/50 text-green-500" :
                          scenario.status === 'fail' ? "bg-red-500/10 border-red-500/50 text-red-500" :
                          "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500"
                       )}>
                          {scenario.status === 'pass' && <Check size={16} />}
                          {scenario.status === 'fail' && <XCircle size={16} />}
                          {scenario.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-500"></div>}
                       </button>

                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className={cn("text-sm font-bold", scenario.status === 'pass' ? "text-slate-300" : "text-white")}>{scenario.title}</h4>
                             <span className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded font-bold border",
                                scenario.priority === 'P0' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                                scenario.priority === 'P1' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                "bg-blue-500/10 text-blue-400 border-blue-500/20"
                             )}>
                                {scenario.priority}
                             </span>
                             <span className="text-[9px] text-slate-600 uppercase bg-white/5 px-1.5 py-0.5 rounded">{scenario.type}</span>
                          </div>
                          
                          {/* Expanded Steps (Visual only for now) */}
                          <div className="text-xs text-slate-500 flex gap-2">
                             {scenario.steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-2">
                                   <span>{step}</span>
                                   {i < scenario.steps.length - 1 && <ArrowRight size={10} className="text-slate-700" />}
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
     </div>
  );
};
