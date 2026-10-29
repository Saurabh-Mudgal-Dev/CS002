# Presentation Deck Notes

These are the correction notes from `PLAN.md` section 16. They describe edits to make to the presentation; they do not imply that roadmap features are already implemented in the current prototype.

| Slide | Correction |
|---|---|
| 4 | Replace the stale product name **SevaStock** with **ResourceOne**. |
| 6 | Change React.js 18 to React 19. |
| 6 | Update FastAPI from 0.110 to a current `0.14x` version, or omit the minor version. Check the installed version before finalizing the slide. |
| 6 and 9 | Remove Figma; describe design tokens and a component library instead. |
| 6 and 9 | Replace React Icons with Lucide React (or say “React icon library”). |
| 6 | Remove the duplicate MySQL 8.0 label. |
| 7 | Remove Docker from the deployment diagram. Use native deployment (Uvicorn + Nginx); retain cloud hosting and SSL only if the deployment plan supports those claims. |
| 8 | Update Phase 3 status to match actual project progress. |
| 9 | Explain the planned simplified purchase model as one item per purchase. Do not claim purchase tables exist in the current prototype. |
| 9 | Explain total value as a computed quantity × unit cost value, not a stored field. |
| 9 | The plan places `Role` directly on `User`; the current prototype also has a `role` field on its sample `User` model, but it is not enforced by the API. |
| 11 | Replace unmeasured “99.9% accuracy”, “60%+ time savings”, and “Zero manual errors” with “designed to…” wording or add measured evidence. |
| 12 | Verify team names and roll numbers against the official team list before submission. |

## Current prototype claims to avoid

The current `sora` implementation is a React/FastAPI inventory prototype. It does not yet provide login/JWT, server-enforced RBAC, organization data isolation, finance workflows, PDF reporting, or a migration-managed MySQL schema. Do not claim those as delivered features until they are implemented and tested.

Docker is intentionally excluded from the plan. Native local development uses Vite and Uvicorn; production hosting, Nginx, and SSL should be described as deployment options unless actually deployed and verified.
