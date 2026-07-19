import React from 'react'

export interface PlanData {
  id: string
  name: string
  deadline: string
  status: 'active' | 'draft' | 'archived'
  progress: number
  conceptCount: number
}

export class StudyPlan implements PlanData {
  id: string
  name: string
  deadline: string
  status: 'active' | 'draft' | 'archived'
  progress: number
  conceptCount: number

  constructor(data: PlanData) {
    this.id = data.id
    this.name = data.name
    this.deadline = data.deadline
    this.status = data.status
    this.progress = data.progress
    this.conceptCount = data.conceptCount
  }

  getDaysRemaining(): number | 'đã hết hạn' {
    try {
      const diff = new Date(this.deadline).getTime() - new Date().getTime()
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
      return days > 0 ? days : 'đã hết hạn'
    } catch {
      return 'đã hết hạn'
    }
  }

  renderDaysRemaining(): React.ReactNode {
    const days = this.getDaysRemaining()
    if (days === 'đã hết hạn') {
      return React.createElement('span', null, 'đã hết hạn')
    }
    return React.createElement(
      'span',
      null,
      'còn ',
      React.createElement('span', { className: 'font-mono' }, days),
      ' ngày'
    )
  }

  isActive(): boolean {
    return this.status === 'active'
  }

  isDraft(): boolean {
    return this.status === 'draft'
  }

  isArchived(): boolean {
    return this.status === 'archived'
  }

  getStatusLabel(): string {
    switch (this.status) {
      case 'active':
        return 'Đang chạy'
      case 'draft':
        return 'Nháp'
      case 'archived':
        return 'Lưu trữ'
      default:
        return ''
    }
  }

  getStatusBadgeClass(): string {
    switch (this.status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50 hover:bg-emerald-50'
      case 'draft':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
      case 'archived':
        return 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-100'
      default:
        return ''
    }
  }
}
