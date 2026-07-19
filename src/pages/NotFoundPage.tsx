import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-text-primary">404</h1>
        <p className="text-2xl font-semibold text-text-secondary">
          Page Not Found
        </p>
        <p className="text-text-secondary max-w-md">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}
