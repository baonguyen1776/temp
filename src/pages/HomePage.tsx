import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMemoryStore } from '@/stores/memoryStore'
import { useAuthStore } from '@/stores/authStore'
import { MemoryCard } from '@/components/cards/MemoryCard'
import { Plus, Zap } from 'lucide-react'

export default function HomePage() {
  const navigate = useNavigate()
  const { memories } = useMemoryStore()
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/profile')
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const recentMemories = memories.slice(-6).reverse()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 rounded-lg p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to Recall AI</h1>
          <p className="text-lg opacity-90 mb-6">
            Capture your thoughts, search your memories, and unlock the power of
            intelligent recall with AI-powered organization.
          </p>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Memory
          </button>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Total Memories
              </p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {memories.length}
              </p>
            </div>
            <Zap className="w-8 h-8 text-accent opacity-50" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                This Week
              </p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {
                  memories.filter((m) => {
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return new Date(m.timestamp) > weekAgo
                  }).length
                }
              </p>
            </div>
            <Zap className="w-8 h-8 text-secondary opacity-50" />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm font-medium">
                Avg Rating
              </p>
              <p className="text-3xl font-bold text-text-primary mt-2">
                {memories.length > 0
                  ? (
                      memories.reduce((acc, m) => acc + m.rating, 0) /
                      memories.length
                    ).toFixed(1)
                  : 0}
              </p>
            </div>
            <Zap className="w-8 h-8 text-status-warning opacity-50" />
          </div>
        </div>
      </section>

      {/* Recent Memories */}
      <section>
        <h2 className="section-title">Recent Memories</h2>
        {recentMemories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary mb-4">No memories yet</p>
            <button
              onClick={() => navigate('/create')}
              className="btn-primary"
            >
              Create Your First Memory
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
