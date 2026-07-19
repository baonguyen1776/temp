import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import {
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  X,
  MessageSquareWarning,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import '@/styles/interview-result.css'

// ─── Interfaces ────────────────────────────────────────────────
interface ConceptResult {
  id: string
  name: string
  score: number
  verdict: 'deep' | 'shallow' | 'wrong'
  turns: {
    turn: number
    score: number
    verdict: 'deep' | 'shallow' | 'wrong'
    question: string
  }[]
}

interface TracebackNode {
  id: string
  prereqName: string
  prereqMastery: number
  conceptName: string
  conceptMastery: number
}

// ─── Mock Data ──────────────────────────────────────────────────
const mockConceptResults: ConceptResult[] = [
  {
    id: '1',
    name: 'Scope & Scope Chain',
    score: 8.5,
    verdict: 'deep',
    turns: [
      { turn: 1, score: 9.0, verdict: 'deep', question: 'Lexical scope là gì và nó được xác định khi nào?' },
      { turn: 2, score: 8.0, verdict: 'deep', question: 'Scope chain hoạt động như thế nào khi tìm kiếm biến?' },
      { turn: 3, score: 8.5, verdict: 'deep', question: 'Global scope ảnh hưởng thế nào đến hiệu năng bộ nhớ?' },
    ],
  },
  {
    id: '2',
    name: 'Closures',
    score: 5.5,
    verdict: 'shallow',
    turns: [
      { turn: 1, score: 9.0, verdict: 'deep', question: 'Tại sao Closures có thể ghi nhớ phạm vi cha?' },
      { turn: 2, score: 5.5, verdict: 'shallow', question: 'Tạo đối tượng có private variable bằng Closures?' },
      { turn: 3, score: 2.0, verdict: 'wrong', question: 'Closures gây ra memory leak như thế nào?' },
    ],
  },
  {
    id: '3',
    name: 'Promises',
    score: 7.2,
    verdict: 'deep',
    turns: [
      { turn: 1, score: 8.0, verdict: 'deep', question: 'Trạng thái Fulfilled và Rejected hoạt động thế nào?' },
      { turn: 2, score: 7.0, verdict: 'deep', question: 'Promise chaining trả về kết quả gì?' },
      { turn: 3, score: 6.5, verdict: 'shallow', question: 'Cách xử lý đồng thời nhiều Promise qua Promise.all?' },
    ],
  },
  {
    id: '4',
    name: 'Async/Await',
    score: 4.8,
    verdict: 'shallow',
    turns: [
      { turn: 1, score: 6.0, verdict: 'shallow', question: 'Async function khác gì so với hàm thông thường?' },
      { turn: 2, score: 4.5, verdict: 'shallow', question: 'Cơ chế dừng của await có chặn luồng chính không?' },
      { turn: 3, score: 4.0, verdict: 'shallow', question: 'Try/catch lồng trong async function bắt lỗi thế nào?' },
    ],
  },
  {
    id: '5',
    name: 'Event Loop',
    score: 2.0,
    verdict: 'wrong',
    turns: [
      { turn: 1, score: 3.0, verdict: 'wrong', question: 'Sự khác biệt giữa Microtask Queue và Macrotask Queue?' },
      { turn: 2, score: 2.0, verdict: 'wrong', question: 'Call Stack hoạt động thế nào khi xử lý bất đồng bộ?' },
      { turn: 3, score: 1.0, verdict: 'wrong', question: 'Render queue được kích hoạt ở thời điểm nào trong vòng lặp?' },
    ],
  },
]

const initialTracebacks: TracebackNode[] = [
  {
    id: 'tb1',
    prereqName: 'Functions & Parameters',
    prereqMastery: 0.95,
    conceptName: 'Closures',
    conceptMastery: 0.55,
  },
  {
    id: 'tb2',
    prereqName: 'Lexical Scope',
    prereqMastery: 0.35,
    conceptName: 'Async/Await',
    conceptMastery: 0.48,
  },
]

// ─── Custom Tooltip Component for Recharts ──────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: ConceptResult = payload[0].payload
    
    // Count verdicts
    const deepCount = data.turns.filter(t => t.verdict === 'deep').length
    const shallowCount = data.turns.filter(t => t.verdict === 'shallow').length
    const wrongCount = data.turns.filter(t => t.verdict === 'wrong').length

    return (
      <div className="chart-custom-tooltip">
        <p className="chart-custom-tooltip__title">{data.name}</p>
        <p className="chart-custom-tooltip__score">
          Điểm trung bình: {data.score.toFixed(1)}/10
        </p>
        <div className="space-y-1 mt-1 border-t border-zinc-100 pt-2">
          <div className="chart-custom-tooltip__verdict">
            <div className="chart-custom-tooltip__dot bg-emerald-500" />
            <span>Deep (Chuyên sâu): {deepCount} lượt</span>
          </div>
          <div className="chart-custom-tooltip__verdict">
            <div className="chart-custom-tooltip__dot bg-amber-500" />
            <span>Shallow (Hời hợt): {shallowCount} lượt</span>
          </div>
          <div className="chart-custom-tooltip__verdict">
            <div className="chart-custom-tooltip__dot bg-rose-500" />
            <span>Wrong (Sai lệch): {wrongCount} lượt</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function InterviewResultPage() {
  const navigate = useNavigate()

  // ─── States ──────────────────────────────────────────────────
  const [aiSummaryOpen, setAiSummaryOpen] = useState(true)
  const [tracebacks, setTracebacks] = useState<TracebackNode[]>(initialTracebacks)
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null)
  
  // Dispute Modal States (AE-10)
  const [disputeOpen, setDisputeOpen] = useState(false)
  const [disputeConceptName, setDisputeConceptName] = useState('')
  const [disputeReason, setDisputeReason] = useState('score-mismatch')
  const [disputeText, setDisputeText] = useState('')

  // ─── Handlers ────────────────────────────────────────────────
  const handleDismissTraceback = (id: string) => {
    setTracebacks(prev => prev.filter(item => item.id !== id))
  }

  const handleOpenDispute = (conceptName: string) => {
    setDisputeConceptName(conceptName)
    setDisputeText('')
    setDisputeReason('score-mismatch')
    setDisputeOpen(true)
  }

  const handleSubmitDispute = () => {
    // Mock submit and close
    setDisputeOpen(false)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 7.0) return '#10B981' // emerald
    if (score >= 4.0) return '#F59E0B' // amber
    return '#EF4444' // red
  }

  const getScoreClass = (score: number): string => {
    if (score >= 7.0) return 'score-badge-green'
    if (score >= 4.0) return 'score-badge-orange'
    return 'score-badge-red'
  }

  const getMasteryLabel = (score: number): string => {
    if (score >= 7.0) return 'Vững'
    if (score >= 4.0) return 'Yếu' // or Trung bình based on requirements
    return 'Cần ôn thêm'
  }

  // Summary math
  const strongConcepts = mockConceptResults.filter(c => c.score >= 7.0).length
  const weakConcepts = mockConceptResults.filter(c => c.score < 7.0).length

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
      
      {/* ─── HEADER ─── */}
      <div className="border-b border-border pb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Award className="text-indigo-600" size={26} />
            Kết quả phiên Interview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ngày thực hiện: <span className="font-semibold text-foreground">18/07/2026</span> • Thời gian: <span className="font-semibold text-foreground">24 phút</span>
          </p>
        </div>
      </div>

      {/* ─── SECTION 1: SCORE OVERVIEW (Recharts Chart) ─── */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Biểu đồ phân tích độ vững kiến thức
        </h2>

        {/* Horizontal Bar Chart */}
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={mockConceptResults}
              layout="vertical"
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 10]} stroke="#888888" fontSize={11} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#888888"
                fontSize={10}
                width={120}
                tickFormatter={(value) => (value.length > 18 ? `${value.substring(0, 16)}...` : value)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={14}>
                {mockConceptResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-center">
          <div className="bg-emerald-50/50 rounded-lg p-2.5 border border-emerald-100">
            <p className="text-xs text-emerald-800 font-medium">Khái niệm vững</p>
            <p className="text-lg font-extrabold text-emerald-600">{strongConcepts} / {mockConceptResults.length}</p>
          </div>
          <div className="bg-amber-50/50 rounded-lg p-2.5 border border-amber-100">
            <p className="text-xs text-amber-800 font-medium">Cần ôn luyện thêm</p>
            <p className="text-lg font-extrabold text-amber-600">{weakConcepts} / {mockConceptResults.length}</p>
          </div>
        </div>
      </div>

      {/* ─── SECTION 2: AI SUMMARY CARD ─── */}
      <div className={`result-collapsible-card ${aiSummaryOpen ? 'result-collapsible-card--open' : ''}`}>
        <button
          onClick={() => setAiSummaryOpen(prev => !prev)}
          className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600" size={18} />
            <h3 className="font-bold text-sm text-foreground">Nhận xét từ Recall AI</h3>
          </div>
          {aiSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {aiSummaryOpen && (
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/60">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Bạn đã thể hiện tư duy lập trình vững vàng ở các phần cấu trúc Scope và Promises cơ bản. Tuy nhiên, việc tối ưu Closures tránh rò rỉ tài nguyên bộ nhớ và hiểu cặn kẽ Event Loop là hai điểm mấu chốt bạn cần củng cố thêm trước khi chuyển sang các chủ đề Framework phức tạp hơn.
            </p>

            {/* Bullets layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Strengths */}
              <div className="space-y-2 bg-emerald-50/20 p-3 rounded-lg border border-emerald-100/50">
                <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  Điểm mạnh (Strengths)
                </h4>
                <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4">
                  <li>Xác định Scope chain rất nhanh và chính xác</li>
                  <li>Sử dụng Promise chaining thành thạo</li>
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2 bg-rose-50/20 p-3 rounded-lg border border-rose-100/50">
                <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  Điểm yếu (Weaknesses)
                </h4>
                <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4">
                  <li>Chưa hiểu sâu về cách Closures giữ tham chiếu Heap</li>
                  <li>Nhầm lẫn cơ chế ưu tiên giữa Micro và Macrotask</li>
                </ul>
              </div>

              {/* Recommendations */}
              <div className="space-y-2 bg-indigo-50/20 p-3 rounded-lg border border-indigo-100/50">
                <h4 className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                  <Lightbulb size={14} />
                  Khuyến nghị (Recommendations)
                </h4>
                <ul className="text-[11px] text-zinc-600 space-y-1.5 list-disc pl-4">
                  <li>Ôn lại bài giảng về Garbage Collector trong JS</li>
                  <li>Thực hành chạy tay hoạt động của Event Loop</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── SECTION 3: TRACEBACK INFO (AE-08, Conditional) ─── */}
      {tracebacks.length > 0 && (
        <div className="traceback-card border border-border rounded-xl p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={18} />
            <h3 className="font-bold text-sm">Phát hiện lỗ hổng nền tảng (Traceback Node)</h3>
          </div>
          
          <p className="text-xs text-zinc-600">
            Recall AI đã phân tích đồ thị khái niệm và phát hiện lỗ hổng ở kiến thức tiên quyết làm ảnh hưởng tiêu cực đến điểm số các khái niệm nâng cao hơn:
          </p>

          <div className="space-y-2">
            {tracebacks.map((node) => (
              <div key={node.id} className="traceback-relationship">
                <div className="flex-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded">
                    P: {node.prereqName}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    C: {node.conceptName}
                  </span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium ml-auto">
                    Đã thêm vào lịch ôn
                  </span>
                </div>
                <button
                  onClick={() => handleDismissTraceback(node.id)}
                  className="p-1 hover:bg-zinc-100 rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Bỏ qua"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SECTION 4: CONCEPT DETAIL ACCORDION ─── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Chi tiết đánh giá từng khái niệm
        </h2>

        <div className="space-y-2">
          {mockConceptResults.map((concept) => {
            const isOpen = expandedConcept === concept.id
            return (
              <div
                key={concept.id}
                className={`result-accordion-item ${isOpen ? 'result-accordion-item--active' : ''}`}
              >
                {/* Trigger */}
                <button
                  onClick={() => setExpandedConcept(isOpen ? null : concept.id)}
                  className="result-accordion-trigger"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-foreground">{concept.name}</span>
                    <Badge
                      className={`${getScoreClass(concept.score)} border-0 text-[10px] py-0.5 px-2`}
                    >
                      {concept.score.toFixed(1)}/10 — {getMasteryLabel(concept.score)}
                    </Badge>
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Content */}
                {isOpen && (
                  <div className="result-accordion-content space-y-4">
                    
                    {/* Turn-by-turn scores */}
                    <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                      {concept.turns.map((turn) => (
                        <div key={turn.turn} className="p-3 bg-zinc-50/50 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                              Lượt {turn.turn}/3 — Câu hỏi
                            </span>
                            <Badge
                              className={`${getScoreClass(turn.score)} border-0 text-[9px] py-0 px-1.5`}
                            >
                              {turn.score.toFixed(1)} — {turn.verdict}
                            </Badge>
                          </div>
                          
                          <p className="text-xs font-semibold text-foreground">
                            {turn.question}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Dispute score trigger */}
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleOpenDispute(concept.name)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline"
                      >
                        <MessageSquareWarning size={13} />
                        Khiếu nại điểm số này?
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── BOTTOM ACTIONS ─── */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="font-semibold text-muted-foreground hover:bg-surface text-sm"
        >
          Về Dashboard
        </Button>
        
        <Button
          onClick={() => navigate('/interview/config')}
          className="flex items-center gap-1.5 shadow-sm"
        >
          Bắt đầu phiên tiếp theo
          <ArrowRight size={16} />
        </Button>
      </div>

      {/* ─── DISPUTE SCORE DIALOG MODAL (AE-10) ─── */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Khiếu nại điểm số</DialogTitle>
            <DialogDescription className="text-xs">
              Yêu cầu đánh giá lại câu trả lời của khái niệm <strong>{disputeConceptName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1.5">
                Lý do khiếu nại
              </label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full text-xs border border-border rounded-lg p-2.5 bg-white focus:outline-none focus:border-indigo-500"
              >
                <option value="score-mismatch">Điểm số quá thấp so với câu trả lời</option>
                <option value="incorrect-feedback">Nhận xét của AI bị sai lệch chuyên môn</option>
                <option value="voice-error">Lỗi đọc giọng nói/STT không nhận diện đúng ý</option>
                <option value="other">Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1.5">
                Chi tiết lý do khiếu nại (bắt buộc)
              </label>
              <textarea
                rows={4}
                value={disputeText}
                onChange={(e) => setDisputeText(e.target.value)}
                placeholder="Nhập lý do cụ thể hoặc giải trình câu trả lời của bạn..."
                className="w-full text-xs border border-border rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeOpen(false)}>
              Hủy
            </Button>
            <Button
              disabled={disputeText.trim() === ''}
              onClick={handleSubmitDispute}
            >
              Gửi khiếu nại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
