
import React, { useState } from 'react';
import { Search, Filter, Download, Star, Box, Command, Hash, ChevronRight, Plus, Layers, Cpu, Code2, Network, X, CheckCircle2, ArrowUpRight, GitBranch, Workflow } from 'lucide-react';
import { Asset, Tab } from '../types';
import { Drawer, Modal, LoadingButton, Toast } from './SharedUI';

const assets: Asset[] = [
  // Workflows
  { id: 'w1', title: 'Standard Feature Implementation', type: 'Workflow', description: 'End-to-end flow from PRD parsing to Code Generation and QA testing. Uses standard 3-agent architecture.', tags: ['prod', 'dev', 'qa'], author: 'System', updated: '1h ago' },
  { id: 'w2', title: 'Hotfix Rapid Response', type: 'Workflow', description: 'Streamlined workflow for critical bug fixes. Skips extensive design review and focuses on TDD loops.', tags: ['hotfix', 'maintenance'], author: 'DevOps Team', updated: '3d ago' },
  
  // Existing Assets
  { id: '1', title: 'Python Unit Tester', type: 'Agent', description: 'Specialized agent for writing PyTest cases based on function signatures. Automatically mocks external dependencies and generates edge cases.', tags: ['python', 'testing', 'qa'], author: 'Anthropic', updated: '2h ago' },
  { id: '2', title: 'React Hook Generator', type: 'Hook', description: 'Reusable workflow hook that intercepts React component creation to enforce custom hooks patterns.', tags: ['react', 'frontend'], author: 'Community', updated: '1d ago' },
  { id: '3', title: 'Clean Code Style', type: 'Style', description: 'Output formatter enforcing PEP8 and Google Docstring standards. Ensures all generated Python code meets enterprise guidelines.', tags: ['formatting', 'standards'], author: 'System', updated: '1w ago' },
  { id: '4', title: 'Security Auditor', type: 'Agent', description: 'Scans local code for common vulnerabilities (SQLi, XSS) using static analysis and LLM reasoning.', tags: ['security', 'audit'], author: 'Anthropic', updated: '3d ago' },
  { id: '5', title: 'Documentation Writer', type: 'Agent', description: 'Auto-generates README.md and inline comments for complex logic. Understands context across multiple files.', tags: ['docs', 'markdown'], author: 'Community', updated: '5h ago' },
  { id: '6', title: 'Docker Config', type: 'Hook', description: 'Automatically adds Dockerfile and docker-compose.yml when a backend framework is detected in the workspace.', tags: ['devops', 'docker'], author: 'System', updated: '2w ago' },
  { id: '7', title: 'Tailwind Component', type: 'Agent', description: 'Generates responsive React components using Tailwind CSS utility classes based on natural language descriptions.', tags: ['ui', 'css'], author: 'Community', updated: '1h ago' },
  { id: '8', title: 'PostgreSQL Connector', type: 'MCP', description: 'Provides read/write access to local PostgreSQL databases via Model Context Protocol. Enables natural language SQL generation and execution.', tags: ['database', 'sql', 'mcp'], author: 'System', updated: '1d ago' },
  { id: '9', title: 'Brave Search', type: 'MCP', description: 'Grants agents access to real-time web search results using the Brave Search API. Privacy-focused web grounding.', tags: ['web', 'search', 'mcp'], author: 'Brave', updated: '4d ago' },
  { id: '10', title: 'Local Filesystem', type: 'MCP', description: 'Secure sandbox for agents to read/write files in specific directories outside the project root.', tags: ['system', 'io', 'mcp'], author: 'System', updated: '2w ago' },
];

const tabs = [
  { id: 'All', label: 'All Assets', icon: Layers },
  { id: 'Workflow', label: 'Workflows', icon: GitBranch },
  { id: 'Agent', label: 'Agents', icon: Cpu },
  { id: 'Hook', label: 'Hooks', icon: Command },
  { id: 'Style', label: 'Styles', icon: Code2 },
  { id: 'MCP', label: 'MCP Servers', icon: Network },
];

interface AssetManagerProps {
    onNavigate?: (tab: Tab) => void;
}

