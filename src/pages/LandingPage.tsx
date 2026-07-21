import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Sparkles,
  BrainCircuit,
  Target,
  Zap,
  Mic,
  Clock,
  CheckCircle2,
  ArrowRight,
  Star,
  ChevronDown,
  Award,
  Check,
  Play,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'roadmap' | 'graph' | 'interview' | 'flashcards'>('graph')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-120 h-120 bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-100 h-100 bg-blue-600/15 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-size-[4rem_4rem]" />
      </div>

      {/* ─── STICKY HEADER ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white via-slate-100 to-slate-400">
                Recall<span className="text-indigo-400">.AI</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-indigo-400/90">Planner & Memory</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Tính năng</a>
            <a href="#demo" className="hover:text-indigo-400 transition-colors">Trải nghiệm AI</a>
            <a href="#pricing" className="hover:text-indigo-400 transition-colors">Bảng giá</a>
            <a href="#testimonials" className="hover:text-indigo-400 transition-colors">Đánh giá</a>
            <a href="#faq" className="hover:text-indigo-400 transition-colors">Hỏi đáp</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors hidden sm:block"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/login')}
              className="relative group overflow-hidden rounded-xl p-px font-semibold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <span className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:opacity-90 transition-opacity" />
              <span className="relative px-5 py-2.5 rounded-[11px] bg-slate-950 text-white group-hover:bg-opacity-0 transition-all flex items-center gap-2">
                <span>Bắt đầu miễn phí</span>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ─── HERO SECTION ────────────────────────────────────────── */}
        <section className="pt-16 pb-24 md:pt-24 md:pb-32 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Nền tảng Học tập & Ôn luyện AI Thế hệ mới</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.15] mb-6">
            Biến Tri Thức Thành{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
              Trí Nhớ Vĩnh Cửu
            </span>{' '}
            Cùng Trợ Lý AI
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-10">
            Recall.AI kết hợp <strong className="text-slate-200">Lộ trình AI cá nhân hóa</strong>,{' '}
            <strong className="text-slate-200">Sơ đồ Tri thức Interactive</strong> và{' '}
            <strong className="text-slate-200">Giả lập Phỏng vấn AI</strong> giúp bạn làm chủ mọi môn học & kỹ năng nhanh gấp 3 lần.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Zap className="w-5 h-5 fill-current text-yellow-300" />
              <span>Khám phá Dashboard ngay</span>
            </button>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-200 font-semibold text-base hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-slate-300" />
              <span>Xem Bản Demo Trực tiếp</span>
            </a>
          </div>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap justify-center items-center gap-3 text-xs sm:text-sm text-slate-400 font-medium max-w-4xl mx-auto">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sơ đồ tư duy dạng Graph 3D</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Phòng thi nói AI thông minh</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Active Recall & Spaced Repetition</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Pomodoro & Chuỗi ngày học Streak</span>
            </div>
          </div>

          {/* Hero Visual Mockup Container */}
          <div className="mt-16 relative mx-auto max-w-6xl">
            <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-4 sm:p-6 text-left overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs text-slate-400 font-mono">recall-ai-planner // workspace</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">
                    Live Demo Mode
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Card: Graph Preview */}
                <div className="lg:col-span-2 rounded-xl bg-slate-950/80 border border-slate-800 p-5 relative overflow-hidden flex flex-col justify-between min-h-75">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-indigo-400" />
                      <h3 className="font-semibold text-sm text-slate-200">Sơ đồ Tri thức Concept Graph</h3>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      12 Khái niệm • 94% Thành thạo
                    </span>
                  </div>

                  {/* Simulated Visual Graph Nodes */}
                  <div className="relative h-48 w-full bg-slate-900/50 rounded-lg border border-slate-800/60 p-4 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(#6366f115_1px,transparent_1px)] bg-size-[16px_16px]" />
                    
                    {/* Connecting SVG Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1="20%" y1="30%" x2="50%" y2="50%" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 2" />
                      <line x1="50%" y1="50%" x2="80%" y2="35%" stroke="#a855f7" strokeWidth="2" />
                      <line x1="50%" y1="50%" x2="45%" y2="80%" stroke="#10b981" strokeWidth="2" />
                      <line x1="80%" y1="35%" x2="85%" y2="75%" stroke="#ec4899" strokeWidth="1.5" />
                    </svg>

                    {/* Nodes */}
                    <div className="absolute top-[20%] left-[15%] p-2 rounded-lg bg-indigo-900/80 border border-indigo-500/40 text-xs font-semibold text-indigo-200 shadow-md">
                      Data Structures
                    </div>
                    <div className="absolute top-[42%] left-[40%] p-3 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 animate-pulse">
                      Graph Theory & BFS/DFS
                    </div>
                    <div className="absolute top-[25%] right-[12%] p-2.5 rounded-lg bg-purple-900/80 border border-purple-500/40 text-xs font-semibold text-purple-200 shadow-md">
                      Dynamic Programming
                    </div>
                    <div className="absolute bottom-[15%] left-[38%] p-2 rounded-lg bg-emerald-900/80 border border-emerald-500/40 text-xs font-semibold text-emerald-200 shadow-md">
                      System Design
                    </div>
                    <div className="absolute bottom-[18%] right-[10%] p-2 rounded-lg bg-pink-900/80 border border-pink-500/40 text-xs font-semibold text-pink-200 shadow-md">
                      System Architecture
                    </div>
                  </div>
                </div>

                {/* Right Card: AI Interview Simulation */}
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Mic className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-sm text-slate-200">Giả lập Phỏng vấn AI</h3>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                        <span className="font-bold text-indigo-400">AI Examiner:</span> "Hãy giải thích sự khác biệt giữa Mutex và Semaphore?"
                      </div>
                      <div className="p-3 rounded-lg bg-indigo-950/50 border border-indigo-800/50 text-indigo-200">
                        <span className="font-bold text-emerald-400">Bạn:</span> "Mutex chỉ cho phép 1 thread giữ lock, còn Semaphore có counter cho phép N threads..."
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <Award className="w-4 h-4" />
                      <span>Đánh giá AI: 9.5/10 (Xuất sắc)</span>
                    </div>
                    <button onClick={() => navigate('/interview/config')} className="text-xs text-indigo-400 hover:underline">
                      Thử ngay →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── STATS COUNTER BAR ───────────────────────────────────── */}
        <section className="py-12 bg-slate-900/60 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                10,000+
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Lộ trình học đã tạo</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400">
                95%
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Tăng tỷ lệ ghi nhớ kiến thức</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-400">
                4.9 / 5
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Đánh giá từ 2,500+ học viên</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-400">
                500K+
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">Thẻ Active Recall được tạo</div>
            </div>
          </div>
        </section>

        {/* ─── CORE FEATURES SECTION ───────────────────────────────── */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Tính Năng Cốt Lõi</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-100 tracking-tight">
              Tất cả công cụ bạn cần để chinh phục kiến thức đỉnh cao
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-6 text-indigo-500/10 group-hover:text-indigo-500/20 transition-colors">
                <Target className="w-24 h-24 -mr-6 -mt-6" />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">Lộ Trình Học AI Thông Minh</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Nhập mục tiêu hoặc tài liệu của bạn. AI sẽ phân tích, chia nhỏ thành các bài học logic kèm thời gian ước tính tối ưu.
                </p>
              </div>
              <button onClick={() => navigate('/plans/new')} className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Tạo kế hoạch mới</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 hover:border-purple-500/50 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-6 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
                <BrainCircuit className="w-24 h-24 -mr-6 -mt-6" />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">Sơ Đồ Tri Thức (Concept Graph)</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Trực quan hóa mạng lưới khái niệm dạng nút liên kết. Theo dõi mức độ thông thạo từng chủ đề theo màu sắc thực tế.
                </p>
              </div>
              <button onClick={() => navigate('/dashboard')} className="text-xs font-semibold text-purple-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Khám phá Sơ đồ Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 hover:border-pink-500/50 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-6 text-pink-500/10 group-hover:text-pink-500/20 transition-colors">
                <Mic className="w-24 h-24 -mr-6 -mt-6" />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">Phòng Thi Nói & Phỏng Vấn AI</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Giả lập buổi phỏng vấn hoặc vấn đáp oral exam. Trợ lý AI chấm điểm chi tiết, phát hiện chỗ chưa chính xác.
                </p>
              </div>
              <button onClick={() => navigate('/interview/config')} className="text-xs font-semibold text-pink-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Thử phỏng vấn AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-6 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                <RefreshCw className="w-24 h-24 -mr-6 -mt-6" />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">Active Recall & Spaced Repetition</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Tự động gợi ý thẻ ôn tập đúng thời điểm trước khi kiến thức bị quên theo thuật toán Ebbinghaus Forgetting Curve.
                </p>
              </div>
              <button onClick={() => navigate('/create')} className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Tạo thẻ ghi nhớ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-6 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                <Clock className="w-24 h-24 -mr-6 -mt-6" />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">Phiên Tập Trung Pomodoro & Ambient</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Bộ đếm Pomodoro tối ưu cùng âm thanh nền thư thái giúp bạn chìm đắm vào trạng thái Deep Work mà không xao nhãng.
                </p>
              </div>
              <button onClick={() => navigate('/focus')} className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Vào phòng tập trung</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 p-8 hover:border-blue-500/50 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-6 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                <TrendingUp className="w-24 h-24 -mr-6 -mt-6" />
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-3">Báo Cáo & Thống Kê Tiến Độ</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Phân tích chi tiết điểm mạnh, điểm cần khắc phục và duy trì chuỗi Streak học tập liên tục mỗi ngày.
                </p>
              </div>
              <button onClick={() => navigate('/history')} className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Xem lịch sử học tập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ─── INTERACTIVE DEMO SWITCHER ──────────────────────────── */}
        <section id="demo" className="py-24 bg-slate-900/40 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Tương Tác Trực Tiếp</h2>
              <p className="text-3xl font-bold text-slate-100 tracking-tight">
                Trải nghiệm giao diện hoạt động của Recall.AI
              </p>
            </div>

            {/* Tab Navigation Controls */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex p-1.5 rounded-xl bg-slate-900 border border-slate-800 gap-2">
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'graph'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sơ đồ Graph
                </button>
                <button
                  onClick={() => setActiveTab('roadmap')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'roadmap'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Lộ trình AI
                </button>
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'interview'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Thi Phỏng Vấn AI
                </button>
                <button
                  onClick={() => setActiveTab('flashcards')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'flashcards'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Active Recall
                </button>
              </div>
            </div>

            {/* Demo Display Panel */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-8 min-h-95 shadow-2xl relative">
              {activeTab === 'graph' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-100">Sơ đồ Khái niệm: Web Development Mastery</h4>
                      <p className="text-xs text-slate-400">Tương tác trực quan các liên kết kiến thức</p>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
                      Mastery Rate: 88%
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-indigo-300">React Core & Fiber</span>
                        <span className="text-xs text-emerald-400 font-semibold">96%</span>
                      </div>
                      <p className="text-xs text-slate-400">Virtual DOM, Reconciliation, Hooks Internals</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-purple-300">State Management</span>
                        <span className="text-xs text-emerald-400 font-semibold">90%</span>
                      </div>
                      <p className="text-xs text-slate-400">Zustand, Redux Toolkit, Context Optimization</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-amber-300">Web Performance</span>
                        <span className="text-xs text-amber-400 font-semibold">72%</span>
                      </div>
                      <p className="text-xs text-slate-400">Core Web Vitals, LCP Optimization, Code Splitting</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-100">Kế hoạch AI: System Design for Engineers</h4>
                      <p className="text-xs text-slate-400">Lộ trình 4 tuần tự động tinh chỉnh theo năng lực</p>
                    </div>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-medium">
                      Đã hoàn thành 3/5 Module
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-semibold text-slate-200">Module 1: Load Balancing & Reverse Proxy</span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Completed</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900 border border-indigo-500/40">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                        </div>
                        <span className="text-sm font-semibold text-slate-100">Module 2: Database Sharding & Caching Strategies</span>
                      </div>
                      <span className="text-xs text-indigo-400 font-mono">In Progress</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'interview' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                    <span className="text-xs font-bold text-indigo-400 uppercase">Câu hỏi phỏng vấn AI:</span>
                    <p className="text-sm text-slate-200 mt-1">
                      "Trong thiết kế hệ thống phân tán, nguyên lý CAP theorem quy định điều gì và khi nào bạn ưu tiên AP thay vì CP?"
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase">Câu trả lời mẫu của bạn:</span>
                    <p className="text-sm text-slate-300 mt-1">
                      "CAP theorem chỉ ra rằng một hệ thống phân tán chỉ có thể chọn 2 trong 3 yếu tố: Consistency, Availability, Partition Tolerance. Trong môi trường thực tế, Partition Tolerance là bắt buộc..."
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                    <span><strong>AI Feedback:</strong> Trả lời chính xác và mạch lạc! Đạt 9.2/10.</span>
                    <button onClick={() => navigate('/interview/config')} className="text-indigo-400 font-bold hover:underline">
                      Thử nghiệm ngay
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-xl mb-4">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Mặt trước Flashcard</span>
                    <h5 className="text-lg font-bold text-slate-100 mt-2 mb-4">Độ phức tạp thời gian của QuickSort trong trường hợp xấu nhất?</h5>
                    <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                      Chạm để lật mặt sau
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-lg bg-rose-900/40 border border-rose-500/40 text-rose-300 text-xs font-semibold">Quên (1 ngày)</button>
                    <button className="px-4 py-2 rounded-lg bg-amber-900/40 border border-amber-500/40 text-amber-300 text-xs font-semibold">Khá (3 ngày)</button>
                    <button className="px-4 py-2 rounded-lg bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">Thuộc (7 ngày)</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
        <section id="testimonials" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Người Dùng Nói Gì</h2>
            <p className="text-3xl font-bold text-slate-100 tracking-tight">
              Đồng hành cùng hàng ngàn học viên & kỹ sư xuất sắc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "Tính năng Phỏng vấn AI thực sự cứu cánh cho mình khi chuẩn bị cho đợt phỏng vấn Senior Frontend Engineer. AI đưa ra câu hỏi sát thực tế và góp ý rất sâu!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                  NV
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-200">Nguyễn Văn Hoàng</h5>
                  <p className="text-xs text-slate-400">Senior Frontend Engineer</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "Sơ đồ Tri thức Concept Graph giúp mình hình dung toàn bộ mối liên hệ giữa các thuật toán và cấu trúc dữ liệu. Điểm thi môn thuật toán của mình đã tăng từ B lên A+!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white text-sm">
                  TH
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-200">Trần Thu Hà</h5>
                  <p className="text-xs text-slate-400">Sinh viên Khoa Khoa học Máy tính - ĐHQG</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  "Tính năng Spaced Repetition cùng Pomodoro session giúp mình duy trì chuỗi học liên tục 45 ngày mà không hề bị nản. Cực kỳ khuyến nghị!"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center font-bold text-white text-sm">
                  LMB
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-200">Lê Minh Bảo</h5>
                  <p className="text-xs text-slate-400">Học viên IELTS & AI Learner</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PRICING SECTION ─────────────────────────────────────── */}
        <section id="pricing" className="py-24 bg-slate-900/40 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Bảng Giá Linh Hoạt</h2>
              <p className="text-3xl font-bold text-slate-100 tracking-tight">
                Chọn gói phù hợp với mục tiêu của bạn
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Free Plan */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">Free Starter</h3>
                  <p className="text-xs text-slate-400 mb-6">Dành cho người mới bắt đầu trải nghiệm</p>
                  <div className="text-4xl font-extrabold text-slate-100 mb-6">0đ <span className="text-xs text-slate-500 font-normal">/ vĩnh viễn</span></div>
                  <ul className="space-y-3 text-sm text-slate-300 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Tối đa 3 Lộ trình AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>50 Thẻ Active Recall</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Sơ đồ Concept Graph cơ bản</span>
                    </li>
                  </ul>
                </div>
                <button onClick={() => navigate('/login')} className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-semibold text-sm text-slate-200 transition-all">
                  Tạo tài khoản miễn phí
                </button>
              </div>

              {/* Pro Plan (Highlighted) */}
              <div className="rounded-2xl bg-linear-to-b from-indigo-950/80 via-slate-950 to-slate-950 border-2 border-indigo-500 p-8 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/20 scale-105">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-md">
                  Phổ biến nhất
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">Pro Scholar</h3>
                  <p className="text-xs text-indigo-300 mb-6">Tối ưu cho sinh viên & Kỹ sư chuyên nghiệp</p>
                  <div className="text-4xl font-extrabold text-slate-100 mb-6">149.000đ <span className="text-xs text-slate-400 font-normal">/ tháng</span></div>
                  <ul className="space-y-3 text-sm text-slate-200 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-indigo-400" />
                      <span>Không giới hạn Lộ trình AI</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-indigo-400" />
                      <span>Không giới hạn Phỏng vấn AI & Feedback</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-indigo-400" />
                      <span>Sơ đồ Concept Graph 3D nâng cao</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-indigo-400" />
                      <span>Thuật toán Spaced Repetition thông minh</span>
                    </li>
                  </ul>
                </div>
                <button onClick={() => navigate('/login')} className="w-full py-3.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all">
                  Nâng cấp Pro ngay
                </button>
              </div>

              {/* Lifetime / Team Plan */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">Ultimate Team</h3>
                  <p className="text-xs text-slate-400 mb-6">Dành cho nhóm nghiên cứu & Doanh nghiệp</p>
                  <div className="text-4xl font-extrabold text-slate-100 mb-6">499.000đ <span className="text-xs text-slate-500 font-normal">/ tháng</span></div>
                  <ul className="space-y-3 text-sm text-slate-300 mb-8">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Mọi tính năng gói Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Chia sẻ Graph tri thức chung</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Hỗ trợ ưu tiên 24/7 từ AI Architect</span>
                    </li>
                  </ul>
                </div>
                <button onClick={() => navigate('/login')} className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 font-semibold text-sm text-slate-200 transition-all">
                  Liên hệ nhóm
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ACCORDION SECTION ───────────────────────────────── */}
        <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Thắc Mắc Thường Gặp</h2>
            <p className="text-3xl font-bold text-slate-100 tracking-tight">Giải đáp các thắc mắc về Recall.AI</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Recall.AI khác gì so với các ứng dụng ghi chú hoặc flashcard thông thường?",
                a: "Recall.AI không chỉ lưu trữ thông tin thụ động. Hệ thống chủ động xây dựng sơ đồ khái niệm (Concept Graph), tự động tạo bộ câu hỏi phỏng vấn bằng AI và gợi ý thẻ ôn tập đúng thời điểm bạn sắp quên."
              },
              {
                q: "Tôi có thể dùng thử miễn phí trước khi trả phí không?",
                a: "Có! Bạn hoàn toàn có thể tạo tài khoản Free Starter miễn phí vĩnh viễn để trải nghiệm tính năng lập lộ trình và tạo thẻ nhớ Active Recall."
              },
              {
                q: "AI trong phần phỏng vấn đánh giá câu trả lời dựa trên tiêu chí nào?",
                a: "Trợ lý AI phân tích độ chính xác về mặt lý thuyết, tính mạch lạc trong cách diễn đạt, các từ khóa chuyên ngành quan trọng và đưa ra điểm số kèm lời khuyên cải thiện."
              },
              {
                q: "Dữ liệu và ghi chú của tôi có được bảo mật không?",
                a: "Chúng tôi cam kết bảo mật 100% dữ liệu của bạn. Mọi thông tin cá nhân và lộ trình học tập đều được mã hóa an toàn."
              }
            ].map((faq, index) => (
              <div key={index} className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left font-semibold text-slate-200 flex items-center justify-between hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="p-5 pt-0 text-sm text-slate-400 leading-relaxed border-t border-slate-800/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── CALL TO ACTION BANNER ───────────────────────────────── */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-16 bg-linear-to-r from-indigo-900 via-purple-900 to-slate-900 border border-indigo-500/30 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(#818cf820_1px,transparent_1px)] bg-size-[20px_20px] pointer-events-none" />
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 relative z-10">
              Sẵn Sàng Nâng Tầm Khả Năng Ghi Nhớ Của Bạn?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 relative z-10">
              Bắt đầu xây dựng Sơ đồ Tri thức và Lộ trình Học tập AI ngay hôm nay hoàn toàn miễn phí.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="relative z-10 px-8 py-4 rounded-xl bg-white text-indigo-950 font-bold text-base hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              Bắt Đầu Miễn Phí Ngay
            </button>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-200">Recall.AI Planner</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <a href="#features" className="hover:text-slate-200">Tính năng</a>
            <a href="#pricing" className="hover:text-slate-200">Bảng giá</a>
            <a href="#faq" className="hover:text-slate-200">Hỏi đáp</a>
            <Link to="/login" className="hover:text-slate-200">Đăng nhập</Link>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Recall.AI Planner. Built with Precision.
          </p>
        </div>
      </footer>
    </div>
  )
}
