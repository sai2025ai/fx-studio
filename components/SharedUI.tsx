
import React from 'react';
import { Dialog, DialogContent, DialogFooter, Sheet, SheetContent } from './ui/overlay';
import { Button } from './ui/core';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'markdown-to-jsx';

// --- Markdown Renderer ---

export const MarkdownRenderer = ({ content, className }: { content: string, className?: string }) => {
  return (
    <div className={cn("prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-a:text-indigo-400 prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#1a1d24] prose-pre:border prose-pre:border-white/10 prose-th:text-slate-300 prose-td:text-slate-400", className)}>
      <Markdown options={{
        overrides: {
          a: {
            component: ({ children, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>
            ),
          },
        },
      }}>
        {content}
      </Markdown>
    </div>
  );
};

// --- Backward Compatibility Wrappers ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} className={maxWidth || 'max-w-lg'}>
      <DialogContent title={title} close={onClose}>
        {children}
      </DialogContent>
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </Dialog>
  );
};

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children, width }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent title={title} close={onClose} className={width}>
        {children}
      </SheetContent>
    </Sheet>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible, onClose }) => {
  const [show, setShow] = React.useState(isVisible);
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    if (isVisible) {
      setShow(true);
      requestAnimationFrame(() => setAnimate(true));
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!show) return null;

  const styles = {
    success: 'border-green-500/20 bg-green-500/10 text-green-100',
    error: 'border-red-500/20 bg-red-500/10 text-red-100',
    info: 'border-blue-500/20 bg-blue-500/10 text-blue-100'
  };

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[200] transition-all duration-300 ease-out transform",
      animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className={cn("flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md", styles[type])}>
        {type === 'success' && <CheckCircle2 size={18} className="text-green-400" />}
        {type === 'error' && <AlertCircle size={18} className="text-red-400" />}
        {type === 'info' && <Info size={18} className="text-blue-400" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export const LoadingButton = ({ isLoading, children, className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button isLoading={isLoading} className={className} {...props}>
    {children}
  </Button>
);
