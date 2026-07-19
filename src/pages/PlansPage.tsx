import { useNavigate } from 'react-router-dom'
import { usePlanStore } from '@/stores/planStore'
import { useTranslation } from '@/stores/languageStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Plus, BookOpen, ArrowRight } from 'lucide-react'

export default function PlansPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { plans, setActivePlan, activePlan } = usePlanStore()

  const handleSelectPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      setActivePlan(plan)
    }
    navigate(`/plans/${planId}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('plans_header')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('plans_desc')}
          </p>
        </div>
        <Button
          onClick={() => navigate('/plans/new')}
          className="flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={16} />
          {t('create_new_plan')}
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto mt-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl mb-4 font-bold">
            📋
          </div>
          <h3 className="text-lg font-semibold text-foreground">{t('no_plans')}</h3>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            {t('no_plans_desc')}
          </p>
          <Button onClick={() => navigate('/plans/new')}>
            {t('create_first_plan')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrentlyActive = activePlan?.id === plan.id
            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`
                  bg-card rounded-2xl border p-5 flex flex-col justify-between gap-4
                  cursor-pointer transition-all duration-300 group hover:shadow-md hover:border-indigo-200/60
                  ${isCurrentlyActive ? 'ring-2 ring-indigo-500/10 border-indigo-400/50' : 'border-border'}
                `}
              >
                <div>
                  {/* Status & Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen size={14} className="text-indigo-500" />
                      <span className="font-mono">{plan.conceptCount}</span> {t('concepts_label')}
                    </span>
                    <div className="flex items-center gap-2">
                      {isCurrentlyActive && (
                        <Badge className="bg-indigo-600 text-white border-0 hover:bg-indigo-600">
                          {t('studying')}
                        </Badge>
                      )}
                      {plan.getStatusLabel() && (
                        <Badge className={plan.getStatusBadgeClass()}>
                          {plan.getStatusLabel()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-lg font-bold text-foreground group-hover:text-indigo-600 transition-colors">
                    {plan.name}
                  </h3>

                  {/* Progress info */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-muted-foreground">{t('progress_title')}</span>
                      <span className="text-foreground"><span className="font-mono">{plan.progress}</span>%</span>
                    </div>
                    <Progress value={plan.progress} className="h-1.5" />
                  </div>
                </div>

                {/* Footer Details */}
                <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar size={14} />
                    <span>{t('deadline_label')}: <span className="font-mono">{plan.deadline}</span></span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    {t('view_details')} <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
