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
          <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">CURRICULUM</span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{t('plans_header')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {t('plans_desc')}
          </p>
        </div>
        <Button
          onClick={() => navigate('/plans/new')}
          className="flex items-center gap-1.5 shadow-xs font-medium"
        >
          <Plus size={16} />
          {t('create_new_plan')}
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="hallmark-card p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto mt-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl mb-4 font-mono font-bold">
            📋
          </div>
          <h3 className="text-base font-semibold text-foreground">{t('no_plans')}</h3>
          <p className="text-xs text-muted-foreground mt-2 mb-6">
            {t('no_plans_desc')}
          </p>
          <Button onClick={() => navigate('/plans/new')}>
            {t('create_first_plan')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {plans.map((plan) => {
            const isCurrentlyActive = activePlan?.id === plan.id
            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`
                  hallmark-card p-5 flex flex-col justify-between gap-4
                  cursor-pointer transition-all duration-200 group hover:border-primary/50 hover:shadow-xs
                  ${isCurrentlyActive ? 'border-primary/80 ring-1 ring-primary/20 bg-primary/5' : 'bg-card'}
                `}
              >
                <div>
                  {/* Status & Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen size={14} className="text-primary" />
                      <span className="tabular-nums font-bold">{plan.conceptCount}</span> {t('concepts_label')}
                    </span>
                    <div className="flex items-center gap-2">
                      {isCurrentlyActive && (
                        <Badge className="bg-primary text-primary-foreground border-0 font-mono text-[10px] uppercase tracking-wider">
                          {t('studying')}
                        </Badge>
                      )}
                      {plan.getStatusLabel() && (
                        <Badge className={`${plan.getStatusBadgeClass()} font-mono text-[10px]`}>
                          {plan.getStatusLabel()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                    {plan.name}
                  </h3>

                  {/* Progress info */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="micro-type text-muted-foreground text-[10px]">{t('progress_title')}</span>
                      <span className="text-foreground tabular-nums font-bold">{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="h-1.5" />
                  </div>
                </div>

                {/* Footer specs */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Calendar size={13} />
                    {plan.deadline ? plan.deadline : `${plan.getDaysRemaining()} ngày`}
                  </span>
                  <span className="flex items-center gap-1 text-primary text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                    {t('view_details')} <ArrowRight size={13} />
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
