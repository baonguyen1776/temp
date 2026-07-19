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

interface ScheduleItem {
  conceptId: string
  conceptName: string
  mastery: number | null
}

// ─── Mock Data ──────────────────────────────────────────────────
const mockSchedule: Record<number, ScheduleItem[]> = {
  0: [
    { conceptId: '8', conceptName: 'Destructuring', mastery: 0.30 },
    { conceptId: '3', conceptName: 'Callbacks', mastery: 0.45 },
  ],
  1: [
    { conceptId: '6', conceptName: 'Closures', mastery: 0.60 },
  ],
  2: [
    { conceptId: '4', conceptName: 'Event Loop', mastery: null },
    { conceptId: '2', conceptName: 'Promises', mastery: 0.70 },
  ],
  3: [
    { conceptId: '1', conceptName: 'Async/Await', mastery: 0.85 },
  ],
  4: [
    { conceptId: '8', conceptName: 'Destructuring', mastery: 0.30 },
    { conceptId: '5', conceptName: 'Scope', mastery: 0.90 },
  ],
  5: [
    { conceptId: '3', conceptName: 'Callbacks', mastery: 0.45 },
    { conceptId: '7', conceptName: 'Functions', mastery: 0.95 },
  ],
  6: [
    { conceptId: '6', conceptName: 'Closures', mastery: 0.60 },
  ],
}

// ─── Helpers ────────────────────────────────────────────────────
const getMasteryColor = (mastery: number | null): string => {
  if (mastery === null) return '#9CA3AF'
  if (mastery < 0.4) return '#EF4444'
  if (mastery < 0.7) return '#F59E0B'
  return '#10B981'
}

const getMasteryLabel = (mastery: number | null): string => {
  if (mastery === null) return 'Chưa ôn'
  if (mastery < 0.4) return 'Yếu'
  if (mastery < 0.7) return 'Đang học'
  return 'Vững'
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Đang hoạt động', className: 'bg-[rgb(16_185_129)]/20 text-[rgb(16_185_129)] border-[rgb(16_185_129)]/30' }
    case 'draft':
      return { label: 'Nháp', className: 'bg-[rgb(156_163_175)]/20 text-[rgb(156_163_175)] border-[rgb(156_163_175)]/30' }
    case 'archived':
      return { label: 'Đã lưu trữ', className: 'bg-[rgb(107_114_128)]/20 text-[rgb(107_114_128)] border-[rgb(107_114_128)]/30' }
    default:
      return { label: status, className: '' }
  }
}



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

