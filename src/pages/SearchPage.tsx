import { useState, useMemo } from 'react'
import { useMemoryStore } from '@/stores/memoryStore'
import { MemoryCard } from '@/components/cards/MemoryCard'
import { Search as SearchIcon, Filter } from 'lucide-react'

export default function SearchPage() {
  const { memories } = useMemoryStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date')

  const filteredMemories = useMemo(() => {
    let results = memories

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.content.toLowerCase().includes(query) ||
          m.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory) {
      results = results.filter((m) => m.category === selectedCategory)
    }

    // Sorting
    if (sortBy === 'date') {
      results.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    } else if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating)
    }

    return results
  }, [memories, searchQuery, selectedCategory, sortBy])

  const categories = ['work', 'personal', 'learning', 'other'] as const

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="section-title">Search Memories</h1>

        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            placeholder="Search by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full pl-10 py-3 text-base"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-secondary" />
          <span className="text-text-secondary font-medium">Filters:</span>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-white'
                : 'bg-surface text-text-primary hover:bg-border'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-primary hover:bg-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'rating')}
          className="input-field text-sm"
        >
          <option value="date">Newest First</option>
          <option value="rating">Highest Rating</option>
        </select>
      </div>

      {/* Results */}
      <div>
        <p className="text-text-secondary text-sm mb-4">
          Found {filteredMemories.length} memories
        </p>

        {filteredMemories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary">
              No memories found. Try adjusting your search.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
