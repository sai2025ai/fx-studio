
import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  NodeProps,
  Handle,
  Position,
  BackgroundVariant
} from 'reactflow';
import { 
  BookOpen, FileText, Globe, RefreshCw, ArrowRight, 
  Code2, Bot, FolderGit2, ChevronDown,
  ChevronRight, Shield, Plus, LayoutGrid, Webhook,
  MoreHorizontal, Maximize2, Clock, BoxSelect, ImageOff,
  Search, Copy, Server, Link as LinkIcon, Table, Play, Settings,
  Filter, Layers, Zap, FileJson, Hash, AlignLeft,
  Braces, Box, Type, Folder, FolderOpen, BrainCircuit,
  Sparkles, Layout, GitBranch, CheckCircle2, File,
  Paperclip, Eye, ChevronLeft, Loader2, Info as InfoIcon,
  Cpu, GitCommit, Workflow, Lock, Database, ListChecks,
  Monitor, Smartphone, PlayCircle, XCircle, AlertTriangle,
  FileCode, Check, MousePointer2, Activity
} from 'lucide-react';
import { Modal, LoadingButton, Toast, MarkdownRenderer } from './SharedUI';
import { Card } from './ui/layout';
import { cn } from '../lib/utils';
import { ContextScope } from '../types';

// --- Interfaces ---

interface ApiParam {
  id: string;
  name: string;
  in: 'path' | 'query' | 'body' | 'header' | 'cookie';
  type: string;
  required: boolean;
  desc: string;
  example?: string;
}

