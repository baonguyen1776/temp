import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4"
  >
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('minh@recall.ai')
  const [password, setPassword] = useState('123456')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get returnUrl from query params
  const searchParams = new URLSearchParams(window.location.search)
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    // Use authStore login
    const { login } = await import('@/stores/authStore').then(m => {
      return { login: m.useAuthStore.getState().login }
    })

    const success = await login(email || 'demo@recall.ai', password)
    setLoading(false)

    if (success) {
      navigate(decodeURIComponent(returnUrl))
    } else {
      setError('Đăng nhập thất bại. Vui lòng thử lại.')
    }
  }

  const handleGoogleLogin = () => {
    handleLogin()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin()
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-background rule-blueprint overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute w-125 h-125 bg-primary/5 rounded-full blur-3xl pointer-events-none -top-40 -left-40" />

      <div className="w-full max-w-sm hallmark-card p-8 relative z-10 shadow-lg border-border/80">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-mono font-bold text-lg mb-3 shadow-xs">
            R
          </div>
          <span className="micro-type text-primary block mb-1">AUTH PORTAL</span>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Recall AI</h1>
          <p className="text-xs text-muted-foreground mt-1">Ôn tập & Ghi nhớ kiến thức hiệu quả</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1">
            <label className="micro-type text-[10px] text-muted-foreground block">EMAIL ADDRESS</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
              onKeyPress={handleKeyPress}
              className={error ? 'border-destructive' : ''}
              aria-label="Email"
            />
          </div>

          {/* Password Input with Toggle */}
          <div className="space-y-1">
            <label className="micro-type text-[10px] text-muted-foreground block">PASSWORD</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
                onKeyPress={handleKeyPress}
                className={error ? 'border-destructive pr-10' : 'pr-10'}
                aria-label="Mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs font-mono text-destructive" role="alert" aria-live="polite">
              ⚠ {error}
            </p>
          )}

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Đang xác thực...
              </>
            ) : (
              'Đăng nhập →'
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <Separator className="flex-1" />
            <span className="micro-type text-[9px] text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* Social Login Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full text-xs font-normal"
          >
            <GoogleIcon />
            Đăng nhập với Google
          </Button>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center text-xs text-muted-foreground space-y-2 pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-primary font-medium hover:underline cursor-pointer"
          >
            ← Quay lại Trang chủ Landing Page
          </button>
        </div>
      </div>
    </div>
  )
}
