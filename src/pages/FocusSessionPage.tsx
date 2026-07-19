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
  Volume2,
  VolumeX,
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

// ─── Data Definitions ──────────────────────────────────────────
interface Concept {
  id: string
  name: string
  mastery: number | null
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

const mockConcepts: Concept[] = [
  { id: '1', name: 'Async/Await', mastery: 0.35 },
  { id: '2', name: 'Promises', mastery: 0.70 },
  { id: '3', name: 'Callbacks', mastery: 0.45 },
  { id: '4', name: 'Event Loop', mastery: null },
  { id: '5', name: 'Scope', mastery: 0.90 },
  { id: '6', name: 'Closures', mastery: 0.60 },
  { id: '7', name: 'Functions', mastery: 0.95 },
  { id: '8', name: 'Destructuring', mastery: 0.30 },
]

const mockSuggestions: SuggestionConcept[] = [
  { id: '8', name: 'Destructuring', mastery: 0.30, reason: 'Điểm vững thấp (30%) - ưu tiên ôn tập' },
  { id: '1', name: 'Async/Await', mastery: 0.35, reason: 'Hạn chót gần nhất - cần ghi nhớ kỹ' },
  { id: '3', name: 'Callbacks', mastery: 0.45, reason: 'Chưa đạt mức an toàn - ôn luyện thêm' },
]

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
// Use Web Audio API to play a soft, pleasant chime when timer expires
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
  const { plans, getPlanById } = usePlanStore()
  const { startSession, pauseSession, resumeSession, endSession, activeSession } = useSessionStore()

  // Find initial concept
  const initialConcept = mockConcepts.find(c => c.id === id) || mockConcepts[0]

  // Find current plan
  const currentPlan = activeSession?.type === 'focus' && activeSession.planId
    ? getPlanById(activeSession.planId)
    : plans.find(p => p.id === 'plan-1') || plans[0]

