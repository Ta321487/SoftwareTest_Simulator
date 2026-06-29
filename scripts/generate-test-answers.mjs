/**
 * 生成本地测试用答案速查（勿提交产物到 Git）
 * 运行：node scripts/generate-test-answers.mjs
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { levels, simTypeLabels } from '../src/data/levels.js'
import { sideLevels } from '../src/data/sideQuests.js'
import { DAILY_POOL, DAILY_LEVEL_ID } from '../src/data/dailyChallenges.js'
import { referenceAnswers } from '../src/data/referenceAnswers.js'

function fmtChecks(level) {
  const items = level.checklistItems || level.reportItems
  if (!items) return null
  const ids = level.correctChecks || level.correctSelections || []
  return ids
    .map((id) => {
      const item = items.find((x) => x.id === id)
      return item ? `**${id}** ${item.label || item.title}` : id
    })
    .join('\n- ')
}

function fmtClick(level) {
  const id = level.correctClick
  if (!id) return null
  const opt = level.clickOptions?.find((x) => x.id === id)
  return opt ? `**${id}** ${opt.label}` : id
}

function fmtTerminal(level) {
  return level.correctCommand ? `\`${level.correctCommand}\`` : null
}

function fmtConfig(level) {
  return level.correctValue ? `${level.configKey || '配置项'} = \`${level.correctValue}\`` : null
}

function fmtCalc(level) {
  return level.correctResult ? `**${level.correctResult}**` : null
}

function fmtRef(levelId) {
  const ref = referenceAnswers[levelId]
  if (!ref) return null
  return ref.items.map((i) => `- **${i.title}**：${i.text}`).join('\n')
}

function fmtOpen(level) {
  const parts = []
  if (level.chatStructure) {
    parts.push(`- **企微/聊天**：满足结构校验 + 关内关键词（见关卡提示）；冲星需匹配更多关键词`)
    if (level.chatKeywords?.length) {
      parts.push(`  - 可写关键词：${level.chatKeywords.slice(0, 8).join('、')}…`)
    }
  }
  if (level.templateFields?.length) {
    parts.push(
      `- **模板填空**：每格 ≥ ${level.templateMinLength || 10} 字，含 fieldKeywords 即可过线`
    )
    for (const f of level.templateFields) {
      if (f.fieldKeywords?.length) {
        parts.push(`  - ${f.scenario || f.label}：含 ${f.fieldKeywords.slice(0, 6).join('、')}`)
      }
    }
  }
  if (level.simType === 'jira') {
    parts.push('- **Jira**：模块/严重度/步骤/预期≠实际；标题与步骤含关卡要求关键词（见 hint）')
  }
  return parts.length ? parts.join('\n') : null
}

function answerBlock(level) {
  const lines = []
  const sim = simTypeLabels[level.simType] || level.simType
  lines.push(`**类型**：${sim}`)

  const exact =
    fmtChecks(level) || fmtClick(level) || fmtTerminal(level) || fmtConfig(level) || fmtCalc(level)

  if (exact) {
    lines.push('', '**过关答案**：', `- ${exact}`)
  }

  const ref = fmtRef(level.id)
  if (ref) {
    lines.push('', '**参考写法**（开放题）：', ref)
  }

  const open = fmtOpen(level)
  if (open && !exact) {
    lines.push('', '**过关要点**：', open)
  } else if (open && level.simType === 'template') {
    lines.push('', '**模板关键词提示**：', open)
  }

  if (level.hint) {
    lines.push('', `> 💡 ${level.hint}`)
  }

  return lines.join('\n')
}

function sectionLevel(level, prefix = '') {
  const title = prefix ? `${prefix}${level.title}` : level.title
  return `### #${level.id} ${title}\n\n${answerBlock(level)}\n\n`
}

let md = `# 测试答案速查（本地自用）

> **勿提交 Git、勿发给玩家。** 由 \`node scripts/generate-test-answers.mjs\` 从 \`src/data\` 生成，与判题逻辑同步。  
> 生成时间：${new Date().toISOString().slice(0, 10)}

## 使用说明

| 类型 | 怎么过 |
|------|--------|
| checklist / report | 勾选下表选项 ID |
| clickcard / packet | 点击指定卡片 |
| terminal | 命令需与 \`correctCommand\` 一致（空格可多个） |
| config | 改指定 key 为正确 IP/值，点测试连接后再提交 |
| calculator | 填数字，两位小数（如 \`3.33\`、\`4.00\`） |
| template / chat / jira | 长度 + 关键词；三星看 preview 条数 |
| apiclient (#16) | 在 API 工具里勾选 checklist，再提交 |

**冲三星**：尽量 1 次提交、不用提示；Jira/企微匹配更多关键词。

---

## 主线 48 关

`

for (const lv of levels) {
  md += sectionLevel(lv)
}

md += `---

## 番外 ${sideLevels.length} 关（#101–#${sideLevels[sideLevels.length - 1]?.id ?? 113}）

`

for (const lv of sideLevels) {
  md += sectionLevel(lv, '🎬 ')
}

md += `---

## 每日特训（#${DAILY_LEVEL_ID}）

按日期轮换：\`index = hash(YYYY-MM-DD) % ${DAILY_POOL.length}\`，当天题目见首页「每日特训」标题。

| # | key | 标题 | 过关答案 |
|---|-----|------|----------|
`

DAILY_POOL.forEach((lv, i) => {
  const ans =
    fmtChecks(lv)?.replace(/\n- /g, '；') ||
    fmtClick(lv) ||
    fmtTerminal(lv) ||
    fmtCalc(lv) ||
    '见模板/企微关键词'
  md += `| ${i} | ${lv.key} | ${lv.title.replace('今日：', '')} | ${ans.replace(/\*\*/g, '').replace(/\n/g, ' ')} |\n`
})

md += `
---

## 快捷：终端 / 配置

| 关 | 答案 |
|----|------|
| #5 | \`tail -n 100 /var/log/app/error.log\` |
| #6 | \`PAYMENT_DB_HOST=10.0.1.5\` |
| #23 | \`grep ERROR /var/log/app/error.log\` |

## 快捷：计算器

| 关 | 答案 |
|----|------|
| #11 | 3.33 |
| #20 | 4.00 |
| #30 | 3.13 |
`

const out = join(process.cwd(), '测试答案速查.md')
writeFileSync(out, md, 'utf8')
console.log('Wrote', out)