export const AssetManager: React.FC<AssetManagerProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactions
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const filteredAssets = assets.filter(asset => {
    const matchesTab = activeTab === 'All' || asset.type === activeTab;
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleInstall = () => {
    if (selectedAsset?.type === 'Workflow' && onNavigate) {
        onNavigate(Tab.WORKFLOW);
        return;
    }

    setIsInstalling(true);
    setTimeout(() => {
      setIsInstalling(false);
      setToast({ visible: true, message: `Successfully installed ${selectedAsset?.title}` });
      setSelectedAsset(null);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 font-sans overflow-hidden">
      {/* Fixed Header Section */}
      <div className="px-8 pt-8 pb-0 bg-slate-950 z-10 shrink-0 border-b border-white/5">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Asset Library</h1>
            <p className="text-slate-400 text-sm">Manage your local agents, workflows, hooks, styles, and MCP servers.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#1a1d24] hover:bg-[#222630] text-slate-300 text-sm rounded-lg border border-border transition-colors flex items-center gap-2">
               <Download size={16} />
               Import from Hub
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
               <Plus size={16} />
               Create New Asset
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-4 flex gap-4 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'All' ? 'all assets' : activeTab === 'MCP' ? 'MCP servers' : activeTab.toLowerCase() + 's'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1d24] border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 px-4 bg-[#1a1d24] border border-border rounded-lg text-slate-400 text-sm hover:text-white cursor-pointer transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </div>
      </div>

      {/* Scrollable Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              onClick={() => setSelectedAsset(asset)}
              className="group relative bg-[#12141a] border border-border rounded-xl p-5 hover:border-slate-600 transition-all hover:shadow-2xl hover:shadow-black/50 flex flex-col min-h-[200px] cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${
                  asset.type === 'Agent' ? 'bg-indigo-500/10 text-indigo-400' :
                  asset.type === 'Workflow' ? 'bg-blue-500/10 text-blue-400' :
                  asset.type === 'Hook' ? 'bg-pink-500/10 text-pink-400' :
                  asset.type === 'MCP' ? 'bg-cyan-500/10 text-cyan-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {asset.type === 'Agent' && <Box size={20} />}
                  {asset.type === 'Workflow' && <Workflow size={20} />}
                  {asset.type === 'Hook' && <Command size={20} />}
                  {asset.type === 'Style' && <Hash size={20} />}
                  {asset.type === 'MCP' && <Network size={20} />}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <button className="text-slate-500 hover:text-white p-1"><Download size={16} /></button>
                   <button className="text-slate-500 hover:text-yellow-400 p-1"><Star size={16} /></button>
                </div>
              </div>
              
              <h3 className="text-white font-semibold mb-2 group-hover:text-indigo-400 transition-colors">{asset.title}</h3>
              
              {/* Adaptive description height with full hover reveal */}
              <div className="relative mb-6 flex-1">
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                  {asset.description}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                  {asset.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-500 border border-white/5">
                      #{tag}
                    </span>
                  ))}
                  {asset.tags.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-500 border border-white/5">+{asset.tags.length - 3}</span>
                  )}
                </div>
                <div className="p-1.5 rounded-full bg-white/5 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors cursor-pointer shrink-0 ml-2">
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredAssets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Box size={48} className="mb-4 opacity-20" />
            <p>No assets found for this category.</p>
            <button 
              onClick={() => {setActiveTab('All'); setSearchQuery('')}}
              className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* --- Drawers & Modals --- */}

      {/* Asset Details Drawer */}
      <Drawer 
        isOpen={!!selectedAsset} 
        onClose={() => setSelectedAsset(null)} 
        title={selectedAsset?.type === 'Workflow' ? 'Workflow Details' : 'Asset Details'}
      >
        {selectedAsset && (
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start gap-4">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  selectedAsset.type === 'Agent' ? 'bg-indigo-500/20 text-indigo-400' :
                  selectedAsset.type === 'Workflow' ? 'bg-blue-500/20 text-blue-400' :
                  selectedAsset.type === 'Hook' ? 'bg-pink-500/20 text-pink-400' :
                  selectedAsset.type === 'MCP' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-yellow-500/20 text-yellow-400'
               }`}>
                 {selectedAsset.type === 'Agent' && <Box size={32} />}
                 {selectedAsset.type === 'Workflow' && <Workflow size={32} />}
                 {selectedAsset.type === 'Hook' && <Command size={32} />}
                 {selectedAsset.type === 'Style' && <Hash size={32} />}
                 {selectedAsset.type === 'MCP' && <Network size={32} />}
               </div>
               <div>
                 <h2 className="text-xl font-bold text-white">{selectedAsset.title}</h2>
                 <p className="text-slate-400 text-sm mt-1">by {selectedAsset.author} • Updated {selectedAsset.updated}</p>
                 <div className="flex items-center gap-2 mt-2">
                   <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded text-slate-400 uppercase tracking-wide">{selectedAsset.type}</span>
                   <div className="flex gap-0.5">
                     {[1,2,3,4,5].map(i => <Star key={i} size={10} className="text-yellow-500 fill-yellow-500" />)}
                   </div>
                   <span className="text-xs text-slate-500">(4.9/5)</span>
                 </div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
               <LoadingButton 
                 isLoading={isInstalling}
                 onClick={handleInstall}
                 className={selectedAsset.type === 'Workflow' 
                    ? "flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium text-sm shadow-lg shadow-blue-500/20"
                    : "flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-medium text-sm shadow-lg shadow-indigo-500/20"
                 }
               >
                 {selectedAsset.type === 'Workflow' ? 'Open Workflow Studio' : 'Install to Workspace'}
               </LoadingButton>
               <button className="px-4 py-2.5 border border-border hover:bg-white/5 rounded-lg text-slate-300 text-sm flex items-center gap-2">
                 <Code2 size={16} /> {selectedAsset.type === 'Workflow' ? 'View JSON' : 'View Code'}
               </button>
               <button className="p-2.5 border border-border hover:bg-white/5 rounded-lg text-slate-400">
                 <ArrowUpRight size={16} />
               </button>
            </div>

            {/* Content */}
            <div className="space-y-6 border-t border-white/5 pt-6">
               <div>
                 <h4 className="text-sm font-bold text-white mb-2">Description</h4>
                 <p className="text-sm text-slate-400 leading-relaxed">{selectedAsset.description}</p>
               </div>
               
               <div>
                 <h4 className="text-sm font-bold text-white mb-2">Tags</h4>
                 <div className="flex flex-wrap gap-2">
                   {selectedAsset.tags.map(tag => (
                     <span key={tag} className="px-3 py-1 rounded-full bg-[#1a1d24] border border-border text-xs text-slate-400">#{tag}</span>
                   ))}
                 </div>
               </div>

               <div>
                 <h4 className="text-sm font-bold text-white mb-2">Dependencies</h4>
                 <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
                   {selectedAsset.type === 'Workflow' ? (
                       <>
                        <li>claude-3.5-sonnet</li>
                        <li>playwright-agent (v1.2)</li>
                        <li>sql-gen-mcp</li>
                       </>
                   ) : (
                       <>
                        <li>python &ge; 3.10</li>
                        <li>pytest</li>
                        <li>claude-3.5-sonnet</li>
                       </>
                   )}
                 </ul>
               </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Asset Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Asset"
        footer={
          <>
             <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
             <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm shadow-lg shadow-indigo-500/20">Create</button>
          </>
        }
      >
        <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Asset Name</label>
             <input type="text" className="w-full bg-[#12141a] border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. My Custom Agent" />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Type</label>
             <div className="grid grid-cols-2 gap-3">
                {['Agent', 'Workflow', 'Hook', 'Style', 'MCP'].map(type => (
                  <label key={type} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-white/5">
                    <input type="radio" name="assetType" className="accent-indigo-500" defaultChecked={type === 'Agent'} />
                    <span className="text-sm text-slate-300">{type}</span>
                  </label>
                ))}
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
             <textarea className="w-full bg-[#12141a] border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 h-24 resize-none" placeholder="Describe what this asset does..." />
           </div>
        </div>
      </Modal>

      <Toast 
         message={toast.message} 
         isVisible={toast.visible} 
         onClose={() => setToast({ ...toast, visible: false })} 
      />

    </div>
  );
};