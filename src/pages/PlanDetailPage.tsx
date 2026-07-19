import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MoreVertical,
  Trash2,
  ArchiveIcon,
  RefreshCw,
  Calendar,
  Upload,
  AlertTriangle,
} from 'lucide-react'
import '@/styles/plan-detail.css'
import { Concept } from '@/models/Concept'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import ConceptGraphFull from '@/components/ConceptGraphFull'
import { usePlanStore } from '@/stores/planStore'
import { useTranslation } from '@/stores/languageStore'

// ─── Schedule Helper ────────────────────────────────────────────
const getWeekDates = () => {
  const today = new Date()
  const monday = new Date(today)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    return date
  })
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { lang } = useTranslation()

  const {
    plans,
    getPlanById,
    deletePlan,
    archivePlan,
    resetPlanProgress,
    schedules,
    updateSchedule,
  } = usePlanStore()

  const plan = getPlanById(id || 'plan-1') || plans[0]

  // State
  const [showDropdown, setShowDropdown] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [activePopover, setActivePopover] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Day names dynamically translated
  const dayNames = lang === 'vi'
    ? ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  // Close popover on outside click
  useEffect(() => {
    const handleClick = () => setActivePopover(null)
    if (activePopover) {
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClick)
      }, 10)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('click', handleClick)
      }
    }
  }, [activePopover])

  if (!plan) {
    return (
      <div className="p-8 text-center bg-card rounded-xl border border-border">
        <h2 className="text-lg font-bold text-foreground">
          {lang === 'vi' ? 'Không tìm thấy kế hoạch học tập' : 'Study plan not found'}
        </h2>
        <Button className="mt-4" onClick={() => navigate('/plans')}>
          {lang === 'vi' ? 'Quay lại danh sách' : 'Back to List'}
        </Button>
      </div>
    )
  }

  const weekDates = getWeekDates()
  const planSchedule = schedules[plan.id] || {}

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* ═══ HEADER ═══ */}
      <div className="border-b border-border pb-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{plan.name}</h1>

              {/* Deadline Badge */}
              <Badge variant="outline" className="gap-1.5">
                <Calendar size={12} />
                {new Date(plan.deadline).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
              </Badge>

              {/* Status Badge */}
              {plan.getStatusLabel() && (
                <Badge variant="outline" className={plan.getStatusBadgeClass() + ' border'}>
                  {lang === 'vi' 
                    ? plan.getStatusLabel() 
                    : plan.status === 'active' ? 'Active' : plan.status === 'draft' ? 'Draft' : 'Archived'}
                </Badge>
              )}
            </div>
          </div>

          {/* "..." Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Menu hành động"
            >
              <MoreVertical size={20} className="text-foreground" />
            </button>

            {showDropdown && (
              <div className="plan-dropdown-menu">
                <button
                  className="plan-dropdown-item"
                  onClick={() => {
                    archivePlan(plan.id)
                    setShowDropdown(false)
                  }}
                >
                  <ArchiveIcon size={16} />
                  {lang === 'vi' ? 'Lưu trữ' : 'Archive'}
                </button>
                <button
                  className="plan-dropdown-item plan-dropdown-item--danger"
                  onClick={() => {
                    deletePlan(plan.id)
                    setShowDropdown(false)
                    navigate('/plans')
                  }}
                >
                  <Trash2 size={16} />
                  {lang === 'vi' ? 'Xóa kế hoạch' : 'Delete Plan'}
                </button>
                <div className="plan-dropdown-divider" />
                <button
                  className="plan-dropdown-item"
                  onClick={() => {
                    setShowDropdown(false)
                    alert(lang === 'vi' ? "Đã gửi yêu cầu phân tích lại kế hoạch học tập." : "Request to re-analyze study plan has been submitted.")
                  }}
                >
                  <RefreshCw size={16} />
                  {lang === 'vi' ? 'Phân tích lại' : 'Re-analyze'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <Tabs defaultValue="graph" className="flex-1">
        <TabsList className="mb-6">
          <TabsTrigger value="graph">{lang === 'vi' ? 'Đồ thị Khái niệm' : 'Concept Graph'}</TabsTrigger>
          <TabsTrigger value="schedule">{lang === 'vi' ? 'Lịch Ôn tập' : 'Review Schedule'}</TabsTrigger>
          <TabsTrigger value="settings">{lang === 'vi' ? 'Cài đặt' : 'Settings'}</TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: Concept Graph ─── */}
        <TabsContent value="graph" className="border border-border rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <ConceptGraphFull planId={plan.id} />
        </TabsContent>

        {/* ─── TAB 2: Review Schedule ─── */}
        <TabsContent value="schedule" className="space-y-4">
          {/* Toggle Row */}
          <div className="flex items-center gap-3 mb-2">
            <button
              className={`toggle-switch ${editMode ? 'toggle-switch--active' : ''}`}
              onClick={() => setEditMode(prev => !prev)}
              aria-label="Chỉnh sửa thủ công"
            >
              <div className="toggle-switch__thumb" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {lang === 'vi' ? 'Chỉnh sửa thủ công' : 'Manual Reschedule'}
            </span>
            {editMode && (
              <span className="text-xs text-[rgb(59_130_246)]">
                {lang === 'vi' ? 'Kéo thả để di chuyển giữa các ngày' : 'Drag and drop to move between days'}
              </span>
            )}
          </div>

          {/* Week Calendar Grid */}
          <div className="grid grid-cols-7 gap-3">
            {dayNames.map((day, idx) => (
              <div
                key={day}
                className={`schedule-day ${editMode ? 'schedule-day--edit' : ''}`}
                onDragOver={(e) => {
                  if (editMode) {
                    e.preventDefault()
                  }
                }}
                onDrop={(e) => {
                  if (editMode) {
                    const conceptId = e.dataTransfer.getData('text/plain')
                    const fromDayStr = e.dataTransfer.getData('fromDay')
                    if (conceptId && fromDayStr) {
                      const fromDay = Number(fromDayStr)
                      const toDay = idx
                      if (fromDay !== toDay) {
                        const currentSchedule = { ...planSchedule }
                        const sourceList = [...(currentSchedule[fromDay] || [])]
                        const targetList = [...(currentSchedule[toDay] || [])]
                        
                        const itemIdx = sourceList.findIndex(item => item.conceptId === conceptId)
                        if (itemIdx !== -1) {
                          const [movedItem] = sourceList.splice(itemIdx, 1)
                          targetList.push(movedItem)
                          currentSchedule[fromDay] = sourceList
                          currentSchedule[toDay] = targetList
                          updateSchedule(plan.id, currentSchedule)
                        }
                      }
                    }
                  }
                }}
              >
                <div className="schedule-day__header">
                  {day}
                  <div className="schedule-day__date">
                    {weekDates[idx].toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>

                <div className="space-y-2 min-h-37.5">
                  {(planSchedule[idx] || []).map((item) => {
                    const concept = new Concept({
                      id: item.conceptId,
                      name: item.conceptName,
                      mastery: item.mastery,
                      difficulty: 3,
                      prerequisites: [],
                    })
                    
                    return (
                      <div key={`${idx}-${item.conceptId}`} className="relative">
                        <button
                          className={`schedule-chip ${editMode ? 'schedule-chip--draggable cursor-grab' : ''}`}
                          style={{ background: concept.getMasteryHexColor() }}
                          draggable={editMode}
                          onDragStart={(e) => {
                            if (editMode) {
                              e.dataTransfer.setData('text/plain', item.conceptId)
                              e.dataTransfer.setData('fromDay', String(idx))
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setActivePopover(
                              activePopover === `${idx}-${item.conceptId}`
                                ? null
                                : `${idx}-${item.conceptId}`
                            )
                          }}
                        >
                          {concept.name}
                        </button>

                        {/* Popover */}
                        {activePopover === `${idx}-${item.conceptId}` && (
                          <div
                            className="chip-popover"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <p className="font-semibold text-foreground text-sm mb-1">
                              {concept.name}
                            </p>
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: concept.getMasteryHexColor() }}
                              />
                              <span className="text-xs text-[rgb(156_163_175)]">
                                {concept.mastery !== null ? (
                                  <span>
                                    <span className="font-mono">{Math.round(concept.mastery * 100)}</span>% — {concept.getMasteryLabel()}
                                  </span>
                                ) : (
                                  concept.getMasteryLabel()
                                )}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="w-full"
                              variant="default"
                              onClick={() => navigate(`/focus/${concept.id}`)}
                            >
                              {lang === 'vi' ? 'Ôn ngay →' : 'Review Now →'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ─── TAB 3: Settings ─── */}
        <TabsContent value="settings" className="space-y-6 max-w-2xl">
          {/* Re-analyze Section */}
          <div className="settings-section">
            <div className="flex items-center gap-2 mb-1">
              <Upload size={18} className="text-foreground" />
              <h3 className="text-base font-semibold text-foreground">
                {lang === 'vi' ? 'Cập nhật tài liệu mới' : 'Upload New Document'}
              </h3>
            </div>
            <p className="text-sm text-[rgb(156_163_175)] mb-4">
              {lang === 'vi' ? 'Tải lên tài liệu mới để Recall AI phân tích lại kế hoạch học tập của bạn.' : 'Upload a new document to let Recall AI re-analyze your study plan.'}
            </p>
            <div className="upload-zone">
              <Upload size={28} className="text-[rgb(156_163_175)] mx-auto mb-2" />
              <p className="text-sm text-[rgb(156_163_175)] mb-3">
                {lang === 'vi' ? 'Kéo thả file PDF hoặc văn bản vào đây' : 'Drag & drop PDF files or raw text here'}
              </p>
              <Button variant="outline" size="sm" onClick={() => alert("Chức năng tải tài liệu mới lên đang được giả lập.")}>
                {lang === 'vi' ? 'Chọn file' : 'Select File'}
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-section settings-danger">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={18} className="text-[rgb(239_68_68)]" />
              <h3 className="text-base font-semibold text-[rgb(239_68_68)]">
                {lang === 'vi' ? 'Khu vực nguy hiểm' : 'Danger Zone'}
              </h3>
            </div>
            <p className="text-sm text-[rgb(156_163_175)] mb-4">
              {lang === 'vi' ? 'Đặt lại tất cả tiến độ học tập. Hành động này không thể hoàn tác.' : 'Reset all study progress. This action cannot be undone.'}
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowResetDialog(true)}
            >
              {lang === 'vi' ? 'Đặt lại toàn bộ tiến độ' : 'Reset All Progress'}
            </Button>
          </div>

          {/* Reset Confirm Dialog (Radix) */}
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {lang === 'vi' ? 'Xác nhận đặt lại?' : 'Confirm Reset?'}
                </DialogTitle>
                <DialogDescription>
                  {lang === 'vi' ? 'Tất cả tiến độ học tập sẽ bị xóa. Hành động này không thể hoàn tác.' : 'All study progress will be cleared. This action cannot be undone.'}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                  {lang === 'vi' ? 'Hủy' : 'Cancel'}
                </Button>
                <Button variant="destructive" onClick={() => {
                  resetPlanProgress(plan.id)
                  setShowResetDialog(false)
                }}>
                  {lang === 'vi' ? 'Đặt lại' : 'Reset'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
