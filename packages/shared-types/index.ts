/**
 * @kurguide/shared-types
 *
 * These interfaces define the shape of data shared across the entire
 * Kurguide ecosystem — frontend apps and backend services alike.
 * When any service or app imports from "@kurguide/shared-types",
 * they get these exact contracts, guaranteeing type safety end-to-end.
 */

// ─── Node & Edge (React Flow primitives) ─────────────────────

/** The types of architectural components a node can represent. */
export type NodeType =
    | "service"
    | "database"
    | "cache"
    | "gateway"
    | "queue"
    | "external"
    | "frontend";

/** A single node on the architecture canvas. */
export interface ArchNode {
    id: string;
    type: NodeType;
    label: string;
    position: { x: number; y: number };
    /** Arbitrary metadata (e.g. DB engine, port, image name). */
    data: Record<string, unknown>;
}

/** A connection (edge) between two nodes on the canvas. */
export interface ArchEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

// ─── Graph (the full canvas document) ────────────────────────

/** The complete graph document stored in MongoDB by Canvas Service. */
export interface ArchGraph {
    id: string;
    name: string;
    nodes: ArchNode[];
    edges: ArchEdge[];
    createdAt: string;
    updatedAt: string;
    ownerId: string;
}

// ─── AI Engine payloads ──────────────────────────────────────

/** What the frontend sends to the AI Engine "text-to-node" endpoint. */
export interface TextToNodeRequest {
    prompt: string;
    graphId: string;
}

/** What the AI Engine returns after processing a prompt. */
export interface TextToNodeResponse {
    jobId: string;
    status: "queued" | "processing" | "completed" | "failed";
    generatedNodes?: ArchNode[];
    generatedEdges?: ArchEdge[];
}

// ─── Export payloads ─────────────────────────────────────────

export type ExportFormat = "markdown" | "openhands";

export interface ExportRequest {
    graphId: string;
    format: ExportFormat;
}

export interface ExportResponse {
    downloadUrl: string;
    format: ExportFormat;
}
