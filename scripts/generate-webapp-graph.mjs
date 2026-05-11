import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'graphify-out')
mkdirSync(outDir, { recursive: true })

const toPosix = (p) => p.split(path.sep).join('/')
const rel = (p) => toPosix(path.relative(root, p))
const read = (p) => readFileSync(path.join(root, p), 'utf8')
const exists = (p) => existsSync(path.join(root, p))
const idOf = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

const nodes = new Map()
const edgeKeys = new Set()
const links = []
const audit = []

const communities = {
  actor: 'Actors and Roles',
  frontend: 'Frontend Shell and Routing',
  auth: 'Authentication and Authorization',
  student: 'Student Feedback Workflow',
  hod: 'HOD Form and Analytics Workflow',
  admin: 'Admin Operations',
  backend: 'Express API',
  data: 'Supabase Data Model',
  flow: 'End-to-End Product Flows',
  docs: 'Requirements and Architecture Docs',
}

function addNode(id, label, group, extra = {}) {
  if (!nodes.has(id)) {
    nodes.set(id, {
      id,
      label,
      group,
      community: communities[group] ?? group,
      file_type: extra.file_type ?? 'concept',
      source_file: extra.source_file ?? null,
      source_location: extra.source_location ?? null,
      description: extra.description ?? '',
    })
  } else {
    nodes.set(id, { ...nodes.get(id), ...extra, id, label, group, community: communities[group] ?? group })
  }
}

function addEdge(source, target, relation, confidence = 'EXTRACTED', confidence_score = 1, extra = {}) {
  if (!nodes.has(source) || !nodes.has(target)) return
  const key = `${source}->${target}:${relation}`
  if (edgeKeys.has(key)) return
  edgeKeys.add(key)
  const edge = {
    source,
    target,
    relation,
    confidence,
    confidence_score,
    weight: extra.weight ?? (confidence === 'EXTRACTED' ? 1 : 0.7),
    source_file: extra.source_file ?? null,
    source_location: extra.source_location ?? null,
    evidence: extra.evidence ?? '',
  }
  links.push(edge)
  audit.push(edge)
}

