
import React, { useState, useEffect, useMemo } from 'react';
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
import { Resource } from './context/types';
import { ResourceIcon, MethodBadge } from './context/shared';
import { DocViewer } from './context/viewers/DocViewer';
import { DesignViewer } from './context/viewers/DesignViewer';
import { ApiViewer } from './context/viewers/ApiViewer';
import { TechSpecViewer } from './context/viewers/TechSpecViewer';
import { TestCasesViewer } from './context/viewers/TestCasesViewer';
import { RuleViewer } from './context/viewers/RuleViewer';

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
    content: `| 修订时间       | 修订人 | 修订内容              |    |
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

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=OTY3YmQ4ZGE4MmIwZjk1NGVlMTY2ZmM1YjdhMzVjYzZfSk5ERW1hWEVlZEk1QndhU296bFVwOVY1alF2V2w4SEdfVG9rZW46UzlVbmJSQk5lb2txRnZ4eUlOY2Nrb3JabkdnXzE3NjQxMzQ1MTQ6MTc2NDEzODExNF9WNA)

### 1.3 ~~小说快应用（快应用暂无需处理）~~

* 列表新增显示快应用所属主体（不同应用厂商的主体不一样？？，待确认）

* 新建快应用时新增录入公司主体（必填），交互同小说小程序选择主体（输入支持搜索和新增的下拉筛选框）

* 新增支持导出列表

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=YzllYmY4OTVkMTA1MTRkYTRjZGYyYTM4MjFiNWJmYWJfeU53a2xIdW5QY2R0bTh1RjdQcmh2WEtCMXF3d2JpSDBfVG9rZW46UllrNmJGdlZnbzJtc0R4SmhJVmNhNmZ6blpmXzE3NjQxMzQ1MTQ6MTc2NDEzODExNF9WNA)

### 1.4 **快手服务号**

* 列表新增显示快手服务号所属主体

* 新建快手服务号时新增录入公司主体（必填），交互同小说小程序选择主体（输入支持搜索和新增的下拉筛选框）

* 新增支持导出列表

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=ZjY3OWUyNjU3ZTk2ZGE3NDBkMjQyNGFhODNmNzMzMGJfRVR2YVdtSHF0Q25LdFExYkFaV3FBRDFwZ3Y1ZlV4djZfVG9rZW46VXV5bGJPb0V5b3B4Vzl4bTJheGM1SjBVbnNjXzE3NjQxMzQ1MTQ6MTc2NDEzODExNF9WNA)

## 2. 小说小程序天级数据：新增数据显示

**筛选项：**

**列表：**

**范围：**

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=Y2NhMzIyMWIzNzNjNWZhNmJkODBhZTlmNjcyZjM2MGNfZ2oxY09wQVNwWEJ3Z053YmQ4Wk15WTV2am12Wk51aXJfVG9rZW46Tmhjc2JnMG00b3FlSk14SXU4emM5a2dnbnJkXzE3NjQxMzQ1MTQ6MTc2NDEzODExNF9WNA)

## 3. （11/22）短剧小程序天级数据：新增数据显示

**筛选项：**

**列表：**

**范围：**

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=ZDVkYzY1OTFlNDM4NTM3Y2JmYmM4MGExNmRjZmVhY2RfNW1BRXhEd2tZTVV4TVZtRVV3Ykt2R2w1UDF6aGFwU0ZfVG9rZW46QjNnZmJwaUNYbzNpM1d4aTMwR2MxR09qblpnXzE3NjQxMzQ1MTQ6MTc2NDEzODExNF9WNA)

## 4. （11/22）快手native天级统计

**筛选项：**

**列表：**

**范围：**

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=MjA3OTYzNmRmMGJlYTRjMTIyZTU1YTQ3YjFhNzdlYmFfRGJOSmE2clV0Z3V0U013Z0V2UG5QdlVTSVExQXV0ekdfVG9rZW46V1ppaWJseEhrbzJTc2t4ZXhQM2NLYXlhblJkXzE3NjQxMzQ1MTQ6MTc2NDEzODExNF9WNA)

## 5. **公司主体数据统计：新增菜单**

**筛选项：**

**列表：**

* **操作**：支持导出

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=OTY4Zjk3MWI3MDc3ODRkZTBjOTQ2NjMzYWI4ZTc3ODJfYm81R2lGbk16T212Uzh2bUR3MW5TVVpkQmhPZVF3SElfVG9rZW46VXRQV2JDYXdZb0JDT0l4YTRQV2M4M2xJbjRmXzE3NjQxMzQ1MTQ6MTc2NDEzODExNF9WNA)



## ——————

## 6. （11/24）应用列表新增应用录入时新增确认弹窗

* 触发时机：点击**新增/编辑**小程序、快手服务号弹窗中的确认按钮再弹窗提示

* 涉及范围：

  * 整合后台：小说小程序列表、短剧小程序列表、快手服务号列表

  * 微信h5后台：小程序管理列表

  * 享读后台：小说小程序列表、快手服务号列表

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=YTE1NjVjMmM1ZjkyMjQ4ODQ3MmFjMzI1YzE4ZTdmYjZfRndMbnd6cnE2UE54dXZka3lhVEpyRERMMVlYVnlrMG5fVG9rZW46TFRJcWJvaVJyb3lFV054SXNiMmNYTkpXbktkXzE3NjQxMzQ1MTQ6MTc2NDEzODExNF9WNA)

## 7. **（11/25）**&#x516C;司主体数据页面数据新增千分符号

![](https://bscm8888.feishu.cn/space/api/box/stream/download/asynccode/?code=OTI3OWE0ZTliMWRkZDE4NzZiYzcxYzQ3MzExNDI3YjdfTzdZa2phZjZtdU56dHZGbjFBR0VlR0Z2OW1JNjlyRkJfVG9rZW46SDE3TWJSYTdLb2VHdm54ZTdmQmM3a01lbk9kXzE3NjQxMzQ1MTQ6MTc2NDEzODExNF9WNA)

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
    title: 'Tech Spec: 用户管理重构',
    source: 'Engineering',
    type: 'tech',
    updated: '20分钟前',
    status: 'active',
    scope: 'enterprise-admin',
    iteration: 'V1.0 系统基础模块',
    techSpec: {
      routes: [
        {
          id: 'r1',
          path: '/system/user',
          name: 'User Management',
          status: 'modified',
          views: [
            {
              id: 'v1',
              type: 'page',
              name: 'User List Page',
              description: 'Main list view with department tree and search filters.',
              layout: { x: 5, y: 5, w: 80, h: 68, z: 1 }, // Optimized for 16:9 aspect ratio
              annotations: [
                 {
                    id: 'ann_1',
                    target: 'action_bar',
                    type: 'new',
                    label: 'Export Data',
                    description: 'Adds Excel export functionality. Calls POST /api/export/users.'
                 },
                 {
                    id: 'ann_2',
                    target: 'table_header',
                    type: 'modify',
                    label: 'Sortable Columns',
                    description: 'Enable server-side sorting for "Create Time" and "Status".'
                 },
                 {
                    id: 'ann_3',
                    target: 'search_area',
                    type: 'modify',
                    label: 'New Filter',
                    description: 'Add "Department" tree select filter to the search bar.'
                 }
              ],
              details: [
                {
                  id: 'cat1',
                  title: 'UI Structure',
                  items: [
                    { id: 'u1', label: 'Search Form', value: 'UserSearch.vue', type: 'component', desc: 'Refactored to use schema-form' },
                    { id: 'u2', label: 'Department Tree', value: 'DeptTree.vue', type: 'component' },
                    { id: 'u3', label: 'Data Table', value: 'ProTable', type: 'component', desc: 'Supports selection and sorting' }
                  ]
                },
                {
                  id: 'cat2',
                  title: 'Data Interactions',
                  items: [
                    { id: 'a1', label: 'Load List', value: 'GET /system/user/list', type: 'api', desc: 'Pagination params: page, size' },
                    { id: 'a2', label: 'Delete User', value: 'DELETE /system/user/{id}', type: 'api', desc: 'Requires confirmation' }
                  ]
                }
              ]
            },
            {
              id: 'v2',
              type: 'modal',
              name: 'Create User Modal',
              description: 'Form dialog for adding new users with validation.',
              layout: { x: 30, y: 15, w: 50, h: 28, z: 2 }, // Wider modal for horizontal form
              details: [
                {
                  id: 'cat3',
                  title: 'Form Fields',
                  items: [
                    { id: 'f1', label: 'Username', value: 'Input (Text)', type: 'field', desc: 'Required, Unique Check' },
                    { id: 'f2', label: 'Roles', value: 'Select (Multiple)', type: 'field', desc: 'Fetch from GET /system/role/list' },
                    { id: 'f3', label: 'Department', value: 'TreeSelect', type: 'field' }
                  ]
                },
                {
                  id: 'cat4',
                  title: 'Logic',
                  items: [
                    { id: 'l1', label: 'Validation', value: 'Async Username Check', type: 'validation', desc: 'Debounce 500ms' },
                    { id: 'l2', label: 'Submit', value: 'POST /system/user', type: 'api' }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'r2',
          path: '/system/role',
          name: 'Role Management',
          status: 'new',
          views: [
             {
              id: 'v3',
              type: 'page',
              name: 'Role List Page',
              description: 'Standard CRUD table for roles.',
              layout: { x: 10, y: 10, w: 80, h: 45, z: 1 },
              details: [
                 {
                    id: 'cat_r1',
                    title: 'Components',
                    items: [{id: 'rc1', label: 'Table', value: 'ProTable', type: 'component'}]
                 }
              ]
             }
          ]
        }
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

  // Helper: Get resources for current view
  const iterationResources = useMemo(() => {
    return resourcesList.filter(r => r.scope === activeScope && r.iteration === activeIteration);
  }, [activeScope, activeIteration, resourcesList]);

  const selectedRes = resourcesList.find(r => r.id === selectedResId);

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
        techSpec: importType === 'tech' ? { routes: [] } : undefined,
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
                   <RuleViewer resource={selectedRes} />
                 )}

                 {/* Tech Spec Viewer */}
                 {selectedRes.type === 'tech' && selectedRes.techSpec && (
                    <TechSpecViewer spec={selectedRes.techSpec} />
                 )}

                 {/* QA Plan Viewer */}
                 {selectedRes.type === 'qa' && selectedRes.testPlan && (
                    <TestCasesViewer plan={selectedRes.testPlan} />
                 )}

                 {/* Doc Viewer */}
                 {selectedRes.type === 'doc' && (
                   <DocViewer resource={selectedRes} />
                 )}

                 {/* Design Viewer */}
                 {selectedRes.type === 'design' && (
                    <DesignViewer resource={selectedRes} />
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
