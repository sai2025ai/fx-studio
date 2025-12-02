
import React, { useState } from 'react';
import { 
  Monitor, Cpu, Terminal, Type, Shield, ToggleLeft, ToggleRight, ChevronDown,
  Save, Plus, Trash2, Eye, EyeOff, Key, Globe, CheckCircle2, XCircle, RefreshCw, Server, Zap,
  HardDrive, Database
} from 'lucide-react';
import { Modal } from './SharedUI';

const categories = [
  { id: 'general', label: 'General', icon: Monitor },
  { id: 'editor', label: 'Editor', icon: Type },
  { id: 'ai', label: 'AI Models', icon: Cpu },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'security', label: 'Security', icon: Shield },
];

// --- Mock Data for Providers ---
interface Provider {
  id: string;
  name: string;
  iconColor: string;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  models: string[];
}

const initialProviders: Provider[] = [
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    iconColor: 'bg-orange-500', 
    enabled: true, 
    apiKey: 'sk-ant-xxxxxxxxxxxxxxxx', 
    baseUrl: 'https://api.anthropic.com',
    models: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307']
  },
  { 
    id: 'openai', 
    name: 'OpenAI', 
    iconColor: 'bg-green-500', 
    enabled: false, 
    apiKey: '', 
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  { 
    id: 'deepseek', 
    name: 'DeepSeek', 
    iconColor: 'bg-purple-600', 
    enabled: true, 
    apiKey: 'sk-ds-xxxxxxxx', 
    baseUrl: 'https://api.deepseek.com',
    models: ['deepseek-coder', 'deepseek-chat']
  },
  { 
    id: 'ollama', 
    name: 'Ollama', 
    iconColor: 'bg-white', 
    enabled: true, 
    baseUrl: 'http://localhost:11434',
    models: ['llama3', 'mistral', 'codegemma']
  },
  { 
    id: 'gemini', 
    name: 'Google Gemini', 
    iconColor: 'bg-blue-500', 
    enabled: false, 
    apiKey: '', 
    baseUrl: 'https://generativelanguage.googleapis.com',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash']
  },
];

const Toggle = ({ label, checked, onChange }: { label?: string, checked: boolean, onChange: () => void }) => (
  <div className={`flex items-center justify-between ${label ? 'py-3 border-b border-white/5' : ''} group cursor-pointer`} onClick={onChange}>
    {label && <span className="text-sm text-slate-300 group-hover:text-white transition-colors select-none">{label}</span>}
    <button 
      type="button"
      className={`transition-colors ${checked ? 'text-indigo-400' : 'text-slate-600'}`}
    >
      {checked ? <ToggleRight size={28} fill="currentColor" className="opacity-20" /> : <ToggleLeft size={28} />}
    </button>
  </div>
);

const Slider = ({ label, value, min, max, unit }: { label: string, value: number, min: number, max: number, unit?: string }) => (
  <div className="py-4 border-b border-white/5">
    <div className="flex justify-between mb-3">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      readOnly
      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
    />
  </div>
);

const Select = ({ label, value, options }: { label: string, value: string, options: string[] }) => (
  <div className="py-3 border-b border-white/5">
    <span className="block text-xs text-slate-500 mb-2 uppercase tracking-wider font-bold">{label}</span>
    <div className="relative">
      <select 
        value={value}
        onChange={() => {}}
        className="w-full appearance-none bg-[#12141a] border border-border text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
      >
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-4 top-3.5 text-slate-500 pointer-events-none" />
    </div>
  </div>
);

