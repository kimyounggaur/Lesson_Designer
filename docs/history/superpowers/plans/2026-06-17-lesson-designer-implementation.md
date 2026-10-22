# Lesson Designer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive Next.js Lesson Designer website with Supabase Auth, database-backed member/admin roles, category app grids, and permission-controlled Vercel app links.

**Architecture:** The app uses Next.js App Router with server actions for Supabase email/password auth. App catalog data stays in code, while user identity and roles live in Supabase Auth plus a `profiles` table. Access checks are centralized in small library functions so guest, member, and admin behavior is testable without rendering the full app.

**Tech Stack:** Next.js, React, TypeScript, Supabase Auth, Supabase Postgres, `@supabase/ssr`, Vitest, Testing Library, CSS.

---

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `next.config.mjs`: Next.js configuration.
- Create `tsconfig.json`: TypeScript settings.
- Create `vitest.config.ts`: unit test configuration.
- Create `.gitignore`: ignore dependencies, build output, and local env files.
- Create `.env.example`: required Supabase and site environment variables.
- Create `middleware.ts`: refresh Supabase auth cookies for server-rendered pages.
- Create `supabase/migrations/202606170001_create_profiles.sql`: `profiles` table, trigger, RLS policies.
- Create `src/app/layout.tsx`: root HTML shell.
- Create `src/app/globals.css`: responsive visual system.
- Create `src/app/page.tsx`: first-page major category selector.
- Create `src/app/category/[category]/page.tsx`: second-page app grid by category.
- Create `src/app/signup/page.tsx`: member signup route.
- Create `src/app/login/page.tsx`: member login route.
- Create `src/app/admin-login/page.tsx`: admin login route.
- Create `src/app/admin/page.tsx`: admin-only protected page.
- Create `src/app/auth/actions.ts`: signup, login, admin login, logout server actions.
- Create `src/components/AppCard.tsx`: permission-aware app card.
- Create `src/components/AppGrid.tsx`: grid renderer for app cards.
- Create `src/components/AuthForm.tsx`: shared signup/login/admin-login form.
- Create `src/components/CategoryButton.tsx`: large home category button.
- Create `src/components/SiteHeader.tsx`: header auth/admin navigation.
- Create `src/components/StatusBanner.tsx`: form and access messages.
- Create `src/lib/apps.ts`: app catalog and category helpers.
- Create `src/lib/access.ts`: role and app access helpers.
- Create `src/lib/auth.ts`: server-side current-user/profile helpers.
- Create `src/lib/supabase/client.ts`: browser Supabase client.
- Create `src/lib/supabase/server.ts`: server Supabase client.
- Create `src/lib/supabase/middleware.ts`: middleware Supabase client.
- Create `src/lib/env.ts`: typed environment guard.
- Create `src/lib/__tests__/access.test.ts`: access rule tests.
- Create `src/lib/__tests__/apps.test.ts`: app catalog tests.
- Create `src/lib/__tests__/env.test.ts`: environment helper tests.
- Create `public/icons/*`: copied icon image files used by the catalog.

## Task 1: Project Scaffold And Test Harness

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Create npm project metadata**

Write `package.json`:

```json
{
  "name": "lesson-designer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "lucide-react": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Create Next.js config**

Write `next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
};

export default nextConfig;
```

- [ ] **Step 3: Create TypeScript config**

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create Vitest config**

Write `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

- [ ] **Step 5: Create ignore and environment example files**

Write `.gitignore`:

```gitignore
node_modules
.next
out
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
```

Write `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 6: Install dependencies**

Run:

```powershell
npm install
```

Expected: `node_modules` and `package-lock.json` are created without install errors.

- [ ] **Step 7: Run the empty test command**

Run:

```powershell
npm test
```

Expected: Vitest exits with no matching tests or no test files. If Vitest exits nonzero because no tests exist, proceed to Task 2 and use the first real test run as the verification point.

## Task 2: App Catalog And Access Rules

**Files:**
- Create: `src/lib/apps.ts`
- Create: `src/lib/access.ts`
- Create: `src/lib/__tests__/apps.test.ts`
- Create: `src/lib/__tests__/access.test.ts`

- [ ] **Step 1: Write catalog tests**

Write `src/lib/__tests__/apps.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { APP_CATEGORIES, getAppsByCategory, getCategoryLabel } from "../apps";

