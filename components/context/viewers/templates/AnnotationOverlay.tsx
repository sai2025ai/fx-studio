
import React from 'react';
import { Plus, Edit3, Trash2, CornerDownLeft } from 'lucide-react';
import { UIAnnotation } from '../../types';
import { cn } from '../../../../lib/utils';

interface AnnotationOverlayProps {
  annotation: UIAnnotation;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number; // pixel offset for stacking
}

export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({ annotation, position = 'right', offset = 0 }) => {
  const colors = {
    new: {
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      text: 'text-emerald-400',
      bgSoft: 'bg-emerald-950/80',
      shadow: 'shadow-emerald-900/20'
    },
    modify: {
      bg: 'bg-amber-500',
      border: 'border-amber-500',
      text: 'text-amber-400',
      bgSoft: 'bg-amber-950/80',
      shadow: 'shadow-amber-900/20'
    },
    delete: {
      bg: 'bg-rose-500',
      border: 'border-rose-500',
      text: 'text-rose-400',
      bgSoft: 'bg-rose-950/80',
      shadow: 'shadow-rose-900/20'
    }
  };

  const style = colors[annotation.type];

  // Calculate positioning logic based on 'position' prop
  // For simplicity in this mock, we assume 'right' flows to the right, etc.
  // Real implementation would require complex layout calculation or a library like floating-ui
  
  const lineClass = cn(
    "absolute z-50 pointer-events-none",
    position === 'right' && "left-full top-1/2 h-px w-8 origin-left",
    position === 'left' && "right-full top-1/2 h-px w-8 origin-right",
    position === 'top' && "bottom-full left-1/2 w-px h-8 origin-bottom",
    position === 'bottom' && "top-full left-1/2 w-px h-8 origin-top",
    style.bg
  );

  const cardPositionClass = cn(
    "absolute z-50 w-48 p-3 rounded-lg border backdrop-blur-md shadow-xl flex flex-col gap-1 transition-all hover:scale-105 cursor-help",
    position === 'right' && "left-[calc(100%+2rem)] top-1/2 -translate-y-1/2",
    position === 'left' && "right-[calc(100%+2rem)] top-1/2 -translate-y-1/2",
    position === 'top' && "bottom-[calc(100%+2rem)] left-1/2 -translate-x-1/2",
    position === 'bottom' && "top-[calc(100%+2rem)] left-1/2 -translate-x-1/2",
    style.bgSoft, style.border, style.shadow
  );

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
       {/* The Dot on the UI element */}
       <div className={cn("w-2 h-2 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg animate-pulse", style.bg)}></div>
       
       {/* The Leader Line */}
       <div className={lineClass}></div>
       
       {/* The Annotation Card */}
       <div className={cn(cardPositionClass, "pointer-events-auto")}>
          <div className="flex items-start justify-between border-b border-white/10 pb-1 mb-1">
             <div className={cn("text-[10px] font-bold uppercase flex items-center gap-1", style.text)}>
                {annotation.type === 'new' && <Plus size={10} />}
                {annotation.type === 'modify' && <Edit3 size={10} />}
                {annotation.type === 'delete' && <Trash2 size={10} />}
                {annotation.type}
             </div>
             <div className="text-[9px] text-white/40 font-mono">#{annotation.id}</div>
          </div>
          <div className="text-xs font-bold text-white leading-tight">{annotation.label}</div>
          <div className="text-[10px] text-white/60 leading-snug mt-0.5">{annotation.description}</div>
       </div>
    </div>
  );
};
