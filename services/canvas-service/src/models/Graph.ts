import mongoose, { Schema, type Document } from 'mongoose'

/**
 * Graph Schema — the MongoDB document shape for architecture canvases.
 *
 * WHY MONGODB?
 * React Flow stores graphs as arrays of nested JSON objects (nodes with
 * arbitrary `data`, edges with source/target). This maps perfectly to a
 * document database. A relational DB would require multiple join tables
 * for nodes, edges, and their metadata — much more complex for this use case.
 */

interface IGraph extends Document {
    name: string
    nodes: Array<{
        id: string
        type: string
        label: string
        position: { x: number; y: number }
        data: Record<string, unknown>
    }>
    edges: Array<{
        id: string
        source: string
        target: string
        label?: string
    }>
    ownerId: string
    createdAt: Date
    updatedAt: Date
}

const graphSchema = new Schema<IGraph>(
    {
        name: { type: String, required: true, default: 'Untitled Architecture' },
        nodes: [{ type: Schema.Types.Mixed }],
        edges: [{ type: Schema.Types.Mixed }],
        ownerId: { type: String, required: true },
    },
    { timestamps: true }
)

export const Graph = mongoose.model<IGraph>('Graph', graphSchema)
