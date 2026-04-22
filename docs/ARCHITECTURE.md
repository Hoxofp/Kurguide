# Kurguide System Architecture

## Overview
Kurguide is a predictive software architecture design and AI-agent orchestration platform. It operates on a human-in-the-loop philosophy where an AI agent suggests the best tools/infrastructure constraints over an intuitive visual node graph, and a human user approves them.

## Tech Stack
- **Monorepo Manager:** Turborepo + pnpm
- **Frontend (Web):** React 18, Vite, React Flow, Zustand, TailwindCSS
- **Frontend (Mobile):** React Native (Expo)
- **Backend Microservices:** Node.js, Express
- **AI Integration:** LangChain / Official LLM SDKs (Gemini/Groq)
- **Databases/Brokers:** MongoDB (Canvas document storage), Redis (Session cache & Message Queuing via BullMQ)
- **Authentication & Realtime State:** Supabase

## Microservices Architecture

### 1. API Gateway (`/services/api-gateway`)
- The single point of entry for frontend clients. Route and reverse-proxy requests to underlying microservices. Handles rate limiting and basic CORS policies.

### 2. Canvas Service (`/services/canvas-service`)
- Manages the visual state of the node graph.
- Uses **MongoDB** to store graph configurations, as React Flow saves graphs as deeply nested JSON nodes and edges, matching perfectly with document-oriented paradigms.

### 3. AI Engine Service (`/services/ai-engine-service`)
- The brain of the predictive capability. Handles Text-to-Node logic.
- Long-running inference tasks are placed onto a **Redis / BullMQ** queue and processed asynchronously to prevent blocking the Node.js event pool.

### 4. Export Service (`/services/export-service`)
- Consumes finalized JSON artifacts and maps them into markdown `architecture.md` specs or custom `.openhands` execution schemas. Can trigger external Webhooks to orchestrate AI execution.

## Data Flow
1. User modifies graph on Web **OR** accepts a suggestion via flashcard on Mobile.
2. Changes sync instantly across clients via Supabase Realtime Channels.
3. Canvas Service periodically persists the graph to MongoDB.
4. "Predict Next Step" prompts route through Gateway -> AI Engine -> Redis Queue -> Completion -> Gateway -> Frontend.
