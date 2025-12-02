
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- Dialog (Modal) ---
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      // Use requestAnimationFrame to ensure the DOM is mounted before applying the active class
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
           setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out",
          isAnimating ? "opacity-100" : "opacity-0"
        )} 
        onClick={() => onOpenChange(false)} 
      />
      
      {/* Dialog Container */}
      <div 
        className={cn(
          "relative z-[101] grid w-full gap-0 border border-border bg-[#1a1d24] p-0 shadow-2xl sm:rounded-xl transition-all duration-300 cubic-bezier(0.32, 0.72, 0, 1) transform overflow-hidden",
          isAnimating 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-4",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { title?: string, close?: () => void }> = ({ className, title, close, children, ...props }) => (
  <div className={cn("flex flex-col w-full", className)} {...props}>
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#15171c]/50">
       {title && <h2 className="text-lg font-semibold text-white leading-none tracking-tight">{title}</h2>}
       {close && (
         <button onClick={close} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-slate-400 hover:text-white">
           <X className="h-4 w-4" />
           <span className="sr-only">Close</span>
         </button>
       )}
    </div>
    <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">{children}</div>
  </div>
);

export const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 py-4 border-t border-border bg-[#15171c]/50", className)} {...props}>
    {children}
  </div>
);

// --- Sheet (Drawer) ---
interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'right' | 'left';
}

export const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, children, side = 'right' }) => {
  const [show, setShow] = useState(open);
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    if (open) {
      setShow(true);
      requestAnimationFrame(() => setAnimate(true));
    } else {
      setAnimate(false);
      setTimeout(() => setShow(false), 300);
    }
  }, [open]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
       {/* Backdrop */}
       <div 
         className={cn(
            "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            animate ? "opacity-100" : "opacity-0"
         )} 
         onClick={() => onOpenChange(false)} 
       />
       {/* Content */}
       <div className={cn(
          "relative z-[101] flex flex-col gap-4 bg-[#1a1d24] p-0 shadow-2xl transition-transform ease-out duration-300 border-l border-border h-full w-full sm:max-w-md",
          animate ? "translate-x-0" : "translate-x-full"
       )}>
         {children}
       </div>
    </div>
  );
};

export const SheetContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { title?: string, close?: () => void }> = ({ className, title, close, children, ...props }) => (
  <div className="flex flex-col h-full w-full">
     <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-[#15171c]">
        {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
        {close && (
           <button onClick={close} className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
           </button>
        )}
     </div>
     <div className={cn("flex-1 overflow-y-auto p-6", className)} {...props}>
        {children}
     </div>
  </div>
);
