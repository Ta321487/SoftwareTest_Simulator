import { levels } from './levels'

/** 手札能力域：按工作场景浏览，与职场阶段 Tab 互补 */
export const handbookDomains = [
  {
    id: 'functional',
    name: '功能测试',
    icon: '🧪',
    tagline: '从 PRD 到用例，黑盒思路打底',
  },
  {
    id: 'api',
    name: '接口测试',
    icon: '🔌',
    tagline: '不只会发请求，还要会写断言',
  },
  {
    id: 'oncall',
    name: '值班排查',
    icon: '🚨',
    tagline: '线上出事，先稳住再定位',
  },
  {
    id: 'release',
    name: '发布回归',
    icon: '🚀',
    tagline: '发版前几小时，做冒烟、回归，再决定是否签字',
  },
]

const PLAYBOOK_CATEGORY_DOMAIN = {
  defect: 'functional',
  oncall: 'oncall',
  api: 'api',
  release: 'release',
}

const GLOSSARY_CATEGORY_DOMAINS = {
  defect: ['functional'],
  process: ['functional', 'release'],
  technique: ['functional'],
  performance: ['oncall', 'release'],
  security: ['functional', 'api'],
  ops: ['release', 'oncall'],
  api: ['api'],
}

/** 术语显式归属（可多域） */
const TERM_DOMAIN_OVERRIDES = {
  'gray-box': ['functional', 'oncall', 'api'],
  callback: ['api', 'oncall'],
  'api-test': ['api'],
  'http-status': ['api'],
  'rate-limit': ['api'],
  idempotent: ['api'],
  cicd: ['release'],
  'gray-release': ['release'],
  'go-nogo': ['release'],
  slo: ['release', 'oncall'],
  p99: ['oncall', 'release'],
  apm: ['oncall'],
  bottleneck: ['oncall'],
  hotfix: ['release'],
  'redis-cache': ['oncall', 'api'],
  'mock-server': ['api', 'release'],
  'message-queue': ['api', 'oncall'],
  'sql-verify': ['functional', 'oncall', 'api'],
  'integration-gate': ['release'],
  'git-release': ['release'],
  'toolchain-triage': ['oncall', 'release'],
  regression: ['release', 'functional'],
  smoke: ['release', 'functional'],
  'risk-driven': ['release', 'functional'],
  'white-box': ['functional'],
  'black-box': ['functional'],
  'unit-test': ['functional'],
  coverage: ['functional'],
}

const SIM_TYPE_DOMAINS = {
  jira: ['functional'],
  template: ['functional'],
  checklist: ['functional'],
  apiclient: ['api'],
  terminal: ['oncall'],
  sqlclient: ['oncall', 'api'],
  redis: ['oncall', 'api'],
  cipipeline: ['release'],
  mockserver: ['api', 'release'],
  apmtrace: ['oncall', 'release'],
  gitrelease: ['release'],
  mqinbox: ['api', 'oncall'],
  chat: ['functional', 'oncall'],
  config: ['api', 'release'],
  report: ['release'],
  clickcard: ['functional', 'release'],
  calculator: ['functional', 'release'],
  packet: ['api', 'oncall'],
  oncall: ['oncall'],
  leadboard: ['release', 'functional'],
  loginapp: ['functional'],
  paymentapp: ['functional', 'api'],
}

const LEVEL_DOMAIN_OVERRIDES = {
  40: ['functional'],
  41: ['release'],
  42: ['api'],
  45: ['oncall'],
  46: ['oncall'],
  47: ['functional', 'release'],
  48: ['release'],
}

export function getHandbookDomain(id) {
  return handbookDomains.find((d) => d.id === id) || null
}

export function getPlaybookDomain(playbook) {
  return PLAYBOOK_CATEGORY_DOMAIN[playbook?.category] || 'functional'
}

export function getTermDomains(term) {
  if (!term) return []
  if (TERM_DOMAIN_OVERRIDES[term.id]) return TERM_DOMAIN_OVERRIDES[term.id]
  return GLOSSARY_CATEGORY_DOMAINS[term.category] || ['functional']
}

export function getLevelDomains(levelId) {
  if (LEVEL_DOMAIN_OVERRIDES[levelId]) return LEVEL_DOMAIN_OVERRIDES[levelId]
  const level = levels.find((l) => l.id === levelId)
  if (!level) return ['functional']
  return SIM_TYPE_DOMAINS[level.simType] || ['functional']
}

export function itemMatchesDomain(domains, domainId) {
  return domains.includes(domainId)
}

export function filterPlaybooksByDomain(playbooks, domainId) {
  return playbooks.filter((pb) => getPlaybookDomain(pb) === domainId)
}

export function filterTermsByDomain(terms, domainId) {
  return terms.filter((term) => itemMatchesDomain(getTermDomains(term), domainId))
}

export function filterEntriesByDomain(entries, domainId) {
  return entries.filter((entry) => itemMatchesDomain(getLevelDomains(entry.levelId), domainId))
}

export function getDomainCounts({ entries, terms, playbooks }) {
  return handbookDomains.map((domain) => ({
    ...domain,
    counts: {
      notes: filterEntriesByDomain(entries, domain.id).length,
      terms: filterTermsByDomain(terms, domain.id).length,
      playbooks: filterPlaybooksByDomain(playbooks, domain.id).length,
    },
  }))
}
