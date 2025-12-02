
import React from 'react';
import { Shield } from 'lucide-react';
import { Resource } from '../types';

export const RuleViewer = ({ resource }: { resource: Resource }) => {
  return (
    <div className="absolute inset-0 overflow-y-auto p-10">
       <div className="max-w-3xl mx-auto bg-[#0f1117]/80 border border-border rounded-xl p-8">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-6 ${resource.ruleLevel === 'Mandatory' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
             <Shield size={12} /> {resource.ruleLevel} Rule
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">{resource.title}</h1>
          <p className="text-slate-300 leading-relaxed mb-8">{resource.content}</p>
          {resource.examples && (
             <div className="grid gap-4">
                {resource.examples.map((ex, i) => (
                   <div key={i} className={`p-4 rounded-lg border ${ex.type === 'positive' ? 'bg-green-500/5 border-green-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                      <div className={`text-xs font-bold uppercase mb-2 ${ex.type === 'positive' ? 'text-green-400' : 'text-rose-400'}`}>{ex.type === 'positive' ? 'Do' : "Don't"}</div>
                      <code className="block bg-black/30 p-2 rounded text-xs font-mono text-slate-300 mb-2">{ex.content}</code>
                      <div className="text-xs text-slate-500">{ex.explanation}</div>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};
