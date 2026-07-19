import { useNavigate } from 'react-router-dom'
import { Memory } from '@/types'
import { Star, Tag } from 'lucide-react'

interface MemoryCardProps {
  memory: Memory
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const navigate = useNavigate()

  const categoryColors: Record<string, string> = {
    work: 'badge-primary',
    personal: 'badge-success',
    learning: 'badge-warning',
    other: 'badge-error',
  }

  return (
    <div
      onClick={() => navigate(`/memory/${memory.id}`)}
      className="card p-6 cursor-pointer hover:shadow-lg transition-all h-full flex flex-col"
    >
      {/* Category */}
      <div className="mb-3">
        <span className={`badge ${categoryColors[memory.category]}`}>
          {memory.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
        {memory.title}
      </h3>

      {/* Content Preview */}
      <p className="text-text-secondary text-sm mb-4 line-clamp-3 flex-1">
        {memory.content}
      </p>

      {/* Tags */}
      {memory.tags.length > 0 && (
        <div className="flex gap-1 mb-4 flex-wrap">
          {memory.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs text-text-secondary"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {memory.tags.length > 2 && (
            <span className="text-xs text-text-secondary">
              +{memory.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-xs text-text-light">
          {new Date(memory.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="text-sm font-semibold text-text-primary">
            {memory.rating}
          </span>
        </div>
      </div>
    </div>
  )
}
