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

## Iteration 2 — Universal File Support + Redesign (2026-02-05)

### Universal File Upload System
- Backend `POST /api/upload` accepts ANY file type. Returns rich metadata:
  `url, storage_path, size, size_bytes, filename, original_filename, file_ext, mime_type, file_type`
- `detect_file_type()` maps extensions → 10 categories: image, video, audio, font, archive, document, code, 3d, design, other
- `Asset` model expanded: `file_type, file_ext, mime_type, original_filename, file_size_bytes`
- `GET /api/assets` supports `file_type=` filter; search covers `original_filename`

### Smart Preview (`SmartPreview.jsx`)
- Image → thumbnail
- Video → autoplay-muted first-frame + play button
- Audio → music icon card with animated waveform
- Font → "Aa Bb" preview
- Others → colored category icon (code/archive/3d/pdf/document/design)
- Type badge always overlaid; falls back gracefully when preview image fails to load

### UI Redesign (professional GitHub/Framer/Dribbble style)
- **Navbar**: sticky, shrinks on scroll, inline search bar with live dropdown (categories + assets), ⌘K hint, notifications bell, profile dropdown, mobile hamburger
- **Home**: compact 60vh split hero (headline+CTAs / featured asset showcase), file-type quick-chips (sticky), Categories row, Trending/Recent/Creators/Collections sections — content-forward
- **Explore**: sort tabs inline, file-type filter chips, category chips, 4-5 col responsive grid
- **AssetCard**: subtle lift + shadow hover, quick actions overlay, no glow spam
- **Upload**: any-file drag-drop with live SmartPreview + optional custom preview image
- **AssetDetail**: SmartPreview hero, File Info sidebar (type/ext/size/filename/license/version), real HTTP download

### Deprecated
- Old fake seed data (Nova/Kai/Luma/Orbit + 12 sample assets) — REMOVED
- Full-screen hero — replaced with compact 60-70vh split
- Excess glow on cards — subtle hover only

### Next Tasks (P1)
- Emergent Object Storage swap-in (durable) — replace local filesystem
- Emergent Google OAuth alongside JWT
- Stripe checkout for Pro assets
- Real notifications collection + follow feed page
- AI semantic search (embed titles/tags)
