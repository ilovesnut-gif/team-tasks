import { describe, it, expect } from 'vitest'
import { buildTaskRecord } from './buildTaskRecord'

const USER = { id: 'user-1' }

describe('buildTaskRecord', () => {
  it('모든 필드가 있으면 그대로 반환', () => {
    const result = buildTaskRecord(
      { title: '테스트', assignee_id: 'user-2', status: 'done' },
      USER,
    )
    expect(result).toEqual({
      title: '테스트',
      assignee_id: 'user-2',
      status: 'done',
      created_by: 'user-1',
    })
  })

  it('assignee_id 가 undefined 이면 user.id 로 대체', () => {
    const result = buildTaskRecord({ title: '테스트' }, USER)
    expect(result.assignee_id).toBe('user-1')
  })

  it('assignee_id 가 null 이면 user.id 로 대체', () => {
    const result = buildTaskRecord({ title: '테스트', assignee_id: null }, USER)
    expect(result.assignee_id).toBe('user-1')
  })

  it('assignee_id 가 빈 문자열이면 그대로 유지 (null 과 다름)', () => {
    const result = buildTaskRecord({ title: '테스트', assignee_id: '' }, USER)
    expect(result.assignee_id).toBe('')
  })

  it('status 가 undefined 이면 "todo" 로 대체', () => {
    const result = buildTaskRecord({ title: '테스트' }, USER)
    expect(result.status).toBe('todo')
  })

  it('assignee_id, status 둘 다 없으면 각각 user.id, "todo"', () => {
    const result = buildTaskRecord({ title: '테스트' }, USER)
    expect(result).toEqual({
      title: '테스트',
      assignee_id: 'user-1',
      status: 'todo',
      created_by: 'user-1',
    })
  })

  it('created_by 는 항상 user.id', () => {
    const result = buildTaskRecord(
      { title: '테스트', assignee_id: 'other', status: 'todo' },
      USER,
    )
    expect(result.created_by).toBe('user-1')
  })
})
