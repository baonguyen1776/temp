import { useState, useCallback, useRef, useEffect } from 'react'
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
import { nodePositions } from '@/components/ConceptGraphFull'
import { usePlanStore } from '@/stores/planStore'
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

// ═══════════════════════════════════════════════════════════════
// ConceptGraphMini (DB-01 Mini / Dashboard embed)
// ═══════════════════════════════════════════════════════════════
interface ConceptGraphMiniProps {
  height?: number
  planId?: string
}

export default function ConceptGraphMini({ height = 280, planId }: ConceptGraphMiniProps) {
  const { concepts, activePlan } = usePlanStore()
  const currentPlanId = planId || activePlan?.id || 'plan-1'
  const activeConcepts = concepts[currentPlanId] || []

  // ─── Tooltip State ──────────────────────────────────────────
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    name: string
    mastery: number | null
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])

  useEffect(() => {
    const formattedNodes: Node[] = activeConcepts.map(concept => ({
      id: concept.id,
      type: 'concept',
      data: {
        label: concept.name,
        mastery: concept.mastery,
        isRemediating: concept.isRemediating,
      },
      position: nodePositions[concept.id] || { x: Math.random() * 200, y: Math.random() * 200 },
    }))

    const formattedEdges: Edge[] = []
    for (const concept of activeConcepts) {
      for (const prereqId of concept.prerequisites) {
        formattedEdges.push({
          id: `e${prereqId}-${concept.id}`,
          source: prereqId,
          target: concept.id,
          animated: false,
          style: { stroke: '#D1D5DB', strokeWidth: 1.5 },
        })
      }
    }

    setNodes(formattedNodes)
    setEdges(formattedEdges)
  }, [activeConcepts, setNodes, setEdges])

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
