# API 엔드포인트 — team-tasks

Base path: `/api`

| METHOD | PATH | 설명 | 인증 |
|--------|------|------|------|
| GET | /api/auth/me | 현재 로그인 사용자 반환 | 필요 |
| POST | /api/auth/signout | 세션 종료 후 쿠키 삭제 | 필요 |
| GET | /api/auth/callback | Google OAuth 콜백 처리 및 세션 발급 | 불필요 |
| GET | /api/tasks | 전체 일감 목록 반환 | 필요 |
| POST | /api/tasks | 새 일감 생성 (created_by = 현재 사용자) | 필요 |
| PATCH | /api/tasks/[id] | 일감 제목·상태·담당자 수정 | 필요 |
| DELETE | /api/tasks/[id] | 일감 삭제 (created_by 본인만) | 필요 |
