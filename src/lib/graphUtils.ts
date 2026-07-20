import { Node, Edge, MarkerType } from 'reactflow'
import type { Concept } from '@/types'

/**
 * Calculates a hierarchical left-to-right layout for concepts based on their prerequisites.
 */
export function getLayoutedElements(
  concepts: Concept[],
  isMini = false
): { nodes: Node[]; edges: Edge[] } {
  const levels: Record<string, number> = {}
  const conceptMap = new Map(concepts.map(c => [c.id, c]))

  // Helper to calculate max depth/level of a node topologically
  function getLevel(id: string, visited = new Set<string>()): number {
    if (levels[id] !== undefined) return levels[id]
    if (visited.has(id)) return 0 // Prevent cycle loops
    visited.add(id)

    const concept = conceptMap.get(id)
    if (!concept || concept.prerequisites.length === 0) {
      levels[id] = 0
      return 0
    }

    let maxPrereqLevel = -1
    for (const prereqId of concept.prerequisites) {
      maxPrereqLevel = Math.max(maxPrereqLevel, getLevel(prereqId, visited))
    }
    levels[id] = maxPrereqLevel + 1
    return levels[id]
  }

  // Calculate level for all concepts
  for (const concept of concepts) {
    getLevel(concept.id)
  }

  // Group node IDs by their level
  const levelGroups: Record<number, string[]> = {}
  for (const concept of concepts) {
    const lvl = levels[concept.id] || 0
    if (!levelGroups[lvl]) {
      levelGroups[lvl] = []
    }
    levelGroups[lvl].push(concept.id)
  }

  // Layout spacing config
  const horizontalSpacing = isMini ? 180 : 300
  const verticalSpacing = isMini ? 80 : 130

  const positions: Record<string, { x: number; y: number }> = {}
  const levelKeys = Object.keys(levelGroups).map(Number).sort((a, b) => a - b)

  for (const lvl of levelKeys) {
    const ids = levelGroups[lvl]
    const count = ids.length
    const x = lvl * horizontalSpacing

    ids.forEach((id, index) => {
      // Center the vertical column
      const y = (index - (count - 1) / 2) * verticalSpacing
      positions[id] = { x, y }
    })
  }

  // Create React Flow Nodes
  const nodes: Node[] = concepts.map(concept => {
    const pos = positions[concept.id] || { x: 0, y: 0 }
    return {
      id: concept.id,
      type: 'concept',
      data: {
        label: concept.name,
        mastery: concept.mastery,
        isRemediating: concept.isRemediating,
        dimmed: false,
      },
      position: pos,
    }
  })

  // Create React Flow Edges
  const edges: Edge[] = []
  for (const concept of concepts) {
    for (const prereqId of concept.prerequisites) {
      const prereq = conceptMap.get(prereqId)
      // Warning if prerequisite is unreviewed (null) or weak (< 0.6)
      const isSourceWeak = prereq && (prereq.mastery === null || prereq.mastery < 0.6)
      const edgeColor = isMini ? '#4B5563' : '#111827' // Dark/bold black/grey colors for all edges

      edges.push({
        id: `e${prereqId}-${concept.id}`,
        source: prereqId,
        target: concept.id,
        type: 'smoothstep',
        pathOptions: { borderRadius: 10 },
        animated: false,
        className: isSourceWeak ? 'react-flow__edge--prerequisite-weak' : '',
        style: {
          stroke: edgeColor,
          strokeWidth: isMini ? 1.5 : 2.5
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: isMini ? 10 : 14,
          height: isMini ? 10 : 14,
          color: edgeColor, // Match arrowhead color to line color
        }
      })
    }
  }

  return { nodes, edges }
}
