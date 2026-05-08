import dagre from 'dagre'
import { type Node, type Edge } from '@xyflow/react'

export function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 120 })

    nodes.forEach((node) => {
        // Nodes are w-12 h-12 (48px x 48px)
        dagreGraph.setNode(node.id, { width: 48, height: 48 })
    })

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        
        // Dagre uses center point, React Flow uses top-left
        // Half of 48 is 24
        const x = nodeWithPosition.x - 24
        const y = nodeWithPosition.y - 24

        return { ...node, position: { x, y } }
    })

    return { nodes: layoutedNodes, edges }
}
