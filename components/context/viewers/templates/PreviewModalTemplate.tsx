
import React from 'react';

export const PreviewModalTemplate = () => (
  <div className="flex flex-col h-full pointer-events-none bg-[#1a1d24]">
     <div className="flex-1 space-y-4 p-6 flex flex-col justify-center">
        {[1, 2, 3].map(i => (
           <div key={i} className="flex items-center gap-4">
              <div className="h-1.5 w-16 bg-white/20 rounded shrink-0"></div>
              <div className="h-8 flex-1 border border-white/10 rounded bg-[#0f1117]/30 flex items-center px-3 shadow-sm">
                 <div className="h-1.5 w-24 bg-white/5 rounded"></div>
              </div>
           </div>
        ))}
     </div>
     <div className="h-12 border-t border-white/10 mt-auto flex items-center justify-end gap-3 px-6 shrink-0 bg-white/[0.02]">
        <div className="h-7 px-3 rounded border border-white/10 flex items-center justify-center text-[10px] text-slate-400">Cancel</div>
        <div className="h-7 px-3 rounded bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold shadow-lg shadow-indigo-500/20">Submit</div>
     </div>
  </div>
);
