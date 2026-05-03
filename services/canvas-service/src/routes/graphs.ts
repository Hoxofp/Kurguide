import { Router, type IRouter } from 'express'
import { Graph } from '../models/Graph.js'

/**
 * Graph Routes — CRUD endpoints for architecture canvases.
 *
 * These are the 4 core operations the frontend needs:
 *   GET    /graphs          → List all graphs for a user
 *   GET    /graphs/:id      → Load a single graph (open canvas)
 *   POST   /graphs          → Create a new graph
 *   PUT    /graphs/:id      → Save/update a graph (auto-save)
 *   DELETE /graphs/:id      → Delete a graph
 */

const router: IRouter = Router()

// List all graphs
router.get('/', async (_req, res) => {
    try {
        const graphs = await Graph.find().sort({ updatedAt: -1 }).select('-nodes -edges')
        res.json(graphs)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch graphs' })
    }
})

// Get a single graph (full data)
router.get('/:id', async (req, res) => {
    try {
        const graph = await Graph.findById(req.params.id)
        if (!graph) return res.status(404).json({ error: 'Graph not found' })
        res.json(graph)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch graph' })
    }
})

// Create a new graph
router.post('/', async (req, res) => {
    try {
        const graph = await Graph.create({
            name: req.body.name || 'Untitled Architecture',
            nodes: req.body.nodes || [],
            edges: req.body.edges || [],
            ownerId: req.body.ownerId || 'anonymous',
        })
        res.status(201).json(graph)
    } catch (err) {
        res.status(500).json({ error: 'Failed to create graph' })
    }
})

// Update a graph (save)
router.put('/:id', async (req, res) => {
    try {
        const graph = await Graph.findByIdAndUpdate(
            req.params.id,
            { name: req.body.name, nodes: req.body.nodes, edges: req.body.edges },
            { new: true }
        )
        if (!graph) return res.status(404).json({ error: 'Graph not found' })
        res.json(graph)
    } catch (err) {
        res.status(500).json({ error: 'Failed to update graph' })
    }
})

// Delete a graph
router.delete('/:id', async (req, res) => {
    try {
        await Graph.findByIdAndDelete(req.params.id)
        res.status(204).send()
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete graph' })
    }
})

export default router
