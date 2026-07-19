export interface Question {
  id: string
  conceptId: string
  type: 'recall' | 'application' | 'why'
  text: string
  voiceUrl?: string
}

export interface GradeResult {
  score: number
  verdict: 'deep' | 'shallow' | 'wrong'
  text: string
}

export interface TurnRecord {
  question: Question
  answerText: string
  grade: GradeResult
}

export interface SessionSummary {
  averageScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  async generateQuestion(_conceptId: string, turn: number, conceptName?: string): Promise<Question> {
    await delay(1000)
    const name = conceptName || 'khái niệm này'
    const types: Array<'why' | 'application' | 'recall'> = ['why', 'application', 'recall']
    const type = types[turn % 3]
    
    let text = ''
    if (type === 'why') {
      text = `Tại sao ${name} lại quan trọng trong lập trình và cơ chế hoạt động cốt lõi của nó là gì?`
    } else if (type === 'application') {
      text = `Hãy viết hoặc mô tả một ví dụ thực tế sử dụng ${name} để giải quyết bài toán thực tế?`
    } else {
      text = `${name} có thể dẫn tới những vấn đề hoặc lỗi phổ biến nào? Làm cách nào để tối ưu hóa hoặc phòng tránh điều này?`
    }

    return {
      id: `q-${_conceptId}-${turn}-${Date.now()}`,
      conceptId: _conceptId,
      type,
      text
    }
  },

  async gradeAnswer(_questionId: string, answer: string): Promise<GradeResult> {
    await delay(1500)

    // A simple heuristic for the mock
    if (answer.length < 10) {
      return {
        score: 0.2,
        verdict: 'wrong',
        text: 'Rất tiếc, câu trả lời chưa chính xác. Cần giải thích rõ cơ chế bên dưới.'
      }
    } else if (answer.length < 40) {
      return {
        score: 0.55,
        verdict: 'shallow',
        text: 'Câu trả lời ở mức độ trung bình. Bạn đã nêu được ý chính nhưng chưa phân tích chi tiết.'
      }
    } else {
      return {
        score: 0.9,
        verdict: 'deep',
        text: 'Câu trả lời rất chính xác và sâu sắc! Bạn đã giải thích rõ cơ chế chi tiết.'
      }
    }
  },

  async runTraceback(_conceptId: string, _graph: any): Promise<string[]> {
    await delay(500)
    // Return mock prerequisite ID that needs review
    return ['5'] // Assuming '5' is a prerequisite in our mock data
  },

  async summarizeSession(turns: TurnRecord[]): Promise<SessionSummary> {
    await delay(2000)
    const totalScore = turns.reduce((sum, t) => sum + t.grade.score, 0)
    const avgScore = turns.length > 0 ? totalScore / turns.length : 0

    return {
      averageScore: avgScore,
      strengths: ['Hiểu rõ khái niệm cơ bản'],
      weaknesses: ['Thiếu ví dụ thực tế'],
      recommendations: ['Luyện tập thêm bài tập áp dụng']
    }
  }
}