describe("app catalog", () => {
  it("defines both major categories", () => {
    expect(APP_CATEGORIES).toEqual(["instrument-education", "music-game"]);
  });

  it("keeps guitar and ukulele public in instrument education", () => {
    const apps = getAppsByCategory("instrument-education");

    expect(apps.find((app) => app.id === "guitar-chord")?.publicAccess).toBe(true);
    expect(apps.find((app) => app.id === "ukulele-chord")?.publicAccess).toBe(true);
  });

  it("returns Korean category labels", () => {
    expect(getCategoryLabel("instrument-education")).toBe("악기 교육앱");
    expect(getCategoryLabel("music-game")).toBe("음악 게임앱");
  });
});
```

- [ ] **Step 2: Write access tests**

Write `src/lib/__tests__/access.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canAccessAdminPage, canOpenApp } from "../access";
import type { LessonApp } from "../apps";

const publicApp: LessonApp = {
  id: "guitar-chord",
  category: "instrument-education",
  name: "기타 코드 배우기",
  icon: "/icons/guitar.png",
  url: "https://guitar-chord-viewer.vercel.app/",
  publicAccess: true
};

const lockedApp: LessonApp = {
  id: "kalimba-play",
  category: "instrument-education",
  name: "칼림바 배우기",
  icon: "/icons/kalimba.png",
  url: "https://kalimba-play.vercel.app/",
  publicAccess: false
};

