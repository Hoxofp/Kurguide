import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCanvasStore } from '../store/canvasStore'

// Reset the store before each test to ensure isolation
beforeEach(() => {
    const store = useCanvasStore.getState()
    store.setCanvas([], [], [])
    store.clearAlternatives()
})

describe('canvasStore - Node Management', () => {
    it('should start with an empty canvas after reset', () => {
        const { nodes, edges } = useCanvasStore.getState()
        expect(nodes).toHaveLength(0)
        expect(edges).toHaveLength(0)
    })

    it('should add a node correctly', () => {
        act(() => {
            useCanvasStore.getState().addNode({
                id: 'test-node-1',
                type: 'service',
                position: { x: 100, y: 100 },
                data: { label: 'Test Service', technologyId: 'express', port: '3000', envVars: '', notes: '', description: '' },
            })
        })

        const { nodes } = useCanvasStore.getState()
        expect(nodes).toHaveLength(1)
        expect(nodes[0]?.id).toBe('test-node-1')
        expect(nodes[0]?.data.label).toBe('Test Service')
    })

    it('should remove a node and its connected edges', () => {
        act(() => {
            const store = useCanvasStore.getState()
            store.setCanvas(
                [
                    { id: 'n1', type: 'service', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
                    { id: 'n2', type: 'database', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
                ],
                [{ id: 'e1-2', source: 'n1', target: 'n2' }],
                []
            )
        })

        act(() => {
            useCanvasStore.getState().removeNode('n1')
        })

        const { nodes, edges } = useCanvasStore.getState()
        expect(nodes).toHaveLength(1)
        expect(nodes[0]?.id).toBe('n2')
        expect(edges).toHaveLength(0) // Edge connecting n1 should be removed
    })

    it('should update node data without affecting other nodes', () => {
        act(() => {
            useCanvasStore.getState().setCanvas(
                [
                    { id: 'n1', type: 'service', position: { x: 0, y: 0 }, data: { label: 'Original' } },
                    { id: 'n2', type: 'database', position: { x: 0, y: 100 }, data: { label: 'Unchanged' } },
                ],
                [],
                []
            )
        })

        act(() => {
            useCanvasStore.getState().updateNodeData('n1', { label: 'Updated' })
        })

        const { nodes } = useCanvasStore.getState()
        const n1 = nodes.find(n => n.id === 'n1')
        const n2 = nodes.find(n => n.id === 'n2')
        expect(n1?.data.label).toBe('Updated')
        expect(n2?.data.label).toBe('Unchanged')
    })
})

describe('canvasStore - Checkpoints', () => {
    it('should save and restore a checkpoint', () => {
        act(() => {
            useCanvasStore.getState().setCanvas(
                [{ id: 'n1', type: 'service', position: { x: 0, y: 0 }, data: { label: 'Initial State' } }],
                [],
                []
            )
        })

        act(() => {
            useCanvasStore.getState().saveCheckpoint('Snapshot v1')
        })

        // Change the state
        act(() => {
            useCanvasStore.getState().addNode({
                id: 'n2', type: 'database', position: { x: 100, y: 100 }, data: { label: 'New Node' }
            })
        })

        expect(useCanvasStore.getState().nodes).toHaveLength(2)

        // Restore checkpoint
        act(() => {
            const { checkpoints } = useCanvasStore.getState()
            useCanvasStore.getState().restoreCheckpoint(checkpoints[0]!.id)
        })

        const { nodes } = useCanvasStore.getState()
        expect(nodes).toHaveLength(1)
        expect(nodes[0]?.data.label).toBe('Initial State')
    })

    it('should delete a checkpoint by id', () => {
        act(() => {
            useCanvasStore.getState().saveCheckpoint('To Be Deleted')
        })

        const { checkpoints: before } = useCanvasStore.getState()
        expect(before).toHaveLength(1)

        act(() => {
            useCanvasStore.getState().deleteCheckpoint(before[0]!.id)
        })

        const { checkpoints: after } = useCanvasStore.getState()
        expect(after).toHaveLength(0)
    })
})

describe('canvasStore - Alternatives / Preview Mode', () => {
    it('should enter preview mode when alternatives are set', () => {
        act(() => {
            useCanvasStore.getState().setAlternatives([
                {
                    id: 'alt-1',
                    name: 'Microservices',
                    description: 'Distributed microservice architecture',
                    nodes: [],
                    edges: [],
                    tradeoffs: { speed: 4, cost: 3, scalability: 5, complexity: 4, simplicity: 2 },
                }
            ])
        })

        const { previewMode, alternatives, activeAlternativeIndex } = useCanvasStore.getState()
        expect(previewMode).toBe(true)
        expect(alternatives).toHaveLength(1)
        expect(activeAlternativeIndex).toBe(0)
    })

    it('should clear alternatives and exit preview mode', () => {
        act(() => {
            useCanvasStore.getState().setAlternatives([
                { id: 'alt-1', name: 'A', description: '', nodes: [], edges: [], tradeoffs: { speed: 1, cost: 1, scalability: 1, complexity: 1, simplicity: 1 } }
            ])
        })

        act(() => {
            useCanvasStore.getState().clearAlternatives()
        })

        const { previewMode, alternatives, activeAlternativeIndex } = useCanvasStore.getState()
        expect(previewMode).toBe(false)
        expect(alternatives).toHaveLength(0)
        expect(activeAlternativeIndex).toBeNull()
    })
})
