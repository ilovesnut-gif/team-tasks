type TaskBody = { title: unknown; assignee_id?: unknown; status?: unknown }

export function buildTaskRecord(body: TaskBody, user: { id: string }) {
  return {
    title: body.title as string,
    assignee_id: (body.assignee_id as string | null | undefined) ?? user.id,
    status: (body.status as string | undefined) ?? 'todo',
    created_by: user.id,
  }
}
