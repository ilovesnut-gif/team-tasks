'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import type { Comment } from '@/types'

interface Props {
  taskId: string
  currentUserId: string
}

export default function CommentThread({ taskId, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/tasks/${taskId}/comments`)
    if (res.ok) setComments(await res.json())
  }, [taskId])

  useEffect(() => { load() }, [load])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: body.trim() }),
    })
    setBody('')
    setSubmitting(false)
    load()
  }

  async function handleDelete(commentId: string) {
    await fetch(`/api/tasks/${taskId}/comments/${commentId}`, { method: 'DELETE' })
    load()
  }

  async function handleEditSave(commentId: string) {
    if (!editBody.trim()) return
    await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: editBody.trim() }),
    })
    setEditingId(null)
    load()
  }

  function startEdit(comment: Comment) {
    setEditingId(comment.id)
    setEditBody(comment.body)
  }

  return (
    <div className="space-y-4">
      <Separator />
      <h3 className="text-sm font-semibold">
        댓글{comments.length > 0 ? ` (${comments.length})` : ''}
      </h3>

      <div className="space-y-2">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">아직 댓글이 없습니다.</p>
        )}
        {comments.map(c => (
          <div key={c.id}>
            {editingId === c.id ? (
              <div className="space-y-2 rounded-lg border p-3">
                <Textarea
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  rows={2}
                  maxLength={1000}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEditSave(c.id)} disabled={!editBody.trim()}>저장</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>취소</Button>
                </div>
              </div>
            ) : (
              <div className="group rounded-lg bg-muted/50 px-3 py-2 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleString('ko-KR', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  {c.created_by === currentUserId && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => startEdit(c)}
                      >
                        수정
                      </button>
                      <button
                        className="text-xs text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(c.id)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{c.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="댓글을 입력하세요 (최대 1000자)"
          rows={2}
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={1000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{body.length}/1000</span>
          <Button type="submit" size="sm" disabled={!body.trim() || submitting}>
            {submitting ? '등록 중…' : '댓글 등록'}
          </Button>
        </div>
      </form>
    </div>
  )
}
