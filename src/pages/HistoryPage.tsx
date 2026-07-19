import { Badge } from '@/components/ui/badge'
import { Flame, Clock, Award, CheckCircle2, Calendar, Brain } from 'lucide-react'

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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Lịch sử học tập</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi hành trình học tập, thống kê thời gian và kết quả kiểm tra định kỳ của bạn.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Chuỗi học tập</p>
            <p className="text-xl font-bold text-foreground">7 ngày liên tiếp</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Tổng thời gian tuần này</p>
            <p className="text-xl font-bold text-foreground">130 phút (2.1 giờ)</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award size={20} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Điểm phỏng vấn trung bình</p>
            <p className="text-xl font-bold text-foreground">8.8 / 10</p>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
          <CheckCircle2 className="text-emerald-500" size={18} />
          Các phiên học tập gần đây
        </h2>

        <div className="divide-y divide-border">
          {mockHistory.map((item) => (
            <div
              key={item.id}
              className="py-4 first:pt-0 last:pb-0 flex items-center justify-between flex-wrap gap-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${
                      item.type === 'interview'
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }
                  `}
                >
                  {item.type === 'interview' ? <Brain size={18} /> : <Clock size={18} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {item.type === 'interview' ? 'Mock Interview' : 'Focus Session'}
                    </span>
                    <Badge
                      variant="outline"
                      className={`
                        text-[9px] uppercase tracking-wider font-bold py-0 px-1.5
                        ${
                          item.type === 'interview'
                            ? 'bg-purple-50/55 text-purple-700 border-purple-200'
                            : 'bg-indigo-50/55 text-indigo-700 border-indigo-200'
                        }
                      `}
                    >
                      {item.type === 'interview' ? 'Phỏng vấn' : 'Tập trung'}
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
                    <span>Thời lượng: {item.durationMinutes} phút</span>
                  </div>
                </div>
              </div>

              <div>
                {item.type === 'interview' && item.score && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-muted-foreground font-medium">Kết quả:</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                      {item.score}/10
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
