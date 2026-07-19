import { useState, useEffect, useReducer, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Pause,
  X,
  Mic,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
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
import '@/styles/focus-session.css'
import '@/styles/interview-session.css'
import { useSessionStore } from '@/stores/sessionStore'
import { usePlanStore } from '@/stores/planStore'
import { useTranslation } from '@/stores/languageStore'

// ─── Types & Interfaces ─────────────────────────────────────────
interface ConceptProgress {
  id: string
  name: string
  status: 'pending' | 'current' | 'done' | 'traceback'
  score: number | null
}

const initialProgressList: ConceptProgress[] = [
  { id: '1', name: 'Scope trong JS', status: 'done', score: 0.85 },
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
  | { type: 'INITIALIZE_QUEUE'; payload: { queue: ConceptProgress[]; startIndex: number } }
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
    case 'INITIALIZE_QUEUE':
      return {
        ...state,
        conceptQueue: action.payload.queue,
        currentConceptIndex: action.payload.startIndex,
        currentTurn: 0,
        turns: [],
        activeQuestion: null,
        activeGrade: null,
        replyText: '',
      }

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
      const nextIdx = state.currentConceptIndex + 1
      if (nextIdx >= state.conceptQueue.length) {
        return { ...state, status: 'complete' }
      }
      const updatedQueue = [...state.conceptQueue]
      updatedQueue[state.currentConceptIndex] = {
        ...updatedQueue[state.currentConceptIndex],
        status: 'done',
        score: state.turns.length > 0
          ? state.turns.reduce((acc, curr) => acc + curr.grade.score, 0) / state.turns.length
          : 0.8
      }
      updatedQueue[nextIdx] = {
        ...updatedQueue[nextIdx],
        status: 'current'
      }
      return {
        ...state,
        status: 'loading_question',
        currentConceptIndex: nextIdx,
        currentTurn: 0,
        turns: [],
        activeQuestion: null,
        activeGrade: null,
        replyText: '',
      }
    }

    case 'PAUSE':
      return { ...state, pausedAt: new Date().toISOString() }

    case 'RESUME':
      return { ...state, pausedAt: null }

    case 'END_SESSION':
      return { ...state, status: 'idle' }

    case 'AI_FALLBACK':
      return { ...state, fallbackMode: true, status: 'awaiting_answer' }

    default:
      return state
  }
}

