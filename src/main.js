import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import './styles/responsive.css'
import './styles/home-mobile.css'
import './styles/level-mobile.css'
import './styles/level-game-ui.css'
import { useThemeStore } from './stores/themeStore'
import { useProgressStore } from './stores/progressStore'
import { useProjectStore } from './stores/projectStore'
import { registerAutoBackupStores } from './utils/autoBackup'
import { tryRestoreFromIndexedDB } from './utils/bootstrapRestore'

if (import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
}

const app = createApp(App)
const pinia = createPinia()

app.config.errorHandler = (err, _instance, info) => {
  console.error('[App Error]', err, info)
  const root = document.getElementById('app')
  if (root && !root.querySelector('.boot-error')) {
    const msg = String(err?.message || err || '未知错误')
    root.innerHTML = `
      <div class="boot-error" style="padding:2rem;font-family:system-ui;max-width:520px;margin:2rem auto;line-height:1.6">
        <h1 style="font-size:1.25rem;margin-bottom:0.75rem">页面加载出错</h1>
        <p style="color:#666;margin-bottom:0.75rem">${msg}</p>
        <p style="color:#b45309;font-size:0.9rem;margin-bottom:1rem">
          请勿清除浏览器数据，否则会丢失通关记录。刷新后若提示「从自动备份恢复」，请点确定。
        </p>
        <button type="button" id="boot-error-reload" style="padding:8px 16px;cursor:pointer;margin-right:8px">
          刷新页面
        </button>
      </div>`
    root.querySelector('#boot-error-reload')?.addEventListener('click', () => location.reload())
  }
}

app.use(pinia)
app.use(router)

async function bootstrap() {
  try {
    const themeStore = useThemeStore(pinia)
    themeStore.init()
    const progressStore = useProgressStore(pinia)
    const projectStore = useProjectStore(pinia)
    registerAutoBackupStores({ progressStore, projectStore, themeStore })
    await tryRestoreFromIndexedDB(progressStore, projectStore, themeStore).catch(() => {})
    app.mount('#app')
  } catch (err) {
    app.config.errorHandler(err, null, 'bootstrap')
  }
}

bootstrap()