describe("access rules", () => {
  it("allows guests to open public apps", () => {
    expect(canOpenApp(publicApp, "guest")).toBe(true);
  });

  it("blocks guests from locked apps", () => {
    expect(canOpenApp(lockedApp, "guest")).toBe(false);
  });

  it("allows members to open all apps", () => {
    expect(canOpenApp(lockedApp, "member")).toBe(true);
  });

  it("allows admins to open all apps and admin page", () => {
    expect(canOpenApp(lockedApp, "admin")).toBe(true);
    expect(canAccessAdminPage("admin")).toBe(true);
  });

  it("blocks non-admins from admin page", () => {
    expect(canAccessAdminPage("guest")).toBe(false);
    expect(canAccessAdminPage("member")).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests to verify failure**

Run:

```powershell
npm test -- src/lib/__tests__/apps.test.ts src/lib/__tests__/access.test.ts
```

Expected: FAIL because `src/lib/apps.ts` and `src/lib/access.ts` do not exist.

- [ ] **Step 4: Implement app catalog**

Write `src/lib/apps.ts`:

```ts
export const APP_CATEGORIES = ["instrument-education", "music-game"] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];

export type LessonApp = {
  id: string;
  category: AppCategory;
  name: string;
  icon: string;
  url: string;
  publicAccess: boolean;
};

export const CATEGORY_LABELS: Record<AppCategory, string> = {
  "instrument-education": "악기 교육앱",
  "music-game": "음악 게임앱"
};

export const LESSON_APPS: LessonApp[] = [
  {
    id: "guitar-chord",
    category: "instrument-education",
    name: "기타 코드 배우기",
    icon: "/icons/guitar.png",
    url: "https://guitar-chord-viewer.vercel.app/",
    publicAccess: true
  },
  {
    id: "ukulele-chord",
    category: "instrument-education",
    name: "우쿨렐레 코드 배우기",
    icon: "/icons/ukulele.png",
    url: "https://ukulele-chord-viewer.vercel.app/",
    publicAccess: true
  },
  {
    id: "tongue-drum-edu",
    category: "instrument-education",
    name: "텅드럼 배우기",
    icon: "/icons/tongue-drum.png",
    url: "https://tonguedrum-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "kalimba-edu",
    category: "instrument-education",
    name: "칼림바 배우기",
    icon: "/icons/kalimba.png",
    url: "https://kalimba-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "miniharp-edu",
    category: "instrument-education",
    name: "미니하프 배우기",
    icon: "/icons/miniharp.png",
    url: "https://miniharp-app.vercel.app/",
    publicAccess: false
  },
  {
    id: "ocarina-edu",
    category: "instrument-education",
    name: "오카리나 배우기",
    icon: "/icons/ocarina.png",
    url: "https://ocarina-master.vercel.app/",
    publicAccess: false
  },
  {
    id: "panflute-edu",
    category: "instrument-education",
    name: "팬플룻 배우기",
    icon: "/icons/panflute.png",
    url: "https://panflute-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "violin-edu",
    category: "instrument-education",
    name: "바이올린 배우기",
    icon: "/icons/violin.png",
    url: "https://violin-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "flute-edu",
    category: "instrument-education",
    name: "플루트 배우기",
    icon: "/icons/flute.png",
    url: "https://flute-edu.vercel.app/",
    publicAccess: false
  },
  {
    id: "nanta-game",
    category: "music-game",
    name: "난타 리듬 게임",
    icon: "/icons/nanta.png",
    url: "https://nanta-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "drum-game",
    category: "music-game",
    name: "드럼 리듬 게임",
    icon: "/icons/drum.png",
    url: "https://drum-beat-pi.vercel.app/",
    publicAccess: false
  },
  {
    id: "tongue-drum-game",
    category: "music-game",
    name: "텅드럼 리듬 게임",
    icon: "/icons/tongue-drum.png",
    url: "https://tonguedrum-play.vercel.app/",
    publicAccess: false
  },
  {
    id: "kalimba-game",
    category: "music-game",
    name: "칼림바 연주 게임",
    icon: "/icons/kalimba.png",
    url: "https://kalimba-play.vercel.app/",
    publicAccess: false
  }
];

export function getAppsByCategory(category: AppCategory) {
  return LESSON_APPS.filter((app) => app.category === category);
}

export function getCategoryLabel(category: AppCategory) {
  return CATEGORY_LABELS[category];
}

export function isAppCategory(value: string): value is AppCategory {
  return APP_CATEGORIES.includes(value as AppCategory);
}
```

- [ ] **Step 5: Implement access helpers**

Write `src/lib/access.ts`:

```ts
import type { LessonApp } from "./apps";

export type UserRole = "guest" | "member" | "admin";

export function normalizeRole(role: string | null | undefined): UserRole {
  if (role === "admin") {
    return "admin";
  }

  if (role === "member") {
    return "member";
  }

  return "guest";
}

export function canOpenApp(app: LessonApp, role: UserRole) {
  if (role === "admin" || role === "member") {
    return true;
  }

  return app.publicAccess;
}

export function canAccessAdminPage(role: UserRole) {
  return role === "admin";
}
```

- [ ] **Step 6: Run tests to verify pass**

Run:

```powershell
npm test -- src/lib/__tests__/apps.test.ts src/lib/__tests__/access.test.ts
```

Expected: PASS for all catalog and access tests.

## Task 3: Supabase Schema, Environment, And Clients

**Files:**
- Create: `supabase/migrations/202606170001_create_profiles.sql`
- Create: `src/lib/env.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`
- Create: `src/lib/__tests__/env.test.ts`

- [ ] **Step 1: Check current Supabase guidance**

Run:

```powershell
Invoke-WebRequest -UseBasicParsing 'https://supabase.com/changelog.md' | Select-Object -ExpandProperty Content | Select-String -Pattern 'breaking-change|auth|ssr|rls' -Context 1,1
```

Expected: command returns Supabase changelog snippets. If a breaking auth or SSR change applies to the current `@supabase/ssr` install, adjust the client helper code before continuing.

- [ ] **Step 2: Write environment tests**

Write `src/lib/__tests__/env.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getPublicEnv } from "../env";

describe("environment helpers", () => {
  it("returns missing setup state when Supabase env is absent", () => {
    const env = getPublicEnv({});

    expect(env.isConfigured).toBe(false);
    expect(env.supabaseUrl).toBe("");
    expect(env.supabaseAnonKey).toBe("");
  });

  it("returns configured state when Supabase env exists", () => {
    const env = getPublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key"
    });

    expect(env.isConfigured).toBe(true);
    expect(env.supabaseUrl).toBe("https://example.supabase.co");
    expect(env.supabaseAnonKey).toBe("anon-key");
  });
});
```

- [ ] **Step 3: Run env test to verify failure**

Run:

```powershell
npm test -- src/lib/__tests__/env.test.ts
```

Expected: FAIL because `src/lib/env.ts` does not exist.

- [ ] **Step 4: Implement environment helper**

Write `src/lib/env.ts`:

```ts
export type PublicEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  siteUrl: string;
  isConfigured: boolean;
};

type EnvSource = Record<string, string | undefined>;

export function getPublicEnv(source: EnvSource = process.env): PublicEnv {
  const supabaseUrl = source.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = source.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const siteUrl = source.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    supabaseUrl,
    supabaseAnonKey,
    siteUrl,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey)
  };
}
```

- [ ] **Step 5: Create Supabase migration**

Write `supabase/migrations/202606170001_create_profiles.sql`:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own_email_only"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'member')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 6: Implement browser Supabase client**

Write `src/lib/supabase/client.ts`:

```ts
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

export function createClient() {
  const env = getPublicEnv();

  if (!env.isConfigured) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
}
```

- [ ] **Step 7: Implement server Supabase client**

Write `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();
  const env = getPublicEnv();

  if (!env.isConfigured) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies directly.
        }
      }
    }
  });
}
```

- [ ] **Step 8: Implement middleware Supabase client**

Write `src/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  const env = getPublicEnv();

  if (!env.isConfigured) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  await supabase.auth.getUser();

  return response;
}
```

Write root `middleware.ts`:

```ts
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons).*)"]
};
```

- [ ] **Step 9: Run env tests**

Run:

```powershell
npm test -- src/lib/__tests__/env.test.ts
```

Expected: PASS.

## Task 4: Auth Role Helpers And Server Actions

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/auth/actions.ts`

- [ ] **Step 1: Implement current profile helper**

Write `src/lib/auth.ts`:

```ts
import { createClient } from "@/lib/supabase/server";
import { normalizeRole, type UserRole } from "@/lib/access";

export type CurrentUserProfile = {
  id: string;
  email: string | null;
  role: UserRole;
};

export async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,email,role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: data?.email ?? user.email ?? null,
    role: normalizeRole(data?.role)
  };
}

export async function getCurrentRole(): Promise<UserRole> {
  const profile = await getCurrentUserProfile();
  return profile?.role ?? "guest";
}
```

- [ ] **Step 2: Implement auth server actions**

Write `src/app/auth/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AuthState = {
  message: string;
  tone: "idle" | "success" | "error";
};

export const initialAuthState: AuthState = {
  message: "",
  tone: "idle"
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateCredentials(email: string, password: string): string | null {
  if (!email.includes("@")) {
    return "이메일 주소를 확인해주세요.";
  }

  if (password.length < 6) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }

  return null;
}

export async function signUpAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { message: validationError, tone: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { message: error.message, tone: "error" };
  }

  return { message: "회원가입이 완료되었습니다. 로그인 후 이용해주세요.", tone: "success" };
}

export async function loginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { message: validationError, tone: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: error.message, tone: "error" };
  }

  redirect("/");
}

