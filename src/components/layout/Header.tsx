import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { usePlanStore } from '@/stores/planStore'
import { Menu, Bell, LogOut, Settings, User, ChevronRight } from 'lucide-react'

// ─── Breadcrumb Builder ──────────────────────────────────────────
interface Breadcrumb {
  label: string
  path?: string
}

function useBreadcrumbs(): Breadcrumb[] {
  const location = useLocation()
  const { getPlanById } = usePlanStore()
  const segments = location.pathname.split('/').filter(Boolean)
  const crumbs: Breadcrumb[] = []

  if (segments[0] === 'dashboard') {
    crumbs.push({ label: 'Dashboard' })
  } else if (segments[0] === 'plans') {
    if (segments.length === 1) {
      crumbs.push({ label: 'Kế hoạch' })
    } else {
      crumbs.push({ label: 'Kế hoạch', path: '/plans' })
      if (segments[1] === 'new') {
        crumbs.push({ label: 'Tạo mới' })
      } else if (segments[1]) {
        const plan = getPlanById(segments[1])
        crumbs.push({ label: plan?.name || `Plan ${segments[1]}` })
      }
    }
  } else if (segments[0] === 'interview') {
    crumbs.push({ label: 'Interview', path: '/interview/config' })
    if (segments[1] === 'config') {
      crumbs.push({ label: 'Cấu hình' })
    } else if (segments[1]) {
      const dateStr = new Date().toLocaleDateString('vi-VN')
      if (segments[2] === 'result') {
        crumbs.push({ label: dateStr, path: `/interview/${segments[1]}` })
        crumbs.push({ label: 'Kết quả' })
      } else {
        crumbs.push({ label: dateStr })
      }
    }
  } else if (segments[0] === 'focus') {
    crumbs.push({ label: 'Focus Session' })
  } else if (segments[0] === 'history') {
    crumbs.push({ label: 'Lịch sử' })
  }

  return crumbs
}

// ─── Route → Page Title ─────────────────────────────────────────
function usePageTitle(): string {
  const location = useLocation()
  const { getPlanById } = usePlanStore()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments[0] === 'dashboard') return 'Dashboard'
  if (segments[0] === 'plans') {
    if (segments[1] === 'new') return 'Tạo kế hoạch mới'
    if (segments[1]) {
      const plan = getPlanById(segments[1])
      return plan?.name || 'Chi tiết kế hoạch'
    }
    return 'Kế hoạch'
  }
  if (segments[0] === 'interview') {
    if (segments[1] === 'config') return 'Cấu hình Interview'
    if (segments[2] === 'result') return 'Kết quả Interview'
    if (segments[1]) return 'Phiên Interview'
    return 'Interview'
  }
  if (segments[0] === 'focus') return 'Focus Session'
  if (segments[0] === 'history') return 'Lịch sử học tập'
  return 'Recall AI'
}

// ═══════════════════════════════════════════════════════════════
// HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════
export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { toggleSidebar } = useUIStore()
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
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Hamburger + Title + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} className="text-foreground" />
          </button>

          <div className="min-w-0">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-[11px] text-muted-foreground mb-0.5">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    {idx > 0 && <ChevronRight size={10} />}
                    {crumb.path ? (
                      <Link
                        to={crumb.path}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground font-medium">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}

            {/* Page Title */}
            <h1 className="text-base font-bold text-foreground truncate">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Notification Bell + Avatar */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            className="relative p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            aria-label="Thông báo"
          >
            <Bell size={18} className="text-zinc-500" />
            {hasNotifications && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Avatar Dropdown */}
          {user && (
            <div className="relative" ref={avatarMenuRef}>
              <button
                onClick={() => setAvatarMenuOpen(prev => !prev)}
                className="flex items-center gap-2 p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-foreground">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {avatarMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground">{user.email}</p>
                  </div>

                  <button
                    onClick={() => { navigate('/profile'); setAvatarMenuOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    <User size={14} />
                    Hồ sơ
                  </button>
                  <button
                    onClick={() => { navigate('/settings'); setAvatarMenuOpen(false) }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    <Settings size={14} />
                    Cài đặt
                  </button>

                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} />
                      Đăng xuất
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
