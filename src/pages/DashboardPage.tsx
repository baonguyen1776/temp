import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, Clock, CheckCircle2 } from 'lucide-react'
import ConceptGraphMini from '@/components/ConceptGraphMini'
import { useSessionStore } from '@/stores/sessionStore'
import { usePlanStore } from '@/stores/planStore'
import { useAuthStore } from '@/stores/authStore'
import { Concept } from '@/models/Concept'

const mockSuggestions = [
  {
    id: 1,
    concept: 'Closures in JavaScript',
    mastery: 'weak',
    reason: (
      <span>
        Deadline gần • <span className="font-mono">3</span> ngày
      </span>
    ),
  },
  {
    id: 2,
    concept: 'React Component Lifecycle',
    mastery: 'learning',
    reason: (
      <span>
        Cần ôn tập • <span className="font-mono">2</span> lần/tuần
      </span>
    ),
  },
  {
    id: 3,
    concept: 'TypeScript Generics',
    mastery: 'untested',
    reason: (
      <span>
        Bạn vừa thêm • <span className="font-mono">0</span> ngày
      </span>
    ),
  },
]

const mockStats = {
  streak: 7,
  hoursThisWeek: 4.5,
  sessions: 12,
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { plans } = usePlanStore()
  const { user } = useAuthStore()
  const { pausedSession, resumeSession, endSession } = useSessionStore()
  
  const userName = user?.name.split(' ')[0] || 'học viên'

  return (
    <div className="space-y-8">
      {/* SECTION 1: Greeting + Today's Suggestion */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-4">
          Chào lại, {userName}! 👋
        </h1>

        {/* Paused Session Resume Banner */}
        {pausedSession && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-sm animate-in fade-in duration-300 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 animate-pulse">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 text-sm">
                  Bạn có phiên {pausedSession.type === 'interview' ? 'Mock Interview' : 'Focus Session'} đang tạm dừng
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
                  if (pausedSession.type === 'focus') {
                    navigate(`/focus/${pausedSession.conceptId || '1'}`)
                  } else {
                    navigate(`/interview/${pausedSession.planId || 'mock-session-1'}`)
                  }
                }}
                size="sm"
              >
                Tiếp tục phiên
              </Button>
              <button
                onClick={() => endSession()}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Kết thúc
              </button>
            </div>
          </div>
        )}

        <div className="bg-card border border-[rgb(139_92_246)]/40 rounded-xl p-4 space-y-4">
          <h2 className="text-[rgb(139_92_246)] font-medium">
            📚 Gợi ý hôm nay từ Recall AI
          </h2>

          <div className="space-y-3">
            {mockSuggestions.map((suggestion) => {
              const concept = new Concept({
                id: String(suggestion.id),
                name: suggestion.concept,
                mastery: suggestion.mastery === 'strong' ? 0.9 : suggestion.mastery === 'learning' ? 0.7 : suggestion.mastery === 'weak' ? 0.4 : null,
                difficulty: 3,
                prerequisites: [],
              })
              
              return (
                <div
                  key={suggestion.id}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-[rgb(249_250_251)] transition-colors"
                >
                  {/* Mastery dot */}
                  <div
                    className={`w-2 h-2 rounded-full ${concept.getMasteryDotClass()}`}
                  />

                  {/* Concept name */}
                  <div className="flex-1">
                    <p className="text-foreground font-medium">
                      {concept.name}
                    </p>
                  </div>

                  {/* Badge */}
                  <Badge
                    variant="outline"
                    className={`${concept.getMasteryBadgeClass()} border`}
                  >
                    {concept.getMasteryLabel()}
                  </Badge>

                  {/* Reason */}
                  <p className="text-muted-foreground text-xs">
                    {suggestion.reason}
                  </p>

                  {/* Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/memory/${suggestion.id}`)}
                  >
                    Ôn ngay →
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: Study Plans Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground font-semibold">Kế hoạch của tôi</h2>
          <Button size="sm" variant="default" onClick={() => navigate('/plans/new')}>
            Tạo mới +
          </Button>
        </div>

        {plans.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-muted-foreground mb-4">
              Bạn chưa có kế hoạch học tập nào
            </p>
            <Button variant="default" onClick={() => navigate('/plans/new')}>
              Tạo kế hoạch đầu tiên
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              // Safely compute concept breakdown
              const strong = Math.round(plan.conceptCount * 0.5)
              const learning = Math.round(plan.conceptCount * 0.3)
              const untested = plan.conceptCount - strong - learning
              
              return (
                <div
                  key={plan.id}
                  className="bg-card rounded-xl border border-border p-4 space-y-3"
                >
                  {/* Plan name */}
                  <h3 className="font-medium text-foreground">{plan.name}</h3>

                  {/* Deadline countdown */}
                  <p className="text-muted-foreground text-sm">
                    {plan.renderDaysRemaining()}
                  </p>

                  {/* Progress bar */}
                  <Progress value={plan.progress} />

                  {/* Concept count badges */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="bg-[rgb(16_185_129)]/20 text-[rgb(16_185_129)] border-[rgb(16_185_129)]/30"
                    >
                      <span className="font-mono">{strong}</span> vững
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-[rgb(239_68_68)]/20 text-[rgb(239_68_68)] border-[rgb(239_68_68)]/30"
                    >
                      <span className="font-mono">{learning}</span> yếu
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-[rgb(139_92_246)]/30 text-white border-[rgb(139_92_246)]/30"
                    >
                      <span className="font-mono">{untested}</span> chưa ôn
                    </Badge>
                  </div>

                  {/* Continue button */}
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/plans/${plan.id}`)}
                  >
                    Tiếp tục
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION: Concept Graph Mini */}
      <div>
        <h2 className="text-foreground font-semibold mb-4">Đồ thị Khái niệm</h2>
        <ConceptGraphMini height={300} />
      </div>

      {/* SECTION 3: Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <Flame size={24} className="text-[rgb(236_72_153)]" />
          <div>
            <p className="text-muted-foreground text-xs">Chuỗi</p>
            <p className="text-[rgb(236_72_153)] font-semibold text-lg">
              <span className="font-mono">{mockStats.streak}</span> ngày
            </p>
          </div>
        </div>

        {/* Hours This Week Card */}
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <Clock size={24} className="text-[rgb(59_130_246)]" />
          <div>
            <p className="text-muted-foreground text-xs">Giờ tuần này</p>
            <p className="text-[rgb(59_130_246)] font-semibold text-lg">
              <span className="font-mono">{mockStats.hoursThisWeek}</span>h
            </p>
          </div>
        </div>

        {/* Sessions Card */}
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-[rgb(16_185_129)]" />
          <div>
            <p className="text-muted-foreground text-xs">Phiên</p>
            <p className="text-[rgb(16_185_129)] font-semibold text-lg font-mono">
              {mockStats.sessions}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
