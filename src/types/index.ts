export interface Memory {
  id: string
  title: string
  content: string
  timestamp: Date
  tags: string[]
  rating: number
  category: 'work' | 'personal' | 'learning' | 'other'
}

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  relevanceScore: number
  category: Memory['category']
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: 'date' | 'rating' | 'relevance'
  order?: 'asc' | 'desc'
}

// ─── Concept Graph Types ────────────────────────────────────────
export interface Concept {
  id: string
  name: string
  mastery: number | null
  difficulty: number
  prerequisites: string[]
  isRemediating?: boolean
}

/**
 * Returns the CSS modifier class for a concept node based on mastery score.
 * Maps to classes defined in globals.css: concept-node--untested, --weak, --learning, --strong, --remediating
 */
export function getMasteryClass(score: number | null, isRemediating?: boolean): string {
  if (isRemediating) return 'concept-node--remediating'
  if (score === null) return 'concept-node--untested'
  if (score < 0.6) return 'concept-node--weak'
  if (score < 0.8) return 'concept-node--learning'
  return 'concept-node--strong'
}
