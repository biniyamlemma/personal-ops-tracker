# My Ops

**Your personal operations board.** Track what you're working on across your own life areas — planned, in progress, blocked, and done.

Built with Vue 3, Vite, TailwindCSS, Pinia, Vue Router, Vue Draggable, and Supabase.

## Features

- Personal **areas** (Work, Personal, Home, Money, Health, Projects — or your own)
- Kanban board per area with four columns: Planned, In Progress, Blocked, Completed
- Drag-and-drop items with instant sync
- Dashboard with blocked-item highlights and area summaries
- Item details with notes and activity timeline
- Dark mode support
- Settings to manage your areas

## Tech Stack

Vue 3 · Vite · TailwindCSS v4 · Pinia · Vue Router · Vue Draggable · Supabase · Vercel

## Local Development

```bash
npm install
cp .env.example .env   # add your Supabase URL and anon key
npm run dev
```

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run SQL files in order in the **SQL Editor**:
   - `supabase/01-setup.sql`
   - `supabase/02-multi-department.sql`
   - `supabase/03-personal-ops.sql`
3. **Authentication → Providers → Email** → disable **Enable sign ups** (optional — create your account in Supabase dashboard)
4. **Authentication → Users** → add your user
5. Run `supabase/seed-admin.sql` only if you need to fix profile role (optional)

On first login, default areas are created automatically.

### Deploy to Vercel

| Variable | Example |
|----------|---------|
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your anon key |

`SUPABASE_SERVICE_ROLE_KEY` is no longer required (team user management removed).

## License

MIT
