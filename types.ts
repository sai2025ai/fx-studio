

export enum Tab {
  DASHBOARD = 'DASHBOARD',
  WORKBENCH = 'WORKBENCH',
  WORKFLOW = 'WORKFLOW',
  ASSETS = 'ASSETS',
  CONTEXT = 'CONTEXT',
  DATA = 'DATA',
  TEST = 'TEST',
  DEPLOY = 'DEPLOY',
  SETTINGS = 'SETTINGS',
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'command';
  message: string;
}

export interface Asset {
  id: string;
  title: string;
  type: 'Agent' | 'Hook' | 'Style' | 'MCP' | 'Workflow';
  description: string;
  tags: string[];
  author: string;
  updated: string;
}

export interface PlanStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description?: string;
  contextRefs?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  type: 'text' | 'plan' | 'terminal' | 'artifact';
  content: string; // Text message or summary
  data?: any; // Holds rich data like PlanStep[] or terminal output
  timestamp?: string;
}

export interface ContextScope {
  id: string;
  name: string;
  project: string;
  items: { type: 'doc' | 'design' | 'api' | 'rule' | 'tech' | 'qa', title: string }[];
}