export async function adminLoginAction(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { message: validationError, tone: "error" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: error.message, tone: "error" };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { message: "관리자 권한이 없는 계정입니다.", tone: "error" };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
```

- [ ] **Step 3: Run type check through build after UI tasks**

No standalone command is run in this task because the actions reference Next.js runtime APIs. Task 8 runs `npm run build` after routes exist.

## Task 5: Shared UI Components

**Files:**
- Create: `src/components/StatusBanner.tsx`
- Create: `src/components/AuthForm.tsx`
- Create: `src/components/SiteHeader.tsx`
- Create: `src/components/CategoryButton.tsx`
- Create: `src/components/AppCard.tsx`
- Create: `src/components/AppGrid.tsx`

- [ ] **Step 1: Implement status banner**

Write `src/components/StatusBanner.tsx`:

```tsx
type StatusBannerProps = {
  message?: string;
  tone?: "idle" | "success" | "error" | "info";
};

export function StatusBanner({ message, tone = "idle" }: StatusBannerProps) {
  if (!message) {
    return null;
  }

  return <p className={`statusBanner ${tone}`}>{message}</p>;
}
```

- [ ] **Step 2: Implement auth form**

Write `src/components/AuthForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { initialAuthState } from "@/app/auth/actions";
import { StatusBanner } from "@/components/StatusBanner";

type AuthFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  action: typeof initialAuthState extends infer _State
    ? (state: typeof initialAuthState, formData: FormData) => Promise<typeof initialAuthState>
    : never;
};

