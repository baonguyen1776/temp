import { Badge } from '@/components/ui/badge'
import { Flame, Clock, Award, CheckCircle2, Calendar, Brain } from 'lucide-react'
import { usePlanStore } from '@/stores/planStore'
import { useTranslation } from '@/stores/languageStore'

interface HistoryEntry {
  id: string
  type: 'focus' | 'interview'
  planName: string
  conceptName: string
  durationMinutes: number
  date: string
  score?: number
}

const mockHistory: HistoryEntry[] = [
  {
    id: 'h-1',
    type: 'interview',
    planName: 'JavaScript Advanced',
    conceptName: 'Closures',
    durationMinutes: 15,
    date: '2026-07-18',
    score: 8.5,
  },
  {
    id: 'h-2',
    type: 'focus',
    planName: 'JavaScript Advanced',
    conceptName: 'Event Loop',
    durationMinutes: 25,
    date: '2026-07-18',
  },
  {
    id: 'h-3',
    type: 'focus',
    planName: 'React Hooks Deep Dive',
    conceptName: 'useEffect & Cleanup',
    durationMinutes: 50,
    date: '2026-07-17',
  },
  {
    id: 'h-4',
    type: 'interview',
    planName: 'React Hooks Deep Dive',
    conceptName: 'Custom Hooks',
    durationMinutes: 20,
    date: '2026-07-16',
    score: 9.0,
  },
  {
    id: 'h-5',
    type: 'focus',
    planName: 'TypeScript Patterns',
    conceptName: 'Generics',
    durationMinutes: 25,
    date: '2026-07-15',
  },
]

export default function HistoryPage() {
  const { plans } = usePlanStore()
  const { t } = useTranslation()
  const planNames = plans.map(p => p.name)
  
  // Filter history items to only include ones that belong to existing plans
  const activeHistory = mockHistory.filter(item => planNames.includes(item.planName))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('history_header')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('history_desc')}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t('study_streak')}</p>
            <p className="text-xl font-bold text-foreground">7 {t('days_streak')}</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t('total_time_week')}</p>
            <p className="text-xl font-bold text-foreground">130 {t('minutes')} (2.1h)</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Award size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t('avg_score')}</p>
            <p className="text-xl font-bold text-foreground">8.8 / 10</p>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" size={18} />
          {t('recent_sessions')}
        </h2>

        {activeHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-xs">
            {t('no_history')}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activeHistory.map((item) => (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between flex-wrap gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5
                      ${
                        item.type === 'interview'
                          ? 'bg-purple-500/10 text-purple-500'
                          : 'bg-primary/10 text-primary'
                      }
                    `}
                  >
                    {item.type === 'interview' ? <Brain size={18} /> : <Clock size={18} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {item.type === 'interview' ? t('interview_label') : t('focus_label')}
                      </span>
                      <Badge
                        variant="outline"
                        className={`
                          text-[9px] uppercase tracking-wider font-bold py-0 px-1.5 border-0
                          ${
                            item.type === 'interview'
                              ? 'bg-purple-500/15 text-purple-500'
                              : 'bg-primary/15 text-primary'
                          }
                        `}
                      >
                        {item.type === 'interview' ? t('interview_label') : t('focus_label')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Kế hoạch: <span className="font-medium text-foreground">{item.planName}</span> •
                      Khái niệm: <span className="font-medium text-foreground">{item.conceptName}</span>
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {item.date}
                      </span>
                      <span>•</span>
                      <span>{t('duration')}: {item.durationMinutes} {t('minutes')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {item.type === 'interview' && item.score && (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground font-medium">{t('result')}:</span>
                      <span className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {item.score}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
