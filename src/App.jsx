import { useApp } from './store.jsx'
import BottomNav from './components/BottomNav.jsx'
import Toasts from './components/Toasts.jsx'
import TodayPage from './pages/TodayPage.jsx'
import ChallengePage from './pages/ChallengePage.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('App render error', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="page" style={{ textAlign: 'center', paddingTop: 48 }}>
          <div style={{ fontSize: 40 }}>😵</div>
          <h1 className="h1" style={{ fontSize: 22 }}>页面出了点小问题</h1>
          <p className="subtitle">数据都还在本机，刷新一下通常就好了。</p>
          <button
            className="btn btn-accent btn-lg"
            style={{ marginTop: 18 }}
            onClick={() => window.location.reload()}
          >
            重新加载
          </button>
          {String(this.state.error && this.state.error.message).length < 180 && (
            <p className="small muted" style={{ marginTop: 14 }}>{String(this.state.error && this.state.error.message)}</p>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const { tab } = useApp()
  return (
    <div className="app-shell">
      <Toasts />
      <ErrorBoundary>
        {tab === 'today' && <TodayPage />}
        {tab === 'challenge' && <ChallengePage />}
        {tab === 'calendar' && <CalendarPage />}
        {tab === 'profile' && <ProfilePage />}
        <BottomNav />
      </ErrorBoundary>
    </div>
  )
}