export function AuthForm({ title, description, submitLabel, action }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialAuthState);

  return (
    <main className="authShell">
      <section className="authPanel">
        <h1>{title}</h1>
        <p>{description}</p>
        <form action={formAction} className="authForm">
          <label>
            이메일
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            비밀번호
            <input name="password" type="password" autoComplete="current-password" minLength={6} required />
          </label>
          <button type="submit" disabled={pending}>
            {pending ? "처리 중" : submitLabel}
          </button>
        </form>
        <StatusBanner message={state.message} tone={state.tone} />
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Implement header**

Write `src/components/SiteHeader.tsx`:

```tsx
import Link from "next/link";
import { Lock, LogIn, Shield, UserPlus } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import type { CurrentUserProfile } from "@/lib/auth";

type SiteHeaderProps = {
  profile: CurrentUserProfile | null;
};

export function SiteHeader({ profile }: SiteHeaderProps) {
  return (
    <header className="siteHeader">
      <Link href="/" className="brand">
        Lesson Designer
      </Link>
      <nav className="headerActions" aria-label="계정 메뉴">
        {!profile ? (
          <>
            <Link href="/signup" className="headerButton">
              <UserPlus size={16} />
              회원가입
            </Link>
            <Link href="/login" className="headerButton">
              <LogIn size={16} />
              회원 로그인
            </Link>
            <Link href="/admin-login" className="headerButton">
              <Shield size={16} />
              관리자 로그인
            </Link>
          </>
        ) : (
          <form action={logoutAction}>
            <button className="headerButton" type="submit">
              로그아웃
            </button>
          </form>
        )}
        <Link href="/admin" className="headerButton">
          <Lock size={16} />
          관리자 페이지
        </Link>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Implement category button**

Write `src/components/CategoryButton.tsx`:

```tsx
import Link from "next/link";
import type { AppCategory } from "@/lib/apps";

type CategoryButtonProps = {
  category: AppCategory;
  label: string;
  description: string;
};

export function CategoryButton({ category, label, description }: CategoryButtonProps) {
  return (
    <Link href={`/category/${category}`} className="categoryButton">
      <span>{label}</span>
      <small>{description}</small>
    </Link>
  );
}
```

- [ ] **Step 5: Implement app card**

Write `src/components/AppCard.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, ExternalLink } from "lucide-react";
import { canOpenApp, type UserRole } from "@/lib/access";
import type { LessonApp } from "@/lib/apps";

type AppCardProps = {
  app: LessonApp;
  role: UserRole;
};

export function AppCard({ app, role }: AppCardProps) {
  const allowed = canOpenApp(app, role);

  return (
    <article className={`appCard ${allowed ? "" : "locked"}`}>
      <div className="appIconFrame">
        <Image src={app.icon} alt="" width={96} height={96} className="appIcon" />
      </div>
      <h2>{app.name}</h2>
      {allowed ? (
        <Link href={app.url} className="appOpenButton" target="_blank" rel="noreferrer">
          <ExternalLink size={16} />
          선택
        </Link>
      ) : (
        <Link href="/login?required=1" className="appOpenButton lockedButton">
          <LockKeyhole size={16} />
          로그인 필요
        </Link>
      )}
    </article>
  );
}
```

- [ ] **Step 6: Implement app grid**

Write `src/components/AppGrid.tsx`:

```tsx
import { AppCard } from "@/components/AppCard";
import type { UserRole } from "@/lib/access";
import type { LessonApp } from "@/lib/apps";

type AppGridProps = {
  apps: LessonApp[];
  role: UserRole;
};

export function AppGrid({ apps, role }: AppGridProps) {
  return (
    <div className="appGrid">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} role={role} />
      ))}
    </div>
  );
}
```

## Task 6: Pages And Routing

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/category/[category]/page.tsx`
- Create: `src/app/signup/page.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/app/admin-login/page.tsx`
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Implement root layout**

