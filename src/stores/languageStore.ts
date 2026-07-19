import { create } from 'zustand'

export type Language = 'vi' | 'en'

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: (localStorage.getItem('language') as Language) || 'vi',
  
  setLanguage: (lang) => {
    localStorage.setItem('language', lang)
    set({ language: lang })
  },
  
  toggleLanguage: () => {
    set((state) => {
      const nextLang = state.language === 'vi' ? 'en' : 'vi'
      localStorage.setItem('language', nextLang)
      return { language: nextLang }
    })
  },
}))

export const translations = {
  vi: {
    // General / Menu
    dashboard: 'Bảng điều khiển',
    plans: 'Kế hoạch học tập',
    interview: 'Phỏng vấn AI',
    focus: 'Phiên ôn tập',
    history: 'Lịch sử học tập',
    settings: 'Cài đặt',
    profile: 'Hồ sơ cá nhân',
    logout: 'Đăng xuất',
    active: 'Đang hoạt động',
    draft: 'Bản nháp',
    archived: 'Đã lưu trữ',
    all: 'Tất cả',
    
    // Header
    welcome: 'Chào mừng trở lại',
    notifications: 'Thông báo',
    theme: 'Giao diện',
    language: 'Ngôn ngữ',

    // Sidebar
    learning_assistant: 'Trợ lý học tập',

    // Dashboard
    statistics: 'Thống kê tổng quan',
    active_plans_count: 'Kế hoạch ôn tập',
    concepts_count: 'Tổng số khái niệm',
    overall_progress: 'Tiến độ trung bình',
    completed_sessions: 'Phiên đã hoàn thành',
    upcoming_reviews: 'Khái niệm cần ôn tập hôm nay',
    no_upcoming_reviews: 'Tuyệt vời! Không có khái niệm nào cần ôn tập gấp hôm nay.',
    review_now: 'Ôn tập ngay',
    recent_activity: 'Hoạt động gần đây',
    create_new_plan: 'Tạo kế hoạch học tập mới',
    no_plans: 'Không có kế hoạch nào',
    no_plans_desc: 'Bạn chưa tạo bất kỳ lộ trình học tập nào. Hãy bắt đầu ngay để tối ưu hóa việc ghi nhớ.',
    create_first_plan: 'Tạo kế hoạch đầu tiên',
    progress_title: 'Tiến độ ôn tập',
    deadline_label: 'Hạn chót',
    view_details: 'Xem chi tiết',
    studying: 'Đang học',
    concepts_label: 'khái niệm',
    plans_desc: 'Quản lý các lộ trình học tập, theo dõi tiến độ và chuẩn bị phỏng vấn với Recall AI.',
    plans_header: 'Kế hoạch học tập',
    
    // Create Plan
    plan_name: 'Tên kế hoạch',
    deadline: 'Thời hạn hoàn thành',
    upload_doc: 'Tải tài liệu lên (PDF, TXT...)',
    paste_text: 'Hoặc dán tài liệu dạng văn bản',
    analyze: 'Phân tích tài liệu',
    graph_preview: 'Xem trước đồ thị khái niệm',
    confirm_create: 'Xác nhận & Tạo lộ trình',
    add_concept: 'Thêm khái niệm',
    
    // Plan Detail
    concept_graph: 'Đồ thị Khái niệm',
    review_schedule: 'Lịch ôn tập tuần',
    manual_reschedule: 'Chỉnh sửa thủ công',
    danger_zone: 'Khu vực nguy hiểm',
    reset_progress: 'Đặt lại toàn bộ tiến độ',
    reset_confirm: 'Xác nhận đặt lại?',
    reset_desc: 'Tất cả điểm số và tiến trình sẽ quay về số 0. Hành động này không thể hoàn tác.',
    delete_plan: 'Xóa kế hoạch',
    archive_plan: 'Lưu trữ kế hoạch',
    re_analyze: 'Phân tích lại kế hoạch',
    
    // Interview
    start_interview_session: 'Bắt đầu phiên phỏng vấn',
    interview_config: 'Cấu hình phiên phỏng vấn',
    question_count: 'Số lượng câu hỏi',
    concept_select: 'Chọn khái niệm ôn tập',
    fallback_mode: 'Chế độ Flashcard (Không có mạng)',
    hide_question: 'Ẩn câu hỏi',
    show_question: 'Hiện câu hỏi',
    submit_answer: 'Gửi câu trả lời',
    grade_feedback: 'Nhận xét chi tiết từ AI',
    next_question: 'Câu hỏi tiếp theo',
    traceback_warning: 'Phát hiện hổng kiến thức nền tảng!',
    traceback_desc: 'Recall AI đề xuất bạn quay lại củng cố khái niệm gốc trước khi tiếp tục.',
    view_results: 'Xem báo cáo kết quả',
    dispute_score: 'Khiếu nại điểm số này?',
    
    // History
    history_header: 'Lịch sử học tập',
    history_desc: 'Theo dõi hành trình học tập, thống kê thời gian và kết quả kiểm tra định kỳ của bạn.',
    study_streak: 'Chuỗi học tập',
    days_streak: 'ngày liên tiếp',
    total_time_week: 'Tổng thời gian tuần này',
    avg_score: 'Điểm phỏng vấn trung bình',
    recent_sessions: 'Các phiên học tập gần đây',
    no_history: 'Chưa có lịch sử học tập nào cho các kế hoạch hiện tại.',
    minutes: 'phút',
    duration: 'Thời lượng',
    result: 'Kết quả',
    focus_label: 'Tập trung',
    interview_label: 'Phỏng vấn',

    // Focus / Pomodoro
    focus_desc: 'Tập trung cao độ để tiếp thu kiến thức mới. Mỗi phiên kéo dài 25 phút kèm theo thời gian nghỉ giải lao ngắn.',
    focus_why: 'Tại sao nên dùng Focus Session?',
    focus_why_desc: 'Phương pháp Pomodoro kết hợp học sâu (Deep Work) giúp bộ não của bạn ghi nhớ kiến thức tốt hơn 150% so với học liên tục không nghỉ ngơi. Recall AI sẽ tự động nhắc nhở bạn nghỉ giải lao và gợi ý các khái niệm cần tập trung nhất.',
    select_plan_focus: 'Chọn kế hoạch để bắt đầu học',
    need_create_plan_focus: 'Bạn cần tạo kế hoạch học tập trước khi bắt đầu Focus Session.',
    start_learning_now: 'Bắt đầu học ngay',
  },
  en: {
    // General / Menu
    dashboard: 'Dashboard',
    plans: 'Study Plans',
    interview: 'AI Interview',
    focus: 'Focus Session',
    history: 'History Log',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Log Out',
    active: 'Active',
    draft: 'Draft',
    archived: 'Archived',
    all: 'All',
    
    // Header
    welcome: 'Welcome back',
    notifications: 'Notifications',
    theme: 'Theme',
    language: 'Language',

    // Sidebar
    learning_assistant: 'Learning Assistant',

    // Dashboard
    statistics: 'Overall Statistics',
    active_plans_count: 'Active Plans',
    concepts_count: 'Total Concepts',
    overall_progress: 'Avg. Progress',
    completed_sessions: 'Completed Sessions',
    upcoming_reviews: 'Concepts to Review Today',
    no_upcoming_reviews: 'Great! No urgent concepts to review today.',
    review_now: 'Review Now',
    recent_activity: 'Recent Activity',
    create_new_plan: 'Create New Study Plan',
    no_plans: 'No study plans found',
    no_plans_desc: 'You have not created any study plans yet. Start now to optimize your recall.',
    create_first_plan: 'Create your first plan',
    progress_title: 'Review Progress',
    deadline_label: 'Deadline',
    view_details: 'View Details',
    studying: 'Studying',
    concepts_label: 'concepts',
    plans_desc: 'Manage your study paths, track progress and prepare for interviews with Recall AI.',
    plans_header: 'Study Plans',
    
    // Create Plan
    plan_name: 'Plan Name',
    deadline: 'Deadline Date',
    upload_doc: 'Upload Document (PDF, TXT...)',
    paste_text: 'Or paste raw document text',
    analyze: 'Analyze Document',
    graph_preview: 'Concept Graph Preview',
    confirm_create: 'Confirm & Create Plan',
    add_concept: 'Add Concept',
    
    // Plan Detail
    concept_graph: 'Concept Graph',
    review_schedule: 'Review Schedule',
    manual_reschedule: 'Manual Reschedule',
    danger_zone: 'Danger Zone',
    reset_progress: 'Reset All Progress',
    reset_confirm: 'Are you sure you want to reset?',
    reset_desc: 'All scores and progress will return to zero. This action cannot be undone.',
    delete_plan: 'Delete Plan',
    archive_plan: 'Archive Plan',
    re_analyze: 'Re-analyze Plan',
    
    // Interview
    start_interview_session: 'Start Interview Session',
    interview_config: 'Interview Configuration',
    question_count: 'Number of Questions',
    concept_select: 'Select Concept to Review',
    fallback_mode: 'Flashcard Mode (Offline)',
    hide_question: 'Hide Question',
    show_question: 'Show Question',
    submit_answer: 'Submit Answer',
    grade_feedback: 'AI Detailed Feedback',
    next_question: 'Next Question',
    traceback_warning: 'Found Prerequisite Gap!',
    traceback_desc: 'Recall AI recommends revising prerequisite concepts before continuing.',
    view_results: 'View Results Report',
    dispute_score: 'Dispute this score?',
    
    // History
    history_header: 'History Log',
    history_desc: 'Track your learning journey, compile study time and periodic test results.',
    study_streak: 'Study Streak',
    days_streak: 'days streak',
    total_time_week: 'Total time this week',
    avg_score: 'Avg. Interview Score',
    recent_sessions: 'Recent Study Sessions',
    no_history: 'No study history found for currently active plans.',
    minutes: 'minutes',
    duration: 'Duration',
    result: 'Result',
    focus_label: 'Focus',
    interview_label: 'Interview',

    // Focus / Pomodoro
    focus_desc: 'Focus intensely to absorb new knowledge. Each session lasts 25 minutes with a short break.',
    focus_why: 'Why use Focus Sessions?',
    focus_why_desc: 'The Pomodoro method combined with Deep Work helps your brain retain knowledge 150% better than continuous study without rest. Recall AI automatically prompts you to rest and suggests the key concepts to focus on.',
    select_plan_focus: 'Select a plan to start studying',
    need_create_plan_focus: 'You need to create a study plan before starting a Focus Session.',
    start_learning_now: 'Start Learning Now',
  }
}

export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore()
  
  const t = (key: keyof typeof translations['vi']) => {
    return translations[language][key] || translations['vi'][key] || key
  }
  
  return { t, lang: language, setLanguage, toggleLanguage }
}
