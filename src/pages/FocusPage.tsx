import { useNavigate } from 'react-router-dom'
import { usePlanStore } from '@/stores/planStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useTranslation } from '@/stores/languageStore'
import { Button } from '@/components/ui/button'
import { Play, Clock } from 'lucide-react'

export default function FocusPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
          <Clock className="text-primary" size={24} />
          {t('focus')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          {t('focus_desc')}
        </p>
      </div>

      {/* Info card */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 flex items-start gap-3.5">
        <span className="text-xl mt-0.5">💡</span>
        <div>
          <h3 className="font-semibold text-foreground text-sm">{t('focus_why')}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {t('focus_why_desc')}
          </p>
        </div>
      </div>

      {/* Select Plan Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">{t('select_plan_focus')}</h2>
        
        {plans.length === 0 ? (
          <div className="border border-dashed border-border rounded-2xl p-8 text-center bg-muted/10">
            <p className="text-sm text-muted-foreground mb-4">{t('need_create_plan_focus')}</p>
            <Button onClick={() => navigate('/plans/new')}>
              {t('create_new_plan')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-card border border-border hover:border-primary/45 rounded-2xl p-5 flex items-center justify-between hover:shadow-sm transition-all flex-wrap gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground text-base">{plan.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      • <span className="font-mono">{plan.conceptCount}</span> {t('concepts_label')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('progress_title')}:{' '}
                    <span className="font-semibold text-primary">
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
                  {t('start_learning_now')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