Write `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lesson Designer",
  description: "악기 교육앱과 음악 게임앱을 연결하는 Lesson Designer 포털"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Implement home page**

Write `src/app/page.tsx`:

```tsx
import { CategoryButton } from "@/components/CategoryButton";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function HomePage() {
  const profile = await getCurrentUserProfile();

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="homeShell">
        <section className="homeIntro">
          <p className="eyebrow">음악 수업 웹앱 포털</p>
          <h1>Lesson Designer</h1>
        </section>
        <section className="categoryStack" aria-label="앱 대분류">
          <CategoryButton category="instrument-education" label="악기 교육앱" description="코드, 운지, 악기별 학습 앱" />
          <CategoryButton category="music-game" label="음악 게임앱" description="리듬과 연주 감각을 익히는 게임 앱" />
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Implement category page**

Write `src/app/category/[category]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppGrid } from "@/components/AppGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentRole, getCurrentUserProfile } from "@/lib/auth";
import { getAppsByCategory, getCategoryLabel, isAppCategory } from "@/lib/apps";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isAppCategory(category)) {
    notFound();
  }

  const [profile, role] = await Promise.all([getCurrentUserProfile(), getCurrentRole()]);
  const apps = getAppsByCategory(category);

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="pageShell">
        <Link href="/" className="backLink">
          홈으로
        </Link>
        <section className="pageHeading">
          <p className="eyebrow">앱 선택</p>
          <h1>{getCategoryLabel(category)}</h1>
          {role === "guest" ? (
            <p>미로그인 상태에서는 기타 코드 배우기와 우쿨렐레 코드 배우기만 바로 열 수 있습니다.</p>
          ) : (
            <p>로그인 권한으로 모든 앱을 열 수 있습니다.</p>
          )}
        </section>
        <AppGrid apps={apps} role={role} />
      </main>
    </>
  );
}
```

- [ ] **Step 4: Implement auth pages**

Write `src/app/signup/page.tsx`:

```tsx
import { signUpAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <AuthForm
      title="회원가입"
      description="회원 계정으로 가입하면 모든 악기 교육앱과 음악 게임앱을 이용할 수 있습니다."
      submitLabel="회원가입"
      action={signUpAction}
    />
  );
}
```

Write `src/app/login/page.tsx`:

```tsx
import { loginAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <AuthForm
      title="회원 로그인"
      description="회원 계정으로 로그인하면 모든 앱 선택 버튼이 활성화됩니다."
      submitLabel="로그인"
      action={loginAction}
    />
  );
}
```

Write `src/app/admin-login/page.tsx`:

```tsx
import { adminLoginAction } from "@/app/auth/actions";
import { AuthForm } from "@/components/AuthForm";

export default function AdminLoginPage() {
  return (
    <AuthForm
      title="관리자 로그인"
      description="관리자 role이 지정된 계정만 관리자 페이지에 들어갈 수 있습니다."
      submitLabel="관리자 로그인"
      action={adminLoginAction}
    />
  );
}
```

- [ ] **Step 5: Implement admin page**

Write `src/app/admin/page.tsx`:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppGrid } from "@/components/AppGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { canAccessAdminPage } from "@/lib/access";
import { getCurrentUserProfile } from "@/lib/auth";
import { LESSON_APPS } from "@/lib/apps";

