export interface ConceptData {
  id: string
  name: string
  mastery: number | null
  difficulty: number
  prerequisites: string[]
  isRemediating?: boolean
}

export class Concept implements ConceptData {
  id: string
  name: string
  mastery: number | null
  difficulty: number
  prerequisites: string[]
  isRemediating?: boolean

  constructor(data: ConceptData) {
    this.id = data.id
    this.name = data.name
    this.mastery = data.mastery
    this.difficulty = data.difficulty
    this.prerequisites = data.prerequisites
    this.isRemediating = data.isRemediating
  }

  getStatus(): 'strong' | 'learning' | 'weak' | 'untested' {
    if (this.mastery === null) return 'untested'
    if (this.mastery < 0.6) return 'weak'
    if (this.mastery < 0.8) return 'learning'
    return 'strong'
  }

  getMasteryLabel(): string {
    const status = this.getStatus()
    switch (status) {
      case 'strong':
        return 'Vững'
      case 'learning':
        return 'Đang học'
      case 'weak':
        return 'Yếu'
      default:
        return 'Chưa ôn'
    }
  }

  getMasteryClass(): string {
    if (this.isRemediating) return 'concept-node--remediating'
    const status = this.getStatus()
    switch (status) {
      case 'strong':
        return 'concept-node--strong'
      case 'learning':
        return 'concept-node--learning'
      case 'weak':
        return 'concept-node--weak'
      default:
        return 'concept-node--untested'
    }
  }

  getMasteryDotClass(): string {
    const status = this.getStatus()
    switch (status) {
      case 'strong':
        return 'bg-[rgb(16_185_129)]'
      case 'learning':
        return 'bg-[rgb(245_158_11)]'
      case 'weak':
        return 'bg-[rgb(239_68_68)]'
      default:
        return 'bg-[rgb(139_92_246)]'
    }
  }

  getMasteryBadgeClass(): string {
    const status = this.getStatus()
    switch (status) {
      case 'strong':
        return 'bg-[rgb(16_185_129)]/20 text-[rgb(16_185_129)] border-[rgb(16_185_129)]/30'
      case 'learning':
        return 'bg-[rgb(245_158_11)]/20 text-[rgb(245_158_11)] border-[rgb(245_158_11)]/30'
      case 'weak':
        return 'bg-[rgb(239_68_68)]/20 text-[rgb(239_68_68)] border-[rgb(239_68_68)]/30'
      default:
        return 'bg-[rgb(139_92_246)]/20 text-[rgb(139_92_246)] border-[rgb(139_92_246)]/30'
    }
  }
}
