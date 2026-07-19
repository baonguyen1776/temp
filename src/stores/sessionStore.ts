import { create } from 'zustand'
import { StudySession, SessionData } from '@/models/StudySession'

interface SessionStore {
  activeSession: StudySession | null
  pausedSession: StudySession | null
  startSession: (sessionData: SessionData) => void
  pauseSession: () => void
  resumeSession: () => void
  endSession: () => void
}

// Mock a paused session for demo
const mockPausedSessionData: SessionData = {
  id: 'session-paused-1',
  type: 'interview',
  planId: 'plan-1',
  planName: 'JavaScript Advanced',
  conceptId: '6',
  conceptName: 'Closures',
  startedAt: '2026-07-17T14:30:00Z',
  pausedAt: '2026-07-17T15:05:00Z',
}

const mockPausedSession = new StudySession(mockPausedSessionData)

export const useSessionStore = create<SessionStore>((set) => ({
  activeSession: null,
  pausedSession: mockPausedSession,

  startSession: (sessionData) =>
    set({ activeSession: new StudySession(sessionData), pausedSession: null }),

  pauseSession: () =>
    set((state) => {
      if (!state.activeSession) return {}
      const pausedSessionData: SessionData = {
        ...state.activeSession,
        pausedAt: new Date().toISOString(),
      }
      return {
        activeSession: null,
        pausedSession: new StudySession(pausedSessionData),
      }
    }),

  resumeSession: () =>
    set((state) => {
      if (!state.pausedSession) return {}
      const activeSessionData: SessionData = {
        ...state.pausedSession,
        pausedAt: undefined,
      }
      return {
        activeSession: new StudySession(activeSessionData),
        pausedSession: null,
      }
    }),

  endSession: () =>
    set({ activeSession: null, pausedSession: null }),
}))
