import { useEffect } from 'react'
import { Router } from '@/router'
import { useAuthStore } from '@/stores/authStore'

export default function App() {
  const { setIsLoading, setUser } = useAuthStore()

  useEffect(() => {
    // Initialize app - check if user is authenticated
    const initializeApp = async () => {
      try {
        // TODO: Add authentication logic here
        // For now, just mark loading as complete
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [setIsLoading, setUser])

  return <Router />
}
