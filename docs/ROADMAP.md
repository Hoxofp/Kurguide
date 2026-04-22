# Kurguide — 3-Month Development Roadmap

> **Start Date:** March 1, 2026  
> **Target Launch (MVP):** May 31, 2026  
> **Working Pace Assumption:** ~20 hrs/week (solo or small team)

---

## Month 1 — Foundation & Core Canvas (March 1 – March 31)

### Week 1–2: Phase 1 ✅ (DONE) + Phase 2 Start
| Task | Details |
|---|---|
| ✅ Monorepo scaffold | Turborepo, pnpm workspaces, shared-types, docker-compose |
| ✅ Documentation | ARCHITECTURE.md, PRODUCT_REQUIREMENTS.md |
| Bootstrap `apps/web` | `npx create-vite` with React + TypeScript template |
| Install core web deps | `react-flow`, `zustand`, `tailwindcss`, `shadcn/ui` |
| Dark theme + layout shell | Sidebar, top bar, canvas area. Dark mode first. |

### Week 3: Canvas Service + API Gateway
| Task | Details |
|---|---|
| Bootstrap `services/canvas-service` | Express + Mongoose. Schema for `ArchGraph`. |
| CRUD endpoints | `POST /graphs`, `GET /graphs/:id`, `PUT /graphs/:id` |
| Bootstrap `services/api-gateway` | Express + `http-proxy-middleware` routing to canvas-service |
| Connect frontend → API | Web app loads/saves graphs through the gateway |

### Week 4: Canvas Polish
| Task | Details |
|---|---|
| Custom node components | Styled nodes for Service, Database, Cache, Gateway types |
| Drag & drop from sidebar | Users drag node types onto the canvas |
| Edge creation | Click-to-connect nodes with labeled edges |
| Mini-map + controls | Zoom, fit-to-view, mini-map overlay |

**🎯 Month 1 Milestone:** A working web canvas where you can create, connect, save, and reload architecture nodes.

---

## Month 2 — AI Engine & Mobile App (April 1 – April 30)

### Week 5–6: AI Engine Service
| Task | Details |
|---|---|
| Bootstrap `services/ai-engine-service` | Express + BullMQ + Redis |
| LLM integration | Connect to Gemini API (or Groq). Craft system prompts for "text-to-node" conversion |
| Job queue flow | Frontend sends prompt → AI service queues job → worker processes → returns generated nodes |
| Prompt bar in web UI | Text input at bottom of canvas: "Add a Redis cache layer" → nodes appear |
| Prediction engine v1 | After each graph change, AI suggests the next logical component (e.g., "You have a service with no database — add one?") |

### Week 7–8: Mobile App (Pocket Advisor)
| Task | Details |
|---|---|
| Bootstrap `apps/mobile` | `npx create-expo-app` with TypeScript |
| Supabase Auth | Shared login across web and mobile (email/password or OAuth) |
| Supabase Realtime | Sync canvas state: when AI suggests a node, it becomes a flashcard on mobile |
| Flashcard/Swipe UI | `react-native-deck-swiper` or Reanimated. Swipe right = approve, left = reject |
| Push notifications | Expo Notifications: alert user on mobile when AI has a new suggestion |

**🎯 Month 2 Milestone:** An AI that generates architecture nodes from text prompts, and a mobile app where you can approve/reject AI suggestions with swipe cards — all synced in real-time.

---

## Month 3 — Export, Polish & Launch Prep (May 1 – May 31)

### Week 9–10: Export Service + Agent Orchestration
| Task | Details |
|---|---|
| Bootstrap `services/export-service` | Express service |
| JSON → Markdown parser | Convert `ArchGraph` JSON to a clean `architecture.md` with sections, diagrams, and tech stack |
| JSON → `.openhands` parser | Convert to the OpenHands agent spec format |
| Webhook triggers | "Export & Deploy" button that POSTs the spec to an external agent endpoint |
| Export UI | Download button + webhook config modal in the web canvas |

### Week 11: Integration Testing & Edge Cases
| Task | Details |
|---|---|
| End-to-end testing | Full flow: create graph → AI suggest → mobile approve → export |
| Error handling | API error boundaries, offline states, failed LLM calls |
| Loading states & UX | Skeleton screens, progress bars for AI generation, toast notifications |
| Security review | Supabase RLS policies, API rate limiting, input sanitization |

### Week 12: Final Polish & Soft Launch
| Task | Details |
|---|---|
| Landing page | Simple marketing page explaining Kurguide |
| Deployment | Containerize services (Dockerfiles), deploy to Railway / Fly.io / Vercel |
| CI/CD | GitHub Actions: lint + build on PR, deploy on merge to main |
| README.md | Setup instructions, contribution guide |
| **Soft launch** | Share with beta testers, collect feedback |

**🎯 Month 3 Milestone:** A fully functional MVP that can be demoed end-to-end. Deployed and accessible to beta users.

---

## Summary Timeline

```
March ██████████████████████████████ Foundation + Visual Canvas
April ██████████████████████████████ AI Engine + Mobile App
May   ██████████████████████████████ Export + Polish + Launch
```

## Risk Factors & Mitigations
| Risk | Mitigation |
|---|---|
| LLM output quality (bad node generation) | Use structured output (JSON mode), validate against `shared-types` schemas, add a "regenerate" button |
| React Flow performance at scale (100+ nodes) | Virtualize the canvas, lazy-load node details, debounce state saves |
| Supabase Realtime latency | Use optimistic UI updates; fall back to polling if WS drops |
| Scope creep | Stick to this roadmap. Defer "nice-to-haves" to a v1.1 backlog |
