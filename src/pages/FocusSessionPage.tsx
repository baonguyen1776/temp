import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Pause,
  Play,
  X,
  Settings,
  BookOpen,
  FileText,
  MessageSquare,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileIcon,
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
import '@/styles/focus-session.css'
import { useSessionStore } from '@/stores/sessionStore'
import { usePlanStore } from '@/stores/planStore'
import { useTranslation } from '@/stores/languageStore'

// ─── Data Definitions ──────────────────────────────────────────
interface Concept {
  id: string
  name: string
  mastery: number | null
  isRemediating?: boolean
}

interface SuggestionConcept extends Concept {
  reason: string
}

interface Note {
  id: string
  conceptId: string
  conceptName: string
  timestamp: string
  text: string
}

const defaultNotes: Note[] = [
  {
    id: 'n1',
    conceptId: '1',
    conceptName: 'Async/Await',
    timestamp: '10:15 - 18/07',
    text: 'Async function luôn trả về một Promise. Từ khóa await chỉ dùng được bên trong async function.',
  },
  {
    id: 'n2',
    conceptId: '2',
    conceptName: 'Promises',
    timestamp: '09:40 - 18/07',
    text: 'Có 3 trạng thái: pending, fulfilled, rejected. Cú pháp .then() và .catch() dùng để xử lý kết quả.',
  },
]

