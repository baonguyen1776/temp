import { useParams, useNavigate } from 'react-router-dom'
import { useMemoryStore } from '@/stores/memoryStore'
import { ArrowLeft, Trash2, Edit } from 'lucide-react'

export default function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getMemoryById, removeMemory } = useMemoryStore()

  const memory = id ? getMemoryById(id) : null

  if (!memory) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary mb-4">Memory not found</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Go Back
        </button>
      </div>
    )
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      removeMemory(memory.id)
      navigate('/')
    }
  }

  const categoryColors: Record<string, string> = {
    work: 'badge-primary',
    personal: 'badge-success',
    learning: 'badge-warning',
    other: 'badge-error',
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-primary hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="btn-secondary flex items-center gap-2 text-status-error hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Memory Card */}
      <article className="bg-card rounded-lg border border-border p-8 shadow-md">
        {/* Title */}
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          {memory.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-border">
          <span className={`badge ${categoryColors[memory.category]}`}>
            {memory.category}
          </span>
          <span className="text-text-secondary text-sm">
            {new Date(memory.timestamp).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="text-text-secondary text-sm">
            ★ {memory.rating}/10
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none mb-8">
          <p className="text-text-primary whitespace-pre-wrap text-lg leading-relaxed">
            {memory.content}
          </p>
        </div>

        {/* Tags */}
        {memory.tags.length > 0 && (
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {memory.tags.map((tag) => (
                <span
                  key={tag}
                  className="badge-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
