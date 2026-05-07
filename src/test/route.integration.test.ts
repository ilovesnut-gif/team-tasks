// @vitest-environment node
// 주의: middleware.ts 추가 시 미인증 요청이 401 → 307 로 바뀔 수 있음.
//       그 경우 401 단언을 fetch({ redirect:'manual' }) + 307 단언으로 교체할 것.
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { waitForDevServer, signInTestUser, getAdminSupabase } from './integration-helpers'

const TASKS_URL = 'http://localhost:3000/api/tasks'

describe('POST /api/tasks', () => {
  let cookieHeader: string
  let userId: string
  let createdId: string | null = null

  const admin = getAdminSupabase()

  beforeAll(async () => {
    await waitForDevServer()
    ;({ cookieHeader, userId } = await signInTestUser())
  })

  afterEach(async () => {
    if (createdId) {
      await admin.from('tasks').delete().eq('id', createdId)
      createdId = null
    }
  })

  afterAll(async () => {
    if (userId) {
      await admin.from('tasks').delete().ilike('title', 'integration-%').eq('created_by', userId)
    }
  })

  it('Cookie 없이 POST → 401', async () => {
    const res = await fetch(TASKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `integration-unauth-${Date.now()}` }),
    })
    expect(res.status).toBe(401)
  })

  it('title 200자 초과 → 500 (DB check constraint)', async () => {
    const res = await fetch(TASKS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
      body: JSON.stringify({ title: 'x'.repeat(201) }),
    })
    expect(res.status).toBe(500)
  })

  it('Cookie 포함 POST { title } → 201, created_by·title 일치', async () => {
    const title = `integration-${Date.now()}`
    const res = await fetch(TASKS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ title }),
    })
    expect(res.status).toBe(201)

    const task = await res.json()
    expect(task.title).toBe(title)
    expect(task.created_by).toBe(userId)
    createdId = task.id
  })
})
