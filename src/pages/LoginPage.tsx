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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get returnUrl from query params
  const searchParams = new URLSearchParams(window.location.search)
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email hoặc mật khẩu không đúng')
      return
    }

    setError('')
    setLoading(true)

    // Use authStore login
    const { login } = await import('@/stores/authStore').then(m => {
      return { login: m.useAuthStore.getState().login }
    })

    const success = await login(email, password)
    setLoading(false)

    if (success) {
      navigate(decodeURIComponent(returnUrl))
    } else {
      setError('Đăng nhập thất bại. Vui lòng thử lại.')
    }
  }

  const handleGoogleLogin = () => {
    // Mock Google login
    console.log('Google login clicked')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin()
    }
  }

  return (
    <div className="login-bg flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-border p-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-foreground font-sans">Recall</h1>
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          </div>
          <p className="text-sm text-muted-foreground">Ôn tập thông minh hơn mỗi ngày</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email Input */}
          <Input
            type="email"
            placeholder="Email của bạn"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            onKeyPress={handleKeyPress}
            className={error ? 'border-destructive' : ''}
            aria-label="Email"
          />

          {/* Password Input with Toggle */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
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
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">hoặc</span>
            <Separator className="flex-1" />
          </div>

          {/* Google Login Button */}
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full"
          >
            <GoogleIcon />
            Tiếp tục với Google
          </Button>

          {/* Footer Links */}
          <div className="space-y-3 text-center">
            <a href="#" className="block text-sm text-primary hover:underline">
              Quên mật khẩu?
            </a>
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-primary hover:underline font-medium"
              >
                Đăng ký
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