function titleFromFile(file) {
  const stem = path.basename(file).replace(/\.[^.]+$/, '')
  return stem
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function fileNodeId(file) {
  return `file_${idOf(file)}`
}

function pageGroup(file) {
  if (file.includes('/pages/student/')) return 'student'
  if (file.includes('/pages/hod/')) return 'hod'
  if (file.includes('/pages/admin/')) return 'admin'
  if (file.includes('/pages/auth/')) return 'auth'
  if (file.includes('/components/guards/') || file.includes('/context/')) return 'auth'
  return 'frontend'
}

function resolveImport(fromFile, spec) {
  let base
  if (spec.startsWith('@/')) base = path.join(root, 'frontend/src', spec.slice(2))
  else if (spec.startsWith('.')) base = path.resolve(root, path.dirname(fromFile), spec)
  else return null

  const candidates = [
    base,
    `${base}.jsx`,
    `${base}.js`,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.jsx'),
    path.join(base, 'index.js'),
  ]
  const hit = candidates.find((candidate) => existsSync(candidate))
  return hit ? rel(hit) : null
}

const frontendFiles = walk('frontend/src', ['.jsx', '.js', '.ts', '.tsx'])
const backendFiles = walk('backend/src', ['.js'])
const docFiles = [
  'invertis_feedback_redesign_docs/architecture.md',
  'invertis_feedback_redesign_docs/system_architecture.md',
  'invertis_feedback_redesign_docs/information_architecture.md',
  'invertis_feedback_redesign_docs/setup_schema.sql',
  'invertis_feedback_redesign_docs/rls_policies.sql',
  'invertis_feedback_redesign_docs/scoring_engine_specs.md',
].filter(exists)

for (const role of ['student', 'hod', 'admin']) {
  addNode(`actor_${role}`, role[0].toUpperCase() + role.slice(1), 'actor', {
    description: `${role} user role in the feedback system.`,
  })
}

addNode('frontend_react_app', 'React/Vite Web App', 'frontend', {
  source_file: 'frontend/src/App.jsx',
  file_type: 'code',
  description: 'Single-page React application with role-based routes.',
})
addNode('frontend_router', 'React Router Route Tree', 'frontend', {
  source_file: 'frontend/src/App.jsx',
  file_type: 'code',
  description: 'Routes public auth pages and protected student/HOD/admin sections.',
})
addNode('auth_provider', 'AuthProvider / useAuth', 'auth', {
  source_file: 'frontend/src/context/AuthContext.jsx',
  file_type: 'code',
  description: 'Loads Supabase session, fetches profile, exposes login/register/logout helpers.',
})
addNode('auth_guard', 'AuthGuard', 'auth', {
  source_file: 'frontend/src/components/guards/AuthGuard.jsx',
  file_type: 'code',
  description: 'Redirects unauthenticated users to login and mismatched roles to their dashboard.',
})
addNode('layout_app_shell', 'AppLayout + Sidebar + Topbar', 'frontend', {
  source_file: 'frontend/src/components/layout/AppLayout.jsx',
  file_type: 'code',
  description: 'Shared protected application shell with side navigation and role-aware topbar.',
})
addNode('supabase_browser_client', 'Supabase Browser Client', 'data', {
  source_file: 'frontend/src/lib/supabase.js',
  file_type: 'code',
  description: 'Frontend Supabase anon client used by auth and page-level queries.',
})
addNode('axios_api_client', 'Axios API Client', 'frontend', {
  source_file: 'frontend/src/lib/api.js',
  file_type: 'code',
  description: 'HTTP client for /api with access-token attachment and 401 redirect handling.',
})
addNode('backend_express_app', 'Express API Server', 'backend', {
  source_file: 'backend/src/index.js',
  file_type: 'code',
  description: 'Express service mounting auth, forms, reviews, analytics, and admin API routes.',
})
addNode('supabase_admin_client', 'Supabase Service-Role Client', 'backend', {
  source_file: 'backend/src/config/supabase.js',
  file_type: 'code',
  description: 'Backend Supabase client using service role credentials to bypass RLS.',
})
addNode('supabase_auth', 'Supabase Auth', 'data', {
  description: 'Email/password auth and session state for all roles.',
})
addNode('supabase_database', 'Supabase Postgres Database', 'data', {
  source_file: 'invertis_feedback_redesign_docs/setup_schema.sql',
  file_type: 'document',
  description: 'Relational storage for profiles, courses, trainers, forms, reviews, and answers.',
})

addEdge('frontend_react_app', 'frontend_router', 'uses', 'EXTRACTED', 1, { source_file: 'frontend/src/App.jsx' })
addEdge('frontend_react_app', 'auth_provider', 'wraps', 'EXTRACTED', 1, { source_file: 'frontend/src/App.jsx' })
addEdge('frontend_router', 'auth_guard', 'protects_routes_with', 'EXTRACTED', 1, { source_file: 'frontend/src/App.jsx' })
addEdge('auth_guard', 'layout_app_shell', 'renders_when_authorized', 'EXTRACTED', 1, {
  source_file: 'frontend/src/App.jsx',
})
addEdge('auth_provider', 'supabase_browser_client', 'uses', 'EXTRACTED', 1, {
  source_file: 'frontend/src/context/AuthContext.jsx',
})
addEdge('auth_provider', 'supabase_auth', 'authenticates_with', 'EXTRACTED', 1, {
  source_file: 'frontend/src/context/AuthContext.jsx',
})
addEdge('backend_express_app', 'supabase_admin_client', 'uses', 'EXTRACTED', 1, {
  source_file: 'backend/src/index.js',
})
addEdge('supabase_admin_client', 'supabase_database', 'queries', 'EXTRACTED', 1, {
  source_file: 'backend/src/config/supabase.js',
})
addEdge('supabase_browser_client', 'supabase_database', 'queries', 'EXTRACTED', 1, {
  source_file: 'frontend/src/lib/supabase.js',
})

const routeMap = [
  ['actor_student', '/student/dashboard', 'StudentDashboard', 'frontend/src/pages/student/StudentDashboard.jsx'],
  ['actor_student', '/student/feedback/:formId', 'FeedbackForm', 'frontend/src/pages/student/FeedbackForm.jsx'],
  ['actor_student', '/student/history', 'SubmissionHistory', 'frontend/src/pages/student/SubmissionHistory.jsx'],
  ['actor_student', '/student/profile', 'StudentProfile', 'frontend/src/pages/student/StudentProfile.jsx'],
  ['actor_hod', '/hod/dashboard', 'HodDashboard', 'frontend/src/pages/hod/HodDashboard.jsx'],
  ['actor_hod', '/hod/forms', 'FormManagement', 'frontend/src/pages/hod/FormManagement.jsx'],
  ['actor_hod', '/hod/analytics', 'HodAnalytics', 'frontend/src/pages/hod/HodAnalytics.jsx'],
  ['actor_hod', '/hod/students', 'StudentDirectory', 'frontend/src/pages/hod/StudentDirectory.jsx'],
  ['actor_admin', '/admin/dashboard', 'AdminDashboard', 'frontend/src/pages/admin/AdminDashboard.jsx'],
  ['actor_admin', '/admin/users', 'UserManagement', 'frontend/src/pages/admin/UserManagement.jsx'],
  ['actor_admin', '/admin/forms', 'AdminFormManagement', 'frontend/src/pages/admin/AdminFormManagement.jsx'],
  ['actor_admin', '/admin/courses', 'CourseManagement', 'frontend/src/pages/admin/CourseManagement.jsx'],
  ['actor_admin', '/admin/trainers', 'TrainerManagement', 'frontend/src/pages/admin/TrainerManagement.jsx'],
  ['actor_admin', '/admin/leaderboard', 'Leaderboard', 'frontend/src/pages/admin/Leaderboard.jsx'],
]

for (const [actor, route, label, file] of routeMap) {
  const nodeId = `page_${idOf(label)}`
  addNode(nodeId, label, pageGroup(file), {
    source_file: file,
    file_type: 'code',
    description: `Protected page mounted at ${route}.`,
  })
  addEdge(actor, nodeId, 'uses_page', 'EXTRACTED', 1, { source_file: 'frontend/src/App.jsx', evidence: route })
  addEdge('frontend_router', nodeId, 'routes_to', 'EXTRACTED', 1, { source_file: 'frontend/src/App.jsx', evidence: route })
  addEdge('auth_guard', nodeId, 'authorizes', 'EXTRACTED', 1, { source_file: 'frontend/src/App.jsx', evidence: route })
}

addNode('page_loginpage', 'LoginPage', 'auth', {
  source_file: 'frontend/src/pages/auth/LoginPage.jsx',
  file_type: 'code',
  description: 'Public login page that calls AuthProvider login or skipLogin.',
})
addNode('page_registerpage', 'RegisterPage', 'auth', {
  source_file: 'frontend/src/pages/auth/RegisterPage.jsx',
  file_type: 'code',
  description: 'Public registration page that creates a student account and profile.',
})
addEdge('page_loginpage', 'auth_provider', 'calls_login', 'EXTRACTED', 1, {
  source_file: 'frontend/src/pages/auth/LoginPage.jsx',
})
addEdge('page_registerpage', 'auth_provider', 'calls_register', 'EXTRACTED', 1, {
  source_file: 'frontend/src/pages/auth/RegisterPage.jsx',
})
addEdge('frontend_router', 'page_loginpage', 'routes_to', 'EXTRACTED', 1, { source_file: 'frontend/src/App.jsx' })
addEdge('frontend_router', 'page_registerpage', 'routes_to', 'EXTRACTED', 1, { source_file: 'frontend/src/App.jsx' })

const tableNames = new Set([
  'profiles',
  'courses',
  'trainers',
  'subjects',
  'feedback_forms',
  'reviews',
  'review_answers',
])
for (const table of tableNames) {
  addNode(`table_${table}`, table, 'data', {
    source_file: 'invertis_feedback_redesign_docs/setup_schema.sql',
    file_type: 'document',
    description: `Supabase table: ${table}.`,
  })
  addEdge('supabase_database', `table_${table}`, 'contains_table', 'EXTRACTED', 1, {
    source_file: 'invertis_feedback_redesign_docs/setup_schema.sql',
  })
}

const schema = exists('invertis_feedback_redesign_docs/setup_schema.sql')
  ? read('invertis_feedback_redesign_docs/setup_schema.sql')
  : ''
for (const match of schema.matchAll(/CREATE TABLE\s+([a-z_]+)\s*\(([\s\S]*?);/gi)) {
  const sourceTable = match[1]
  const body = match[2]
  if (!tableNames.has(sourceTable)) continue
  for (const ref of body.matchAll(/REFERENCES\s+([a-z_]+)\s*\(/gi)) {
    const targetTable = ref[1]
    if (tableNames.has(targetTable)) {
      addEdge(`table_${sourceTable}`, `table_${targetTable}`, 'foreign_key_to', 'EXTRACTED', 1, {
        source_file: 'invertis_feedback_redesign_docs/setup_schema.sql',
      })
    }
  }
}

function inferTableAction(content, table) {
  const actions = []
  const escaped = table.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  if (new RegExp(`from\\(['"]${escaped}['"]\\)[\\s\\S]{0,120}\\.select`, 'm').test(content)) actions.push('selects')
  if (new RegExp(`from\\(['"]${escaped}['"]\\)[\\s\\S]{0,120}\\.insert`, 'm').test(content)) actions.push('inserts')
  if (new RegExp(`from\\(['"]${escaped}['"]\\)[\\s\\S]{0,120}\\.update`, 'm').test(content)) actions.push('updates')
  if (new RegExp(`from\\(['"]${escaped}['"]\\)[\\s\\S]{0,120}\\.delete`, 'm').test(content)) actions.push('deletes')
  return actions.length ? actions.join('_and_') : 'queries'
}

for (const file of frontendFiles) {
  const content = read(file)
  const nodeId = fileNodeId(file)
  addNode(nodeId, titleFromFile(file), pageGroup(file), {
    source_file: file,
    file_type: 'code',
    description: `Frontend source file: ${file}.`,
  })
  if (file.endsWith('App.jsx')) addEdge('frontend_react_app', nodeId, 'implemented_by', 'EXTRACTED', 1, { source_file: file })
  for (const imp of content.matchAll(/import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g)) {
    const target = resolveImport(file, imp[1])
    if (target) {
      const targetId = fileNodeId(target)
      addNode(targetId, titleFromFile(target), pageGroup(target), {
        source_file: target,
        file_type: 'code',
        description: `Frontend source file: ${target}.`,
      })
      addEdge(nodeId, targetId, 'imports', 'EXTRACTED', 1, { source_file: file, evidence: imp[1] })
    }
  }
  for (const table of content.matchAll(/\.from\(['"]([a-z_]+)['"]\)/g)) {
    if (!tableNames.has(table[1])) continue
    addEdge(nodeId, 'supabase_browser_client', 'uses', 'EXTRACTED', 1, { source_file: file })
    addEdge(nodeId, `table_${table[1]}`, inferTableAction(content, table[1]), 'EXTRACTED', 1, { source_file: file })
  }
  for (const apiCall of content.matchAll(/api\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g)) {
    const endpointId = `endpoint_${apiCall[1]}_${idOf(apiCall[2])}`
    addNode(endpointId, `${apiCall[1].toUpperCase()} ${apiCall[2]}`, 'backend', {
      source_file: file,
      file_type: 'code',
      description: `Frontend API call from ${file}.`,
    })
    addEdge(nodeId, 'axios_api_client', 'uses', 'EXTRACTED', 1, { source_file: file })
    addEdge('axios_api_client', endpointId, 'calls', 'EXTRACTED', 1, { source_file: file })
  }
}

const mountAliases = new Map()
const backendIndex = exists('backend/src/index.js') ? read('backend/src/index.js') : ''
const importAliases = new Map()
for (const imp of backendIndex.matchAll(/import\s+\{\s*([a-zA-Z0-9_]+)\s*\}\s+from\s+['"](.+?)['"]/g)) {
  importAliases.set(imp[1], rel(path.resolve(root, 'backend/src', imp[2]).replace(/\.js$/, '') + '.js'))
}
for (const mount of backendIndex.matchAll(/app\.use\(['"]([^'"]+)['"],\s*([a-zA-Z0-9_]+)\)/g)) {
  mountAliases.set(importAliases.get(mount[2]) ?? mount[2], mount[1])
}

for (const file of backendFiles) {
  const content = read(file)
  const nodeId = fileNodeId(file)
  addNode(nodeId, titleFromFile(file), 'backend', {
    source_file: file,
    file_type: 'code',
    description: `Backend source file: ${file}.`,
  })
  if (file.endsWith('index.js')) addEdge('backend_express_app', nodeId, 'implemented_by', 'EXTRACTED', 1, { source_file: file })
  if (content.includes('supabaseAdmin')) addEdge(nodeId, 'supabase_admin_client', 'uses', 'EXTRACTED', 1, { source_file: file })

  const base = mountAliases.get(file) ?? ''
  for (const route of content.matchAll(/([a-zA-Z0-9_]+)\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/g)) {
    const method = route[2].toUpperCase()
    const routePath = `${base}${route[3] === '/' ? '' : route[3]}`
    const endpointId = `endpoint_${method.toLowerCase()}_${idOf(routePath || route[3])}`
    addNode(endpointId, `${method} ${routePath || route[3]}`, 'backend', {
      source_file: file,
      file_type: 'code',
      description: `Express endpoint defined in ${file}.`,
    })
    addEdge('backend_express_app', endpointId, 'mounts_endpoint', 'EXTRACTED', 1, { source_file: file })
    addEdge(endpointId, nodeId, 'implemented_in', 'EXTRACTED', 1, { source_file: file })
    for (const table of content.matchAll(/\.from\(['"]([a-z_]+)['"]\)/g)) {
      if (!tableNames.has(table[1])) continue
      addEdge(endpointId, `table_${table[1]}`, inferTableAction(content, table[1]), 'EXTRACTED', 0.9, {
        source_file: file,
        evidence: 'Route file-level table use',
      })
    }
  }
}

for (const file of docFiles) {
  const nodeId = `doc_${idOf(file)}`
  addNode(nodeId, titleFromFile(file), 'docs', {
    source_file: file,
    file_type: 'document',
    description: `Project document: ${file}.`,
  })
  for (const table of tableNames) {
    if (read(file).includes(table)) {
      addEdge(nodeId, `table_${table}`, 'documents', 'EXTRACTED', 1, { source_file: file })
    }
  }
}

const flows = [
  {
    id: 'flow_authentication',
    label: 'Authentication and Role Redirect Flow',
    description: 'Users log in or register; AuthProvider loads session/profile; RootRedirect/AuthGuard sends them to the role dashboard.',
    nodes: ['page_loginpage', 'page_registerpage', 'auth_provider', 'supabase_auth', 'table_profiles', 'frontend_router', 'auth_guard'],
  },
  {
    id: 'flow_student_feedback',
    label: 'Student Feedback Submission Flow',
    description: 'Student sees active course forms, opens one, submits text feedback and ratings to reviews/review_answers, then reviews history/progress.',
    nodes: [
      'actor_student',
      'page_studentdashboard',
      'page_feedbackform',
      'page_submissionhistory',
      'table_feedback_forms',
      'table_reviews',
      'table_review_answers',
    ],
  },
  {
    id: 'flow_hod_form_management',
    label: 'HOD Form Publishing and Monitoring Flow',
    description: 'HOD manages forms for courses/trainers, closes forms, and reads review answer aggregates for analytics.',
    nodes: [
      'actor_hod',
      'page_formmanagement',
      'page_hoddashboard',
      'page_hodanalytics',
      'table_feedback_forms',
      'table_courses',
      'table_trainers',
      'table_review_answers',
    ],
  },
  {
    id: 'flow_admin_operations',
    label: 'Admin Master Data and Oversight Flow',
    description: 'Admin manages users, courses, trainers, forms, leaderboard, and global metrics across the same Supabase tables.',
    nodes: [
      'actor_admin',
      'page_admindashboard',
      'page_usermanagement',
      'page_coursemanagement',
      'page_trainermanagement',
      'page_leaderboard',
      'table_profiles',
      'table_courses',
      'table_trainers',
      'table_reviews',
    ],
  },
  {
    id: 'flow_express_api',
    label: 'Optional Express API Flow',
    description: 'Express exposes /api routes over the same Supabase data model; frontend currently uses direct Supabase heavily, while api.js is ready for backend calls.',
    nodes: ['axios_api_client', 'backend_express_app', 'supabase_admin_client', 'supabase_database'],
  },
]

for (const flow of flows) {
  addNode(flow.id, flow.label, 'flow', {
    description: flow.description,
    file_type: 'concept',
  })
  for (const member of flow.nodes) addEdge(flow.id, member, 'includes', 'INFERRED', 0.85)
}

const graph = {
  directed: true,
  multigraph: false,
  graph: {
    name: 'TLFQ Webapp Working Graph',
    generated_at: new Date().toISOString(),
    generator: 'graphify skill fallback: Node extractor because Python graphify runtime is unavailable',
    corpus: {
      frontend_files: frontendFiles.length,
      backend_files: backendFiles.length,
      docs: docFiles.length,
    },
  },
  nodes: [...nodes.values()],
  links,
  communities,
}

const communityCounts = [...nodes.values()].reduce((acc, node) => {
  acc[node.community] = (acc[node.community] ?? 0) + 1
  return acc
}, {})
const confidenceCounts = links.reduce((acc, edge) => {
  acc[edge.confidence] = (acc[edge.confidence] ?? 0) + 1
  return acc
}, {})

function htmlEscape(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

const graphHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>TLFQ Webapp Working Graph</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f8fb;
      --panel: #ffffff;
      --ink: #172033;
      --muted: #677084;
      --line: #d7dce5;
      --accent: #2563eb;
      --actor: #0f766e;
      --frontend: #2563eb;
      --auth: #7c3aed;
      --student: #16a34a;
      --hod: #c2410c;
      --admin: #be123c;
      --backend: #4b5563;
      --data: #0891b2;
      --flow: #ca8a04;
      --docs: #64748b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
      background: var(--bg);
      color: var(--ink);
      overflow: hidden;
    }
    .app {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      height: 100vh;
    }
    header {
      position: fixed;
      top: 0;
      left: 0;
      right: 360px;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 18px;
      background: rgba(247, 248, 251, 0.94);
      border-bottom: 1px solid var(--line);
      z-index: 3;
    }
    h1 {
      font-size: 18px;
      line-height: 1.2;
      margin: 0;
      white-space: nowrap;
    }
    .meta {
      color: var(--muted);
      font-size: 13px;
    }
    input, select {
      height: 36px;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 0 10px;
      background: white;
      color: var(--ink);
      min-width: 160px;
    }
    .stage {
      position: relative;
      height: 100vh;
      padding-top: 64px;
    }
    svg {
      width: 100%;
      height: calc(100vh - 64px);
      display: block;
      cursor: grab;
    }
    svg:active { cursor: grabbing; }
    .link {
      stroke: #aeb7c6;
      stroke-width: 1.15;
      opacity: 0.62;
      marker-end: url(#arrow);
    }
    .link.inferred {
      stroke-dasharray: 4 4;
      opacity: 0.48;
    }
    .node circle {
      stroke: white;
      stroke-width: 2;
      filter: drop-shadow(0 2px 3px rgba(23, 32, 51, 0.18));
    }
    .node text {
      font-size: 11px;
      paint-order: stroke;
      stroke: white;
      stroke-width: 4px;
      stroke-linejoin: round;
      fill: #172033;
      pointer-events: none;
    }
    aside {
      background: var(--panel);
      border-left: 1px solid var(--line);
      padding: 18px;
      overflow: auto;
    }
    aside h2 {
      font-size: 17px;
      margin: 0 0 6px;
    }
    aside p {
      color: var(--muted);
      line-height: 1.45;
      margin: 8px 0 14px;
      font-size: 14px;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      height: 24px;
      border-radius: 999px;
      padding: 0 8px;
      color: white;
      font-size: 12px;
      margin: 0 6px 6px 0;
    }
    .edge-list {
      display: grid;
      gap: 8px;
      margin-top: 12px;
    }
    .edge-item {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 9px 10px;
      font-size: 13px;
      line-height: 1.35;
    }
    .edge-item b {
      color: var(--accent);
      font-weight: 650;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .legend button {
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 12px;
      cursor: pointer;
    }
    .legend button.active {
      border-color: var(--accent);
      color: var(--accent);
    }
    @media (max-width: 900px) {
      .app { grid-template-columns: 1fr; }
      header { right: 0; flex-wrap: wrap; height: auto; min-height: 64px; }
      aside { display: none; }
      .stage { padding-top: 112px; }
      svg { height: calc(100vh - 112px); }
    }
  </style>
</head>
<body>
  <div class="app">
    <section class="stage">
      <header>
        <div>
          <h1>TLFQ Webapp Working Graph</h1>
          <div class="meta">${nodes.size} nodes · ${links.length} edges · extracted from first-party app code</div>
        </div>
        <input id="search" placeholder="Search nodes" />
        <select id="community">
          <option value="">All communities</option>
          ${Object.values(communities).map((name) => `<option>${htmlEscape(name)}</option>`).join('')}
        </select>
      </header>
      <svg id="graph" role="img" aria-label="TLFQ webapp working graph"></svg>
    </section>
    <aside>
      <h2 id="detail-title">Select a node</h2>
      <p id="detail-body">Click any circle to inspect its role, source file, and connected workflow edges.</p>
      <div id="detail-pills"></div>
      <div id="detail-edges" class="edge-list"></div>
      <div class="legend" id="legend"></div>
    </aside>
  </div>
  <script>
    const graph = ${JSON.stringify(graph)};
    const colors = {
      'Actors and Roles': '#0f766e',
      'Frontend Shell and Routing': '#2563eb',
      'Authentication and Authorization': '#7c3aed',
      'Student Feedback Workflow': '#16a34a',
      'HOD Form and Analytics Workflow': '#c2410c',
      'Admin Operations': '#be123c',
      'Express API': '#4b5563',
      'Supabase Data Model': '#0891b2',
      'End-to-End Product Flows': '#ca8a04',
      'Requirements and Architecture Docs': '#64748b'
    };
    const svg = document.querySelector('#graph');
    const search = document.querySelector('#search');
    const community = document.querySelector('#community');
    const detailTitle = document.querySelector('#detail-title');
    const detailBody = document.querySelector('#detail-body');
    const detailPills = document.querySelector('#detail-pills');
    const detailEdges = document.querySelector('#detail-edges');
    const legend = document.querySelector('#legend');
    const width = () => svg.clientWidth || 1200;
    const height = () => svg.clientHeight || 720;
    const groups = [...new Set(graph.nodes.map(n => n.community))];
    const groupIndex = new Map(groups.map((g, i) => [g, i]));
    const nodes = graph.nodes.map((n, i) => {
      const gi = groupIndex.get(n.community) ?? 0;
      const cols = Math.ceil(Math.sqrt(groups.length));
      const col = gi % cols;
      const row = Math.floor(gi / cols);
      return {
        ...n,
        x: 110 + col * 260 + (i % 5) * 18,
        y: 80 + row * 170 + (i % 7) * 14,
        vx: 0,
        vy: 0
      };
    });
    const byId = new Map(nodes.map(n => [n.id, n]));
    const links = graph.links.map(l => ({ ...l, sourceNode: byId.get(l.source), targetNode: byId.get(l.target) })).filter(l => l.sourceNode && l.targetNode);
    let selected = nodes.find(n => n.group === 'flow') ?? nodes[0];
    let transform = { x: 0, y: 0, k: 1 };
    let dragging = null;
    let panning = null;

    function sizeFor(n) {
      if (n.group === 'flow') return 13;
      if (n.group === 'data') return 10;
      if (n.group === 'actor') return 12;
      return 8;
    }
    function visible(n) {
      const q = search.value.trim().toLowerCase();
      const c = community.value;
      if (c && n.community !== c) return false;
      if (q && !(n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q) || (n.source_file || '').toLowerCase().includes(q))) return false;
      return true;
    }
    function tick() {
      const w = width(), h = height();
      for (const n of nodes) {
        if (n.fixed) continue;
        const gi = groupIndex.get(n.community) ?? 0;
        const cols = Math.ceil(Math.sqrt(groups.length));
        const targetX = 150 + (gi % cols) * ((w - 220) / Math.max(cols - 1, 1));
        const targetY = 90 + Math.floor(gi / cols) * 210;
        n.vx += (targetX - n.x) * 0.002;
        n.vy += (targetY - n.y) * 0.002;
      }
      for (const l of links) {
        const dx = l.targetNode.x - l.sourceNode.x;
        const dy = l.targetNode.y - l.sourceNode.y;
        const dist = Math.max(Math.hypot(dx, dy), 1);
        const desired = l.relation === 'includes' ? 125 : 95;
        const force = (dist - desired) * 0.0018;
        const fx = dx / dist * force;
        const fy = dy / dist * force;
        if (!l.sourceNode.fixed) { l.sourceNode.vx += fx; l.sourceNode.vy += fy; }
        if (!l.targetNode.fixed) { l.targetNode.vx -= fx; l.targetNode.vy -= fy; }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.max(Math.hypot(dx, dy), 1);
          if (dist > 90) continue;
          const force = (90 - dist) * 0.004;
          const fx = dx / dist * force;
          const fy = dy / dist * force;
          if (!a.fixed) { a.vx -= fx; a.vy -= fy; }
          if (!b.fixed) { b.vx += fx; b.vy += fy; }
        }
      }
      for (const n of nodes) {
        if (n.fixed) continue;
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.84;
        n.vy *= 0.84;
      }
      render();
      requestAnimationFrame(tick);
    }
    function render() {
      const visibleNodes = new Set(nodes.filter(visible).map(n => n.id));
      svg.innerHTML = '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L7,3 z" fill="#aeb7c6" /></marker></defs>';
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', 'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k + ')');
      svg.appendChild(g);
      for (const l of links) {
        if (!visibleNodes.has(l.source) || !visibleNodes.has(l.target)) continue;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'link ' + (l.confidence === 'INFERRED' ? 'inferred' : ''));
        line.setAttribute('x1', l.sourceNode.x);
        line.setAttribute('y1', l.sourceNode.y);
        line.setAttribute('x2', l.targetNode.x);
        line.setAttribute('y2', l.targetNode.y);
        g.appendChild(line);
      }
      for (const n of nodes) {
        if (!visible(n)) continue;
        const item = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        item.setAttribute('class', 'node');
        item.setAttribute('transform', 'translate(' + n.x + ',' + n.y + ')');
        item.addEventListener('pointerdown', (event) => {
          dragging = n;
          n.fixed = true;
          selected = n;
          showDetails(n);
          event.stopPropagation();
        });
        item.addEventListener('click', () => { selected = n; showDetails(n); });
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', sizeFor(n));
        circle.setAttribute('fill', colors[n.community] || '#64748b');
        circle.setAttribute('opacity', selected && selected.id === n.id ? '1' : '0.9');
        item.appendChild(circle);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', sizeFor(n) + 5);
        label.setAttribute('y', 4);
        label.textContent = n.label.length > 34 ? n.label.slice(0, 31) + '...' : n.label;
        item.appendChild(label);
        g.appendChild(item);
      }
    }
    function showDetails(n) {
      const related = links.filter(l => l.source === n.id || l.target === n.id).slice(0, 36);
      detailTitle.textContent = n.label;
      detailBody.textContent = n.description || 'No description recorded.';
      detailPills.innerHTML = '<span class="pill" style="background:' + (colors[n.community] || '#64748b') + '">' + n.community + '</span>' +
        (n.source_file ? '<span class="pill" style="background:#475569">' + n.source_file + '</span>' : '');
      detailEdges.innerHTML = related.map(l => {
        const other = byId.get(l.source === n.id ? l.target : l.source);
        const dir = l.source === n.id ? 'to' : 'from';
        return '<div class="edge-item"><b>' + l.relation + '</b> ' + dir + ' ' + (other?.label || 'unknown') +
          '<br><span style="color:#677084">' + l.confidence + ' · ' + (l.source_file || 'inferred flow') + '</span></div>';
      }).join('');
      render();
    }
    for (const g of groups) {
      const button = document.createElement('button');
      button.textContent = g;
      button.style.borderColor = colors[g] || '#d7dce5';
      button.onclick = () => {
        community.value = community.value === g ? '' : g;
        render();
      };
      legend.appendChild(button);
    }
    svg.addEventListener('pointerdown', (event) => {
      panning = { x: event.clientX, y: event.clientY, tx: transform.x, ty: transform.y };
    });
    svg.addEventListener('pointermove', (event) => {
      if (dragging) {
        dragging.x = (event.clientX - transform.x) / transform.k;
        dragging.y = (event.clientY - transform.y - 64) / transform.k;
      } else if (panning) {
        transform.x = panning.tx + event.clientX - panning.x;
        transform.y = panning.ty + event.clientY - panning.y;
      }
      render();
    });
    window.addEventListener('pointerup', () => { dragging = null; panning = null; });
    svg.addEventListener('wheel', (event) => {
      event.preventDefault();
      const factor = event.deltaY > 0 ? 0.92 : 1.08;
      transform.k = Math.max(0.35, Math.min(2.4, transform.k * factor));
      render();
    }, { passive: false });
    search.addEventListener('input', render);
    community.addEventListener('change', render);
    showDetails(selected);
    requestAnimationFrame(tick);
  </script>
</body>
</html>`

const report = `# TLFQ Webapp Working Graph

Generated: ${graph.graph.generated_at}

## Corpus

- Frontend source: ${frontendFiles.length} files under \`frontend/src\`
- Backend source: ${backendFiles.length} files under \`backend/src\`
- Architecture/schema docs sampled: ${docFiles.length} files under \`invertis_feedback_redesign_docs\`
- Sensitive/dependency folders skipped: \`node_modules\`, \`dist\`, \`build\`

Note: the packaged Python \`graphify\` runtime was not available on this machine, so this run used a Node-based graphify fallback extractor and preserved the same three-artifact output shape.

## Graph Summary

- Nodes: ${nodes.size}
- Edges: ${links.length}
- EXTRACTED edges: ${confidenceCounts.EXTRACTED ?? 0}
- INFERRED edges: ${confidenceCounts.INFERRED ?? 0}

## Communities

${Object.entries(communityCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => `- ${name}: ${count} nodes`)
  .join('\n')}

## How The Webapp Works

1. The React app starts at \`frontend/src/App.jsx\`, wraps routes in \`AuthProvider\`, and uses \`AuthGuard\` to protect student, HOD, and admin route groups.
2. \`AuthProvider\` talks to Supabase Auth, reads the current session, fetches the user's \`profiles\` row, and exposes \`login\`, \`register\`, \`logout\`, and dev \`skipLogin\` helpers.
3. Role routing is profile-driven: unauthenticated users go to \`/login\`; authenticated users land on \`/<role>/dashboard\`; users entering another role's route are redirected back to their own dashboard.
4. Most current frontend pages query Supabase directly through \`frontend/src/lib/supabase.js\`; \`frontend/src/lib/api.js\` is present for tokenized \`/api\` calls but the page layer relies heavily on direct Supabase table access.
5. The Express backend mounts \`/api/auth\`, \`/api/forms\`, \`/api/reviews\`, \`/api/analytics\`, and \`/api/admin\`, each using the service-role Supabase client from \`backend/src/config/supabase.js\`.
6. The core data model is \`profiles -> feedback_forms -> reviews -> review_answers\`, with \`courses\`, \`trainers\`, and \`subjects\` supplying academic context.

## Main Flows

- Authentication and role redirect: Login/Register pages -> AuthProvider -> Supabase Auth -> profiles -> React Router/AuthGuard.
- Student feedback: StudentDashboard lists active \`feedback_forms\`; FeedbackForm inserts \`reviews\` and \`review_answers\`; SubmissionHistory reads prior \`reviews\`.
- HOD work: FormManagement reads courses/trainers/forms and inserts or closes \`feedback_forms\`; HOD dashboards and analytics aggregate \`reviews\` and \`review_answers\`.
- Admin work: Admin pages manage \`profiles\`, \`courses\`, \`trainers\`, forms, leaderboard, and global counts.
- Backend API: Express exposes equivalent server-side operations over Supabase using the admin client, useful for centralized policy, service-role writes, and future page migration away from direct table access.

## Audit Notes

- EXTRACTED edges come from imports, route declarations, Express route mounts, \`.from('table')\` calls, and SQL \`REFERENCES\` declarations.
- INFERRED edges are only the five named product flows; they group extracted nodes into user-facing workflows.
- No image/screenshot semantic extraction was performed in this fallback run.

## Outputs

- \`graphify-out/graph.html\` - interactive graph
- \`graphify-out/graph.json\` - GraphRAG-ready node-link JSON
- \`graphify-out/GRAPH_REPORT.md\` - this report
- \`graphify-out/audit.json\` - edge evidence and confidence trail
`

writeFileSync(path.join(outDir, 'graph.json'), JSON.stringify(graph, null, 2))
writeFileSync(path.join(outDir, 'graph.html'), graphHtml)
writeFileSync(path.join(outDir, 'GRAPH_REPORT.md'), report)
writeFileSync(path.join(outDir, 'audit.json'), JSON.stringify(audit, null, 2))

console.log(`Generated graphify-out/graph.html (${nodes.size} nodes, ${links.length} edges)`)

function walk(dir, exts, acc = []) {
  const abs = path.join(root, dir)
  if (!existsSync(abs)) return acc
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') continue
      walk(rel(full), exts, acc)
    } else if (exts.includes(path.extname(entry.name).toLowerCase())) {
      acc.push(rel(full))
    }
  }
  return acc
}
