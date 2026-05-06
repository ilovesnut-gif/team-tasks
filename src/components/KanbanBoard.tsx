'use client'

import { Task, TeamMember, STATUSES, Status } from '@/types'
import TaskCard from './TaskCard'
import { Button } from '@/components/ui/button'

interface Props {
  tasks: Task[]
  members: TeamMember[]
  onAddTask: (status: Status) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onStatusChange: (id: string, direction: 'forward' | 'back') => void
}

const STATUS_COLORS: Record<Status, string> = {
  'todo': 'border-t-slate-300',
  'in-progress': 'border-t-blue-400',
  'review': 'border-t-violet-400',
  'done': 'border-t-emerald-400',
}

const STATUS_COUNT_COLORS: Record<Status, string> = {
  'todo': 'bg-slate-100 text-slate-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'review': 'bg-violet-100 text-violet-700',
  'done': 'bg-emerald-100 text-emerald-700',
}

export default function KanbanBoard({ tasks, members, onAddTask, onEditTask, onDeleteTask, onStatusChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STATUSES.map(({ value: status, label }) => {
        const columnTasks = tasks.filter(t => t.status === status)
        return (
          <div
            key={status}
            className={`flex flex-col rounded-xl border-t-4 bg-card shadow-sm ${STATUS_COLORS[status]}`}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COUNT_COLORS[status]}`}>
                  {columnTasks.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onAddTask(status)}
                title="새 일감"
              >
                +
              </Button>
            </div>

            <div className="flex flex-col gap-2 px-3 pb-3 min-h-[120px]">
              {columnTasks.length === 0 && (
                <div
                  className="flex-1 flex items-center justify-center rounded-lg border-2 border-dashed border-muted py-8 cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => onAddTask(status)}
                >
                  <span className="text-xs text-muted-foreground">+ 일감 추가</span>
                </div>
              )}
              {columnTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  members={members}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
