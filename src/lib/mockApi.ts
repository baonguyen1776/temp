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

const mockQuestions: Record<string, Question[]> = {
  'why': [
    {
      id: 'q1',
      conceptId: '1',
      type: 'why',
      text: 'Tại sao Closures trong JavaScript lại có thể truy cập và ghi nhớ được các biến ở phạm vi cha (lexical environment) ngay cả khi hàm cha đã thực thi xong?'
    }
  ],
  'application': [
    {
      id: 'q2',
      conceptId: '1',
      type: 'application',
      text: 'Hãy viết hoặc mô tả cấu trúc một ví dụ thực tế sử dụng Closures để tạo ra một đối tượng có thuộc tính "private variable" mà bên ngoài không thể thay đổi trực tiếp được?'
    }
  ],
  'recall': [
    {
      id: 'q3',
      conceptId: '1',
      type: 'recall',
      text: 'Closures có thể dẫn tới vấn đề rò rỉ bộ nhớ (memory leaks) trong trình duyệt như thế nào? Làm cách nào để giải phóng hoặc phòng tránh điều này?'
    }
  ]
}

export const mockApi = {
  async generateQuestion(_conceptId: string, turn: number): Promise<Question> {
    await delay(1000)
    
    // Simulate failure rate for AE-05 (AI Fallback) testing
    // if (Math.random() < 0.1) throw new Error('AI Service Unavailable')

    const types: Array<'why' | 'application' | 'recall'> = ['why', 'application', 'recall']
    const type = types[turn % 3]
    return mockQuestions[type][0]
  },

  async gradeAnswer(_questionId: string, answer: string): Promise<GradeResult> {
    await delay(1500)

    // A simple heuristic for the mock
    if (answer.length < 10) {
      return {
        score: 2.0,
        verdict: 'wrong',
        text: 'Rất tiếc, câu trả lời chưa chính xác. Cần giải thích rõ cơ chế bên dưới.'
      }
    } else if (answer.length < 40) {
      return {
        score: 5.5,
        verdict: 'shallow',
        text: 'Câu trả lời ở mức độ trung bình. Bạn đã nêu được ý chính nhưng chưa phân tích chi tiết.'
      }
    } else {
      return {
        score: 9.0,
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
