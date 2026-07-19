import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { X, Star, Mic, BookOpen } from 'lucide-react'
import { getMasteryClass } from '@/types'
import type { Concept } from '@/types'
import '@/styles/concept-graph.css'
import { usePlanStore } from '@/stores/planStore'

// ─── Shared Mock Data ───────────────────────────────────────────
export const mockConcepts: Concept[] = [
  { id: '1', name: 'Async/Await', mastery: 0.85, difficulty: 4, prerequisites: ['2', '4'] },
  { id: '2', name: 'Promises', mastery: 0.70, difficulty: 3, prerequisites: ['4'] },
  { id: '3', name: 'Callbacks', mastery: 0.45, difficulty: 2, prerequisites: [] },
  { id: '4', name: 'Event Loop', mastery: null, difficulty: 5, prerequisites: [] },
  { id: '5', name: 'Scope', mastery: 0.90, difficulty: 2, prerequisites: [] },
  { id: '6', name: 'Closures', mastery: 0.60, difficulty: 3, prerequisites: ['5'] },
  { id: '7', name: 'Functions', mastery: 0.95, difficulty: 1, prerequisites: [] },
  { id: '8', name: 'Destructuring', mastery: 0.30, difficulty: 2, prerequisites: ['5'], isRemediating: true },
]

export const nodePositions: Record<string, { x: number; y: number }> = {
  '1': { x: 250, y: 0 },
  '2': { x: 100, y: 130 },
  '3': { x: -50, y: 260 },
  '4': { x: 400, y: 130 },
  '5': { x: 250, y: 300 },
  '6': { x: 100, y: 430 },
  '7': { x: 400, y: 300 },
  '8': { x: 400, y: 430 },
}

// Mastery history for sparkline (last 5 sessions)
const masteryHistory: Record<string, number[]> = {
  '1': [0.55, 0.62, 0.70, 0.78, 0.85],
  '2': [0.40, 0.50, 0.58, 0.65, 0.70],
  '3': [0.20, 0.30, 0.35, 0.40, 0.45],
  '4': [],
  '5': [0.60, 0.72, 0.80, 0.85, 0.90],
  '6': [0.30, 0.40, 0.48, 0.55, 0.60],
  '7': [0.80, 0.85, 0.90, 0.92, 0.95],
  '8': [0.50, 0.45, 0.40, 0.35, 0.30],
}

// ─── Helpers ────────────────────────────────────────────────────
const getMasteryColor = (mastery: number | null): string => {
  if (mastery === null) return '#9CA3AF'
  if (mastery < 0.6) return '#EF4444'
  if (mastery < 0.8) return '#F59E0B'
  return '#10B981'
}

const getMasteryLabel = (mastery: number | null): string => {
  if (mastery === null) return 'Chưa ôn'
  if (mastery < 0.6) return 'Yếu'
  if (mastery < 0.8) return 'Trung bình'
  return 'Vững'
}

type FilterType = 'all' | 'untested' | 'weak' | 'learning' | 'strong'

const filterLabels: Record<FilterType, string> = {
  all: 'Tất cả',
  untested: 'Chưa ôn',
  weak: 'Yếu',
  learning: 'Trung bình',
  strong: 'Vững',
}

// ─── Custom Node ────────────────────────────────────────────────
function ConceptNodeFull({ data }: NodeProps) {
  const nodeClass = getMasteryClass(data.mastery, data.isRemediating)
  const dimClass = data.dimmed ? ' concept-node--dimmed' : ''

  return (
    <div className={`concept-node ${nodeClass}${dimClass}`}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 8, height: 8 }} />
      <div className="concept-node__name">{data.label}</div>
      <div className="concept-node__mastery">
        {data.mastery !== null ? `${Math.round(data.mastery * 100)}%` : 'Chưa ôn'}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 8, height: 8 }} />
    </div>
  )
}

const nodeTypes = { concept: ConceptNodeFull }

