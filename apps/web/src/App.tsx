import { useEffect } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useCanvasStore } from './store/canvasStore'
import { useUIStore } from './store/uiStore'
import { useThemeStore, applyTheme } from './store/themeStore'
import { useProjectStore } from './store/projectStore'
import { ProjectSidebar } from './components/ProjectSidebar'
import { ComponentsPalette } from './components/ComponentsPalette'
import { PromptBar } from './components/PromptBar'
import { Toolbar } from './components/Toolbar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { ThemePicker } from './components/ThemePicker'
import { AlternativesOverlay } from './components/AlternativesOverlay'
import { nodeTypes } from './components/nodes'
import { useKeyboard } from './hooks/useKeyboard'

export default function App() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, alternatives, activeAlternativeIndex, previewMode, setCanvas } = useCanvasStore()
    const activeTheme = useThemeStore((s) => s.activeTheme)
    useKeyboard()

    // On first mount: load the last active project's canvas into the store
    useEffect(() => {
        const { activeProjectId, projects } = useProjectStore.getState()
        const project = projects.find((p) => p.id === activeProjectId)
        if (project && project.nodes.length > 0) {
            setCanvas(project.nodes, project.edges, project.checkpoints)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Auto-save canvas to project store every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const { nodes, edges, checkpoints } = useCanvasStore.getState()
            useProjectStore.getState().saveCurrentProject(nodes, edges, checkpoints)
        }, 10_000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        applyTheme(activeTheme)
    }, [activeTheme])

    // Mix base nodes and ghost nodes
    const displayNodes = previewMode && activeAlternativeIndex !== null && alternatives[activeAlternativeIndex]
        ? [...nodes, ...alternatives[activeAlternativeIndex].nodes]
        : nodes;

    const displayEdges = previewMode && activeAlternativeIndex !== null && alternatives[activeAlternativeIndex]
        ? [...edges, ...alternatives[activeAlternativeIndex].edges]
        : edges;

    return (
        <div className="flex h-screen w-screen bg-surface-base font-sans">
            <ProjectSidebar />

            <div className="flex-1 h-full relative">
                <PropertiesPanel />
                <AlternativesOverlay />

                <ReactFlow
                    nodes={displayNodes}
                    edges={displayEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.5 }}
                    proOptions={{ hideAttribution: true }}
                    className="bg-surface-base"
                    onPaneClick={() => useUIStore.getState().closePanel()}
                    defaultEdgeOptions={{
                        style: { stroke: 'var(--surface-hover)', strokeWidth: 1.5 },
                        type: 'smoothstep',
                        animated: true,
                    }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--surface-border)" />
                    <Controls showInteractive={false} />
                    <MiniMap
                        nodeColor={(node) => {
                            switch (node.type) {
                                case 'service': return '#685AFF'
                                case 'database': return '#44A194'
                                case 'cache': return '#FF4400'
                                case 'gateway': return '#44A194'
                                default: return 'var(--surface-hover)'
                            }
                        }}
                        maskColor="rgba(12, 12, 14, 0.75)"
                        style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--surface-border)', borderRadius: 8 }}
                        pannable zoomable
                    />
                </ReactFlow>

                <ComponentsPalette />
                <Toolbar />
                <PromptBar />
                <ThemePicker />
            </div>
        </div>
    )
}
