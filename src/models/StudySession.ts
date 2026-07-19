export interface SessionData {
  id: string
  type: 'focus' | 'interview'
  planId: string
  planName: string
  conceptId?: string
  conceptName?: string
  startedAt: string
  pausedAt?: string
}

export class StudySession implements SessionData {
  id: string
  type: 'focus' | 'interview'
  planId: string
  planName: string
  conceptId?: string
  conceptName?: string
  startedAt: string
  pausedAt?: string

  constructor(data: SessionData) {
    this.id = data.id
    this.type = data.type
    this.planId = data.planId
    this.planName = data.planName
    this.conceptId = data.conceptId
    this.conceptName = data.conceptName
    this.startedAt = data.startedAt
    this.pausedAt = data.pausedAt
  }

  isFocus(): boolean {
    return this.type === 'focus'
  }

  isInterview(): boolean {
    return this.type === 'interview'
  }

  isPaused(): boolean {
    return !!this.pausedAt
  }

  getElapsedTime(nowIsoString?: string): string {
    const end = this.pausedAt
      ? new Date(this.pausedAt)
      : nowIsoString
        ? new Date(nowIsoString)
        : new Date()
    const start = new Date(this.startedAt)
    const diffMs = Math.max(0, end.getTime() - start.getTime())
    
    const mins = Math.floor(diffMs / 60000)
    const secs = Math.floor((diffMs % 60000) / 1000)
    
    const formattedMins = String(mins).padStart(2, '0')
    const formattedSecs = String(secs).padStart(2, '0')
    
    return `${formattedMins}:${formattedSecs}`
  }
}
