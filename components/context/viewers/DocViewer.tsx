
import React from 'react';
import { MarkdownRenderer } from '../../SharedUI';
import { Resource } from '../types';
import { FileText } from 'lucide-react';

export const DocViewer = ({ resource }: { resource: Resource }) => {
  if (!resource.content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
         <FileText size={48} className="opacity-20" />
         <p>No content available.</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto p-10 flex justify-center">
       <div className="max-w-4xl w-full bg-[#0f1117]/80 border border-border rounded-xl p-10 shadow-lg min-h-[800px]">
          <MarkdownRenderer content={resource.content} />
       </div>
    </div>
  );
};
