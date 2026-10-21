-- Lesson Designer — profiles 하드닝 (설계문서 Phase 3 Step 3.4 를 실제 DB 상태에 맞게 조정한 버전)
--
-- ⚠ 적용 전 반드시 읽을 것
-- 이 Supabase 프로젝트(lesson-designer / cgoafcjvnbzozxbbyfle)의 public.profiles 는
-- ScoreForge 등 다른 앱과 **공유**되며, 2026-10-22 조사 시점의 실제 상태는 저장소의
-- 202606170001_create_profiles.sql 과 다르다:
--   - 컬럼: id, email, display_name, role, created_at, updated_at
--   - 정책: profiles_insert_self(INSERT), profiles_select_self_or_admin(SELECT, private.is_admin 사용),
--           profiles_update_own_email_only(UPDATE, WITH CHECK 로 role 변경 차단)
--   - 함수: private.is_admin(), private.handle_new_user()(display_name 처리 포함)
--   - 권한: authenticated 에 모든 컬럼 SELECT/INSERT/UPDATE (role 변경은 정책이 막음)
--   - supabase_migrations 에는 scoreforge_* 마이그레이션만 기록됨
--
-- 따라서 설계문서의 "revoke update / grant update (email)" 와 정책 교체는 ScoreForge 의
-- display_name 갱신 등을 깨뜨릴 수 있어 **이 파일에 포함하지 않는다** (DECISIONS O2 참고).
-- 아래는 추가 전용(additive) 변경만 담는다. 적용은 Supabase SQL Editor 또는
-- `supabase db push` 로 사람이 수행한다. (자동 적용은 플랫폼 정책으로 차단됨)
--
-- 롤백:
--   drop trigger if exists on_auth_user_email_updated on auth.users;
--   drop function if exists private.handle_user_email_update();
--   drop function if exists public.set_profile_role(uuid, text);

-- 1) auth.users.email 변경 → public.profiles.email 동기화 (설계 A-7)
create or replace function private.handle_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
       set email = coalesce(new.email, ''),
           updated_at = now()
     where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function private.handle_user_email_update();

-- 2) 관리자 전용 역할 변경 RPC (Phase 8.2 회원 관리 화면에서 사용)
--    권한 검사는 DB 안(private.is_admin)에서 수행하므로 클라이언트를 신뢰하지 않는다.
create or replace function public.set_profile_role(target_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  if new_role not in ('member', 'admin') then
    raise exception 'invalid role: %', new_role using errcode = '22023';
  end if;

  if target_id = (select auth.uid()) and new_role <> 'admin' then
    raise exception 'cannot demote self' using errcode = '42501';
  end if;

  update public.profiles
     set role = new_role,
         updated_at = now()
   where id = target_id;

  if not found then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.set_profile_role(uuid, text) from public;
revoke all on function public.set_profile_role(uuid, text) from anon;
grant execute on function public.set_profile_role(uuid, text) to authenticated;

-- 적용 후 확인 (회원 JWT 로 실행 → 거부되어야 함):
--   update public.profiles set role = 'admin' where id = auth.uid();   -- new row violates row-level security policy
--   select public.set_profile_role(auth.uid(), 'admin');               -- forbidden
