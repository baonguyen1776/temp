import { useAuthStore } from '@/stores/authStore'
import { User as UserIcon, Mail } from 'lucide-react'

export default function ProfilePage() {
  const { user, setUser, isAuthenticated } = useAuthStore()

  const handleLogin = () => {
    // TODO: Implement actual authentication
    setUser({
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="card p-8 text-center space-y-6">
          <h1 className="section-title">Sign In</h1>
          <p className="text-text-secondary">
            Sign in to start capturing and organizing your memories.
          </p>
          <button
            onClick={handleLogin}
            className="btn-primary w-full"
          >
            Sign In with Email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="section-title">Profile</h1>

      <div className="card p-8 space-y-6">
        {/* Avatar */}
        {user?.avatar && (
          <div className="flex justify-center">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full border-4 border-primary"
            />
          </div>
        )}

        {/* User Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-surface rounded-md">
            <UserIcon className="w-5 h-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide">
                Name
              </p>
              <p className="text-text-primary font-medium">{user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-surface rounded-md">
            <Mail className="w-5 h-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide">
                Email
              </p>
              <p className="text-text-primary font-medium">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="pt-6 border-t border-border">
          <h2 className="section-subtitle">Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded"
              />
              <span className="text-text-primary">
                Email notifications for shared memories
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded"
              />
              <span className="text-text-primary">
                Daily digest of new memories
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
