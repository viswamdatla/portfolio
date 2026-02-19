# Project setup

This project is set up with:

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn-style structure** (`components.json`, `@/components/ui`, `lib/utils.ts`)

## Default paths

| Purpose        | Path               | Notes                                      |
|----------------|--------------------|--------------------------------------------|
| UI components  | `components/ui/`   | shadcn default; CLI installs components here |
| Styles         | `app/globals.css`  | Tailwind directives and CSS variables      |
| Utils          | `lib/utils.ts`     | `cn()` for class names                     |

Using `components/ui` is important so that:

1. **shadcn CLI** installs new components in the same place (`npx shadcn@latest add button`).
2. **Imports stay consistent**: `@/components/ui/<name>`.
3. **Conventions** match the rest of the ecosystem and docs.

## Install and run

```bash
npm install
npm run dev
```

- Home: [http://localhost:3000](http://localhost:3000)
- Cursor demo: [http://localhost:3000/demo](http://localhost:3000/demo)

## If you start from an empty folder

To recreate this setup in a new project:

1. **Create Next.js app with TypeScript and Tailwind:**

   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
   ```

2. **Initialize shadcn (creates `components.json`, sets `@/components/ui`):**

   ```bash
   npx shadcn@latest init
   ```

   When prompted, choose:

   - Style: **New York**
   - Base color: **Slate** (or any)
   - CSS variables: **Yes**
   - `components.json` will set `"ui": "@/components/ui"` — keep that path.

3. **Add components** with:

   ```bash
   npx shadcn@latest add button
   ```

   They will go into `components/ui/`.

## Cursor component

- **Location:** `components/ui/inverted-cursor.tsx`
- **Usage:** Import and render `<Cursor size={60} />` in any client component.
- **Demo:** `app/demo/page.tsx` (route `/demo`).

No extra dependencies; uses only React, Tailwind, and TypeScript. No images or icons; no context or global state required.
