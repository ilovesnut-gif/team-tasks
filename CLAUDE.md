# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server (Turbopack, http://localhost:3000)
npm run build    # production build + type-check
npm run lint     # ESLint
npx tsc --noEmit # type-check without emitting
npx shadcn@latest add <component-name>  # add shadcn/ui component
```

No test runner is configured yet.

## 코드 아키텍처

**현재 상태:** 백엔드 미구현. `src/lib/store.ts`가 localStorage를 직접 읽고 쓴다.

**데이터 흐름:** `src/app/page.tsx`(유일한 상태 소유자) → props → 하위 컴포넌트 → 콜백 → `saveTasks`/`saveMembers` → localStorage.

**핵심 파일:**
- `src/types/index.ts` — `Task`·`TeamMember`·`Status`·`Priority` 타입 및 `STATUSES`/`PRIORITIES` 룩업 배열(레이블·Tailwind 색상) 단일 진실 공급원
- `src/lib/store.ts` — localStorage CRUD. `loadTasks()`는 첫 방문 시 샘플 데이터 시드
- `src/app/page.tsx` — `tasks`·`members`·필터·다이얼로그 상태 전부 소유, 모든 변경이 여기서 일어남
- `src/components/KanbanBoard.tsx` — `STATUSES` 배열 순서로 열 렌더링, 상태 없음
- `src/components/TaskDialog.tsx` — 생성/수정 모달, `page.tsx`가 열고 닫음

**shadcn/ui 주의:** 스타일 프리셋 `base-nova`(`@base-ui/react` 기반). **`asChild` prop 없음** — `render` prop 또는 일반 래퍼 사용. Tailwind v4 사용 중이므로 `tailwind.config.ts` 없음. 테마 토큰은 `src/app/globals.css`의 `@theme` 블록에 있음.

## 기술 스택과 아키텍처

**목표 스택:** Next.js(Front + API Routes) on Vercel → Supabase(Postgres + Auth), 로그인 시에만 Google OAuth 경유. 상세는 `docs/architecture.md` 참조.

**DB 규칙 (단일 테이블 `tasks`):**
- 컬럼 5개만: `id`·`title`·`assignee_id`·`created_by`·`status`·`created_at`
- `title` 최대 200자 (check constraint)
- `status`는 `'todo'` | `'done'` 두 값만 (check constraint) — ENUM·인덱스·트리거·RLS 금지
- 상세는 `docs/db.md` 참조

**API 규칙:**
- base path `/api`, 버전 prefix 없음
- 인증 불필요 엔드포인트는 `GET /api/auth/callback` 단 하나
- `DELETE /api/tasks/[id]`는 `created_by` 본인만 허용
- 상세는 `docs/api.md` 참조

**MVP 범위 제한:**
- 기능 요건 F-01~F-05 5개만 — 댓글·알림·권한 관리·첨부파일은 v2
- `dangerouslySetInnerHTML` 사용 금지 (XSS 요건 NF-S2)
- 상세는 `docs/requirements.md` 참조

## 도메인 용어

| 용어 | 정의 |
|------|------|
| 일감 | 팀이 처리해야 할 작업 단위. DB의 `tasks` 테이블 한 행. |
| 담당자 | 일감을 맡은 팀원. `assignee_id`(미배정 허용). |
| 상태 | 일감 진행 단계. UI: 할 일·진행 중·검토 중·완료. DB: `'todo'`\|`'done'`. |
| 우선순위 | 낮음·보통·높음·긴급 4단계. 카드 왼쪽 컬러 바로 표시. |
| 생성자 | 일감을 만든 사용자. `created_by` (NOT NULL, 삭제 권한 기준). |

## Docs 맵

| 파일 | 내용 |
|------|------|
| `docs/personas.md` | 페르소나 3인 + MVP 기능 5개 도출 근거 |
| `docs/user-stories.md` | 이개발(주니어 개발자) 하루 시나리오 |
| `docs/requirements.md` | F-01~F-05 기능 요건 + 비기능 수치 |
| `docs/architecture.md` | 목표 아키텍처 ASCII 다이어그램 |
| `docs/db.md` | `tasks` 테이블 DDL |
| `docs/api.md` | API 엔드포인트 7개 표 |
