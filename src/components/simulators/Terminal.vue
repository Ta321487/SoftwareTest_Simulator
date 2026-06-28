<script setup>
import { computed, ref } from 'vue'
import { executeTerminalCommand } from '../../utils/terminalExecution'
import { getTerminalCommandPreview } from '../../utils/terminalCommandPreview'

const props = defineProps({
  terminalHint: {
    type: String,
    default: '',
  },
  logPath: {
    type: String,
    default: '/var/log/app/error.log',
  },
  storyLogs: {
    type: Array,
    default: null,
  },
  correctCommand: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['submit'])

const command = ref('')
const success = ref(false)
const error = ref(false)
const history = ref([])
const cwd = ref('/home/user')

const commandPreview = computed(() =>
  getTerminalCommandPreview(command.value, { correctCommand: props.correctCommand })
)

function normalize(cmd) {
  return cmd.trim().replace(/\s+/g, ' ').toLowerCase()
}

function pushLine(type, text) {
  history.value.push({ type, text })
}

function levelContext() {
  return {
    logPath: props.logPath,
    storyLogs: props.storyLogs,
    correctCommand: props.correctCommand,
  }
}

function runTailOrGrep(raw) {
  const result = executeTerminalCommand(raw, levelContext())

  if (result.errorLine) {
    pushLine('err', result.errorLine)
    error.value = true
  } else {
    for (const line of result.outputLines) {
      pushLine('log', line)
    }
    error.value = !result.validation.isPass
  }

  emit('submit', { command: raw })
}

function handleEnter() {
  const raw = command.value.trim()
  if (!raw || success.value) return

  const cmd = normalize(raw)
  pushLine('cmd', `user@auth-server:${cwd.value}$ ${raw}`)

  if (cmd === 'ls' || cmd === 'ls -la') {
    if (cwd.value === '/var/log/app') {
      pushLine('out', 'access.log  error.log  info.log')
    } else {
      pushLine('out', 'Documents  logs  projects')
    }
    command.value = ''
    error.value = false
    return
  }

  if (cmd === 'cd /var/log/app' || cmd === 'cd /var/log/app/') {
    cwd.value = '/var/log/app'
    command.value = ''
    error.value = false
    return
  }

  if (cmd === 'cd ~' || cmd === 'cd') {
    cwd.value = '/home/user'
    command.value = ''
    error.value = false
    return
  }

  if (cmd === 'pwd') {
    pushLine('out', cwd.value)
    command.value = ''
    error.value = false
    return
  }

  if (cmd.startsWith('tail') || cmd.includes('grep')) {
    command.value = ''
    runTailOrGrep(raw)
    return
  }

  const bin = raw.split(/\s+/)[0]
  pushLine('err', `bash: ${bin}: command not found`)
  error.value = true
  command.value = ''
  emit('submit', { command: raw })
}

function markSuccess() {
  success.value = true
  error.value = false
}

function markError() {
  if (success.value) return
  success.value = false
  error.value = true
  const last = history.value[history.value.length - 1]
  if (!last || last.type !== 'err') {
    pushLine('err', '命令未能完成关卡目标。对照任务说明检查路径、行数或 grep 关键字。')
  }
}

function reset() {
  command.value = ''
  success.value = false
  error.value = false
  history.value = []
  cwd.value = '/home/user'
}

defineExpose({ markSuccess, markError, reset })
</script>

<template>
  <div class="sim-card terminal">
    <div class="terminal__screen">
      <p class="terminal__line">Last login: Sun Jun 28 2026 on ttys001</p>
      <p class="terminal__line">Welcome to auth-server (login-module gray release)</p>

      <template v-for="(entry, index) in history" :key="index">
        <p
          class="terminal__line"
          :class="{
            terminal__cmd: entry.type === 'cmd',
            terminal__output: entry.type === 'out',
            terminal__log: entry.type === 'log',
            'terminal__line--error': entry.type === 'err',
          }"
        >
          {{ entry.text }}
        </p>
      </template>
    </div>

    <div
      class="terminal__input-row"
      :class="{
        'terminal__input-row--error': error && !success,
        'terminal__input-row--success': success,
      }"
    >
      <span class="terminal__prompt">$</span>
      <input
        v-model="command"
        class="terminal__input"
        type="text"
        :disabled="success"
        placeholder="支持 ls / cd / pwd / tail / grep …"
        @keydown.enter="handleEnter"
      />
      <span v-if="success" class="terminal__ok">✓</span>
    </div>

    <div
      v-if="commandPreview.hasPreview && !success"
      class="terminal__preview"
      :class="`terminal__preview--${commandPreview.tier}`"
    >
      <p class="terminal__preview-title">命令预览 · {{ commandPreview.tierLabel }}</p>
      <ul v-if="commandPreview.tips.length" class="terminal__preview-tips">
        <li v-for="(tip, idx) in commandPreview.tips" :key="idx">{{ tip }}</li>
      </ul>
      <p v-else class="terminal__preview-ok">命令结构看起来正确，回车执行。</p>
    </div>

    <p v-if="terminalHint && !success" class="terminal__hint">{{ terminalHint }}</p>
    <p v-if="success" class="terminal__success-msg">
      日志已加载，发现多条 ERROR，建议结合业务现象继续排查。
    </p>
  </div>
</template>
