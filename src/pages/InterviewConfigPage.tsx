import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Volume2,
  VolumeX,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSessionStore } from '@/stores/sessionStore'

// ─── Concept Data ──────────────────────────────────────────────
interface InterviewConcept {
  id: string
  name: string
  mastery: number | null
  isSreSuggested?: boolean
}

const mockConcepts: InterviewConcept[] = [
  { id: '1', name: 'Async/Await', mastery: 0.35, isSreSuggested: true },
  { id: '2', name: 'Promises', mastery: 0.70 },
  { id: '3', name: 'Callbacks', mastery: 0.45, isSreSuggested: true },
  { id: '4', name: 'Event Loop', mastery: null },
  { id: '5', name: 'Scope', mastery: 0.90 },
  { id: '6', name: 'Closures', mastery: 0.60 },
  { id: '7', name: 'Functions', mastery: 0.95 },
  { id: '8', name: 'Destructuring', mastery: 0.30, isSreSuggested: true },
]

// ─── Helpers ────────────────────────────────────────────────────
const getMasteryConfig = (mastery: number | null) => {
  if (mastery === null) {
    return {
      label: 'Chưa ôn',
      className: 'bg-gray-100 text-gray-700 border-gray-200',
      dotColor: 'bg-gray-400',
    }
  }
  if (mastery < 0.4) {
    return {
      label: 'Yếu',
      className: 'bg-red-50 text-red-700 border-red-200',
      dotColor: 'bg-red-500',
    }
  }
  return {
    label: 'Trung bình',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  }
}

export default function InterviewConfigPage() {
  const navigate = useNavigate()
  const { pausedSession, resumeSession, endSession, startSession } = useSessionStore()

  // ─── States ──────────────────────────────────────────────────
  // Pre-check concepts with low mastery (<0.4), null mastery, or isSreSuggested
  const defaultCheckedIds = mockConcepts
    .filter(c => c.mastery === null || c.mastery < 0.4 || c.isSreSuggested)
    .map(c => c.id)

  const [selectedIds, setSelectedIds] = useState<string[]>(defaultCheckedIds)
  const [turns, setTurns] = useState<number>(3)
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true)

  // ─── Handlers ────────────────────────────────────────────────
  const handleCheckboxChange = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedIds(mockConcepts.map(c => c.id))
  }

  const handleDeselectAll = () => {
    setSelectedIds([])
  }

  // ─── Calculations ─────────────────────────────────────────────
  const estimatedMinutes = selectedIds.length * turns * 3

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
      {/* ─── HEADING ─── */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-extrabold text-foreground">Cấu hình phiên Interview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kế hoạch học tập: <span className="font-semibold text-primary">JavaScript Advanced</span>
        </p>
      </div>

      {/* ─── SECTION 3: RESUME BANNER (Conditional) ─── */}
      {pausedSession && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900 text-sm">
                Bạn có phiên dở từ hôm qua. Tiếp tục?
              </h3>
              <p className="text-xs text-indigo-700">
                Kế hoạch: <span className="font-semibold">{pausedSession.planName}</span>
                {pausedSession.conceptName && (
                  <> • Khái niệm: <span className="font-semibold">{pausedSession.conceptName}</span></>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                resumeSession()
                navigate(`/interview/${pausedSession.planId || 'mock-session-1'}`)
              }}
              size="sm"
            >
              Tiếp tục phiên cũ
            </Button>
            <button
              onClick={() => endSession()}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Bắt đầu mới
            </button>
          </div>
        </div>
      )}

      {/* ─── SECTION 1: CONCEPT SELECTION ─── */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground">Chọn khái niệm để kiểm tra</h2>
            <p className="text-xs text-muted-foreground">
              Recall AI sẽ tạo câu hỏi phỏng vấn dựa trên các khái niệm này.
            </p>
          </div>

          <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 text-[10px] uppercase font-bold tracking-wider py-1 px-2.5">
            ✨ Gợi ý từ Recall AI
          </Badge>
        </div>

        {/* Quick Toggles */}
        <div className="flex gap-4 text-xs font-semibold text-primary">
          <button onClick={handleSelectAll} className="hover:underline">
            Chọn tất cả
          </button>
          <span className="text-border">|</span>
          <button onClick={handleDeselectAll} className="hover:underline">
            Bỏ chọn
          </button>
        </div>

        {/* Checklist of Concepts */}
        <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
          {mockConcepts.map(concept => {
            const masteryConfig = getMasteryConfig(concept.mastery)
            const isChecked = selectedIds.includes(concept.id)
            const isSuggested = concept.isSreSuggested

            return (
              <label
                key={concept.id}
                className={`flex items-center justify-between p-3.5 cursor-pointer hover:bg-surface transition-colors ${isChecked ? 'bg-primary/5' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(concept.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                      {concept.name}
                      {isSuggested && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          SRE Gợi ý
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Mastery Badge */}
                <Badge className={`${masteryConfig.className} border font-medium text-xs flex items-center gap-1.5`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${masteryConfig.dotColor}`} />
                  {masteryConfig.label}
                </Badge>
              </label>
            )
          })}
        </div>
      </div>

      {/* ─── SECTION 2: SETTINGS ─── */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
        <h2 className="text-base font-bold text-foreground">Cấu hình cuộc đối thoại</h2>

        {/* Question turns slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Số lượt hỏi mỗi khái niệm</span>
            <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {turns} lượt / khái niệm
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={turns}
            onChange={(e) => setTurns(Number(e.target.value))}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <p className="text-[11px] text-muted-foreground">
            Lượt trao đổi hỏi-đáp giữa AI và bạn cho mỗi khái niệm để đánh giá sâu sắc hơn.
          </p>
        </div>

        {/* Estimate time display */}
        <div className="bg-surface rounded-lg p-3.5 flex items-center justify-between border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>Thời gian phỏng vấn ước tính</span>
          </div>
          <span className="font-extrabold text-foreground text-base">
            ~ {estimatedMinutes} phút
          </span>
        </div>

        {/* Text-to-Speech Toggle */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              {voiceEnabled ? <Volume2 size={16} className="text-primary" /> : <VolumeX size={16} className="text-muted-foreground" />}
              Bật voice (Text-to-Speech)
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              AI sẽ đọc thành tiếng các câu hỏi phỏng vấn cho bạn.
            </p>
          </div>
          <button
            className={`toggle-switch ${voiceEnabled ? 'toggle-switch--active bg-primary' : 'bg-border'}`}
            onClick={() => setVoiceEnabled(prev => !prev)}
            aria-label="Toggle Text-to-Speech"
          >
            <div className="toggle-switch__thumb" />
          </button>
        </div>
      </div>

      {/* ─── BOTTOM ACTIONS ─── */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="font-semibold text-muted-foreground hover:bg-surface text-sm"
        >
          Hủy
        </Button>
        
        <Button
          disabled={selectedIds.length === 0}
          onClick={() => {
            startSession({
              id: 'mock-session-1',
              type: 'interview',
              planId: 'plan-1',
              planName: 'JavaScript Advanced',
              conceptId: selectedIds[0] || '1',
              conceptName: mockConcepts.find(c => c.id === selectedIds[0])?.name || '',
              startedAt: new Date().toISOString(),
            })
            navigate('/interview/mock-session-1')
          }}
          className="flex items-center gap-1.5 shadow-sm"
        >
          Bắt đầu Interview
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}
