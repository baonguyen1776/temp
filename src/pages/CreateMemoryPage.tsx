import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMemoryStore } from '@/stores/memoryStore'
import { Memory } from '@/types'

export default function CreateMemoryPage() {
  const navigate = useNavigate()
  const { addMemory } = useMemoryStore()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'personal' as const,
    tags: '' as string,
    rating: 5,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newMemory: Memory = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      timestamp: new Date(),
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      rating: formData.rating,
      category: formData.category,
    }

    addMemory(newMemory)
    navigate('/')
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'rating' ? parseInt(value, 10) : value,
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="section-title">Create New Memory</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Give your memory a title"
            className="input-field w-full"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Content
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Write down your memory in detail..."
            rows={8}
            className="input-field w-full resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-field w-full"
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="learning">Learning</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g. important, project-x, review"
            className="input-field w-full"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Importance (1-10)
          </label>
          <input
            type="range"
            name="rating"
            min="1"
            max="10"
            value={formData.rating}
            onChange={handleChange}
            className="w-full"
          />
          <div className="text-center mt-2 text-text-secondary">
            Rating: {formData.rating}/10
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button type="submit" className="btn-primary flex-1">
            Create Memory
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
