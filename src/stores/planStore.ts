import { create } from 'zustand'
import { StudyPlan, PlanData } from '@/models/StudyPlan'
import { Concept } from '@/types'

export interface ScheduleItem {
  conceptId: string
  conceptName: string
  mastery: number | null
}

interface PlanStore {
  plans: StudyPlan[]
  activePlan: StudyPlan | null
  concepts: Record<string, Concept[]>
  schedules: Record<string, Record<number, ScheduleItem[]>>
  setPlans: (plans: StudyPlan[]) => void
  setActivePlan: (plan: StudyPlan | null) => void
  getPlanById: (id: string) => StudyPlan | undefined
  
  // Mutations
  addPlan: (plan: StudyPlan, planConcepts: Concept[]) => void
  deletePlan: (id: string) => void
  archivePlan: (id: string) => void
  updatePlan: (id: string, updates: Partial<PlanData>) => void
  resetPlanProgress: (id: string) => void
  updateConceptMastery: (planId: string, conceptId: string, score: number) => void
  updateConcept: (planId: string, conceptId: string, updates: Partial<Concept>) => void
  updateConceptsAndEdges: (planId: string, concepts: Concept[]) => void
  updateSchedule: (planId: string, schedule: Record<number, ScheduleItem[]>) => void
}

const mockPlansData: PlanData[] = [
  {
    id: 'plan-1',
    name: 'JavaScript Advanced',
    deadline: '2026-12-31',
    status: 'active',
    progress: 65,
    conceptCount: 8,
  },
  {
    id: 'plan-2',
    name: 'React Hooks Deep Dive',
    deadline: '2026-09-15',
    status: 'active',
    progress: 42,
    conceptCount: 12,
  },
  {
    id: 'plan-3',
    name: 'TypeScript Patterns',
    deadline: '2026-08-01',
    status: 'draft',
    progress: 0,
    conceptCount: 6,
  },
]

const defaultConceptsPlan1: Concept[] = [
  { id: '1', name: 'Async/Await', mastery: 0.85, difficulty: 4, prerequisites: ['2', '4'] },
  { id: '2', name: 'Promises', mastery: 0.70, difficulty: 3, prerequisites: ['4'] },
  { id: '3', name: 'Callbacks', mastery: 0.45, difficulty: 2, prerequisites: [] },
  { id: '4', name: 'Event Loop', mastery: null, difficulty: 5, prerequisites: [] },
  { id: '5', name: 'Scope', mastery: 0.90, difficulty: 2, prerequisites: [] },
  { id: '6', name: 'Closures', mastery: 0.60, difficulty: 3, prerequisites: ['5'] },
  { id: '7', name: 'Functions', mastery: 0.95, difficulty: 1, prerequisites: [] },
  { id: '8', name: 'Destructuring', mastery: 0.30, difficulty: 2, prerequisites: ['5'], isRemediating: true },
]

const defaultSchedulePlan1: Record<number, ScheduleItem[]> = {
  0: [
    { conceptId: '8', conceptName: 'Destructuring', mastery: 0.30 },
    { conceptId: '3', conceptName: 'Callbacks', mastery: 0.45 },
  ],
  1: [
    { conceptId: '6', conceptName: 'Closures', mastery: 0.60 },
  ],
  2: [
    { conceptId: '4', conceptName: 'Event Loop', mastery: null },
    { conceptId: '2', conceptName: 'Promises', mastery: 0.70 },
  ],
  3: [
    { conceptId: '1', conceptName: 'Async/Await', mastery: 0.85 },
  ],
  4: [
    { conceptId: '8', conceptName: 'Destructuring', mastery: 0.30 },
    { conceptId: '5', conceptName: 'Scope', mastery: 0.90 },
  ],
  5: [
    { conceptId: '3', conceptName: 'Callbacks', mastery: 0.45 },
    { conceptId: '7', conceptName: 'Functions', mastery: 0.95 },
  ],
  6: [
    { conceptId: '6', conceptName: 'Closures', mastery: 0.60 },
  ],
}

const mockPlans = mockPlansData.map(data => new StudyPlan(data))

