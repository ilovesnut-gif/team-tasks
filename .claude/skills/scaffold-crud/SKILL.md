---
name: scaffold-crud
description: 새 리소스의 풀스택 CRUD(DB 마이그레이션·API Routes·UI 페이지·RLS 정책)를 한 번에 생성한다. 사용자가 새 모델이나 리소스에 대한 CRUD 구현을 요청할 때 사용. '테이블 추가해 주십시오'

allowed-tools: Bash, Read, Write, Edit, Glob, Grep, mcp__plugin_supabase_supabase__apply_migration, mcp__plugin_supabase_supabase__list_tables, AskUserQuestion
---

## 사용 시점

다음 상황에서 이 스킬을 자동 호출한다.

- "X CRUD 만들어줘", "X 기능 추가해줘", "X 리소스 풀스택으로 구현해줘" 형태의 요청
- 새 DB 테이블 + API Routes + UI를 동시에 생성해야 하는 경우
- `/scaffold-crud <resource>` 슬래시 커맨드 직접 호출

다음은 해당 **안** 됨:

- 기존 테이블·라우트 수정만 필요한 경우 → 직접 Edit
- 단순 UI 컴포넌트 추가 (DB 없음) → 직접 Write
- DB 스키마 변경만 필요한 경우 → supabase 스킬

## 진행 순서

1. **MVP 범위 확인** — `CLAUDE.md`와 `docs/requirements.md`를 읽어 요청 리소스가 MVP 범위 밖인지 확인. 범위 외(예: 댓글·알림)이면 `AskUserQuestion`으로 사용자 의사 확인 후 진행.

2. **기존 패턴 파악** — `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`, `src/lib/supabase/server.ts`를 읽어 인증·에러 처리 컨벤션 확인.

3. **DB 마이그레이션** — Supabase MCP `apply_migration`으로 테이블 생성. 반드시 포함:
   - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
   - `created_by uuid NOT NULL REFERENCES auth.users(id)`
   - `created_at timestamptz NOT NULL DEFAULT now()`
   - check constraint으로 유효값 제한
   - `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY`
   - RLS 정책 4개: SELECT(전체 인증 사용자) · INSERT/UPDATE/DELETE(본인만)

4. **타입 업데이트** (병렬 가능):
   - `src/lib/supabase/database.types.ts` — `Tables` 블록에 Row/Insert/Update 추가
   - `src/types/index.ts` — 도메인 인터페이스(단수형) 추가

5. **API Routes 생성** (병렬 가능):
   - `src/app/api/<resource>/route.ts` — GET(목록), POST(생성)
   - `src/app/api/<resource>/[id]/route.ts` — GET(단건), PATCH(수정), DELETE(삭제)

6. **UI 생성** (병렬 가능):
   - `src/components/<Resource>*.tsx` — 목록·폼·삭제 컴포넌트
   - `src/app/<resource>/[id]/page.tsx` — 서버 컴포넌트(인증 체크 + 데이터 패치)

7. **타입 체크** — `npx tsc --noEmit` 실행 후 오류 없음 확인.

## 컨벤션

| 항목 | 규칙 |
|------|------|
| API base path | `/api/<resource>` — 버전 prefix 없음 |
| 인증 | 모든 라우트 첫 줄 `supabase.auth.getUser()` + 미인증 시 401 |
| 소유권 삭제 | `created_by === user.id` 서버 검증 후 403; RLS는 이중 보호층 |
| 입력 검증 | `request.json()` try/catch; 타입·길이 명시적 검증 후 400 반환 |
| 에러 응답 | `{ error: 'Internal server error' }` — `error.message` 직노출 금지 |
| `created_by` | 클라이언트 body 무시, 반드시 서버에서 `user.id`로 주입 |
| UI 라이브러리 | shadcn/ui (base-nova 프리셋) — `asChild` 없음, `render` prop 또는 일반 래퍼 |
| 스타일 | Tailwind v4 — `tailwind.config.ts` 없음, 토큰은 `src/app/globals.css` `@theme` |
| Supabase project_id | `lcqdbkxdiqhkmvbbkpxo` 고정 (memory 참조) |
| DB 제약 | ENUM·인덱스·트리거 사용 안 함; check constraint으로 유효값 제한 |
| 네이밍 | DB 테이블명 복수형(`comments`), TS 인터페이스 단수형(`Comment`) |

## 주의사항

- **RLS 누락 함정** — `ENABLE ROW LEVEL SECURITY` 없이 정책만 추가하면 anon 키로 전체 행 노출. 마이그레이션에 반드시 포함.
- **단수·복수 혼동** — 테이블 `comments` ↔ 인터페이스 `Comment` 일관성 유지.
- **localhost 태스크 ID 불일치** — 현재 Kanban UI는 localStorage 기반 ID를 쓰므로, 새 Supabase 리소스 페이지는 별도 라우트(`/app/<resource>/`)로 분리해 독립 운영.
- **`request.json()` 예외** — 잘못된 Content-Type이나 빈 body 전송 시 파싱 예외 발생. try/catch 없으면 500 에러 구조가 그대로 노출됨.
- **MVP 범위** — 댓글·알림·권한 관리·첨부파일은 v2. 사용자가 명시적으로 v2 진행을 확인한 경우에만 구현.
- **병렬 실행** — 타입 업데이트·API 라우트·UI 생성은 서로 독립적이므로 하나의 응답에서 병렬 도구 호출로 처리해 속도 향상.
