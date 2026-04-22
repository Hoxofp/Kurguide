# Kurguide Product Requirements

## Core Features
1. **Visual Canvas / Node Editor**
   - Must allow drag-and-drop of diverse nodes (Databases, API Gateways, Microservices, 3rd-party SaaS integrations).
   - Powered by React Flow. Needs zooming, snapping to grid, and mini-map.

2. **Text-to-Node Generation**
   - Natural language interface where writing "Add a Redis Cache for auth" creates the Redis node linked to the appropriate services automatically.

3. **Mobile "Pocket Advisor"**
   - A companion app utilizing Push Notifications to send trade-off decisions directly to the System Architect.
   - Example UI: Tinder-style swipe cards. Sweep right to "Approve PostgreSQL adoption," swipe left to reject. 

4. **Agent Orchestration & Export**
   - Once a graph is fully vetted, one-click export transforms the visual JSON representation into actionable text commands (`architecture.md` / `.openhands` format).
   - Can autonomously trigger downstream AI coding agents via Webhooks.

## UI/UX Guidelines
- **Theme:** Dark mode default.
- **Aesthetic:** Futuristic, clean, heavily technical. High contrast (Neon accents on very dark backgrounds) indicating node states (Healthy vs Warning).
- **Mobile Aesthetic:** Prioritize quick thumb actions and large typography for rapid decision-making. No complex canvas navigation on mobile.

## Audience
- Software Architects
- DevOps Engineers
- Lead Developers leveraging next-generation AI coding tools.
