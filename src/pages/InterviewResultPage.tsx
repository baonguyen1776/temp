import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
import { TurnRecord } from '@/lib/mockApi'
import { useTranslation } from '@/stores/languageStore'

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

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function InterviewResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useTranslation()

  const turns = location.state?.turns as TurnRecord[] || []

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
            {lang === 'vi' ? `Điểm trung bình: ${data.score.toFixed(1)}/10` : `Average Score: ${data.score.toFixed(1)}/10`}
          </p>
          <div className="space-y-1 mt-1 border-t border-zinc-100 pt-2">
            <div className="chart-custom-tooltip__verdict">
              <div className="chart-custom-tooltip__dot bg-emerald-500" />
              <span>{lang === 'vi' ? `Deep (Chuyên sâu): ${deepCount} lượt` : `Deep (In-depth): ${deepCount} turns`}</span>
            </div>
            <div className="chart-custom-tooltip__verdict">
              <div className="chart-custom-tooltip__dot bg-amber-500" />
              <span>{lang === 'vi' ? `Shallow (Hời hợt): ${shallowCount} lượt` : `Shallow (Surface): ${shallowCount} turns`}</span>
            </div>
            <div className="chart-custom-tooltip__verdict">
              <div className="chart-custom-tooltip__dot bg-rose-500" />
              <span>{lang === 'vi' ? `Wrong (Sai lệch): ${wrongCount} lượt` : `Wrong (Incorrect): ${wrongCount} turns`}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Group real turns dynamically if available
  const conceptResults: ConceptResult[] = useMemo(() => {
    if (!turns || turns.length === 0) {
      return mockConceptResults
    }

    const groups: Record<string, { name: string; turns: TurnRecord[] }> = {}
    
    // Hardcoded concept name lookup for demo purposes
    const conceptNames: Record<string, string> = {
      '1': 'Async/Await',
      '2': 'Promises',
      '3': 'Callbacks',
      '4': 'Event Loop',
      '5': 'Scope',
      '6': 'Closures',
      '7': 'Functions',
      '8': 'Destructuring',
    }

    turns.forEach((t) => {
      const cId = t.question.conceptId
      if (!groups[cId]) {
        groups[cId] = {
          name: conceptNames[cId] || 'Khái niệm khác',
          turns: [],
        }
      }
      groups[cId].turns.push(t)
    })

    return Object.keys(groups).map((cId) => {
      const group = groups[cId]
      
      // Calculate weighted score
      const weights = [0.2, 0.3, 0.5]
      let totalWeight = 0
      let weightedSum = 0
      group.turns.forEach((t, i) => {
        const w = weights[i] || 0.3
        weightedSum += t.grade.score * w
        totalWeight += w
      })
      const finalScore = totalWeight > 0 ? weightedSum / totalWeight : 0

      // Map to 10 points scale
      const displayScore = finalScore * 10
      
      let verdict: 'deep' | 'shallow' | 'wrong' = 'deep'
      if (finalScore < 0.4) verdict = 'wrong'
      else if (finalScore < 0.7) verdict = 'shallow'

      return {
        id: cId,
        name: group.name,
        score: Number(displayScore.toFixed(1)),
        verdict,
        turns: group.turns.map((t, idx) => ({
          turn: idx + 1,
          score: Number((t.grade.score * 10).toFixed(1)),
          verdict: t.grade.verdict,
          question: t.question.text,
        })),
      }
    })
  }, [turns])

  // ─── States ──────────────────────────────────────────────────
  const [aiSummaryOpen, setAiSummaryOpen] = useState(true)
  const [tracebacks, setTracebacks] = useState<TracebackNode[]>(
    turns && turns.length > 0
      ? initialTracebacks.filter(tb => conceptResults.some(cr => cr.id === tb.conceptName || cr.score < 6.0))
      : initialTracebacks
  )
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null)
  const [disputedConcepts, setDisputedConcepts] = useState<Record<string, boolean>>({})
  
  // Dispute Modal States
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
    setDisputedConcepts(prev => ({ ...prev, [disputeConceptName]: true }))
    setDisputeOpen(false)
    alert(lang === 'vi' 
      ? `Đã gửi khiếu nại cho khái niệm "${disputeConceptName}". Trạng thái đã được cập nhật thành "Đang khiếu nại".`
      : `Dispute submitted for concept "${disputeConceptName}". Status updated to "Dispute Pending".`)
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
    if (score >= 7.0) return lang === 'vi' ? 'Đã vững' : 'Strong'
    if (score >= 4.0) return lang === 'vi' ? 'Đang học' : 'Medium'
    return lang === 'vi' ? 'Cần củng cố' : 'Review Focus'
  }

  // Summary math
  const strongConcepts = conceptResults.filter(c => c.score >= 7.0).length
  const weakConcepts = conceptResults.filter(c => c.score < 7.0).length

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4">
      
      {/* ─── HEADER ─── */}
      <div className="border-b border-border pb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <Award className="text-indigo-600" size={26} />
            {lang === 'vi' ? 'Kết quả phiên Interview' : 'AI Interview Results'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {lang === 'vi' ? 'Ngày thực hiện: ' : 'Date: '}<span className="font-semibold text-foreground">18/07/2026</span> • {lang === 'vi' ? 'Thời gian: ' : 'Duration: '}<span className="font-semibold text-foreground">24 {lang === 'vi' ? 'phút' : 'mins'}</span>
          </p>
        </div>
      </div>

      {/* ─── SECTION 1: SCORE OVERVIEW (Recharts Chart) ─── */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {lang === 'vi' ? 'Biểu đồ phân tích độ vững kiến thức' : 'Mastery Level Distribution Graph'}
        </h2>

        {/* Horizontal Bar Chart */}
        <div className="h-62.5 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={conceptResults}
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
                {conceptResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-center">
          <div className="bg-emerald-50/50 rounded-lg p-2.5 border border-emerald-100">
            <p className="text-xs text-emerald-800 font-medium">{lang === 'vi' ? 'Khái niệm vững' : 'Mastered Concepts'}</p>
            <p className="text-lg font-extrabold text-emerald-600">{strongConcepts} / {conceptResults.length}</p>
          </div>
          <div className="bg-amber-50/50 rounded-lg p-2.5 border border-amber-100">
            <p className="text-xs text-amber-800 font-medium">{lang === 'vi' ? 'Cần ôn luyện thêm' : 'Needs Review'}</p>
            <p className="text-lg font-extrabold text-amber-600">{weakConcepts} / {conceptResults.length}</p>
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
            <h3 className="font-bold text-sm text-foreground">{lang === 'vi' ? 'Nhận xét từ Recall AI' : 'Recall AI Feedback'}</h3>
          </div>
          {aiSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {aiSummaryOpen && (
          <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/60">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === 'vi'
                ? 'Bạn đã thể hiện tư duy lập trình vững vàng ở các phần cấu trúc Scope và Promises cơ bản. Tuy nhiên, việc tối ưu Closures tránh rò rỉ tài nguyên bộ nhớ và hiểu cặn kẽ Event Loop là hai điểm mấu chốt bạn cần củng cố thêm trước khi chuyển sang các chủ đề Framework phức tạp hơn.'
                : 'You showed solid programming logic in basic Scope and Promises. However, optimizing Closures to avoid memory leaks and deeply understanding the Event Loop are two key aspects you need to revise before moving to complex Frameworks.'}
            </p>

            {/* Bullets layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Strengths */}
              <div className="space-y-2 bg-emerald-50/20 p-3 rounded-lg border border-emerald-100/50">
                <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  {lang === 'vi' ? 'Điểm mạnh (Strengths)' : 'Strengths'}
                </h4>
                <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>{lang === 'vi' ? 'Xác định Scope chain rất nhanh và chính xác' : 'Resolve scope chains very quickly and accurately'}</li>
                  <li>{lang === 'vi' ? 'Sử dụng Promise chaining thành thạo' : 'Proficient in using Promise chaining'}</li>
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="space-y-2 bg-rose-50/20 p-3 rounded-lg border border-rose-100/50">
                <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  {lang === 'vi' ? 'Điểm yếu (Weaknesses)' : 'Weaknesses'}
                </h4>
                <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>{lang === 'vi' ? 'Chưa hiểu sâu về cách Closures giữ tham chiếu Heap' : 'Lacks understanding of how Closures hold Heap references'}</li>
                  <li>{lang === 'vi' ? 'Nhầm lẫn cơ chế ưu tiên giữa Micro và Macrotask' : 'Confuses priorities of Micro and Macrotasks'}</li>
                </ul>
              </div>

              {/* Recommendations */}
              <div className="space-y-2 bg-indigo-50/20 p-3 rounded-lg border border-indigo-100/50">
                <h4 className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                  <Lightbulb size={14} />
                  {lang === 'vi' ? 'Khuyến nghị (Recommendations)' : 'Recommendations'}
                </h4>
                <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>{lang === 'vi' ? 'Ôn lại bài giảng về Garbage Collector trong JS' : 'Revise Garbage Collector architecture in JS'}</li>
                  <li>{lang === 'vi' ? 'Thực hành chạy tay hoạt động của Event Loop' : 'Practice manually tracing the Event Loop steps'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── SECTION 3: TRACEBACK INFO ─── */}
      {tracebacks.length > 0 && (
        <div className="traceback-card border border-border rounded-xl p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={18} />
            <h3 className="font-bold text-sm">{lang === 'vi' ? 'Phát hiện lỗ hổng nền tảng (Traceback Node)' : 'Found Prerequisite Gap (Traceback Node)'}</h3>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {lang === 'vi'
              ? 'Recall AI đã phân tích đồ thị khái niệm và phát hiện lỗ hổng ở kiến thức tiên quyết làm ảnh hưởng tiêu cực đến điểm số các khái niệm nâng cao hơn:'
              : 'Recall AI analyzed the concept graph and found gaps in prerequisite concepts affecting advanced topics:'}
          </p>

          <div className="space-y-2">
            {tracebacks.map((node) => (
              <div key={node.id} className="traceback-relationship">
                <div className="flex-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    P: {node.prereqName}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    C: {node.conceptName}
                  </span>
                  <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-medium ml-auto">
                    {lang === 'vi' ? 'Đã thêm vào lịch ôn' : 'Added to schedule'}
                  </span>
                </div>
                <button
                  onClick={() => handleDismissTraceback(node.id)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
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
          {lang === 'vi' ? 'Chi tiết đánh giá từng khái niệm' : 'Detailed Assessment per Concept'}
        </h2>

        <div className="space-y-2">
          {conceptResults.map((concept) => {
            const isOpen = expandedConcept === concept.id
            const isDisputed = disputedConcepts[concept.name]
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
                    {isDisputed && (
                      <Badge className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/20 border border-amber-500/25 text-[9px] py-0.5 px-1.5 uppercase font-bold">
                        {lang === 'vi' ? 'Đang khiếu nại' : 'Dispute Pending'}
                      </Badge>
                    )}
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Content */}
                {isOpen && (
                  <div className="result-accordion-content space-y-4">
                    
                    {/* Turn-by-turn scores */}
                    <div className="border rounded-lg overflow-hidden divide-y">
                      {concept.turns.map((turn) => (
                        <div key={turn.turn} className="p-3 bg-muted/30 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {lang === 'vi' ? `Lượt ${turn.turn}/3 — Câu hỏi` : `Turn ${turn.turn}/3 — Question`}
                            </span>
                            <Badge
                              className={`${getScoreClass(turn.score)} border-0 text-[9px] py-0 px-1.5`}
                            >
                              {turn.score.toFixed(1)} — {turn.verdict === 'deep' ? (lang === 'vi' ? 'Chính xác' : 'Correct') : turn.verdict === 'shallow' ? (lang === 'vi' ? 'Chưa đủ' : 'Partial') : (lang === 'vi' ? 'Sai/Thiếu' : 'Incorrect')}
                            </Badge>
                          </div>
                          
                          <p className="text-xs font-semibold text-foreground">
                            {turn.question}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Dispute score trigger */}
                    {!isDisputed && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleOpenDispute(concept.name)}
                          className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 hover:underline"
                        >
                          <MessageSquareWarning size={13} />
                          {lang === 'vi' ? 'Khiếu nại điểm số này?' : 'Dispute this score?'}
                        </button>
                      </div>
                    )}

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
          {lang === 'vi' ? 'Về Dashboard' : 'Back to Dashboard'}
        </Button>
        
        <Button
          onClick={() => navigate('/interview/config')}
          className="flex items-center gap-1.5 shadow-sm"
        >
          {lang === 'vi' ? 'Bắt đầu phiên tiếp theo' : 'Start Next Session'}
          <ArrowRight size={16} />
        </Button>
      </div>

      {/* ─── DISPUTE SCORE DIALOG MODAL ─── */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{lang === 'vi' ? 'Khiếu nại điểm số' : 'Dispute Score'}</DialogTitle>
            <DialogDescription className="text-xs">
              {lang === 'vi' 
                ? <>Yêu cầu đánh giá lại câu trả lời của khái niệm <strong>{disputeConceptName}</strong>.</>
                : <>Request evaluation of answers for concept <strong>{disputeConceptName}</strong>.</>}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1.5">
                {lang === 'vi' ? 'Lý do khiếu nại' : 'Reason for Dispute'}
              </label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full text-xs border rounded-lg p-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="score-mismatch">{lang === 'vi' ? 'Điểm số quá thấp so với câu trả lời' : 'Score is too low compared to my answer'}</option>
                <option value="incorrect-feedback">{lang === 'vi' ? 'Nhận xét của AI bị sai lệch chuyên môn' : 'AI feedback is professionally incorrect'}</option>
                <option value="voice-error">{lang === 'vi' ? 'Lỗi đọc giọng nói/STT không nhận diện đúng ý' : 'Voice recognition failed to capture my intent'}</option>
                <option value="other">{lang === 'vi' ? 'Lý do khác' : 'Other reason'}</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1.5">
                {lang === 'vi' ? 'Chi tiết lý do khiếu nại (bắt buộc)' : 'Dispute Details (required)'}
              </label>
              <textarea
                rows={4}
                value={disputeText}
                onChange={(e) => setDisputeText(e.target.value)}
                placeholder={lang === 'vi' ? 'Nhập lý do cụ thể hoặc giải trình câu trả lời của bạn...' : 'Enter your specific reason or defense of your answer...'}
                className="w-full text-xs border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeOpen(false)}>
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button
              disabled={disputeText.trim() === ''}
              onClick={handleSubmitDispute}
            >
              {lang === 'vi' ? 'Gửi khiếu nại' : 'Submit Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