const initialInterviewState: InterviewState = {
  status: 'idle',
  currentConceptIndex: 0,
  currentTurn: 0,
  maxTurns: 3,
  conceptQueue: initialProgressList,
  turns: [],
  pausedAt: null,
  fallbackMode: false,
  activeQuestion: null,
  activeGrade: null,
  replyText: '',
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lang } = useTranslation()
  const { plans, getPlanById, concepts } = usePlanStore()
  const { activeSession, pauseSession, resumeSession, endSession } = useSessionStore()

  // ─── Setup plan context ───
  const currentPlan = activeSession?.type === 'interview' && activeSession.planId
    ? getPlanById(activeSession.planId)
    : plans.find(p => p.id === id) || plans[0]

  const planConcepts = currentPlan ? (concepts[currentPlan.id] || []) : []

  // ─── Component states ───
  const [state, dispatch] = useReducer(interviewReducer, initialInterviewState)
  const [isRecording, setIsRecording] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize Q&A Queue based on selected concepts
  useEffect(() => {
    if (planConcepts.length > 0 && state.status === 'idle') {
      let startIndex = 0
      if (activeSession?.conceptId) {
        const foundIndex = planConcepts.findIndex(c => c.id === activeSession.conceptId)
        if (foundIndex !== -1) startIndex = foundIndex
      }

      const queue: ConceptProgress[] = planConcepts.map((c, i) => {
        let status: ConceptProgress['status'] = 'pending'
        if (i < startIndex) status = 'done'
        else if (i === startIndex) status = 'current'
        return {
          id: c.id,
          name: c.name,
          status,
          score: c.mastery,
        }
      })

      dispatch({ type: 'INITIALIZE_QUEUE', payload: { queue, startIndex } })
      dispatch({ type: 'START_SESSION' })
    }
  }, [planConcepts, activeSession, state.status])

  // Scroll to bottom on status changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.status, state.turns])

  // ─── Load Next Question ───
  const activeConcept = state.conceptQueue[state.currentConceptIndex]
  useEffect(() => {
    if (state.status === 'loading_question' && activeConcept) {
      const timer = setTimeout(async () => {
        try {
          const q = await mockApi.generateQuestion(activeConcept.id, state.currentTurn, activeConcept.name)
          dispatch({ type: 'QUESTION_LOADED', payload: q })
        } catch (e) {
          console.error(e)
          dispatch({ type: 'AI_FALLBACK' })
        }
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [state.status, activeConcept])

  // ─── Text-to-Speech Web Speech API ───
  useEffect(() => {
    if (state.status === 'awaiting_answer' && state.activeQuestion) {
      const speakText = state.activeQuestion.text
      const synth = window.speechSynthesis
      if (synth && speakText) {
        // Cancel active speaks
        synth.cancel()
        const utterance = new SpeechSynthesisUtterance(speakText)
        utterance.lang = lang === 'vi' ? 'vi-VN' : 'en-US'
        utterance.rate = 0.95
        synth.speak(utterance)
      }
    }
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [state.status, state.activeQuestion, lang])

  // ─── Submit & Grading ───
  const handleSubmitAnswer = () => {
    if (state.replyText.trim() === '' || !state.activeQuestion) return
    dispatch({ type: 'SUBMIT_ANSWER' })

    setTimeout(async () => {
      try {
        const grade = await mockApi.gradeAnswer(state.activeQuestion!.text, state.replyText)
        dispatch({ type: 'GRADE_RECEIVED', payload: grade })
      } catch (e) {
        dispatch({ type: 'AI_FALLBACK' })
      }
    }, 1200)
  }

  // ─── Next Action Q&A sequence ───
  const handleNextAction = () => {
    if (!state.activeGrade) return

    if (state.activeGrade.verdict === 'wrong') {
      dispatch({ type: 'TRACEBACK_TRIGGERED' })
    } else if (state.currentTurn >= state.maxTurns - 1) {
      dispatch({ type: 'NEXT_CONCEPT' })
    } else {
      dispatch({ type: 'NEXT_TURN' })
    }
  }

  // Mock speech recording
  const handleStartRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      dispatch({ type: 'SET_REPLY_TEXT', payload: state.replyText + (lang === 'vi' ? ' Câu trả lời được nhập tự động bằng giọng nói giả lập.' : ' Simulation input answer via voice recognition.') })
    } else {
      setIsRecording(true)
      setTimeout(() => {
        setIsRecording(false)
        dispatch({ type: 'SET_REPLY_TEXT', payload: state.replyText + (lang === 'vi' ? ' Câu trả lời được nhập tự động bằng giọng nói giả lập.' : ' Simulation input answer via voice recognition.') })
      }, 3000)
    }
  }

  if (!currentPlan || !activeConcept) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <div className="text-center space-y-4">
          <RotateCw className="animate-spin mx-auto text-indigo-500" size={32} />
          <p className="text-sm text-zinc-400">
            {lang === 'vi' ? 'Đang khởi động cuộc đối thoại phỏng vấn...' : 'Initializing Q&A session...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      
      {/* ─── HEADER BAR ─── */}
      <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-extrabold text-sm shrink-0">
            AI
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">{currentPlan.name}</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {lang === 'vi' ? 'Phiên phỏng vấn Recall AI' : 'Recall AI Interview Session'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-zinc-800 text-zinc-300 hover:bg-zinc-800 border-zinc-700 text-[10px] uppercase font-bold py-1 px-2.5">
            {lang === 'vi' ? `Lượt: ${state.currentTurn + 1}/${state.maxTurns}` : `Turn: ${state.currentTurn + 1}/${state.maxTurns}`}
          </Badge>
          <button
            onClick={() => {
              dispatch({ type: 'PAUSE' })
              pauseSession()
            }}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            aria-label="Tạm dừng"
          >
            <Pause size={18} />
          </button>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            aria-label="Thoát phiên"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* ─── LEFT INTERVIEW DIALOGUE WINDOW (65%) ─── */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-zinc-950 p-6">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 max-w-3xl mx-auto w-full pb-8">
            
            {/* Conversation turns history render */}
            {state.turns.map((turn, i) => (
              <div key={i} className="space-y-6">
                {/* AI Question */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-900/40 text-indigo-400 border border-indigo-800/30 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                    Q
                  </div>
                  <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex-1">
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-1">Recall AI</p>
                    <p className="text-sm text-zinc-200 leading-relaxed font-sans">{turn.question.text}</p>
                  </div>
                </div>

                {/* Student Answer */}
                <div className="flex items-start gap-4 justify-end">
                  <div className="bg-indigo-600/10 border border-indigo-500/25 rounded-2xl p-4 flex-1 max-w-xl text-right">
                    <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
                      {lang === 'vi' ? 'Bạn' : 'You'}
                    </p>
                    <p className="text-sm text-zinc-200 leading-relaxed font-sans">{turn.answerText}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                    A
                  </div>
                </div>

                {/* AI Grade Verdict Feedback */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800/30 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                    ✓
                  </div>
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 flex-1 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2 flex-wrap gap-2">
                      <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
                        {lang === 'vi' ? 'Đánh giá câu trả lời' : 'Verdict Assessment'}
                      </span>
                      <Badge className={turn.grade.verdict === 'deep' ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20' : turn.grade.verdict === 'shallow' ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/20' : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/20'}>
                        {turn.grade.verdict === 'deep' ? (lang === 'vi' ? 'Chính xác' : 'Correct') : turn.grade.verdict === 'shallow' ? (lang === 'vi' ? 'Chưa đủ' : 'Partial') : (lang === 'vi' ? 'Sai/Thiếu' : 'Incorrect')}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{turn.grade.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Step 1: Loading next question */}
            {state.status === 'loading_question' && (
              <div className="flex items-start gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-xs">💬</div>
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 flex-1">
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">
                    {lang === 'vi' ? 'Đang soạn câu hỏi...' : 'Preparing question...'}
                  </p>
                  <div className="h-4 bg-zinc-800 rounded w-3/4 mt-2"></div>
                </div>
              </div>
            )}

            {/* Step 2: Awaiting input / Active Question */}
            {state.status === 'awaiting_answer' && state.activeQuestion && (
              <div className="flex items-start gap-4 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 flex items-center justify-center shrink-0 text-xs font-bold font-mono">Q</div>
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 flex-1 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      {lang === 'vi' ? 'Câu hỏi phỏng vấn' : 'Interview Question'}
                    </span>
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-[9px] uppercase font-bold py-0.5 px-2">
                      {activeConcept.name}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-zinc-100 leading-relaxed font-sans">{state.activeQuestion.text}</p>
                </div>
              </div>
            )}

            {/* Step 3: Grading process */}
            {state.status === 'grading' && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-xs">🤖</div>
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex-1">
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1 animate-pulse">
                    {lang === 'vi' ? 'Recall AI đang chấm bài...' : 'Recall AI is grading...'}
                  </p>
                  <div className="h-4 bg-zinc-800 rounded w-1/2 mt-2 animate-pulse"></div>
                </div>
              </div>
            )}

            {/* Step 4: Show Feedback & Verdict */}
            {state.status === 'showing_feedback' && state.activeGrade && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg max-w-xl animate-in slide-in-from-bottom-3 duration-300">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">
                    {lang === 'vi' ? 'Nhận xét chi tiết từ AI' : 'AI Feedback & Assessment'}
                  </span>
                  <Badge className={state.activeGrade.verdict === 'deep' ? 'bg-emerald-500/15 text-emerald-400 border-0 hover:bg-emerald-500/20' : state.activeGrade.verdict === 'shallow' ? 'bg-amber-500/15 text-amber-400 border-0 hover:bg-amber-500/20' : 'bg-rose-500/15 text-rose-400 border-0 hover:bg-rose-500/20'}>
                    {state.activeGrade.verdict === 'deep' ? (lang === 'vi' ? 'Chính xác' : 'Correct') : state.activeGrade.verdict === 'shallow' ? (lang === 'vi' ? 'Chưa đủ' : 'Partial') : (lang === 'vi' ? 'Sai/Thiếu' : 'Incorrect')}
                  </Badge>
                </div>
                {state.activeGrade.text && (
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">{state.activeGrade.text}</p>
                )}
                <div className="flex justify-end pt-2">
                  <Button onClick={handleNextAction} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-sm">
                    {state.activeGrade.verdict === 'wrong' ? (lang === 'vi' ? 'Ôn lại gốc' : 'Start Traceback') : state.currentTurn >= state.maxTurns - 1 ? (lang === 'vi' ? 'Khái niệm tiếp theo' : 'Next Concept') : (lang === 'vi' ? 'Câu tiếp theo' : 'Next Question')}
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
                  <h3 className="text-lg font-bold text-foreground">
                    {lang === 'vi' ? 'Phát hiện hổng kiến thức nền tảng!' : 'Found Prerequisite Gap!'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    {lang === 'vi'
                      ? 'Có vẻ bạn chưa vững khái niệm nền tảng. Recall AI sẽ chuyển bạn sang chế độ Traceback để lấp lỗ hổng này trước khi tiếp tục.'
                      : 'It seems you have a gap in prerequisite concepts. Recall AI will redirect you to Traceback mode to study it before continuing.'}
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => dispatch({ type: 'NEXT_CONCEPT' })} className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl">
                    {lang === 'vi' ? 'Bỏ qua, học tiếp' : 'Skip, continue'}
                  </Button>
                  <Button onClick={() => {
                    endSession()
                    navigate(`/focus/${currentPlan.id}?concept=8`)
                  }} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl">
                    {lang === 'vi' ? 'Bắt đầu Traceback' : 'Start Traceback'}
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
                  <h3 className="text-lg font-bold text-foreground">
                    {lang === 'vi' ? 'Hoàn thành phiên kiểm tra!' : 'Interview Completed!'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                    {lang === 'vi' ? 'Chúc mừng! Bạn đã hoàn thành bài kiểm tra.' : 'Congratulations! You have successfully completed the mock interview.'}
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={() => navigate(`/interview/${currentPlan.id}/result`, { state: { turns: state.turns } })} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 px-6 rounded-xl"
                  >
                    {lang === 'vi' ? 'Xem báo cáo kết quả' : 'View Results Report'}
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ─── BOTTOM STUDENT INPUT ZONE ─── */}
          {state.status === 'awaiting_answer' && !state.fallbackMode && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 max-w-3xl mx-auto w-full shrink-0 space-y-4">
              <textarea
                rows={4}
                value={state.replyText}
                onChange={(e) => dispatch({ type: 'SET_REPLY_TEXT', payload: e.target.value })}
                placeholder={lang === 'vi' ? 'Nhập câu trả lời của bạn...' : 'Enter your answer here...'}
                className="w-full bg-transparent border-0 text-sm focus:outline-none focus:ring-0 text-zinc-100 placeholder:opacity-50 resize-none font-sans"
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
                  {lang === 'vi' ? 'Gửi câu trả lời →' : 'Submit Answer →'}
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* ─── SIDEBAR PROGRESS TRACKER (Right) ─── */}
        <div className={`interview-sidebar border-l border-zinc-800 bg-zinc-900/40 relative shrink-0 flex flex-col ${sidebarOpen ? 'w-70' : 'w-0'}`}>
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-12 bg-zinc-800 border border-zinc-700 rounded-l-md flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {sidebarOpen && (
            <div className="p-5 flex flex-col h-full overflow-y-auto">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                {lang === 'vi' ? 'Tiến độ phiên' : 'Session Progress'}
              </h3>
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
                            {c.status === 'done' ? (lang === 'vi' ? 'Hoàn thành' : 'Completed') 
                              : c.status === 'current' ? (lang === 'vi' ? 'Đang học' : 'Reviewing') 
                              : c.status === 'traceback' ? 'Traceback' 
                              : (lang === 'vi' ? 'Chưa học' : 'Pending')}
                          </span>
                          {c.score !== null && (
                            <span className="text-[9px] font-extrabold text-emerald-400">• {(c.score * 10).toFixed(1)}/10</span>
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
              <h2 className="text-lg font-bold text-zinc-100">
                {lang === 'vi' ? 'Đã tạm dừng Interview' : 'Interview Paused'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'vi' ? 'Tạm thời đóng băng tiến độ trao đổi phỏng vấn.' : 'Temporarily freezing interview exchange progress.'}
              </p>
            </div>
            <Button onClick={() => {
              dispatch({ type: 'RESUME' })
              resumeSession()
            }} className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs py-2">
              {lang === 'vi' ? 'Tiếp tục' : 'Resume'}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="max-w-sm bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {lang === 'vi' ? 'Xác nhận thoát?' : 'Confirm Exit?'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs leading-relaxed">
              {lang === 'vi'
                ? 'Mọi kết quả tự học trong phiên này sẽ được lưu lại. Bạn có chắc chắn muốn dừng phiên phỏng vấn?'
                : 'All self-study results in this session will be saved. Are you sure you want to stop the interview session?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white" onClick={() => setShowExitConfirm(false)}>
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button className="bg-rose-600 text-white" onClick={() => {
              setShowExitConfirm(false)
              endSession()
              navigate(`/plans/${currentPlan.id}`)
            }}>
              {lang === 'vi' ? 'Thoát Interview' : 'Exit Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