interface ApiEndpoint {
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

interface RuleExample {
  type: 'positive' | 'negative';
  content: string;
  explanation: string;
}

interface Screen {
  id: string;
  name: string;
  width: number;
  height: number;
  url?: string;
  lastEdited: string;
}

interface TechSpecContent {
  routing: {
    path: string;
    file: string;
    permission: string;
    layout: string;
  };
  components: {
    id: string;
    name: string;
    type: 'layout' | 'view' | 'component' | 'atom';
    desc: string;
    props?: string;
    children?: TechSpecContent['components'];
  }[];
  dataMatrix: {
    id: string;
    uiElement: string;
    interaction: string;
    api: string;
    params: string;
    response: string;
  }[];
}

interface TestCaseContent {
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

interface Resource {
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
  // New Fields
  techSpec?: TechSpecContent;
  testPlan?: TestCaseContent;
}

// --- Mock Data (B-Side Admin) ---

const initialResources: Resource[] = [
  // --- Global Context ---
  {
    id: 'g1',
    title: 'TypeScript 严格模式规范',
    source: 'System',
    type: 'rule',
    updated: '刚刚',
    status: 'active',
    scope: 'Global',
    iteration: 'Global Standards',
    ruleLevel: 'Mandatory',
    content: '所有业务代码必须严格遵守 TypeScript Strict Mode。禁止使用 `any` 类型，所有接口请求与响应必须定义详细的 Interface。',
    examples: [
      { type: 'negative', content: 'const userData: any = await getUser(id);', explanation: '严禁使用 any 绕过类型检查。' },
      { type: 'positive', content: 'interface UserVO { id: number; username: string; }\nconst data: UserVO = ...', explanation: '必须定义清晰的 VO/DTO。' }
    ]
  },
  {
    id: 'g2',
    title: '安全红线：数据权限控制',
    source: 'System',
    type: 'rule',
    updated: '1周前',
    status: 'active',
    scope: 'Global',
    iteration: 'Global Standards',
    ruleLevel: 'Mandatory',
    content: '所有增删改查接口必须经过 DataScope 过滤器，防止越权访问。前端必须使用 v-auth 指令控制按钮显示。'
  },

  // --- Enterprise Admin Context ---
  // Iteration: V1.0 系统基础模块
  {
    id: 'ea_prd_1',
    title: 'PRD: 系统管理模块 V1.0',
    source: 'Feishu',
    type: 'doc',
    updated: '10分钟前',
    status: 'synced',
    scope: 'enterprise-admin',
    iteration: 'V1.0 系统基础模块',
    content: `| 修订时间       | 修订人 | 修订内容              | 状态 |
| ---------- | --- | ----------------- | -- |
| 2025-11-19 | 黎玲敏 | 创建文档              |    |
| 2025-11-24 | 黎玲敏 | 应用列表录入主体信息时新增确认弹窗 |    |

# 需求概览

## auto. 背景与目标

**需求背景**

目前乐读有较多公司主体，申报税务时是以公司主体维度申报，目前后台的数据统计都是小程序维度的，财务侧核对税务申报金额时，目前难以统计公司主体维度每个月有多少金额，现需新增公司主体维度的数据用户充值金额统计数据



**需求目标**

新增公司主体维度数据，为财务税务核对提供业务数据依据



## 2. 需求分析

* 主体信息目前没有维护统一的，新增小程序自定义填写，考虑新增维护单独的主体数据，新增应用时主体只能选择——目前的交互新增主体时会先校验系统是否存在，不存在才会新增，可无需单独维护主体数据

* 短剧、快应用目前未记录主体数据，需新增维护：**快应用无需统计**

* 各产品线不同应用的主体信息是否是同一套数据：待确认

  * 目前是互相独立的，需进行合并

| 应用    | 现状                           |
| ----- | ---------------------------- |
| 小说小程序 | 小程序列表-录入小程序时输入先检索，若无匹配的可直接新增 |
| 快应用   | 快应用新增时记录主体信息                 |
| 快手服务号 | 快手服务号新增时未记录主体信息              |
| 短剧小程序 | 小程序列表-录入小程序时输入先检索，若无匹配的可直接新增 |



# 功能清单

| 模块          | 功能点                | 优先级 |
| ----------- | ------------------ | --- |
| 短剧小程序列表     | 短剧小程序列表新增展示公司主体    | 1   |
| ~~小说快应用列表~~ | ~~新增快应用时录入公司主体信息~~ | 1   |
| 快手服务号列表     | 新增快手服务号时录入公司主体信息   | 1   |
| 小程序天级数据     | 新增显示平台和公司主体        | 2   |
| 公司主体数据      | 新增菜单：支持按公司维度统计充值数据 | 1   |



# 需求描述

**注：以下需求乐读和享读同步实现**

## 1. 公司主体信息录入

### 1.1 **公司主体信息合并**

* 目前不同应用（如：小说小程序、短剧小程序）的公司主体信息是互相独立的，如小说小程序下有海南乐读主体，短剧小程序下有海南乐读主体，实际上是同一个主体，但数据库是2条独立的数据；需将不同应用下的主体信息合并为同一套

  * 导出现有的小程序与主体名称关系列表

  * 将不同应用的公司主体名称合集去重

  * 再按原来导出的关系列表，根据名称重新标记小程序关联的公司主体

* 各产品线公司主体数据[ 小程序企业主体名称](https://bscm8888.feishu.cn/wiki/IxeTwRgK8i8GXCk1zCSclGmhntb?from=from_copylink)

\`\`\`sql
-- 公众号
SELECT wgi.id AS '公众号ID',wgi.gzh_name AS '公众号名称',wc.company_name AS '公司主体' FROM \`wx_gzh_info\` wgi LEFT JOIN wx_company wc ON wgi.company_id=wc.id;
-- 公众号小程序
SELECT wmi.id AS '小程序ID',wmi.mp_name AS '小程序名称',wmi.appid AS 'appid',wc.company_name AS '公司主体' FROM wx_mp_info wmi LEFT JOIN wx_company wc ON wmi.company_id=wc.id;
-- 小说小程序
SELECT wi.id AS '小程序ID',wi.wp_name AS '小程序名称',wi.appid AS 'appid',wc.companyname AS '公司主体' FROM wp_info wi LEFT JOIN wp_company wc ON wi.company_id=wc.id;
-- 短剧小程序
SELECT wmi.id AS '小程序ID',wmi.mp_name AS '小程序名称',wmi.appid AS 'appid',vmc.companyname AS '公司主体' FROM vd_mp_info wmi LEFT JOIN vd_mp_company vmc ON wmi.company_id=vmc.id;
\`\`\`

[ 公司主体数据](https://bscm8888.feishu.cn/wiki/Q4GYwQEbmik1Wxkbeimc5sdPnmd?sheet=5808a1)

### 1.2 短剧小程序：

* 列表新增展示公司主体（新增小程序时已录入）

* 新增支持**导出**列表

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=MGZjZWI0Y2NlYmVlZDg1MDg2ZjY0YzcwNDAwYWU5Y2ZfZ0Y1ZnlsYXZXS1VDeUI0Wkg2RzkxbDNocVNLTERmdGdfVG9rZW46UzlVbmJSQk5lb2txRnZ4eUlOY2Nrb3JabkdnXzE3NjQwNjkyMDM6MTc2NDA3MjgwM19WNA)

### 1.3 ~~小说快应用（快应用暂无需处理）~~

* 列表新增显示快应用所属主体（不同应用厂商的主体不一样？？，待确认）

* 新建快应用时新增录入公司主体（必填），交互同小说小程序选择主体（输入支持搜索和新增的下拉筛选框）

* 新增支持导出列表

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=NmM1NjNlZTkwYjVmNGM0NWE3MWNkMmZhMTkxMjE2MGVfc1dMUlc0bkR2ZDdpUXRFMEExR0NXc3AyYXd3d3hmVUhfVG9rZW46UllrNmJGdlZnbzJtc0R4SmhJVmNhNmZ6blpmXzE3NjQwNjkyMDM6MTc2NDA3MjgwM19WNA)

### 1.4 **快手服务号**

* 列表新增显示快手服务号所属主体

* 新建快手服务号时新增录入公司主体（必填），交互同小说小程序选择主体（输入支持搜索和新增的下拉筛选框）

* 新增支持导出列表

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=NDAyMWQwMDhiMTVmY2ZhZWEzMGRkYWFjY2NiM2IxYjRfd1laN0xlN0pwNUVPd0pYTWxUdkpVa3FhdXFOMXRMbzJfVG9rZW46VXV5bGJPb0V5b3B4Vzl4bTJheGM1SjBVbnNjXzE3NjQwNjkyMDM6MTc2NDA3MjgwM19WNA)

## 2. 小说小程序天级数据：新增数据显示

**筛选项：**

**列表：**

**范围：**

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=MjJlMzMyMjA4MWQyYjIxOWZhYzI3OTc1ZWJkOGEwMzVfRUp3WE5WVDByc0RaTnJqOXJudzFncnJzTDFYQ2pGSk1fVG9rZW46Tmhjc2JnMG00b3FlSk14SXU4emM5a2dnbnJkXzE3NjQwNjkyMDM6MTc2NDA3MjgwM19WNA)

## 3. （11/22）短剧小程序天级数据：新增数据显示

**筛选项：**

**列表：**

**范围：**

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=Yjg4YzIzMjMzMDgyYzdhYTg0YjgzYThiMTVlYmUyNGFfYUpxWHZjVVJCMVp0Vk02cHY1TEgzSkJMaG9ya1Z5MURfVG9rZW46QjNnZmJwaUNYbzNpM1d4aTMwR2MxR09qblpnXzE3NjQwNjkyMDM6MTc2NDA3MjgwM19WNA)

## 4. （11/22）快手native天级统计

**筛选项：**

**列表：**

**范围：**

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=NWE1N2RhNTVkOGY2NDVlMDcxNWFhMjU4NzBiZDZiZGRfM0pIb0FDZ2o2ZDQ0MkZoQ0pCYkF1M3E2UU5EOG5GY2FfVG9rZW46V1ppaWJseEhrbzJTc2t4ZXhQM2NLYXlhblJkXzE3NjQwNjkyMDM6MTc2NDA3MjgwM19WNA)

## 5. **公司主体数据统计：新增菜单**

**筛选项：**

**列表：**

* **操作**：支持导出

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGQ5ZDg5ZjA0NTlhZTM2NzJiMmU2MGFlMzM5ZjhhYmFfaXF3cmVMazZKeG5NNE40TGpJZ240WXcwSUd0OWtFa1BfVG9rZW46VXRQV2JDYXdZb0JDT0l4YTRQV2M4M2xJbjRmXzE3NjQwNjkyMDM6MTc2NDA3MjgwM19WNA)



## ——————

## 6. （11/24）应用列表新增应用录入时新增确认弹窗

* 触发时机：点击**新增/编辑**小程序、快手服务号弹窗中的确认按钮再弹窗提示

* 涉及范围：

  * 整合后台：小说小程序列表、短剧小程序列表、快手服务号列表

  * 微信h5后台：小程序管理列表

  * 享读后台：小说小程序列表、快手服务号列表

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=ZmQ3ZTQyMjczNTZkNTQ0MjcyNzJmNmEyMmNkMmY5MDJfVlgzRDA0ZnVWNk1uQ3hUaWthdk1iS3lIYmtHRzZLN0ZfVG9rZW46TFRJcWJvaVJyb3lFV054SXNiMmNYTkpXbktkXzE3NjQwNjkyMDM6MTc2NDA3MjgwM19WNA)

## 7. **（11/25）**&#x516C;司主体数据页面数据新增千分符号

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=Yjg5Zjg4M2NiZGRlN2M5MTM1OTAwNGY0YTM4MjcxMjFfZ01VTDc2YXZYbjhKWlBYandxN2tRS1hYVHdHanVSZEhfVG9rZW46SDE3TWJSYTdLb2VHdm54ZTdmQmM3a01lbk9kXzE3NjQwNjkyMDM6MTc2NDA3MjgwM19WNA)

# 开发文档

> 建立联系：功能点 > 系统模块 > 开发文档

| 功能点 | 项目 | 模块 | 模块文档 MOD | 开发文档 DEV | 开发者 | 状态 |
| --- | -- | -- | -------- | -------- | --- | -- |



# 测试验收计划

> 测试文档：把测试的问题做记录。



# 发布计划

> 考虑用户影响，数据影响



**上线计划：**

* 首先：

* 其次：

* 第三步：



**回滚计划：**



**上线检查清单：**



**更新项目发布日志：**

* [ 飞碟发布日志](https://bscm8888.feishu.cn/wiki/CrAAwFRNfiGY5xkPv4Pcfm2jnGc)

* [ 乐读项目管理&发布日志](https://bscm8888.feishu.cn/wiki/IFrOwXoS4iaiPWkFICMcgJz9n6S)



# 需求沟通记录
`
  },
  {
    id: 'ea_tech_1',
    title: 'Tech Spec: RBAC 权限实现',
    source: 'Engineering',
    type: 'tech',
    updated: '20分钟前',
    status: 'active',
    scope: 'enterprise-admin',
    iteration: 'V1.0 系统基础模块',
    techSpec: {
      routing: {
        path: '/system/user',
        file: 'src/views/system/user/index.vue',
        permission: 'system:user:list',
        layout: 'Layout'
      },
      components: [
        {
          id: 'c1',
          name: 'UserIndex',
          type: 'view',
          desc: '用户管理主视图，包含左侧部门树和右侧用户表格。',
          children: [
            { id: 'c2', name: 'DeptTree', type: 'component', desc: '左侧部门树形筛选器，支持搜索。', props: 'onSelect' },
            { id: 'c3', name: 'UserSearch', type: 'component', desc: '顶部搜索表单区域。' },
            { id: 'c4', name: 'ProTable', type: 'component', desc: '封装的高级表格，支持分页、排序、列设置。' },
            { id: 'c5', name: 'UserModal', type: 'component', desc: '新增/编辑用户的弹窗表单。' }
          ]
        }
      ],
      dataMatrix: [
        { id: 'd1', uiElement: 'UserModal > Submit', interaction: 'Click', api: 'POST /system/user', params: '{ username, deptId, roleIds... }', response: '200 OK -> Refresh Table' },
        { id: 'd2', uiElement: 'DeptTree', interaction: 'SelectNode', api: 'GET /system/user/list', params: '?deptId=101', response: 'Update Table Data' },
        { id: 'd3', uiElement: 'Table > Switch', interaction: 'Change', api: 'PUT /system/user/changeStatus', params: '{ userId, status }', response: 'Toast Success' }
      ]
    }
  },
  {
    id: 'ea_api_1',
    title: 'System Management API',
    source: 'Swagger',
    type: 'api',
    updated: '5分钟前',
    status: 'synced',
    scope: 'enterprise-admin',
    iteration: 'V1.0 系统基础模块',
    baseUrl: 'https://api.enterprise.com/v1',
    endpoints: [
      {
        id: 'ep1',
        method: 'GET',
        path: '/system/user/list',
        summary: '查询用户列表',
        description: '分页查询用户列表，支持多条件筛选。',
        folder: 'System',
        requestParams: [
          { id: 'p1', name: 'pageNum', in: 'query', type: 'integer', required: true, desc: '页码', example: '1' },
          { id: 'p2', name: 'pageSize', in: 'query', type: 'integer', required: true, desc: '每页数量', example: '10' },
          { id: 'p3', name: 'username', in: 'query', type: 'string', required: false, desc: '用户名', example: 'admin' },
          { id: 'p4', name: 'deptId', in: 'query', type: 'integer', required: false, desc: '部门ID', example: '103' }
        ],
        responseParams: [
           { id: 'r1', name: 'total', in: 'body', type: 'integer', required: true, desc: '总记录数', example: '100' },
           { id: 'r2', name: 'rows', in: 'body', type: 'array', required: true, desc: '数据列表', example: '[{...}]' }
        ],
        responseJson: `{\n  "code": 200,\n  "msg": "success",\n  "data": {\n    "total": 12,\n    "rows": [\n      { "userId": 1, "userName": "admin", "nickName": "管理员" }\n    ]\n  }\n}`
      },
      {
        id: 'ep2',
        method: 'POST',
        path: '/system/user',
        summary: '新增用户',
        description: '创建新的系统用户，密码默认为 123456。',
        folder: 'System',
        requestParams: [
          { id: 'add_p1', name: 'userName', in: 'body', type: 'string', required: true, desc: '登录账号', example: 'zhangsan' },
          { id: 'add_p2', name: 'nickName', in: 'body', type: 'string', required: true, desc: '用户昵称', example: '张三' },
          { id: 'add_p3', name: 'roleIds', in: 'body', type: 'array', required: false, desc: '关联角色ID', example: '[2]' }
        ],
        responseParams: [],
        responseJson: `{\n  "code": 200,\n  "msg": "操作成功"\n}`
      }
    ]
  },
  {
    id: 'ea_qa_1',
    title: 'QA Plan: 用户管理验收',
    source: 'QA',
    type: 'qa',
    updated: '1小时前',
    status: 'active',
    scope: 'enterprise-admin',
    iteration: 'V1.0 系统基础模块',
    testPlan: {
      environment: {
        url: 'https://admin-sit.enterprise.com',
        user: 'admin / 123456',
        dbState: 'Snapshot V1.2'
      },
      stats: {
        total: 24,
        passed: 22,
        coverage: '88%'
      },
      scenarios: [
        { id: 't1', title: '管理员可成功创建新用户', priority: 'P0', status: 'pass', type: 'auto', steps: ['进入用户管理页面', '点击新增按钮', '填写必填项', '点击提交', '列表应显示新用户'] },
        { id: 't2', title: '用户名重复时应提示错误', priority: 'P1', status: 'pass', type: 'auto', steps: ['新增用户', '输入已存在的用户名', '提交', '提示"登录账号已存在"'] },
        { id: 't3', title: '停用用户后该用户无法登录', priority: 'P0', status: 'pass', type: 'manual', steps: ['列表停用某用户', '使用该用户尝试登录', '提示"账号已停用"'] },
        { id: 't4', title: '普通角色无法看到"删除"按钮', priority: 'P1', status: 'fail', type: 'manual', steps: ['登录普通账号', '查看用户列表', '检查操作列', '删除按钮应隐藏'] },
      ]
    }
  },
  {
    id: 'ea_design_1',
    title: 'UI Design: 系统设置',
    source: 'MasterGo',
    type: 'design',
    updated: '刚刚',
    status: 'synced',
    scope: 'enterprise-admin',
    iteration: 'V1.0 系统基础模块',
    screens: [
      { 
        id: 's1', 
        name: 'User_List_Table', 
        width: 1920, 
        height: 1080, 
        lastEdited: '1小时前',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop' 
      },
      { 
        id: 's2', 
        name: 'Role_Permission_Dialog', 
        width: 800, 
        height: 600, 
        lastEdited: '2小时前',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=2555&auto=format&fit=crop' 
      }
    ]
  },

  // --- Data Center Context ---
  {
    id: 'dc_1',
    title: 'Data Warehouse Schema',
    source: 'Engineering',
    type: 'doc',
    updated: '3天前',
    status: 'synced',
    scope: 'data-center',
    iteration: 'Q1 Reporting',
    content: 'TBD'
  },
];

const ResourceIcon = ({ type, source, className }: { type: string, source: string, className?: string }) => {
  const size = 14;
  if (type === 'rule') return <Shield size={size} className={className} />;
  if (type === 'api') return <Webhook size={size} className={className} />;
  if (type === 'tech') return <Code2 size={size} className={className} />;
  if (type === 'qa') return <ListChecks size={size} className={className} />;
  if (source === 'MasterGo') return <LayoutGrid size={size} className={className} />;
  if (source === 'Feishu') return <FileText size={size} className={className} />;
  return <Globe size={size} className={className} />;
};

const MethodBadge = ({ method, size = 'sm' }: { method: string, size?: 'sm' | 'lg' }) => {
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

// --- Design Node Component ---
const DesignNode = ({ data }: NodeProps) => {
  return (
    <div className="group relative">
       <div className="absolute -inset-1 rounded-xl bg-indigo-500/0 group-hover:bg-indigo-500/20 transition-colors pointer-events-none"></div>
       <div className="relative bg-[#1e1e1e] border border-[#333] rounded-lg shadow-2xl overflow-hidden transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/10">
          <div className="px-3 py-2 bg-[#252525] border-b border-[#333] flex items-center justify-between">
             <div className="flex items-center gap-2">
                <LayoutGrid size={12} className="text-purple-400" />
                <span className="text-[10px] font-bold text-slate-300 truncate max-w-[150px]">{data.name}</span>
             </div>
             <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                <span>{data.width}x{data.height}</span>
             </div>
          </div>
          <div className="relative group/img cursor-default bg-[#121212]">
            <div style={{ width: '100%', minWidth: '400px', height: '300px' }}>
              {data.url ? (
                 <img src={data.url} alt={data.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-600"><ImageOff size={32} /></div>
              )}
            </div>
          </div>
       </div>
       <Handle type="target" position={Position.Left} className="!bg-transparent !border-none" />
       <Handle type="source" position={Position.Right} className="!bg-transparent !border-none" />
    </div>
  );
};
const nodeTypes = { designScreen: DesignNode };

// --- Tech Spec Viewer (New) ---
const TechSpecViewer = ({ spec }: { spec: TechSpecContent }) => {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#09090b]/50">
      
      {/* Top Bar: Routing & Architecture */}
      <div className="p-6 border-b border-white/5 bg-[#12141a]/50 shrink-0">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
           <GitBranch size={14} className="text-orange-400" /> Routing & Architecture
        </h3>
        <div className="grid grid-cols-4 gap-4">
           <div className="p-3 bg-[#1a1d24] border border-white/5 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Route Path</div>
              <div className="text-sm font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded inline-block">
                {spec.routing.path}
              </div>
           </div>
           <div className="p-3 bg-[#1a1d24] border border-white/5 rounded-lg col-span-2">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Physical File</div>
              <div className="text-sm font-mono text-slate-300 flex items-center gap-2">
                 <FileCode size={14} className="text-blue-400" />
                 {spec.routing.file}
              </div>
           </div>
           <div className="p-3 bg-[#1a1d24] border border-white/5 rounded-lg">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Permission</div>
              <div className="flex items-center gap-2">
                 <Lock size={12} className="text-amber-400" />
                 <span className="text-sm text-slate-300">{spec.routing.permission}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Component Topology */}
        <div className="flex-1 p-6 overflow-y-auto border-r border-white/5">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers size={14} className="text-indigo-400" /> Component Topology
           </h3>
           
           <div className="space-y-4">
              {spec.components.map(comp => (
                 <div key={comp.id} className="relative">
                    {/* Root Node */}
                    <div className="p-4 bg-[#1a1d24] border border-indigo-500/30 rounded-xl relative z-10 shadow-lg shadow-black/20">
                       <div className="flex items-center gap-2 mb-2">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">{comp.type}</span>
                          <span className="text-sm font-bold text-white">{comp.name}</span>
                       </div>
                       <p className="text-xs text-slate-400">{comp.desc}</p>
                    </div>

                    {/* Children */}
                    {comp.children && (
                       <div className="pl-8 pt-4 space-y-4 relative">
                          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10"></div>
                          {comp.children.map(child => (
                             <div key={child.id} className="relative">
                                <div className="absolute -left-4 top-6 w-4 h-px bg-white/10"></div>
                                <div className="p-3 bg-[#15171c] border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                                   <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                         <Box size={12} className="text-slate-500" />
                                         <span className="text-xs font-bold text-slate-200">{child.name}</span>
                                      </div>
                                      <span className="text-[10px] text-slate-600 uppercase">{child.type}</span>
                                   </div>
                                   <div className="text-[10px] text-slate-500 mb-2">{child.desc}</div>
                                   {child.children && (
                                      <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                                         {child.children.map(atom => (
                                            <span key={atom.id} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400 border border-white/5 flex items-center gap-1">
                                               <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                               {atom.name}
                                            </span>
                                         ))}
                                      </div>
                                   )}
                                </div>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </div>

        {/* Right: Data Matrix */}
        <div className="w-[450px] bg-[#0f1117]/30 p-6 overflow-y-auto">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Database size={14} className="text-emerald-400" /> Data Interaction Matrix
           </h3>
           
           <div className="space-y-3">
              {spec.dataMatrix.map(item => (
                 <div key={item.id} className="bg-[#1a1d24] border border-white/5 rounded-lg p-3 hover:border-emerald-500/30 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-white flex items-center gap-2">
                          <MousePointer2 size={12} className="text-slate-500" /> {item.uiElement}
                       </span>
                       <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400 border border-white/5">{item.interaction}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 my-2 px-2 py-1.5 bg-[#0f1117] rounded border border-white/5 font-mono text-[10px] text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                       <Server size={10} /> {item.api}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-white/5">
                       <div>
                          <span className="text-[9px] text-slate-500 uppercase block mb-1">Payload</span>
                          <span className="text-[10px] text-slate-300 font-mono bg-white/5 px-1 rounded">{item.params}</span>
                       </div>
                       <div>
                          <span className="text-[9px] text-slate-500 uppercase block mb-1">Response / Action</span>
                          <span className="text-[10px] text-slate-300">{item.response}</span>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

// --- Test Cases Viewer (New) ---
const TestCasesViewer = ({ plan }: { plan: TestCaseContent }) => {
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail'>('all');

  return (
     <div className="h-full flex flex-col overflow-hidden bg-[#09090b]/50">
        
        {/* Environment Header */}
        <div className="p-6 border-b border-white/5 bg-[#12141a]/50 shrink-0 grid grid-cols-3 gap-6">
           <div className="col-span-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Globe size={14} className="text-blue-400" /> Test Environment
              </h3>
              <div className="flex gap-4">
                 <div className="flex-1 bg-[#1a1d24] border border-white/5 rounded-lg p-3 flex items-center justify-between group">
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase mb-1">Base URL</div>
                       <div className="text-sm text-blue-400 underline decoration-blue-400/30 underline-offset-4">{plan.environment.url}</div>
                    </div>
                    <button className="p-1.5 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors"><Copy size={12} /></button>
                 </div>
                 <div className="flex-1 bg-[#1a1d24] border border-white/5 rounded-lg p-3 flex items-center justify-between">
                    <div>
                       <div className="text-[10px] text-slate-500 uppercase mb-1">Test User</div>
                       <div className="text-sm text-slate-300 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                          {plan.environment.user}
                       </div>
                    </div>
                    <button className="p-1.5 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors"><Copy size={12} /></button>
                 </div>
              </div>
           </div>
           
           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Activity size={14} className="text-purple-400" /> Coverage
              </h3>
              <div className="flex gap-2 items-center">
                 <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[88%]"></div>
                 </div>
                 <span className="text-xs font-bold text-green-400">{plan.stats.coverage}</span>
              </div>
              <div className="flex gap-4 mt-3">
                 <div className="text-xs text-slate-400">
                    <span className="text-white font-bold">{plan.stats.passed}</span> Passed
                 </div>
                 <div className="text-xs text-slate-400">
                    <span className="text-white font-bold">{plan.stats.total}</span> Total
                 </div>
              </div>
           </div>
        </div>

        {/* Test Cases List */}
        <div className="flex-1 flex flex-col overflow-hidden">
           <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-[#15171c]/30">
              <div className="flex gap-2">
                 <button 
                   onClick={() => setFilter('all')}
                   className={cn("px-3 py-1 rounded-full text-[10px] font-bold border transition-colors", filter === 'all' ? "bg-white/10 text-white border-white/20" : "text-slate-500 border-transparent hover:bg-white/5")}
                 >
                    All Scenarios
                 </button>
                 <button 
                   onClick={() => setFilter('pass')}
                   className={cn("px-3 py-1 rounded-full text-[10px] font-bold border transition-colors", filter === 'pass' ? "bg-green-500/10 text-green-400 border-green-500/20" : "text-slate-500 border-transparent hover:bg-white/5")}
                 >
                    Passed
                 </button>
                 <button 
                   onClick={() => setFilter('fail')}
                   className={cn("px-3 py-1 rounded-full text-[10px] font-bold border transition-colors", filter === 'fail' ? "bg-red-500/10 text-red-400 border-red-500/20" : "text-slate-500 border-transparent hover:bg-white/5")}
                 >
                    Failed
                 </button>
              </div>
              <button className="flex items-center gap-2 text-xs text-indigo-400 hover:text-white transition-colors">
                 <PlayCircle size={14} /> Run All Tests
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {plan.scenarios.map(scenario => (
                 <div key={scenario.id} className="group bg-[#1a1d24] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
                    <div className="p-4 flex items-center gap-4">
                       {/* Status Toggle */}
                       <button className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
                          scenario.status === 'pass' ? "bg-green-500/10 border-green-500/50 text-green-500" :
                          scenario.status === 'fail' ? "bg-red-500/10 border-red-500/50 text-red-500" :
                          "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500"
                       )}>
                          {scenario.status === 'pass' && <Check size={16} />}
                          {scenario.status === 'fail' && <XCircle size={16} />}
                          {scenario.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-500"></div>}
                       </button>

                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className={cn("text-sm font-bold", scenario.status === 'pass' ? "text-slate-300" : "text-white")}>{scenario.title}</h4>
                             <span className={cn(
                                "text-[9px] px-1.5 py-0.5 rounded font-bold border",
                                scenario.priority === 'P0' ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                                scenario.priority === 'P1' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                "bg-blue-500/10 text-blue-400 border-blue-500/20"
                             )}>
                                {scenario.priority}
                             </span>
                             <span className="text-[9px] text-slate-600 uppercase bg-white/5 px-1.5 py-0.5 rounded">{scenario.type}</span>
                          </div>
                          
                          {/* Expanded Steps (Visual only for now) */}
                          <div className="text-xs text-slate-500 flex gap-2">
                             {scenario.steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-2">
                                   <span>{step}</span>
                                   {i < scenario.steps.length - 1 && <ArrowRight size={10} className="text-slate-700" />}
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>
     </div>
  );
};

// --- Dashboard Component ---

const ContextDashboard = ({ 
  scope, 
  iteration, 
  resources, 
  onSelectResource,
  onApplyContext 
}: { 
  scope: string, 
  iteration: string, 
  resources: Resource[], 
  onSelectResource: (r: Resource) => void,
  onApplyContext: () => void
}) => {
  const prds = resources.filter(r => r.type === 'doc');
  const designs = resources.filter(r => r.type === 'design');
  const apis = resources.filter(r => r.type === 'api');
  
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  // Set initial active doc
  useEffect(() => {
    if (prds.length > 0 && !activeDocId) {
      setActiveDocId(prds[0].id);
    }
  }, [prds, activeDocId]);

  const activeDoc = resources.find(r => r.id === activeDocId) || prds[0];

  return (
    <div className="flex flex-col h-full bg-transparent animate-in fade-in duration-500 overflow-hidden">
      {/* Top Header */}
      <div className="h-16 border-b border-border bg-[#0f1117]/50 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md">
         <div>
           <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1">
              <FolderGit2 size={12} /> {scope} <ChevronRight size={12} /> {iteration}
           </div>
           <h1 className="text-lg font-bold text-white flex items-center gap-3">
              {activeDoc?.title || "No Requirements Found"}
              {activeDoc && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold tracking-wide uppercase">
                  In Progress
                </span>
              )}
           </h1>
         </div>
         <div className="flex gap-3">
             <button 
               onClick={onApplyContext}
               className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
             >
                <Sparkles size={14} /> Apply to Workbench
             </button>
         </div>
      </div>

      {/* Main Content: Document + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
         
         {/* Main Document Area (The Source of Truth) */}
         <div className="flex-1 overflow-y-auto p-8 flex justify-center relative scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
             {activeDoc ? (
               <div className="max-w-3xl w-full space-y-8 pb-20">
                  
                  {/* Doc Meta */}
                  <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                     <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white text-[10px] font-bold">PM</div>
                        <span>Written by Product</span>
                     </div>
                     <div className="w-px h-3 bg-white/10"></div>
                     <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> Updated {activeDoc.updated}
                     </div>
                     <div className="w-px h-3 bg-white/10"></div>
                     <div className="text-xs text-slate-500 flex items-center gap-1">
                        <FileText size={12} /> {activeDoc.source}
                     </div>
                  </div>

                  {/* Doc Content */}
                  <MarkdownRenderer content={activeDoc.content || ''} />
                  
                  {/* Footer Actions */}
                  <div className="pt-12 mt-12 border-t border-white/5 flex justify-between">
                     <button className="text-xs text-slate-500 hover:text-white transition-colors">Previous: V0.9 Init</button>
                     <button className="text-xs text-slate-500 hover:text-white transition-colors">Next: V1.1 Roles</button>
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                  <FileText size={48} className="opacity-20" />
                  <p>No PRD document available for this iteration.</p>
               </div>
             )}
         </div>

         {/* Right Sidebar: Attachments & References */}
         <div className="w-80 border-l border-border bg-[#0f1117]/30 flex flex-col shrink-0">
            <div className="p-4 border-b border-border">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Paperclip size={12} /> Reference Material
               </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
               
               {/* Design References */}
               <div>
                  <div className="flex items-center justify-between mb-3">
                     <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <LayoutGrid size={14} className="text-purple-400" /> Visual Design
                     </h4>
                     <span className="text-[10px] text-slate-500">{designs.flatMap(d => d.screens || []).length} Screens</span>
                  </div>
                  <div className="space-y-2">
                     {designs.length > 0 ? (
                        designs.flatMap(d => d.screens || []).slice(0, 4).map(screen => (
                           <div 
                              key={screen.id} 
                              onClick={() => onSelectResource(designs[0])}
                              className="group flex items-center gap-3 p-2 bg-[#1a1d24]/50 border border-white/5 rounded-lg hover:border-purple-500/50 transition-all cursor-pointer"
                           >
                              <div className="w-10 h-8 bg-black/50 rounded overflow-hidden relative">
                                 {screen.url && <img src={screen.url} className="w-full h-full object-cover opacity-70" />}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                 <div className="text-xs text-slate-300 truncate group-hover:text-purple-300 transition-colors">{screen.name}</div>
                                 <div className="text-[10px] text-slate-600">{screen.width}x{screen.height}</div>
                              </div>
                              <Eye size={12} className="text-slate-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
                           </div>
                        ))
                     ) : (
                        <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-[10px] text-slate-600">
                           No designs attached
                        </div>
                     )}
                     {designs.length > 0 && (
                        <button onClick={() => onSelectResource(designs[0])} className="w-full py-1.5 text-[10px] text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors">
                           View all designs
                        </button>
                     )}
                  </div>
               </div>

               {/* API References */}
               <div>
                  <div className="flex items-center justify-between mb-3">
                     <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Webhook size={14} className="text-emerald-400" /> Technical Specs
                     </h4>
                     <span className="text-[10px] text-slate-500">{apis.flatMap(a => a.endpoints || []).length} Endpoints</span>
                  </div>
                  <div className="space-y-2">
                     {apis.length > 0 ? (
                        apis.flatMap(a => a.endpoints || []).slice(0, 5).map(ep => (
                           <div 
                              key={ep.id} 
                              onClick={() => onSelectResource(apis.find(a => a.endpoints?.includes(ep))!)}
                              className="group flex items-center gap-2 p-2 bg-[#1a1d24]/50 border border-white/5 rounded-lg hover:border-emerald-500/50 transition-all cursor-pointer"
                           >
                              <MethodBadge method={ep.method} size="sm" />
                              <span className="text-xs text-slate-400 font-mono truncate flex-1 group-hover:text-emerald-300 transition-colors">
                                 {ep.path}
                              </span>
                           </div>
                        ))
                     ) : (
                        <div className="p-4 border border-dashed border-white/10 rounded-lg text-center text-[10px] text-slate-600">
                           No APIs attached
                        </div>
                     )}
                     {apis.length > 0 && (
                        <button onClick={() => onSelectResource(apis[0])} className="w-full py-1.5 text-[10px] text-slate-500 hover:text-white hover:bg-white/5 rounded transition-colors">
                           View complete API definition
                        </button>
                     )}
                  </div>
               </div>
               
            </div>
         </div>

      </div>
    </div>
  );
};

// --- API Viewer Component ---

const ParamsTable = ({ params }: { params: ApiParam[] }) => (
  <div className="border border-border rounded-lg overflow-hidden bg-[#12141a]/50">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="bg-[#15171c]/50 border-b border-white/5">
          <th className="p-3 font-bold text-slate-500 text-xs uppercase w-48 tracking-wider">Name</th>
          <th className="p-3 font-bold text-slate-500 text-xs uppercase w-24 tracking-wider">Type</th>
          <th className="p-3 font-bold text-slate-500 text-xs uppercase w-20 tracking-wider">Required</th>
          <th className="p-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Description</th>
        </tr>
      </thead>
      <tbody>
        {params.map((param) => (
          <tr key={param.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
             <td className="p-3 font-mono text-indigo-300 font-medium align-top">
                {param.name}
                <div className="text-[10px] text-slate-500 mt-0.5 uppercase">{param.in}</div>
             </td>
             <td className="p-3 text-slate-400 align-top">
                <span className="bg-white/5 px-1.5 py-0.5 rounded text-xs font-mono">{param.type}</span>
             </td>
             <td className="p-3 align-top">
                {param.required ? (
                   <span className="text-[10px] text-red-400 border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 rounded font-medium">YES</span>
                ) : (
                   <span className="text-[10px] text-slate-500 opacity-50">NO</span>
                )}
             </td>
             <td className="p-3 text-slate-300 align-top leading-relaxed">
                {param.desc}
                {param.example && (
                   <div className="mt-1.5 flex items-start gap-2 text-xs">
                      <span className="text-slate-500 uppercase text-[10px] mt-0.5">Ex:</span>
                      <code className="bg-black/30 px-1.5 py-0.5 rounded text-slate-400 font-mono">{param.example}</code>
                   </div>
                )}
             </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ApiViewer = ({ resource }: { resource: Resource }) => {
  const [activeEndpointId, setActiveEndpointId] = useState<string | null>(resource.endpoints?.[0]?.id || null);
  const activeEndpoint = resource.endpoints?.find(e => e.id === activeEndpointId);

  return (
    <div className="flex h-full overflow-hidden bg-transparent">
       {/* Left List (Endpoints) */}
       <div className="w-72 border-r border-border bg-[#0f1117]/30 flex flex-col">
          <div className="p-4 border-b border-border bg-[#15171c]/50">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Endpoints</h3>
             <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                <input 
                  type="text" 
                  placeholder="Filter endpoints..."
                  className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-md pl-8 pr-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {resource.endpoints?.map(ep => (
               <button 
                 key={ep.id} 
                 onClick={() => setActiveEndpointId(ep.id)}
                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group ${
                    activeEndpointId === ep.id ? 'bg-[#1a1d24]/80 border border-white/10 shadow-sm' : 'hover:bg-white/5 border border-transparent'
                 }`}
               >
                  <MethodBadge method={ep.method} />
                  <div className="overflow-hidden">
                     <div className={`text-xs font-mono truncate ${activeEndpointId === ep.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                        {ep.path}
                     </div>
                     <div className="text-[10px] text-slate-600 truncate">{ep.summary}</div>
                  </div>
               </button>
             ))}
          </div>
       </div>

       {/* Right Detail (Documentation) */}
       <div className="flex-1 overflow-y-auto p-8">
          {activeEndpoint ? (
             <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Header Info */}
                <div>
                   <div className="flex items-center gap-3 mb-4">
                      <MethodBadge method={activeEndpoint.method} size="lg" />
                      <h2 className="text-xl font-mono text-white">{activeEndpoint.path}</h2>
                   </div>
                   <h1 className="text-2xl font-bold text-white mb-2">{activeEndpoint.summary}</h1>
                   <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{activeEndpoint.description}</p>
                </div>

                {/* Request Params (Table Format) */}
                {activeEndpoint.requestParams.length > 0 && (
                   <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                        <ArrowRight size={12} /> Request Parameters
                      </h3>
                      <ParamsTable params={activeEndpoint.requestParams} />
                   </div>
                )}

                {/* Response Params (Table Format) */}
                 {activeEndpoint.responseParams.length > 0 && (
                   <div className="space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-white/10 pb-2 flex items-center gap-2">
                        <ArrowRight size={12} /> Response Parameters
                      </h3>
                      <ParamsTable params={activeEndpoint.responseParams} />
                   </div>
                )}

                {/* Response Example JSON */}
                <div className="space-y-3">
                   <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-white/10 pb-2">Response Body (200 OK)</h3>
                   <div className="relative group">
                      <pre className="bg-[#12141a]/50 border border-border rounded-lg p-4 text-xs font-mono text-emerald-300 overflow-auto">
                         {activeEndpoint.responseJson}
                      </pre>
                      <button className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                         <Copy size={14} />
                      </button>
                   </div>
                </div>
             </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <Webhook size={48} className="opacity-20" />
                <p>Select an endpoint to view details</p>
             </div>
          )}
       </div>
    </div>
  );
};

// --- Main Manager Component ---

export const ContextManager: React.FC<{ onApplyContext?: (scope: ContextScope) => void }> = ({ onApplyContext }) => {
  // State for resources management
  const [resourcesList, setResourcesList] = useState<Resource[]>(initialResources);
  
  // Navigation State
  const [activeView, setActiveView] = useState<'dashboard' | 'resource'>('dashboard');
  const [activeScope, setActiveScope] = useState<string>('enterprise-admin');
  const [activeIteration, setActiveIteration] = useState<string>('V1.0 系统基础模块');
  const [selectedResId, setSelectedResId] = useState<string | null>(null);
  
  const [expandedIterations, setExpandedIterations] = useState<Set<string>>(new Set(['V1.0 系统基础模块']));
  const [toast, setToast] = useState<{ visible: boolean; message: string; type?: 'success' | 'error' | 'info' }>({ visible: false, message: '' });

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'doc' | 'design' | 'api' | 'tech' | 'qa'>('doc');
  const [importForm, setImportForm] = useState({
    name: '',
    url: '',
    scope: 'enterprise-admin',
    iteration: 'V1.0 系统基础模块'
  });
  const [isImporting, setIsImporting] = useState(false);

  // React Flow State for Design View
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Helper: Get resources for current view
  const iterationResources = useMemo(() => {
    return resourcesList.filter(r => r.scope === activeScope && r.iteration === activeIteration);
  }, [activeScope, activeIteration, resourcesList]);

  const selectedRes = resourcesList.find(r => r.id === selectedResId);

  // Effect: Update React Flow when Design Resource is selected
  useEffect(() => {
    if (selectedRes?.type === 'design' && selectedRes.screens) {
      const newNodes = selectedRes.screens.map((screen, index) => ({
        id: screen.id,
        type: 'designScreen',
        position: { x: index * 500 + 40, y: 40 },
        data: { ...screen },
      }));
      setNodes(newNodes);
    }
  }, [selectedResId, selectedRes, setNodes]);

  const handleApplyContext = () => {
    const newScope: ContextScope = {
      id: `scope-${Date.now()}`,
      name: activeIteration,
      project: activeScope,
      items: iterationResources.map(r => ({
          type: r.type,
          title: r.title
      }))
    };

    setToast({ visible: true, message: `Packaging context for ${activeIteration}...` });
    
    // Simulate slight processing delay for realism
    setTimeout(() => {
      if (onApplyContext) {
          onApplyContext(newScope);
      }
    }, 800);
  };

  const handleSelectResource = (res: Resource) => {
    setSelectedResId(res.id);
    setActiveView('resource');
    setActiveScope(res.scope);
    if (res.iteration) setActiveIteration(res.iteration);
  };

  const handleSelectIteration = (scope: string, iter: string) => {
    setActiveScope(scope);
    setActiveIteration(iter);
    setActiveView('dashboard');
    setSelectedResId(null);
    
    // Toggle expand
    const newExpanded = new Set(expandedIterations);
    if (newExpanded.has(iter)) newExpanded.delete(iter);
    else newExpanded.add(iter);
    setExpandedIterations(newExpanded);
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedResId(null);
  };

  const handleImportResource = () => {
    if (!importForm.name || !importForm.url) {
      setToast({ visible: true, message: 'Please complete all required fields', type: 'error' });
      return;
    }

    setIsImporting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newRes: Resource = {
        id: `new-${Date.now()}`,
        title: importForm.name,
        source: importType === 'doc' ? 'Feishu' : importType === 'design' ? 'MasterGo' : importType === 'tech' ? 'Engineering' : importType === 'qa' ? 'QA' : 'Swagger',
        type: importType,
        updated: 'Just now',
        status: 'synced',
        scope: importForm.scope as any,
        iteration: importForm.iteration,
        content: importType === 'doc' ? `Generated content from ${importForm.url}` : undefined,
        baseUrl: importType === 'api' ? importForm.url : undefined,
        screens: importType === 'design' ? [] : undefined,
        endpoints: importType === 'api' ? [] : undefined,
        techSpec: importType === 'tech' ? { routing: { path: '/', file: 'index.vue', permission: 'public', layout: 'default' }, components: [], dataMatrix: [] } : undefined,
        testPlan: importType === 'qa' ? { environment: { url: '', user: '', dbState: '' }, stats: { total: 0, passed: 0, coverage: '0%' }, scenarios: [] } : undefined
      };

      setResourcesList(prev => [...prev, newRes]);
      setIsImporting(false);
      setShowImportModal(false);
      setToast({ visible: true, message: `Successfully connected ${importForm.name} to ${importForm.iteration}` });
      
      // Reset form
      setImportForm({ name: '', url: '', scope: 'enterprise-admin', iteration: 'V1.0 系统基础模块' });
      
      // Expand the target iteration to show the new file
      setActiveScope(importForm.scope);
      setActiveIteration(importForm.iteration);
      setExpandedIterations(prev => new Set(prev).add(importForm.iteration));
      
    }, 1500);
  };

  // Sidebar Data Structure
  const sidebarStructure = useMemo(() => {
    const structure: Record<string, Record<string, Resource[]>> = {};
    resourcesList.forEach(r => {
      if (!structure[r.scope]) structure[r.scope] = {};
      const iter = r.iteration || 'General';
      if (!structure[r.scope][iter]) structure[r.scope][iter] = [];
      structure[r.scope][iter].push(r);
    });
    return structure;
  }, [resourcesList]);

  return (
    <div className="h-full flex p-4 gap-4 bg-[#09090b] font-sans overflow-hidden">
      
      {/* Context Sidebar - Tree View */}
      <Card className="w-64 shrink-0 flex flex-col glass-panel bg-[#0f1117]/80 backdrop-blur-xl border-border shadow-2xl overflow-hidden z-10">
        <div className="p-4 border-b border-border bg-[#15171c]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <BrainCircuit size={14} />
            </div>
            <span className="text-sm font-bold text-white">Context Manager</span>
          </div>
          
          {/* Add Resource Button */}
          <button 
            onClick={() => setShowImportModal(true)}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Connect Resource"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
           
           {/* Global Scope */}
           <div>
              <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                 <Globe size={10} /> Global Scope
              </div>
              <button 
                onClick={() => handleSelectIteration('Global', 'Global Standards')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors ${
                  activeScope === 'Global' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
              >
                 <Shield size={12} /> Global Standards
              </button>
           </div>

           {/* Projects Tree */}
           {Object.keys(sidebarStructure).filter(k => k !== 'Global').map(scope => (
             <div key={scope}>
                <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                   <FolderGit2 size={10} /> {scope}
                </div>
                <div className="space-y-1">
                   {Object.keys(sidebarStructure[scope]).map(iter => {
                      const isIterActive = activeScope === scope && activeIteration === iter;
                      const isExpanded = expandedIterations.has(iter);
                      
                      return (
                        <div key={iter} className="space-y-0.5">
                          {/* Iteration Folder */}
                          <button
                            onClick={() => handleSelectIteration(scope, iter)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors group ${
                              isIterActive && activeView === 'dashboard'
                                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                            }`}
                          >
                             <div className="flex items-center gap-2 truncate">
                                {isExpanded ? <FolderOpen size={14} className={isIterActive ? 'text-indigo-400' : 'text-slate-500'} /> : <Folder size={14} className="text-slate-600" />}
                                <span className="truncate">{iter}</span>
                             </div>
                             <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                          </button>
                          
                          {/* Resources List (Children) */}
                          {isExpanded && (
                             <div className="pl-4 space-y-0.5 animate-in slide-in-from-left-2 duration-200">
                                <div className="w-px bg-white/5 absolute left-5 h-full"></div>
                                {sidebarStructure[scope][iter].map(res => (
                                   <button
                                     key={res.id}
                                     onClick={() => handleSelectResource(res)}
                                     className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-left text-xs transition-colors relative ${
                                        selectedResId === res.id
                                          ? 'text-white bg-white/5' 
                                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                     }`}
                                   >
                                      <ResourceIcon type={res.type} source={res.source} className={selectedResId === res.id ? 'text-indigo-400' : 'opacity-70'} />
                                      <span className="truncate">{res.title}</span>
                                   </button>
                                ))}
                             </div>
                          )}
                        </div>
                      );
                   })}
                </div>
             </div>
           ))}
        </div>
      </Card>

      {/* Main Content Area */}
      <Card className="flex-1 flex flex-col overflow-hidden glass-panel bg-transparent border-border shadow-2xl">
         
         {activeView === 'dashboard' && (
           <ContextDashboard 
             scope={activeScope}
             iteration={activeIteration}
             resources={iterationResources}
             onSelectResource={handleSelectResource}
             onApplyContext={handleApplyContext}
           />
         )}

         {activeView === 'resource' && selectedRes && (
           <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
              {/* Resource Header */}
              <div className="h-14 border-b border-border bg-[#0f1117]/50 flex items-center justify-between px-6 shrink-0 z-10 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={handleBackToDashboard}
                       className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors"
                     >
                        <ChevronLeft size={14} /> Back to Context
                     </button>
                     <span className="text-slate-700">/</span>
                     <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <ResourceIcon type={selectedRes.type} source={selectedRes.source} />
                        {selectedRes.title}
                     </div>
                  </div>
                  <div className="flex gap-3">
                     <button className="text-slate-400 hover:text-white p-1.5 hover:bg-white/5 rounded">
                        <RefreshCw size={16} />
                     </button>
                  </div>
              </div>

              {/* Resource Content Viewer */}
              <div className="flex-1 overflow-hidden bg-[#12141a]/30 relative">
                 
                 {/* Rule Viewer */}
                 {selectedRes.type === 'rule' && (
                   <div className="absolute inset-0 overflow-y-auto p-10">
                      <div className="max-w-3xl mx-auto bg-[#0f1117]/80 border border-border rounded-xl p-8">
                         <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-6 ${selectedRes.ruleLevel === 'Mandatory' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            <Shield size={12} /> {selectedRes.ruleLevel} Rule
                         </div>
                         <h1 className="text-2xl font-bold text-white mb-4">{selectedRes.title}</h1>
                         <p className="text-slate-300 leading-relaxed mb-8">{selectedRes.content}</p>
                         {selectedRes.examples && (
                            <div className="grid gap-4">
                               {selectedRes.examples.map((ex, i) => (
                                  <div key={i} className={`p-4 rounded-lg border ${ex.type === 'positive' ? 'bg-green-500/5 border-green-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                     <div className={`text-xs font-bold uppercase mb-2 ${ex.type === 'positive' ? 'text-green-400' : 'text-rose-400'}`}>{ex.type === 'positive' ? 'Do' : "Don't"}</div>
                                     <code className="block bg-black/30 p-2 rounded text-xs font-mono text-slate-300 mb-2">{ex.content}</code>
                                     <div className="text-xs text-slate-500">{ex.explanation}</div>
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>
                   </div>
                 )}

                 {/* Tech Spec Viewer */}
                 {selectedRes.type === 'tech' && selectedRes.techSpec && (
                    <TechSpecViewer spec={selectedRes.techSpec} />
                 )}

                 {/* QA Plan Viewer */}
                 {selectedRes.type === 'qa' && selectedRes.testPlan && (
                    <TestCasesViewer plan={selectedRes.testPlan} />
                 )}

                 {/* Doc Viewer (Fallback for full view) */}
                 {selectedRes.type === 'doc' && (
                   <div className="absolute inset-0 overflow-y-auto p-10 flex justify-center">
                      <div className="max-w-4xl w-full bg-[#0f1117]/80 border border-border rounded-xl p-10 shadow-lg min-h-[800px]">
                         <MarkdownRenderer content={selectedRes.content || ''} />
                      </div>
                   </div>
                 )}

                 {/* Design Viewer */}
                 {selectedRes.type === 'design' && (
                    <ReactFlow
                       nodes={nodes}
                       edges={edges}
                       nodeTypes={nodeTypes}
                       fitView
                       className="bg-transparent"
                    >
                       <Background color="#334155" gap={20} size={1} variant={BackgroundVariant.Dots} />
                       <Controls className="!bg-[#1a1d24] !border-border !fill-slate-400" />
                       <MiniMap className="!bg-[#1a1d24] !border-border" />
                    </ReactFlow>
                 )}

                 {/* API Viewer */}
                 {selectedRes.type === 'api' && (
                    <ApiViewer resource={selectedRes} />
                 )}

              </div>
           </div>
         )}
      </Card>

      {/* Import Resource Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Connect Resource"
        maxWidth="max-w-3xl"
        footer={
           <>
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <LoadingButton 
                isLoading={isImporting}
                onClick={handleImportResource}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm shadow-lg shadow-indigo-500/20"
              >
                {isImporting ? 'Connecting...' : 'Connect'}
              </LoadingButton>
           </>
        }
      >
         <div className="space-y-6">
            {/* Type Selector Cards */}
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Resource Type</label>
               <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  <div 
                    onClick={() => setImportType('doc')}
                    className={cn(
                      "cursor-pointer p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center",
                      importType === 'doc' 
                        ? "bg-indigo-500/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                        : "bg-[#12141a] border-border text-slate-500 hover:border-slate-500 hover:bg-white/5"
                    )}
                  >
                     <FileText size={20} className={importType === 'doc' ? "text-indigo-400" : "text-slate-500"} />
                     <div className="text-[10px] font-bold">Doc</div>
                  </div>

                  <div 
                    onClick={() => setImportType('design')}
                    className={cn(
                      "cursor-pointer p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center",
                      importType === 'design' 
                        ? "bg-purple-500/10 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                        : "bg-[#12141a] border-border text-slate-500 hover:border-slate-500 hover:bg-white/5"
                    )}
                  >
                     <LayoutGrid size={20} className={importType === 'design' ? "text-purple-400" : "text-slate-500"} />
                     <div className="text-[10px] font-bold">Design</div>
                  </div>

                  <div 
                    onClick={() => setImportType('api')}
                    className={cn(
                      "cursor-pointer p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center",
                      importType === 'api' 
                        ? "bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                        : "bg-[#12141a] border-border text-slate-500 hover:border-slate-500 hover:bg-white/5"
                    )}
                  >
                     <Webhook size={20} className={importType === 'api' ? "text-emerald-400" : "text-slate-500"} />
                     <div className="text-[10px] font-bold">API</div>
                  </div>

                  <div 
                    onClick={() => setImportType('tech')}
                    className={cn(
                      "cursor-pointer p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center",
                      importType === 'tech' 
                        ? "bg-orange-500/10 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]" 
                        : "bg-[#12141a] border-border text-slate-500 hover:border-slate-500 hover:bg-white/5"
                    )}
                  >
                     <Code2 size={20} className={importType === 'tech' ? "text-orange-400" : "text-slate-500"} />
                     <div className="text-[10px] font-bold">Tech Spec</div>
                  </div>

                  <div 
                    onClick={() => setImportType('qa')}
                    className={cn(
                      "cursor-pointer p-3 rounded-xl border transition-all flex flex-col items-center gap-2 text-center",
                      importType === 'qa' 
                        ? "bg-blue-500/10 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                        : "bg-[#12141a] border-border text-slate-500 hover:border-slate-500 hover:bg-white/5"
                    )}
                  >
                     <ListChecks size={20} className={importType === 'qa' ? "text-blue-400" : "text-slate-500"} />
                     <div className="text-[10px] font-bold">Test Plan</div>
                  </div>
               </div>
            </div>

            {/* Details Input */}
            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Resource Name <span className="text-red-400">*</span></label>
                  <input 
                    type="text" 
                    value={importForm.name}
                    onChange={(e) => setImportForm({...importForm, name: e.target.value})}
                    className="w-full bg-[#12141a] border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" 
                    placeholder={importType === 'doc' ? "e.g., Auth V2 PRD" : importType === 'design' ? "e.g., Login Flows" : "e.g., Payment API"} 
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Link URL <span className="text-red-400">*</span></label>
                  <div className="relative">
                     <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                     <input 
                        type="text" 
                        value={importForm.url}
                        onChange={(e) => setImportForm({...importForm, url: e.target.value})}
                        className="w-full bg-[#12141a] border border-border rounded-lg pl-9 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500" 
                        placeholder="https://..." 
                     />
                     <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-xs bg-white/5 hover:bg-white/10 text-slate-400 rounded border border-white/5">
                        Check
                     </button>
                  </div>
               </div>
            </div>

            {/* Context Mounting */}
            <div className="pt-4 border-t border-white/5">
               <label className="block text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
                  <BrainCircuit size={12} /> Context Mounting
               </label>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Project Scope</label>
                     <select 
                        value={importForm.scope}
                        onChange={(e) => setImportForm({...importForm, scope: e.target.value})}
                        className="w-full bg-[#12141a] border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                     >
                        <option value="enterprise-admin">enterprise-admin</option>
                        <option value="data-center">data-center</option>
                        <option value="Global">Global</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Target Iteration</label>
                     <select 
                        value={importForm.iteration}
                        onChange={(e) => setImportForm({...importForm, iteration: e.target.value})}
                        className="w-full bg-[#12141a] border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                     >
                        <option value="V1.0 系统基础模块">V1.0 系统基础模块</option>
                        <option value="Q1 Reporting">Q1 Reporting</option>
                        <option value="New Sprint">Create New...</option>
                     </select>
                  </div>
               </div>
               <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                  <InfoIcon size={10} /> This resource will be automatically indexed and made available to agents working on {importForm.scope}.
               </p>
            </div>
         </div>
      </Modal>

      <Toast 
        message={toast.message} 
        isVisible={toast.visible} 
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })} 
      />
    </div>
  );
};
