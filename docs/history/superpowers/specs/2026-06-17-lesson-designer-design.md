# Lesson Designer Design

## Goal

Build a responsive Lesson Designer website that lets users choose between instrument education apps and music game apps, then open the selected app through its Vercel link. Access must be controlled by real authentication and database-backed roles.

## Technology

- Framework: Next.js
- Authentication: Supabase Auth
- Database: Supabase Postgres
- Deployment target: Vercel
- Assets: existing local icon images in the `아이콘` folder

## Pages

### Home Page

The home page shows the Lesson Designer brand, a header action area, and two primary category buttons:

- 악기 교육앱
- 음악 게임앱

The header includes:

- 회원가입
- 회원 로그인
- 관리자 로그인
- 관리자 페이지

The admin page button is visible but access is allowed only for admin users.

### Category Page

The category page shows apps belonging to the selected category in a responsive grid. Each app card includes:

- App icon
- App name
- App selection button

The app selection button opens the configured Vercel URL when the current user has access.

### Auth Pages

The website includes real Supabase-backed flows for:

- Member signup
- Member login
- Admin login
- Logout

Member signup creates a normal member account. Admin status is not self-selectable from the public signup form.

### Admin Page

The admin page is protected by authentication and role checks. Admin users can access the page after login. The first version shows account/session status and the full app access list so the protected route has a concrete, testable purpose.

## Roles And Permissions

The system uses three effective access levels:

- Guest: not logged in
- Member: logged in with role `member`
- Admin: logged in with role `admin`

Guest users can open only:

- 기타 코드 배우기
- 우쿨렐레 코드 배우기

Member users can open all app cards.

Admin users can open all app cards and access the admin page.

## Database Model

Create a `profiles` table linked to Supabase Auth users:

- `id uuid primary key references auth.users(id)`
- `email text`
- `role text not null default 'member'`
- `created_at timestamptz default now()`

Allowed roles are `member` and `admin`.

The app catalog can live in code for the first version, with each app represented by:

- `id`
- `category`
- `name`
- `icon`
- `url`
- `publicAccess`

This keeps app edits simple while authentication and user roles remain database-backed.

## Security

Authorization must not depend on user-editable metadata. Admin access must come from the database-backed profile role or Supabase app metadata, not from client-edited user metadata.

Client code can use Supabase public environment variables only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

No service-role key should be exposed to browser code.

## Error Handling

- If a guest clicks a locked app, show a login-required message and guide them to member login.
- If a member clicks 관리자 페이지, show an admin-only message or redirect away.
- If Supabase environment variables are missing, the UI should show a clear setup state instead of crashing.
- If an app URL is unavailable, the card remains visible but the open action should fail gracefully.

## Testing And Verification

Verify:

- Home page renders both major categories.
- Category pages render the correct app grids.
- Guest access allows only guitar and ukulele chord apps.
- Member login unlocks all apps.
- Admin login unlocks all apps and the admin page.
- Unauthorized admin page access is blocked.
- Responsive layout works on mobile and desktop.
