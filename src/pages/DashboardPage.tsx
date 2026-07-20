import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, Clock, CheckCircle2 } from 'lucide-react'
import ConceptGraphMini from '@/components/ConceptGraphMini'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
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
      vi: 'Mục tiêu sắp tới • 3 ngày nữa',
      en: 'Upcoming milestone • in 3 days'
    }
  },
  {
    id: 2,
    concept: 'React Component Lifecycle',
    mastery: 'learning',
    reason: {
      vi: 'Khám phá thêm • 2 lần/tuần',
      en: 'Expand knowledge • 2 times/week'
    }
  },
  {
    id: 3,
    concept: 'TypeScript Generics',
    mastery: 'untested',
    reason: {
      vi: 'Bài học mới tinh • hãy thử khám phá',
      en: 'Brand new concept • explore now'
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
  const mockWeeklyStudyHours = [
    { day: lang === 'vi' ? 'T2' : 'Mon', hours: 1.2 },
    { day: lang === 'vi' ? 'T3' : 'Tue', hours: 0.8 },
    { day: lang === 'vi' ? 'T4' : 'Wed', hours: 1.5 },
    { day: lang === 'vi' ? 'T5' : 'Thu', hours: 0.5 },
    { day: lang === 'vi' ? 'T6' : 'Fri', hours: 2.0 },
    { day: lang === 'vi' ? 'T7' : 'Sat', hours: 1.1 },
    { day: lang === 'vi' ? 'CN' : 'Sun', hours: 0.9 },
  ]

  const mockInterviewSessions = [
    { name: lang === 'vi' ? 'Tuần 1' : 'Week 1', sessions: 2 },
    { name: lang === 'vi' ? 'Tuần 2' : 'Week 2', sessions: 3 },
    { name: lang === 'vi' ? 'Tuần 3' : 'Week 3', sessions: 1 },
    { name: lang === 'vi' ? 'Tuần 4' : 'Week 4', sessions: 4 },
  ]

  return (
    <div className="space-y-8">
      {/* SECTION 1: Quick Stats Row (Pushed to the very top!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-12 h-12 rounded-xl card-icon-streak flex items-center justify-center">
            <Flame size={26} className="text-[rgb(236_72_153)]" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{lang === 'vi' ? 'Chuỗi ngày học' : 'Streak'}</p>
            <p className="text-[rgb(236_72_153)] font-bold text-xl mt-0.5">
              <span className="font-mono">{mockStats.streak}</span> {lang === 'vi' ? 'ngày' : 'days'}
            </p>
          </div>
        </div>

        {/* Hours This Week Card */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-12 h-12 rounded-xl card-icon-hours flex items-center justify-center">
            <Clock size={26} className="text-[rgb(59_130_246)]" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{lang === 'vi' ? 'Giờ ôn tuần này' : 'Hours this week'}</p>
            <p className="text-[rgb(59_130_246)] font-bold text-xl mt-0.5">
              <span className="font-mono">{mockStats.hoursThisWeek}</span>h
            </p>
          </div>
        </div>

        {/* Sessions Card */}
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="w-12 h-12 rounded-xl card-icon-sessions flex items-center justify-center">
            <CheckCircle2 size={26} className="text-[rgb(16_185_129)]" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{lang === 'vi' ? 'Phiên học' : 'Sessions'}</p>
            <p className="text-[rgb(16_185_129)] font-bold text-xl mt-0.5 font-mono">
              {mockStats.sessions}
            </p>
          </div>
        </div>
      </div>

      {/* Greeting + Today's Suggestion */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-4">
          {t('welcome')}, {userName}! 👋
        </h1>

        {/* Paused Session Resume Banner - High Contrast Theme */}
        {pausedSession && (
          <div className="banner-paused-session">
            <div className="flex items-center gap-3">
              <div className="banner-paused-clock-wrapper">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="banner-paused-title">
                  {lang === 'vi' ? 'Học tiếp phiên đang chờ bạn' : 'Resume Session waiting for you'}
                </h3>
                <p className="banner-paused-desc">
                  {lang === 'vi' ? 'Kế hoạch:' : 'Plan:'} <span className="banner-paused-highlight">{pausedSession.planName}</span>
                  {pausedSession.conceptName && (
                    <> • {lang === 'vi' ? 'Khái niệm:' : 'Concept:'} <span className="banner-paused-highlight">{pausedSession.conceptName}</span></>
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
                className="banner-paused-btn-resume"
              >
                {lang === 'vi' ? 'Tiếp tục học' : 'Resume Session'}
              </Button>
              <button
                onClick={() => endSession()}
                className="banner-paused-btn-end"
              >
                {lang === 'vi' ? 'Kết thúc' : 'End'}
              </button>
            </div>
          </div>
        )}

        {/* Highlighted CTA section for Daily Review Focus - Prominent visually */}
        <div className="bg-card border-2 border-primary/30 shadow-sm rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-foreground font-semibold flex items-center gap-2 text-sm md:text-base">
              🎯 {t('upcoming_reviews')}
            </h2>
            <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase tracking-wider px-2 py-0.5 rounded animate-pulse">
              {lang === 'vi' ? 'Khuyên dùng hôm nay' : 'Recommended today'}
            </span>
          </div>

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
                 <button
                   key={suggestion.id}
                   onClick={() => navigate(`/focus/${suggestion.id}`)}
                   className="w-full flex items-center gap-3 p-3.5 bg-background hover:bg-muted/80 border border-border/40 hover:border-primary/30 rounded-xl transition-all hover:scale-[1.005] text-left cursor-pointer group"
                 >
                   {/* Mastery status dot */}
                   <div
                     className={`w-2.5 h-2.5 rounded-full shrink-0 ${concept.getMasteryDotClass()}`}
                   />

                   {/* Concept details */}
                   <div className="flex-1">
                     <p className="text-foreground font-medium text-sm group-hover:text-primary transition-colors">
                       {concept.name}
                     </p>
                     <p className="text-muted-foreground text-xs mt-0.5">
                       {lang === 'vi' ? suggestion.reason.vi : suggestion.reason.en}
                     </p>
                   </div>

                   {/* Growth-focused Badge */}
                   <Badge
                     variant="outline"
                     className={`${concept.getMasteryBadgeClass()} border px-2.5 py-0.5 font-semibold text-xs`}
                   >
                     {lang === 'vi' ? concept.getMasteryLabel() : (suggestion.mastery === 'weak' ? 'Review Focus' : suggestion.mastery === 'learning' ? 'Learning' : 'Ready')}
                   </Badge>

                   {/* Arrow indicator on hover */}
                   <span className="text-muted-foreground group-hover:text-primary transition-all transform group-hover:translate-x-1 duration-150 pl-1">
                     →
                   </span>
                 </button>
               )
            })}
          </div>
        </div>
      </div>

      {/* SECTION: Visualization Charts (Weekly Revision + Interview sessions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Study hours this week */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-2xs">
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {lang === 'vi' ? 'Thời gian ôn tập trong tuần này (Giờ)' : 'Revision Time This Week (Hours)'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {lang === 'vi' ? 'Thống kê tổng số giờ học mỗi ngày' : 'Daily learning hours tracking'}
            </p>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeeklyStudyHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                <XAxis dataKey="day" stroke="var(--color-text-secondary)" tickLine={false} />
                <YAxis stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} />
                <ChartTooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--color-foreground)' }}
                  itemStyle={{ color: '#8B5CF6' }}
                />
                <Bar dataKey="hours" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Mock interview sessions */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-2xs">
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              {lang === 'vi' ? 'Phiên phỏng vấn thử đã thực hiện' : 'Interview Sessions Tracked'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {lang === 'vi' ? 'Theo dõi số phiên phỏng vấn qua các tuần' : 'Completed mock interviews per week'}
            </p>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockInterviewSessions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                <XAxis dataKey="name" stroke="var(--color-text-secondary)" tickLine={false} />
                <YAxis stroke="var(--color-text-secondary)" tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--color-foreground)' }}
                  itemStyle={{ color: '#10B981' }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => {
              const strong = Math.round(plan.conceptCount * 0.5)
              const learning = Math.round(plan.conceptCount * 0.3)
              const untested = plan.conceptCount - strong - learning
              
              return (
                <div
                  key={plan.id}
                  className="bg-card rounded-xl border border-border p-6 pb-7 space-y-4 flex flex-col hover:shadow-xs transition-shadow animate-in fade-in duration-300"
                >
                  {/* Plan name */}
                  <div>
                    <h3 className="font-semibold text-foreground text-base">{plan.name}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {plan.renderDaysRemaining()}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-foreground">
                      <span>{lang === 'vi' ? 'Tiến độ học tập' : 'Learning Progress'}</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} />
                  </div>

                  {/* Embedded mini graph unique for this plan */}
                  <div className="border border-border/60 rounded-lg overflow-hidden bg-muted/20 my-1 shrink-0">
                    <ConceptGraphMini height={180} planId={plan.id} />
                  </div>

                  {/* Concept count badges with breathing margin */}
                  <div className="flex gap-2 flex-wrap pt-2">
                    <Badge
                      variant="outline"
                      className="bg-[rgb(16_185_129)]/20 text-[rgb(16_185_129)] border-[rgb(16_185_129)]/30 px-2 py-0.5"
                    >
                      <span className="font-mono">{strong}</span> {lang === 'vi' ? 'đã vững' : 'mastered'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-[rgb(239_68_68)]/20 text-[rgb(239_68_68)] border-[rgb(239_68_68)]/30 px-2 py-0.5"
                    >
                      <span className="font-mono">{learning}</span> {lang === 'vi' ? 'cần củng cố' : 'needs review'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-[rgb(139_92_246)]/30 text-white border-[rgb(139_92_246)]/30 px-2 py-0.5"
                    >
                      <span className="font-mono">{untested}</span> {lang === 'vi' ? 'sẵn sàng học' : 'ready'}
                    </Badge>
                  </div>

                  {/* Continue button */}
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full mt-auto"
                    onClick={() => navigate(`/plans/${plan.id}`)}
                  >
                    {lang === 'vi' ? 'Tiếp tục học →' : 'Continue Learning →'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
