
import React from 'react';
import { Shield, Webhook, Code2, ListChecks, LayoutGrid, FileText, Globe } from 'lucide-react';

export const ResourceIcon = ({ type, source, className }: { type: string, source: string, className?: string }) => {
  const size = 14;
  if (type === 'rule') return <Shield size={size} className={className} />;
  if (type === 'api') return <Webhook size={size} className={className} />;
  if (type === 'tech') return <Code2 size={size} className={className} />;
  if (type === 'qa') return <ListChecks size={size} className={className} />;
  if (source === 'MasterGo') return <LayoutGrid size={size} className={className} />;
  if (source === 'Feishu') return <FileText size={size} className={className} />;
  return <Globe size={size} className={className} />;
};

export const MethodBadge = ({ method, size = 'sm' }: { method: string, size?: 'sm' | 'lg' }) => {
  const colors: Record<string, string> = {
    GET: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    POST: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    PUT: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    DELETE: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    PATCH: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };
  const sizeClass = size === 'sm' ? 'w-10 h-4 text-[9px]' : 'w-14 h-5 text-[10px]';
  return (
    <span className={`flex items-center justify-center font-bold border rounded ${sizeClass} font-mono ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
};
