import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useTranslation } from '@/stores/languageStore'
import {
  LayoutDashboard,
  BookOpen,
  Focus,
  Mic,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react'

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { user, logout } = useAuthStore()
  const { activeSession } = useSessionStore()
  const { t } = useTranslation()

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/dashboard' },
    { icon: BookOpen, label: t('plans'), path: '/plans' },
    { icon: Focus, label: t('focus'), path: '/focus' },
    { icon: Mic, label: t('interview'), path: '/interview/config' },
    { icon: BarChart3, label: t('history'), path: '/history' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  // Has active focus session? Highlight focus item
  const hasFocusSession = activeSession?.type === 'focus'

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-card border-r border-border
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-0'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
              R
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              Recall
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 ml-0.5 -translate-y-1" />
            </span>
          </Link>

          {/* Close button — mobile only */}
          <button
            className="p-1 hover:bg-muted rounded lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isFocusItem = item.path === '/focus'
            const active = isActive(item.path) || (isFocusItem && activeSession?.type === 'focus')
            const showPulse = isFocusItem && hasFocusSession

            return (
              <Link
                key={item.path}
                to={isFocusItem
                  ? (activeSession?.type === 'focus' ? `/focus/${activeSession.conceptId || activeSession.planId || '1'}` : '/focus')
                  : item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${active
                    ? 'bg-primary/15 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
                onClick={() => {
                  // Close sidebar on mobile after nav
                  if (window.innerWidth < 1024) setSidebarOpen(false)
                }}
              >
                <Icon size={18} className={active ? 'text-primary' : ''} />
                <span>{item.label}</span>
                {showPulse && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: User section */}
        <div className="border-t border-border p-3 space-y-1">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings size={16} />
            <span>{t('settings')}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
          >
            <LogOut size={16} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