export const usePlanStore = create<PlanStore>((set, get) => ({
  plans: mockPlans,
  activePlan: mockPlans[0],
  concepts: {
    'plan-1': defaultConceptsPlan1,
    'plan-2': defaultConceptsPlan1.map(c => ({
      ...c,
      id: `p2-${c.id}`,
      prerequisites: c.prerequisites.map(pId => `p2-${pId}`),
    })),
    'plan-3': defaultConceptsPlan1.map(c => ({
      ...c,
      id: `p3-${c.id}`,
      mastery: null,
      prerequisites: c.prerequisites.map(pId => `p3-${pId}`),
    })),
  },
  schedules: {
    'plan-1': defaultSchedulePlan1,
  },

  setPlans: (plans) => set({ plans }),

  setActivePlan: (plan) => set({ activePlan: plan }),

  getPlanById: (id) => get().plans.find(p => p.id === id),

  addPlan: (plan, planConcepts) => {
    set((state) => ({
      plans: [...state.plans, plan],
      concepts: {
        ...state.concepts,
        [plan.id]: planConcepts,
      },
      schedules: {
        ...state.schedules,
        [plan.id]: planConcepts.reduce((acc, c, idx) => {
          const day = idx % 7
          if (!acc[day]) acc[day] = []
          acc[day].push({ conceptId: c.id, conceptName: c.name, mastery: c.mastery })
          return acc
        }, {} as Record<number, ScheduleItem[]>),
      }
    }))
  },

  deletePlan: (id) => {
    set((state) => {
      const nextPlans = state.plans.filter((p) => p.id !== id)
      const nextConcepts = { ...state.concepts }
      delete nextConcepts[id]
      const nextSchedules = { ...state.schedules }
      delete nextSchedules[id]
      
      return {
        plans: nextPlans,
        activePlan: state.activePlan?.id === id ? (nextPlans[0] || null) : state.activePlan,
        concepts: nextConcepts,
        schedules: nextSchedules,
      }
    })
  },

  archivePlan: (id) => {
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id
          ? new StudyPlan({ ...p, status: 'archived' })
          : p
      ),
      activePlan: state.activePlan?.id === id
        ? new StudyPlan({ ...state.activePlan, status: 'archived' })
        : state.activePlan,
    }))
  },

  updatePlan: (id, updates) => {
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id
          ? new StudyPlan({ ...p, ...updates })
          : p
      ),
      activePlan: state.activePlan?.id === id
        ? new StudyPlan({ ...state.activePlan, ...updates })
        : state.activePlan,
    }))
  },

  resetPlanProgress: (id) => {
    set((state) => {
      const planConcepts = state.concepts[id] || []
      const updatedConcepts = planConcepts.map(c => ({ ...c, mastery: null, isRemediating: false }))
      
      const planSchedule = state.schedules[id] || {}
      const updatedSchedule = { ...planSchedule }
      Object.keys(updatedSchedule).forEach(dayKey => {
        const day = Number(dayKey)
        updatedSchedule[day] = updatedSchedule[day].map(item => ({ ...item, mastery: null }))
      })

      return {
        concepts: {
          ...state.concepts,
          [id]: updatedConcepts,
        },
        schedules: {
          ...state.schedules,
          [id]: updatedSchedule,
        },
        plans: state.plans.map((p) =>
          p.id === id
            ? new StudyPlan({ ...p, progress: 0 })
            : p
        ),
        activePlan: state.activePlan?.id === id
          ? new StudyPlan({ ...state.activePlan, progress: 0 })
          : state.activePlan,
      }
    })
  },

  updateConceptMastery: (planId, conceptId, score) => {
    set((state) => {
      const planConcepts = state.concepts[planId] || []
      const updatedConcepts = planConcepts.map(c => 
        c.id === conceptId ? { ...c, mastery: score, isRemediating: score < 0.6 } : c
      )

      // Re-calculate plan overall progress
      const strongCount = updatedConcepts.filter(c => c.mastery !== null && c.mastery >= 0.7).length
      const progressPercent = updatedConcepts.length > 0 
        ? Math.round((strongCount / updatedConcepts.length) * 100)
        : 0

      // Update schedule mastery too
      const planSchedule = state.schedules[planId] || {}
      const updatedSchedule = { ...planSchedule }
      Object.keys(updatedSchedule).forEach(dayKey => {
        const day = Number(dayKey)
        updatedSchedule[day] = updatedSchedule[day].map(item => 
          item.conceptId === conceptId ? { ...item, mastery: score } : item
        )
      })

      return {
        concepts: {
          ...state.concepts,
          [planId]: updatedConcepts,
        },
        schedules: {
          ...state.schedules,
          [planId]: updatedSchedule,
        },
        plans: state.plans.map((p) =>
          p.id === planId
            ? new StudyPlan({ ...p, progress: progressPercent })
            : p
        ),
        activePlan: state.activePlan?.id === planId
          ? new StudyPlan({ ...state.activePlan, progress: progressPercent })
          : state.activePlan,
      }
    })
  },

  updateConcept: (planId, conceptId, updates) => {
    set((state) => {
      const planConcepts = state.concepts[planId] || []
      const updatedConcepts = planConcepts.map(c => 
        c.id === conceptId ? { ...c, ...updates } : c
      )

      const conceptName = updates.name

      // Update schedule items with new name if updated
      const planSchedule = state.schedules[planId] || {}
      const updatedSchedule = { ...planSchedule }
      if (conceptName) {
        Object.keys(updatedSchedule).forEach(dayKey => {
          const day = Number(dayKey)
          updatedSchedule[day] = updatedSchedule[day].map(item => 
            item.conceptId === conceptId ? { ...item, conceptName: conceptName } : item
          )
        })
      }

      return {
        concepts: {
          ...state.concepts,
          [planId]: updatedConcepts,
        },
        schedules: {
          ...state.schedules,
          [planId]: updatedSchedule,
        }
      }
    })
  },

  updateConceptsAndEdges: (planId, concepts) => {
    set((state) => ({
      concepts: {
        ...state.concepts,
        [planId]: concepts,
      }
    }))
  },

  updateSchedule: (planId, schedule) => {
    set((state) => ({
      schedules: {
        ...state.schedules,
        [planId]: schedule,
      }
    }))
  }
}))
