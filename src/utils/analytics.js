const ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || ''
const APP_VERSION = import.meta.env.VITE_APP_VERSION || 'dev'

/**
 * 轻量埋点：开发环境 console 输出；生产可配置 VITE_ANALYTICS_ENDPOINT 接收 JSON POST/beacon。
 */
export function trackEvent(name, props = {}) {
  const payload = {
    name,
    props,
    version: APP_VERSION,
    ts: Date.now(),
    path: typeof location !== 'undefined' ? location.pathname : '',
  }

  if (import.meta.env.DEV) {
    console.debug('[analytics]', name, props)
  }

  if (!ENDPOINT || typeof navigator === 'undefined') return

  const body = JSON.stringify(payload)
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(ENDPOINT, blob)
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    /* ignore */
  }
}

export function trackLevelStart(levelId, simType) {
  trackEvent('level_start', { levelId, simType })
}

export function trackLevelPass(levelId, simType, stars) {
  trackEvent('level_pass', { levelId, simType, stars })
}

export function trackLevelFail(levelId, simType) {
  trackEvent('level_fail', { levelId, simType })
}

export function trackBackupExport() {
  trackEvent('backup_export')
}

export function trackBackupImport() {
  trackEvent('backup_import')
}
