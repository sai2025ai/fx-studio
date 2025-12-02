
export interface ApiParam {
  id: string;
  name: string;
  in: 'path' | 'query' | 'body' | 'header' | 'cookie';
  type: string;
  required: boolean;
  desc: string;
  example?: string;
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description?: string;
  folder?: string;
  requestParams: ApiParam[];
  responseParams: ApiParam[];
  responseJson: string;
}

export interface RuleExample {
  type: 'positive' | 'negative';
  content: string;
  explanation: string;
}

export interface Screen {
  id: string;
  name: string;
  width: number;
  height: number;
  url?: string;
  lastEdited: string;
}

// --- New Tech Spec Types ---

export interface UIAnnotation {
  id: string;
  target: 'search_area' | 'action_bar' | 'table_header' | 'table_row' | 'pagination' | 'modal_footer' | 'form_area'; 
  type: 'new' | 'modify' | 'delete';
  label: string;
  description: string;
}

export interface TechSpecDetailItem {
  id: string;
  label: string; 
  value: string; 
  desc?: string; 
  type: 'component' | 'api' | 'field' | 'validation' | 'permission';
  tags?: string[];
}

export interface TechSpecDetailCategory {
  id: string;
  title: string; 
  items: TechSpecDetailItem[];
}

export interface TechSpecView {
  id: string;
  type: 'page' | 'modal' | 'drawer' | 'sidebar';
  name: string; 
  description?: string;
  layout: { x: number; y: number; w: number; h: number; z: number };
  details: TechSpecDetailCategory[];
  annotations?: UIAnnotation[]; // Added annotations
}

export interface TechSpecRoute {
  id: string;
  path: string;
  name: string; 
  status: 'new' | 'modified' | 'unchanged';
  views: TechSpecView[];
}

export interface TechSpecContent {
  routes: TechSpecRoute[];
}

export interface TestCaseContent {
  environment: {
    url: string;
    user: string;
    dbState: string;
  };
  stats: {
    total: number;
    passed: number;
    coverage: string;
  };
  scenarios: {
    id: string;
    title: string;
    priority: 'P0' | 'P1' | 'P2';
    status: 'pass' | 'fail' | 'block' | 'pending';
    type: 'manual' | 'auto';
    steps: string[];
  }[];
}

export interface Resource {
  id: string;
  title: string;
  source: 'Feishu' | 'MasterGo' | 'System' | 'Swagger' | 'Github' | 'Engineering' | 'QA';
  type: 'doc' | 'design' | 'api' | 'rule' | 'tech' | 'qa';
  updated: string;
  status: 'synced' | 'syncing' | 'error' | 'active';
  scope: 'Global' | 'enterprise-admin' | 'data-center'; 
  iteration?: string; 
  ruleLevel?: 'Mandatory' | 'Recommended';
  content?: string;
  examples?: RuleExample[];
  screens?: Screen[];
  endpoints?: ApiEndpoint[];
  baseUrl?: string;
  techSpec?: TechSpecContent;
  testPlan?: TestCaseContent;
}
