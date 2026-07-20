import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { usePlanStore } from '@/stores/planStore'
import { useTheme } from '@/components/theme-provider'
import { useTranslation } from '@/stores/languageStore'
import { Menu, Bell, LogOut, Settings, User, Sun, Moon, Languages } from 'lucide-react'

// ─── Breadcrumb Builder ──────────────────────────────────────────
interface Breadcrumb {
  label: string
  path?: string
}

function useBreadcrumbs(): Breadcrumb[] {
  const location = useLocation()
  const { getPlanById } = usePlanStore()
  const { t } = useTranslation()
  const segments = location.pathname.split('/').filter(Boolean)
  const crumbs: Breadcrumb[] = []

  if (segments[0] === 'dashboard') {
    crumbs.push({ label: t('dashboard') })
  } else if (segments[0] === 'plans') {
    if (segments.length === 1) {
      crumbs.push({ label: t('plans') })
    } else {
      crumbs.push({ label: t('plans'), path: '/plans' })
      if (segments[1] === 'new') {
        crumbs.push({ label: t('create_new_plan') })
      } else if (segments[1]) {
        const plan = getPlanById(segments[1])
        crumbs.push({ label: plan?.name || `Plan ${segments[1]}` })
      }
    }
  } else if (segments[0] === 'interview') {
    crumbs.push({ label: t('interview'), path: '/interview/config' })
    if (segments[1] === 'config') {
      crumbs.push({ label: t('settings') })
    } else if (segments[1]) {
      const dateStr = new Date().toLocaleDateString('vi-VN')
      if (segments[2] === 'result') {
        crumbs.push({ label: dateStr, path: `/interview/${segments[1]}` })
        crumbs.push({ label: 'Result' })
      } else {
        crumbs.push({ label: dateStr })
      }
    }
  } else if (segments[0] === 'focus') {
    crumbs.push({ label: t('focus') })
  } else if (segments[0] === 'history') {
    crumbs.push({ label: t('history') })
  }

  return crumbs
}

// ─── Route → Page Title ─────────────────────────────────────────
function usePageTitle(): string {
  const location = useLocation()
  const { getPlanById } = usePlanStore()
  const { t } = useTranslation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments[0] === 'dashboard') return t('dashboard')
  if (segments[0] === 'plans') {
    if (segments[1] === 'new') return t('create_new_plan')
    if (segments[1]) {
      const plan = getPlanById(segments[1])
      return plan?.name || 'Plan Details'
    }
    return t('plans')
  }
  if (segments[0] === 'interview') {
    if (segments[1] === 'config') return t('interview_config')
    if (segments[2] === 'result') return t('view_results')
    if (segments[1]) return t('interview')
    return t('interview')
  }
  if (segments[0] === 'focus') return t('focus')
  if (segments[0] === 'history') return t('history')
  return 'Recall AI'
}

// ═══════════════════════════════════════════════════════════════
// HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════
export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { toggleSidebar } = useUIStore()
  const { theme, setTheme } = useTheme()
  const { t, lang, toggleLanguage } = useTranslation()
  const breadcrumbs = useBreadcrumbs()
  const pageTitle = usePageTitle()

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement>(null)

  // Notification mock
  const hasNotifications = true
  const notificationCount = 3

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as HTMLElement)) {
        setAvatarMenuOpen(false)
      }
    }
    if (avatarMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [avatarMenuOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border/80 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        {/* Left: Hamburger + Title + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-muted rounded-md transition-colors lg:hidden text-muted-foreground"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground mb-0.5">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    {idx > 0 && <span className="text-muted-foreground/50">/</span>}
                    {crumb.path ? (
                      <Link
                        to={crumb.path}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground font-semibold">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            {/* Page Title */}
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate tracking-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Toggles + Notification Bell + Avatar */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
            aria-label="Đổi ngôn ngữ"
            title="Đổi ngôn ngữ / Change Language"
          >
            <Languages size={18} />
            <span className="uppercase">{lang}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Đổi giao diện"
            title="Đổi giao diện / Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notification Bell */}
          <button
            className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Thông báo"
          >
            <Bell size={18} className="text-muted-foreground hover:text-foreground" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 min-w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Avatar Dropdown */}
          {user && (
            <div className="relative" ref={avatarMenuRef}>
              <button
                onClick={() => setAvatarMenuOpen(prev => !prev)}
                className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {avatarMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-card border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                  </div>

                  <button
                    onClick={() => { navigate('/profile'); setAvatarMenuOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <User size={14} />
                    {t('profile')}
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); setAvatarMenuOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Settings size={14} />
                    {t('settings')}
                  </button>

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut size={14} />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
