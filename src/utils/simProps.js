import { levels } from '../data/levels'
import { shouldShowChatComposePreview } from './chatValidation'

/**
 * 按 simType 将关卡配置映射为模拟器组件 props。
 */
export function buildSimProps({
  level,
  storyContext,
  project,
  jiraInvalidFields,
  jiraPreview,
  submissionInitialValues,
  submissionInitialSelected,
  getLinkedJiraIssue,
}) {
  if (!level) return {}
  const lv = level
  const ctx = storyContext

  switch (lv.simType) {
    case 'jira':
      return {
        jiraFields: lv.jiraFields,
        externalInvalidFields: jiraInvalidFields,
        preview: jiraPreview,
        levelId: lv.id,
        jiraRules: lv.jiraRules,
        projectName: project?.name || '通用',
        jiraMode: ctx.jiraMode,
        jiraDraft: ctx.jiraDraft,
        jiraBacklog: ctx.jiraBacklog,
      }
    case 'terminal':
      return {
        terminalHint: lv.terminalHint,
        terminalSuccessMsg: lv.terminalSuccessMsg,
        logPath: lv.logPath || '/var/log/app/error.log',
        storyLogs: lv.storyLogs,
        correctCommand: lv.correctCommand,
        fileContent: lv.fileContent,
        findResults: lv.findResults,
        lsListing: lv.lsListing,
        curlResponse: lv.curlResponse,
      }
    case 'chat':
      return {
        chatContext: lv.chatContext,
        chatGroup: lv.chatGroup,
        chatHistory: ctx.chatHistory,
        composeHint: lv.chatHint,
        placeholder: lv.chatPlaceholder,
        chatPreviewConfig: shouldShowChatComposePreview(lv)
          ? {
              chatStructure: lv.chatStructure,
              chatKeywords: lv.chatKeywords,
              chatMinLength: lv.chatMinLength,
              chatMinKeywords: lv.chatMinKeywords,
            }
          : null,
      }
    case 'config':
      return {
        configContent: lv.configContent,
        configKey: lv.configKey || 'DB_HOST',
        defaultValue: '127.0.0.1',
        correctValue: lv.correctValue,
      }
    case 'report':
      return {
        reportItems: lv.reportItems,
        storyRef: lv.storyRef,
        linkedIssueFromStore: getLinkedJiraIssue(lv.projectId),
        projectLabel: project ? `${project.name}回归流水线 #428` : '',
      }
    case 'checklist':
      return { checklistItems: lv.checklistItems, prdContent: ctx.prdContent }
    case 'clickcard':
      return {
        clickOptions: lv.clickOptions,
        clickVariant: ctx.clickVariant || lv.clickVariant,
      }
    case 'template':
      return {
        templateFields: lv.templateFields,
        requirement: lv.requirement,
        fillHint: lv.fillHint,
        templateMinLength: lv.templateMinLength || 0,
        initialValues: submissionInitialValues,
      }
    case 'apiclient':
      return {
        apiMethod: lv.apiMethod || 'POST',
        apiUrl: lv.apiUrl || '/api/login',
        apiRequestBody: lv.apiRequestBody || '{}',
        templateFields: lv.templateFields || [],
        checklistItems: lv.checklistItems || [],
        requirement: lv.requirement,
        fillHint: lv.fillHint,
        templateMinLength: lv.templateMinLength || 0,
        initialValues: submissionInitialValues,
        initialSelected: submissionInitialSelected,
      }
    case 'calculator':
      return {
        calculatorFields: lv.calculatorFields,
        calculatorFormula: lv.calculatorFormula || 'schedule',
        calculatorReadonly: lv.calculatorReadonly !== false,
      }
    case 'packet':
      return {
        packetRequests: lv.packetRequests,
      }
    case 'sqlclient':
      return {
        sqlHint: lv.sqlHint,
        sqlTable: lv.sqlTable,
        sqlSchema: lv.sqlSchema,
        sqlMustInclude: lv.sqlMustInclude,
        sqlMustIncludeAny: lv.sqlMustIncludeAny,
        sqlResultRows: lv.sqlResultRows,
        correctQuery: lv.correctQuery,
      }
    case 'redis':
      return {
        redisHint: lv.redisHint,
        redisStore: lv.redisStore,
        redisKeys: lv.redisKeys,
        correctCommand: lv.correctCommand,
        redisSuccessMsg: lv.redisSuccessMsg,
      }
    case 'cipipeline':
      return {
        pipelineStages: lv.pipelineStages,
        pipelineLog: lv.pipelineLog,
        correctStage: lv.correctStage,
        causeOptions: lv.causeOptions,
        correctCause: lv.correctCause,
      }
    case 'mockserver':
      return {
        mockPath: lv.mockPath,
        mockStatus: lv.mockStatus,
        mockBodyIncludes: lv.mockBodyIncludes,
        mockDelayMs: lv.mockDelayMs,
        mockHint: lv.mockHint,
        defaultBody: lv.defaultBody,
      }
    case 'apmtrace':
      return {
        traceTitle: lv.traceTitle,
        traceNodes: lv.traceNodes,
        apmMetrics: lv.apmMetrics,
        correctClick: lv.correctClick,
        apmMode: lv.apmMode || 'trace',
      }
    case 'gitrelease':
      return {
        gitTitle: lv.gitTitle,
        gitOptions: lv.gitOptions,
        gitCommits: lv.gitCommits,
        correctClick: lv.correctClick,
        gitMode: lv.gitMode || 'branch',
      }
    case 'mqinbox':
      return {
        inboxMode: lv.inboxMode || 'mq',
        mqMessages: lv.mqMessages,
        smsMessages: lv.smsMessages,
        correctMessageId: lv.correctMessageId,
        correctCode: lv.correctCode,
        mqHint: lv.mqHint,
      }
    case 'oncall':
      return {
        oncallMode: lv.oncallMode || 'prod-login',
        logLines: lv.logLines,
        oncallAction: lv.oncallAction,
      }
    case 'leadboard':
      return {
        leadMode: lv.leadMode || 'gonogo',
        leadAction: lv.leadAction,
      }
    case 'loginapp':
      return {
        appBuild: lv.appBuild || 'buggy',
        appAction: lv.appAction,
      }
    case 'paymentapp':
      return {
        paymentScenario: lv.paymentScenario || 'callback-bug',
        appAction: lv.appAction,
      }
    default:
      return {}
  }
}

export function getLinkedJiraIssue(projectId, hasArtifact) {
  if (!projectId) return null
  const jiraLevel = levels.find((l) => l.projectId === projectId && l.simType === 'jira')
  if (jiraLevel && hasArtifact?.(projectId, jiraLevel.id)) {
    return `TEST-${1000 + jiraLevel.id}`
  }
  return null
}