  // ─── States ──────────────────────────────────────────────────
  const [selectedConcept, setSelectedConcept] = useState<Concept>(initialConcept)
  
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
    if (!activeSession || activeSession.type !== 'focus' || activeSession.conceptId !== selectedConcept.id) {
      startSession({
        id: `focus-${currentPlan?.id || 'plan-1'}-${Date.now()}`,
        type: 'focus',
        planId: currentPlan?.id || 'plan-1',
        planName: currentPlan?.name || 'JavaScript Advanced',
        conceptId: selectedConcept.id,
        conceptName: selectedConcept.name,
        startedAt: new Date().toISOString(),
      })
    }
  }, [selectedConcept, currentPlan, activeSession, startSession])

  // ─── Timer Core Logic ─────────────────────────────────────────
  useEffect(() => {
    // Determine target duration when sessionType or config changes
    let duration = config.workDuration * 60
    if (sessionType === 'short_break') duration = config.shortBreakDuration * 60
    if (sessionType === 'long_break') duration = config.longBreakDuration * 60
    
    setTimeLeft(duration)
    
    if (sessionType === 'work') {
      setTimerState('running')
    } else {
      setTimerState('break')
    }
  }, [sessionType, config])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)

    if (timerState === 'running' || timerState === 'break') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            handleTimerExpiry()
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

  const handleTimerExpiry = () => {
    if (config.soundEnabled) {
      playNotificationSound()
    }

    if (sessionType === 'work') {
      // Finished a work cycle
      if (currentCycle >= config.totalCycles) {
        // Time for a long break
        setSessionType('long_break')
        setTimerState('break')
        setCurrentCycle(1)
      } else {
        // Complete state triggers the options dialog
        setTimerState('complete')
        setShowCompleteModal(true)
      }
    } else {
      // Break is complete, go back to study
      setSessionType('work')
      setTimerState('running')
    }
  }

  // Calculate percentages for the circular progress
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
    const target = mockConcepts.find(c => c.id === conceptId)
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

    // Debounce save action by 1.5 seconds
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (text.trim() === '') {
        setSaveStatus('idle')
        return
      }
      saveCurrentNote(text)
    }, 1500)
  }

  const saveCurrentNote = (textToSave = noteText) => {
    if (textToSave.trim() === '') return

    const selectedConceptInfo = mockConcepts.find(c => c.id === noteConceptId) || selectedConcept
    const newNote: Note = {
      id: 'n-' + Date.now(),
      conceptId: noteConceptId,
      conceptName: selectedConceptInfo.name,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
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
    if (mastery === null) return 'Chưa ôn'
    if (mastery < 0.4) return 'Yếu'
    if (mastery < 0.7) return 'Đang học'
    return 'Vững'
  }

  const isBreakActive = timerState === 'break'

  return (
    <div className={`flex flex-col h-screen overflow-hidden session-type-transition ${isBreakActive ? 'focus-container-break' : 'focus-container-work'}`}>
      
      {/* ─── TOPBAR ─── */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-white z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <BookOpen className="text-focus-session" size={20} />
          <div>
            <h1 className="text-sm font-semibold text-foreground">{currentPlan?.name || 'JavaScript Advanced'}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phiên học tập Recall AI</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setConfig(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            className="p-2 hover:bg-surface rounded-lg transition-colors text-muted-foreground"
            title={config.soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {config.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              endSession()
              navigate(`/plans/${currentPlan?.id || 'plan-1'}`)
            }}
            className="gap-1.5 border-border hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <X size={14} />
            Thoát
          </Button>
        </div>
      </div>

      {/* ─── SPLIT VIEW PANELS ─── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ─── LEFT PANEL (40%) ─── */}
        <div className={`w-2/5 flex flex-col p-6 border-r border-border overflow-y-auto session-type-transition ${isBreakActive ? 'focus-panel-break' : 'focus-panel-work'}`}>
          
          {/* Active Concept Info */}
          <div className="mb-6 bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                {isBreakActive ? 'Tạm dừng học' : 'Khái niệm đang học'}
              </span>
              <h2 className="text-xl font-bold text-foreground">{selectedConcept.name}</h2>
            </div>
            
            <Badge
              className="text-white border-0 text-[11px]"
              style={{ background: getMasteryColor(selectedConcept.mastery) }}
            >
              {selectedConcept.mastery !== null
                ? `${Math.round(selectedConcept.mastery * 100)}% — ${getMasteryLabel(selectedConcept.mastery)}`
                : getMasteryLabel(selectedConcept.mastery)
              }
            </Badge>
          </div>

          {/* Pomodoro Timer Unit */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] mb-6">
            <div className="relative w-64 h-64 mb-5">
              <svg className="w-full h-full focus-timer-ring" style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 200 200">
                {/* Background Ring */}
                <circle cx="100" cy="100" r="95" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                {/* Progress Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  fill="none"
                  stroke={timerState === 'paused' ? 'var(--color-border)' : 'var(--color-focus-session)'}
                  strokeWidth="6"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${circumference * (1 - progressPercent / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-mono font-bold text-focus-session tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                
                {/* Cycle indicator */}
                <div className="text-[10px] text-muted-foreground mt-1">
                  Chu kỳ {currentCycle}/{config.totalCycles}
                </div>
              </div>
            </div>

            {/* Session Type Badge */}
            <div className="mb-6">
              <span className="bg-focus-session-20 text-focus-session font-semibold text-xs rounded-full px-3 py-1 uppercase tracking-wider">
                {sessionType === 'work' ? '📚 Học tập' : sessionType === 'short_break' ? '☕ Nghỉ ngắn' : '🌴 Nghỉ dài'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-3 w-full max-w-xs justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  if (timerState === 'paused') {
                    setTimerState(sessionType === 'work' ? 'running' : 'break')
                    resumeSession()
                  } else {
                    setTimerState('paused')
                    pauseSession()
                  }
                }}
                className="flex-1 border-border font-medium hover:bg-surface transition-colors"
              >
                {timerState === 'paused' ? (
                  <>
                    <Play size={15} className="mr-1.5" />
                    Tiếp tục
                  </>
                ) : (
                  <>
                    <Pause size={15} className="mr-1.5" />
                    Tạm dừng
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => {
                  setTimerState('paused')
                  pauseSession()
                  setShowCompleteModal(true)
                }}
                className="flex-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={15} className="mr-1.5" />
                Kết thúc
              </Button>
            </div>

            {/* Pomodoro Settings trigger */}
            <button
              onClick={() => {
                setTempConfig({ ...config })
                setShowConfigModal(true)
              }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-focus-session mt-4 transition-colors font-medium"
            >
              <Settings size={13} />
              Cấu hình Pomodoro
            </button>
          </div>

          {/* Collapsible SRE Suggestions Panel */}
          <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm flex-shrink-0">
            <button
              onClick={() => setSuggestionsExpanded(prev => !prev)}
              className="w-full px-4 py-3 flex items-center justify-between bg-[rgb(249_250_251)] border-b border-border hover:bg-surface transition-colors"
            >
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                💡 Gợi ý học tập từ Recall AI
              </span>
              {suggestionsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {suggestionsExpanded && (
              <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                {mockSuggestions.map((item) => {
                  const isCurrent = selectedConcept.id === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item.id)}
                      className={`w-full p-2.5 rounded-lg text-left transition-all border ${isCurrent ? 'suggestion-card-active border-focus-session' : 'bg-white border-border hover:bg-surface'}`}
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
                })}
              </div>
            )}
          </div>

        </div>

        {/* ─── RIGHT PANEL (60%) ─── */}
        <div className="w-3/5 flex flex-col bg-background">
          
          {/* Tab Selector bar */}
          <div className="flex border-b border-border px-6 bg-white flex-shrink-0">
            <button
              onClick={() => setActiveTab('doc')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'doc' ? 'border-focus-session text-focus-session' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <FileText size={14} />
              📄 Tài liệu
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'notes' ? 'border-focus-session text-focus-session' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <MessageSquare size={14} />
              📝 Ghi chú
            </button>
          </div>

          {/* ─── TAB 1: Documents ─── */}
          {activeTab === 'doc' && (
            <div className="flex-1 p-6 bg-[rgb(249_250_251)] flex items-center justify-center overflow-y-auto">
              <div className="pdf-placeholder p-12 max-w-sm text-center">
                <FileIcon className="text-muted-foreground mb-3" size={36} />
                <h4 className="font-bold text-sm text-foreground mb-1">Tài liệu học tập</h4>
                <p className="text-xs text-muted-foreground">
                  PDF sẽ hiển thị ở đây để bạn có thể vừa đọc tài liệu vừa thực hiện phiên tập trung.
                </p>
              </div>
            </div>
          )}

          {/* ─── TAB 2: Notes ─── */}
          {activeTab === 'notes' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Creator Form */}
              <div className="p-5 border-b border-border bg-white space-y-4 flex-shrink-0">
                <div className="flex gap-4 items-center flex-wrap">
                  {/* Concept Selector Dropdown */}
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">
                      Liên kết khái niệm
                    </label>
                    <select
                      value={noteConceptId}
                      onChange={(e) => setNoteConceptId(e.target.value)}
                      className="w-full text-xs border border-border rounded-lg p-2 bg-white focus:outline-none focus:border-focus-session"
                    >
                      {mockConcepts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Debounce save status indicators */}
                  <div className="pt-5 flex items-center gap-1.5 text-xs">
                    {saveStatus === 'saving' && (
                      <span className="autosave-indicator text-muted-foreground animate-pulse">
                        ⏳ Đang lưu ghi chú...
                      </span>
                    )}
                    {saveStatus === 'saved' && (
                      <span className="autosave-indicator text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Đã tự động lưu!
                      </span>
                    )}
                  </div>
                </div>

                {/* Textarea note box */}
                <div>
                  <textarea
                    value={noteText}
                    onChange={(e) => handleNoteTextChange(e.target.value)}
                    placeholder="Ghi chú nhanh thông tin học tập quan trọng..."
                    className="w-full h-24 text-sm border border-border rounded-xl p-3 focus:outline-none focus:border-focus-session focus:ring-1 focus:ring-focus-session/20 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => saveCurrentNote()}
                    className="gap-1.5 text-xs border-border hover:bg-surface font-semibold"
                  >
                    <Save size={13} />
                    Lưu thủ công
                  </Button>
                </div>
              </div>

              {/* Feed List of Notes */}
              <div className="flex-1 p-5 overflow-y-auto bg-[rgb(249_250_251)] space-y-3">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Đã lưu gần đây ({notes.length})
                </span>

                {notes.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Chưa có ghi chú nào được lưu.
                  </div>
                ) : (
                  notes.map((item) => (
                    <div key={item.id} className="p-3 bg-white border border-border rounded-xl shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-focus-session-20 text-focus-session px-2 py-0.5 rounded-full text-[9px] font-bold">
                          {item.conceptName}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                        {item.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ─── OVERLAY: Paused Screen ─── */}
      {timerState === 'paused' && (
        <div className="fixed inset-0 focus-pause-overlay bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center focus-modal-content mx-4 border border-border shadow-2xl space-y-5">
            <div className="w-16 h-16 bg-pink-50 text-focus-session rounded-full flex items-center justify-center mx-auto text-3xl">
              ⏸
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Phiên học tạm dừng</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Tạm dừng đồng hồ đếm ngược. Nhấp để tiếp tục học.
              </p>
            </div>
            <Button
              onClick={() => setTimerState(sessionType === 'work' ? 'running' : 'break')}
              className="w-full text-white bg-focus-session hover:opacity-90 font-semibold"
            >
              Tiếp tục
            </Button>
          </div>
        </div>
      )}

      {/* ─── MODAL: Completion Options ─── */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <DialogTitle className="text-lg font-bold text-foreground">Hoàn thành phiên học!</DialogTitle>
            <DialogDescription className="text-xs">
              Bạn đã hoàn thành xuất sắc chu kỳ học vừa qua. Hãy chọn hành động tiếp theo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 mt-4 sm:flex-col sm:justify-center">
            <Button
              className="w-full bg-focus-session text-white font-semibold"
              onClick={() => {
                setShowCompleteModal(false)
                setSessionType('short_break')
                setTimerState('break')
              }}
            >
              Nghỉ ngắn 5 phút
            </Button>
            <Button
              variant="outline"
              className="w-full border-border hover:bg-surface font-semibold"
              onClick={() => {
                setShowCompleteModal(false)
                endSession()
                navigate(`/plans/${currentPlan?.id || 'plan-1'}`)
              }}
            >
              Bắt đầu Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: Configurations ─── */}
      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings size={18} className="text-focus-session" />
              Cấu hình Pomodoro
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Thời gian học (phút)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={tempConfig.workDuration}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, workDuration: Math.max(1, Number(e.target.value)) }))}
                  className="w-full border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-focus-session"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Nghỉ ngắn (phút)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempConfig.shortBreakDuration}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, shortBreakDuration: Math.max(1, Number(e.target.value)) }))}
                  className="w-full border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-focus-session"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Nghỉ dài (phút)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={tempConfig.longBreakDuration}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, longBreakDuration: Math.max(1, Number(e.target.value)) }))}
                  className="w-full border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-focus-session"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Số chu kỳ (cycles)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={tempConfig.totalCycles}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, totalCycles: Math.max(1, Number(e.target.value)) }))}
                  className="w-full border border-border rounded-lg p-2 text-sm focus:outline-none focus:border-focus-session"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs font-semibold text-foreground">Bật âm thanh báo</span>
              <button
                className={`toggle-switch ${tempConfig.soundEnabled ? 'toggle-switch--active' : ''}`}
                onClick={() => setTempConfig(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              >
                <div className="toggle-switch__thumb" />
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigModal(false)}>
              Hủy
            </Button>
            <Button className="bg-focus-session text-white" onClick={handleSaveConfig}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
