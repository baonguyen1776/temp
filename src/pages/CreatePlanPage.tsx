import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  Connection,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, ZoomIn, ZoomOut, Maximize2, Plus, Trash2, Edit } from 'lucide-react'
import { usePlanStore } from '@/stores/planStore'
import { useTranslation } from '@/stores/languageStore'
import { StudyPlan } from '@/models/StudyPlan'
import { Concept } from '@/types'

type Step = 1 | 2 | 3

interface FormData {
  planName: string
  deadline: string
  file: File | null
  fileText: string
}

const initialConcepts: Concept[] = [
  { id: '1', name: 'Functions', difficulty: 2, prerequisites: [], mastery: null },
  { id: '2', name: 'Async/Await', difficulty: 4, prerequisites: ['1'], mastery: null },
  { id: '3', name: 'Closures', difficulty: 4, prerequisites: ['1'], mastery: null },
  { id: '4', name: 'Callbacks', difficulty: 3, prerequisites: ['1'], mastery: null },
  { id: '5', name: 'Promises', difficulty: 3, prerequisites: ['4'], mastery: null },
  { id: '6', name: 'Event Loop', difficulty: 5, prerequisites: ['5'], mastery: null },
  { id: '7', name: 'Scope', difficulty: 2, prerequisites: [], mastery: null },
]

