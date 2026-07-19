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

interface ValidationErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const getPasswordStrength = (password: string): { level: 'weak' | 'medium' | 'strong'; score: number } => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*]/.test(password)) score++

    if (score <= 2) return { level: 'weak', score: 1 }
    if (score <= 3) return { level: 'medium', score: 2 }
    return { level: 'strong', score: 3 }
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name':
        return !value ? 'Họ tên là bắt buộc' : undefined
      case 'email':
        if (!value) return 'Email là bắt buộc'
        return !validateEmail(value) ? 'Email không hợp lệ' : undefined
      case 'password':
        return value.length < 8 ? 'Mật khẩu phải ít nhất 8 ký tự' : undefined
      case 'confirmPassword':
        return value !== formData.password ? 'Mật khẩu không khớp' : undefined
      default:
        return undefined
    }
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field as keyof typeof formData])
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }))
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, value)
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    newErrors.name = validateField('name', formData.name)
    newErrors.email = validateField('email', formData.email)
    newErrors.password = validateField('password', formData.password)
    newErrors.confirmPassword = validateField('confirmPassword', formData.confirmPassword)

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error)
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setLoading(true)

    // Mock delay for demo
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    navigate('/dashboard')
  }

  const handleGoogleRegister = () => {
    console.log('Google register clicked')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleRegister()
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="login-bg flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm bg-card rounded-xl border border-border p-8 relative z-10">
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
          {/* Full Name Input */}
          <div>
            <Input
              type="text"
              placeholder="Họ tên"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              onKeyPress={handleKeyPress}
              className={errors.name ? 'border-destructive' : ''}
              aria-label="Họ tên"
            />
            {touched.name && errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              onKeyPress={handleKeyPress}
              className={errors.email ? 'border-destructive' : ''}
              aria-label="Email"
            />
            {touched.email && errors.email && (
              <p className="text-xs text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input with Toggle and Strength Indicator */}
          <div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu (tối thiểu 8 ký tự)"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                onKeyPress={handleKeyPress}
                className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
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
            {touched.password && errors.password && (
              <p className="text-xs text-destructive mt-1">{errors.password}</p>
            )}
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2 flex items-center gap-1">
                <div
                  className={`h-1 w-6 rounded-full transition-colors ${
                    passwordStrength.score >= 1 ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`h-1 w-6 rounded-full transition-colors ${
                    passwordStrength.score >= 2 ? 'bg-yellow-500' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`h-1 w-6 rounded-full transition-colors ${
                    passwordStrength.score >= 3 ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
                <span className="text-xs text-muted-foreground ml-1">
                  {passwordStrength.level === 'weak' && 'Yếu'}
                  {passwordStrength.level === 'medium' && 'Trung bình'}
                  {passwordStrength.level === 'strong' && 'Mạnh'}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Input with Toggle */}
          <div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                onKeyPress={handleKeyPress}
                className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                aria-label="Xác nhận mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Register Button */}
          <Button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              'Tạo tài khoản'
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">hoặc</span>
            <Separator className="flex-1" />
          </div>

          {/* Google Register Button */}
          <Button
            variant="outline"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full"
          >
            <GoogleIcon />
            Đăng ký với Google
          </Button>

          {/* Footer Link */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
