import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AppProvider } from './store.jsx'
import './index.css'

// 安全模式：用 …html#safe 打开时，关闭毛玻璃与动画
try {
  if (/[?#].*safe/.test(location.href)) document.documentElement.classList.add('safe-mode')
} catch (e) { /* ignore */ }

// 任何未捕获错误都直接显示在页面上，避免“白屏/没反应”无从排查
function showFatal(msg) {
  try {
    let el = document.getElementById('fatal-error')
    if (!el) {
      el = document.createElement('div')
      el.id = 'fatal-error'
      el.style.cssText =
        'position:fixed;top:0;left:0;right:0;z-index:99999;background:#7f1d1d;color:#fff;' +
        'padding:12px 16px;font:13px/1.5 -apple-system,sans-serif;white-space:pre-wrap;word-break:break-all'
      document.body.appendChild(el)
    }
    el.textContent = '页面出错：' + msg
  } catch (e) { /* ignore */ }
}

window.addEventListener('error', (e) => {
  const msg = (e.message || '未知错误') + (e.filename ? '\n' + e.filename.replace(location.origin, '') + ':' + e.lineno : '')
  showFatal(msg)
})
window.addEventListener('unhandledrejection', (e) => {
  showFatal('Promise 错误：' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)))
})

createRoot(document.getElementById('root')).render(
  <AppProvider>
    <App />
  </AppProvider>
)

// PWA：注册 service worker（生产构建后生效）
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
