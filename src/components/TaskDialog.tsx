'use client'

import { useState, useEffect } from 'react'
import { Task, TeamMember, STATUSES, PRIORITIES, Status, Priority } from '@/types'
import { createTask } from '@/lib/store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (task: Task) => void
  task?: Task | null
  members: TeamMember[]
  defaultStatus?: Status
}

const EMPTY: Omit<Task, 'id' | 'createdAt'> = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assigneeId: null,
  dueDate: null,
  tags: [],
}

export default function TaskDialog({ open, onClose, onSave, task, members, defaultStatus }: Props) {
  const [form, setForm] = useState<Omit<Task, 'id' | 'createdAt'>>(EMPTY)
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      if (task) {
        const { id: _id, createdAt: _c, ...rest } = task
        setForm(rest)
      } else {
        setForm({ ...EMPTY, status: defaultStatus ?? 'todo' })
      }
      setTagInput('')
      setError('')
    }
  }, [open, task, defaultStatus])

  function handleSave() {
    if (!form.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    const saved: Task = task
      ? { ...task, ...form }
      : createTask(form)
    onSave(saved)
    onClose()
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }))
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? '일감 수정' : '새 일감 만들기'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">제목 *</label>
            <Input
              placeholder="무엇을 해야 하나요?"
              value={form.title}
              onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError('') }}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">설명</label>
            <Textarea
              placeholder="상세 내용을 입력하세요"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">상태</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Status }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">우선순위</label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">담당자</label>
              <Select
                value={form.assigneeId ?? 'unassigned'}
                onValueChange={v => setForm(f => ({ ...f, assigneeId: v === 'unassigned' ? null : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="미배정" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">미배정</SelectItem>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className={`${m.color} text-white text-xs`}>
                            {m.initials}
                          </AvatarFallback>
                        </Avatar>
                        {m.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">마감일</label>
              <Input
                type="date"
                value={form.dueDate ?? ''}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value || null }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">태그</label>
            <div className="flex gap-2">
              <Input
                placeholder="태그 입력 후 Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>추가</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {form.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>{task ? '저장' : '만들기'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