// ─── Sound Generator ────────────────────────────────────────────
const playNotificationSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    
    // Play a dual note chime
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(523.25, now) // C5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15) // A5

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(659.25, now) // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15) // C6

    gainNode.gain.setValueAtTime(0.15, now)
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.8)
    osc2.stop(now + 0.8)
  } catch (e) {
    console.error('Không thể phát âm thanh thông báo:', e)
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function FocusSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lang } = useTranslation()
  const { plans, getPlanById, concepts } = usePlanStore()
  const { startSession, endSession, activeSession } = useSessionStore()

  // Find current plan
  const currentPlan = activeSession?.type === 'focus' && activeSession.planId
    ? getPlanById(activeSession.planId)
    : plans.find(p => p.id === 'plan-1') || plans[0]

  const planConcepts = currentPlan ? (concepts[currentPlan.id] || []) : []

  // Find initial concept
  const initialConcept = planConcepts.find(c => c.id === id) || planConcepts[0] || { id: '1', name: 'Concept', mastery: null }

  // ─── States ──────────────────────────────────────────────────
  const [selectedConcept, setSelectedConcept] = useState<Concept>(initialConcept)
  
  // Sync selectedConcept when planConcepts loaded or change
  useEffect(() => {
    if (planConcepts.length > 0 && !planConcepts.some(c => c.id === selectedConcept.id)) {
      const match = planConcepts.find(c => c.id === id) || planConcepts[0]
      if (match) setSelectedConcept(match)
    }
  }, [planConcepts, id, selectedConcept.id])

  // Pomodoro Configuration
  const [config, setConfig] = useState({
    workDuration: 25, // minutes
    shortBreakDuration: 5, // minutes
    longBreakDuration: 15, // minutes
    totalCycles: 4,
    soundEnabled: true,
  })
  
  // Timer States
  const [sessionType, setSessionType] = useState<'work' | 'short_break' | 'long_break'>('work')
  const [timerState, setTimerState] = useState<'running' | 'paused' | 'break' | 'complete'>('running')
  const [timeLeft, setTimeLeft] = useState(config.workDuration * 60)
  const [currentCycle, setCurrentCycle] = useState(1)
  
  // UI States
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [suggestionsExpanded, setSuggestionsExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<'doc' | 'notes'>('doc')
  
  // Notes State
  const [notes, setNotes] = useState<Note[]>(defaultNotes)
  const [noteText, setNoteText] = useState('')
  const [noteConceptId, setNoteConceptId] = useState(initialConcept.id)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Temp form states for configuration
  const [tempConfig, setTempConfig] = useState({ ...config })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ─── Sync Session with Store ───
  useEffect(() => {
    if (selectedConcept && currentPlan) {
      if (!activeSession || activeSession.type !== 'focus' || activeSession.conceptId !== selectedConcept.id) {
        startSession({
          id: `focus-${currentPlan.id}-${Date.now()}`,
          type: 'focus',
          planId: currentPlan.id,
          planName: currentPlan.name,
          conceptId: selectedConcept.id,
          conceptName: selectedConcept.name,
          startedAt: new Date().toISOString(),
        })
      }
    }
  }, [selectedConcept, currentPlan, activeSession, startSession])

  // ─── Timer Core Logic ─────────────────────────────────────────
  useEffect(() => {
    let duration = config.workDuration * 60
    if (sessionType === 'short_break') duration = config.shortBreakDuration * 60
    if (sessionType === 'long_break') duration = config.longBreakDuration * 60
    
    setTimeLeft(duration)
    
    if (sessionType === 'work') {
      setTimerState('paused')
    } else {
      setTimerState('running')
    }
  }, [sessionType, config])

  // Timer Tick implementation
  useEffect(() => {
    if (timerState === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [timerState, sessionType])

  // ─── Timer Completion Logic ───────────────────────────────────
  const handleTimerComplete = () => {
    if (config.soundEnabled) playNotificationSound()

    if (sessionType === 'work') {
      if (currentCycle < config.totalCycles) {
        setSessionType('short_break')
        setTimerState('break')
      } else {
        setSessionType('long_break')
        setTimerState('break')
      }
    } else {
      if (sessionType === 'long_break') {
        setTimerState('complete')
        setShowCompleteModal(true)
      } else {
        setSessionType('work')
        setCurrentCycle((prev) => prev + 1)
      }
    }
  }

  // ─── Calculations ─────────────────────────────────────────────
  const getActiveDurationSeconds = () => {
    if (sessionType === 'short_break') return config.shortBreakDuration * 60
    if (sessionType === 'long_break') return config.longBreakDuration * 60
    return config.workDuration * 60
  }

  const activeDuration = getActiveDurationSeconds()
  const progressPercent = activeDuration > 0 ? (timeLeft / activeDuration) * 100 : 0
  const circumference = 2 * Math.PI * 95

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // ─── SRE Suggestion Handler ──────────────────────────────────
  const handleSelectSuggestion = (conceptId: string) => {
    const target = planConcepts.find(c => c.id === conceptId)
    if (target) {
      setSelectedConcept(target)
      setNoteConceptId(target.id)
    }
  }

  // ─── Debounced Notes Auto-save ─────────────────────────────────
  const handleNoteTextChange = (text: string) => {
    setNoteText(text)
    setSaveStatus('saving')

    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)

    autoSaveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 1500)
    }, 1200)
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    }
  }, [])

  const handleManualSaveNote = () => {
    const textToSave = noteText.trim()
    if (textToSave === '') return

    const selectedConceptInfo = planConcepts.find(c => c.id === noteConceptId) || selectedConcept

    const newNote: Note = {
      id: 'n-' + Date.now(),
      conceptId: noteConceptId,
      conceptName: selectedConceptInfo.name,
      timestamp: new Date().toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' }),
      text: textToSave,
    }

    setNotes(prev => [newNote, ...prev])
    setNoteText('')
    setSaveStatus('saved')
    
    setTimeout(() => {
      setSaveStatus('idle')
    }, 2000)
  }

  // ─── Configuration Modal Save ─────────────────────────────────
  const handleSaveConfig = () => {
    setConfig({ ...tempConfig })
    setShowConfigModal(false)
  }

  // ─── Mastery Display Helpers ─────────────────────────────────
  const getMasteryColor = (mastery: number | null): string => {
    if (mastery === null) return '#9CA3AF'
    if (mastery < 0.4) return '#EF4444'
    if (mastery < 0.7) return '#F59E0B'
    return '#10B981'
  }

  const getMasteryLabel = (mastery: number | null): string => {
    if (mastery === null) return lang === 'vi' ? 'Chưa ôn' : 'Not Reviewed'
    if (mastery < 0.4) return lang === 'vi' ? 'Yếu' : 'Weak'
    if (mastery < 0.7) return lang === 'vi' ? 'Đang học' : 'Learning'
    return lang === 'vi' ? 'Vững' : 'Mastered'
  }

  const isBreakActive = timerState === 'break'

  // Build dynamic suggestions based on plan concepts
  const suggestions: SuggestionConcept[] = planConcepts
    .filter(c => c.mastery === null || c.mastery < 0.6 || c.isRemediating)
    .slice(0, 3)
    .map(c => ({
      ...c,
      reason: c.mastery === null 
        ? (lang === 'vi' ? 'Chưa ôn tập lần nào - hãy bắt đầu ngay' : 'Never reviewed - start now')
        : (lang === 'vi' ? `Độ vững thấp (${Math.round(c.mastery * 100)}%) - ưu tiên củng cố` : `Low mastery (${Math.round(c.mastery * 100)}%) - high priority`)
    }))

  return (
    <div className={`flex flex-col h-screen overflow-hidden session-type-transition ${isBreakActive ? 'focus-container-break' : 'focus-container-work'}`}>
      
      {/* ─── TOPBAR ─── */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card z-20 shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="text-focus-session" size={20} />
          <div>
            <h1 className="text-sm font-semibold text-foreground">{currentPlan?.name || 'JavaScript Advanced'}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {lang === 'vi' ? 'Phiên học tập Recall AI' : 'Recall AI Study Session'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
            {lang === 'vi' ? `Chu kỳ ${currentCycle}/${config.totalCycles}` : `Cycle ${currentCycle}/${config.totalCycles}`}
          </span>
          <button
            onClick={() => {
              endSession()
              navigate('/focus')
            }}
            className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-all"
            aria-label="Thoát phiên học"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* ─── LEFT TIMER PANEL (40%) ─── */}
        <div className="w-2/5 border-r border-border flex flex-col justify-between p-6 bg-card overflow-y-auto">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {lang === 'vi' ? 'Khái niệm đang học' : 'Active Concept'}
              </span>
              <Badge
                className="text-[9px] font-bold border-0 text-white"
                style={{ background: getMasteryColor(selectedConcept.mastery) }}
              >
                {selectedConcept.mastery !== null
                  ? `${Math.round(selectedConcept.mastery * 100)}% — ${getMasteryLabel(selectedConcept.mastery)}`
                  : getMasteryLabel(selectedConcept.mastery)
                }
              </Badge>
            </div>

            {/* Pomodoro Timer Unit */}
            <div className="flex-1 flex flex-col items-center justify-center min-h-75 mb-6">
              <div className="relative w-64 h-64 mb-5">
                <svg className="w-full h-full focus-timer-ring" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="95" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                  <circle
                    cx="100"
                    cy="100"
                    r="95"
                    fill="none"
                    stroke="var(--color-focus-session)"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                    {sessionType === 'work' ? (lang === 'vi' ? 'Học sâu' : 'Deep Work') : sessionType === 'short_break' ? (lang === 'vi' ? 'Nghỉ ngắn' : 'Short Break') : (lang === 'vi' ? 'Nghỉ dài' : 'Long Break')}
                  </span>
                  <span className="text-4xl font-extrabold text-foreground font-mono leading-none tracking-tight">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3">
                {timerState === 'running' ? (
                  <Button
                    onClick={() => setTimerState('paused')}
                    size="sm"
                    className="shadow-sm gap-1.5 focus-timer-button"
                  >
                    <Pause size={14} fill="currentColor" />
                    {lang === 'vi' ? 'Tạm dừng' : 'Pause'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setTimerState('running')}
                    size="sm"
                    className="shadow-sm gap-1.5 focus-timer-button"
                  >
                    <Play size={14} fill="currentColor" />
                    {lang === 'vi' ? 'Tiếp tục' : 'Resume'}
                  </Button>
                )}

                <Button
                  onClick={() => {
                    setTimeLeft(config.workDuration * 60)
                    setTimerState('paused')
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  {lang === 'vi' ? 'Đặt lại' : 'Reset'}
                </Button>
              </div>

              <button
                onClick={() => {
                  setTempConfig({ ...config })
                  setShowConfigModal(true)
                }}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-focus-session mt-4 transition-colors font-medium"
              >
                <Settings size={13} />
                {lang === 'vi' ? 'Cấu hình Pomodoro' : 'Configure Pomodoro'}
              </button>
            </div>

            {/* Collapsible SRE Suggestions Panel */}
            <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm shrink-0">
              <button
                onClick={() => setSuggestionsExpanded(prev => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between bg-muted/30 border-b border-border hover:bg-muted transition-colors"
              >
                <span className="text-xs font-bold text-foreground flex items-center gap-2">
                  💡 {lang === 'vi' ? 'Gợi ý học tập từ Recall AI' : 'Study Suggestions from Recall AI'}
                </span>
                {suggestionsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {suggestionsExpanded && (
                <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                  {suggestions.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      {lang === 'vi' ? 'Chúc mừng! Bạn đã nắm vững tất cả các khái niệm.' : 'Congratulations! You have mastered all concepts.'}
                    </p>
                  ) : (
                    suggestions.map((item) => {
                      const isCurrent = selectedConcept.id === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectSuggestion(item.id)}
                          className={`w-full p-2.5 rounded-lg text-left transition-all border ${isCurrent ? 'suggestion-card-active border-focus-session' : 'bg-card border-border hover:bg-muted'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-foreground">{item.name}</span>
                            <Badge
                              className="text-[9px] border-0 text-white font-semibold py-0 px-1.5"
                              style={{ background: getMasteryColor(item.mastery) }}
                            >
                              {item.mastery !== null ? `${Math.round(item.mastery * 100)}%` : '—'}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">
                            {item.reason}
                          </p>
                        </button>
                      )
                    })
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ─── RIGHT PANEL (60%) ─── */}
        <div className="w-3/5 flex flex-col bg-background">
          
          {/* Tab Selector bar */}
          <div className="flex border-b border-border px-6 bg-card shrink-0">
            <button
              onClick={() => setActiveTab('doc')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'doc' ? 'border-focus-session text-focus-session' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <FileText size={14} />
              {lang === 'vi' ? 'Tài liệu tóm tắt' : 'Summary Document'}
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'notes' ? 'border-focus-session text-focus-session' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <MessageSquare size={14} />
              {lang === 'vi' ? 'Ghi chú của tôi' : 'My Notes'}
            </button>
          </div>

          {/* Tab content area */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {activeTab === 'doc' ? (
              <div className="prose max-w-none text-foreground space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-border">
                  <h2 className="text-xl font-bold m-0 text-foreground">{selectedConcept.name}</h2>
                  <Badge variant="outline" className="text-xs">
                    {lang === 'vi' ? 'Độ khó: 3/5' : 'Difficulty: 3/5'}
                  </Badge>
                </div>
                
                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {lang === 'vi' ? '1. Định nghĩa & Khái niệm' : '1. Definition & Concept'}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang === 'vi'
                      ? `Đây là nội dung hướng dẫn chi tiết về ${selectedConcept.name} phục vụ cho quá trình ôn tập và ghi nhớ ngắn hạn. Bạn nên tập trung đọc hiểu các ví dụ cốt lõi để chuẩn bị cho bài phỏng vấn thử tiếp theo.`
                      : `This is a detailed summary guide for ${selectedConcept.name} to support quick revision and memory consolidation. You should focus on understanding key examples to prepare for your next mock interview.`}
                  </p>
                </section>

                <section className="space-y-2.5">
                  <h3 className="text-sm font-bold text-foreground">
                    {lang === 'vi' ? '2. Ví dụ thực tiễn' : '2. Practical Example'}
                  </h3>
                  <div className="bg-muted p-4 rounded-xl border border-border font-mono text-xs text-foreground overflow-x-auto whitespace-pre-wrap">
{lang === 'vi' ? `// Mã nguồn thực nghiệm ví dụ cho ${selectedConcept.name}
function testDemo() {
  console.log("Đang ôn tập khái niệm: ${selectedConcept.name}");
}` : `// Code example demonstrating ${selectedConcept.name}
function testDemo() {
  console.log("Currently reviewing: ${selectedConcept.name}");
}`}
                  </div>
                </section>
              </div>
            ) : (
              <div className="flex flex-col h-full overflow-hidden">
                
                {/* Creator Form */}
                <div className="p-5 border-b border-border bg-card space-y-4 shrink-0">
                  <div className="flex gap-4 items-center flex-wrap">
                    {/* Concept Selector Dropdown */}
                    <div className="flex-1 min-w-50">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">
                        {lang === 'vi' ? 'Liên kết khái niệm' : 'Link Concept'}
                      </label>
                      <select
                        value={noteConceptId}
                        onChange={(e) => setNoteConceptId(e.target.value)}
                        className="w-full text-xs border border-border rounded-lg p-2 bg-background focus:outline-none focus:ring-1 focus:ring-focus-session/40"
                      >
                        {planConcepts.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ml-auto text-[10px] font-semibold flex items-center gap-1.5">
                      {saveStatus === 'saving' && <span className="text-amber-500 animate-pulse">{lang === 'vi' ? 'Đang tự động lưu...' : 'Auto-saving...'}</span>}
                      {saveStatus === 'saved' && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={10} /> {lang === 'vi' ? 'Đã lưu' : 'Saved'}</span>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={noteText}
                      onChange={(e) => handleNoteTextChange(e.target.value)}
                      placeholder={lang === 'vi' ? 'Ghi chú nhanh thông tin học tập quan trọng...' : 'Quickly jot down key concepts and learning details...'}
                      className="w-full h-24 text-sm border border-border rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-focus-session/20 resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      onClick={handleManualSaveNote}
                      disabled={noteText.trim() === ''}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Save size={13} />
                      {lang === 'vi' ? 'Lưu ghi chú' : 'Save Note'}
                    </Button>
                  </div>
                </div>

                {/* Notes History list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-muted/20">
                  {notes.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <FileIcon size={24} className="mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-xs">
                        {lang === 'vi' ? 'Chưa có ghi chú nào trong phiên này.' : 'No notes written in this session yet.'}
                      </p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                          <span className="text-[10px] font-bold text-focus-session uppercase bg-focus-session/10 px-2 py-0.5 rounded">
                            {note.conceptName}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{note.timestamp}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                          {note.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ─── CONFIGURATION MODAL ─── */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="sm:max-w-md bg-card text-foreground border-border">
          <DialogHeader>
            <DialogTitle>
              {lang === 'vi' ? 'Cấu hình phiên Pomodoro' : 'Configure Pomodoro Session'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'vi' ? 'Tùy chỉnh khoảng thời gian làm việc sâu và nghỉ giải lao để phù hợp nhất với nhịp sinh học của bạn.' : 'Customize deep work and break durations to fit your biological rhythm.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  {lang === 'vi' ? 'Thời gian học (phút)' : 'Study Duration (mins)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={tempConfig.workDuration}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, workDuration: Math.max(1, Number(e.target.value)) }))}
                  className="w-full border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-focus-session/40"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  {lang === 'vi' ? 'Nghỉ ngắn (phút)' : 'Short Break (mins)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempConfig.shortBreakDuration}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, shortBreakDuration: Math.max(1, Number(e.target.value)) }))}
                  className="w-full border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-focus-session/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  {lang === 'vi' ? 'Nghỉ dài (phút)' : 'Long Break (mins)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={tempConfig.longBreakDuration}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, longBreakDuration: Math.max(1, Number(e.target.value)) }))}
                  className="w-full border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-focus-session/40"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  {lang === 'vi' ? 'Số chu kỳ (cycles)' : 'Cycles Count'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={tempConfig.totalCycles}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, totalCycles: Math.max(1, Number(e.target.value)) }))}
                  className="w-full border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-focus-session/40"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs font-semibold text-foreground">
                {lang === 'vi' ? 'Bật âm thanh báo' : 'Enable Chime Sound'}
              </span>
              <button
                className={`toggle-switch ${tempConfig.soundEnabled ? 'toggle-switch--active' : ''}`}
                onClick={() => setTempConfig(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              >
                <div className="toggle-switch__thumb" />
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowConfigModal(false)}>
              {lang === 'vi' ? 'Hủy' : 'Cancel'}
            </Button>
            <Button size="sm" onClick={handleSaveConfig}>
              {lang === 'vi' ? 'Áp dụng' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── TIMER COMPLETE MODAL ─── */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="sm:max-w-sm bg-card text-foreground border-border text-center">
          <div className="py-6 space-y-4">
            <span className="text-5xl block">🎉</span>
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">
                {lang === 'vi' ? 'Hoàn thành phiên học tập!' : 'Study Session Completed!'}
              </DialogTitle>
              <DialogDescription className="text-center">
                {lang === 'vi'
                  ? `Bạn đã hoàn thành xuất sắc chuỗi Pomodoro (${config.totalCycles} chu kỳ học sâu).`
                  : `You have successfully completed your Pomodoro sequence (${config.totalCycles} deep study cycles).`}
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-muted/40 rounded-2xl border border-border text-left">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                {lang === 'vi' ? 'Thống kê phiên:' : 'Session Statistics:'}
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                <li>{lang === 'vi' ? `Tổng thời gian: ${config.workDuration * config.totalCycles} phút học tập` : `Total Duration: ${config.workDuration * config.totalCycles} minutes of study`}</li>
                <li>{lang === 'vi' ? `Số chu kỳ: ${config.totalCycles} vòng hoàn thành` : `Cycles Completed: ${config.totalCycles}`}</li>
                <li>{lang === 'vi' ? `Khái niệm đã luyện tập: ${selectedConcept.name}` : `Concept Practiced: ${selectedConcept.name}`}</li>
              </ul>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                onClick={() => {
                  setShowCompleteModal(false)
                  endSession()
                  navigate('/focus')
                }}
                className="w-full sm:w-auto"
              >
                {lang === 'vi' ? 'Hoàn tất & Quay về' : 'Finish & Return'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