const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // State
  const [showDropdown, setShowDropdown] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [activePopover, setActivePopover] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const planData = {
    name: 'JavaScript Advanced',
    deadline: '2024-12-31',
    status: 'active' as const,
  }

  const statusConfig = getStatusConfig(planData.status)
  const weekDates = getWeekDates()

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>
      {/* ═══ HEADER ═══ */}
      <div className="border-b border-border pb-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{planData.name}</h1>

              {/* Deadline Badge */}
              <Badge variant="outline" className="gap-1.5">
                <Calendar size={12} />
                {new Date(planData.deadline).toLocaleDateString('vi-VN')}
              </Badge>

              {/* Status Badge */}
              <Badge variant="outline" className={statusConfig.className + ' border'}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* "..." Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(prev => !prev)}
              className="p-2 hover:bg-[rgb(249_250_251)] rounded-lg transition-colors"
              aria-label="Menu hành động"
            >
              <MoreVertical size={20} className="text-foreground" />
            </button>

            {showDropdown && (
              <div className="plan-dropdown-menu">
                <button
                  className="plan-dropdown-item"
                  onClick={() => { setShowDropdown(false) }}
                >
                  <ArchiveIcon size={16} />
                  Lưu trữ
                </button>
                <button
                  className="plan-dropdown-item plan-dropdown-item--danger"
                  onClick={() => { setShowDropdown(false) }}
                >
                  <Trash2 size={16} />
                  Xóa kế hoạch
                </button>
                <div className="plan-dropdown-divider" />
                <button
                  className="plan-dropdown-item"
                  onClick={() => { setShowDropdown(false) }}
                >
                  <RefreshCw size={16} />
                  Phân tích lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <Tabs defaultValue="graph" className="flex-1">
        <TabsList className="mb-6">
          <TabsTrigger value="graph">Đồ thị Khái niệm</TabsTrigger>
          <TabsTrigger value="schedule">Lịch Ôn tập</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: Concept Graph ─── */}
        <TabsContent value="graph" className="border border-border rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <ConceptGraphFull planId={id} />
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
              Chỉnh sửa thủ công
            </span>
            {editMode && (
              <span className="text-xs text-[rgb(59_130_246)]">
                Kéo thả để di chuyển giữa các ngày
              </span>
            )}
          </div>

          {/* Week Calendar Grid */}
          <div className="grid grid-cols-7 gap-3">
            {dayNames.map((day, idx) => (
              <div
                key={day}
                className={`schedule-day ${editMode ? 'schedule-day--edit' : ''}`}
              >
                <div className="schedule-day__header">
                  {day}
                  <div className="schedule-day__date">
                    {weekDates[idx].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </div>
                </div>

                <div className="space-y-2">
                  {(mockSchedule[idx] || []).map((item) => (
                    <div key={`${idx}-${item.conceptId}`} className="relative">
                      <button
                        className={`schedule-chip ${editMode ? 'schedule-chip--draggable' : ''}`}
                        style={{ background: getMasteryColor(item.mastery) }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActivePopover(
                            activePopover === `${idx}-${item.conceptId}`
                              ? null
                              : `${idx}-${item.conceptId}`
                          )
                        }}
                      >
                        {item.conceptName}
                      </button>

                      {/* Popover */}
                      {activePopover === `${idx}-${item.conceptId}` && (
                        <div
                          className="chip-popover"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="font-semibold text-foreground text-sm mb-1">
                            {item.conceptName}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: getMasteryColor(item.mastery) }}
                            />
                            <span className="text-xs text-[rgb(156_163_175)]">
                              {item.mastery !== null ? (
                                <span>
                                  <span className="font-mono">{Math.round(item.mastery * 100)}</span>% — {getMasteryLabel(item.mastery)}
                                </span>
                              ) : (
                                getMasteryLabel(item.mastery)
                              )}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            className="w-full"
                            variant="default"
                            onClick={() => navigate(`/focus/${item.conceptId}`)}
                          >
                            Ôn ngay →
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
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
              <h3 className="text-base font-semibold text-foreground">Cập nhật tài liệu mới</h3>
            </div>
            <p className="text-sm text-[rgb(156_163_175)] mb-4">
              Tải lên tài liệu mới để Recall AI phân tích lại kế hoạch học tập của bạn.
            </p>
            <div className="upload-zone">
              <Upload size={28} className="text-[rgb(156_163_175)] mx-auto mb-2" />
              <p className="text-sm text-[rgb(156_163_175)] mb-3">
                Kéo thả file PDF hoặc văn bản vào đây
              </p>
              <Button variant="outline" size="sm">
                Chọn file
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="settings-section settings-danger">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={18} className="text-[rgb(239_68_68)]" />
              <h3 className="text-base font-semibold text-[rgb(239_68_68)]">Khu vực nguy hiểm</h3>
            </div>
            <p className="text-sm text-[rgb(156_163_175)] mb-4">
              Đặt lại tất cả tiến độ học tập. Hành động này không thể hoàn tác.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowResetDialog(true)}
            >
              Đặt lại toàn bộ tiến độ
            </Button>
          </div>

          {/* Reset Confirm Dialog (Radix) */}
          <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận đặt lại?</DialogTitle>
                <DialogDescription>
                  Tất cả tiến độ học tập sẽ bị xóa. Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={() => setShowResetDialog(false)}>
                  Đặt lại
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