// ─── Edge Builder ───────────────────────────────────────────────
function buildEdges(concepts: Concept[]): Edge[] {
  const edges: Edge[] = []
  const conceptMap = new Map(concepts.map(c => [c.id, c]))

  for (const concept of concepts) {
    for (const prereqId of concept.prerequisites) {
      const prereq = conceptMap.get(prereqId)
      const isSourceWeak = prereq && prereq.mastery !== null && prereq.mastery < 0.6

      edges.push({
        id: `e${prereqId}-${concept.id}`,
        source: prereqId,
        target: concept.id,
        animated: false,
        className: isSourceWeak ? 'react-flow__edge--prerequisite-weak' : '',
        style: isSourceWeak ? undefined : { stroke: '#9CA3AF', strokeWidth: 2 },
      })
    }
  }
  return edges
}

// ═══════════════════════════════════════════════════════════════
// ConceptGraphFull (DB-02 Full Page)
// ═══════════════════════════════════════════════════════════════
interface ConceptGraphFullProps {
  planId?: string
}

export default function ConceptGraphFull({ planId = 'plan-1' }: ConceptGraphFullProps) {
  const navigate = useNavigate()
  const { concepts } = usePlanStore()

  const activeConcepts = concepts[planId] || mockConcepts

  // ─── State ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null)

  // Build initial nodes
  const createNodes = useCallback((conceptsList: Concept[]): Node[] => {
    return conceptsList.map(concept => ({
      id: concept.id,
      type: 'concept',
      data: {
        label: concept.name,
        mastery: concept.mastery,
        isRemediating: concept.isRemediating,
        dimmed: false,
      },
      position: nodePositions[concept.id] || { 
        x: 100 + Math.random() * 200, 
        y: 100 + Math.random() * 200 
      },
    }))
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    setNodes(createNodes(activeConcepts))
    setEdges(buildEdges(activeConcepts))
  }, [activeConcepts, createNodes, setNodes, setEdges])

  // ─── Filter / Search Logic ──────────────────────────────────
  const matchesFilter = useCallback((concept: Concept): boolean => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'untested') return concept.mastery === null
    if (activeFilter === 'weak') return concept.mastery !== null && concept.mastery < 0.6
    if (activeFilter === 'learning') return concept.mastery !== null && concept.mastery >= 0.6 && concept.mastery < 0.8
    if (activeFilter === 'strong') return concept.mastery !== null && concept.mastery >= 0.8
    return true
  }, [activeFilter])

  const matchesSearch = useCallback((name: string): boolean => {
    if (!searchQuery.trim()) return true
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  }, [searchQuery])

  // Apply filter + search → dim non-matching nodes
  const applyFilters = useCallback(() => {
    setNodes(prev => prev.map(node => {
      const concept = activeConcepts.find(c => c.id === node.id)
      if (!concept) return node
      const isMatch = matchesFilter(concept) && matchesSearch(concept.name)
      return {
        ...node,
        data: { ...node.data, dimmed: !isMatch },
      }
    }))
  }, [matchesFilter, matchesSearch, activeConcepts, setNodes])

  // Re-apply whenever filter or search changes
  useMemo(() => {
    applyFilters()
  }, [applyFilters])

  const handleClearFilters = () => {
    setSearchQuery('')
    setActiveFilter('all')
  }

  // ─── Node Click ─────────────────────────────────────────────
  const handleNodeClick = useCallback((_event: any, node: Node) => {
    setSelectedConceptId(node.id)
  }, [])

  const selectedConcept = selectedConceptId
    ? activeConcepts.find(c => c.id === selectedConceptId)
    : null

  // Find dependents (concepts that have this as a prerequisite)
  const dependents = selectedConcept
    ? activeConcepts.filter(c => c.prerequisites.includes(selectedConcept.id))
    : []

  const hasActiveFilters = searchQuery.trim() !== '' || activeFilter !== 'all'

  return (
    <div className="flex flex-col h-full">
      {/* ─── FILTER BAR (DB-05) ─── */}
      <div className="cg-filter-bar">
        <input
          type="text"
          placeholder="Tìm khái niệm..."
          className="cg-filter-bar__search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex items-center gap-1.5 flex-wrap">
          {(Object.keys(filterLabels) as FilterType[]).map(key => (
            <button
              key={key}
              className={`cg-filter-bar__chip ${activeFilter === key ? 'cg-filter-bar__chip--active' : ''}`}
              onClick={() => setActiveFilter(key)}
            >
              {filterLabels[key]}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button className="cg-filter-bar__clear" onClick={handleClearFilters}>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* ─── GRAPH CANVAS ─── */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          nodesDraggable={false}
          nodesConnectable={false}
          edgesFocusable={false}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
        >
          <Background />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => getMasteryColor(node.data?.mastery)}
            style={{ borderRadius: 8 }}
          />
        </ReactFlow>

        {/* ─── LEGEND ─── */}
        <div className="graph-legend">
          <div className="graph-legend__title">Độ vững</div>
          {[
            { color: '#9CA3AF', label: 'Chưa ôn' },
            { color: '#EF4444', label: 'Yếu (< 60%)' },
            { color: '#F59E0B', label: 'Trung bình (60–80%)' },
            { color: '#10B981', label: 'Vững (≥ 80%)' },
          ].map(item => (
            <div key={item.color} className="graph-legend__item">
              <div className="graph-legend__dot" style={{ background: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* ─── CONCEPT DETAIL PANEL (DB-06) ─── */}
        <div className={`cg-detail-panel ${selectedConcept ? 'cg-detail-panel--open' : ''}`}>
          {selectedConcept && (
            <>
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <span className="cg-detail-panel__section-label" style={{ marginTop: 0 }}>
                  Chi tiết khái niệm
                </span>
                <button
                  onClick={() => setSelectedConceptId(null)}
                  className="cg-detail-panel__close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Concept Name */}
              <div className="cg-detail-panel__name">{selectedConcept.name}</div>

              {/* Mastery Badge */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-4"
                style={{ background: getMasteryColor(selectedConcept.mastery), color: '#fff' }}
              >
                {selectedConcept.mastery !== null
                  ? `${Math.round(selectedConcept.mastery * 100)}% — ${getMasteryLabel(selectedConcept.mastery)}`
                  : getMasteryLabel(selectedConcept.mastery)}
              </div>

              {/* Difficulty */}
              <div className="cg-detail-panel__section-label">Độ khó</div>
              <div className="flex gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < selectedConcept.difficulty
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-600'
                    }
                  />
                ))}
              </div>

              {/* Mastery History Sparkline */}
              <div className="cg-detail-panel__section-label">Lịch sử độ vững (5 phiên gần nhất)</div>
              {(masteryHistory[selectedConcept.id] || []).length > 0 ? (
                <div className="cg-sparkline">
                  {masteryHistory[selectedConcept.id].map((val, i) => (
                    <div
                      key={i}
                      className="cg-sparkline__bar"
                      style={{
                        height: `${val * 100}%`,
                        backgroundColor: getMasteryColor(val),
                      }}
                      title={`Phiên ${i + 1}: ${Math.round(val * 100)}%`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">Chưa có dữ liệu</p>
              )}

              {/* Prerequisites */}
              {selectedConcept.prerequisites.length > 0 && (
                <>
                  <div className="cg-detail-panel__section-label">Tiên quyết (Prerequisites)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedConcept.prerequisites.map(pid => {
                      const prereq = activeConcepts.find(c => c.id === pid)
                      if (!prereq) return null
                      return (
                        <button
                          key={pid}
                          className="cg-dep-chip"
                          onClick={() => setSelectedConceptId(pid)}
                        >
                          <div
                            className="cg-dep-chip__dot"
                            style={{ background: getMasteryColor(prereq.mastery) }}
                          />
                          → {prereq.name}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Dependents */}
              {dependents.length > 0 && (
                <>
                  <div className="cg-detail-panel__section-label">Phụ thuộc (Dependents)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {dependents.map(dep => (
                      <button
                        key={dep.id}
                        className="cg-dep-chip"
                        onClick={() => setSelectedConceptId(dep.id)}
                      >
                        <div
                          className="cg-dep-chip__dot"
                          style={{ background: getMasteryColor(dep.mastery) }}
                        />
                        ← {dep.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="mt-auto pt-6 space-y-2">
                <button
                  className="cg-panel-btn cg-panel-btn--interview"
                  onClick={() => navigate(`/interview/config?concept=${selectedConcept.id}`)}
                >
                  <Mic size={15} />
                  Interview khái niệm này
                </button>
                <button
                  className="cg-panel-btn cg-panel-btn--focus"
                  onClick={() => navigate(`/focus/${planId}?concept=${selectedConcept.id}`)}
                >
                  <BookOpen size={15} />
                  Focus Session
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
