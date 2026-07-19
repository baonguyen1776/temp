import { create } from 'zustand'
import { StudyPlan, PlanData } from '@/models/StudyPlan'

interface PlanStore {
  plans: StudyPlan[]
  activePlan: StudyPlan | null
  setPlans: (plans: StudyPlan[]) => void
  setActivePlan: (plan: StudyPlan | null) => void
  getPlanById: (id: string) => StudyPlan | undefined
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

const mockPlans = mockPlansData.map(data => new StudyPlan(data))

export const usePlanStore = create<PlanStore>((set, get) => ({
  plans: mockPlans,
  activePlan: mockPlans[0],

  setPlans: (plans) => set({ plans }),

  setActivePlan: (plan) => set({ activePlan: plan }),

  getPlanById: (id) => get().plans.find(p => p.id === id),
}))
