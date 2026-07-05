# LazR Hub — Digital Creator Hub (PRD)

## Original Problem Statement
Premium, futuristic creator marketplace ("LazR Hub") with dark space-inspired UI, neon cyan/purple/blue gradients, glassmorphism cards, floating particles, animated logo, custom cursor glow, page transitions, mouse parallax. Sections: Hero, Search, Categories, Featured, Trending, New Uploads, Creator Profiles, Asset Detail, Upload, Dashboard, Collections, Leaderboards, Community, Footer.

## User Choices (v1)
- **Auth**: JWT (custom) — Emergent Google Login deferred to v2
- **Storage**: Local filesystem `/app/backend/uploads` — Emergent Object Storage deferred to v2
- **Search**: Simple keyword filter (regex on title/desc/tags/category)
- **Palette**: Electric Cyan #00E5FF, Neon Blue #009DFF, Purple #7C3AED, Space Black #050510, Dark Navy #101827, Glass rgba(255,255,255,0.05)

## Architecture
- **Backend**: FastAPI + Motor + JWT + bcrypt; UploadFile → local disk; /uploads statically mounted.
- **Frontend**: React 19 + Tailwind + framer-motion + lucide-react + sonner. Custom canvas particles + framer-motion custom cursor + loading screen.
- **DB Collections**: users, assets, comments, collections.

## Implemented (2026-02-05)
- Auth: register/login/logout/me (httpOnly cookies)
- Categories (11 with live counts)
- Assets CRUD + search + sort + favorite + download tracking + comments
- File upload (preview + asset file, multipart to /api/upload)
- Users: creator profile, follow/unfollow, profile update
- Collections CRUD
- Leaderboards (creators + assets by DL/likes/trending)
- Dashboard: uploads, favorites, collections, settings
- Seed: admin + 4 demo creators + 12 seed assets
- UI: Loading screen, custom cursor, particle field, animated logo, gradient text, glass cards, marquee carousel, scroll reveal, mouse parallax

## Backlog (P1)
- Emergent Google OAuth alongside JWT
- Emergent Object Storage (durable persistence)
- Notifications & real-time follow feed
- AI-powered semantic search
- Asset requests / marketplace monetization

## Next Tasks
- User feedback → iterate on flows
- Add Google OAuth + Object Storage if user wants durable storage/social login