export default async function AdminPage() {
  const profile = await getCurrentUserProfile();

  if (!canAccessAdminPage(profile?.role ?? "guest")) {
    redirect("/admin-login");
  }

  return (
    <>
      <SiteHeader profile={profile} />
      <main className="pageShell">
        <Link href="/" className="backLink">
          홈으로
        </Link>
        <section className="pageHeading">
          <p className="eyebrow">관리자 페이지</p>
          <h1>앱 접근 현황</h1>
          <p>{profile?.email} 계정은 관리자 권한으로 모든 기능을 사용할 수 있습니다.</p>
        </section>
        <AppGrid apps={LESSON_APPS} role="admin" />
      </main>
    </>
  );
}
```

## Task 7: Styling And Assets

**Files:**
- Create: `src/app/globals.css`
- Create: `public/icons/guitar.png`
- Create: `public/icons/ukulele.png`
- Create: `public/icons/tongue-drum.png`
- Create: `public/icons/kalimba.png`
- Create: `public/icons/miniharp.png`
- Create: `public/icons/ocarina.png`
- Create: `public/icons/panflute.png`
- Create: `public/icons/violin.png`
- Create: `public/icons/flute.png`
- Create: `public/icons/nanta.png`
- Create: `public/icons/drum.png`

- [ ] **Step 1: Copy local icon assets**

Run:

```powershell
New-Item -ItemType Directory -Force 'public/icons' | Out-Null
Copy-Item -LiteralPath '아이콘/04-1 기타 아이콘(크몽)[채색].png' -Destination 'public/icons/guitar.png' -Force
Copy-Item -LiteralPath '아이콘/05 우쿨렐레 아이콘(크몽)[채색].png' -Destination 'public/icons/ukulele.png' -Force
Copy-Item -LiteralPath '아이콘/02 텅드럼 아이콘(크몽)[채색]-마레아15키-배경삭제.png' -Destination 'public/icons/tongue-drum.png' -Force
Copy-Item -LiteralPath '아이콘/21키 칼림바(크몽).png' -Destination 'public/icons/kalimba.png' -Force
Copy-Item -LiteralPath '아이콘/03 미니하프 아이콘(크몽)[채색]-Pink(배경삭제).png' -Destination 'public/icons/miniharp.png' -Force
Copy-Item -LiteralPath '아이콘/ocarina_1027415.png' -Destination 'public/icons/ocarina.png' -Force
Copy-Item -LiteralPath '아이콘/pan-flute.png' -Destination 'public/icons/panflute.png' -Force
Copy-Item -LiteralPath '아이콘/Violin Icon.png' -Destination 'public/icons/violin.png' -Force
Copy-Item -LiteralPath '아이콘/Flute Icon.png' -Destination 'public/icons/flute.png' -Force
Copy-Item -LiteralPath '아이콘/08 난타 아이콘2-2(크몽)[채색]배경삭제.png' -Destination 'public/icons/nanta.png' -Force
Copy-Item -LiteralPath '아이콘/06 드럼 아이콘(크몽)[채색]-01.jpg' -Destination 'public/icons/drum.png' -Force
```

Expected: each named icon file exists under `public/icons`.

- [ ] **Step 2: Implement global CSS**

Write `src/app/globals.css`:

```css
:root {
  color-scheme: light;
  --ink: #151515;
  --muted: #666a73;
  --line: #d9dde5;
  --paper: #ffffff;
  --wash: #f5f7fb;
  --accent: #16796f;
  --accent-strong: #0d5851;
  --warning: #945600;
  --danger: #b42318;
  --success: #087443;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--wash);
  color: var(--ink);
  font-family: Arial, "Noto Sans KR", sans-serif;
  letter-spacing: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input {
  font: inherit;
}

.siteHeader {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px clamp(18px, 4vw, 48px);
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--line);
}

.brand {
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 800;
  white-space: nowrap;
}

.headerActions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.headerButton {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
}

.homeShell,
.pageShell,
.authShell {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
}

.homeShell {
  min-height: calc(100vh - 80px);
  display: grid;
  align-content: center;
  gap: 44px;
  padding: 44px 0 64px;
}

.homeIntro {
  text-align: center;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--accent-strong);
  font-size: 14px;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(38px, 7vw, 72px);
  line-height: 1.05;
}

.categoryStack {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.categoryButton {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 28px;
  border: 3px solid var(--ink);
  border-radius: 8px;
  background: var(--paper);
  text-align: center;
}

.categoryButton span {
  font-size: clamp(26px, 4vw, 42px);
  font-weight: 800;
}

.categoryButton small {
  color: var(--muted);
  font-size: 16px;
}

.pageShell {
  padding: 32px 0 72px;
}

.backLink {
  display: inline-flex;
  margin-bottom: 28px;
  color: var(--accent-strong);
  font-weight: 700;
}

.pageHeading {
  margin-bottom: 30px;
}

.pageHeading h1 {
  font-size: clamp(34px, 5vw, 56px);
}

.pageHeading p:last-child {
  max-width: 720px;
  color: var(--muted);
  line-height: 1.6;
}

.appGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 18px;
}

.appCard {
  min-height: 260px;
  display: grid;
  grid-template-rows: 112px auto 44px;
  align-items: center;
  justify-items: center;
  gap: 14px;
  padding: 22px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
}

.appCard.locked {
  color: #50545c;
  background: #fafafa;
}

.appIconFrame {
  width: 112px;
  height: 112px;
  display: grid;
  place-items: center;
}

.appIcon {
  width: 96px;
  height: 96px;
  object-fit: contain;
}

.appCard h2 {
  margin: 0;
  min-height: 52px;
  display: flex;
  align-items: center;
  text-align: center;
  font-size: 20px;
  line-height: 1.3;
}

.appOpenButton {
  width: 100%;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-weight: 700;
}

