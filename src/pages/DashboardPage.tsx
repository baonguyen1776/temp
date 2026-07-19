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
import { useTranslation } from '@/stores/languageStore'

const mockSuggestions = [
  {
    id: 1,
    concept: 'Closures in JavaScript',
    mastery: 'weak',
    reason: {
      vi: 'Deadline gần • 3 ngày',
      en: 'Upcoming Deadline • 3 days'
    }
  },
  {
    id: 2,
    concept: 'React Component Lifecycle',
    mastery: 'learning',
    reason: {
      vi: 'Cần ôn tập • 2 lần/tuần',
      en: 'Requires review • 2 times/week'
    }
  },
  {
    id: 3,
    concept: 'TypeScript Generics',
    mastery: 'untested',
    reason: {
      vi: 'Bạn vừa thêm • 0 ngày',
      en: 'Just added • 0 days'
    }
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
  const { t, lang } = useTranslation()
  
  const userName = user?.name.split(' ')[0] || 'học viên'

  return (
    <div className="space-y-8">
      {/* SECTION 1: Greeting + Today's Suggestion */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-4">
          {t('welcome')}, {userName}! 👋
        </h1>

        {/* Paused Session Resume Banner */}
        {pausedSession && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-sm animate-in fade-in duration-300 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 animate-pulse">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 text-sm">
                  {lang === 'vi' ? 'Bạn có phiên' : 'You have a paused'}{' '}
                  {pausedSession.type === 'interview' ? 'Mock Interview' : 'Focus Session'}{' '}
                  {lang === 'vi' ? 'đang tạm dừng' : 'session'}
                </h3>
                <p className="text-xs text-indigo-700">
                  {lang === 'vi' ? 'Kế hoạch:' : 'Plan:'} <span className="font-semibold">{pausedSession.planName}</span>
                  {pausedSession.conceptName && (
                    <> • {lang === 'vi' ? 'Khái niệm:' : 'Concept:'} <span className="font-semibold">{pausedSession.conceptName}</span></>
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
                {lang === 'vi' ? 'Tiếp tục phiên' : 'Resume Session'}
              </Button>
              <button
                onClick={() => endSession()}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {lang === 'vi' ? 'Kết thúc' : 'End'}
              </button>
            </div>
          </div>
        )}

        <div className="bg-card border border-[rgb(139_92_246)]/40 rounded-xl p-4 space-y-4">
          <h2 className="text-[rgb(139_92_246)] font-medium">
            📚 {t('upcoming_reviews')}
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
                  className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-muted/80 transition-colors"
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
                    {lang === 'vi' ? concept.getMasteryLabel() : suggestion.mastery.toUpperCase()}
                  </Badge>

                  {/* Reason */}
                  <p className="text-muted-foreground text-xs">
                    {lang === 'vi' ? suggestion.reason.vi : suggestion.reason.en}
                  </p>

                  {/* Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/focus/${suggestion.id}`)}
                  >
                    {lang === 'vi' ? 'Ôn ngay →' : 'Review →'}
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
          <h2 className="text-foreground font-semibold">{t('plans')}</h2>
          <Button size="sm" variant="default" onClick={() => navigate('/plans/new')}>
            {t('create_new_plan')} +
          </Button>
        </div>

        {plans.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 flex flex-col items-center justify-center text-center">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-muted-foreground mb-4">
              {lang === 'vi' ? 'Bạn chưa có kế hoạch học tập nào' : 'You do not have any study plans yet'}
            </p>
            <Button variant="default" onClick={() => navigate('/plans/new')}>
              {lang === 'vi' ? 'Tạo kế hoạch đầu tiên' : 'Create First Plan'}
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
                      <span className="font-mono">{strong}</span> {lang === 'vi' ? 'vững' : 'strong'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-[rgb(239_68_68)]/20 text-[rgb(239_68_68)] border-[rgb(239_68_68)]/30"
                    >
                      <span className="font-mono">{learning}</span> {lang === 'vi' ? 'yếu' : 'weak'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-[rgb(139_92_246)]/30 text-white border-[rgb(139_92_246)]/30"
                    >
                      <span className="font-mono">{untested}</span> {lang === 'vi' ? 'chưa ôn' : 'untested'}
                    </Badge>
                  </div>

                  {/* Continue button */}
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/plans/${plan.id}`)}
                  >
                    {lang === 'vi' ? 'Tiếp tục' : 'Continue'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION: Concept Graph Mini */}
      <div>
        <h2 className="text-foreground font-semibold mb-4">{t('concept_graph')}</h2>
        <ConceptGraphMini height={300} />
      </div>

      {/* SECTION 3: Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <Flame size={24} className="text-[rgb(236_72_153)]" />
          <div>
            <p className="text-muted-foreground text-xs">{lang === 'vi' ? 'Chuỗi' : 'Streak'}</p>
            <p className="text-[rgb(236_72_153)] font-semibold text-lg">
              <span className="font-mono">{mockStats.streak}</span> {lang === 'vi' ? 'ngày' : 'days'}
            </p>
          </div>
        </div>

        {/* Hours This Week Card */}
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <Clock size={24} className="text-[rgb(59_130_246)]" />
          <div>
            <p className="text-muted-foreground text-xs">{lang === 'vi' ? 'Giờ tuần này' : 'Hours this week'}</p>
            <p className="text-[rgb(59_130_246)] font-semibold text-lg">
              <span className="font-mono">{mockStats.hoursThisWeek}</span>h
            </p>
          </div>
        </div>

        {/* Sessions Card */}
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <CheckCircle2 size={24} className="text-[rgb(16_185_129)]" />
          <div>
            <p className="text-muted-foreground text-xs">{lang === 'vi' ? 'Phiên học' : 'Sessions'}</p>
            <p className="text-[rgb(16_185_129)] font-semibold text-lg font-mono">
              {mockStats.sessions}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
