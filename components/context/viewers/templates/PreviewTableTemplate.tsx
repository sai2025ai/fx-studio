
import React from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { UIAnnotation } from '../../types';
import { AnnotationOverlay } from './AnnotationOverlay';

export const PreviewTableTemplate = ({ annotations = [] }: { annotations?: UIAnnotation[] }) => {
  
  const getAnnotations = (target: string) => annotations.filter(a => a.target === target);

  return (
    <div className="flex flex-col w-full aspect-video pointer-events-none gap-2 p-2 bg-[#0f1117] relative">
       
       {/* 1. Page Header / Breadcrumb */}
       <div className="flex items-center gap-2 shrink-0">
          <div className="h-2 w-16 bg-white/20 rounded"></div>
          <span className="text-white/20 text-[10px]">/</span>
          <div className="h-2 w-24 bg-white/40 rounded"></div>
       </div>
  
       {/* 2. Search Filter Area */}
       <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex flex-wrap gap-2 items-center shrink-0 relative group/search">
          {getAnnotations('search_area').map(ann => (
             <AnnotationOverlay key={ann.id} annotation={ann} position="top" />
          ))}

          {/* Search Fields */}
          <div className="h-6 w-32 rounded bg-[#0f1117]/50 border border-white/10 flex items-center px-2">
             <div className="h-1.5 w-8 bg-white/10 rounded mr-2"></div>
             <div className="h-3 w-[1px] bg-white/10"></div>
          </div>
          <div className="h-6 w-32 rounded bg-[#0f1117]/50 border border-white/10 flex items-center px-2">
             <div className="h-1.5 w-12 bg-white/10 rounded"></div>
          </div>
          <div className="h-6 w-24 rounded bg-[#0f1117]/50 border border-white/10 flex items-center px-2">
             <div className="h-1.5 w-6 bg-white/10 rounded"></div>
          </div>
          
          {/* Search Buttons */}
          <div className="ml-auto flex gap-2">
             <div className="h-6 w-12 rounded border border-white/10 flex items-center justify-center bg-[#0f1117]/30">
                <div className="h-1.5 w-4 bg-white/30 rounded"></div>
             </div>
             <div className="h-6 w-12 rounded bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <div className="h-1.5 w-4 bg-white/90 rounded"></div>
             </div>
          </div>
       </div>
  
       {/* 3. Action Bar */}
       <div className="flex justify-between items-center shrink-0 relative">
          {getAnnotations('action_bar').map(ann => (
             <AnnotationOverlay key={ann.id} annotation={ann} position="right" />
          ))}

          {/* Left: Batch Ops */}
          <div className="flex gap-2">
             <div className="h-6 px-2 rounded border border-dashed border-slate-600 flex items-center gap-2 bg-slate-500/5">
                <div className="w-2 h-2 border border-slate-500 rounded"></div>
                <div className="h-1 w-8 bg-slate-600 rounded"></div>
             </div>
             <div className="h-6 px-2 rounded border border-dashed border-red-500/30 flex items-center gap-2 bg-red-500/5">
                <div className="h-1 w-6 bg-red-500/40 rounded"></div>
             </div>
          </div>
          {/* Right: Primary Add */}
          <div className="h-6 px-3 rounded bg-indigo-600 shadow-lg shadow-indigo-500/20 flex items-center gap-2">
             <Plus size={10} className="text-white" />
             <div className="h-1 w-8 bg-white/90 rounded"></div>
          </div>
       </div>
  
       {/* 4. Data Table */}
       <div className="flex-1 min-h-0 border border-white/10 rounded-lg bg-[#0f1117]/50 overflow-hidden flex flex-col relative">
          {/* Table Header */}
          <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-3 gap-3 shrink-0 relative">
             {getAnnotations('table_header').map(ann => (
                <AnnotationOverlay key={ann.id} annotation={ann} position="top" />
             ))}
             
             <div className="w-2.5 h-2.5 rounded border border-white/20"></div>
             <div className="h-1.5 w-12 bg-white/20 rounded"></div>
             <div className="h-1.5 w-20 bg-white/20 rounded"></div>
             <div className="h-1.5 w-16 bg-white/20 rounded"></div>
             <div className="h-1.5 w-10 bg-white/20 rounded"></div>
             <div className="flex-1"></div>
             <div className="h-1.5 w-10 bg-white/20 rounded"></div>
          </div>
          {/* Table Rows */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
             {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-8 border-b border-white/5 flex items-center px-3 gap-3 hover:bg-white/5 shrink-0 relative">
                   {i === 1 && getAnnotations('table_row').map(ann => (
                      <AnnotationOverlay key={ann.id} annotation={ann} position="left" />
                   ))}

                   <div className="w-2.5 h-2.5 rounded border border-white/10"></div>
                   <div className="h-1.5 w-10 bg-white/10 rounded"></div>
                   <div className="h-1.5 w-24 bg-white/10 rounded"></div>
                   <div className="h-1.5 w-14 bg-white/10 rounded"></div>
                   <div className="h-1.5 w-8 bg-white/10 rounded"></div>
                   <div className="flex-1"></div>
                   {/* Row Actions */}
                   <div className="flex gap-1.5 opacity-60">
                      <div className="w-4 h-4 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                         <Edit3 size={8} className="text-indigo-400" />
                      </div>
                      <div className="w-4 h-4 rounded bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                         <Trash2 size={8} className="text-red-400" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
          {/* Pagination Footer */}
          <div className="h-8 border-t border-white/5 flex items-center justify-end px-3 gap-2 bg-white/[0.02] shrink-0 relative">
             {getAnnotations('pagination').map(ann => (
                <AnnotationOverlay key={ann.id} annotation={ann} position="top" />
             ))}

             <div className="h-1.5 w-16 bg-white/10 rounded mr-2"></div>
             <div className="w-5 h-5 rounded border border-white/10 flex items-center justify-center"><div className="h-1.5 w-1.5 bg-white/30 rounded-full"></div></div>
             <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center shadow-sm"><div className="h-1.5 w-1.5 bg-white rounded-full"></div></div>
             <div className="w-5 h-5 rounded border border-white/10 flex items-center justify-center"><div className="h-1.5 w-1.5 bg-white/30 rounded-full"></div></div>
          </div>
       </div>
    </div>
  );
};
