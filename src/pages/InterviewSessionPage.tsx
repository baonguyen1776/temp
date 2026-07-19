import { useState, useEffect, useReducer, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Pause,
  X,
  Volume2,
  Mic,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Award,
  AlertTriangle,
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
import { mockApi, Question, GradeResult, TurnRecord } from '@/lib/mockApi'
import '@/styles/interview-session.css'
import { useSessionStore } from '@/stores/sessionStore'
import { usePlanStore } from '@/stores/planStore'

// ─── Types & Interfaces ─────────────────────────────────────────
interface ConceptProgress {
  id: string
  name: string
  status: 'pending' | 'current' | 'done' | 'traceback'
  score: number | null
}

const initialProgressList: ConceptProgress[] = [
  { id: '1', name: 'Scope trong JS', status: 'done', score: 8.5 },
  { id: '2', name: 'Closures', status: 'current', score: null },
  { id: '3', name: 'Promises', status: 'pending', score: null },
  { id: '4', name: 'Async/Await', status: 'pending', score: null },
  { id: '5', name: 'Event Loop', status: 'pending', score: null },
]

// ─── State Machine Types ────────────────────────────────────────
type InterviewStatus = 'idle' | 'loading_question' | 'awaiting_answer' | 'grading' | 'showing_feedback' | 'traceback' | 'complete'

interface InterviewState {
  status: InterviewStatus
  currentConceptIndex: number
  currentTurn: number
  maxTurns: number
  conceptQueue: ConceptProgress[]
  turns: TurnRecord[]
  pausedAt: string | null
  fallbackMode: boolean
  
  activeQuestion: Question | null
  activeGrade: GradeResult | null
  replyText: string
}

type InterviewAction =
  | { type: 'START_SESSION' }
  | { type: 'QUESTION_LOADED'; payload: Question }
  | { type: 'SET_REPLY_TEXT'; payload: string }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'GRADE_RECEIVED'; payload: GradeResult }
  | { type: 'NEXT_TURN' }
  | { type: 'TRACEBACK_TRIGGERED' }
  | { type: 'NEXT_CONCEPT' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'END_SESSION' }
  | { type: 'AI_FALLBACK' }

// ─── Reducer ────────────────────────────────────────────────────
function interviewReducer(state: InterviewState, action: InterviewAction): InterviewState {
  switch (action.type) {
    case 'START_SESSION':
      return { ...state, status: 'loading_question' }
      
    case 'QUESTION_LOADED':
      return { 
        ...state, 
        status: 'awaiting_answer', 
        activeQuestion: action.payload,
        activeGrade: null,
        replyText: ''
      }
      
    case 'SET_REPLY_TEXT':
      return { ...state, replyText: action.payload }
      
    case 'SUBMIT_ANSWER':
      return { ...state, status: 'grading' }
      
    case 'GRADE_RECEIVED': {
      const newTurn: TurnRecord = {
        question: state.activeQuestion!,
        answerText: state.replyText,
        grade: action.payload
      }
      return { 
        ...state, 
        status: 'showing_feedback', 
        activeGrade: action.payload,
        turns: [...state.turns, newTurn]
      }
    }

    case 'NEXT_TURN':
      return { 
        ...state, 
        status: 'loading_question', 
        currentTurn: state.currentTurn + 1,
        activeQuestion: null,
        activeGrade: null,
        replyText: ''
      }

    case 'TRACEBACK_TRIGGERED': {
      const updatedQueue = [...state.conceptQueue]
      updatedQueue[state.currentConceptIndex] = {
        ...updatedQueue[state.currentConceptIndex],
        status: 'traceback'
      }
      return {
        ...state,
        status: 'traceback',
        conceptQueue: updatedQueue
      }
    }

    case 'NEXT_CONCEPT': {
      const isComplete = state.currentConceptIndex >= state.conceptQueue.length - 1
      if (isComplete) {
        return { ...state, status: 'complete' }
      }
      
      const updatedQueue = [...state.conceptQueue]
      
      // Calculate score for current concept based on turns
      const currentConceptTurns = state.turns.slice(-state.currentTurn - 1)
      const avg = currentConceptTurns.length > 0
        ? currentConceptTurns.reduce((sum, t) => sum + t.grade.score, 0) / currentConceptTurns.length
        : 0
      
      updatedQueue[state.currentConceptIndex] = {
        ...updatedQueue[state.currentConceptIndex],
        status: 'done',
        score: Number(avg.toFixed(1))
      }

      const nextIndex = state.currentConceptIndex + 1
      updatedQueue[nextIndex] = {
        ...updatedQueue[nextIndex],
        status: 'current'
      }

      return {
        ...state,
        status: 'loading_question',
        currentConceptIndex: nextIndex,
        currentTurn: 0,
        conceptQueue: updatedQueue,
        activeQuestion: null,
        activeGrade: null,
        replyText: ''
      }
    }

    case 'PAUSE':
      return { ...state, pausedAt: new Date().toISOString() }

    case 'RESUME':
      return { ...state, pausedAt: null }

    case 'END_SESSION':
      return { ...state, status: 'complete' }

    case 'AI_FALLBACK':
      return { ...state, fallbackMode: !state.fallbackMode }

    default:
      return state
  }
}

