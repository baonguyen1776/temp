import { useNavigate } from 'react-router-dom'
import { usePlanStore } from '@/stores/planStore'
import { useSessionStore } from '@/stores/sessionStore'
import { Button } from '@/components/ui/button'
import { Play, Clock } from 'lucide-react'

export default function FocusPage() {
  const navigate = useNavigate()
  const { plans } = usePlanStore()
  const { startSession } = useSessionStore()

  const handleStartFocus = (planId: string, planName: string) => {
    // Map plan to a concept ID for focus mode mapping
    let defaultConceptId = '1'
    let defaultConceptName = 'Async/Await'

    if (planId === 'plan-2') {
      defaultConceptId = '2'
      defaultConceptName = 'Promises'
    } else if (planId === 'plan-3') {
      defaultConceptId = '5'
      defaultConceptName = 'Scope'
    }

    const sessionData = {
      id: `focus-${planId}-${Date.now()}`,
      type: 'focus' as const,
      planId,
      planName,
      conceptId: defaultConceptId,
      conceptName: defaultConceptName,
      startedAt: new Date().toISOString(),
    }

    startSession(sessionData)
    navigate(`/focus/${defaultConceptId}`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="border-b border-border pb-5 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center sm:justify-start gap-2">
          <Clock className="text-indigo-600" size={24} />
          Focus Session (Pomodoro)
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Tập trung cao độ để tiếp thu kiến thức mới. Mỗi phiên kéo dài 25 phút kèm theo thời gian nghỉ giải lao ngắn.
        </p>
      </div>

      {/* Info card */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-3.5">
        <span className="text-xl mt-0.5">💡</span>
        <div>
          <h3 className="font-semibold text-indigo-950 text-sm">Tại sao nên dùng Focus Session?</h3>
          <p className="text-xs text-indigo-800/90 mt-1 leading-relaxed">
            Phương pháp Pomodoro kết hợp học sâu (Deep Work) giúp bộ não của bạn ghi nhớ kiến thức tốt hơn 150% so với học liên tục không nghỉ ngơi. Recall AI sẽ tự động nhắc nhở bạn nghỉ giải lao và gợi ý các khái niệm cần tập trung nhất.
          </p>
        </div>
      </div>

      {/* Select Plan Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Chọn kế hoạch để bắt đầu học</h2>
        
        {plans.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-zinc-50/50">
            <p className="text-sm text-muted-foreground mb-4">Bạn cần tạo kế hoạch học tập trước khi bắt đầu Focus Session.</p>
            <Button onClick={() => navigate('/plans/new')}>
              Tạo kế hoạch học tập
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-card border border-border hover:border-indigo-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-sm transition-all flex-wrap gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-base">{plan.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      • <span className="font-mono">{plan.conceptCount}</span> khái niệm
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tiến độ hoàn thành:{' '}
                    <span className="font-semibold text-indigo-600">
                      <span className="font-mono">{plan.progress}</span>%
                    </span>
                  </p>
                </div>

                <Button
                  onClick={() => handleStartFocus(plan.id, plan.name)}
                  size="sm"
                  className="gap-1.5"
                >
                  <Play size={12} fill="currentColor" />
                  Bắt đầu học ngay
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