const initialNodes: Node[] = initialConcepts.map((concept, idx) => ({
  id: concept.id,
  data: { label: concept.name, difficulty: concept.difficulty },
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
  { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-3', source: '1', target: '3', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e1-4', source: '1', target: '4', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4-5', source: '4', target: '5', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5-6', source: '5', target: '6', markerEnd: { type: MarkerType.ArrowClosed } },
]

function hasCycle(nodes: Node[], edges: Edge[]): boolean {
  const adj: Record<string, string[]> = {}
  const inDegree: Record<string, number> = {}

  nodes.forEach((n) => {
    adj[n.id] = []
    inDegree[n.id] = 0
  })

  edges.forEach((e) => {
    if (adj[e.source] !== undefined && adj[e.target] !== undefined) {
      adj[e.source].push(e.target)
      inDegree[e.target] = (inDegree[e.target] || 0) + 1
    }
  })

  const queue: string[] = []
  nodes.forEach((n) => {
    if (inDegree[n.id] === 0) {
      queue.push(n.id)
    }
  })

  let count = 0
  while (queue.length > 0) {
    const u = queue.shift()!
    count++
    const neighbors = adj[u] || []
    neighbors.forEach((v) => {
      inDegree[v]--
      if (inDegree[v] === 0) {
        queue.push(v)
      }
    })
  }

  return count !== nodes.length
}

// Sub-component to use useReactFlow
function GraphEditor({
  concepts,
  setConcepts,
  nodes,
  setNodes,
  onNodesChange,
  edges,
  onEdgesChange,
  onConfirmPlan,
  setStep,
}: {
  concepts: Concept[]
  setConcepts: React.Dispatch<React.SetStateAction<Concept[]>>
  nodes: Node[]
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>
  onNodesChange: any
  edges: Edge[]
  onEdgesChange: any
  onConfirmPlan: () => void
  setStep: (step: Step) => void
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { lang } = useTranslation()
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)
  
  const selectedConcept = concepts.find(c => c.id === selectedConceptId)

  // ReactFlow Connect edge handler
  const onConnect = (connection: Connection) => {
    const source = connection.source as string
    const target = connection.target as string
    if (!source || !target || source === target) return

    const newEdgeId = `e${source}-${target}`
    const tempEdges: Edge[] = [...edges, { id: newEdgeId, source, target, markerEnd: { type: MarkerType.ArrowClosed } }]

    if (hasCycle(nodes, tempEdges)) {
      alert(lang === 'vi' ? 'Không thể thêm liên kết tiên quyết này vì sẽ tạo ra chu trình vòng lặp (Cycle)!' : 'Cannot add this prerequisite connection as it would create a cyclic dependency!')
      return
    }

    setConcepts((prev) =>
      prev.map((c) =>
        c.id === target
          ? { ...c, prerequisites: Array.from(new Set([...c.prerequisites, source])) }
          : c
      )
    )
  }

  const onEdgeClick = (_event: any, edge: Edge) => {
    const sourceNodeName = nodes.find(n => n.id === edge.source)?.data.label || edge.source
    const targetNodeName = nodes.find(n => n.id === edge.target)?.data.label || edge.target
    if (window.confirm(lang === 'vi' ? `Xóa quan hệ tiên quyết: ${sourceNodeName} → ${targetNodeName}?` : `Delete prerequisite relationship: ${sourceNodeName} → ${targetNodeName}?`)) {
      setConcepts((prev) =>
        prev.map((c) =>
          c.id === edge.target
            ? { ...c, prerequisites: c.prerequisites.filter((pId) => pId !== edge.source) }
            : c
        )
      )
    }
  }

  const handleAddConcept = () => {
    const newId = `concept-${Date.now()}`
    const newConcept: Concept = {
      id: newId,
      name: lang === 'vi' ? 'Khái niệm mới' : 'New Concept',
      difficulty: 3,
      prerequisites: [],
      mastery: null,
    }
    setConcepts((prev) => [...prev, newConcept])
    setNodes((prev) => [
      ...prev,
      {
        id: newId,
        data: { label: newConcept.name, difficulty: newConcept.difficulty },
        position: { x: 150 + Math.random() * 100, y: 150 + Math.random() * 100 },
        style: {
          background: '#8B5CF6',
          color: '#fff',
          border: '2px solid #6D28D9',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '13px',
          fontWeight: '500',
        },
      },
    ])
    setSelectedConceptId(newId)
  }

  const handleDeleteConcept = (conceptId: string) => {
    if (window.confirm(lang === 'vi' ? 'Bạn có chắc chắn muốn xóa khái niệm này khỏi đồ thị?' : 'Are you sure you want to delete this concept from the graph?')) {
      setConcepts((prev) =>
        prev
          .filter((c) => c.id !== conceptId)
          .map((c) => ({
            ...c,
            prerequisites: c.prerequisites.filter((pId) => pId !== conceptId),
          }))
      )
      setNodes((prev) => prev.filter((n) => n.id !== conceptId))
      setSelectedConceptId(null)
    }
  }

  const handleUpdateConceptName = (name: string) => {
    setConcepts((prev) =>
      prev.map((c) => (c.id === selectedConceptId ? { ...c, name } : c))
    )
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedConceptId
          ? { ...n, data: { ...n.data, label: name } }
          : n
      )
    )
  }

  const handleUpdateConceptDifficulty = (difficulty: number) => {
    setConcepts((prev) =>
      prev.map((c) => (c.id === selectedConceptId ? { ...c, difficulty } : c))
    )
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedConceptId
          ? { ...n, data: { ...n.data, difficulty } }
          : n
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center bg-surface p-3 rounded-lg border border-border flex-wrap gap-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => zoomIn()}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => zoomOut()}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => fitView()}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        
        <Button onClick={handleAddConcept} size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus size={14} /> {lang === 'vi' ? 'Thêm khái niệm' : 'Add Concept'}
        </Button>
      </div>

      {/* Instruction Banner */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-text-primary">
        {lang === 'vi' ? (
          <>👉 <b>Mẹo chỉnh sửa:</b> Kéo từ viền node A đến node B để thêm quan hệ (A tiên quyết của B). Click chọn cạnh nối để XÓA liên kết. Click node để đổi tên/độ khó.</>
        ) : (
          <>👉 <b>Edit Tip:</b> Drag from boundary of node A to B to add a prerequisite link (A is prereq of B). Click a connection edge to DELETE it. Click a node to rename/set difficulty.</>
        )}
      </div>

      {/* Graph with Sidebar */}
      <div className="flex flex-col md:flex-row gap-4 bg-card rounded-lg border border-border overflow-hidden" style={{ height: '550px' }}>
        {/* Flow Graph */}
        <div className="flex-1 relative bg-background h-87.5 md:h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            onNodeClick={(_e, node) => setSelectedConceptId(node.id)}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        {/* Dynamic Sidebar */}
        <div className="w-full md:w-72 border-t md:border-t-0 md:border-l border-border bg-surface overflow-y-auto p-4 flex flex-col">
          {selectedConcept ? (
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                  <Edit size={14} /> {lang === 'vi' ? 'Sửa khái niệm' : 'Edit Concept'}
                </h3>
                <button onClick={() => setSelectedConceptId(null)} className="text-text-light hover:text-text-primary">
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">{lang === 'vi' ? 'Tên khái niệm' : 'Concept Name'}</label>
                <Input
                  type="text"
                  value={selectedConcept.name}
                  onChange={(e) => handleUpdateConceptName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">{lang === 'vi' ? 'Độ khó (1-5)' : 'Difficulty (1-5)'}</label>
                <select
                  value={selectedConcept.difficulty}
                  onChange={(e) => handleUpdateConceptDifficulty(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[1, 2, 3, 4, 5].map(d => (
                    <option key={d} value={d}>{d}/5</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">{lang === 'vi' ? 'Quan hệ tiên quyết trực tiếp' : 'Direct Prerequisites'}</label>
                <div className="max-h-36 overflow-y-auto border border-border rounded bg-background p-2.5 space-y-1.5">
                  {concepts
                    .filter(c => c.id !== selectedConceptId)
                    .map(c => {
                      const isPrereq = selectedConcept.prerequisites.includes(c.id)
                      return (
                        <label key={c.id} className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                          <input
                             type="checkbox"
                             checked={isPrereq}
                             onChange={(e) => {
                               const checked = e.target.checked
                               if (checked) {
                                 // Add prereq with DAG validation
                                 const targetId = selectedConceptId as string
                                 const tempEdges: Edge[] = [...edges, { id: `e${c.id}-${targetId}`, source: c.id, target: targetId }]
                                 if (hasCycle(nodes, tempEdges)) {
                                   alert(lang === 'vi' ? 'Không thể thêm liên kết này vì tạo thành chu trình vòng lặp!' : 'Cannot add this dependency as it would create a circular dependency!')
                                   return
                                 }
                                 setConcepts(prev => prev.map(item => 
                                   item.id === selectedConceptId 
                                     ? { ...item, prerequisites: [...item.prerequisites, c.id] } 
                                     : item
                                 ))
                               } else {
                                 // Remove prereq
                                 setConcepts(prev => prev.map(item => 
                                   item.id === selectedConceptId 
                                     ? { ...item, prerequisites: item.prerequisites.filter(pId => pId !== c.id) } 
                                     : item
                                 ))
                               }
                             }}
                             className="w-3.5 h-3.5 rounded text-primary"
                          />
                          <span>{c.name}</span>
                        </label>
                      )
                    })}
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-auto">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full gap-1.5"
                  onClick={() => handleDeleteConcept(selectedConcept.id)}
                >
                  <Trash2 size={14} /> {lang === 'vi' ? 'Xóa khái niệm' : 'Delete Concept'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold text-text-primary mb-3 text-sm">
                {lang === 'vi' ? `Danh sách khái niệm (${concepts.length})` : `Concept List (${concepts.length})`}
              </h3>
              <div className="space-y-2 overflow-y-auto flex-1 max-h-95 pr-1">
                {concepts.map((concept) => (
                  <div
                    key={concept.id}
                    onClick={() => setSelectedConceptId(concept.id)}
                    className="p-3 bg-card rounded border border-border text-sm hover:shadow-sm transition-shadow cursor-pointer hover:border-primary/60 flex items-center justify-between"
                  >
                    <span className="text-text-primary font-medium truncate mr-2">
                      {concept.name}
                    </span>
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-semibold shrink-0">
                      {lang === 'vi' ? `Độ khó: ${concept.difficulty}/5` : `Difficulty: ${concept.difficulty}/5`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex gap-3 justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="gap-2"
        >
          <span>←</span> {lang === 'vi' ? 'Làm lại' : 'Redo'}
        </Button>
        <Button
          onClick={onConfirmPlan}
          className="gap-2"
        >
          {lang === 'vi' ? 'Xác nhận & Tạo kế hoạch' : 'Confirm & Create Plan'}
        </Button>
      </div>
    </div>
  )
}

export default function CreatePlanPage() {
  const navigate = useNavigate()
  const { lang } = useTranslation()
  const { addPlan } = usePlanStore()
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
  const [progressMessage, setProgressMessage] = useState(lang === 'vi' ? 'Đang đọc tài liệu...' : 'Reading document...')
  const [concepts, setConcepts] = useState<Concept[]>(initialConcepts)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const messages = lang === 'vi' ? [
    'Đang đọc tài liệu...',
    'Đang trích xuất khái niệm...',
    'Đang xây dựng đồ thị...',
    'Đang tạo lịch ôn tập...',
  ] : [
    'Reading document...',
    'Extracting concepts...',
    'Building concept graph...',
    'Generating review schedule...',
  ]

  // Synchronize edges when concepts prerequisite arrays change
  useEffect(() => {
    const newEdges: Edge[] = []
    concepts.forEach((c) => {
      (c.prerequisites || []).forEach((pId) => {
        newEdges.push({
          id: `e${pId}-${c.id}`,
          source: pId,
          target: c.id,
          markerEnd: { type: MarkerType.ArrowClosed },
        })
      })
    })
    setEdges(newEdges)
  }, [concepts, setEdges])

  // Progress message cycling
  useEffect(() => {
    if (step === 2) {
      let messageIndex = 0
      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length
        setProgressMessage(messages[messageIndex])
      }, 700)

      // Auto-advance after 2.5 seconds
      const timer = setTimeout(() => {
        setStep(3)
      }, 2500)

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
    const planId = `plan-${Date.now()}`
    const newPlan = new StudyPlan({
      id: planId,
      name: formData.planName,
      deadline: formData.deadline,
      status: 'active',
      progress: 0,
      conceptCount: concepts.length,
    })
    addPlan(newPlan, concepts)
    navigate(`/plans/${planId}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Step Indicator */}
      <div className="border-b border-border bg-card px-6 py-4">
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
                  {s === 1 ? (lang === 'vi' ? 'Thông tin' : 'Info') : s === 2 ? (lang === 'vi' ? 'Xử lý' : 'Process') : (lang === 'vi' ? 'Kiểm tra' : 'Verify')}
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
                  {lang === 'vi' ? 'Tên kế hoạch' : 'Plan Name'}
                </label>
                <Input
                  type="text"
                  placeholder={lang === 'vi' ? 'Giải tích 1 — Cuối kỳ' : 'Calculus 1 — Final Exam'}
                  value={formData.planName}
                  onChange={(e) =>
                    setFormData({ ...formData, planName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {lang === 'vi' ? 'Deadline ôn tập' : 'Review Deadline'}
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
                        : 'bg-muted text-text-secondary hover:bg-muted/80'
                    }`}
                  >
                    {lang === 'vi' ? 'Tải file' : 'Upload File'}
                  </button>
                  <button
                    onClick={() => setUploadMode('text')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      uploadMode === 'text'
                        ? 'bg-primary text-white'
                        : 'bg-muted text-text-secondary hover:bg-muted/80'
                    }`}
                  >
                    {lang === 'vi' ? 'Dán văn bản' : 'Paste Text'}
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
                        ? 'border-primary bg-primary/10'
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
                        <p className="text-text-secondary">{lang === 'vi' ? 'Kéo thả file PDF vào đây' : 'Drag & drop PDF file here'}</p>
                        <p className="text-text-light text-sm">{lang === 'vi' ? 'hoặc' : 'or'}</p>
                        <label className="inline-block">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.png,.txt"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <span className="px-4 py-2 bg-primary text-white rounded cursor-pointer hover:bg-primary/90 transition-colors inline-block text-sm font-medium">
                            {lang === 'vi' ? 'Chọn file' : 'Select File'}
                          </span>
                        </label>
                        <p className="text-xs text-text-light">
                          {lang === 'vi' ? 'Chấp nhận: .pdf, .jpg, .png, .txt (tối đa 20MB)' : 'Accepted: .pdf, .jpg, .png, .txt (max 20MB)'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    placeholder={lang === 'vi' ? 'Dán văn bản của bạn ở đây...' : 'Paste your text here...'}
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
                  {lang === 'vi' ? 'Phân tích tài liệu' : 'Analyze Document'} <span>→</span>
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
                {lang === 'vi' ? 'Bạn có thể đóng và quay lại sau' : 'You can close this and return later'}
              </p>
            </div>
          )}

          {/* Step 3: Graph Preview (Wrapped in ReactFlowProvider) */}
          {step === 3 && (
            <ReactFlowProvider>
              <GraphEditor
                concepts={concepts}
                setConcepts={setConcepts}
                nodes={nodes}
                setNodes={setNodes}
                onNodesChange={onNodesChange}
                edges={edges}
                onEdgesChange={onEdgesChange}
                onConfirmPlan={handleConfirmPlan}
                setStep={setStep}
              />
            </ReactFlowProvider>
          )}
        </div>
      </div>
    </div>
  )
}
