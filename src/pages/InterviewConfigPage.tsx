import { useState, useEffect } from 'react'
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
import { usePlanStore } from '@/stores/planStore'
import { useTranslation } from '@/stores/languageStore'

export default function InterviewConfigPage() {
  const navigate = useNavigate()
  const { lang } = useTranslation()
  const { pausedSession, resumeSession, endSession, startSession } = useSessionStore()
  const { plans, activePlan, setActivePlan, concepts } = usePlanStore()

  const currentPlan = activePlan || plans[0]
  const planConcepts = currentPlan ? (concepts[currentPlan.id] || []) : []

  // ─── Helpers dynamically translated ──────────────────────────────
  const getMasteryConfig = (mastery: number | null) => {
    if (mastery === null) {
      return {
        label: lang === 'vi' ? 'Chưa ôn' : 'Not Reviewed',
        className: 'bg-muted text-muted-foreground border-border',
        dotColor: 'bg-muted-foreground',
      }
    }
    if (mastery < 0.4) {
      return {
        label: lang === 'vi' ? 'Yếu' : 'Weak',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
        dotColor: 'bg-destructive',
      }
    }
    return {
      label: lang === 'vi' ? 'Trung bình' : 'Medium',
      className: 'bg-amber-500/15 text-amber-600 dark:text-amber-500 border-amber-500/25',
      dotColor: 'bg-amber-500',
    }
  }

  // ─── States ──────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [turns, setTurns] = useState<number>(3)
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true)

  // Sync selected concepts when plan changes
  useEffect(() => {
    if (planConcepts.length > 0) {
      const defaultChecked = planConcepts
        .filter(c => c.mastery === null || c.mastery < 0.4 || c.isRemediating)
        .map(c => c.id)
      setSelectedIds(defaultChecked)
    } else {
      setSelectedIds([])
    }
  }, [planConcepts])

  // ─── Handlers ────────────────────────────────────────────────
  const handleCheckboxChange = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedIds(planConcepts.map(c => c.id))
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
        <h1 className="text-2xl font-extrabold text-foreground">
          {lang === 'vi' ? 'Cấu hình phiên Interview' : 'AI Interview Configuration'}
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">
            {lang === 'vi' ? 'Kế hoạch học tập:' : 'Study Plan:'}
          </span>
          <select
            value={currentPlan?.id || ''}
            onChange={(e) => {
              const p = plans.find(p => p.id === e.target.value)
              if (p) setActivePlan(p)
            }}
            className="text-xs font-semibold bg-background border border-border rounded px-2.5 py-1 text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── RESUME BANNER ─── */}
      {pausedSession && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900 text-sm">
                {lang === 'vi' ? 'Bạn có phiên dở từ hôm qua. Tiếp tục?' : 'You have an unfinished session. Resume?'}
              </h3>
              <p className="text-xs text-indigo-700">
                {lang === 'vi' ? 'Kế hoạch: ' : 'Plan: '}<span className="font-semibold">{pausedSession.planName}</span>
                {pausedSession.conceptName && (
                  <>{lang === 'vi' ? ' • Khái niệm: ' : ' • Concept: '}<span className="font-semibold">{pausedSession.conceptName}</span></>
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
              {lang === 'vi' ? 'Tiếp tục phiên cũ' : 'Resume Session'}
            </Button>
            <button
              onClick={() => endSession()}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              {lang === 'vi' ? 'Bắt đầu mới' : 'Start New'}
            </button>
          </div>
        </div>
      )}

      {/* ─── SECTION 1: CONCEPT SELECTION ─── */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {lang === 'vi' ? 'Chọn khái niệm để kiểm tra' : 'Select Concepts to Review'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lang === 'vi' ? 'Recall AI sẽ tạo câu hỏi phỏng vấn dựa trên các khái niệm này.' : 'Recall AI will generate interview questions based on these concepts.'}
            </p>
          </div>

          <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 text-[10px] uppercase font-bold tracking-wider py-1 px-2.5">
            {lang === 'vi' ? '✨ Gợi ý từ Recall AI' : '✨ Recommended by Recall AI'}
          </Badge>
        </div>

        {/* Quick Toggles */}
        <div className="flex gap-4 text-xs font-semibold text-primary">
          <button onClick={handleSelectAll} className="hover:underline">
            {lang === 'vi' ? 'Chọn tất cả' : 'Select All'}
          </button>
          <span className="text-border">|</span>
          <button onClick={handleDeselectAll} className="hover:underline">
            {lang === 'vi' ? 'Bỏ chọn' : 'Deselect All'}
          </button>
        </div>

        {/* Checklist of Concepts */}
        <div className="border rounded-lg overflow-hidden divide-y">
          {planConcepts.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              {lang === 'vi' ? 'Không có khái niệm nào.' : 'No concepts found.'}
            </div>
          ) : (
            planConcepts.map(concept => {
              const masteryConfig = getMasteryConfig(concept.mastery)
              const isChecked = selectedIds.includes(concept.id)
              const isSuggested = concept.isRemediating

              return (
                <label
                  key={concept.id}
                  className={`flex items-center justify-between p-3.5 cursor-pointer hover:bg-muted transition-colors ${isChecked ? 'bg-primary/5' : 'bg-transparent'}`}
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
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            {lang === 'vi' ? 'Cần củng cố' : 'Needs Review'}
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
            })
          )}
        </div>
      </div>

      {/* ─── SECTION 2: SETTINGS ─── */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-sm">
        <h2 className="text-base font-bold text-foreground">
          {lang === 'vi' ? 'Cấu hình cuộc đối thoại' : 'Conversation Settings'}
        </h2>

        {/* Question turns slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {lang === 'vi' ? 'Số lượt hỏi mỗi khái niệm' : 'Turns per concept'}
            </span>
            <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {turns} {lang === 'vi' ? 'lượt / khái niệm' : 'turns / concept'}
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
            {lang === 'vi' ? 'Lượt trao đổi hỏi-đáp giữa AI và bạn cho mỗi khái niệm để đánh giá sâu sắc hơn.' : 'The number of Q&A rounds between AI and you for each concept to evaluate deeply.'}
          </p>
        </div>

        {/* Estimate time display */}
        <div className="bg-surface rounded-lg p-3.5 flex items-center justify-between border border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>
              {lang === 'vi' ? 'Thời gian phỏng vấn ước tính' : 'Estimated Interview Time'}
            </span>
          </div>
          <span className="font-extrabold text-foreground text-base">
            ~ {estimatedMinutes} {lang === 'vi' ? 'phút' : 'mins'}
          </span>
        </div>

        {/* Text-to-Speech Toggle */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              {voiceEnabled ? <Volume2 size={16} className="text-primary" /> : <VolumeX size={16} className="text-muted-foreground" />}
              {lang === 'vi' ? 'Bật voice (Text-to-Speech)' : 'Enable voice (Text-to-Speech)'}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {lang === 'vi' ? 'AI sẽ đọc thành tiếng các câu hỏi phỏng vấn cho bạn.' : 'The AI will read the interview questions aloud to you.'}
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
          {lang === 'vi' ? 'Hủy' : 'Cancel'}
        </Button>
        
        <Button
          disabled={selectedIds.length === 0}
          onClick={() => {
            const firstSelected = planConcepts.find(c => c.id === selectedIds[0])
            startSession({
              id: `interview-${currentPlan?.id || 'plan-1'}-${Date.now()}`,
              type: 'interview',
              planId: currentPlan?.id || 'plan-1',
              planName: currentPlan?.name || 'JavaScript Advanced',
              conceptId: selectedIds[0] || '1',
              conceptName: firstSelected?.name || '',
              startedAt: new Date().toISOString(),
            })
            navigate(`/interview/${currentPlan?.id || 'plan-1'}`)
          }}
          className="flex items-center gap-1.5 shadow-sm"
        >
          {lang === 'vi' ? 'Bắt đầu Interview' : 'Start Interview'}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}
