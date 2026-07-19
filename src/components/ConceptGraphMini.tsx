import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Handle,
  Position,
  NodeProps,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { getMasteryClass } from '@/types'
import { mockConcepts, nodePositions } from '@/components/ConceptGraphFull'
import '@/styles/concept-graph.css'

// ─── Helpers ────────────────────────────────────────────────────
const getMasteryLabel = (mastery: number | null): string => {
  if (mastery === null) return 'Chưa ôn'
  if (mastery < 0.6) return 'Yếu'
  if (mastery < 0.8) return 'Trung bình'
  return 'Vững'
}

// ─── Custom Mini Node ───────────────────────────────────────────
function ConceptNodeMini({ data }: NodeProps) {
  const nodeClass = getMasteryClass(data.mastery, data.isRemediating)

  return (
    <div className={`concept-node ${nodeClass}`} style={{ minWidth: 90, padding: '0.4rem 0.625rem' }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 6, height: 6 }} />
      <div className="concept-node__name" style={{ fontSize: '0.625rem', maxWidth: 80 }}>{data.label}</div>
      <div className="concept-node__mastery" style={{ fontSize: '0.5rem' }}>
        {data.mastery !== null ? `${Math.round(data.mastery * 100)}%` : 'Chưa ôn'}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 6, height: 6 }} />
    </div>
  )
}

const nodeTypes = { concept: ConceptNodeMini }

// ─── Edge Builder ───────────────────────────────────────────────
function buildEdges(): Edge[] {
  const edges: Edge[] = []
  for (const concept of mockConcepts) {
    for (const prereqId of concept.prerequisites) {
      edges.push({
        id: `e${prereqId}-${concept.id}`,
        source: prereqId,
        target: concept.id,
        animated: false,
        style: { stroke: '#D1D5DB', strokeWidth: 1.5 },
      })
    }
  }
  return edges
}

// ═══════════════════════════════════════════════════════════════
// ConceptGraphMini (DB-01 Mini / Dashboard embed)
// ═══════════════════════════════════════════════════════════════
interface ConceptGraphMiniProps {
  height?: number
}

export default function ConceptGraphMini({ height = 280 }: ConceptGraphMiniProps) {
  // ─── Tooltip State ──────────────────────────────────────────
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    name: string
    mastery: number | null
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const initialNodes: Node[] = mockConcepts.map(concept => ({
    id: concept.id,
    type: 'concept',
    data: {
      label: concept.name,
      mastery: concept.mastery,
      isRemediating: concept.isRemediating,
    },
    position: nodePositions[concept.id] || { x: 0, y: 0 },
  }))

  const [nodes] = useNodesState(initialNodes)
  const [edges] = useEdgesState(buildEdges())

  const handleNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setTooltip({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      name: node.data.label,
      mastery: node.data.mastery,
    })
  }, [])

  const handleNodeMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  return (
    <div className="cg-mini-wrapper" ref={containerRef} style={{ height, position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
      >
        <Background gap={24} size={0.5} />
      </ReactFlow>

      {/* Hover Tooltip */}
      {tooltip && (
        <div
          className="cg-mini-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.name} • {tooltip.mastery !== null
            ? `${Math.round(tooltip.mastery * 100)}% — ${getMasteryLabel(tooltip.mastery)}`
            : getMasteryLabel(tooltip.mastery)}
        </div>
      )}
    </div>
  )
}
