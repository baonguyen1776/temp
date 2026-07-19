import { create } from 'zustand'
import { Memory } from '@/types'

interface MemoryStore {
  memories: Memory[]
  setMemories: (memories: Memory[]) => void
  addMemory: (memory: Memory) => void
  removeMemory: (id: string) => void
  updateMemory: (id: string, memory: Partial<Memory>) => void
  getMemoryById: (id: string) => Memory | undefined
  getMemoriesByCategory: (category: Memory['category']) => Memory[]
  getMemoriesByTag: (tag: string) => Memory[]
}

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  memories: [],
  
  setMemories: (memories) => set({ memories }),
  
  addMemory: (memory) => {
    set((state) => ({
      memories: [...state.memories, memory],
    }))
  },
  
  removeMemory: (id) => {
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    }))
  },
  
  updateMemory: (id, updates) => {
    set((state) => ({
      memories: state.memories.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }))
  },
  
  getMemoryById: (id) => {
    return get().memories.find((m) => m.id === id)
  },
  
  getMemoriesByCategory: (category) => {
    return get().memories.filter((m) => m.category === category)
  },
  
  getMemoriesByTag: (tag) => {
    return get().memories.filter((m) => m.tags.includes(tag))
  },
}))