export const Settings: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general'); // Changed default to general to show file updates
  const [selectedProviderId, setSelectedProviderId] = useState('anthropic');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Modal
  const [showAddProvider, setShowAddProvider] = useState(false);

  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [telemetry, setTelemetry] = useState(false);

  const activeProvider = initialProviders.find(p => p.id === selectedProviderId) || initialProviders[0];

  const handleCheckConnection = () => {
    setIsChecking(true);
    setCheckStatus('idle');
    setTimeout(() => {
      setIsChecking(false);
      setCheckStatus('success');
    }, 1500);
  };

  return (
    <div className="h-full bg-slate-950 flex overflow-hidden">
      
      {/* Main Sidebar */}
      <div className="w-64 border-r border-border bg-[#0f1117] pt-6 flex flex-col shrink-0 z-20">
        <div className="px-6 mb-6">
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <p className="text-xs text-slate-500 mt-1">Preferences & Configuration</p>
        </div>
        
        <div className="flex-1 space-y-1 px-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="bg-[#1a1d24] rounded-lg p-3 flex items-center gap-3 border border-white/5">
             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
               JS
             </div>
             <div className="overflow-hidden">
               <div className="text-xs font-medium text-white truncate">John Smith</div>
               <div className="text-[10px] text-slate-500 truncate">Pro Plan • Team Lead</div>
             </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden bg-[#09090b]">
        
        {/* Logic to render standard settings vs the 2-pane model provider settings */}
        {activeCategory === 'ai' ? (
          <div className="flex flex-1 h-full">
            
            {/* Provider Sidebar (Cherry Studio Style) */}
            <div className="w-64 bg-[#12141a] border-r border-border flex flex-col">
              <div className="p-4 border-b border-border">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Providers</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {initialProviders.map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => {
                      setSelectedProviderId(provider.id);
                      setCheckStatus('idle');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${
                      selectedProviderId === provider.id 
                        ? 'bg-[#1a1d24] border border-indigo-500/30 shadow-md' 
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${provider.iconColor} flex items-center justify-center text-white shadow-sm font-bold text-xs`}>
                        {provider.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className={`text-sm font-medium ${selectedProviderId === provider.id ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                          {provider.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {provider.enabled ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                    </div>
                    {provider.enabled && (
                       <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                    )}
                  </button>
                ))}
                
                <button 
                  onClick={() => setShowAddProvider(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 hover:bg-white/5 transition-all text-xs font-medium"
                >
                  <Plus size={14} />
                  Add Custom Provider
                </button>
              </div>
            </div>

            {/* Provider Configuration Panel */}
            <div className="flex-1 overflow-y-auto p-10">
              <div className="max-w-2xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${activeProvider.iconColor} flex items-center justify-center shadow-lg`}>
                       <Server size={24} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">{activeProvider.name}</h1>
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <a href="#" className="hover:text-indigo-400 hover:underline flex items-center gap-1">
                           Get API Key <Globe size={12} />
                        </a>
                      </p>
                    </div>
                  </div>
                  <Toggle 
                    checked={activeProvider.enabled} 
                    onChange={() => {}} // Mock toggle
                  />
                </div>

                {/* Config Form */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  
                  {/* API Key */}
                  {activeProvider.id !== 'ollama' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">API Key</label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                          <Key size={16} />
                        </div>
                        <input 
                          type={showApiKey ? "text" : "password"}
                          value={activeProvider.apiKey}
                          readOnly
                          className="w-full bg-[#12141a] border border-border rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-mono"
                          placeholder="sk-..."
                        />
                        <button 
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1.5">Your API key is stored locally and encrypted.</p>
                    </div>
                  )}

                  {/* Base URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">API Endpoint (Base URL)</label>
                    <div className="relative">
                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                          <Globe size={16} />
                        </div>
                      <input 
                        type="text"
                        value={activeProvider.baseUrl}
                        readOnly
                        className="w-full bg-[#12141a] border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Connection Test */}
                  <div className="pt-2 pb-6 border-b border-white/5">
                     <div className="flex items-center gap-4">
                       <button 
                        onClick={handleCheckConnection}
                        disabled={isChecking}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
                          checkStatus === 'success' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-[#1a1d24] hover:bg-[#222630] text-slate-200 border border-border'
                        }`}
                       >
                         {isChecking ? (
                           <RefreshCw size={14} className="animate-spin" />
                         ) : checkStatus === 'success' ? (
                           <CheckCircle2 size={14} />
                         ) : (
                           <Zap size={14} />
                         )}
                         {isChecking ? 'Checking...' : checkStatus === 'success' ? 'Connection Verified' : 'Check Connection'}
                       </button>
                       
                       {checkStatus === 'success' && (
                         <span className="text-xs text-green-500 animate-in fade-in">Latency: 124ms</span>
                       )}
                       {checkStatus === 'error' && (
                         <span className="text-xs text-red-400 flex items-center gap-1">
                           <XCircle size={12} /> Connection failed
                         </span>
                       )}
                     </div>
                  </div>

                  {/* Models List */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Available Models</label>
                      <button className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                        <RefreshCw size={10} /> Refresh List
                      </button>
                    </div>
                    <div className="bg-[#12141a] border border-border rounded-xl overflow-hidden">
                      {activeProvider.models.map((model, idx) => (
                        <div key={model} className={`px-4 py-3 flex justify-between items-center group ${idx !== activeProvider.models.length -1 ? 'border-b border-white/5' : ''}`}>
                          <div className="flex items-center gap-3">
                             <Cpu size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                             <span className="text-sm text-slate-300 font-mono">{model}</span>
                          </div>
                          <button className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <div className="px-4 py-2 bg-white/5 border-t border-white/5">
                        <input 
                           type="text" 
                           placeholder="Add custom model ID..." 
                           className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-10 flex justify-end">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95">
                     <Save size={16} />
                     Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Standard Settings Layout for other categories
          <div className="flex-1 overflow-y-auto p-10">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{categories.find(c => c.id === activeCategory)?.label}</h1>
                  <p className="text-slate-400 text-sm">Manage your local AI environment configuration.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>

              {activeCategory === 'general' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* Data Storage Section (NEW) */}
                  <section className="bg-[#12141a] border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-bold text-white flex items-center gap-2">
                         <Database size={16} className="text-indigo-400" /> Data Storage
                       </h3>
                       <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20">SQLite Active</span>
                    </div>
                    <div className="space-y-3">
                       <div>
                         <label className="block text-xs text-slate-500 mb-1">Database Location</label>
                         <div className="flex gap-2">
                            <input type="text" readOnly value="~/.claude-workbench/data/workbench.db" className="flex-1 bg-[#0d1117] border border-border rounded-lg px-3 py-2 text-xs text-slate-300 font-mono" />
                            <button className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-xs text-slate-300">Browse</button>
                         </div>
                       </div>
                       <div className="flex gap-4 text-xs text-slate-500 pt-2">
                          <span className="flex items-center gap-1"><HardDrive size={12} /> 12.4 MB Used</span>
                          <span className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer transition-colors">Create Backup</span>
                       </div>
                    </div>
                  </section>

                  <section className="bg-[#12141a] border border-border rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Application Behavior</h3>
                    <div className="space-y-1">
                      <Toggle label="Auto-save open files" checked={autoSave} onChange={() => setAutoSave(!autoSave)} />
                      <Toggle label="Enable desktop notifications" checked={notifications} onChange={() => setNotifications(!notifications)} />
                      <Toggle label="Play sound on task completion" checked={false} onChange={() => {}} />
                      <Toggle label="Hardware Acceleration" checked={true} onChange={() => {}} />
                    </div>
                  </section>
                   <section className="bg-[#12141a] border border-border rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Privacy</h3>
                    <div className="space-y-1">
                      <Toggle label="Send anonymous telemetry" checked={telemetry} onChange={() => setTelemetry(!telemetry)} />
                      <Toggle label="Allow local network discovery" checked={true} onChange={() => {}} />
                    </div>
                  </section>
                </div>
              )}
              
              {activeCategory === 'editor' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <section className="bg-[#12141a] border border-border rounded-xl p-6">
                    <div className="space-y-4">
                       <Select label="Font Family" value="JetBrains Mono" options={['JetBrains Mono', 'Fira Code', 'Consolas', 'Menlo']} />
                       <Slider label="Font Size" value={14} min={10} max={24} unit="px" />
                       <Slider label="Line Height" value={1.5} min={1} max={2} unit="em" />
                    </div>
                   </section>
                    <section className="bg-[#12141a] border border-border rounded-xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Visuals</h3>
                    <div className="space-y-1">
                      <Toggle label="Show Minimap" checked={true} onChange={() => {}} />
                      <Toggle label="Render Whitespace" checked={false} onChange={() => {}} />
                      <Toggle label="Bracket Pair Colorization" checked={true} onChange={() => {}} />
                    </div>
                  </section>
                 </div>
              )}

              {/* Other Categories Placeholder */}
              {(activeCategory === 'terminal' || activeCategory === 'security') && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-white/5 rounded-xl">
                  <Monitor size={48} className="mb-4 opacity-20" />
                  <p>Settings for {activeCategory} are coming soon.</p>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddProvider}
        onClose={() => setShowAddProvider(false)}
        title="Add Custom Provider"
        footer={
          <>
             <button onClick={() => setShowAddProvider(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
             <button onClick={() => setShowAddProvider(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Save</button>
          </>
        }
      >
         <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Provider Name</label>
               <input type="text" className="w-full bg-[#12141a] border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" placeholder="e.g., LocalAI" />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Base URL</label>
               <input type="text" className="w-full bg-[#12141a] border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono" placeholder="http://localhost:8080" />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">API Key (Optional)</label>
               <input type="password" className="w-full bg-[#12141a] border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono" />
            </div>
         </div>
      </Modal>

    </div>
  );
};
