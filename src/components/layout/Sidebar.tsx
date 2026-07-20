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
        <div className="px-5 py-5 flex items-center justify-between border-b border-border/60">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-mono font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
              R
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground tracking-tight flex items-center gap-1">
                Recall <span className="text-xs font-mono text-primary font-normal">AI</span>
              </span>
              <span className="text-xs text-muted-foreground">Planner</span>
            </div>
          </Link>

          {/* Close button — mobile only */}
          <button
            className="p-1.5 hover:bg-muted rounded-md lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {/* Main Workspace Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace
            </div>
            {navItems.slice(0, 3).map((item) => {
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
                    transition-all duration-150 relative group
                    ${active
                      ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false)
                  }}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                  )}
                  <Icon size={18} className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                  <span>{item.label}</span>
                  {showPulse && (
                    <span className="ml-auto flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-500">LIVE</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Intelligence & Analytics Section */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Intelligence
            </div>
            {navItems.slice(3).map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150 relative group
                    ${active
                      ? 'bg-primary/10 text-primary font-semibold shadow-2xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) setSidebarOpen(false)
                  }}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                  )}
                  <Icon size={18} className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom: User section */}
        <div className="border-t border-border p-3 space-y-1 bg-muted/20">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-card/60 border border-border/50">
              <div className="w-8 h-8 rounded-md bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          )}

          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings size={15} />
            <span>{t('settings')}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
          >
            <LogOut size={15} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