.lockedButton {
  background: #e8e9ed;
  color: #3f444d;
}

.authShell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 0;
}

.authPanel {
  width: min(460px, 100%);
  padding: 30px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--paper);
}

.authPanel h1 {
  font-size: 34px;
}

.authPanel p {
  color: var(--muted);
  line-height: 1.6;
}

.authForm {
  display: grid;
  gap: 16px;
  margin-top: 22px;
}

.authForm label {
  display: grid;
  gap: 8px;
  font-weight: 700;
}

.authForm input {
  min-height: 46px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 10px 12px;
}

.authForm button {
  min-height: 48px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.authForm button:disabled {
  opacity: 0.6;
  cursor: progress;
}

.statusBanner {
  margin-top: 18px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--line);
}

.statusBanner.success {
  border-color: var(--success);
  color: var(--success);
}

.statusBanner.error {
  border-color: var(--danger);
  color: var(--danger);
}

.statusBanner.info {
  border-color: var(--warning);
  color: var(--warning);
}

@media (max-width: 760px) {
  .siteHeader {
    align-items: flex-start;
    flex-direction: column;
  }

  .headerActions {
    width: 100%;
    justify-content: flex-start;
  }

  .headerButton {
    flex: 1 1 145px;
  }

  .categoryStack {
    grid-template-columns: 1fr;
  }

  .categoryButton {
    min-height: 170px;
  }

  .appGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 460px) {
  .homeShell,
  .pageShell,
  .authShell {
    width: min(100% - 24px, 1120px);
  }

  .appGrid {
    grid-template-columns: 1fr;
  }
}
```

## Task 8: Build, Run, And Verify

**Files:**
- Modify only if verification exposes a concrete defect in files from Tasks 1-7.

- [ ] **Step 1: Run unit tests**

Run:

```powershell
npm test
```

Expected: PASS for `access.test.ts`, `apps.test.ts`, and `env.test.ts`.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: Next.js build completes. If it fails because Supabase env variables are missing during server rendering, create `.env.local` from `.env.example` with the user's Supabase project values before rerunning.

- [ ] **Step 3: Start local dev server**

Run:

```powershell
npm run dev
```

Expected: dev server starts on `http://localhost:3000`. If port 3000 is occupied, Next.js selects another port and prints the URL.

- [ ] **Step 4: Browser smoke test**

Open the local URL and verify:

- Home page shows `Lesson Designer`.
- Header shows `회원가입`, `회원 로그인`, `관리자 로그인`, `관리자 페이지`.
- Home page shows `악기 교육앱` and `음악 게임앱`.
- `/category/instrument-education` shows app cards.
- Guest cards allow `기타 코드 배우기` and `우쿨렐레 코드 배우기`.
- Guest locked cards show `로그인 필요`.
- `/admin` redirects to `/admin-login` for a guest.

- [ ] **Step 5: Supabase account verification**

With real Supabase env values in `.env.local` and the migration applied to Supabase:

Run the app and verify:

- Sign up with a test member account.
- Login as the member account.
- Confirm all app buttons are selectable.
- In Supabase SQL editor, promote the account:

```sql
update public.profiles
set role = 'admin'
where email = 'member-email@example.com';
```

- Login through 관리자 로그인.
- Confirm `/admin` opens and shows all app cards.

- [ ] **Step 6: Git commit when repository exists**

Run:

```powershell
git rev-parse --is-inside-work-tree
```

Expected in the current folder before repository initialization: FAIL with `fatal: not a git repository`. If the folder has been initialized as a Git repository, commit the implementation:

```powershell
git add .
git commit -m "feat: build lesson designer portal"
```

Expected: commit succeeds with the scaffold, source files, tests, Supabase migration, and copied icons.

## Self-Review

- Spec coverage: Tasks 2, 5, 6, and 7 implement the two-page category flow, app grids, header buttons, Vercel links, and responsive UI. Tasks 3 and 4 implement Supabase Auth/Postgres role support. Task 6 implements the admin-protected page. Task 8 verifies guest, member, and admin behavior.
- Red-flag scan: The plan names concrete files, commands, SQL, and TypeScript components without open-ended implementation markers.
- Type consistency: `UserRole`, `LessonApp`, `AppCategory`, and `CurrentUserProfile` are defined once and referenced consistently across tests, helpers, components, and pages.