// ─── Audio Chime Helper ─────────────────────────────────────────
const playVoiceSynthesizer = (text: string) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'vi-VN'
      utterance.rate = 0.95
      window.speechSynthesis.speak(utterance)
    }
  } catch (e) {
    console.error('Không thể phát âm thanh TTS:', e)
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { plans, getPlanById } = usePlanStore()
  const { startSession, pauseSession, resumeSession, endSession, activeSession } = useSessionStore()

  // Find current plan
  const currentPlan = activeSession?.type === 'interview' && activeSession.planId
    ? getPlanById(activeSession.planId)
    : plans.find(p => p.id === 'plan-1') || plans[0]

  // ─── State Machine ─────────────────────────────────────────────
  const [state, dispatch] = useReducer(interviewReducer, {
    status: 'idle',
    currentConceptIndex: 1, // Start at index 1 for demo purposes
    currentTurn: 0,
    maxTurns: 3,
    conceptQueue: initialProgressList,
    turns: [],
    pausedAt: null,
    fallbackMode: false,
    activeQuestion: null,
    activeGrade: null,
    replyText: ''
  })

  // ─── Sync Session with Store ───
  useEffect(() => {
    if (!activeSession || activeSession.type !== 'interview' || activeSession.planId !== (currentPlan?.id || 'plan-1')) {
      startSession({
        id: id || 'mock-session-1',
        type: 'interview',
        planId: currentPlan?.id || 'plan-1',
        planName: currentPlan?.name || 'JavaScript Advanced',
        conceptId: initialProgressList[state.currentConceptIndex]?.id || '2',
        conceptName: initialProgressList[state.currentConceptIndex]?.name || 'Closures',
        startedAt: new Date().toISOString(),
      })
    }
  }, [currentPlan, state.currentConceptIndex, id, activeSession, startSession])

  // ─── Local UI States ─────────────────────────────────────────
  const [voiceEnabled] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [feedbackExpanded, setFeedbackExpanded] = useState(true)
  const [flashcardFlipped, setFlashcardFlipped] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ─── Effect: State Machine Orchestrator ────────────────────────
  useEffect(() => {
    let active = true

    const runEffects = async () => {
      const activeConcept = state.conceptQueue[state.currentConceptIndex]

      if (state.status === 'idle') {
        dispatch({ type: 'START_SESSION' })
      } 
      
      else if (state.status === 'loading_question') {
        try {
          const q = await mockApi.generateQuestion(activeConcept.id, state.currentTurn)
          if (active) dispatch({ type: 'QUESTION_LOADED', payload: q })
        } catch (err) {
          console.error(err)
          if (active) dispatch({ type: 'AI_FALLBACK' })
        }
      } 
      
      else if (state.status === 'grading') {
        try {
          const result = await mockApi.gradeAnswer(state.activeQuestion!.id, state.replyText)
          if (active) dispatch({ type: 'GRADE_RECEIVED', payload: result })
        } catch (err) {
          console.error(err)
          if (active) dispatch({ type: 'AI_FALLBACK' })
        }
      }
    }

    runEffects()
    return () => { active = false }
  }, [state.status, state.currentConceptIndex, state.currentTurn, state.conceptQueue, state.activeQuestion, state.replyText])

  // ─── Effect: TTS ──────────────────────────────────────────────
  useEffect(() => {
    if (state.status === 'awaiting_answer' && voiceEnabled && !state.fallbackMode && state.activeQuestion) {
      const timer = setTimeout(() => {
        playVoiceSynthesizer(state.activeQuestion!.text)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [state.status, voiceEnabled, state.fallbackMode, state.activeQuestion])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.status, state.currentTurn])

  // ─── Handlers ────────────────────────────────────────────────
  const handleSubmitAnswer = () => {
    if (state.replyText.trim() === '') return
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    dispatch({ type: 'SUBMIT_ANSWER' })
  }

  const handleNextAction = async () => {
    const isLastTurn = state.currentTurn >= state.maxTurns - 1
    const isWrong = state.activeGrade?.verdict === 'wrong'

    if (isWrong) {
      try {
        const activeConcept = state.conceptQueue[state.currentConceptIndex]
        const prereqs = await mockApi.runTraceback(activeConcept.id, null)
        if (prereqs && prereqs.length > 0) {
          dispatch({ type: 'TRACEBACK_TRIGGERED' })
        } else {
          dispatch({ type: 'NEXT_CONCEPT' })
        }
      } catch (err) {
        console.error('Failed to run traceback check:', err)
        dispatch({ type: 'NEXT_CONCEPT' })
      }
    } else if (isLastTurn) {
      dispatch({ type: 'NEXT_CONCEPT' })
    } else {
      dispatch({ type: 'NEXT_TURN' })
    }
  }

  const handleStartRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      const mockReplies = [
        'Theo tôi Closures hoạt động bằng cách giữ tham chiếu Heap đến Lexical Environment của hàm cha.',
        'Ví dụ thực tế là hàm trả về một đối tượng chứa getter/setter thay đổi biến cục bộ.',
        'Closures giữ tham chiếu đến DOM chưa được dọn dẹp gây rò rỉ bộ nhớ, ta phải gán biến closure về null.',
      ]
      dispatch({ type: 'SET_REPLY_TEXT', payload: mockReplies[state.currentTurn % 3] })
    } else {
      setIsRecording(true)
    }
  }

  const handleFlashcardGrade = (grade: 'correct' | 'partial' | 'wrong') => {
    let score = 9.0
    let verdict: 'deep' | 'shallow' | 'wrong' = 'deep'
    if (grade === 'partial') {
      score = 5.5; verdict = 'shallow'
    } else if (grade === 'wrong') {
      score = 2.0; verdict = 'wrong'
    }

    dispatch({ 
      type: 'GRADE_RECEIVED', 
      payload: { score, verdict, text: 'Tự đánh giá qua Flashcard.' }
    })
    setFlashcardFlipped(false)
  }

  // Linear progress calculation
  const totalSteps = state.conceptQueue.length * state.maxTurns
  const completedSteps = (state.currentConceptIndex * state.maxTurns) + state.currentTurn + (state.status === 'showing_feedback' ? 1 : 0)
  const progressPercent = Math.min(100, (completedSteps / totalSteps) * 100)

  const activeConcept = state.conceptQueue[state.currentConceptIndex]

  return (
    <div className="fixed inset-0 interview-theme-dark flex flex-col z-50">
      
      {/* ─── FIXED HEADER ─── */}
      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900 flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Interview: JavaScript Advanced
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* Concept Progress Indicators */}
          <div className="hidden md:flex flex-col items-center">
            <span className="text-xs font-bold text-zinc-100">
              Khái niệm {state.currentConceptIndex + 1}/{state.conceptQueue.length}: {activeConcept.name}
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
              Lượt {state.currentTurn + 1}/{state.maxTurns}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700">
            <span className="text-[10px] font-bold text-zinc-300 uppercase">Flashcard Mode</span>
            <button
              onClick={() => dispatch({ type: 'AI_FALLBACK' })}
              className={`toggle-switch ${state.fallbackMode ? 'toggle-switch--active bg-red-500' : 'bg-zinc-600'}`}
            >
              <div className="toggle-switch__thumb" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (state.pausedAt) {
                  dispatch({ type: 'RESUME' })
                  resumeSession()
                } else {
                  dispatch({ type: 'PAUSE' })
                  pauseSession()
                }
              }}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold"
            >
              <Pause size={14} className="mr-1.5" />
              Tạm dừng
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExitConfirm(true)}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/20 text-xs font-bold"
            >
              <X size={14} className="mr-1.5" />
              Kết thúc
            </Button>
          </div>
        </div>
      </div>

      <div className="linear-progress-bar flex-shrink-0 z-30">
        <div className="linear-progress-bar__fill" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* ─── CONTENT PANELS ─── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* ─── MAIN CHAT TIMELINE (Left) ─── */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10 space-y-6">
          
          {state.fallbackMode && (
            <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex items-center gap-3 text-red-200 flex-shrink-0 animate-in slide-in-from-top-4 duration-300">
              <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-xs">AI tạm thời không khả dụng — Chế độ Flashcard</h4>
                <p className="text-[10px] text-red-400 leading-tight">
                  Tự lật thẻ xem gợi ý đáp án và tự chấm điểm để duy trì tiến độ phiên kiểm tra.
                </p>
              </div>
            </div>
          )}

          <div className="flex-1 space-y-6 max-w-3xl mx-auto w-full">
            
            {/* AI Question Section */}
            {state.status === 'loading_question' || state.status === 'idle' ? (
              <div className="space-y-3 loading-question-pulse max-w-lg">
                <div className="h-4 bg-zinc-800 rounded w-1/4" />
                <div className="h-16 bg-zinc-800 rounded w-full" />
              </div>
            ) : state.activeQuestion ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 text-xs font-semibold">🤖 Recall AI</span>
                  <Badge className="bg-zinc-800 text-zinc-400 font-bold border-0 text-[9px] uppercase tracking-wider">
                    {state.activeQuestion.type}
                  </Badge>
                </div>
                
                {state.fallbackMode ? (
                  <div className={`flashcard-card ${flashcardFlipped ? 'flashcard-card--flipped' : ''}`}>
                    <div className="flashcard-card__inner">
                      <div className="flashcard-card__front">
                        <p className="text-sm font-semibold leading-relaxed mb-4">{state.activeQuestion.text}</p>
                        <Button size="sm" onClick={() => setFlashcardFlipped(true)}>
                          <RotateCw size={13} className="mr-1.5" /> Lật thẻ xem gợi ý
                        </Button>
                      </div>
                      <div className="flashcard-card__back">
                        <p className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold mb-2">Gợi ý đáp án phỏng vấn</p>
                        <p className="text-xs text-zinc-300 mb-6 leading-relaxed">Ví dụ: Cần giải thích rõ cơ chế lưu trữ Lexical Environment trong bộ nhớ heap...</p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold" onClick={() => handleFlashcardGrade('correct')}>✅ Đúng</Button>
                          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold" onClick={() => handleFlashcardGrade('partial')}>⚠️ Một phần</Button>
                          <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold" onClick={() => handleFlashcardGrade('wrong')}>❌ Sai</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="chat-bubble-ai">{state.activeQuestion.text}</div>
                    <div className="flex gap-2 items-center">
                      <Button variant="ghost" size="sm" onClick={() => playVoiceSynthesizer(state.activeQuestion!.text)} className="text-zinc-500 hover:text-zinc-300 text-[10px] h-7 px-2 font-semibold">
                        <Volume2 size={12} className="mr-1" /> Nghe câu hỏi
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* User reply bubble */}
            {(state.status === 'grading' || state.status === 'showing_feedback' || state.status === 'complete' || state.status === 'traceback') && !state.fallbackMode && state.replyText && (
              <div className="space-y-1">
                <div className="text-right">
                  <span className="text-zinc-500 text-xs font-semibold">Bạn</span>
                </div>
                <div className="chat-bubble-user max-w-xl">
                  {state.replyText}
                </div>
              </div>
            )}

            {/* AI Grading Loader */}
            {state.status === 'grading' && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse pt-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span>AI đang chấm điểm và phân tích câu trả lời...</span>
              </div>
            )}

            {/* FEEDBACK BLOCK */}
            {state.status === 'showing_feedback' && state.activeGrade && (
              <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-400">Kết quả đánh giá:</span>
                    <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${state.activeGrade.score >= 7.0 ? 'bg-emerald-500/20 text-emerald-400' : state.activeGrade.score >= 4.0 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {state.activeGrade.score.toFixed(1)}/10
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${state.activeGrade.verdict === 'deep' ? 'bg-emerald-600/25 text-emerald-400' : state.activeGrade.verdict === 'shallow' ? 'bg-amber-600/25 text-amber-400' : 'bg-rose-600/25 text-rose-400'}`}>
                      {state.activeGrade.verdict}
                    </span>
                  </div>
                  <button onClick={() => setFeedbackExpanded(prev => !prev)} className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center">
                    {feedbackExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                {feedbackExpanded && (
                  <p className="text-xs text-zinc-300 leading-relaxed">{state.activeGrade.text}</p>
                )}
                <div className="flex justify-end pt-2">
                  <Button onClick={handleNextAction} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm">
                    {state.activeGrade.verdict === 'wrong' ? 'Ôn lại gốc' : state.currentTurn >= state.maxTurns - 1 ? 'Khái niệm tiếp theo' : 'Câu tiếp theo'}
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            )}

            {/* Traceback Block */}
            {state.status === 'traceback' && (
              <div className="border border-rose-800/40 bg-rose-950/20 rounded-2xl p-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-rose-900/30 text-rose-400 flex items-center justify-center mx-auto">
                  <AlertTriangle size={36} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Phát hiện hổng kiến thức nền tảng!</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    Có vẻ bạn chưa vững khái niệm nền tảng. Recall AI sẽ chuyển bạn sang chế độ Traceback để lấp lỗ hổng này trước khi tiếp tục.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => dispatch({ type: 'NEXT_CONCEPT' })} className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl">
                    Bỏ qua, học tiếp
                  </Button>
                  <Button onClick={() => {
                    endSession()
                    navigate('/focus/5')
                  }} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl">
                    Bắt đầu Traceback
                  </Button>
                </div>
              </div>
            )}

            {/* Complete Block */}
            {state.status === 'complete' && (
              <div className="border border-indigo-800/40 bg-indigo-950/20 rounded-2xl p-8 text-center space-y-5 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-indigo-900/30 text-indigo-400 flex items-center justify-center mx-auto">
                  <Award size={36} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Hoàn thành phiên kiểm tra!</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    Chúc mừng! Bạn đã hoàn thành bài kiểm tra.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => navigate(`/interview/${id}/result`)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl">
                    Xem báo cáo kết quả
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── BOTTOM STUDENT INPUT ZONE ─── */}
          {state.status === 'awaiting_answer' && !state.fallbackMode && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 max-w-3xl mx-auto w-full flex-shrink-0 space-y-4">
              <textarea
                rows={4}
                value={state.replyText}
                onChange={(e) => dispatch({ type: 'SET_REPLY_TEXT', payload: e.target.value })}
                placeholder="Nhập câu trả lời của bạn..."
                className="w-full bg-transparent border-0 text-sm focus:outline-none focus:ring-0 text-zinc-100 placeholder-zinc-500 resize-none"
              />
              <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3">
                <button
                  onClick={handleStartRecording}
                  className={`p-2 rounded-full border transition-colors ${isRecording ? 'mic-recording-active border-red-500' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                >
                  <Mic size={16} className={isRecording ? 'animate-pulse' : ''} />
                </button>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={state.replyText.trim() === ''}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-sm"
                >
                  Gửi câu trả lời →
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* ─── SIDEBAR PROGRESS TRACKER (Right) ─── */}
        <div className={`interview-sidebar border-l border-zinc-800 bg-zinc-900/40 relative flex-shrink-0 flex flex-col ${sidebarOpen ? 'w-[280px]' : 'w-0'}`}>
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-12 bg-zinc-800 border border-zinc-700 rounded-l-md flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {sidebarOpen && (
            <div className="p-5 flex flex-col h-full overflow-y-auto">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Tiến độ phiên</h3>
              <div className="space-y-3">
                {state.conceptQueue.map((c, i) => {
                  const isCurrent = i === state.currentConceptIndex
                  return (
                    <div key={c.id} className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${isCurrent ? 'border-indigo-500 bg-indigo-950/20' : 'border-zinc-800 bg-zinc-900/20'}`}>
                      <div className="pt-0.5 text-sm">
                        {c.status === 'done' ? <span className="text-emerald-500">✅</span>
                          : c.status === 'current' ? <span className="text-indigo-400 animate-spin inline-block">🔄</span>
                          : c.status === 'traceback' ? <span className="text-rose-500">🔍</span>
                          : <span className="text-zinc-600">⬜</span>}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-xs text-zinc-100">{c.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">
                            {c.status === 'done' ? 'Hoàn thành' : c.status === 'current' ? 'Đang học' : c.status === 'traceback' ? 'Traceback' : 'Chưa học'}
                          </span>
                          {c.score !== null && (
                            <span className="text-[9px] font-extrabold text-emerald-400">• {c.score}/10</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── DIALOGS & OVERLAYS ─── */}
      {state.pausedAt && (
        <div className="fixed inset-0 focus-pause-overlay bg-black/75 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl p-8 max-w-sm w-full text-center border border-zinc-800 shadow-2xl space-y-5">
            <div className="w-16 h-16 bg-zinc-800 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-3xl">⏸</div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Đã tạm dừng Interview</h2>
              <p className="text-xs text-zinc-400 mt-1">Tạm thời đóng băng tiến độ trao đổi phỏng vấn.</p>
            </div>
            <Button onClick={() => {
              dispatch({ type: 'RESUME' })
              resumeSession()
            }} className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs py-2">
              Tiếp tục
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="max-w-sm bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Xác nhận thoát?</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Mọi kết quả tự học trong phiên này sẽ được lưu lại. Bạn có chắc chắn muốn dừng phiên phỏng vấn?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white" onClick={() => setShowExitConfirm(false)}>Hủy</Button>
            <Button className="bg-rose-600 text-white" onClick={() => {
              setShowExitConfirm(false)
              endSession()
              navigate(`/plans/${currentPlan?.id || 'plan-1'}`)
            }}>Thoát Interview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
