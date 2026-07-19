import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, ZoomIn, ZoomOut, Maximize2, RotateCcw, RotateCw } from 'lucide-react'

type Step = 1 | 2 | 3

interface FormData {
  planName: string
  deadline: string
  file: File | null
  fileText: string
}

const mockConcepts = [
  { id: '1', name: 'Functions', difficulty: 2 },
  { id: '2', name: 'Async/Await', difficulty: 4 },
  { id: '3', name: 'Closures', difficulty: 4 },
  { id: '4', name: 'Callbacks', difficulty: 3 },
  { id: '5', name: 'Promises', difficulty: 3 },
  { id: '6', name: 'Event Loop', difficulty: 5 },
  { id: '7', name: 'Scope', difficulty: 2 },
]

const initialNodes: Node[] = mockConcepts.map((concept, idx) => ({
  id: concept.id,
  data: { label: concept.name },
  position: {
    x: (idx % 3) * 250 + 50,
    y: Math.floor(idx / 3) * 150 + 50,
  },
  style: {
    background: '#8B5CF6',
    color: '#fff',
    border: '2px solid #6D28D9',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '500',
  },
}))

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-4', source: '1', target: '4' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' },
]

export default function CreatePlanPage() {
  const navigate = useNavigate()
  const dragCounter = useRef(0)
  
  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState<FormData>({
    planName: '',
    deadline: '',
    file: null,
    fileText: '',
  })
  const [isDragging, setIsDragging] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file')
  const [progressMessage, setProgressMessage] = useState('Đang đọc tài liệu...')
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const messages = [
    'Đang đọc tài liệu...',
    'Đang trích xuất khái niệm...',
    'Đang xây dựng đồ thị...',
    'Đang tạo lịch ôn tập...',
  ]

  // Progress message cycling
  useEffect(() => {
    if (step === 2) {
      let messageIndex = 0
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length
        setProgressMessage(messages[messageIndex])
      }, 2000)

      // Auto-advance after 3 seconds
      const timer = setTimeout(() => {
        setStep(3)
      }, 3000)

      return () => {
        clearInterval(interval)
        clearTimeout(timer)
      }
    }
  }, [step])

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragging(true)
  }

  const handleDragLeave = (_e: React.DragEvent) => {
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file && isValidFile(file)) {
      setFormData({ ...formData, file })
    }
  }

  const isValidFile = (file: File): boolean => {
    const validTypes = ['.pdf', '.jpg', '.png', '.txt']
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
    const maxSize = 20 * 1024 * 1024 // 20MB

    return validTypes.includes(fileExt) && file.size <= maxSize
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && isValidFile(file)) {
      setFormData({ ...formData, file })
    }
  }

  const handleRemoveFile = () => {
    setFormData({ ...formData, file: null })
  }

  const canProceedStep1 = () => {
    return (
      formData.planName.trim() &&
      formData.deadline &&
      (formData.file || formData.fileText.trim())
    )
  }

  const handleAnalyze = () => {
    if (canProceedStep1()) {
      setStep(2)
    }
  }

  const handleConfirmPlan = () => {
    navigate('/plans/plan-1')
  }

  const handleUndo = () => {
    console.log('Undo')
  }

  const handleRedo = () => {
    console.log('Redo')
  }

  const handleZoomIn = () => {
    console.log('Zoom In')
  }

  const handleZoomOut = () => {
    console.log('Zoom Out')
  }

  const handleFitView = () => {
    console.log('Fit View')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Step Indicator */}
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    s === step
                      ? 'bg-primary text-white'
                      : s < step
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                <span className="text-sm font-medium text-text-secondary">
                  {s === 1 ? 'Thông tin' : s === 2 ? 'Xử lý' : 'Kiểm tra'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Plan Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Tên kế hoạch
                </label>
                <Input
                  type="text"
                  placeholder="Giải tích 1 — Cuối kỳ"
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData({ ...formData, planName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Deadline ôn tập
                </label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setUploadMode('file')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      uploadMode === 'file'
                        ? 'bg-primary text-white'
                        : 'bg-surface text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    Tải file
                  </button>
                  <button
                    onClick={() => setUploadMode('text')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      uploadMode === 'text'
                        ? 'bg-primary text-white'
                        : 'bg-surface text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    Dán văn bản
                  </button>
                </div>

                {uploadMode === 'file' ? (
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? 'border-primary bg-blue-50'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {formData.file ? (
                      <div className="flex items-center justify-between p-3 bg-surface rounded border border-border">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-primary" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-text-primary">
                              {formData.file.name}
                            </p>
                            <p className="text-xs text-text-light">
                              {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-text-secondary" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-text-secondary">Kéo thả file PDF vào đây</p>
                        <p className="text-text-light text-sm">hoặc</p>
                        <label className="inline-block">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.png,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <span className="px-4 py-2 bg-primary text-white rounded cursor-pointer hover:bg-primary/90 transition-colors inline-block text-sm font-medium">
                            Chọn file
                          </span>
                        </label>
                        <p className="text-xs text-text-light">
                          Chấp nhận: .pdf, .jpg, .png, .txt (max 20MB)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    placeholder="Dán văn bản của bạn ở đây..."
                    value={formData.fileText}
                    onChange={(e) =>
                      setFormData({ ...formData, fileText: e.target.value })
                    }
                    className="w-full h-48 p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleAnalyze}
                  disabled={!canProceedStep1()}
                  className="gap-2"
                >
                  Phân tích tài liệu <span>→</span>
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-8">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-primary rounded-full animate-spin"></div>
                </div>
              </div>
              <p className="text-lg text-text-primary font-medium mb-2">
                {progressMessage}
              </p>
              <p className="text-sm text-text-light">
                Bạn có thể đóng và quay lại sau
              </p>
            </div>
          )}

          {/* Step 3: Graph Preview */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex gap-2 bg-surface p-3 rounded-lg border border-border">
                <Button variant="outline" size="sm" onClick={handleUndo}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleRedo}>
                  <RotateCw className="w-4 h-4" />
                </Button>
                <div className="w-px bg-border"></div>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleFitView}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Instruction Banner */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-text-primary">
                Kiểm tra và điều chỉnh đồ thị nếu cần. Kéo để di chuyển, click cạnh để xóa.
              </div>

              {/* Graph with Sidebar */}
              <div className="flex gap-4 bg-white rounded-lg border border-border overflow-hidden" style={{ height: '500px' }}>
                {/* Flow Graph */}
                <div className="flex-1 relative">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                  >
                    <Background />
                    <Controls />
                  </ReactFlow>
                </div>

                {/* Concepts Sidebar */}
                <div className="w-64 border-l border-border bg-surface overflow-y-auto p-4">
                  <h3 className="font-semibold text-text-primary mb-4 text-sm">
                    Khái niệm ({mockConcepts.length})
                  </h3>
                  <div className="space-y-2">
                    {mockConcepts.map((concept) => (
                      <div
                        key={concept.id}
                        className="p-3 bg-white rounded border border-border text-sm hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-text-primary font-medium">
                            {concept.name}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            {concept.difficulty}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex gap-3 justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="gap-2"
                >
                  <span>←</span> Làm lại
                </Button>
                <Button
                  onClick={handleConfirmPlan}
                  className="gap-2"
                >
                  Xác nhận & Tạo kế hoạch
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
