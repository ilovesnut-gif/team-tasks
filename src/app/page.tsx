'use client'

import { useState, useEffect, useMemo } from 'react'
import { Task, TeamMember, Status, STATUSES } from '@/types'
import { loadTasks, saveTasks, loadMembers, saveMembers } from '@/lib/store'
import KanbanBoard from '@/components/KanbanBoard'
import TaskDialog from '@/components/TaskDialog'
import FilterBar, { Filters } from '@/components/FilterBar'
import MembersPanel from '@/components/MembersPanel'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<TeamMember[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo')
  const [filters, setFilters] = useState<Filters>({ search: '', assigneeId: null, priority: null })
  const [showMembers, setShowMembers] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTasks(loadTasks())
    setMembers(loadMembers())
    setMounted(true)
  }, [])

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false
      }
      if (filters.assigneeId && t.assigneeId !== filters.assigneeId) return false
      if (filters.priority && t.priority !== filters.priority) return false
      return true
    })
  }, [tasks, filters])

  const stats = useMemo(() => {
    return STATUSES.map(s => ({
      ...s,
      count: tasks.filter(t => t.status === s.value).length,
    }))
  }, [tasks])

  function updateTasks(next: Task[]) {
    setTasks(next)
    saveTasks(next)
  }

  function updateMembers(next: TeamMember[]) {
    setMembers(next)
    saveMembers(next)
  }

  function handleSave(task: Task) {
    const exists = tasks.find(t => t.id === task.id)
    updateTasks(exists ? tasks.map(t => t.id === task.id ? task : t) : [task, ...tasks])
  }

  function handleDelete(id: string) {
    updateTasks(tasks.filter(t => t.id !== id))
  }

  function handleStatusChange(id: string, direction: 'forward' | 'back') {
    const statusValues = STATUSES.map(s => s.value)
    setTasks(prev => {
      const next = prev.map(t => {
        if (t.id !== id) return t
        const idx = statusValues.indexOf(t.status)
        const newIdx = direction === 'forward' ? Math.min(idx + 1, statusValues.length - 1) : Math.max(idx - 1, 0)
        return { ...t, status: statusValues[newIdx] }
      })
      saveTasks(next)
      return next
    })
  }

  function openNewTask(status: Status) {
    setEditingTask(null)
    setDefaultStatus(status)
    setDialogOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setDialogOpen(true)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">T</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">팀 일감</h1>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex gap-3 text-sm text-muted-foreground">
              {stats.map(s => (
                <span key={s.value}>
                  <span className="font-medium text-foreground">{s.count}</span> {s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMembers(v => !v)}
              className={showMembers ? 'bg-accent' : ''}
            >
              팀원
            </Button>
            <Button size="sm" onClick={() => openNewTask('todo')}>
              + 새 일감
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-6 space-y-6">
        {showMembers && (
          <div className="rounded-xl border bg-card p-4">
            <MembersPanel members={members} onUpdate={updateMembers} />
          </div>
        )}

        <FilterBar filters={filters} members={members} onChange={setFilters} />

        <KanbanBoard
          tasks={filteredTasks}
          members={members}
          onAddTask={openNewTask}
          onEditTask={openEdit}
          onDeleteTask={handleDelete}
          onStatusChange={handleStatusChange}
        />
      </main>

      <TaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        task={editingTask}
        members={members}
        defaultStatus={defaultStatus}
      />
    </div>
  )
}
