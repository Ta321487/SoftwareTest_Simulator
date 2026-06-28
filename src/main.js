import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import './styles/responsive.css'
import { useThemeStore } from './stores/themeStore'

const app = createApp(App)
const pinia = createPinia()

app.config.errorHandler = (err, _instance, info) => {
  console.error('[App Error]', err, info)
  const root = document.getElementById('app')
  if (root && !root.querySelector('.boot-error')) {
    root.innerHTML = `
      <div class="boot-error" style="padding:2rem;font-family:system-ui;max-width:520px;margin:2rem auto">
        <h1 style="font-size:1.25rem;margin-bottom:0.75rem">页面加载出错</h1>
        <p style="color:#666;line-height:1.6;margin-bottom:1rem">${err?.message || err}</p>
        <button type="button" onclick="localStorage.clear();location.reload()" style="padding:8px 16px;cursor:pointer">
          清除缓存并刷新
        </button>
      </div>`
  }
}

app.use(pinia)
app.use(router)

try {
  useThemeStore(pinia).init()
  app.mount('#app')
} catch (err) {
  app.config.errorHandler(err, null, 'bootstrap')
}
